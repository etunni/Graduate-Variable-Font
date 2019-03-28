module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    sass: {
      dist: {
        options: {
          style: 'compressed',
          sourcemap: 'none'
        },
        files: {
          'docs-sources/css/style.css': 'docs-sources/scss/style.scss',
          'docs-sources/fonts/fonts.css': 'docs-sources/scss/fonts.scss'
        }
      }
    },
    autoprefixer: {
      options: {
        map: false
      },
      dist: {
        files: {
          'docs-sources/css/style.css': 'docs-sources/css/style.css',
          'docs-sources/fonts/fonts.css': 'docs-sources/fonts/fonts.css',
        }
      }
    },
    copy: {
      main: {
        files: [{
          expand: true,
          cwd: 'docs-sources',
          src: ['css/*.css'],
          dest: 'docs/',
          filter: 'isFile'
        }, {
          expand: true,
          cwd: 'docs-sources',
          src: ['favicon.png'],
          dest: 'docs/',
          filter: 'isFile'
        }, {
          expand: true,
          cwd: 'docs-sources',
          src: ['images/*'],
          dest: 'docs/',
          filter: 'isFile'
        }, {
          expand: true,
          cwd: 'docs-sources',
          src: ['*.html'],
          dest: 'docs/',
          filter: 'isFile'
        }, {
          expand: true,
          cwd: 'docs-sources',
          src: ['js/*.js'],
          dest: 'docs/',
          filter: 'isFile'
        }, {
          expand: true,
          cwd: 'fonts/variable',
          src: ['*.ttf'],
          dest: 'docs/fonts/',
          filter: 'isFile'
        }, ],
      },
    },
    watch: {
      css: {
        files: 'docs-sources/scss/*.scss',
        tasks: ['sass', 'autoprefixer']
      },
      all: {
        files: ['docs-sources/scss/*.scss', 'docs-sources/*.html', 'docs-sources/js/*'],
        tasks: ['sass', 'autoprefixer', 'copy'],
        options: {
          livereload: true
        }
      }
    },
    connect: {
      server: {
        options: {
          base: 'docs',
          port: 8081,
          hostname: '*',
          protocol: 'http'
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.registerTask('build', ['sass', 'autoprefixer', 'copy']);
  grunt.registerTask('default', ['build', 'connect', 'watch']);
}