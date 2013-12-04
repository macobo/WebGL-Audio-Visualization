'use strict';

angular.module('audioVizApp')
  .service('FakeRandom', function() {
    var random = Math.random();
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
      use: function() { Math.random = service.next; },
      unhook: function() { Math.random = random; },
      reset: function() { at = 0; cache = []; },
      restart: function() { at = 0; }
    };
    return service;
  });