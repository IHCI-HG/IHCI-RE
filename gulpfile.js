const gulp = require('gulp');
const babel = require('gulp-babel');

gulp.task('cpfile', () => {
    return gulp.src('./{site/**,server/**,./.babelrc,./package.json}')
        .pipe(gulp.dest('./dest/'));
});

gulp.task('js_server_build', ['cpfile'], () => {
    return gulp.src('./dest/server/**/*.js')
        .pipe(babel({
            presets: ["es2015", "react", "stage-0"],
            plugins: ["transform-object-rest-spread","transform-decorators-legacy", "transform-remove-strict-mode"],
            ignore: [".css", ".png"]
        }))
        .pipe(gulp.dest('./dest/server/'));
});

gulp.task('default', ['js_server_build']);
