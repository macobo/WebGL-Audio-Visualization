angular.module('audioVizApp')
  .directive('slider', function () {
    return {
      template: '<div class="slider"><div class="title">{{name}}: {{model}}</div>'+
                '<div class="input"><input ng-model="model" type="range" min="{{from}}" max="{{to}}" step="{{step}}">'+
                '</div></div>',
      replace: true,
      restrict: 'E',
      scope: { from: '@', to: '@', step: '@', model: '=', name: '@' }
    };
  });