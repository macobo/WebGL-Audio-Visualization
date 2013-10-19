'use strict';

angular.module('audioVizApp')
  .controller('MainController', function ($scope, AudioService) {
    $scope.audio = AudioService;
    $scope.eqData = function() {
      if (window.sound)
        return sound.eqData;
      else
        return [];
    }
  });
