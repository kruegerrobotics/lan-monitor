
const gulp           = require('gulp'),
      browserSync    = require('browser-sync').create(),
      sass           = require('gulp-sass'),
      rename         = require("gulp-rename"),
      uglify         = require('gulp-uglify'),
      fs             = require('fs');

sass.compiler = require('node-sass');