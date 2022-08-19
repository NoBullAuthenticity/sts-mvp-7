import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

import {FBXLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/FBXLoader.js';
import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/GLTFLoader.js';

var scene, camera, renderer, clock, mixer, actions, anims;

init();

function init(){
  const assetPath = './';
  
  clock = new THREE.Clock();
  
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xFFFFFF);
  
  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 10, 1000 );
  camera.position.z = 900;
  
  const ambient = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
  scene.add(ambient);
  
  const light = new THREE.DirectionalLight(0xFFFFFF, 1);
  light.position.set( 0, 1, 10);
  scene.add(light);

   //grid helper
   const gridHelper = new THREE.GridHelper( 30, 30, 0x888888, 0x444444 );
   scene.add( gridHelper );

  
  renderer = new THREE.WebGLRenderer({ antialias: true });
  document.body.appendChild( renderer.domElement );
  const container = document.getElementById( 'canvas-container' );
				var w = container.offsetWidth;
				var h = container.offsetHeight;
  renderer.setSize(w, h);
  document.body.appendChild( container );
  
  const controls = new OrbitControls( camera, renderer.domElement );
  controls.target.set(1,70,0);
  controls.update();
  
  //Add button actions here
  let index = 0;
  const btns = document.getElementById("btns");
  btns.childNodes.forEach( btn => {
    if (btn.innerHTML !== undefined){
      btn.addEventListener('click', 
        playAction.bind(this, index)
      );
      index++;
    }
  });
  
  //Load meshes here
  anims = [ "breakdance", "wave" ];
  
  const loader = new FBXLoader();
  loader.setPath(assetPath);
  
  loader.load('old-man-idle.fbx', object => {
	const scaleFactor = 0.5; 
	object.scale.multiplyScalar(scaleFactor);  
    mixer = new THREE.AnimationMixer(object);
    actions = [];
    const action = mixer.clipAction(object.animations[0]);
    action.play();
    actions.push(action);
    scene.add(object);
    loadAnimation(loader);
  });
  
  window.addEventListener( 'resize', resize, false);
  
}

function playAction(index){
  const action = actions[index];
  mixer.stopAllAction();
  action.reset();
  action.fadeIn(0.5);
  action.play();
}

function loadAnimation(loader){
  const anim = anims.shift();
  
  loader.load(`dance-anim-${anim}.fbx`, object => {
    const action = mixer.clipAction(object.animations[0]);
	action.loop = THREE.LoopOnce;
	action.clamWhenFinished = true;

    actions.push(action);
    if (anims.length>0){
      loadAnimation(loader);
    }else{
      update();
    }
  })
}

function update(){
  requestAnimationFrame( update );
	renderer.render( scene, camera );
  const dt = clock.getDelta();
  mixer.update(dt);
}

function resize(){
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}