'use strict';

angular.module('audioVizApp')
  .controller('MainController', function ($scope, AudioService, $route, $rootScope, $location) {
    $scope.audio = AudioService;

    var index = 0, routes = {}
    $scope.links = _.filter($route.routes, function(r, key) {
      r.href = key;
      if (r.AnimName) {
        r.index = ++index;
        routes[index] = r;
      }
      return r.AnimName;
    });

    $scope.isActive = function(r) {
      return $route.current && $route.current.AnimName === r.AnimName;
    };

    var next = function() {
      var i = ($route.current.index) % $scope.links.length + 1;
      return routes[i];
    };

    var prev = function() {
      var i = $route.current.index - 1;
      i = (i - 1 + $scope.links.length) % $scope.links.length + 1;
      return routes[i];
    };

    $rootScope.$on('$routeChangeSuccess', function (event, current) {
      $scope.current = current;
      $scope.next = next();
      $scope.prev = prev();
    });


  });
