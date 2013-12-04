'use strict';

angular.module('audioVizApp')
  .controller('Terrain', function($scope, AudioService) {
    var scene, camera, cameraControls, composer, mesh;

    $scope.camera = {
      fov: 45,
      near: 1,
      far: 5000
    };
    $scope.modelOpts = {
      size: 64
    };

    $scope.scene_init = function(renderer, width, height) {
      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera($scope.camera.fov, width / height,
        $scope.camera.near, $scope.camera.far);
      camera.position.y = 400;
      setupLights();

      composer = new THREE.EffectComposer( renderer );
      renderer.autoClear = false;
    
      $scope.model = generateTerrain(64, 64, 1);
      $scope.update($scope.model, 200);
      console.log(mesh);
    };

    function setupLights() {
      var ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
      scene.add(ambientLight);

      var mainLight = new THREE.SpotLight(0xffffff, 1.0);
      mainLight.position.set(500, 500, 500);
      mainLight.castShadow = true;
      scene.add(mainLight);

      var auxLight = new THREE.SpotLight(0xffffff, 1.0);
      auxLight.position.set(-300, 500, -400);
      auxLight.castShadow = true;
      scene.add(auxLight);
    }

    function drawCoordinate(center, length) {
      var othorgonals = [
        [new THREE.Vector3(length, 0, 0), 0xff0000],
        [new THREE.Vector3(0, length, 0), 0x00ff00],
        [new THREE.Vector3(0, 0, length), 0x0000ff]
      ];

      _.each(othorgonals, function(p) {
        var v = p[0];
        var color = p[1];

        var geometry = new THREE.Geometry();

        geometry.vertices.push(new THREE.Vertex(center));
        geometry.vertices.push(new THREE.Vertex(center.clone().addSelf(v)));
        var material = new THREE.LineBasicMaterial({
          color: color,
          opacity: 1,
          linewidth: 3
        });

        var line = new THREE.Line(geometry, material);

        scene.add(line);
      });
    }

    $scope.update = function(model, zScale) {
      scene.remove(mesh);
      mesh = getTerrainMesh(model, zScale);
      scene.add(mesh);
    };
  
    $scope.render = function(renderer) {
      var timer = new Date().getTime() * 0.0001;
      camera.position.x = Math.cos(timer) * 800;
      camera.position.z = Math.sin(timer) * 800;
      camera.lookAt(scene.position);

      renderer.clear();
      renderer.render(scene, camera);
      //composer.render();
    };

    console.log($scope.model);
  });