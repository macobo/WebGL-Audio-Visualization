'use strict';

angular.module('audioVizApp', ['ngRoute', 'ngAnimate'])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        template: '<audio-viz scene-init="scene_init" render="render"></audio-viz>',
        controller: 'FirstViz',
        AnimName: 'Torus'
      })
	   .when('/angels', {
        template: '<audio-viz scene-init="scene_init" render="render"></audio-viz>',
        controller: 'SphereSpectrumViz',
        AnimName: 'Angels',
        resolve: {
          params: function() { return { step: 4 }; }
        }
      })
	   .when('/hedgehog', {
        template: '<audio-viz scene-init="scene_init" render="render"></audio-viz>',
        controller: 'SphereSpectrumViz',
        AnimName: 'Hedgehog',
        resolve: {
          params: function() { return { step: 6 }; }
        }
      })
	   .when('/lotus', {
        template: '<audio-viz scene-init="scene_init" render="render"></audio-viz>',
        controller: 'SphereSpectrumViz',
        AnimName: 'Lotus',
        resolve: {
          params: function() { return { step: 1 }; }
        }
      })
     .when('/terrain', {
        templateUrl: 'views/terrain.html',
        controller: 'Terrain',
        AnimName: 'Terrain'
      })
      .when('/particles', {
        template: '<audio-viz scene-init="scene_init" render="render"></audio-viz>',
        controller: 'Particles',
        AnimName: 'Particles'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
