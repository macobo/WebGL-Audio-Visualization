'use strict';

/**
 * Wrapper around $timeout service to call the function in interval.
 * Preserves extra arguments
 */
angular.module('audioVizApp')
  .factory('$interval', function ($timeout) {
    var loops = {};
    var count = 0;

    // Arguments: [uuid, function, delay, function_arguments...]
    var loopFunction = function(uuid, f, delay) {
      var loopArgs = arguments;
      var funcArgs = Array.prototype.slice.apply(arguments, [3]);
      var timer = $timeout(function() {
        f.apply(f, funcArgs);
        loopFunction.apply(loopFunction, loopArgs);
      }, delay || 0);
      timer.uuid = uuid;
      loops[uuid] = timer;
      return timer;
    };

    var service = function() {
      var args = Array.prototype.slice.apply(arguments, [0]);
      var uuid = count++;
      args.unshift(uuid); // prepend uuid
      var timer = loopFunction.apply(loopFunction, args);
      timer.cancel = function() {
        service.cancel(timer);
      };
      return timer;
    };

    service.cancel = function(timer) {
      $timeout.cancel(loops[timer.uuid]);
    };
    return service;
  });
