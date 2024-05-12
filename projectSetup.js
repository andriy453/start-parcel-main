// "setup": "pnpm i && pnpm run build && node projectSetup.js && pnpm i && pnpm run build && prettier ./html/ --write && node -e \"console.log('SD setup done!')\""
// pnpm add child_process unzipper del ora posthtml dotenv -D

import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import util from 'util';
import fs from 'fs';
import child_process from 'child_process';
import unzipper from 'unzipper';
import { deleteAsync } from 'del';
import ora from 'ora';
import posthtml from 'posthtml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const exec = util.promisify(child_process.exec);
const fsPromises = fs.promises;

const REPO_ID = process.env.REPO_ID;
const BRANCH = process.env.REPO_BRANCH;
const GITLAB_ACCESS_TOKEN = process.env.GITLAB_ACCESS_TOKEN;

const getLastCommitSha = async () => {
  const curlCommand = `curl --header "PRIVATE-TOKEN: ${GITLAB_ACCESS_TOKEN}" "https://gitlab.com/api/v4/projects/${REPO_ID}/repository/commits/${BRANCH}"`;

  const { stdout } = await exec(curlCommand);
  const lastCommit = JSON.parse(stdout);

  return lastCommit.id;
};

const LAST_COMMIT_SHA = await getLastCommitSha();
const ZIP_DIR_NAME = `cms-admin-${BRANCH}-${LAST_COMMIT_SHA}`;

console.log({
  LAST_COMMIT_SHA,
  ZIP_DIR_NAME,
});

async function downloadFileFromGitlab(fileName) {
  const curlCommand = `curl --header "PRIVATE-TOKEN: ${GITLAB_ACCESS_TOKEN}" "https://gitlab.com/api/v4/projects/${REPO_ID}/repository/archive.zip?sha=${BRANCH}" --output "${fileName}.zip"`;

  await exec(curlCommand);

  return `./${fileName}.zip`;
}

async function copyRecursive(source, target, filter = null) {
  try {
    await fsPromises.mkdir(target, { recursive: true });

    const entries = await fsPromises.readdir(source);

    for (const entry of entries) {
      const sourcePath = path.join(source, entry);
      const targetPath = path.join(target, entry);

      const stats = await fsPromises.stat(sourcePath);

      if (filter && !filter(entry)) {
        continue;
      }

      if (stats.isDirectory()) {
        await copyRecursive(sourcePath, targetPath);
      } else {
        await fsPromises.copyFile(sourcePath, targetPath);
      }
    }
  } catch (error) {
    throw new Error(error);
  }
}

async function extractFolderFromZip(zipPath, sourceFolder) {
  try {
    const readStream = fs.createReadStream(zipPath);

    const extractedStream = readStream.pipe(unzipper.Parse());

    extractedStream.on('entry', async (entry) => {
      const entryPath = entry.path;

      if (entry.type === 'File' && entryPath.startsWith(sourceFolder)) {
        entry.path = entryPath.substring(sourceFolder.length);

        const outputPath = path.join(__dirname, entry.path);

        const fileExists = await fsPromises
          .access(outputPath)
          .then(() => true)
          .catch(() => false);

        if (!fileExists) {
          await fsPromises.mkdir(path.dirname(outputPath), {
            recursive: true,
          });
          await fsPromises.writeFile(outputPath, '');
        }

        entry.pipe(fs.createWriteStream(outputPath));
      } else {
        entry.autodrain();
      }
    });

    await new Promise((resolve) => extractedStream.on('end', resolve));
  } catch (error) {
    throw new Error(error);
  }
}

const replaceFilesPath = (html) => {
  return posthtml()
    .use((tree) => {
      tree.match({ tag: 'script' }, (node) => {
        if (node?.attrs?.src?.startsWith('./')) {
          node.attrs.src = node.attrs.src.replace(/^\.\//, '../');
        }
        return node;
      });

      tree.match({ tag: 'link' }, (node) => {
        if (node?.attrs?.href?.startsWith('./')) {
          node.attrs.href = node.attrs.href.replace(/^\.\//, '../');
        }
        return node;
      });

      tree.match({ attrs: { "data-remove-for-sd": 'true' } }, () => false);
    })
    .process(html);
};

const spiner = ora('SD base project downloading...').start();
const startProjectZip = await downloadFileFromGitlab('start_repo');
spiner.succeed('SD base project downloaded!');

const REMOVE_FILES = [
  '.htmlnanorc',
  '.posthtmlrc',
  'jsconfig.json',
  'scan.php',
  'dist',
  'node_modules',
  'src/assets',
  'src/html',
  'src/layout',
  'src/*.html',
  'package-tmp.json',
  startProjectZip,
];

const MOVE_FILES = [
  {
    from: 'dist/assets/fonts/',
    to: 'app/assets/fonts/',
  },
  {
    from: 'dist/assets/lottie/',
    to: 'app/assets/lottie/',
  },
  {
    from: 'dist/assets/static/',
    to: 'app/assets/static/',
  },
  {
    from: 'dist/img/',
    to: 'app/public/images/',
  },
  {
    from: 'src/layout/links/',
    to: 'src/links/',
  },
  {
    from: 'dist/',
    to: 'html/',
    filter: (filename) => filename.endsWith('.html'),
  },
];

const setupProject = async () => {
  try {
    const packageJson = await fsPromises.readFile(
      __dirname + '/package.json',
      'utf8'
    );
    await fsPromises.writeFile(__dirname + '/package-tmp.json', packageJson);

    spiner.start('SD base project extracting...');
    await extractFolderFromZip(startProjectZip, ZIP_DIR_NAME);
    spiner.succeed('SD base project extracted!');

    spiner.start('Files moving...');
    await Promise.all(
      MOVE_FILES.map(({ from, to, filter }) => {
        return copyRecursive(from, to, filter);
      })
    );

    const localPackageJSON = JSON.parse(
      fs.readFileSync(__dirname + '/package-tmp.json', 'utf8')
    );
    const remotePackageJSON = JSON.parse(
      fs.readFileSync(__dirname + '/package.json', 'utf8')
    );

    const mergedPackageJSON = JSON.stringify(
      {
        ...remotePackageJSON,
        dependencies: localPackageJSON.dependencies,
      },
      null,
      2
    );

    fs.writeFileSync(__dirname + '/package.json', mergedPackageJSON);
    spiner.succeed('Files moved!');

    spiner.start('Scripts and styles import path changing...');
    const scriptsHtml = fs.readFileSync('src/links/scripts.html', 'utf8');
    const stylesHtml = fs.readFileSync('src/links/styles.html', 'utf8');

    const scriptsHtmlTree = await replaceFilesPath(scriptsHtml);
    const stylesHtmlTree = await replaceFilesPath(stylesHtml);

    fs.writeFileSync('src/links/scripts.html', scriptsHtmlTree.html);
    fs.writeFileSync('src/links/styles.html', stylesHtmlTree.html);
    spiner.succeed('Scripts and styles import path changed!');

    spiner.start('Temporary files removing...');
    await Promise.all(REMOVE_FILES.map((item) => deleteAsync(item)));
    spiner.succeed('Temporary files removed!');
  } catch (error) {
    spiner.fail('Error:', error?.message ? error.message : error);
  }
};

await setupProject();
