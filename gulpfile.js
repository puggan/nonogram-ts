// noinspection ES6ConvertRequireIntoImport
const gulp = require('gulp');
// noinspection ES6ConvertRequireIntoImport
const plug = {
    babel: require('gulp-babel'),
    concat: require('gulp-concat'),
    debug: require('gulp-debug'),
    flatmap: require('gulp-flatmap'),
    htmlmin: require('gulp-htmlmin'),
    imagemin: require('gulp-imagemin'),
    jsx: require('gulp-jsx'),
    less: require('gulp-less'),
    rename: require('gulp-rename'),
    sourcemaps: require('gulp-sourcemaps'),
    typescript: require('gulp-typescript'),
    uglifycss: require('gulp-clean-css'),
    uglifyjsES: require('gulp-uglify-es').default,
    uglifyjs: require('gulp-uglify'),
    watch: require('gulp-watch'),
};
const imageminPlugins = {
    optipng: require("imagemin-optipng"),
};

const fontPath = 'fonts/**/*.css';
const gutenbergPath = 'src/gutenberg/**/*.tsx';
const htmlPath = 'src/html/**/*.html';
const imgPath = 'src/img/**/*';
const lessPath = 'src/less/**/*.less';
const typesciprtPath = 'src/ts/**/*.ts';

const uglifyCssOptions = {
    level: {
        2: {
            mergeSemantically: true,
            restructureRules: true,
        }
    }
};

//<editor-fold desc="Gutenberg">
//<editor-fold desc="Gutenberg ES5">
let gutenbergEs5 = () => gulp.src(gutenbergPath)
    .pipe(plug.sourcemaps.init())
    .pipe(plug.typescript.createProject({
        "target": "ES5",
        "jsx": "preserve",
        "lib": ["DOM", "ES5", "ScriptHost", "ES2015.Promise", "ES2015.Iterable"]
    })())
    .pipe(plug.jsx({
        factory: 'wp.element.createElement',
        passUnknownTagsToFactory: true,
        arrayChildren: false
    }))
    // *.js to gutenberg.js
    .pipe(plug.concat('gutenberg.es5.js'))
    .pipe(plug.babel({
        compact: false,
        presets: [["@babel/env", {
            "targets": {
                "browsers": ["cover 95% in se, not dead"],
            },
        }]],
    }))
    //.pipe(plug.uglifyjs())
    .pipe(plug.sourcemaps.write("./", {includeContent: false}))
    .pipe(gulp.dest('build/'));
//</editor-fold>
//<editor-fold desc="Gutenberg ES6">
let gutenbergEs6 = () => gulp.src('src/gutenberg/*.tsx')
    .pipe(plug.sourcemaps.init())
    .pipe(plug.typescript.createProject(
        {
            "target": "ES6",
            "jsx": "preserve",
            "module": "CommonJS",
            "lib": [
                "DOM",
                "ES6",
                "ScriptHost",
                "DOM.Iterable",
            ]
        }
        )())
    .pipe(plug.jsx({
        factory: 'wp.element.createElement',
        passUnknownTagsToFactory: true,
        arrayChildren: false
    }))
    // *.js to gutenberg.js
    .pipe(plug.concat('gutenberg.es6.js'))
    .pipe(plug.babel({
        compact: false,
        presets: [["@babel/env", {
            "targets": {
                browsers: [
                    'last 2 Chrome versions',
                    'last 2 Safari versions',
                    'last 2 Firefox versions',
                    'last 2 Edge versions',
                ],
            },
        }]],
    }))
    .pipe(plug.uglifyjsES())
    .pipe(plug.sourcemaps.write("./", {includeContent: false}))
    .pipe(gulp.dest('build/'));
//</editor-fold>
gulp.task('gutenberg-es5', gutenbergEs5);
gulp.task('gutenberg-es6', gutenbergEs6);
gulp.task('gutenberg', gulp.parallel(['gutenberg-es5', 'gutenberg-es6']));
gulp.task('gutenberg-watch', () => gulp.watch([gutenbergPath], gulp.parallel(['gutenberg'])));
//</editor-fold>

//<editor-fold desc="Typescript">
//<editor-fold desc="Typescript ES5">
const tsEs5 = (s) => s
    .pipe(plug.sourcemaps.init())
    .pipe(plug.typescript.createProject({
        "target": "ES5",
        "lib": ["DOM", "ES5", "ScriptHost", "ES2015.Promise", "ES2015.Iterable"]
    })())
    .pipe(plug.concat('es5.js'))
    .pipe(plug.babel({
        compact: false,
        presets: [["@babel/env", {
            "targets": {
                "browsers": ["cover 95% in se, not dead"],
            },
        }]],
    }))
    .pipe(plug.uglifyjs())
    .pipe(plug.sourcemaps.write("./", {includeContent: false}))
    .pipe(gulp.dest('build/'))
    .pipe(plug.debug({title: 'ts-es5:'}));
