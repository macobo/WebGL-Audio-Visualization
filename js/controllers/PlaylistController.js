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
      PlaylistService.play(index, {onfinish: $scope.nextTrack});
      $scope.current_track = $scope.tracks[index];
      $scope.current_index = index;
    };

    $scope.nextTrack = function() {
      $scope.setTrack(($scope.current_index + 1) % $scope.tracks.length);
    };
  });
