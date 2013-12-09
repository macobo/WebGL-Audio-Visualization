'use strict';

angular.module('audioVizApp')
  .controller('Particles', function($scope, AudioService, Dancer) {
    $scope.Dancer = Dancer;
    var scene, camera, particleGroup, emitter;
    $scope.camera = {
      fov: 45,
      near: 1,
      far: 5000
    };

    $scope.scene_init = function(renderer, width, height) {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 10000);
      camera.position.z = 50;
      camera.lookAt( scene.position );
      renderer.setClearColor(0x000000);

      initParticles();
    };

    var randomColor = function() {
      // http://www.paulirish.com/2009/random-hex-color-code-snippets/
      return new THREE.Color('#'+Math.floor(Math.random()*16777215).toString(16));
    };

    function initParticles() {

      var group_settings = {
        texture: THREE.ImageUtils.loadTexture('/images/smokeparticle.png'),
        maxAge: 2
      };
      var emitter_settings = {
        position: new THREE.Vector3(0, 0, 0),

        acceleration: new THREE.Vector3(0, -10, 0),
        accelerationSpread: new THREE.Vector3( 10, 0, 10 ),

        velocity: new THREE.Vector3(0, 15, 0),
        velocitySpread: new THREE.Vector3(10, 7.5, 10),

        colorStart: new THREE.Color('white'),
        colorEnd: new THREE.Color('red'),
        size: 10,
        sizeEnd: 20,

        particlesPerSecond: 1000
      };

      particleGroup = new ShaderParticleGroup(group_settings);

      emitter = new ShaderParticleEmitter(emitter_settings);

      particleGroup.addEmitter( emitter );
      scene.add( particleGroup.mesh );

      setInterval(function() {
        emitter.colorEnd.setRGB(Math.random(), Math.random(), Math.random());
        //particleGroup.updateEmitter(emitter);
        console.log("update");
      },1000);
    }

    $scope.render = function(renderer, time_delta) {
      // var timer = new Date().getTime() * 0.0001;
      // camera.position.x = Math.cos(timer) * 800;
      // camera.position.z = Math.sin(timer) * 200;
      // camera.lookAt(scene.position);

      renderer.render(scene, camera);
      particleGroup.tick(time_delta / 1000);
    };
  });