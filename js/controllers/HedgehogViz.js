'use strict';

angular.module('audioVizApp')
  .controller('HedgehogViz', function($scope, AudioService) {
    var scene, camera, cameraControls, composer;
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

      // here you add your objects
      // - you will most likely replace this part by your own
      //var light = new THREE.AmbientLight( Math.random() * 0xffffff );
      //var light = new THREE.AmbientLight( 0x333333 );
      var light = new THREE.AmbientLight( (Math.random()*0.5 + 0.3) * 0xffffff );
      scene.add( light );
      /*var light2 = new THREE.DirectionalLight( Math.random() * 0xffffff );
      light2.position.set( Math.random(), Math.random(), Math.random() ).normalize();
      scene.add( light2 );
      var light3 = new THREE.DirectionalLight( Math.random() * 0xffffff );
      light3.position.set( Math.random(), Math.random(), Math.random() ).normalize();
      scene.add( light3 );
      var light4 = new THREE.PointLight( Math.random() * 0xffffff );
      light4.position.set( Math.random()-0.5, Math.random()-0.5, Math.random()-0.5 )
            .normalize().multiplyScalar(1.2);
      scene.add( light4 );*/
      //var light5 = new THREE.PointLight( Math.random() * 0xffffff );
      var light5 = new THREE.PointLight( 0xff0000 );
      light5.position.set( 1.0, 0.0, -1.0 ).normalize().multiplyScalar(1.2);
      scene.add( light5 );

      var geometry  = new THREE.SphereGeometry(1, widthSegCount, heightSegCount);
      geometry.dynamic = true;
      var material  = new THREE.MeshLambertMaterial({ambient: 0x808080, color: Math.max(Math.random()+0.3, 1.0) * 0xffffff});
      var mesh  = new THREE.Mesh( geometry, material );
      mesh.dynamic = true;
      mesh.scale.x = 0.2;
      mesh.scale.y = 0.2;
      mesh.scale.z = 0.2;
      
      scene.add( mesh );
	  console.log(scene);
    
    for (var i = 0; i < scene.objects.length; i++) {
    scene.objects[i].scaleSpeedX = 0;
    scene.objects[i].scaleSpeedX = 0;
    }

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

      // update camera controls
      //cameraControls.update();
      var spectrum = AudioService.spectrum();
      var spectrumPivot = spectrum.length / 3;
      var lowSpectrum = spectrum.slice(0, spectrumPivot);
      var highSpectrum = spectrum.slice(spectrumPivot, spectrum.length);
      //var scale = Math.sqrt(Math.pow(avg(lowSpectrum) / (_.max(lowSpectrum)+0.1), 2) + Math.pow(avg(highSpectrum) / (_.max(highSpectrum)+0.1), 2));
      //var scaleX = 1.0 + 5.0 * avg(lowSpectrum) / (_.max(lowSpectrum)+0.1);
      //var scaleY = 1.0 + 5.0 * avg(highSpectrum) / (_.max(highSpectrum)+0.1);
     // if (spectrum.legnth > 0) {
       /*theObjects[i].mesh.geometry.dynamic = true;
         theObjects[i].mesh.geometry.vertices = theObjects[i].geo.vertices;  
         theObjects[i].mesh.geometry.verticesNeedUpdate = true;*/
      var sphere = scene.objects[0];
      vertexCount = sphere.geometry.vertices.length;

        
        //console.log(sphere);
        //console.log(spectrumPivot);
        
        //console.log(vertexCount);
        var verticesPerSpectrum = spectrum.length / parseFloat(vertexCount);
        //console.log(spectrum.length + " / " + vertexCount + " = " + verticesPerSpectrum);
        var division = 3;
        var previousVertex;
        if (!initialPositionsSaved) {
          for(var i = 0; i < vertexCount ; i++) {
            //var initialPosition = new THREE.Vector3();
            //initialPosition.addSelf();
            sphere.geometry.vertices[i].initialPosition = sphere.geometry.vertices[i].position.clone(); //initialPosition;
            console.log("Extra vertices: " + Math.abs((widthSegCount * heightSegCount) - sphere.geometry.vertices.length));
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
              console.log(Math.abs(sphere.geometry.vertices[i].position.x - previousVertex.position.x));
              //sphere.geometry.vertices[i].position.x = Math.random() * 2.0;
              //sphere.geometry.vertices[i] = previousVertex;
              
              
            }
            previousVertex = sphere.geometry.vertices[i];
          }
          initialPositionsSaved = true;
        }
        var lowIndex;
        var highIndex;
        /*console.log("Return"  + " i > " + (vertexCount - heightSegCount - 1));
        sphere.rotation.y = PIseconds;
         renderer.clear();
      composer.render();
        return;*/

        for(var i = 1; i < vertexCount ; i++) {
          if (i <= widthSegCount) {
            lowIndex = 0;
            highIndex = widthSegCount;
            console.log("start: " + lowIndex + " - " + highIndex);
          } else if(i >= vertexCount - heightSegCount) {
            lowIndex = vertexCount - heightSegCount;
            highIndex = vertexCount - 1;
            console.log("end: " + lowIndex + " - " + highIndex);
          } else {
            lowIndex = i-1;
            highIndex = i;
          }

          var lowPivot = lowIndex * verticesPerSpectrum;
          var highPivot = highIndex * verticesPerSpectrum;
          var spectrumSlice = spectrum.slice(lowPivot, highPivot);
          /*if(lowPivot != highPivot) {
            console.log("spectrum slice:");
            console.log(spectrumSlice);
            console.log(verticesPerSpectrum);
          }*/
          /*if (avg(spectrumSlice) > 0) {
            console.log(avg(spectrumSlice));
          }*/

          var vertexShift = ((spectrum.length > 0 && !isNaN(avg(spectrumSlice))) ? avg(spectrumSlice) / (0.1 + _.max(spectrumSlice)) : 0.0);
          var vertexPosition = sphere.geometry.vertices[highIndex].position;
          /*console.log("Vertex pos: ");
          console.log(vertexPosition);
          console.log(sphere._vector);
          console.log(vertexPosition.sub(vertexPosition, sphere._vector));*/
          //var normal = new THREE.Vector3();
          //normal.sub(vertexPosition, sphere.position).normalize();
          //console.log(normal);
          
  /*        console.log("a");
          console.log(vertexShift);
          console.log(normal);
          console.log("Normal: ");
          console.log(normal);*/
          /*if (isNaN(normal.multiplyScalar(vertexShift))) {
            console.log("Normal is NaN");
            //console.log(vertexShift);
          }*/
          
          //sphere.geometry.vertices[i].position.addSelf(normal.multiplyScalar(vertexShift));
          currentPositionSpeed.multiplyScalar(0.0);
          currentPositionSpeed.addSelf(sphere.geometry.vertices[highIndex].initialPosition);
          currentPositionSpeed.multiplyScalar(1.0 + 8.0 * vertexShift);
          currentPositionSpeed.subSelf(sphere.geometry.vertices[highIndex].position);
          currentPositionSpeed.divideScalar(10.0);
          
          //currentPosition.addSelf(normal.multiplyScalar(vertexShift));
          sphere.geometry.vertices[highIndex].positionSpeed = currentPositionSpeed; //currentPosition.subSelf(currentPosition.multiplyScalar(vertexShift));
          
          sphere.geometry.vertices[highIndex].position.addSelf(sphere.geometry.vertices[highIndex].positionSpeed);
          //sphere.geometry.vertices[i].position.multiplyScalar(1.0 + vertexShift);
          
        //break;

           /*if (isNaN(sphere.geometry.vertices[i].position.x)) {
             console.log(spectrum);
             console.log(vertexShift);
            console.log("Vpos.x is NaN");
          }*/
  //        sphere.geometry.vertices[i].position = 
          /*if (i % 100){
            console.log(spectrumSlice);
            console.log("Shift:");
            console.log(normal.multiplyScalar(vertexShift));
            console.log(sphere.geometry.vertices[i].position);
            return;
          }*/
        }
        sphere.rotation.y += (!isNaN(avg(spectrum)) ? (avg(spectrum)) : 0.0);
        
        /*if (sphere.rotation.y != 0.0) {
                  console.log(sphere.rotation.y);
        }*/

        sphere.geometry.__dirtyVertices = true;
     // }
      // for(var i = 1; i < vertexCount ; i++) {
      /*for (var i = 0; i < spectrum.length; i++) {
        
      }*/

      // animation of all objects
      /*for( var i = 0; i < scene.objects.length; i ++ ){
        if (lowSpectrum.length == 0 || highSpectrum.length == 0) {

          continue;
        }
        scene.objects[i].scaleSpeedX = scene.objects[i].scale.x - scaleX;
        scene.objects[i].scaleSpeedY = scene.objects[i].scale.y - scaleY;

        //console.log(_.max(lowSpectrum) / (1.0 * sum(lowSpectrum) / lowSpectrum.length) / 100, _.max(lowSpectrum), sum(lowSpectrum), lowSpectrum.length);
        //console.log(_.max(highSpectrum) / (1.0 * sum(highSpectrum) / highSpectrum.length) / 100, _.max(highSpectrum), sum(highSpectrum), highSpectrum.length);
        //console.log(scale);
        scene.objects[i].scale.x += (scaleX - scene.objects[i].scale.x) / 20.0;
        scene.objects[i].scale.y += (scaleY - scene.objects[i].scale.y) / 20.0;
    
        //scene.objects[ i ].rotation.y = PIseconds*0.0003 * (i % 2 ? 1 : -1);
        //scene.objects[ i ].rotation.x = PIseconds*0.0002 * (i % 2 ? 1 : -1);
      }*/
      // animate DirectionalLight
     /* scene.lights.forEach(function(light, idx){
        if( light instanceof THREE.DirectionalLight === false ) return;
        var ang = 0.0005 * PIseconds * (idx % 2 ? 1 : -1);
        light.position.set(Math.cos(ang), Math.sin(ang), Math.cos(ang*2)).normalize();
      });*/
      // animate PointLights

      //Animate all lights in one cycle
      scene.lights.forEach(function(light, idx){
        if(light instanceof THREE.PointLight) {
          //var angle = 0.0005 * PIseconds;
          //light.position.set(Math.cos(angle)*3, Math.sin(angle*3)*2, Math.cos(angle*2)).normalize().multiplyScalar(2);
          //var angle = PIseconds * 0.005;
          var spectrumLowSlice = spectrum.slice(spectrum.length - spectrumPivot, spectrum.length);
          var spectrumLowVal = (avg(spectrumLowSlice)) / (_.max(spectrumLowSlice) + 0.1);
          lightAngleDestination = (!isNaN(spectrumLowVal)) ? spectrumLowVal * 10.0 : 0.0;
          lightAngleSpeed = (lightAngleDestination - lightAngle);
          lightAngleSpeed /= 4.0;
          lightAngleSpeed = Math.min(Math.max(lightAngleSpeed, -0.4), 0.4); 
         
          lightAngle += lightAngleSpeed;
          //lightAngle = Math.max(lightAngle, 0.0);
          /*if (lightAngle != 0.0)
          {
            console.log(lightAngle + ", s: " + lightAngleSpeed);
          }*/

          light.position.set(Math.cos(lightAngle), 0.0, Math.sin(lightAngle)).normalize().multiplyScalar(2);
        } else if(light instanceof THREE.DirectionalLight) {

        }
      });
      

      // actually render the scene
      renderer.clear();
      composer.render();
    };
  });