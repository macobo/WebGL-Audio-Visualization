'use strict';

angular.module('audioVizApp')
  .controller('HedgehogViz', function($scope, AudioService) {
    var scene, camera, cameraControls, composer, sphere;
    var widthSegCount = 16;
    var heightSegCount = 18;
    var vertexCount = widthSegCount * heightSegCount;
    var initialPositionsSaved = false;

    $scope.scene_init = function(renderer, width, height) {
      scene = new THREE.Scene();

      // put a camera in the scene
      camera  = new THREE.PerspectiveCamera(35, width / height, 1, 10000 );
      camera.position.set(0, 0, 5);
      scene.add(camera);
      // create a camera contol
      //cameraControls  = new THREEx.DragPanControls(camera);

      // transparently support window resize
      THREEx.WindowResize.bind(renderer, camera);

      var light = new THREE.AmbientLight( (Math.random()*0.4 + 0.3) * 0xffffff );
      scene.add( light );

      var light5 = new THREE.PointLight( 0xff0000 );
      light5.position.set( 1.0, 0.0, -1.0 ).normalize().multiplyScalar(1.2);
      scene.add( light5 );

      var geometry  = new THREE.SphereGeometry(1, widthSegCount, heightSegCount);
      geometry.dynamic = true;
      var material  = new THREE.MeshLambertMaterial({ambient: 0x808080, color: Math.max(Math.random()*0.2+0.2, 1.0) * 0xffffff});
      var mesh  = new THREE.Mesh( geometry, material );
      mesh.dynamic = true;
      mesh.scale.x = 0.2;
      mesh.scale.y = 0.2;
      mesh.scale.z = 0.2;

      window.sphere = mesh;
      
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

      //var sphere = scene.objects[0];
      vertexCount = sphere.geometry.vertices.length;


      var verticesPerSpectrum = spectrum.length / parseFloat(vertexCount);
      //console.log(spectrum.length + " / " + vertexCount + " = " + verticesPerSpectrum);
      var division = 3;
      var previousVertex;
      if (!initialPositionsSaved) {
        for(var i = 0; i < vertexCount ; i++) {
          //var initialPosition = new THREE.Vector3();
          //initialPosition.addSelf();
          sphere.geometry.vertices[i].initialPosition = sphere.geometry.vertices[i].position.clone(); //initialPosition;
          //console.log("Extra vertices: " + Math.abs((widthSegCount * heightSegCount) - sphere.geometry.vertices.length));
          if (
            previousVertex != undefined &&   
            sphere.geometry.vertices[i].position.x == previousVertex.position.x && 
            sphere.geometry.vertices[i].position.y == previousVertex.position.y && 
            sphere.geometry.vertices[i].position.z == previousVertex.position.z
          ) {
            
            
          }
          if (
            previousVertex != undefined && 
            Math.abs(sphere.geometry.vertices[i].position.x - previousVertex.position.x) < 0.001 && 
            Math.abs(sphere.geometry.vertices[i].position.y - previousVertex.position.y) < 0.001 && 
            Math.abs(sphere.geometry.vertices[i].position.z - previousVertex.position.z) < 0.001
          ) {
            //console.log(i);
            //console.log(sphere.geometry.vertices[i].position.x - previousVertex.position.x);
            //console.log(Math.abs(sphere.geometry.vertices[i].position.x - previousVertex.position.x));
            //sphere.geometry.vertices[i].position.x = Math.random() * 2.0;
            sphere.geometry.vertices[i] = previousVertex;
            //Assigning references to vertices in the same position does not work for fixing the hole in the mesh :/
          }
          previousVertex = sphere.geometry.vertices[i];
        }
        initialPositionsSaved = true;
      }
      var lowIndex;
      var highIndex;

      for(var i = 1; i < vertexCount ; i++) {
        //These will fix holes in the top and bottom
        if (i <= widthSegCount) {
          lowIndex = 0;
          highIndex = widthSegCount;
          //console.log("start: " + lowIndex + " - " + highIndex);
        } else if(i >= vertexCount - heightSegCount) {
          lowIndex = vertexCount - heightSegCount;
          highIndex = vertexCount - 1;
          //console.log("end: " + lowIndex + " - " + highIndex);
        } else {
          lowIndex = i-1;
          highIndex = i;
        }

        var lowPivot = lowIndex * verticesPerSpectrum;
        var highPivot = highIndex * verticesPerSpectrum;
        var spectrumSlice = spectrum.slice(lowPivot, highPivot);

        var vertexShift = ((spectrum.length > 0 && !isNaN(avg(spectrumSlice))) ? avg(spectrumSlice) / (0.1 + _.max(spectrumSlice)) : 0.0);
        var vertexPosition = sphere.geometry.vertices[highIndex].position;

        currentPositionSpeed.multiplyScalar(0.0);
        currentPositionSpeed.addSelf(sphere.geometry.vertices[highIndex].initialPosition);
        currentPositionSpeed.multiplyScalar(1.0 + 8.0 * vertexShift);
        currentPositionSpeed.subSelf(sphere.geometry.vertices[highIndex].position);
        currentPositionSpeed.divideScalar(10.0);
        
        sphere.geometry.vertices[highIndex].positionSpeed = currentPositionSpeed; 
        sphere.geometry.vertices[highIndex].position.addSelf(sphere.geometry.vertices[highIndex].positionSpeed);

      }
      sphere.rotation.y += (!isNaN(avg(spectrum)) ? (avg(spectrum)) : 0.0);
      sphere.geometry.__dirtyVertices = true;

      //Animate all lights in one cycle
      scene.lights.forEach(function(light, idx){
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