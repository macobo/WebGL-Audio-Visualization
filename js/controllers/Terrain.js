'use strict';

_.sum = function(arr) { return _.reduce(arr, function(a, b) { return a+b; }, 0); };
_.average = function(arr) { return _.sum(arr) / arr.length; };

angular.module('audioVizApp')
  .service('TerrainModel', function(FakeRandom) {
    function createModel(options, random_function) {
      options.size = options.size || 64;
      options.smoothness = options.smoothness || 1.0;
      options.zScale = options.zScale || 200;
      return generateTerrain(options.size, options.size, options.smoothness, random_function);
    }

    function modifyMesh(mesh, size, f) {
      mesh.geometry.verticesNeedUpdate = true;
      var vertices = mesh.geometry.vertices;
      for (var i = 0; i < size; ++i) {
        for (var j = 0; j < size; ++j) {
          vertices[i * size + j].z = f(i, j);
        }
      }
      return mesh;
    }

    var constructor = function(options) {
      options = angular.copy(options);
      var randomGen = FakeRandom.new();
      var model = createModel(options, randomGen.next);
      var blank_mesh = getTerrainMesh(model, options.zScale);

      var service = {};
      service.update = function(new_options) {
        randomGen.seek(0);
        model = createModel(new_options, randomGen.next);
        if (new_options.size != options.size) {
          console.log("new mesh!", model.length);
          blank_mesh = getTerrainMesh(model, new_options.zScale);
        }
      };
      service.getMesh = function(zScale) {
        modifyMesh(blank_mesh, model.length, function(i, j) {
          return model[i][j] * zScale;
        } );
        return blank_mesh;
      };

      return service;
    };
    return { new: constructor };
  })

  .controller('Terrain', function($scope, AudioService, TerrainModel) {
    var scene, camera, cameraControls, composer, mesh;
    $scope.camera = {
      fov: 45,
      near: 1,
      far: 5000
    };
    $scope.modelOpts = {
      size: 64,
      smoothness: 1.0,
      zScale: 200
    };

    $scope.scene_init = function(renderer, width, height) {
      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera($scope.camera.fov, width / height,
        $scope.camera.near, $scope.camera.far);
      camera.position.y = 400;  
      setupLights();

      composer = new THREE.EffectComposer( renderer );
      renderer.autoClear = false;
      console.log(TerrainModel);
      $scope.model = TerrainModel.new($scope.modelOpts);
      mesh = $scope.model.getMesh($scope.modelOpts.zScale);
      scene.add(mesh);
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
  
    $scope.render = function(renderer) {
      var timer = new Date().getTime() * 0.0001;
      camera.position.x = Math.cos(timer) * 800;
      camera.position.z = Math.sin(timer) * 800;
      camera.lookAt(scene.position);

      $scope.modelOpts.zScale = Math.min(2000, 2000 * AudioService.volume());

      renderer.clear();
      renderer.render(scene, camera);
    };

    $scope.$watch('modelOpts', function(newOpt) {
      console.log(newOpt, mesh, AudioService.volume());
      $scope.model.update(newOpt);
      scene.remove(mesh);
      mesh = $scope.model.getMesh(newOpt.zScale);
      scene.add(mesh);
    }, true);
  });