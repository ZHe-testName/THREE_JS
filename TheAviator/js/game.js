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
    blueGray: 0x869bc2,
    cheeryWood: 0x571209,
};

let scene,
	camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH,
    renderer, container;
    
window.addEventListener('load', init, false);

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


const Sea = function(){
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
    scene.add(sea.mesh);
};

const Cloud = function(){
    //создаем пустой контейнер который будет содржать 
    //разлиные части облака
    this.mesh = new THREE.Object3D();

    //задаем геаметрию куба
    //эта фигура будет дублироваться для создания облаков
    let cubeGeom = new THREE.BoxGeometry(20, 20, 20);

    //создаем простой белый материал для трюка
    let cubeMat = new THREE.MeshPhongMaterial({
        color: colors.white,
    });

    //дублируем куб рандомное количество раз
    let nBlocks = 3 + Math.floor(Math.random() * 3);

    for (let i = 0; i <nBlocks; i++){
        //создаем меш для клонирования для клонирования геметроии
        let m = new THREE.Mesh(cubeGeom, cubeMat);

        //рандомно устанавливаем угол поворота кубов облака друг к кдругу
        m.position.x = i * 15;
        m.position.y = Math.random() * 10;
        m.position.z = Math.random() * 10;

        m.rotation.z = Math.random() * Math.PI * 2;
        m.rotation.y = Math.random() * Math.PI * 2;

        //рандомно установить размер куба
        let s = 0.1 + Math.random() * 0.9;
        m.scale.set(s, s, s);

        //подключаем каждому кубу и облаку возможность отражать тени
        m.castShadow = true;
        m.receiveShadow = true;

        //добавляем куб контейнеру который мы создали
        this.mesh.add(m);
    }
};

//опркделяем функцию объекта неба
const Sky = function(){
    //создаем пустой контейнер
    this.mesh = new THREE.Object3D();

    //выбираем количество облаков которые будут ростелатса по небу
    this.nClouds = 20;

    //равномероно распредвлаем облака по небу
    //под равномерным углом
    let stepAngle = Math.PI * 2 / this.nClouds;

    //создаем облака
    for (let i = 0; i < this.nClouds; i++){
        let c = new Cloud();

        //устанавсиваем угол и позицию каждого облака
        //для этого мы используем немного тригонометрии
        let a = stepAngle * i;//это конечный угол облака

        let h = 750 + Math.random() * 200;//дистанция между цнтром осей
        //и самим облаком

        //мы просто конвертируем полярные коопдинаты(угол и дистанцию)
        //в координаты декарта(x, y)
        c.mesh.position.y = Math.sin(a) * h;
        c.mesh.position.x = Math.cos(a) * h;
        
        //поворачиваем облако согласно позиции
        c.mesh.rotation.z = a + Math.PI / 2;

        //для улутшения результата мы разместим облака
        //на различной глубине екрана
        c.mesh.position.z = -400 - Math.random() * 400;

        //еще установим различный масштаб для облака
        //согласно глубине
        let s = 1 + Math.random() * 2;
        c.mesh.scale.set(s, s, s);

        //не забываем добавить меш каждого облака на сцену
        this.mesh.add(c.mesh);
    }
};

//теперь создаем екземпляр неба и сдвигаем его центр
//чуть в нижнюю часть экрана
let sky;

function createSky(){
    sky = new Sky();

    sky.mesh.position.y = -600;
    scene.add(sky.mesh);
};

