angular.module('audioVizApp')
  .directive('audioViz', function (AudioService, $route) {
    var renderer, stats, scene;

    var linker = function(scope, element, attrs) {
      var startRoute = $route.current;
      var clock = new THREE.Clock();
      var animationLoop = function() {
        // loop on request animation loop
        // - it has to be at the begining of the function
        // - see details at http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
        if (startRoute.$$hashKey != $route.current.$$hashKey) return;
        requestAnimationFrame( animationLoop );

        // do the render
        var d = clock.getDelta() * 1000; 
        scope.render(renderer, d);

        // update stats
        stats.update();
      };

      if( Detector.webgl ){
        renderer = new THREE.WebGLRenderer({
          antialias   : true, // to get smoother output
          preserveDrawingBuffer : true  // to allow screenshot
        });
      } else {
        Detector.addGetWebGLMessage();
        return true;
      }
      renderer.setSize( element.width(), element.height() );
      element.append(renderer.domElement);

      // add Stats.js - https://github.com/mrdoob/stats.js
      stats = new Stats();
      stats.domElement.style.position = 'absolute';
      stats.domElement.style.top  = '0px';
      stats.domElement.style.left = '0px';
      element.append( stats.domElement );


      // allow 'p' to make screenshot
      THREEx.Screenshot.bindKey(renderer);
      // allow 'f' to go fullscreen where this feature is supported
      if( THREEx.FullScreen.available() ){
        THREEx.FullScreen.bindKey();
      }
      
      //This is a hack to re-init the scene. 
      //http://stackoverflow.com/questions/11504320/why-does-re-initializing-the-webgl-context-break-my-usage-of-three-effectcompose
      THREE.EffectComposer.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
      THREE.EffectComposer.quad = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2 ), null );
      THREE.EffectComposer.scene = new THREE.Scene();
      THREE.EffectComposer.scene.add( THREE.EffectComposer.quad );
      
      scope.sceneInit(renderer, element.width(), element.height());
      animationLoop();
    };

    return {
      template: '<div class="container"></div>',
      replace: true,
      restrict: 'E',
      // scene_init(renderer, width, height)
      // render(renderer)
      scope: { sceneInit: '=', render: '=' },
      link: linker
    };
  });