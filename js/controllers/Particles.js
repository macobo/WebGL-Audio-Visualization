'use strict';
/* global SPARKS */

(function() {
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

  var PoolCreator = function() {
    return {
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
  };

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

  // returns an object { particleCloud, attributes, uniforms, particles }
  var prepareParticleGeometry = function(particle_count) {
    // sets up three.js side of things, the passing of values to shader.
    var particles = new THREE.Geometry();
    var Pool = new PoolCreator();
    for (var i = 0; i < particle_count; i++) {
      particles.vertices.push(new THREE.Vector3(0, 0, 0));
      Pool.add(i);
    }

    var attributes = {
      size:  { type: 'f', value: [] },
      pcolor: { type: 'c', value: [] }
    };

    var sprite = generateSprite() ;

    var texture = new THREE.Texture( sprite );
    texture.needsUpdate = true;

    var uniforms = {
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

    var particleCloud = new THREE.ParticleSystem( particles, shaderMaterial );

    particleCloud.dynamic = true;

    var vertices = particleCloud.geometry.vertices;
    var values_size = attributes.size.value;
    var values_color = attributes.pcolor.value;

    for (var v = 0; v < vertices.length; v++) {
      values_size[ v ] = 50;
      values_color[ v ] = new THREE.Color( 0x000000 );
      particles.vertices[ v ].set( Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY );
    }

    return {
      attributes: attributes,
      uniforms: uniforms,
      particleCloud: particleCloud,
      particles: particles,
      Pool: Pool,
      shaderMaterial: shaderMaterial
    };
  };

  window.prepareParticleGeometry = prepareParticleGeometry;
  window.addAction = addAction;
  window.addInitializer = addInitializer;
})();

angular.module('audioVizApp')
  .service('BeatCounter', function(Dancer) {
    return function(length) {
      var cache = {}, at = 0, count = 0, done = false;
      var result = {};
      result.tick = function() {
        var beat = Dancer.is_beat;
        if (beat) count++;
        if (done && cache[at])
          count--;
        cache[at] = Dancer.is_beat;
        at = (at+1) % length;
        done = done || (at == 0);
      };
      result.count = function() {
        return count;
      };
      result.percentage = function() {
        if (!done) return count / at;
        return count / length;
      };

      return result;
    };
  })
  .controller('Particles', function($scope, AudioService, Dancer, BeatCounter) {
    $scope.Dancer = Dancer;

    $scope.camera = {
      fov: 45,
      near: 1,
      far: 5000
    };

    $scope.particles = {
      count: 75000
    };

    var composer;
    var scene, camera, attributes, uniforms, particleCloud, particles, Pool, beat_counter;
    var emitter, pointLight, emitter_position, material;
    $scope.scene_init = function(renderer, width, height) {
      beat_counter = BeatCounter(60);
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 2000 );
      camera.position.set( 0, 1000, 400 );
      camera.lookAt( scene.position );
      renderer.setClearColor(0x000000);


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

    var drift = function(base, distance) {
      var r = Math.random() * 2-1;
      return base + Math.floor(r * distance);
    };

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
          hue += 0.009 * 1.0;
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

      emitter.addInitializer( new SPARKS.Lifetime( 3, 10 ));
      emitter.addInitializer( new SPARKS.Target( null, setTargetParticle ) );
      addInitializer(emitter, function(e, particle) {
        var d = Dancer.is_beat ? 200 : 200;
        //values_size[particle.target] = Math.random() * d + 100;
        var drift = new THREE.Vector3(1000, 1000, 1000);
        particle.acceleration = new THREE.Vector3(
          2*(Math.random() - 0.5), 2*(Math.random() - 0.5), 2*(Math.random() - 0.5)
        );
        particle.acceleration.multiply(drift);
      });


      emitter.addInitializer( new SPARKS.Velocity(
        new SPARKS.PointZone( new THREE.Vector3( 0, -5, 1 ) ) ) );
      // TOTRY Set velocity to move away from centroid

      emitter.addAction( new SPARKS.Age() );
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
      addAction(emitter, function(e, particle, time) {
        var p = beat_counter.percentage(),
            v = particle.velocity,
            new_speed = Math.pow(p, 0.8) * 3000 + 100;
        v.setLength(new_speed);
      });
      emitter.addAction( new SPARKS.RandomDrift( 100, 100, 100 ) );

      emitter.addCallback( 'created', onParticleCreated );
      emitter.addCallback( 'dead', onParticleDead );
      emitter.start();
    };

    var RythmCounter = function() {
      this.leftover = 0;
      this.rate = 10;
      this.updateEmitter = function(emitter, time) {
        var rate = beat_counter.percentage() * 80 + 3;
        if (Dancer.is_beat) rate += 90;
        var targetRelease = time * rate + this.leftover;
        var actualRelease = Math.floor(targetRelease);

        this.leftover = targetRelease - actualRelease;
        return actualRelease;
      };
    };


    $scope.render = function(renderer, time_delta) {
      beat_counter.tick();

      particleCloud.geometry.verticesNeedUpdate = true;

      attributes.size.needsUpdate = true;
      attributes.pcolor.needsUpdate = true;

      renderer.clear();
      //renderer.render(scene, camera);
      composer.render();
    };

    $scope.$on('$destroy', function() {
      console.log(scene);
      particleCloud.geometry.dispose();
      material.dispose();
    });
  });