//</editor-fold>
//<editor-fold desc="Typescript ES6">
const tsEs6 = (s) => s
    .pipe(plug.sourcemaps.init())
    .pipe(plug.typescript.createProject({"target": "ES6", "lib": ["DOM", "ES6", "ScriptHost", "DOM.Iterable"]})())
    .pipe(plug.concat('es6.js'))
    .pipe(plug.babel({
        compact: false,
        presets: [["@babel/env", {
            "targets": {
                browsers: [
                    'last 2 Chrome versions',
                    'last 2 Safari versions',
                    'last 2 Firefox versions',
                    'last 2 Edge versions',
                ],
            },
        }]],
    }))
    .pipe(plug.uglifyjsES())
    .pipe(plug.sourcemaps.write("./", {includeContent: false}))
    .pipe(gulp.dest('build/'))
    .pipe(plug.debug({title: 'ts-es6:'}));
//</editor-fold>
const tsEs5Task = () => tsEs5(gulp.src(typesciprtPath));
const tsEs6Task = () => tsEs6(gulp.src(typesciprtPath));
gulp.task("ts-es5", tsEs5Task);
gulp.task("ts-es6", tsEs6Task);
gulp.task("ts", gulp.parallel(["ts-es5", "ts-es6", "gutenberg"]));

//<editor-fold desc="Typescript watch">
// noinspection ChainedFunctionCallJS
const tsEs5Wwatch = () => plug
    .watch(typesciprtPath)
    .pipe(plug.debug({title: 'watch-es5:'}))
    .pipe(plug.flatmap(tsEs5));
const tsEs6Watch = () => plug
    .watch(typesciprtPath)
    .pipe(plug.debug({title: 'watch-es6:'}))
    .pipe(plug.flatmap(tsEs6));
gulp.task("ts-watch-es5", tsEs5Wwatch);
gulp.task("ts-watch-es6", tsEs6Watch);
/// TODO gulp watch
gulp.task("ts-watch", gulp.parallel(["ts-watch-es5", "ts-watch-es6"]));
//</editor-fold>
//</editor-fold>

//<editor-fold desc="LESS">
const lessMain = (s) => s
    .pipe(plug.sourcemaps.init())
    .pipe(plug.less())
    .pipe(plug.uglifycss(uglifyCssOptions))
    .pipe(plug.sourcemaps.write("./", {includeContent: false}))
    .pipe(gulp.dest('build/'))
    .pipe(plug.debug({title: 'less:'}));
const lessTask = () => lessMain(gulp.src(lessPath));
const lessWatch = () => lessMain(plug
    .watch(lessPath)
    .pipe(plug.debug({title: 'watch:'})));
gulp.task("less", lessTask);
gulp.task("less-watch", lessWatch);
//</editor-fold>

//<editor-fold desc="Fonts">
const fontMain = (s) => s
    .pipe(plug.sourcemaps.init())
    .pipe(plug.uglifycss(uglifyCssOptions))
    .pipe(plug.rename({suffix: ".min"}))
    .pipe(plug.sourcemaps.write("./", {includeContent: false}))
    .pipe(gulp.dest('fonts/'))
    .pipe(plug.debug({title: 'fonts:'}));
const fontTask = () => fontMain(gulp.src([fontPath]));
const fontWatch = () => fontMain(plug
    .watch(fontPath)
    .pipe(plug.debug({title: 'watch:'})));
gulp.task("fonts", fontTask);
gulp.task("fonts-watch", fontWatch);
//</editor-fold>

//<editor-fold desc="Images">
const imgMain = (s) => s
    .pipe(plug.imagemin({
        progressive: true,
        use: [
            imageminPlugins.optipng
        ]
    }))
    .pipe(gulp.dest('../build/img/'))
    .pipe(plug.debug({title: 'img:'}));
const imgTask = () => imgMain(gulp.src(imgPath));
const imgWatch = () => imgMain(plug
    .watch(imgPath)
    .pipe(plug.debug({title: 'watch:'})));
gulp.task('images', imgTask);
gulp.task('images-watch', imgWatch);
//</editor-fold>

//<editor-fold desc="HTML">
// noinspection ChainedFunctionCallJS
const htmlMain = (s) => s
    .pipe(plug.sourcemaps.init())
    .pipe(plug.htmlmin({
        collapseWhitespace: true,
        removeComments: true,
        sortAttributes: true,
        sortClassName: true,
    }))
    .pipe(plug.sourcemaps.write("./", {includeContent: false}))
    .pipe(gulp.dest('build/'))
    .pipe(plug.debug({title: 'html:'}));
const htmlTask = () => htmlMain(gulp.src(htmlPath));
const htmlWatch = () => htmlMain(plug
    .watch(htmlPath)
    .pipe(plug.debug({title: 'watch:'})));
gulp.task("html", htmlTask);
gulp.task("html-watch", htmlWatch);
//</editor-fold>

gulp.task("default", gulp.parallel(['ts', 'less', 'html', 'fonts', 'images']));
gulp.task("watch", gulp.series(["default", gulp.parallel(['ts-watch', 'less-watch', 'html-watch', 'gutenberg-watch', 'fonts-watch', 'images-watch'])]));
