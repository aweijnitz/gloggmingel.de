//initialize all of our variables
var app, base, concat, directory, gulp, gutil, hostname, path, refresh, sass, uglify, imagemin, minifyCSS, del,
    browserSync, autoprefixer, gulpSequence, shell, sourceMaps, plumber;

var autoPrefixBrowserList = ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'];

var cp = require('child_process');

//load all of our dependencies
//add more here if you want to include more libraries
gulp = require('gulp');
gutil = require('gulp-util');
concat = require('gulp-concat');
uglify = require('gulp-uglify');
sass = require('gulp-sass');
sourceMaps = require('gulp-sourcemaps');
imagemin = require('gulp-imagemin');
minifyCSS = require('gulp-minify-css');
browserSync = require('browser-sync');
autoprefixer = require('gulp-autoprefixer');
//gulpSequence = require('gulp-sequence').use(gulp);
//exec       = require('gulp-exec');
plumber = require('gulp-plumber');

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
    gulp.src(['app/images/*.jpg', 'app/images/*.png'])
    //prevent pipe breaking caused by errors from gulp plugins
        .pipe(plumber())
        .pipe(imagemin({optimizationLevel: 5, progressive: true, interlaced: true}))
        .pipe(gulp.dest('app/images')).on('end', cb);
});

//compressing images & handle SVG files
gulp.task('images-deploy', function (cb) {
    gulp.src(['app/images/**/*', '!app/images/README'])
    //prevent pipe breaking caused by errors from gulp plugins
        .pipe(plumber())
        .pipe(gulp.dest('dist/images')).on('end', cb);
});

//compiling our Javascripts
gulp.task('scripts', function (cb) {
    //this is where our dev JS scripts are
    return gulp.src(['app/scripts/src/_includes/**/*.js', 'app/scripts/src/**/*.js'])
    //prevent pipe breaking caused by errors from gulp plugins
        .pipe(plumber())
        //this is the filename of the compressed version of our JS
        .pipe(concat('app.js'))
        //catch errors
        .on('error', gutil.log)
        //where we will store our finalized, compressed script
        .pipe(gulp.dest('app/scripts'))
        //notify browserSync to refresh
        .pipe(browserSync.reload({stream: true})).on('end', cb);
});

//compiling our Javascripts for deployment
gulp.task('scripts-deploy', function (cb) {
    //this is where our dev JS scripts are
    return gulp.src(['app/scripts/src/_includes/**/*.js', 'app/scripts/src/**/*.js'])
    //prevent pipe breaking caused by errors from gulp plugins
        .pipe(plumber())
        //this is the filename of the compressed version of our JS
        .pipe(concat('app.js'))
        //compress :D
        .pipe(uglify())
        //where we will store our finalized, compressed script
        .pipe(gulp.dest('dist/scripts')).on('end', cb);
});

//compiling our SCSS files
gulp.task('styles', function (cb) {
    //the initializer / master SCSS file, which will just be a file that imports everything
    return gulp.src('app/styles/scss/init.scss')
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
                'app/styles/scss/'
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
        .pipe(gulp.dest('app/styles'))
        //notify browserSync to refresh
        .pipe(browserSync.reload({stream: true})).on('end', cb);
});

//compiling our SCSS files for deployment
gulp.task('styles-deploy', function (cb) {
    //the initializer / master SCSS file, which will just be a file that imports everything
    return gulp.src('app/styles/scss/init.scss')
        .pipe(plumber())
        //include SCSS includes folder
        .pipe(sass({
            includePaths: [
                'app/styles/scss',
            ]
        }))
        .pipe(autoprefixer({
            browsers: autoPrefixBrowserList,
            cascade: true
        }))
        //the final filename of our combined css file
        .pipe(concat('styles.css'))
        .pipe(minifyCSS())
        //where to save our final, compressed css file
        .pipe(gulp.dest('dist/styles')).on('end', cb).on('error', gutil.log)
        ;
});

//basically just keeping an eye on all HTML files
gulp.task('html', function (cb) {
    //watch any and all HTML files and refresh when something changes
    return gulp.src('app/*.html')
        .pipe(plumber())
        .pipe(browserSync.reload({stream: true}))
        //catch errors
        .on('error', gutil.log).on('end', cb);
});

//migrating over all HTML files for deployment
gulp.task('html-deploy', function (cb) {
    //grab everything, which should include htaccess, robots, etc
    gulp.src('app/*')
    //prevent pipe breaking caused by errors from gulp plugins
        .pipe(plumber())
        .pipe(gulp.dest('dist')).on('error', gutil.log);

    //grab any hidden files too
    gulp.src('app/.*')
    //prevent pipe breaking caused by errors from gulp plugins
        .pipe(plumber())
        .pipe(gulp.dest('dist')).on('error', gutil.log);

    gulp.src('app/fonts/**/*')
    //prevent pipe breaking caused by errors from gulp plugins
        .pipe(plumber())
        .pipe(gulp.dest('dist/fonts')).on('error', gutil.log);

    //grab all of the styles
    gulp.src(['app/styles/*.css', '!app/styles/styles.css'])
    //prevent pipe breaking caused by errors from gulp plugins
        .pipe(plumber())
        .pipe(gulp.dest('dist/styles')).on('error', gutil.log).on('end', cb);
});

//cleans our dist directory in case things got deleted
gulp.task('clean', function (cb) {
    return cp.exec('rm -rf dist');
});

//create folders using shell
gulp.task('scaffold', function () {
    return cp.exec(
        'mkdir dist &&' +
        'mkdir dist/fonts && ' +
        'mkdir dist/images && ' +
        'mkdir dist/scripts && ' +
        'mkdir dist/styles'
    );
});

//this is our master task when you run `gulp` in CLI / Terminal
//this is the main watcher to use when in active development
//  this will:
//  startup the web server,
//  start up browserSync
//  compress all scripts and SCSS files
gulp.task('default', gulp.series('browserSync', 'scripts', 'styles'), function () {
    //a list of watchers, so it will watch all of the following files waiting for changes
    gulp.watch('app/scripts/src/**', ['scripts']);
    gulp.watch('app/styles/scss/**', ['styles']);
    gulp.watch('app/images/**', ['images']);
    gulp.watch('app/*.html', ['html']);
});

//this is our deployment task, it will set everything for deployment-ready files
//gulp.task('deploy', gulpSequence(
//    'clean', 'scaffold', ['scripts-deploy', 'styles-deploy', 'images-deploy'], 'html-deploy'));
gulp.task('deploy',
    gulp.series(
        gulp.series('clean', 'scaffold'),
        gulp.parallel(
            gulp.series('scripts', 'scripts-deploy'),
            gulp.series('styles', 'styles-deploy'),
            gulp.series('images', 'images-deploy')),
        gulp.series('html', 'html-deploy')));
