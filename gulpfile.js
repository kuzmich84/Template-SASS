'use strict';

const gulp = require('gulp');
const plumber = require('gulp-plumber');
const sourcemap = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const server = require('browser-sync').create();
const csso = require('gulp-csso');
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
const rename = require('gulp-rename');
const svgstore = require('gulp-svgstore');
const posthtml = require('gulp-posthtml');
const include = require('posthtml-include');
const del = require('del');

gulp.task('css', () => {
  return gulp.src('src/sass/style.sass')
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest('build/css'))
    .pipe(csso())
    .pipe(rename('style.min.css'))
    .pipe(sourcemap.write('.'))
    .pipe(gulp.dest('build/css'));
});

gulp.task('html', () => {
  return gulp.src('src/*.html')
  .pipe(posthtml([
    include()
  ]))
  .pipe(gulp.dest('build'));
});

gulp.task('image', () =>
  gulp.src('src/img/**/*.{png,jpg,svg}')
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 2})
    ]))
    .pipe(gulp.dest('build/img'))
);

gulp.task('webp', () =>
    gulp.src('src/img/**/*.webp')
      .pipe(webp({quality: 90}))
      .pipe(gulp.dest('build/img'))
);

gulp.task('sprite', () => {
  return gulp.src('src/img/icon-*.svg')
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img'));
});

gulp.task('copy', () => {
  return gulp.src([
    'src/fonts/**/*.{woff,woff2}',
    'src/img/**',
    'src/js/**',
    'src/*.ico'
  ], {
    base: 'src'
  })
  .pipe(gulp.dest('build'));
});

gulp.task('clean', () => {
  return del('build');
});

gulp.task('refresh', (done) => {
  server.reload();
  done();
});

gulp.task('server', () => {
  server.init({
    server: 'build/'
});

gulp.watch('src/sass/**/*.{scss,sass}', gulp.series('css', 'refresh'));
gulp.watch('src/img/icon-*.svg', gulp.series('sprite', 'html', 'refresh'));
gulp.watch('src/*.html', gulp.series('html', 'refresh'));
});

gulp.task('images', gulp.series('image', 'webp'));

gulp.task('build', gulp.series(
  'clean',
  'copy',
  'css',
  'images',
  'sprite',
  'html'
));

gulp.task('start', gulp.series('build', 'server'));
