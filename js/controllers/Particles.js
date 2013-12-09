'use strict';
/* global SPARKS */

var updaterObject = function(updater_func, update_type) {
  var Obj = function() {
    this[update_type] = updater_func;
  };
  return new Obj();
};

var addInitializer = function(emitter, init_func) {
  emitter.addInitializer(updaterObject(init_func, 'initialize'));
};
var addAction = function(emitter, init_func) {
  emitter.addAction(updaterObject(init_func, 'update'));
};


angular.module('audioVizApp')
  .controller('Particles', function($scope, AudioService, Dancer) {
    $scope.Dancer = Dancer;

    $scope.camera = {
      fov: 45,
      near: 1,
      far: 5000
    };

    $scope.particles = {
      count: 75000
    };


    var scene, camera, attributes, uniforms, particleCloud, group, particles;
    var emitter, pointLight, emitter_position;
    $scope.scene_init = function(renderer, width, height) {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 2000 );
      camera.position.set( 0, 150, 400 );
      camera.lookAt( scene.position );
      renderer.setClearColor(0x000000);

      var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
      directionalLight.position.set( 0, -1, 1 );
      directionalLight.position.normalize();
      scene.add( directionalLight );

      pointLight = new THREE.PointLight( 0xffffff, 2, 300 );
      pointLight.position.set( 0, 0, 0 );
      scene.add( pointLight );

      // Particle objects
      initParticles();
      initEmitters();
    };

    var drift = function(base, distance) {
      var r = Math.random() * 2-1;
      return base + Math.floor(r * distance);
    }

    var initEmitters = function() {
      var vertices = particleCloud.geometry.vertices;
      var values_size = attributes.size.value;
      var values_color = attributes.pcolor.value;

      var hue = 0;

      var setTargetParticle = function() {
        var target = Pool.get();
        values_size[ target ] = Math.random() * 2000 + 100;
        return target;
      };

      var onParticleCreated = function( p ) {
        var position = p.position;
        p.target.position = position;
        var target = p.target;

        if ( target ) {
          hue += 0.003 * 1.0;
          if ( hue > 1 ) hue -= 1;

          particles.vertices[ target ] = p.position;

          values_color[ target ].setHSL( hue, 0.6, 0.1 );
        }
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

      var emitter_position = new THREE.Vector3(0, 0, 0);
      emitter = new SPARKS.Emitter(new RythmCounter());
      addInitializer(emitter, function(emitter, particle) {
        var pos = emitter_position;
        var x = drift(pos.x, 100),
            y = drift(pos.y, 100),
            z = drift(pos.z, 100);
        particle.position.set(x, y, z);
      });

      emitter.addInitializer( new SPARKS.Lifetime( 3, 5 ));
      emitter.addInitializer( new SPARKS.Target( null, setTargetParticle ) );
      addInitializer(emitter, function(e, particle) {
        var d = Dancer.is_beat ? 200 : 200;
        //values_size[particle.target] = Math.random() * d + 100;
      });


      emitter.addInitializer( new SPARKS.Velocity( new SPARKS.PointZone( new THREE.Vector3( 0, -5, 1 ) ) ) );
      // TOTRY Set velocity to move away from centroid

      emitter.addAction( new SPARKS.Age() );
      emitter.addAction( new SPARKS.Accelerate( 0, 0, -50 ) );
      emitter.addAction( new SPARKS.Move() );
      emitter.addAction( new SPARKS.RandomDrift( 10000, 1000, 20000 ) );

      emitter.addCallback( 'created', onParticleCreated );
      emitter.addCallback( 'dead', onParticleDead );
      emitter.start();
    };

    var RythmCounter = function() {
      this.leftover = 0;
      this.rate = 10;
      this.updateEmitter = function(emitter, time) {
        var rate = Dancer.is_beat ? 50 : 1;
        var targetRelease = time * rate + this.leftover;
        var actualRelease = Math.floor(targetRelease);

        this.leftover = targetRelease - actualRelease;

        return actualRelease;
      }
    };


    var initParticles = function() {
      // sets up three.js side of things, the passing of values to shader.
      particles = new THREE.Geometry();
      group = new THREE.Object3D();
      scene.add(group);
      for (var i = 0; i < $scope.particles.count; i++) {
        particles.vertices.push(new THREE.Vector3(0, 0, 0));
        Pool.add(i);
      }

      attributes = {
        size:  { type: 'f', value: [] },
        pcolor: { type: 'c', value: [] }
      };

      var sprite = generateSprite() ;

      var texture = new THREE.Texture( sprite );
      texture.needsUpdate = true;

      uniforms = {
        texture:   { type: 't', value: texture }
      };
      var shaderMaterial = new THREE.ShaderMaterial( {
        uniforms: uniforms,
        attributes: attributes,
        vertexShader: shaders.vertex,
        fragmentShader: shaders.fragment,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true
      });

      particleCloud = new THREE.ParticleSystem( particles, shaderMaterial );

      particleCloud.dynamic = true;

      var vertices = particleCloud.geometry.vertices;
      var values_size = attributes.size.value;
      var values_color = attributes.pcolor.value;

      for (var v = 0; v < vertices.length; v++) {
        values_size[ v ] = 50;
        values_color[ v ] = new THREE.Color( 0x000000 );
        particles.vertices[ v ].set( Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY );
      }

      group.add( particleCloud );
      particleCloud.y = 800;
    };


    $scope.render = function(renderer, time_delta) {
      particleCloud.geometry.verticesNeedUpdate = true;

      attributes.size.needsUpdate = true;
      attributes.pcolor.needsUpdate = true;
      renderer.render(scene, camera);
    };

    var shaders = {
      vertex: [,
        'attribute float size;',
        'attribute vec3 pcolor;',
        'varying vec3 vColor;',
        'void main() {',
          'vColor = pcolor;',
          'vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
          'gl_PointSize = size * ( 200.0 / length( mvPosition.xyz ) );',
          'gl_Position = projectionMatrix * mvPosition;',
        '}'
      ].join('\n'),
      fragment: [
        'uniform sampler2D texture;',
        'varying vec3 vColor;',
        'void main() {',
          'vec4 outColor = texture2D( texture, gl_PointCoord );',
          'gl_FragColor = outColor * vec4( vColor, 1.0 );',
       ' }'
      ].join('\n')
    };

    function generateSprite() {
      var canvas = document.createElement( 'canvas' );
      canvas.width = 128;
      canvas.height = 128;

      var context = canvas.getContext( '2d' );
      context.beginPath();
      context.arc( 64, 64, 60, 0, Math.PI * 2, false) ;

      context.lineWidth = 0.5; //0.05
      context.stroke();
      context.restore();

      var gradient = context.createRadialGradient( canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2 );

      gradient.addColorStop( 0, 'rgba(255,255,255,1)' );
      gradient.addColorStop( 0.2, 'rgba(255,255,255,1)' );
      gradient.addColorStop( 0.4, 'rgba(200,200,200,1)' );
      gradient.addColorStop( 1, 'rgba(0,0,0,1)' );

      context.fillStyle = gradient;

      context.fill();

      return canvas;

    }

    var Pool = {
      __pools: [],
      // Get a new Vector
      get: function() {
        if ( this.__pools.length > 0 ) {
          return this.__pools.pop();
        }
        console.error( "pool ran out!");
      },
      // Release a vector back into the pool
      add: function( v ) {
        this.__pools.push( v );
      }
    };
  });