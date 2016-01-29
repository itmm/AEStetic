var gulp = require('gulp'), inline = require('gulp-inline')
    , rename = require('gulp-rename')
    , html = require('gulp-htmlmin');
var replace = require('gulp-replace');
var shell = require('shelljs');

var now = new Date().toISOString();
var formattedDate = now.substring(0, 10) + ' ' + now.substring(11, 19);
var commit = shell.exec('git rev-parse --short HEAD', {silent: true}).output;

gulp.task('default', function() {
gulp.src('main.html')
    .pipe(replace(/\[DATE\]/g, formattedDate))
    .pipe(replace(/\[LAST-COMMIT\]/g, commit))
    .pipe(inline({}))
    .pipe(rename('index.html'))
    .pipe(html({
        removeComments: true,
        removeWhitespace: true,
        minifyJS: true,
        minifyCSS: true
    }))
    .pipe(replace(/\[\]/g, '' ))
    .pipe(gulp.dest('./'));

});
