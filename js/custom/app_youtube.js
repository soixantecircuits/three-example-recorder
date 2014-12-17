var camera, scene, renderer, stats;
var player;

var auto = true;

function randomFromInterval(from, to) {
  return Math.floor(Math.random() * (to - from + 1) + from);
}

var Particle = function(location, velocity, acceleration) {
  if (location !== undefined) {
    this.location = new THREE.Vector3(location.x, location.y, location.z)
  } else {
    this.location = new THREE.Vector3(0, 0, 0);
  }

  if (velocity !== undefined) {
    this.velocity = new THREE.Vector3(velocity.x, velocity.y, 0);
  } else {
    this.velocity = new THREE.Vector3(randomFromInterval(1, 2) / 10, randomFromInterval(-10, 10) / 10, 0);
  }

  if (acceleration !== undefined) {
    this.acceleration = new THREE.Vector3(acceleration.x, acceleration.y, 0);
  } else {
    this.acceleration = new THREE.Vector3(randomFromInterval(1, 10) / 100, randomFromInterval(-10, 10) / 100, 0);
  }


  this.lifespan = 2000;

  var dom = document.createElement('div');
  dom.style.width = '80px';
  dom.style.height = '80px';
  dom.className = "particle";

  this.object = new THREE.CSS3DObject(dom);
  this.object.position = this.location;
  this.object.position.z = -2000;

  this.update = function() {
    this.lifespan -= 2.0;
    this.velocity.add(this.acceleration);
    this.object.position.add(this.velocity);
    console.log(this.object.id + ":" + this.object.position.x + "," + this.object.position.y);
  };

  this.applyForce = function(force) {
    this.acceleration.add(force);
  }

  this.isDead = function() {
    if (this.lifespan < 0) {
      return true;
    } else {
      return false;
    }
  };
};

var ParticleSystem = function(origin, particleNumber, scene) {

  this.particles = []; // An arraylist for all the particles
  this.origin = origin || new THREE.Vector3(0, 0, 0);
  this.numOfParticle = particleNumber;
  this.scene = scene;

  for (var i = 0; i < this.numOfParticle; i++) {
    var p = new Particle(this.origin);
    this.particles.push(p);
    this.scene.add(p.object);
    console.log(p.object);
  }

  this.update = function() {
    for (var i = this.particles.length - 1; i >= 0; i--) {
      var p = this.particles[i];
      p.update();
      if (p.isDead()) {
        this.particles.splice(i, 1);
        this.scene.remove(p.object);
        this.addParticle();
      }
    }
  };

  this.applyForce = function(direction) {
    for (var i = 0; i < this.particles.length; i++) {
      this.particles[i].applyForce(direction);
    }
  };

  this.addParticle = function() {
    var p = new Particle(this.origin)
    this.particles.push(p);
    this.scene.add(p.object);
  }
}

var Element = function(entry) {

  var dom = document.createElement('div');
  dom.style.width = '480px';
  dom.style.height = '360px';

  var image = document.createElement('img');
  image.style.position = 'absolute';
  image.style.width = '480px';
  image.style.height = '360px';
  image.src = entry.media$group.media$thumbnail[2].url;
  dom.appendChild(image);


  var object = new THREE.CSS3DObject(dom);
  object.position.x = Math.random() * 4000 - 2000;
  object.position.y = 3000;
  object.position.z = Math.random() * -5000;

  /*image.addEventListener('load', function(event) {
    button.style.visibility = 'visible';
    new TWEEN.Tween(object.position)
      .to({
        y: Math.random() * 2000 - 1000
      }, 2000)
      .easing(TWEEN.Easing.Exponential.Out)
      .start();
  }, false);*/
  return object;
};

init();
animate();

function init() {

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 5000);
  camera.position.y = -25;


  scene = new THREE.Scene();

  //particle = new Particle(new THREE.Vector3(0, 0, 0),new THREE.Vector3(1, 0, 0), new THREE.Vector3(0.05, 0.05, 0));
  system = new ParticleSystem(new THREE.Vector3(-window.innerWidth, 0, 0), 150, scene);

  renderer = new THREE.CSS3DRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.top = 0;
  document.getElementById('container').appendChild(renderer.domElement);

  //

  var query = document.getElementById('query');
  query.addEventListener('keyup', function(event) {

    if (event.keyCode === 13) {

      search(query.value);

    }

  }, false);

  var button = document.getElementById('button');
  button.addEventListener('click', function(event) {

    search(query.value);

  }, false);

  if (window.location.hash.length > 0) {

    query.value = window.location.hash.substr(1);

  }

  search(query.value);

  document.body.addEventListener('mousewheel', onMouseWheel, false);

  document.body.addEventListener('click', function(event) {

    auto = true;

    if (player !== undefined) {

      player.parentNode.removeChild(player);
      player = undefined;

    }

    /*new TWEEN.Tween(camera.position)
      .to({
        x: 0,
        y: -25
      }, 1500)
      .easing(TWEEN.Easing.Exponential.Out)
      .start();*/

  }, false);

  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  stats.domElement.style.zIndex = 100;
  container.appendChild(stats.domElement);

  window.addEventListener('resize', onWindowResize, false);

}

function search(query) {

  window.location.hash = query;

  for (var i = 0, l = scene.children.length; i < l; i++) {

    (function() {

      var object = scene.children[i];
      var delay = Math.random() * 100;

      /*new TWEEN.Tween(object.position)
        .to({
          y: -2000
        }, 1000)
        .delay(delay)
        .easing(TWEEN.Easing.Exponential.In)
        .onComplete(function() {

          scene.remove(object);

        })
        .start();*/

    })();

  }

  var request = new XMLHttpRequest();
  request.addEventListener('load', onData, false);
  request.open('GET', 'https://gdata.youtube.com/feeds/api/videos?v=2&alt=json&max-results=50&q=' + query, true);
  request.send(null);

}

function onData(event) {

  var data = JSON.parse(event.target.responseText);
  var entries = data.feed.entry;

  // console.log( entries );

  for (var i = 0; i < entries.length; i++) {

    var object = new Element(entries[i]);
    scene.add(object);

  }

}

function move(delta) {

  for (var i = 0; i < scene.children.length; i++) {

    var object = scene.children[i];

    object.position.z += delta;

    if (object.position.z > 0) {

      object.position.z -= 5000;

    } else if (object.position.z < -5000) {

      object.position.z += 5000;

    }

  }

}

function onMouseWheel(event) {

  move(event.wheelDelta);

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

  requestAnimationFrame(animate);

  TWEEN.update();

  if (auto === true) {

    //move( 1 );
    

  }
  system.update();
  stats.update();

  renderer.render(scene, camera);

}