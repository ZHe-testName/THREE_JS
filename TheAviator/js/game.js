'use strict';

///////////////////////
//Colors basic palette
//////////////////////
const colors = {
    red: 0xf25346,
    white: 0xd8d0d1,
    brown: 0x59332e,
    brownDark: 0x23190f,
    pink: 0xF5986E,
    yellow: 0xf4ce93,
    blue: 0x68c3c0,
};

// const renderer = new THREE.WebGLRenderer({canvas: container}); 
let scene,
	camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH,
	renderer, container;

// let height = window.innerHeight;
// let width = window.innerWidth;

// let asperateRatio = width / height;
// let fieldOfView = 60;
// let nearPlane = 1;
// let farPlane = 10000;


// let scene;

window.addEventListener('load', init, false);
//Create camera
// let camera = new THREE.PerspectiveCamera(asperateRatio, fieldOfView, nearPlane, farPlane);

function handleWindowResize() {
	// update height and width of the renderer and the camera
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
	renderer.setSize(WIDTH, HEIGHT);
	camera.aspect = WIDTH / HEIGHT;
	camera.updateProjectionMatrix();
};

function createScene(){
    //get width and height of screen 
    //use them to set up the aspect ratio of the camera 
    //and the size of a renderer
    HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;

    //Create scene
    scene = new THREE.Scene();

    //Add fog to scene
    scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);

    // Create the camera
	aspectRatio = WIDTH / HEIGHT;
	fieldOfView = 60;
	nearPlane = 1;
	farPlane = 10000;
	camera = new THREE.PerspectiveCamera(
		fieldOfView,
		aspectRatio,
		nearPlane,
		farPlane
		);
	

    //set the camera position
    camera.position.x = 0;
    camera.position.y = 100;
    camera.position.z = 200;

    //Create the renderer
    renderer = new THREE.WebGLRenderer({
        //Allow transparency to show gradient collor of bgcolor 
        // we set in css
        alpha: true,

        // Activate the anti-aliasing; this is less performant,
        // but, as our project is low-poly based, it should be fine :)
        antialias: true,
    });

    // Define the size of the renderer; in this case,
    // it will fill the entire screen
    renderer.setSize(WIDTH, HEIGHT);

    //Enable shadow rendering
    renderer.shadowMap.enabled = true;

    // Add the DOM element of the renderer to the 
    // container we created in the HTML
    container = document.getElementById('world');
    container.appendChild(renderer.domElement);
    
    // Listen to the screen: if the user resizes it
    // we have to update the camera and the renderer size
    window.addEventListener('resize', handleWindowResize, false);
};

let hemisphereLight, shadowLight;

function createLights(){
    // A hemisphere light is a gradient colored light; 
	// the first parameter is the sky color, the second parameter is the ground color, 
    // the third parameter is the intensity of the light
    hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, 0.9);

    // A directional light shines from a specific direction. 
    // It acts like the sun, that means that all the rays produced are parallel. 
    shadowLight = new THREE.DirectionalLight(0xffffff, 0.9);

    //Set the direction of the light
    shadowLight.position.set(150, 350, 350);

    //Allow shadow casting
    shadowLight.castShadow = true;

    // define the visible area of the projected shadow
    shadowLight.shadow.camera.top = 400;
    shadowLight.shadow.camera.bottom = -400;
    shadowLight.shadow.camera.left = -400;
    shadowLight.shadow.camera.right = 400;
    shadowLight.shadow.camera.near = 1;
    shadowLight.shadow.camera.far = 1000;

    // define the resolution of the shadow; the higher the better, 
    // but also the more expensive and less performant
    shadowLight.shadow.mapSize.width = 2048;
    shadowLight.shadow.mapSize.height = 2048;

    // to activate the lights, just add them to the scene
    scene.add(hemisphereLight);
    scene.add(shadowLight);

    // const light = new THREE.AmbientLight(0xffffff);
    // scene.add(light);
};


let Sea = function(){
    // create the geometry (shape) of the cylinder;
	// the parameters are: 
    // radius top, radius bottom, height, number of segments on the radius, number of segments vertically
    let geometry = new THREE.CylinderGeometry(600, 600, 800, 40, 10);

    // rotate the geometry on the x axis
    geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

    // create the material 
    let material = new THREE.MeshPhongMaterial({
        color: colors.blue,
        transparent: true,
        opacity: 0.6,
        shading: THREE.FlatShading,
    });

    // To create an object in Three.js, we have to create a mesh 
    // which is a combination of a geometry and some material
    
    this.mesh = new THREE.Mesh(geometry, material);
    
    // Allow the sea to receive shadows
    this.mesh.receiveShadow = true;
};


// Instantiate the sea and add it to the scene:
let sea;

function createSea(){
    sea = new Sea();
    
    // push it a little bit at the bottom of the scene
    sea.mesh.position.y = -600;

    //add the mesh of the sea to the scene
    
    // renderer.setClearColor(0x000000);

    scene.add(sea.mesh);
    // renderer.render(scene, camera);
};

function init(){
    //set app the scene, the camera and the renderer
    createScene();

    //add light
    createLights();

    //insertion main object's
    // createPlane();
    createSea();
    // createSky();

    //start loop function that will update
    //object positions, and render the 
    //scene on each frame
    // loop();
};

init();

renderer.render(scene, camera);

