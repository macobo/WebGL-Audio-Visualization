'use strict';

var _ = _;
_.repeat = function(value, times) {
  return _.map(_.range(times), function() {
    return value;
  });
};

angular.module('audioVizApp')
  .service('BeatDetector', function () {
    // service handling beat detection.
    // https://github.com/fichtitious/dancinglights/blob/master/public/src/pulser.js

    var bandCutPoints = [16, 64, 96, 106, 124, 138, 150, 192, 256]; // cut up the 0-255 refrequency range into bands
                                                               // (middle frequencies generally the most interesting)
    var energyHistoryLength = 32;

    var Band = function() {

      var self = this;

      self.beatNow = false; // the beat detection state variable

      // keep track of current and recent sound energies in this frequency band
      self.currentEnergy = 0.0;
      self.energyHistory = _.repeat(0.0, energyHistoryLength);

      // called by pulser.refresh() to push in the energy at one frequency in this band
      self.accumulate = function(energy) {
        self.currentEnergy += energy;
      };

      var beatHistoryLength = 16; // how many recent beats and non-beats to remember
      self.beatHistory = _.repeat(false, beatHistoryLength);

      // called by pulser.refresh()
      self.refresh = function() {
        // mean squares of recent energies
        var averageLocalEnergy = 0.0;
        for (var i = 0; i < energyHistoryLength; i++) {
          averageLocalEnergy += Math.pow(self.energyHistory[i], 2);
        }
        averageLocalEnergy /= energyHistoryLength;

        // mean squared differences of recent energies from local average
        var energyVariance = 0.0;
        for (var i = 0; i < energyHistoryLength; i++) {
          energyVariance += Math.pow(averageLocalEnergy - self.energyHistory[i], 2);
        }
        energyVariance /= energyHistoryLength;

        // a beat is detected if the current energy exceeds blah blah
        self.beatNow = self.currentEnergy > averageLocalEnergy * (-0.0025714 * energyVariance + 1.5142857);

        // push this beat into history
        self.beatHistory.shift();
        self.beatHistory.push(self.beatNow);

        // push current energy into history
        self.energyHistory.shift();
        self.energyHistory.push(self.currentEnergy);
        self.currentEnergy = 0.0;
      };

      // how interesting is this band?  not interesting at all if there were no recent beats.
      // favor bands with a medium number of recent beats.
      self.getInterestingness = function() {
        var numRecentBeats = 0;
        for (var i = 0; i < beatHistoryLength; i++) {
            numRecentBeats += self.beatHistory[i] ? 1 : 0;
        }
        return numRecentBeats == 0 ? 0 : (beatHistoryLength - Math.abs(beatHistoryLength / 2 - numRecentBeats));
      };

      // called by pulser.pulse() if this band is the most interesting
      self.beat = function() {
        return self.beatNow;
      };
    };

    var idxMostInterestingBand = 0; // tracks which band is the most interesting
    var bands = _.map(bandCutPoints, function() {
      return new Band();
    });

    var pulseHistory = _.repeat(false, 16);
    var maxRecentPulses = 12;

    // periodically recalculate which band is the most interesting
    // (constantly switching bands can make animation seem flustered)
    setInterval(function() {
      idxMostInterestingBand = 0;
      var maxInterestingness = 0;
      var interestingness = null;
      _.each(bands, function(band, index) {
        var interestingness = band.getInterestingness();
        if (interestingness > maxInterestingness) {
          idxMostInterestingBand = index;
          maxInterestingness = interestingness;
        }
        //console.log(_.last(band.energyHistory), index, interestingness);
      });

      //console.log(idxMostInterestingBand);
    }, 200);

    var service = {
      update: function(eqData) {
        // push new sound energies into each band, summing over the energies
        var bandIdx = 0;     // at all the frequencies belonging to the band
        var cutPoint = bandCutPoints[0];
        for (var i = 0; i < 256; i++) {
          if (i > cutPoint) {
            cutPoint = bandCutPoints[++bandIdx];
          }
          bands[bandIdx].accumulate(parseFloat(eqData[i]));
        }

        // refresh the bands' internal state
        _.each(bands, function(band) { band.refresh(); });
      },
      bands: function() { return bands; },
      pulse: function() {

        var beat = _.some(bands, function(band) {return band.beat();});
        var beat = bands[idxMostInterestingBand].beat(); // check whether there's a beat in the most interesting band
        var pulse = false;

        if (beat) {
          var numRecentPulses = 0;                           // count up the recent pulses and pulse
          for (var i = 0; i < pulseHistory.length; i++) { // if there haven't been too many
              numRecentPulses += pulseHistory[i] ? 1 : 0;
          }
          pulse = numRecentPulses <= maxRecentPulses;
        }

        pulseHistory.shift();
        pulseHistory.push(pulse);
        return _.some(_.last(pulseHistory, 4));
      }
    };
    return service;
  });