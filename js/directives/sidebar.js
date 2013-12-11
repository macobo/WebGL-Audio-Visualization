angular.module('audioVizApp')
  .directive('sidebar', function () {
    var linker = function(scope, element, attrs) {
      scope.canClose = _.has(attrs, "closable");
      scope.toggle = function() {
        scope.isclosed = !scope.isclosed;
      };
    };
    return {
      template: '<div class="sidebar side-buttons-container">' +
                  '<div class="content box" ng-transclude ng-hide="isclosed"">' +
                  '</div>' +
                  '<div class="button toggle">' +
                    '<a ng-click="toggle()" href="" ng-show="canClose && !isclosed">hide sidebar</a>' +
                    '<a ng-click="toggle()" href="" ng-hide="canClose && !isclosed">show sidebar</a>' +
                  '</div>' +
                '</div>',
      restrict: 'E',
      transclude: true,
      replace: true,
      link: linker
    };
  });