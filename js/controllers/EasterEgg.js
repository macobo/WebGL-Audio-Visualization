'use strict';
/* global SPARKS */

var drift = function(base, distance) {
  var r = Math.random() * 2-1;
  return base + Math.floor(r * distance);
};

angular.module('audioVizApp')
  .controller('EasterEggCtrl', function($timeout, $scope, AudioService, Dancer, BeatCounter, CircularBuffer) {
    $scope.textMeasurements = {
      text: 'THANK YOU',
      font: '93px Verdana',
      width: 900,
      height: 100,
      depth: 20,
      displayTo: -300
    };

    $scope.particles = {
      GM: 100,
      box_size: 100,
      count: 75000,
      collapse: false
    };

    var canvas, coordinates, gravity_coordinates;
    function reinitText() {
      var pointsWithin = function(canvas) {
        var w = canvas.width,
            h = canvas.height,
            image_data = canvas.getContext('2d').getImageData(0, 0, w, h).data,
            result = [];
        //console.log(image_data.length, w*h);
        for (var x = 0; x < h; x++) {
          for (var y = 0; y < w; y++) {
            var i = (x*w+y)*4;
            if (image_data[i] || image_data[i+1] || image_data[i+2] || image_data[i+3])
              result.push([x, y]);
          }
        }
        return result;
      };

      canvas = (function(options) {
        options = options || $scope.textMeasurements;
        var canvas = document.createElement('canvas');//document.getElementById('easter-egg');
        canvas.height = options.height;
        canvas.width = options.width;
        canvas.depth = options.depth;
        var ctx = canvas.getContext('2d');
        ctx.textAlign="center";
        ctx.textBaseline = 'top';
        ctx.font = options.font;
        var text = options.text.split('').join(' ');
        //$("body").prepend($(canvas));
        ctx.fillText(text, options.width/2, 0);
        return canvas;
      })($scope.textMeasurements);
      
      coordinates = pointsWithin(canvas);
      gravity_coordinates = _.map(coordinates, function(p) {
        var x = p[0]-canvas.height/2,
            y = p[1]-canvas.width/2,
            z = (Math.random() - 0.5) * $scope.textMeasurements.depth;
        return new THREE.Vector3(y, x, z);
      });

      counter && counter.restore();
    }

    //reinitText();
    $scope.$watch('textMeasurements', reinitText, true);

    // particle engine stuff

    var composer;
    var scene, camera, attributes, uniforms, particleCloud, particles, Pool;
    var emitter, pointLight, counter, material;
    $scope.scene_init = function(renderer, width, height) {
      scene = new THREE.Scene();
      //camera = new THREE.PerspectiveCamera( 70, width / height, 1, 2000 );
      camera = new THREE.PerspectiveCamera( 60, width/height, 1, 2000 );
      
      camera.position.set( 0, 0, 500 );
      camera.lookAt( scene.position );

      // transparently support window resize
      //THREEx.WindowResize.bind(renderer, camera);

      var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
      directionalLight.position.set( 0, -1, 1 );
      directionalLight.position.normalize();
      scene.add( directionalLight );

      pointLight = new THREE.PointLight( 0xffffff, 2, 300 );
      pointLight.position.set( 0, 0, 0 );
      scene.add( pointLight );

      // Particle objects
      //initParticles();
      var a = prepareParticleGeometry($scope.particles.count);
      particleCloud = a.particleCloud;
      particleCloud.y = 800;
      attributes = a.attributes;
      uniforms = a.uniforms;
      particles = a.particles;
      Pool = a.Pool;
      material = a.shaderMaterial;

      scene.add(particleCloud);
      initEmitters();

      composer = new THREE.EffectComposer(renderer);
      renderer.autoClear = false;

      var renderModel = new THREE.RenderPass(scene, camera);
      composer.addPass(renderModel);

      var effectBloom = new THREE.BloomPass(1.5);
      composer.addPass(effectBloom);

      var effectScreen= new THREE.ShaderPass(THREE.ShaderExtras[ "screen" ]);
      effectScreen.renderToScreen = true;
      composer.addPass(effectScreen);
    };

    var initEmitters = function() {
      var vertices = particleCloud.geometry.vertices;
      var values_size = attributes.size.value;
      var values_color = attributes.pcolor.value;

      var hue = 0;

      var setTargetParticle = function() {
        var target = Pool.get();
        values_size[ target ] = Math.random() * 30 + 30;
        return target;
      };

      var onParticleCreated = function( p ) {
        var position = p.position;
        p.target.position = position;
        var target = p.target;

        if ( target ) {
          hue += 0.009 * 1.0;
          if ( hue > 1 ) hue -= 1;

          particles.vertices[ target ] = p.position;

          values_color[ target ].setHSL( hue, 0.6, 0.1 );
        }
        p.acceleration = new THREE.Vector3(30, 0, 0);
      };

      var onParticleDead = function( particle ) {
        var target = particle.target;
        if ( target ) {
          // Hide the particle
          attributes.pcolor.value[ target ].setRGB( 0, 0, 0 );
          particles.vertices[ target ].set( Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY );
          // Mark particle system as available by returning to pool
          Pool.add( particle.target );
        }
      };

      counter = new SPARKS.SteadyCounter(4000);
      emitter = new SPARKS.Emitter(counter);
      addInitializer(emitter, function(e, particle) {
        var position = new THREE.Vector3(
          drift(0, $scope.particles.box_size),
          drift(0, $scope.particles.box_size),
          drift(0, $scope.particles.box_size)
        );
        if (!gravity_coordinates.length) return;
        var a = false;
        while (particle.position.x > $scope.textMeasurements.displayTo || !a) {
          var i = Math.floor(Math.random() * gravity_coordinates.length);
          position = gravity_coordinates[i];
          particle.position.set(position.x, position.y, position.z);
          a = true;
        }
      });
      emitter.addInitializer( new SPARKS.Velocity( new SPARKS.PointZone(
        new THREE.Vector3(0, 0, 0) ) ) );

      emitter.addInitializer( new SPARKS.Lifetime( 0.5, 1 ));
      emitter.addInitializer( new SPARKS.Target( null, setTargetParticle ) );

      emitter.addAction( new SPARKS.Age() );

      addAction(emitter, function(e, particle) {
        if (!$scope.particles.collapse) return;
        var direction = particle.position.clone().normalize().negate().multiplyScalar(100);
        var acc = new THREE.Vector3(30, 0, 0);

        particle.acceleration = direction;
        if (counter.rate)
          counter.setRate(0);
        particle.lifetime = 30;
      });

      addAction(emitter, function(e, particle, time) {
        var acc = particle.acceleration;

        var v = particle.velocity;

        particle._oldvelocity.set(v.x, v.y, v.z);

        v.x += acc.x * time;
        v.y += acc.y * time;
        v.z += acc.z * time;
      });

      //emitter.addAction( new SPARKS.Accelerate( 0, 0, 50 ) );
      emitter.addAction( new SPARKS.Move() );
      emitter.addAction( new SPARKS.RandomDrift( 100, 100, 100 ) );

      emitter.addCallback( 'created', onParticleCreated );
      emitter.addCallback( 'dead', onParticleDead );
      emitter.start();
    };


    $scope.render = function(renderer, time_delta) {
      particleCloud.geometry.verticesNeedUpdate = true;

      attributes.size.needsUpdate = true;
      attributes.pcolor.needsUpdate = true;

      renderer.clear();
      //renderer.render(scene, camera);
      composer.render();
      if ($scope.textMeasurements.displayTo <  $scope.textMeasurements.width/2)
        $scope.textMeasurements.displayTo += 10;
    };

    $scope.$on('$destroy', function() {
      console.log(scene);
      particleCloud.geometry.dispose();
      material.dispose();
    });

    $(window).keypress(function(e) {
      console.log(e, e.keyCode);
      if (e.keyCode == 32) {
        console.log("Wohoo!");
        $scope.particles.collapse = true;
        setTimeout(function() {
          $scope.particles.collapse = false;
        }, 3000);
      }
    });
  });