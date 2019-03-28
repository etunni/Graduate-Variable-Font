module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        sass: {
            dist: {
                options: {
                    style: 'compressed',
                    sourcemap: 'none'
                },
                files: {
                    'docs/css/style.css': 'docs-sources/scss/style.scss',
                    'docs/fonts/fonts.css': 'docs-sources/scss/fonts.scss'
                }
            }
        },
        autoprefixer: {
            options: {
                map: false
            },
            dist: {
                files: {
                    'docs/css/style.css': 'docs/css/style.css',
                    'docs/fonts/fonts.css': 'docs/fonts/fonts.css',
                }
            }
        },
        watch: {
            css: {
                files: 'docs-sources/scss/*.scss',
                tasks: ['sass', 'autoprefixer']
            },
            all: {
                files: ['docs-sources/scss/*.scss', 'docs-sources/*.html', 'docs-sources/js/*.js'],
                options: {
                  livereload: true
                }
            }
        },
        connect: {
          server: {
            options: {
              port: 8080,
              hostname: '*',
              protocol: 'https'
            }
          }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.registerTask('default', ['connect', 'watch']);
}

