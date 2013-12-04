'use strict';

angular.module('audioVizApp')
  .service('AudioService', function (PlaylistService) {

    return {
      spectrum: function() {
        var sound = PlaylistService.sound();
        if (sound) {
          return _.map(sound.eqData, function(el) { return parseFloat(el, 10); });
        } else {
          return [];
        }
      },
      volume: function() {
        var sound = PlaylistService.sound();

        return sound ? (sound.peakData.left + sound.peakData.right) / 2 : 0;
      }
    };
  });