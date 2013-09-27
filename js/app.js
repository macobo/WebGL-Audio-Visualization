'use strict';

angular.module('audioVizApp', [])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
      })
      .otherwise({
        redirectTo: '/'
      });
  });
