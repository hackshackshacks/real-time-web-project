/* Require packages */
const gulp = require('gulp')
const sass = require('gulp-sass')
const concat = require('gulp-concat')
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')
const imagemin = require('gulp-imagemin')
const webp = require('gulp-webp')
const clean = require('gulp-clean')
const gulpSequence = require('gulp-sequence')
const open = require('gulp-open')

/* === Tasks === */

/* Render html */
gulp.task('render', () => {
  gulp
    .src('assets/src/views/*.html')
    .pipe(gulp.dest('dist'))
})

/* Compile sass */
gulp.task('sass', () => {
  gulp
    .src('assets/src/styles/main.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('assets/dist/css'))
})

/* Compile sass and minify for production */
gulp.task('sass-p', () => {
  gulp
    .src('assets/src/styles/main.scss')
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(gulp.dest('assets/dist/css'))
})

/* Bundle scripts */
gulp.task('bundle', () => {
  gulp
    .src('assets/src/scripts/**/*.js')
    .pipe(concat('bundle.js'))
    .pipe(
      babel({
        presets: ['es2015']
      })
    )
    .pipe(gulp.dest('assets/dist/js'))
})

/* Bundle scripts and minify */
gulp.task('bundle-p', () => {
  gulp
    .src('assets/src/scripts/**/*.js')
    .pipe(concat('bundle.js'))
    .pipe(
      babel({
        presets: ['es2015']
      })
    )
    .pipe(uglify())
    .pipe(gulp.dest('assets/dist/js'))
})

/* Process images */
gulp.task('images', () => {
  gulp
    .src('assets/src/images/**/*')
    .pipe(gulp.dest('assets/dist/images'))
})

gulp.task('images-p', () => {
  gulp
    .src('assets/src/images/**/*')
    .pipe(imagemin())
    .pipe(gulp.dest('assets/dist/images'))
  gulp
    .src('assets/src/images/**/*')
    .pipe(webp())
    .pipe(gulp.dest('assets/dist/images'))
})
/* Process fonts */
gulp.task('fonts', () => {
  gulp
    .src('assets/src/fonts/*')
    .pipe(gulp.dest('assets/dist/fonts'))
})

/* Watch files for changes */
gulp.task('watch', () => {
  gulp.watch('assets/src/templates/**/*.html', ['render'])
  gulp.watch('assets/src/styles/**/*.scss', ['sass'])
  gulp.watch('assets/src/scripts/**/*.js', ['bundle'])
  gulp.watch('assets/src/images/**/*', ['images'])
  gulp.watch('assets/src/fonts/*', ['fonts'])
})

/* Remove dist folder to remove unused files */
gulp.task('clean', () => {
  gulp.src('dist').pipe(clean())
})

// Combined tasks
gulp.task('default', [
  'render',
  'sass',
  'bundle',
  'images',
  'fonts',
  'watch'
])

gulp.task(
  'prod',
  gulpSequence('clean', [
    'render',
    'sass-p',
    'bundle-p',
    'images-p',
    'fonts',
  ])
)
