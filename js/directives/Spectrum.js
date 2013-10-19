angular.module('audioVizApp')
  .directive('spectrum', function ($interval) {
    var draw = function(ctx, data, maxValue, width, height) {
      ctx.fillStyle = ctx.strokeStyle = '#509';
      ctx.beginPath();
      ctx.clearRect(0, 0, 1000, 1000);
      ctx.moveTo(0, height);
      for (var i = 0; i < data.length; i++) {
        var h = Math.round(1.0 * data[i] / maxValue * height);
        var w = 1.0 * i * width / data.length;
        ctx.lineTo(w, height-h);
      }
      ctx.lineTo(width, height);
      ctx.fill();
    };

    var linker = function(scope, element, attrs) {
      var delay = parseFloat(attrs.delay) || 200;
      var maxValue = 0;
      var canvas = element.find('canvas');
      var ctx = canvas[0].getContext('2d');

      $interval(function() {
        //console.log(scope.data(), canvas);
        var data = scope.data();
        maxValue = _.max([maxValue, _.max(data)]);
        draw(ctx, scope.data(), maxValue, canvas.width(), canvas.height());
      }, delay);
    };

    return {
      template: '<canvas></canvas>',
      restrict: 'E',
      scope: { data: '&' },
      link: linker
    };
  });