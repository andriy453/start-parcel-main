// Receive name of project Folder
import * as nodePath from "path";

// path to root Folder
const rootFolder = nodePath.basename(nodePath.resolve());

// path to output Folder
const buildFolder = `./src/styles/.output`;

// path to source Folder
const srcFolder = `./src`;

// Paths to source and output files
export const path = {
	build: {
		styles: {
			source: `${buildFolder}/styles/`,
			main: `${buildFolder}/css/`,
		},
	},
	src: {
		styles: {
			all: `${srcFolder}/styles/**/*.*`,
			main: `${srcFolder}/styles/style.pcss`,
		},
	},

	buildFolder: buildFolder,
	rootFolder: rootFolder,
	srcFolder: srcFolder,
};

export const reportFormatter = ({ messages, source }) =>
	messages
		.map(
			(message) =>
				message?.plugin &&
				message?.plugin !== "postcss-svgo" &&
				`${"".padEnd(10)}⚠️  \x1b[43m[${message?.plugin}]\x1b[49m: ${source}:${
					message?.line || ""
				}:${message?.column || ""} \x1b[33m${message?.text}\x1b[39m \n`
		)
		.join("");
