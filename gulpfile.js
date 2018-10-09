const autoPrefixBrowserList = ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'];
const cp = require('child_process');

//load all of our dependencies
//add more here if you want to include more libraries
const gulp = require('gulp');
const gutil = require('gulp-util');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const sass = require('gulp-sass');
const sourceMaps = require('gulp-sourcemaps');
const imagemin = require('gulp-imagemin');
const cleanCSS = require('gulp-clean-css');
const browserSync = require('browser-sync');
const autoprefixer = require('gulp-autoprefixer');
const plumber = require('gulp-plumber');
const htmlmin = require('gulp-htmlmin');

const baseDir = 'app';
const buildDir = 'build';
const distDir = 'dist';

gulp.task('browserSync', function () {
    browserSync({
        server: {
            baseDir: buildDir + '/'
        },
        options: {
            reloadDelay: 250
        },
        notify: false
    });
});


//compressing images & handle SVG files
gulp.task('images-build', function (cb) {
    return gulp.src([baseDir + '/images/**/*.jpg', baseDir + '/images/**/*.png'])
        .pipe(plumber())
        .pipe(imagemin({optimizationLevel: 5, progressive: true, interlaced: true}))
        .pipe(gulp.dest(buildDir + '/images'))
        .pipe(browserSync.reload({stream: true}))
        .on('error', gutil.log).on('end', cb);
});

//compressing images & handle SVG files
gulp.task('images-deploy', function (cb) {
    return gulp.src([buildDir + '/images/**/*', '!app/images/README'])
        .pipe(plumber())
        .pipe(gulp.dest(distDir + '/images'))
        .on('error', gutil.log).on('end', cb);
});

//compiling our Javascripts
gulp.task('scripts-build', function (cb) {
    return gulp.src([baseDir + '/scripts/src/_includes/**/*.js', baseDir + '/scripts/src/**/*.js'])
        .pipe(plumber())
        .pipe(concat('app.js'))
        .pipe(gulp.dest(buildDir + '/scripts'))
        .pipe(browserSync.reload({stream: true}))
        .on('error', gutil.log).on('end', cb);
});

//compiling our Javascripts for deployment
gulp.task('scripts-deploy', function (cb) {
    //this is where our dev JS scripts are
    return gulp.src([buildDir + '/scripts/**/*.js'])
        .pipe(plumber())
        .pipe(uglify())
        .pipe(gulp.dest(distDir + '/scripts')).on('end', cb);
});

//compiling our SCSS files
gulp.task('styles-build', function (cb) {
    //the initializer / master SCSS file, which will just be a file that imports everything
    return gulp.src(baseDir + '/styles/scss/init.scss')
    //prevent pipe breaking caused by errors from gulp plugins
        .pipe(plumber({
            errorHandler: function (err) {
                console.log(err);
                this.emit('end');
            }
        }))
        //get sourceMaps ready
        .pipe(sourceMaps.init())
        //include SCSS and list every "include" folder
        .pipe(sass({
            errLogToConsole: true,
            includePaths: [
                baseDir + '/styles/scss/'
            ]
        }))
        .pipe(autoprefixer({
            browsers: autoPrefixBrowserList,
            cascade: true
        }))
        //the final filename of our combined css file
        .pipe(concat('styles.css'))
        //get our sources via sourceMaps
        .pipe(sourceMaps.write())
        //where to save our final, compressed css file
        .pipe(gulp.dest(buildDir + '/styles'))
        //notify browserSync to refresh
        .pipe(browserSync.reload({stream: true}))
        .on('error', gutil.log).on('end', cb);
});

//compiling our SCSS files for deployment
gulp.task('styles-deploy', function (cb) {
    //the initializer / master SCSS file, which will just be a file that imports everything
    return gulp.src(buildDir + '/styles/**/*.css')
        .pipe(plumber())
        .pipe(cleanCSS())
        //where to save our final, compressed css file
        .pipe(gulp.dest(distDir + '/styles')).on('end', cb).on('error', gutil.log);
});

gulp.task('fonts-build', function (cb) {
    return gulp.src(baseDir + '/fonts/**/*')
        .pipe(gulp.dest(buildDir + '/fonts'))
        .pipe(browserSync.reload({stream: true})).on('end', cb);
});

gulp.task('fonts-deploy', function () {
    return gulp.src(buildDir + '/fonts/**/*')
        .pipe(gulp.dest(distDir + '/fonts'))
});


gulp.task('html-build', function (cb) {
    //watch any and all HTML files and refresh when something changes
    return gulp.src(baseDir + '/*.html')
        .pipe(plumber())
        .pipe(gulp.dest(buildDir))
        .pipe(browserSync.reload({stream: true}))
        .on('error', gutil.log).on('end', cb);
});

//migrating over all HTML files for deployment
gulp.task('html-deploy', function (cb) {
    //grab everything, which should include htaccess, robots, etc
    return gulp.src(buildDir + '/*.html')
        .pipe(plumber())
        .pipe(htmlmin({collapseWhitespace: true, caseSensitive: true, removeComments: true}))
        .pipe(gulp.dest(distDir)).on('error', gutil.log).on('end', cb);
});

//cleans our dist directory in case things got deleted
gulp.task('clean', function (cb) {
    return cp.exec('rm -rf ' + distDir + ' ' + buildDir);
});

//create folders using shell
gulp.task('scaffold-dirs', function () {
    return cp.exec(
        'mkdir ' + distDir + ' && ' +
        'mkdir ' + distDir + '/fonts && ' +
        'mkdir ' + distDir + '/images && ' +
        'mkdir ' + distDir + '/scripts && ' +
        'mkdir ' + distDir + '/styles && ' +
        'mkdir ' + buildDir + ' && ' +
        'mkdir ' + buildDir + '/fonts && ' +
        'mkdir ' + buildDir + '/images && ' +
        'mkdir ' + buildDir + '/scripts && ' +
        'mkdir ' + buildDir + '/styles'
    );
});

gulp.task('scaffold', gulp.series('clean', 'scaffold-dirs'));

gulp.task('build',
    gulp.parallel('images-build', 'fonts-build', 'scripts-build', 'styles-build', 'html-build'));

gulp.task('default', gulp.series('browserSync', 'build'), function () {
    //a list of watchers, so it will watch all of the following files waiting for changes
    gulp.watch(buildDir + '/scripts/src/**', ['scripts']);
    gulp.watch(buildDir + '/styles/scss/**', ['styles']);
    gulp.watch(buildDir + '/images/**', ['images']);
    gulp.watch(buildDir + '/*.html', ['html']);
});

gulp.task('dist',
    gulp.series(
        gulp.series('scaffold', 'build'),
        gulp.parallel('images-deploy', 'fonts-deploy', 'scripts-deploy', 'styles-deploy', 'html-deploy')));
