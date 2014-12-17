if (!Detector.webgl) Detector.addGetWebGLMessage();

var container, stats;

var camera, controls, scene, renderer;

var cross;

init();
animate();

function init() {

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 1e10);
  camera.position.z = 6;

  controls = new THREE.OrbitControls(camera);

  controls.rotateSpeed = 5.0;
  controls.zoomSpeed = 5;

  controls.noZoom = false;
  controls.noPan = false;

  scene = new THREE.Scene();
  scene.add(camera);

  // light

  var dirLight = new THREE.DirectionalLight(0xffffff);
  dirLight.position.set(200, 200, 1000).normalize();

  camera.add(dirLight);
  camera.add(dirLight.target);

  var loader = new THREE.VRMLLoader();
  loader.addEventListener('load', function(event) {

    scene.add(event.content);
    addMarkers(event.content.children[0].children);

  });
  loader.load("models/vrml/parrot.wrl");

  // renderer

  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);

  container = document.createElement('div');
  document.body.appendChild(container);
  container.appendChild(renderer.domElement);

  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  container.appendChild(stats.domElement);

  //

  window.addEventListener('resize', onWindowResize, false);

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  //controls.handleResize();

}

function animate() {

  requestAnimationFrame(animate);

  controls.update();
  renderer.render(scene, camera);

  stats.update();

}

function addMarkers(childrens) {
  var radius = 10,
    segments = 16,
    rings = 16,
    sphereMaterial =
    new THREE.MeshLambertMaterial({
      color: 0xCC0000
    });

  // add the sphere to the scene

  for (var i = childrens.length - 1; i >= 0; i--) {
      sphere = new THREE.Mesh(

      new THREE.SphereGeometry(
        radius,
        segments,
        rings),

      sphereMaterial);
    sphere.position.set( childrens[i].position.x, childrens[i].position.y, childrens[i].position.z);
    scene.add(sphere);
    console.log(sphere);
  };
}