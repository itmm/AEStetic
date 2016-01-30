var gulp = require('gulp'), inline = require('gulp-inline')
    , rename = require('gulp-rename')
    , html = require('gulp-htmlmin');
var replace = require('gulp-replace');
var shell = require('shelljs');
var resources = require('gulp-resources');
var concat = require('gulp-concat');
var gif = require('gulp-if');
var filelog = require('gulp-filelog');
var now = new Date().toISOString();
var formattedDate = now.substring(0, 10) + ' ' + now.substring(11, 19);
var commit = shell.exec('git rev-parse --short HEAD', {silent: true}).output;

gulp.task('default', function() {
gulp.src('main.html')
    .pipe(replace(/\[DATE\]/g, formattedDate))
    .pipe(replace(/\[LAST-COMMIT\]/g, commit))
    .pipe(resources())
    .pipe(gif('**/*.js', concat('tmp/all.js')))
    .pipe(gif('**/*.css', concat('tmp/all.css')))
    .pipe(gif('**/*.html', replace(/<!--startjs-->[^]+<!--endjs-->/, '<script src="tmp/all.js"></script>')))
    .pipe(gif('**/*.html', replace(/<!--startcss-->[^]+<!--endcss-->/, '<link href="tmp/all.css" rel="stylesheet">')))
    .pipe(gif('**/*.html', inline({})))
    .pipe(gif('**/*.html', rename('index.html')))
    .pipe(gif('**/*.html', html({
        removeComments: true,
            removeWhitespace: true,
            minifyJS: true,
            minifyCSS: true
    })))
    .pipe(gif('**/*.html', gulp.dest('./')));
    //.pipe(html({
    //    removeComments: true,
    //    removeWhitespace: true,
    //    minifyJS: true,
    //    minifyCSS: true
    //}))

});
