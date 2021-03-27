const { task, src, dest, watch, series, parallel } = require('gulp');

/* очистка папки build */
const rm = require('gulp-rm');
/* статический сервер*/
const browserSync = require('browser-sync').create();
/* подключение html-фрагментов кода */
const fileInclude = require('gulp-file-include');
/* продолжение работы сборщика при возникновении ошибок */
const plumber = require('gulp-plumber');
/* показ уведомлений при возникновении ошибок в работе сборщика */
const notify = require('gulp-notify');
/* сборка css */
const sass = require('gulp-sass');
/* глобальное подключение всех scss блоков в основной файл стилей  */
const sassGlob = require('gulp-sass-glob');
/* генератор карты проекта  */
const sourcemaps = require('gulp-sourcemaps');
/* группировка медиа-запросов в стилевых файлах  */
const gcmq = require('gulp-group-css-media-queries');
/* минификация css */
const cleanCSS = require('gulp-clean-css');
/* автопрефиксер */
const autoprefixer = require('gulp-autoprefixer');
/* объединение файлов в один  */
const concat = require('gulp-concat');
/* минификация js и исключение неиспользуемого кода */
const uglify = require('gulp-uglify');
/* svg-спрайты */
const svgSprite = require('gulp-svg-sprite');
/* оптимизация svg-файлов */
const svgo = require('gulp-svgo');
/* оптимизация картинок */
const imagemin = require('gulp-imagemin');
/* сжатие html */
const htmlmin = require('gulp-htmlmin');

sass.compiler = require('node-sass');

/* задание на: удаление папки build + доп аргументов передаем запрет на считывание файлов - это не нужно.*/
task('clean', () => {
  return src('./build/**/*', { read: false }).pipe(rm());
});
task('clean-final', () => {
  return src('./final/**/*', { read: false }).pipe(rm());
});

/* задание на: собираем html файлы */
task('html', () => {
  return src('./src/html/*.html')

    .pipe(plumber({
      errorHandler: notify.onError(function (err) {
        return {
          title: 'HTML include',
          sound: false,
          message: err.message
        }
      })
    }
    ))
    .pipe(fileInclude())
    .pipe(dest('./build/'))
    .pipe(browserSync.reload({ stream: true }));
});

task('html-final', () => {
  return src('./src/html/*.html')

    .pipe(plumber({
      errorHandler: notify.onError(function (err) {
        return {
          title: 'HTML include',
          sound: false,
          message: err.message
        }
      })
    }
    ))
    .pipe(fileInclude())
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(dest('./final/'))
});

/* задание на: собираем html файлы */
task('fonts', () => {
  return src('./src/fonts/*')
    .pipe(dest('./build/fonts/'))
    .pipe(browserSync.reload({ stream: true }));
});

/* задание на: собираем html файлы */
task('fonts--final', () => {
  return src('./src/fonts/*')
    .pipe(dest('./final/fonts/'))
});


/* задание на: сборка стилей css  */
task('styles', () => {
  return src(['./node_modules/normalize.css/normalize.css', './src/scss/main.scss'])
    .pipe(sourcemaps.init())
    .pipe(concat('main.css'))
    .pipe(sassGlob())
    .pipe(sass().on('error', sass.logError))
    .pipe(gcmq())
    .pipe(sourcemaps.write())
    .pipe(dest('./build/css/'))
    .pipe(browserSync.reload({ stream: true }));
});

task('styles-final', () => {
  return src(['./node_modules/normalize.css/normalize.css', './src/scss/main.scss'])
    .pipe(concat('main.css'))
    .pipe(sassGlob())
    .pipe(sass().on('error', sass.logError))
    .pipe(gcmq())
    .pipe(autoprefixer({ cascade: false }))
    .pipe(cleanCSS())
    .pipe(dest('./final/css/'))
});


/* задание на: работа с js  */
task('scripts', () => {
  return src(['./src/js/*.js'])
    .pipe(sourcemaps.init())
    .pipe(concat('main.js', { newLine: ';' }))
    .pipe(sourcemaps.write())
    .pipe(dest('./build/js/'))
    .pipe(browserSync.reload({ stream: true }));
});

task('scripts-final', () => {
  return src(['./src/js/*.js'])
    .pipe(concat('main.js', { newLine: ';' }))
    .pipe(uglify())
    .pipe(dest('./final/js/'))
});

/* задание на: работа с svg-спрайтом  */
task('svg-sprite', () => {
  return src('./src/svg/**/*.svg')
    .pipe(svgo({
      plugins: [
        {
          removeAttrs: { attrs: '(fill|stroke|style|width|height|data.*)' }
        }
      ]
    }))
    .pipe(svgSprite({
      mode: {
        symbol: {
          sprite: '../sprite.svg'
        }
      }
    }))
    .pipe(dest('./build/svg/'))
    .pipe(browserSync.reload({ stream: true }));
});

task('svg-sprite-final', () => {
  return src('./src/svg/**/*.svg')
    .pipe(svgo({
      plugins: [
        {
          removeAttrs: { attrs: '(fill|stroke|style|width|height|data.*)' }
        }
      ]
    }))
    .pipe(svgSprite({
      mode: {
        symbol: {
          sprite: '../sprite.svg'
        }
      }
    }))
    .pipe(dest('./final/svg/'))
});


/* задание на: работа со сторонними библиотеками */
task('libs', () => {
  return src('./src/libs/**/*')
    .pipe(dest('./build/libs/'))
    .pipe(browserSync.reload({ stream: true }));
});

task('libs-final', () => {
  return src('./src/libs/**/*')
    .pipe(dest('./final/libs/'))
});


/* задание на: работа с растровой графикой  */
task('images', () => {
  return src('./src/img/**/*')
    .pipe(
      imagemin({
        progressive: true,
        interlaced: true,
      })
    )
    .pipe(dest('./build/img/'));
})

task('images-final', () => {
  return src('./src/img/**/*')
    .pipe(
      imagemin({
        progressive: true,
        interlaced: true,
      })
    )
    .pipe(dest('./final/img/'));
})

/* задание на: слежка за изменениями в файлах проекта */
task('watch', () => {
  watch('./src/html/**/*.html', series('html'));
  watch('./src/scss/**/*.scss', series('styles'));
  watch('./src/js/**/*.js', series('scripts'));
  watch('./src/svg/icons/*.svg', series('svg-sprite'));
  watch('./src/libs/**/*', series('libs'));
  watch('./src/img/**/*', series('images'));
  watch('./src/fonts/**/*', series('fonts'));
})


/* задание на: статический сервер для просмотра проекта в браузере  */
task('server', () => {
  browserSync.init({
    server: {
      baseDir: './build/',
    },
  });
});

task('server-final', () => {
  browserSync.init({
    server: {
      baseDir: './final/',
    },
  });
});


/* основной таск (дефолтный): последовательное выполнение */
task('default',
  series('clean', 'svg-sprite',
    parallel('html', 'images', 'fonts', 'styles', 'scripts', 'libs'),
    parallel('server', 'watch')
  ));

task('fatality',
  series('clean-final', 'svg-sprite-final',
    parallel('html-final', 'images-final', 'fonts--final', 'styles-final', 'scripts-final', 'libs-final'),
    parallel('server-final')
  ));
