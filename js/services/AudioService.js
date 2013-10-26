'use strict';

angular.module('audioVizApp')
  .service('AudioService', function (PlaylistService, BeatDetector) {

    var bands = BeatDetector.bands();

    var service = {
      spectrum: function() {
        var sound = PlaylistService.sound();
        if (sound) {
          return _.map(sound.eqData, function(el) { return parseFloat(el, 10); });
        } else {
          return [];
        }
      },
      bands: function() {
        return bands;
      }
    };
    return service;
  });