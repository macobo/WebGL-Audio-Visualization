'use strict';

angular.module('audioVizApp', [])
  .config(function ($routeProvider) {
    var defTemplate = '<audio-viz scene-init="scene_init" render="render"></audio-viz>';

    $routeProvider
      .when('/', {
        template: defTemplate,
        controller: 'FirstViz'
      })
      .when('/bump', {
        template: defTemplate,
        controller: 'BumpMapCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
