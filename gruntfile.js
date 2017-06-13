'use strict';
/*jshint camelcase: false */

var basePort = 8001,
  testPort = 8002;

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    copy: {
      main: {
        files: [
          // front-end
          {
            expand: true,
            cwd: 'bower_components/respond/dest',
            src: ['respond.min.js'],
            dest: 'app/static/js/',
            filter: 'isFile'
          },
          {
            expand: true,
            cwd: 'bower_components/pdfmake/build/',
            src: ['pdfmake.min.js', 'vfs_fonts.js'],
            dest: 'app/static/js/datatables/',
            filter: 'isFile',
          },
        ]
      },
      dist: {
        files: [
          {
            expand: true,
            cwd: 'app/',
            src: ['index.html'],
            dest: 'dist/'
          },
          {
            expand: true,
            cwd: 'app/static/js/main/',
            src: ['main.min.js'],
            dest: 'dist/static/js/',
            rename: function (dest) {
              return dest + 'app.js';
            }
          },
          {
            expand: true,
            cwd: 'app/views/',
            src: ['**'],
            dest: 'dist/views/',
          },
          {
            expand: true,
            cwd: 'app/static/js/i18n/',
            src: ['*.json'],
            dest: 'dist/static/js/i18n/'
          },
          {
            expand: true,
            cwd: 'app/static/fonts/',
            src: ['**'],
            dest: 'dist/static/fonts/'
          }
        ]
      }
    },

    protractor_webdriver: {
      options: {
        path: 'node_modules/protractor/bin/',
        command: 'webdriver-manager start --standalone'
      },
      test: {},
      daemonize: {
        options: {
          keepAlive: true
        }
      }
    },

    webpack: require('./webpack.config.js'),

    watch: {
      options: {
        livereload: true
      },
      scripts: {
        files: 'app/scripts/**/*.js',
        tasks: ['concat', 'uglify'],
        options: {
          debounceDelay: 1000
        }
      },
      index: {
        files: 'app/index-template.html',
        tasks: ['preprocess:index']
      }
    },

    connect: {
      options: {
        port: basePort,
        hostname: 'localhost',
        base: 'app'
      },
      server: {},
      dist: {
        options: {
          base: {
            path: 'dist'
          }
        }
      },
      test: {
        options: {
          base: {
            path: 'app',
            options: {
              index: 'test.html',
              maxAge: 300000
            }
          },
          port: testPort
        }
      }
    },

    nggettext_extract: {
      pot: {
        files: {
          'i18n/template.pot': [
            'app/views/**/*.html',
            'app/scripts/components/**/*.html',
            'app/scripts/**/*.js',
          ]
        }
      },
    },

    po2json_angular_translate: {
      app: {
        options: {
          pretty: true
        },
        files: {
          'app/static/js/i18n/': ['i18n/*.po']
        }
      }
    },
    concat: {
      build: {
        src: [
          'app/scripts/class.js',
          'app/static/js/vendor-bundle.js',
          'app/static/js/datatables/pdfmake.min.js',
          'app/static/js/datatables/vfs_fonts.js',
          'app/static/js/index-bundle.js',
        ],
        dest: 'app/static/js/main/main.js'
      }
    },
    uglify: {
      options: {
        report: 'min',
        mangle: false
      },
      main: {
        files: {
          'app/static/js/main/main.min.js': ['app/static/js/main/main.js']
        }
      }
    },
    env: {
      dev: {
        NODE_ENV: 'DEVELOPMENT'
      },
      prod: {
        NODE_ENV: 'PRODUCTION'
      },
      test: {
        NODE_ENV: 'TEST',
        BROWSER: grunt.option('browser') || 'chrome'
      }
    },
    preprocess: {
      index: {
        src: 'app/index-template.html',
        dest: 'app/index.html'
      },
      test: {
        src: 'app/index-template.html',
        dest: 'app/test.html'
      }
    },
    protractor: {
      options: {
        configFile: "test/protractor.conf.js", // Default config file
        keepAlive: false, // If false, the grunt process stops when the test fails.
        noColor: false, // If true, protractor will not use colors in its output.
        args: {}
      },
      test: {
        options: {
          args: {
            baseUrl: 'http://localhost:' + testPort
          }
        }
      },
      fasttest: {
        options: {
          args: {
            baseUrl: 'http://localhost:' + testPort
          }
        }
      },
    },
    // server for testing purposes
    express: {
      options: {
        // Override defaults here
        background: true
      },
      test: {
        options: {
          background: true,
          script: 'test/server.js'
        }
      }
    }

  });

  grunt.registerTask('build', [
    'copy:main',
  ]);

  grunt.registerTask('run', [
    'po2json_angular_translate',
    'copy:main',
    'env:dev',
    'preprocess:index',
    'connect:server',
    'webpack:dev',
    'focus:dev'
  ]);

  grunt.registerTask('serve', ['connect',]);
  grunt.registerTask('default', ['run']);

  grunt.registerTask('prod', [
    'po2json_angular_translate',
    'copy:main',
    'env:prod',
    'preprocess:index',
    'connect:dist',
    'webpack:prod',
    'concat',
    'uglify',
    'copy:dist',
    'focus:prod'
  ]);

  grunt.registerTask('prodbatch', [
    'po2json_angular_translate',
    'copy:main',
    'env:prod',
    'preprocess:index',
    'webpack:prod',
    'concat',
    'uglify',
    'copy:dist',
  ]);

  // to run testing environment manually if needed. node server should be launched separately
  grunt.registerTask('runTest', [
    'copy:main',
    'env:test',
    'preprocess:test',
    'connect:test',
    'focus:dev'
  ]);

  // old test task
  grunt.registerTask('test', [
    'copy:main',
    'env:test',
    'preprocess:test',
    'connect:test',
    'express:test',
    'protractor:test'
  ]);
};