const Pilot = function(){
    this.mesh = new THREE.Object3D();
    this.mesh.name = 'pilot';

    //эта переменая нужна для анимаци волос позже
    this.angleHairs = 0;

    //создадим объект тела пилота сложив два куба в месте

    //тело
    let pilotBodyGeom = new THREE.BoxGeometry(15, 15, 15);
    let pilotBodyMat = new THREE.MeshPhongMaterial({
        color: colors.brown,
        shading: THREE.FlatShading
    });

    let pilotBody = new THREE.Mesh(pilotBodyGeom, pilotBodyMat);
    pilotBody.position.set(2,-10, 0);

    this.mesh.add(pilotBody);

    //голова
    let pilotHeadGeom = new THREE.BoxGeometry(10, 10, 10);
    let pilotHeadMat = new THREE.MeshLambertMaterial({
        color: colors.pink,
        shading: THREE.FlatShading
    });

    let pilotHead = new THREE.Mesh(pilotHeadGeom, pilotHeadMat);
    pilotHead.position.set(0, 2, 0);
    this.mesh.add(pilotHead);

    //элемент для анимационного слоя прически
    let hairGeom = new THREE.BoxGeometry(4, 4, 4);
    let hairMat = new THREE.MeshLambertMaterial({
        color: colors.brown,
    });

    let hair = new THREE.Mesh(hairGeom, hairMat);

    //выравниваем поверхность элементв волос по низу для того чтобы ее было легче масштабировать
    hair.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,2,0));

    //создадим контейнер для волос
    let hairs = new THREE.Object3D();

    //создадим контейнер для верхушки волос
    //собственно его мы и будем анимировать
    this.hairsTop = new THREE.Object3D();

    //создадим поверхность волос на верхушке для анимации
    //и разместим их в сетке 3х4
    for (let i = 0; i < 12; i++){
        let h = hair.clone();
        let col = i % 3;
        let row = Math.floor(i / 3);

        let startPosX = -4;
        let startPosZ = -4;

        h.position.set(startPosX + row * 4, 0, startPosZ + col * 4);

        this.hairsTop.add(h);
    };

    hairs.add(this.hairsTop);

    //создаем волосы со стороны лица
    let hairSideGeom = new THREE.BoxGeometry(12, 4, 2);
    hairSideGeom.applyMatrix(new THREE.Matrix4().makeTranslation(-4, 4, 0));

    let hairSideRight = new THREE.Mesh(hairSideGeom, hairMat);
    let hairSideLeft = hairSideRight.clone();

    hairSideRight.position.set(8, -2, 6);
    hairSideLeft.position.set(8, -2, -6);

    hairs.add(hairSideLeft);
    hairs.add(hairSideRight);

    //создадим волосы на задней части головы
    let hairsBackGeom = new THREE.BoxGeometry(2, 8, 10);
    let hairBack = new THREE.Mesh(hairsBackGeom, hairMat);
    
    hairBack.position.set(-1, -4, 0);
    hairs.add(hairBack);

    hairs.position.set(-5, 5, 0);

    this.mesh.add(hairs);

    //делаем очки
    let glassGeom = new THREE.BoxGeometry(5, 5, 5);
    let glassMat = new THREE.MeshPhongMaterial({
        color: colors.blueGray
    });

    let glassRight = new THREE.Mesh(glassGeom, glassMat);
    glassRight.position.set(6, 3, 3);

    let glassLeft = glassRight.clone();
    glassLeft.position.z = -glassRight.position.z;

    let glassAGeom = new THREE.BoxGeometry(11, 1, 11);
    let glassA = new THREE.Mesh(glassAGeom, glassMat);
    glassA.position.set(0, 3, 0);

    this.mesh.add(glassRight);
    this.mesh.add(glassLeft);
    this.mesh.add(glassA);

    //создадим уши
    let earGeom = new THREE.BoxGeometry(2, 3, 2);

    let earLeft = new THREE.Mesh(earGeom, pilotHeadMat);
    earLeft.position.set(0, 2, -6);

    let earRight = earLeft.clone();
    earRight.position.set(0, 2, 6);

    this.mesh.add(earRight);
    this.mesh.add(earLeft);
};

