'use strict';

angular.module('audioVizApp')
  .controller('MainController', function ($scope, AudioService) {
    $scope.audio = AudioService;
  });
