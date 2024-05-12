import gulp from 'gulp';
import { plugins } from './config/gulp-plugins.js';
import { path } from './config/gulp-settings.js';

import { styles } from './config/gulp-tasks/styles.js';
import { serve } from './config/gulp-tasks/_serve.js';

global.app = {
  gulp: gulp,
  path: path,
  plugins: plugins,
};

const devTasks = gulp.series(styles, serve);

const buildTasks = gulp.series(styles);

const dev = gulp.series(devTasks);

let build = gulp.series(buildTasks);

export { dev };
export { build };
