'use strict';

var _ = _;
_.repeat = function(value, times) {
  return _.map(_.range(times), function() {
    return value;
  });
};

angular.module('audioVizApp')
  .service('Dancer', function () {
    var SAMPLE_SIZE  = 1024,
        SAMPLE_RATE  = 44100,
        CONVERSION_COEFFICIENT = 0.93;
    var service = {
      frequency_range: [0, 50],
      treshold: 0.1,
      current_treshold: 0.1,
      decay: 0.02,
      decay_factor: 0.93,
      is_beat: false
    };

    var fft = new FFT(SAMPLE_SIZE, SAMPLE_RATE),
        signal = new Float32Array(SAMPLE_SIZE);

    service.update = function(sound) {
      var wave = sound.waveformData;
      for (var i = 0; i < wave.left.length; i++) {
        var avg = parseFloat(wave.left[i]) + parseFloat(wave.right[i]);
        signal[2*i] = avg * CONVERSION_COEFFICIENT;
        signal[2*i+1] = avg * CONVERSION_COEFFICIENT;
      }
      fft.forward(signal);
      updateIsBeat();
    };

    service.maxAmplitude = function(frequency_range) {
      var spectrum = fft.spectrum, max = 0;

      for ( var i = frequency_range[0], l = frequency_range[1]; i <= l; i++ ) {
        if ( spectrum[ i ] > max ) { max = spectrum[ i ]; }
      }
      return max;
    };

    service.spectrum = function() {
      return fft.spectrum;
    };

    var decay = function() {
      service.current_treshold *= service.decay_factor;
    };

    var updateIsBeat = function() {
      var magnitude = service.maxAmplitude(service.frequency_range);
      //console.log(service.is_beat, magnitude, service.treshold);
      if (magnitude >= service.current_treshold && magnitude >= service.treshold) {
        service.current_treshold = magnitude;
        service.is_beat = true;
      } else {
        //service.current_treshold -= service.decay;
        decay();
        service.is_beat = false;
      }
    };
    return service;
  });