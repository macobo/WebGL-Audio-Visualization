'use strict';

angular.module('audioVizApp')
  .service('AudioService', function (PlaylistService, Dancer) {

    return {
      spectrum: function() {
        var sound = PlaylistService.sound();
        if (sound) {
          return _.map(sound.eqData, function(el) { return parseFloat(el, 10); });
        } else {
          return [];
        }
        //return Dancer.spectrum();
      },
      waveform: function() {
        var sound = PlaylistService.sound();
        if (sound) {
          return sound.waveformData;
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