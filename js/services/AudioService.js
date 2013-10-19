'use strict';

angular.module('audioVizApp')
  .service('AudioService', function () {
    var audio_context = (function() {
      if (!window.AudioContext) {
        if (!window.webkitAudioContext) {
          alert("Sorry, your browser is not supported.");
          return;
        }
        window.AudioContext = window.webkitAudioContext;
      }
      return new window.AudioContext();
    })();
    var audio = new Audio(audio_context);
    var source = new InputAudioSource(audio_context);
    var model = new SpectrumAnalyzer(audio);

    audio.source = source;

    model.play();

    return {
      "audio": audio,
      "model": model,
      "spectrum": function() {
        return model.data;
      },
      "mono": function() {
        return audio.mono;
      }
    };
  });