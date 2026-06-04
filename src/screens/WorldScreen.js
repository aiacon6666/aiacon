import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import Colors from '../theme/colors';
import { ABLY_API_KEY } from '../config/keys';

// Full HTML with Three.js + Ably world
const WORLD_HTML = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#0A0A14; overflow:hidden; }
  canvas { display:block; }
  #ui {
    position:fixed; top:0; left:0; right:0;
    display:flex; justify-content:space-between; align-items:center;
    padding:10px 16px;
    background:rgba(10,10,20,0.7);
    backdrop-filter:blur(8px);
    color:#fff; font-family:sans-serif; font-size:13px; z-index:10;
  }
  #controls {
    position:fixed; bottom:20px; left:50%; transform:translateX(-50%);
    display:grid; grid-template-columns:repeat(3,52px); grid-template-rows:repeat(3,52px);
    gap:4px; z-index:10;
  }
  .ctrl-btn {
    background:rgba(255,255,255,0.12); border:none; border-radius:12px;
    color:#fff; font-size:20px; cursor:pointer; backdrop-filter:blur(4px);
    display:flex; align-items:center; justify-content:center;
    touch-action:manipulation;
  }
  .ctrl-btn:active { background:rgba(0,71,171,0.6); }
  #chat-box {
    position:fixed; bottom:200px; left:10px; right:10px;
    max-height:120px; overflow-y:auto;
    background:rgba(10,10,20,0.7); border-radius:12px; padding:8px;
    font-family:sans-serif; color:#fff; font-size:12px; z-index:10;
  }
  #chat-input-row {
    position:fixed; bottom:160px; left:10px; right:10px;
    display:flex; gap:6px; z-index:10;
  }
  #chat-input {
    flex:1; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2);
    border-radius:20px; padding:8px 14px; color:#fff; font-size:13px; outline:none;
  }
  #chat-send {
    background:#0047AB; border:none; border-radius:20px;
    padding:8px 16px; color:#fff; font-size:13px; cursor:pointer;
  }
  #player-count { color:#9F7AEA; font-weight:700; }
</style>
</head>
<body>
<div id="ui">
  <span>🌍 AiaCon World</span>
  <span id="player-count">1 online</span>
</div>

<div id="chat-box" id="chatBox"></div>
<div id="chat-input-row">
  <input id="chat-input" placeholder="Say something..." />
  <button id="chat-send">Send</button>
</div>

<div id="controls">
  <div></div>
  <button class="ctrl-btn" id="btn-forward">↑</button>
  <div></div>
  <button class="ctrl-btn" id="btn-left">←</button>
  <button class="ctrl-btn" id="btn-back">↓</button>
  <button class="ctrl-btn" id="btn-right">→</button>
  <div></div>
  <button class="ctrl-btn" id="btn-up">▲</button>
  <div></div>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://cdn.ably.com/lib/ably.min-2.js"></script>
<script>
var scene = new THREE.Scene();
scene.background = new THREE.Color(0x0A0A14);
scene.fog = new THREE.Fog(0x0A0A14, 20, 100);
var camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 4, 10);
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.insertBefore(renderer.domElement, document.body.firstChild);

var ambient = new THREE.AmbientLight(0x334466, 1.2);
scene.add(ambient);
var dirLight = new THREE.DirectionalLight(0x4488ff, 1.0);
dirLight.position.set(10, 20, 10);
dirLight.castShadow = true;
scene.add(dirLight);
var pointLight = new THREE.PointLight(0x00ffff, 0.8, 30);
pointLight.position.set(0, 5, 0);
scene.add(pointLight);

var groundGeo = new THREE.PlaneGeometry(200, 200, 40, 40);
var groundMat = new THREE.MeshStandardMaterial({ color: 0x1A1A2E, wireframe: false });
var ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);
var grid = new THREE.GridHelper(200, 40, 0x333333, 0x222233);
scene.add(grid);

var playerGeo = new THREE.CylinderGeometry(0.3, 0.3, 1.6, 8);
var playerMat = new THREE.MeshStandardMaterial({ color: 0x0047AB });
var player = new THREE.Mesh(playerGeo, playerMat);
player.position.y = 0.8;
player.castShadow = true;
scene.add(player);
var headGeo = new THREE.SphereGeometry(0.35, 8, 8);
var headMat = new THREE.MeshStandardMaterial({ color: 0x9F7AEA });
var head = new THREE.Mesh(headGeo, headMat);
head.position.y = 1.5;
player.add(head);

