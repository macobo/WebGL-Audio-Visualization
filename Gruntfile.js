"use strict";

var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // configurable paths
  var yeomanConfig = {
    app:  '.',
  };

  grunt.initConfig({
    yeoman: yeomanConfig,
    watch: {
      compass: {
        files: ['<%= yeoman.app %>/css/{,*/}*.{scss,sass}'],
        tasks: ['compass']
      },
      livereload: {
        files: [
          '{.tmp,<%= yeoman.app %>}/css/{,*/}*.css',
          '{.tmp,<%= yeoman.app %>}/js/**/*.js',
          '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
          '<%= yeoman.app %>/**/*.html'
        ],
        tasks: ['livereload']
      }
    },
    connect: {
      options: {
        port: 3456,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost'
      },
      livereload: {
        options: {
          middleware: function (connect) {
            return [
              lrSnippet,
              mountFolder(connect, '.tmp'),
              mountFolder(connect, yeomanConfig.app)
            ];
          }
        }
      }
    },
    open: {
      server: {
        url: 'http://localhost:<%= connect.options.port %>'
      }
    },
    compass: {
      options: {
        sassDir: '<%= yeoman.app %>/css',
        cssDir: '<%= yeoman.app %>/css',
        javascriptsDir: '<%= yeoman.app %>/js',
        importPath: '<%= yeoman.app %>/components',
        relativeAssets: true
      },
      server: {
        options: {
          debugInfo: true
        }
      }
    },
  });

  grunt.renameTask('regarde', 'watch');

  /////////  UNIT and END-TO-END TESTS  ////////

  // Development server with live reload
  grunt.registerTask('server', [
    'compass:server',
    'livereload-start',
    'connect:livereload',
    'open',
    'watch'
  ]);

  grunt.registerTask('default', ['server']);
};