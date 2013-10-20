'use strict';

angular.module('audioVizApp')
  .controller('PlaylistController', function ($scope, PlaylistService) {
    $scope.service = PlaylistService;

    PlaylistService.load(12590847).then(function() {
      $scope.tracks = PlaylistService.tracks();
      $scope.setTrack(0);
    });

    $scope.setTrack = function(index) {
      PlaylistService.stop();
      PlaylistService.play(index);
      $scope.current_track = $scope.tracks[index];
    };
  });