const AirPlane = function(){
    this.mesh = new THREE.Object3D();

    //создаем кабину
    let cockpitGeom = new THREE.BoxGeometry(60 ,50, 50, 1, 1, 1);
    let cockpitMat = new THREE.MeshPhongMaterial({
        color: colors.red,
        shading: THREE.FlatShading
    });

    //у нас есть доступ к конкретным вершинам геометрии объекта
    //через массив вершин
    //мы можем присваивать им свои (х, у, z) координаты
    cockpitGeom.vertices[4].y -= 4;
    cockpitGeom.vertices[4].z += 20;
    cockpitGeom.vertices[5].y -= 4;
    cockpitGeom.vertices[5].z -= 20;
    cockpitGeom.vertices[6].y += 30;
    cockpitGeom.vertices[6].z += 20;
    cockpitGeom.vertices[7].y += 30;
    cockpitGeom.vertices[7].z -= 20;

    let cockpit = new THREE.Mesh(cockpitGeom, cockpitMat);
    cockpit.castShadow = true;
    cockpit.receiveShadow = true;

    this.mesh.add(cockpit);

    //создаем мотор
    let geomEngine = new THREE.BoxGeometry(20, 50, 50, 1, 1, 1);
    let matEngine = new THREE.MeshPhongMaterial({
        color: colors.white,
        shading: THREE.FlatShading
    });

    geomEngine.vertices[0].y -= 4;
    geomEngine.vertices[0].z += 2;
    geomEngine.vertices[1].y -= 4;
    geomEngine.vertices[1].z -= 2;
    geomEngine.vertices[2].y += 2;
    geomEngine.vertices[2].z += 1;
    geomEngine.vertices[3].y += 2;
    geomEngine.vertices[3].z -= 1;

    let engine = new THREE.Mesh(geomEngine, matEngine);
    engine.position.x = 40;
    engine.castShadow = true;
    engine.receiveShadow = true;

    this.mesh.add(engine);

    //создаем хвост
    let geomTailPlane = new THREE.BoxGeometry(15, 20, 5, 1, 1, 1);
    let matTailPlane = new THREE.MeshPhongMaterial({
        color: colors.red,
        shading: THREE.FlatShading
    });

    geomTailPlane.vertices[4].y -=4;
    geomTailPlane.vertices[5].y -=4;

    let tailPlane = new THREE.Mesh(geomTailPlane, matTailPlane);
    tailPlane.position.set(-25, 25, 0);
    tailPlane.castShadow = true;
    tailPlane.receiveShadow = true;

    this.mesh.add(tailPlane);

    //создаем крыло
    let geomSideWing = new THREE.BoxGeometry(40, 8, 130, 1, 1, 1);
    let matSideWing = new THREE.MeshPhongMaterial({
        color: colors.red,
        shading: THREE.FlatShading
    });

    geomSideWing.vertices[4].y -= 5;
    geomSideWing.vertices[5].y -= 5;

    let sideWing = new THREE.Mesh(geomSideWing, matSideWing);
    sideWing.position.set(0, 15, 0);
    sideWing.castShadow = true;
    sideWing.receiveShadow = true;
    this.mesh.add(sideWing);

    //обтекатель пилота
    let windShieldGeom = new THREE.BoxGeometry(3, 15, 20, 1, 1, 1);
    let windShieldMat = new THREE.MeshPhongMaterial({
        color: colors.white,
        transparent: true,
        opacity: 0.3,
        shading: THREE.FlatShading
    });

    let windshield = new THREE.Mesh(windShieldGeom, windShieldMat);
    windshield.position.set(13, 27, 0);

    windshield.castShadow = true;
    windshield.receiveShadow = true;

    this.mesh.add(windshield);
    //попеллер
    let geomPropeller = new THREE.BoxGeometry(20, 10 ,10, 1, 1, 1);
    let matPropeller = new THREE.MeshPhongMaterial({
        color: colors.blueGray,
        shading: THREE.FlatShading
    });

    geomPropeller.vertices[4].y -= 5; 
    geomPropeller.vertices[4].z += 5; 
    geomPropeller.vertices[5].y -= 5;
    geomPropeller.vertices[5].z -= 5;
    geomPropeller.vertices[6].y += 5;
    geomPropeller.vertices[6].z += 5;
    geomPropeller.vertices[7].y += 5;
    geomPropeller.vertices[7].z -= 5; 

    this.propeller = new THREE.Mesh(geomPropeller, matPropeller);
    
    this.propeller.castShadow = true;
    this.propeller.receiveShadow = true;

    //лезвия
    let geomBlade = new THREE.BoxGeometry(1, 80, 10, 1, 1, 1);
    let matBlade = new THREE.MeshPhongMaterial({
        color: colors.cheeryWood,
        shading: THREE.FlatShading
    });

    let blade1 = new THREE.Mesh(geomBlade, matBlade);
    blade1.position.set(8, 0, 0);
    blade1.castShadow = true;
    blade1.receiveShadow = true;

    let blade2 = new THREE.Mesh(geomBlade, matBlade);
    blade2.rotation.x = Math.PI / 2;
    blade2.position.x += 5;
    blade2.castShadow = true;
    blade2.receiveShadow = true;

    this.propeller.add(blade1);
    this.propeller.add(blade2);
    this.propeller.position.set(50, 0, 0);

    this.mesh.add(this.propeller);

    //создаем шасси

    //защита шасси
    let geomProtecWheelR = new THREE.BoxGeometry(30, 15, 10, 1, 1, 1);
    let matProtecWheelR = new THREE.MeshPhongMaterial({
        color: colors.red,
        shading: THREE.FlatShading,
    });

    let wheelProtecRight = new THREE.Mesh(geomProtecWheelR, matProtecWheelR);
    wheelProtecRight.position.set(25, -20, 25);

    this.mesh.add(wheelProtecRight);

    //покрышка шасси
    let wheelTireGeom = new THREE.BoxGeometry(24, 24, 4);
    let wheelTireMat = new THREE.MeshPhongMaterial({
        color: colors.brownDark,
        shading: THREE.FlatShading
    });

    let wheelTireRight = new THREE.Mesh(wheelTireGeom, wheelTireMat);
    wheelTireRight.position.set(25, -28, 25);

    //ось шасси
    let wheelAxisGeom = new THREE.BoxGeometry(10, 10, 6);
    let wheelAxisMat = new THREE.MeshPhongMaterial({
        color: colors.blueGray,
        shading: THREE.FlatShading
    });

    let wheelAxis = new THREE.Mesh(wheelAxisGeom, wheelAxisMat);

    wheelTireRight.add(wheelAxis);

    this.mesh.add(wheelTireRight);

    let wheelProtecLeft = wheelProtecRight.clone();
    wheelProtecLeft.position.z = -wheelProtecRight.position.z;

    this.mesh.add(wheelProtecLeft);

    let wheelTireLeft = wheelTireRight.clone();
    wheelTireLeft.position.z = -wheelTireRight.position.z;

    this.mesh.add(wheelTireLeft);

    //задне шаси
    let wheelTireBack = wheelTireRight.clone();
    wheelTireBack.scale.set(0.5, 0.5, 0.5);
    wheelTireBack.position.set(-35, -5, 0);

    this.mesh.add(wheelTireBack);

    //задняя подвеска
    let suspensionGeom = new THREE.BoxGeometry(4, 20, 4);
    suspensionGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0, 10, 0));
    let suspensionMat = new THREE.MeshPhongMaterial({
        color: colors.blueGray,
        shading: THREE.FlatShading
    });

    let suspension = new THREE.Mesh(suspensionGeom, suspensionMat);
    suspension.position.set(-35, -5, 0);
    suspension.rotation.z = -0.6;
    
    this.mesh.add(suspension);

    this.pilot = new Pilot();
    this.pilot.mesh.position.set(-2, 27, 0);

    this.mesh.add(this.pilot.mesh);

    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
};

