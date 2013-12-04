'use strict';

angular.module('audioVizApp')
  .controller('SphereSpectrumViz', function($scope, AudioService, params) {
    var scene, camera, composer, sphere;
    var lights = [];
    var widthSegCount = 16;
    var heightSegCount = 18;
    var vertexCount = widthSegCount * heightSegCount;
    var initialPositionsSaved = false;
    var vertexChoiceStep = (params.step != undefined) ? params.step : 1;

    $scope.scene_init = function(renderer, width, height) {
      scene = new THREE.Scene();

      // put a camera in the scene
      camera  = new THREE.PerspectiveCamera(35, width / height, 1, 10000 );
      camera.position.set(0, 0, 5);
      scene.add(camera);

      // transparently support window resize
      THREEx.WindowResize.bind(renderer, camera);

      var ambientColor = (0.15) * 0xffffff;
      var light = new THREE.AmbientLight( ambientColor );
      scene.add( light );
      lights.push(light);
      
      var light4 = new THREE.DirectionalLight( Math.random() * 0.01 * ambientColor );
      light4.position.set( 0.0, 0.0, 1.0 ).normalize().multiplyScalar(1.2);
      scene.add( light4 );
      lights.push(light4);

      var light5 = new THREE.PointLight( 0xff0000 );
      light5.position.set( 1.0, 0.0, -1.0 ).normalize().multiplyScalar(1.2);
      scene.add( light5 );
      lights.push(light5);

      var geometry  = new THREE.SphereGeometry(1, widthSegCount, heightSegCount);
      var material  = new THREE.MeshLambertMaterial({ambient: 0x808080, color: 0xffffff}); //Math.max(Math.random()*0.2+0.2, 1.0) * 
      //material.shading = THREE.FlatShading;
      sphere  = new THREE.Mesh( geometry, material );
      sphere.scale.x = 0.2;
      sphere.scale.y = 0.2;
      sphere.scale.z = 0.2;
      sphere.position.y = 0.2;
      sphere.rotation.x = Math.PI;
      
      
      scene.add(sphere);
      // define the stack of passes for postProcessing
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
  
  var sum = function(array) {
    
    return _.reduce(array, function(a, b) { return a+b; }, 0);
  }
  
  var avg = function(array) {
  
    return 1.0 * sum(array) / array.length;
  }

  //This caused memory leaks if done every frame
  var currentPositionSpeed = new THREE.Vector3();
  var lightAngleDestination = 0.0;
  var lightAngleSpeed = 0.0;
  var lightAngle = 0.0;
  
    $scope.render = function(renderer) {
      // variable which is increase by Math.PI every seconds - usefull for animation
      var PIseconds = Date.now() * Math.PI;

      var spectrum = AudioService.spectrum();
      var spectrumPivot = spectrum.length / 3;
      var lowSpectrum = spectrum.slice(0, spectrumPivot);
      var highSpectrum = spectrum.slice(spectrumPivot, spectrum.length);

      var verticesPerSpectrum = spectrum.length / parseFloat(vertexCount);
      //console.log(spectrum.length + " / " + vertexCount + " = " + verticesPerSpectrum);
      var division = 3;
      var previousVertex;
      if (!initialPositionsSaved) {
        //Merge similar vertices in our mesh
        sphere.geometry.mergeVertices();
        vertexCount = sphere.geometry.vertices.length;

        //Add new properties of the geometry for our animation
        sphere.geometry.positionSpeed = [];
        sphere.geometry.initialVertices = [];
        
        for(var i = 0; i < vertexCount ; i++) { //Copy our initial positions
          sphere.geometry.initialVertices.push(sphere.geometry.vertices[i].clone());
        }

        initialPositionsSaved = true;
      }
      var lowIndex;
      var highIndex;

      for(var i = 1; i < vertexCount ; i += vertexChoiceStep) {
        lowIndex = i-vertexChoiceStep;
        highIndex = i;

        var lowPivot = lowIndex * verticesPerSpectrum;
        var highPivot = highIndex * verticesPerSpectrum;
        var spectrumSlice = spectrum.slice(lowPivot, highPivot);

        var vertexShift = ((spectrum.length > 0 && !isNaN(avg(spectrumSlice))) ? avg(spectrumSlice) / (0.1 + _.max(spectrumSlice)) : 0.0);
        var vertexPosition = sphere.geometry.vertices[highIndex];

        currentPositionSpeed.multiplyScalar(0.0);
        currentPositionSpeed.add(sphere.geometry.initialVertices[highIndex]);
        currentPositionSpeed.multiplyScalar(1.0 + 8.0 * vertexShift);
        currentPositionSpeed.sub(sphere.geometry.vertices[highIndex]);
        currentPositionSpeed.divideScalar(10.0 - vertexChoiceStep);
        
        sphere.geometry.positionSpeed[highIndex] = currentPositionSpeed; 
        sphere.geometry.vertices[highIndex].add(sphere.geometry.positionSpeed[highIndex]);
        
        sphere.geometry.verticesNeedUpdate = true;
        sphere.geometry.normalsNeedUpdate = true;
      }
      sphere.rotation.y += (!isNaN(avg(spectrum)) ? (avg(spectrum)) : 0.0);
      sphere.geometry.__dirtyVertices = true;

      //Animate all lights in one cycle
      lights.forEach(function(light, idx){
        if(light instanceof THREE.PointLight) {
          var spectrumLowSlice = spectrum.slice(spectrum.length - spectrumPivot, spectrum.length);
          var spectrumLowVal = (avg(spectrumLowSlice)) / (_.max(spectrumLowSlice) + 0.1);
          lightAngleDestination = (!isNaN(spectrumLowVal)) ? spectrumLowVal * 10.0 : 0.0;
          lightAngleSpeed = (lightAngleDestination - lightAngle);
          lightAngleSpeed /= 4.0;
          lightAngleSpeed = Math.min(Math.max(lightAngleSpeed, -0.4), 0.4); 
         
          lightAngle += lightAngleSpeed;

          light.position.set(Math.cos(lightAngle), 0.0, Math.sin(lightAngle)).normalize().multiplyScalar(2);
        } else if(light instanceof THREE.DirectionalLight) {

        }
      });

    // actually render the scene
    renderer.clear();
    composer.render();
  };
});