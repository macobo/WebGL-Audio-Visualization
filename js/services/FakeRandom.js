'use strict';

angular.module('audioVizApp')
  .service('FakeRandom', function() {
    var random = Math.random;
    var new_random = function() {
      var cache = [], at = 0;

      var service = {
        next: function() {
          var r;
          if (at >= cache.length) {
            r = random();
            cache.push(r);
          } else {
            r = cache[at];
          }
          at++;
          return r;
        },
        seek: function(pos) { at = pos; },
        realRandom: random,
        cache: cache
      };
      return service;
    };
    return { new: new_random };
  })
  .service('CircularBuffer', function() {
    return function(data) {
      this.data = data || [];

      this.position = 0;
      this.next = function() {
        var result = this.data[this.position];
        this.position = (this.position + 1) % this.data.length;
        return result;
      };
    };
  });