var colorsArr = [0x3F0D6C, 0x0047AB, 0x00FFFF, 0x9F7AEA];
for (var i = 0; i < 20; i++) {
  var boxGeo = new THREE.BoxGeometry(1 + Math.random()*2, 2 + Math.random()*4, 1 + Math.random()*2);
  var boxMat = new THREE.MeshStandardMaterial({ color: colorsArr[i % colorsArr.length], wireframe: Math.random() > 0.6 });
  var box = new THREE.Mesh(boxGeo, boxMat);
  box.position.set((Math.random()-0.5)*60, boxGeo.parameters.height/2, (Math.random()-0.5)*60);
  box.castShadow = true;
  scene.add(box);
}
var starsGeo = new THREE.BufferGeometry();
var starPositions = [];
for (var s = 0; s < 800; s++) {
  starPositions.push((Math.random()-0.5)*300, 20+Math.random()*80, (Math.random()-0.5)*300);
}
starsGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
var starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.3 });
scene.add(new THREE.Points(starsGeo, starsMat));

var keys = { forward: false, back: false, left: false, right: false, up: false };
var SPEED = 0.12;
var yVel = 0;
function addKey(btn, key) {
  var el = document.getElementById(btn);
  el.addEventListener('touchstart', function(e){ e.preventDefault(); keys[key]=true; });
  el.addEventListener('touchend', function(e){ e.preventDefault(); keys[key]=false; });
  el.addEventListener('mousedown', function(){ keys[key]=true; });
  el.addEventListener('mouseup', function(){ keys[key]=false; });
}
addKey('btn-forward','forward');
addKey('btn-back','back');
addKey('btn-left','left');
addKey('btn-right','right');
addKey('btn-up','up');

function updateMovement() {
  var dir = new THREE.Vector3();
  camera.getWorldDirection(dir);
  dir.y = 0; dir.normalize();
  var right = new THREE.Vector3(); right.crossVectors(dir, new THREE.Vector3(0,1,0));
  if (keys.forward) player.position.addScaledVector(dir, SPEED);
  if (keys.back) player.position.addScaledVector(dir, -SPEED);
  if (keys.left) player.position.addScaledVector(right, -SPEED);
  if (keys.right) player.position.addScaledVector(right, SPEED);
  if (keys.up) yVel = 0.15;
  player.position.y += yVel;
  if (player.position.y > 0.8) yVel -= 0.01; else { player.position.y = 0.8; yVel = 0; }
  camera.position.set(player.position.x, player.position.y+4, player.position.z+10);
  camera.lookAt(player.position);
}

var otherPlayers = {};
var myId = 'user_' + Math.random().toString(36).slice(2,7);
var chatBox = document.getElementById('chat-box');
try {
  var ably = new Ably.Realtime({ key: '${ABLY_API_KEY}' });
  var channel = ably.channels.get('aiacon-world');

  channel.subscribe('move', function(msg) {
    var d = msg.data;
    if (d.id === myId) return;
    if (!otherPlayers[d.id]) {
      var g = new THREE.CylinderGeometry(0.3,0.3,1.6,8);
      var m = new THREE.MeshStandardMaterial({ color: 0x880E4F });
      var mesh = new THREE.Mesh(g, m);
      mesh.position.y = 0.8;
      scene.add(mesh);
      otherPlayers[d.id] = mesh;
    }
    otherPlayers[d.id].position.set(d.x, d.y, d.z);
    document.getElementById('player-count').textContent = (Object.keys(otherPlayers).length+1) + ' online';
  });

  channel.subscribe('chat', function(msg) {
    var d = msg.data;
    var p = document.createElement('p');
    p.textContent = d.name + ': ' + d.text;
    p.style.marginBottom = '4px';
    chatBox.appendChild(p);
    chatBox.scrollTop = chatBox.scrollHeight;
  });

  document.getElementById('chat-send').addEventListener('click', function() {
    var txt = document.getElementById('chat-input').value.trim();
    if (!txt) return;
    channel.publish('chat', { name: myId, text: txt });
    document.getElementById('chat-input').value = '';
  });

  var lastPublish = 0;
  function publishPos() {
    var now = Date.now();
    if (now - lastPublish > 100) {
      lastPublish = now;
      channel.publish('move', { id: myId, x: player.position.x, y: player.position.y, z: player.position.z });
    }
  }
} catch(e) { console.log('Ably error', e); }

function animate() {
  requestAnimationFrame(animate);
  updateMovement();
  if (typeof publishPos !== 'undefined') publishPos();
  pointLight.intensity = 0.6 + Math.sin(Date.now()*0.002)*0.2;
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', function() {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
</script>
</body>
</html>
`;

function WorldScreen() {
  return (
    <View style={styles.container}>
      <WebView
        source={{ html: WORLD_HTML }}
        style={styles.webview}
        javaScriptEnabled
        allowsFullscreenVideo
        mediaPlaybackRequiresUserAction={false}
        scrollEnabled={false}
        bounces={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  webview: { flex: 1, backgroundColor: Colors.background },
});

export default WorldScreen;
