'use strict';

window.addEventListener('load', () => {
    const width = window.innerWidth,
        height = window.innerHeight,
        canvas = document.getElementById('canvas');

    canvas.setAttribute('width', width);
    canvas.setAttribute('height', height);

    const ball = {
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        positionX: 0,
        positionY: 0,
        positionZ: 0,
    };

    const gui = new dat.gui.GUI();
    gui.add(ball, 'rotationX').min(-0.2).max(0.2).step(0.001);
    gui.add(ball, 'rotationY').min(-0.2).max(0.2).step(0.001);
    gui.add(ball, 'rotationZ').min(-0.2).max(0.2).step(0.001);

    gui.add(ball, 'positionX').min(-5).max(5).step(0.1);
    gui.add(ball, 'positionY').min(-5).max(5).step(0.1);
    gui.add(ball, 'positionZ').min(-5).max(5).step(0.1);

    const renderer = new THREE.WebGLRenderer({canvas: canvas}); 
    renderer.setClearColor(0x000000);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(85, width / height, 0.1, 5000);
    camera.position.set(0, 0, 1000);

    const light = new THREE.AmbientLight(0xffffff);
    scene.add(light);

    const geometry = new THREE.SphereGeometry(300, 12, 12);
    const material = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        vertexColors: THREE.FaceColors,
    });

    for (let i = 0; i < geometry.faces.length; i++){
        geometry.faces[i].color.setRGB(Math.random(), Math.random(), Math.random());
    };

    const mesh = new THREE.Mesh(geometry, material);

    scene.add(mesh);

    renderer.render(scene, camera);

    function loop(){
        mesh.rotation.x += ball.rotationX;
        mesh.rotation.y += ball.rotationY;
        mesh.rotation.z += ball.rotationZ;

        mesh.position.x += ball.positionX;
        mesh.position.y += ball.positionY;
        mesh.position.z += ball.positionZ;

        renderer.render(scene, camera);

        requestAnimationFrame(function(){loop()});
    }

    loop();
});

