'use strict';

angular.module('audioVizApp', [])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        template: '<audio-viz scene-init="scene_init" render="render"></audio-viz>',
        controller: 'FirstViz',
        AnimName: 'Torus'
      })
	   .when('/2', {
        template: '<audio-viz scene-init="scene_init" render="render"></audio-viz>',
        controller: 'HedgehogViz',
        AnimName: 'HedgeHog'
      })
     .when('/terrain', {
        templateUrl: 'views/terrain.html',
        controller: 'Terrain',
        AnimName: 'Terrain'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
