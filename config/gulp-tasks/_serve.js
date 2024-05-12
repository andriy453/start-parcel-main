import { styles, stylesMove } from "./styles.js";

export function serve() {
  // PostCSS Watcher
  app.gulp
    .watch(
      [`${app.path.src.styles.all}`],
      app.gulp.series(styles)
    )
}