//добавляем самолет на сцену
let airplane;

function createPlane(){
    airplane = new AirPlane();

    airplane.mesh.scale.set(0.25, 0.25, 0.25);
    airplane.mesh.position.y = 100;
    airplane.mesh.position.z = 180;//удалить...

    scene.add(airplane.mesh);
};

function updatePlane(){
    //самолет будет передвигаться от -100 до 100 по оси х
    //и от 5 до 175 по оси у
    //в зависимости от положения мышки в границах от -1 до 1 по обеим осям 
    //для этого используем функцию normalize

    let targetX = normalize(mousePos.x, -1, 1, -100, 100);
    let targetY = normalize(mousePos.y, -1, 1, 5, 175);

    //обновляем позийию самолетика
    airplane.mesh.position.x = targetX;
    airplane.mesh.position.y = targetY;

    airplane.propeller.rotation.x += 0.4;
};

//каждуое изменение в програме
// нужно заново отрисовывать на странице
//для этого создается функция loop
function loop(){
    //вращаем пропелле, море и небо
    sea.mesh.rotation.z += 0.005;

    sky.mesh.rotation.z += 0.01;

    updatePlane();

    //рендерим сцену
    renderer.render(scene, camera);

    //вызываем loop снова и снова
    requestAnimationFrame(loop);
};

let mousePos = {
    x: 0,
    y: 0
};

function handleMouseMoving(event){
    //мы нормализуем положение мыши
    //конвертируя его в значение колебающееся от -1 до 1

    //формула для горизонтальной оси
    let tx = -1 + (event.clientX / WIDTH) * 2;

    //для оси у мы длжны инвертировать формулу
    //в 2-d пространстве ось у имеет противоположное направление чем ось у в 3-d
    let ty = 1 - (event.clientY / WIDTH) * 2;

    mousePos = {x: tx, y: ty};
};

function normalize(v,vmin,vmax,tmin, tmax){

	var nv = Math.max(Math.min(v,vmax), vmin);
	var dv = vmax-vmin;
	var pc = (nv-vmin)/dv;
	var dt = tmax-tmin;
	var tv = tmin + (pc*dt);
	return tv;

};

function init(){
    //set app the scene, the camera and the renderer
    createScene();

    //add light
    createLights();

    //insertion main object's
    createPlane();
    createSea();
    createSky();

    document.addEventListener('mousemove', handleMouseMoving, false);
    //start loop function that will update
    //object positions, and render the 
    //scene on each frame
    loop();
};

// init();

// renderer.render(scene, camera);

