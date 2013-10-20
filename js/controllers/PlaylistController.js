'use strict';

angular.module('audioVizApp')
  .controller('PlaylistController', function ($scope, PlaylistService) {
    $scope.service = PlaylistService;
    
    PlaylistService.load(12590847).then(function() {
      PlaylistService.play(0);
      $scope.tracks = PlaylistService.tracks();
    });


  });
