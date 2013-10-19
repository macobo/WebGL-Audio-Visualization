'use strict';

angular.module('audioVizApp', [])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        template: '<audio-viz scene-init="scene_init" render="render"></audio-viz>',
        controller: 'FirstViz'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
