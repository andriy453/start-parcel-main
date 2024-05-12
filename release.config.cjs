require('dotenv').config();
const slackifyMarkdown = require('slackify-markdown')
const truncate = require('semantic-release-slack-bot/lib/truncate')
const getRepoInfo = require('semantic-release-slack-bot/lib/getRepoInfo')
const getConfigToUse = require('semantic-release-slack-bot/lib/getConfigToUse')
// const getSlackVars = require('semantic-release-slack-bot/lib/getSlackVars')

// 2900 is the limit for a message block of type 'section'.
const MAX_LENGTH = 2900;

const generateMergedReleaseNotes = (pluginConfig, context, nextRelease) => {
  let mergedReleaseNotes = nextRelease.notes;

  context.commits.forEach(commit => {
    const refMatch = commit.message.match(/Refs: bold:(\w+):(\d+)/);
    if (refMatch) {
      const [, projectId, taskNumber] = refMatch;
      const onidoneLink = `https://onidone.com/l/${projectId}/highlight-${taskNumber}`;
      const commitRegex = new RegExp(`\\[${commit.hash.substring(0, 7)}\\]\\((.*?)\\)`, 'g');
      mergedReleaseNotes = mergedReleaseNotes.replace(commitRegex, (match, url) => `[[task link](${onidoneLink})] [${commit.hash.substring(0, 7)}](${url})`);
    }
  });

  return mergedReleaseNotes;
};


module.exports = {
  branches: ['main', {name: 'dev', prerelease: true}],
  repositoryUrl: `git+https://gitlab.com/${process.env.NAMESPACE}/${process.env.DIRECTORY}.git`,

  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'angular',
        releaseRules: [
          { breaking: true, release: 'major' },
          { revert: true, release: 'patch' },
          { type: 'feat', release: 'minor' },
          { type: 'fix', release: 'patch' },
          { type: 'hotfix', release: 'patch' },
          { type: 'add', release: 'patch' },
          { type: 'perf', release: 'patch' },
          { type: 'revert', release: 'patch' },
          { type: 'docs', release: 'patch' },
          { type: 'style', release: 'patch' },
          { type: 'refactor', release: 'patch' },
          { type: 'test', release: 'patch' },
          { type: 'build', release: 'patch' },
          { type: 'ci', release: 'patch' },
        ],
      },
    ],
    [
      '@semantic-release/release-notes-generator',
      {
        preset: 'conventionalcommits',
        parserOpts: {
          noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES', 'BREAKING'],
        },
        writerOpts: {
          commitsSort: ['subject', 'scope'],
        },
        presetConfig: {
          types: [
            { type: 'feat', section: '🚀 Features' },
            { type: 'hotfix', section: '🔥 Hot Fixes' },
            { type: 'fix', section: '🐞 Bug Fixes' },
            { type: 'add', section: '🛫 Add' },
            { type: 'perf', section: '🏎️ Performance Improvements' },
            { type: 'revert', section: '🔄 Reverts' },
            { type: 'docs', section: '🗂️ Documentation' },
            { type: 'style', section: '💅 Styles' },
            { type: 'chore', section: '🏡 Miscellaneous Chores', hidden: true },
            { type: 'refactor', section: '🔧 Code Refactoring' },
            { type: 'test', section: '🧪 Tests' },
            { type: 'build', section: '👷 Build System' },
            { type: 'ci', section: '🤖 Continuous Integration' },
          ],
        },
      },
    ],
    '@semantic-release/changelog',
    [
      '@semantic-release/npm',
      {
        npmPublish: false,
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: ['package.json', 'CHANGELOG.md'],
        message:
          'chore(release): ${nextRelease.version} \n\n${nextRelease.notes}',
      },
    ],
    '@semantic-release/gitlab',
    [
      'semantic-release-slack-bot',
      {
        notifyOnSuccess: false,
        notifyOnFail: false,
        slackWebhook: process.env.SLACK_WEBHOOK,
        packageName: process.env.DIRECTORY,
        markdownReleaseNotes: true,
        branchesConfig: [
          {
            pattern: 'main',
            notifyOnSuccess: true,
            onSuccessFunction: (pluginConfig, context) => {
              const {
                logger,
                nextRelease,
                options,
                env: { SEMANTIC_RELEASE_PACKAGE, npm_package_name }
              } = context;

              logger.log('nextRelease', nextRelease);

              const configToUse = getConfigToUse(pluginConfig, context)
              const { unsafeMaxLength = MAX_LENGTH, packageName } = configToUse
              // const {
              //   slackWebhook,
              //   slackToken,
              //   slackChannel,
              //   slackIcon,
              //   slackName
              // } = getSlackVars(configToUse)

              const package_name =
                SEMANTIC_RELEASE_PACKAGE || packageName || npm_package_name;

              const repo = getRepoInfo(options.repositoryUrl);

              logger.log(generateMergedReleaseNotes(pluginConfig, context, nextRelease));

              let releaseNotes = generateMergedReleaseNotes(pluginConfig, context, nextRelease);

              if (configToUse.markdownReleaseNotes) {
                // Creating slack format from the markdown notes.
                releaseNotes = slackifyMarkdown(releaseNotes);
              }

              // truncate long messages
              if (unsafeMaxLength > 0) {
                releaseNotes = truncate(releaseNotes, unsafeMaxLength);
              }

              let messageBlocks = [
                {
                  type: 'section',
                  text: {
                    type: 'mrkdwn',
                    text: `${process.env.SLACK_TAG} :tada: :beers: Нова версія \`${package_name}\` випущена! :rocket:\nПоточна версія: *${nextRelease.version}*`
                  }
                }
              ];

              if (releaseNotes !== '') {
                messageBlocks.push({
                  type: 'section',
                  text: {
                    type: 'mrkdwn',
                    text: `${releaseNotes}`
                  }
                })
              }

              let slackMessage = {
                blocks: messageBlocks,
                text: `Нова версія ${package_name} (${nextRelease.version}) уже в лайві! :rocket:`
              }

              if (repo.path) {
                const gitTag = nextRelease.gitTag
                const gitTagPrefix = repo.hostname.startsWith('gitlab')
                  ? '/-/releases/'
                  : '/releases/tag/'
                const gitTagUrl = repo.URL + gitTagPrefix + gitTag

                slackMessage.attachments = [
                  {
                    color: '#13c330',
                    blocks: [
                      {
                        type: 'context',
                        elements: [
                          {
                            type: 'mrkdwn',
                            text: `:package: *<${repo.URL}|${repo.path}>:* :rocket:   <${gitTagUrl}|${gitTag}>`
                          }
                        ]
                      }
                    ]
                  }
                ]
              }

              return slackMessage;
            },
          },
        ],
      },
    ],
  ],
};
