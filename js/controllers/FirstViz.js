'use strict';

angular.module('audioVizApp')
  .controller('FirstViz', function($scope, AudioService) {
    var scene, camera, cameraControls, composer;

    $scope.scene_init = function(renderer, width, height) {
      scene = new THREE.Scene();

      // put a camera in the scene
      camera  = new THREE.PerspectiveCamera(35, width / height, 1, 10000 );
      camera.position.set(0, 0, 5);
      scene.add(camera);
      // create a camera contol
      cameraControls  = new THREEx.DragPanControls(camera);

      // transparently support window resize
      THREEx.WindowResize.bind(renderer, camera);

      // here you add your objects
      // - you will most likely replace this part by your own
      var light = new THREE.AmbientLight( Math.random() * 0xffffff );
      scene.add( light );
      var light2 = new THREE.DirectionalLight( Math.random() * 0xffffff );
      light2.position.set( Math.random(), Math.random(), Math.random() ).normalize();
      scene.add( light2 );
      var light3 = new THREE.DirectionalLight( Math.random() * 0xffffff );
      light3.position.set( Math.random(), Math.random(), Math.random() ).normalize();
      scene.add( light3 );
      var light4 = new THREE.PointLight( Math.random() * 0xffffff );
      light4.position.set( Math.random()-0.5, Math.random()-0.5, Math.random()-0.5 )
            .normalize().multiplyScalar(1.2);
      scene.add( light4 );
      var light5 = new THREE.PointLight( Math.random() * 0xffffff );
      light5.position.set( Math.random()-0.5, Math.random()-0.5, Math.random()-0.5 )
            .normalize().multiplyScalar(1.2);
      scene.add( light5 );

      var geometry  = new THREE.TorusGeometry( 1, 0.42, 16, 16 );
      var material  = new THREE.MeshLambertMaterial({ambient: 0x808080, color: Math.random() * 0xffffff});
      var mesh  = new THREE.Mesh( geometry, material );
      scene.add( mesh );

      // define the stack of passes for postProcessing
      composer = new THREE.EffectComposer( renderer );
      renderer.autoClear = false;

      var renderModel = new THREE.RenderPass( scene, camera );
      composer.addPass( renderModel );

      var effectBloom = new THREE.BloomPass( 1.5 );
      composer.addPass( effectBloom );

      var effectScreen= new THREE.ShaderPass( THREE.ShaderExtras[ "screen" ] );
      effectScreen.renderToScreen = true;
      composer.addPass( effectScreen );
    };

    $scope.render = function(renderer) {
      // variable which is increase by Math.PI every seconds - usefull for animation
      var PIseconds = Date.now() * Math.PI;

      // update camera controls
      cameraControls.update();

      // animation of all objects
      for( var i = 0; i < scene.objects.length; i ++ ){
        scene.objects[ i ].rotation.y = PIseconds*0.0003 * (i % 2 ? 1 : -1);
        scene.objects[ i ].rotation.x = PIseconds*0.0002 * (i % 2 ? 1 : -1);
      }
      // animate DirectionalLight
      scene.lights.forEach(function(light, idx){
        if( light instanceof THREE.DirectionalLight === false ) return;
        var ang = 0.0005 * PIseconds * (idx % 2 ? 1 : -1);
        light.position.set(Math.cos(ang), Math.sin(ang), Math.cos(ang*2)).normalize();
      });
      // animate PointLights
      scene.lights.forEach(function(light, idx){
        if( light instanceof THREE.PointLight === false ) return;
        var angle = 0.0005 * PIseconds * (idx % 2 ? 1 : -1) + idx * Math.PI/3;
        light.position.set(Math.cos(angle)*3, Math.sin(angle*3)*2, Math.cos(angle*2)).normalize().multiplyScalar(2);
      });

      // actually render the scene
      renderer.clear();
      composer.render();
    };
  });