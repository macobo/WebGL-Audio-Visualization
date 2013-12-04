'use strict';

angular.module('audioVizApp')
  .controller('MainController', function ($scope, AudioService, $route) {
    $scope.audio = AudioService;

    $scope.links = _.filter($route.routes, function(r, key) {
      r.href = key;
      return r.AnimName;
    });

    $scope.isActive = function(r) {
      return $route.current && $route.current.AnimName === r.AnimName;
    };
  });
