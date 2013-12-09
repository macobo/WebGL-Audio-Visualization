'use strict';
/* global SPARKS */

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

    var Pool = {
      __pools: [],
      // Get a new Vector
      get: function() {
        if ( this.__pools.length > 0 ) {
          return this.__pools.pop();
        }
        console.log( "pool ran out!" )
        return null;
      },
      // Release a vector back into the pool
      add: function( v ) {
        this.__pools.push( v );
      }
    };


    var scene, camera, attributes, uniforms, particleCloud, group, particles;
    var emitter, pointLight;
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

    var initEmitters = function() {
      var vertices = particleCloud.geometry.vertices;
      var values_size = attributes.size.value;
      var values_color = attributes.pcolor.value;


      var hue = 0, timeOnShapePath = 0;

      var setTargetParticle = function() {

        var target = Pool.get();
        values_size[ target ] = Math.random() * 200 + 100;

        return target;

      };

      var onParticleCreated = function( p ) {

        var position = p.position;
        p.target.position = position;

        var target = p.target;

        if ( target ) {

          // console.log(target,particles.vertices[target]);
          // values_size[target]
          // values_color[target]

          hue += 0.0003 * 1.0;
          if ( hue > 1 ) hue -= 1;

          particles.vertices[ target ] = p.position;

          values_color[ target ].setHSL( hue, 0.6, 0.1 );

          pointLight.color.setHSL( hue, 0.8, 0.5 );
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

      var start_position = new THREE.Vector3(0, 0, 0);
      emitter = new SPARKS.Emitter(new SPARKS.SteadyCounter(50));
      emitter.addInitializer( new SPARKS.Position( new SPARKS.PointZone(start_position) ) );
      emitter.addInitializer( new SPARKS.Lifetime( 1, 15 ));
      emitter.addInitializer( new SPARKS.Target( null, setTargetParticle ) );


      emitter.addInitializer( new SPARKS.Velocity( new SPARKS.PointZone( new THREE.Vector3( 0, -5, 1 ) ) ) );
      // TOTRY Set velocity to move away from centroid

      emitter.addAction( new SPARKS.Age() );
      emitter.addAction( new SPARKS.Accelerate( 0, 0, -50 ) );
      emitter.addAction( new SPARKS.Move() );
      emitter.addAction( new SPARKS.RandomDrift( 90, 100, 2000 ) );

      emitter.addCallback( "created", onParticleCreated );
      emitter.addCallback( "dead", onParticleDead );
      emitter.start();
    };

    var initParticles = function() {
      particles = new THREE.Geometry();
      group = new THREE.Object3D();
      scene.add(group);
      for (var i = 0; i < $scope.particles.count; i++) {
        var x = Math.random() * 200 - 100;
        var y = Math.random() * 100 + 150;
        var z = Math.random() * 50;
        particles.vertices.push(new THREE.Vector3(x, y, z));
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


      // Just a square, doesnt work too bad with blur pp.
      // context.fillStyle = "white";
      // context.strokeStyle = "white";
      // context.fillRect(0, 0, 63, 63) ;

      // Heart Shapes are not too pretty here
      // var x = 4, y = 0;
      // context.save();
      // context.scale(8, 8); // Scale so canvas render can redraw within bounds
      // context.beginPath();
      // context.bezierCurveTo( x + 2.5, y + 2.5, x + 2.0, y, x, y );
      // context.bezierCurveTo( x - 3.0, y, x - 3.0, y + 3.5,x - 3.0,y + 3.5 );
      // context.bezierCurveTo( x - 3.0, y + 5.5, x - 1.0, y + 7.7, x + 2.5, y + 9.5 );
      // context.bezierCurveTo( x + 6.0, y + 7.7, x + 8.0, y + 5.5, x + 8.0, y + 3.5 );
      // context.bezierCurveTo( x + 8.0, y + 3.5, x + 8.0, y, x + 5.0, y );
      // context.bezierCurveTo( x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5 );

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
  });