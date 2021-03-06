"use strict";

var gulp = require("gulp");
var plumber = require("gulp-plumber");
var sourcemap = require("gulp-sourcemaps");
var rename = require("gulp-rename");
var sass = require("gulp-sass");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();
var csso = require("gulp-csso");
var imagemin = require("gulp-imagemin");
var webp = require("gulp-webp");
var svgstore = require("gulp-svgstore");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
var del = require("del");
var htmlmin = require("gulp-htmlmin");
var webpack = require('webpack-stream')

let isDev = true
let isProd = !isDev

function js() {
  return gulp.src('./source/js/*')
    .pipe(webpack({
      output: {
        filename: 'bundle.js'
      },
      module: {
        rules: [
          {
            test: /\js$/,
            include: __dirname + './source',
            exclude: '/node_modules/',
            use: ["babel-loader"]
          }
        ]
      },
      mode: isDev ? 'development' : 'production'
    }))
    .pipe(gulp.dest('./build/js'))
    .pipe(server.stream())
}

gulp.task('js', js)

gulp.task("css", function () {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});


gulp.task("server", function () {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/sass/**/*.scss", gulp.series("css"));
  gulp.watch("source/js/*", gulp.series("js"));
  gulp.watch("source/img/icon-sprite-*.svg", gulp.series("sprite", "html", "refresh"));
  gulp.watch("source/*.html", gulp.series("html", "refresh")).on("change", server.reload);
});

gulp.task("refresh", function () {
	server.reload();
	done();
});

gulp.task("images", function () {
return gulp.src("source/img/**/*.{png,jpg,svg}")
.pipe(imagemin([
imagemin.optipng({optimizationLevel: 3}),
imagemin.jpegtran({progressive: true}),
imagemin.svgo()
]))
.pipe(gulp.dest("source/img"));
});


gulp.task("webp", function () {
return gulp.src("source/img/**/*.{png,jpg}")
	.pipe(webp({quality: 90}))
	.pipe(gulp.dest("source/img"));
});


gulp.task("sprite", function () {
return gulp.src("source/img/**/icon-sprite*.svg")
.pipe(svgstore({
inlineSvg: true
}))
.pipe(rename("sprite.svg"))
.pipe(gulp.dest("build/img"));
});

gulp.task("html", function () {
return gulp.src("source/*.html")
.pipe(posthtml([
include()
]))
.pipe(htmlmin({ collapseWhitespace: true }))
.pipe(gulp.dest("build"));
});

gulp.task("copy", function () {
return gulp.src([
"source/fonts/**/*.{woff,woff2}",
"source/img/**",
"source/js/**",
"source/ico/**"
], {
base: "source"
})
.pipe(gulp.dest("build"));
});

gulp.task("clean", function () {
return del("build")
});

gulp.task("build", gulp.series("clean", "copy", "css", "js", "sprite", "html"));
gulp.task("start", gulp.series("build", "server"));
