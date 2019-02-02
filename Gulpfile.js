const gulp           = require('gulp'),
      browsersync    = require('browser-sync').create(),
      sass           = require('gulp-sass'),
      rename         = require("gulp-rename"),
      uglify         = require('gulp-uglify'),
      fs             = require('fs'),
      dir            = {src: 'ui-generator/', dest: 'www/'};

// Settings for live reload
let browserSync = cb => {
    browsersync.init({
        server: {
            baseDir: "./www/"
        },
        port: 3001
    });
    cb();
};

// Task for sass prepossessing
let css = () => {
    return gulp
        .src(dir.src + 'sass/importer.scss')
        .pipe(sass({ outputStyle: "expanded" }))
        .pipe(rename('main.css'))
        .pipe(gulp.dest(dir.dest + "css"))
        .pipe(browsersync.stream());
};

// Task for javascript minification
let js = () => {
    return gulp
        .src(dir.src + 'js/*.js')
        .pipe(uglify())
        .pipe(gulp.dest(dir.dest + "js"))
        .pipe(browsersync.stream());
};

// Copy file to destination folder
let copyFile = pathSrc => {
    fs.copyFile(pathSrc, dir.dest + pathSrc.substring(pathSrc.indexOf("/") + 1), err => {
        if (err) throw err;
        browsersync.reload();
    })
};

// Remove deleted file from destination folder
let unlinkFile = pathSrc => {
    fs.unlink(dir.dest + pathSrc.substring(pathSrc.indexOf("/") + 1), (err) => {
        if (err) throw err;
        browsersync.reload();
    });
};

// Method dispatch mapping
let dispatch = {
    scss: gulp.parallel(css),
    js: gulp.parallel(js)
};

// Watch task
let watch = cb => {
    gulp.watch(dir.src + '**/*.*').on('change', path => {
        let fileExt = /(?:\.([^.]+))?$/.exec(path);
        dispatch.hasOwnProperty(fileExt[1]) ? dispatch[fileExt[1]]() : copyFile(path);
    });

    gulp.watch(dir.src + 'img/*.*').on('add', path => copyFile(path));
    gulp.watch(dir.src + 'img/*.*').on('unlink', path => unlinkFile(path));

    cb();
};


exports.default = gulp.series(browserSync, watch);