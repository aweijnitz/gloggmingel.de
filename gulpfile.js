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

const baseDir = 'app';
const buildDir = 'build';
const distDir = 'dist';

gulp.task('browserSync', function () {
    browserSync({
        server: {
            baseDir: "app/"
        },
        options: {
            reloadDelay: 250
        },
        notify: false
    });
});


//compressing images & handle SVG files
gulp.task('images', function (cb) {
    gulp.src([baseDir + '/images/**/*.jpg', baseDir + '/images/**/*.png'])
    //prevent pipe breaking caused by errors from gulp plugins
        .pipe(plumber())
        .pipe(imagemin({optimizationLevel: 5, progressive: true, interlaced: true}))
        .pipe(gulp.dest(baseDir + '/images')).on('end', cb);
});

//compressing images & handle SVG files
gulp.task('images-deploy', function (cb) {
    gulp.src([baseDir + '/images/**/*', '!app/images/README'])
    //prevent pipe breaking caused by errors from gulp plugins
        .pipe(plumber())
        .pipe(gulp.dest(distDir + '/images')).on('end', cb);
});

//compiling our Javascripts
gulp.task('scripts', function (cb) {
    //this is where our dev JS scripts are
    return gulp.src([baseDir + '/scripts/src/_includes/**/*.js', baseDir + '/scripts/src/**/*.js'])
    //prevent pipe breaking caused by errors from gulp plugins
        .pipe(plumber())
        //this is the filename of the compressed version of our JS
        .pipe(concat('app.js'))
        //catch errors
        .on('error', gutil.log)
        //where we will store our finalized, compressed script
        .pipe(gulp.dest(baseDir + '/scripts'))
        //notify browserSync to refresh
        .pipe(browserSync.reload({stream: true})).on('end', cb);
});

//compiling our Javascripts for deployment
gulp.task('scripts-deploy', function (cb) {
    //this is where our dev JS scripts are
    return gulp.src([baseDir + '/scripts/src/_includes/**/*.js', baseDir + '/scripts/src/**/*.js'])
    //prevent pipe breaking caused by errors from gulp plugins
        .pipe(plumber())
        //this is the filename of the compressed version of our JS
        .pipe(concat('app.js'))
        //compress :D
        .pipe(uglify())
        //where we will store our finalized, compressed script
        .pipe(gulp.dest(distDir + '/scripts')).on('end', cb);
});

//compiling our SCSS files
gulp.task('styles', function (cb) {
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
        //catch errors
        .on('error', gutil.log)
        //the final filename of our combined css file
        .pipe(concat('styles.css'))
        //get our sources via sourceMaps
        .pipe(sourceMaps.write())
        //where to save our final, compressed css file
        .pipe(gulp.dest(baseDir + '/styles'))
        //notify browserSync to refresh
        .pipe(browserSync.reload({stream: true})).on('end', cb);
});

//compiling our SCSS files for deployment
gulp.task('styles-deploy', function (cb) {
    //the initializer / master SCSS file, which will just be a file that imports everything
    return gulp.src(baseDir + '/styles/scss/init.scss')
        .pipe(plumber())
        //include SCSS includes folder
        .pipe(sass({
            includePaths: [
                baseDir + '/styles/scss',
            ]
        }))
        .pipe(autoprefixer({
            browsers: autoPrefixBrowserList,
            cascade: true
        }))
        //the final filename of our combined css file
        .pipe(concat('styles.css'))
        .pipe(cleanCSS())
        //where to save our final, compressed css file
        .pipe(gulp.dest(distDir + '/styles')).on('end', cb).on('error', gutil.log)
        ;
});

//basically just keeping an eye on all HTML files
gulp.task('html', function (cb) {
    //watch any and all HTML files and refresh when something changes
    return gulp.src(baseDir + '/*.html')
        .pipe(plumber())
        .pipe(browserSync.reload({stream: true}))
        //catch errors
        .on('error', gutil.log).on('end', cb);
});

//migrating over all HTML files for deployment
gulp.task('html-deploy', function (cb) {
    //grab everything, which should include htaccess, robots, etc
    gulp.src(baseDir + '/*')
    //prevent pipe breaking caused by errors from gulp plugins
        .pipe(plumber())
        .pipe(gulp.dest(distDir)).on('error', gutil.log);

    //grab any hidden files too
    gulp.src(baseDir + '/.*')
    //prevent pipe breaking caused by errors from gulp plugins
        .pipe(plumber())
        .pipe(gulp.dest(distDir)).on('error', gutil.log);

    gulp.src(baseDir + '/fonts/**/*')
    //prevent pipe breaking caused by errors from gulp plugins
        .pipe(plumber())
        .pipe(gulp.dest(distDir + '/fonts')).on('error', gutil.log);

    //grab all of the styles
    gulp.src([baseDir + '/styles/*.css', '!app/styles/styles.css'])
    //prevent pipe breaking caused by errors from gulp plugins
        .pipe(plumber())
        .pipe(gulp.dest(distDir + '/styles')).on('error', gutil.log).on('end', cb);
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

//this is our master task when you run `gulp` in CLI / Terminal
//this is the main watcher to use when in active development
//  this will:
//  startup the web server,
//  start up browserSync
//  compress all scripts and SCSS files
gulp.task('default', gulp.series('browserSync', 'scripts', 'styles'), function () {
    //a list of watchers, so it will watch all of the following files waiting for changes
    gulp.watch(baseDir + '/scripts/src/**', ['scripts']);
    gulp.watch(baseDir + '/styles/scss/**', ['styles']);
    gulp.watch(baseDir + '/images/**', ['images']);
    gulp.watch(baseDir + '/*.html', ['html']);
});

//this is our deployment task, it will set everything for deployment-ready files
//gulp.task('deploy', gulpSequence(
//    'clean', 'scaffold', ['scripts-deploy', 'styles-deploy', 'images-deploy'], 'html-deploy'));
gulp.task('deploy',
    gulp.series(
        gulp.series('scaffold'),
        gulp.parallel(
            gulp.series('scripts', 'scripts-deploy'),
            gulp.series('styles', 'styles-deploy'),
            gulp.series('images', 'images-deploy')),
        gulp.series('html', 'html-deploy')));
