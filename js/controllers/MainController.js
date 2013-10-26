'use strict';

angular.module('audioVizApp')
  .controller('MainController', function ($scope, AudioService, BeatDetector, $interval) {
    $scope.audio = AudioService;
    $scope.BeatDetector = BeatDetector;

    $scope.bandValues = function() {
      var energies = _.map(BeatDetector.bands(), function(band) {
        return _.last(band.energyHistory);
      });
      return energies;
    };

    $interval(function() {
      $scope.isBeat = BeatDetector.pulse();
    }, 100);
  });
