'use strict';

const gulp = require('gulp');
const tsc = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');

const tsProject = tsc.createProject('tsconfig.json', {
    typescript: require('typescript')
});

gulp.task('compile', () => {
    const sourceFiles = ['src/**/*.ts'];

    const tsResult = gulp.src(sourceFiles)
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .on('error', () => {
            process.exitCode = 1;
        });

    tsResult.dts.pipe(gulp.dest('dist'));
    return tsResult.js
        .pipe(sourcemaps.write('.', {
            includeContent: false,
            sourceRoot: './'
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('watch', () => {
    const sourceFiles = ['src/**/*.ts'];
    gulp.watch(sourceFiles, {cwd: './'}, ['compile']);
});

gulp.task('clean', () => {
    const allGenFiles = [
        'dist'
    ];

    return del(allGenFiles);
});

gulp.task('default', ['clean'], () => {
    gulp.start('compile');
});