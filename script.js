/* ============================================================
   MI UNIVERSO — personaliza aquí tus recuerdos
   ------------------------------------------------------------
   1. Coloca tus fotos dentro de la carpeta /images
      (foto1.jpg, foto2.jpg, foto3.jpg ... en ese orden)
   2. Cambia el texto "caption" de cada recuerdo por lo que
      quieras que diga debajo de la foto.
   3. Puedes agregar o quitar recuerdos: solo copia o borra
      líneas del arreglo de abajo.
   4. Más abajo, en CARTA_TEXTO, puedes cambiar la carta que
      aparece al tocar el corazón 3D.
   ============================================================ */

const memories = [
  { src: 'images/foto1.jpg', caption: 'El día en que todo comenzó' },
  { src: 'images/foto2.jpg', caption: 'Nuestra primera cita' },
  { src: 'images/foto3.jpg', caption: 'Risas que se volvieron rutina' },
  { src: 'images/foto4.jpg', caption: 'Un abrazo que se sintió como hogar' },
  { src: 'images/foto5.jpg', caption: 'Nuestros días se volvieron algo especial' },
    { src: 'images/foto6.jpg', caption: 'Nuestro primer viaje juntos' },
    { src: 'images/foto7.jpg', caption: 'Aprendimos a construir un "nosotros"' },
  { src: 'images/foto8.jpg', caption: 'Los días difíciles que superamos juntos' },
  { src: 'images/foto9.jpg', caption: 'Pequeños detalles, grandes momentos' },
  { src: 'images/foto10.jpg', caption: 'Un año completo de ti y yo' },
];

const CARTA_TEXTO = `Hoy se cumple un año desde que nuestra historia comenzó, y quiero que sepas que cada uno de esos días ha valido la pena.

Gracias por tu paciencia, por tu risa, por convertir lo simple en especial y por quedarte incluso en los días difíciles. Contigo aprendí que el amor también se construye en la rutina, en los silencios cómodos y en las ganas de seguir eligiéndonos cada mañana.

Este es apenas el primer año de muchos que quiero recorrer a tu lado. Feliz aniversario, mi amor. Te amo.`;

/* ============================================================
   A partir de aquí es la lógica del sitio — no necesitas
   tocar nada más para que funcione.
   ============================================================ */

let index = 0;
let locked = false;

const screens = {
  intro: document.getElementById('screen-intro'),
  cabin: document.getElementById('screen-cabin'),
  final: document.getElementById('screen-final'),
};

const windowPhoto = document.getElementById('windowPhoto');
const windowPhotoB = document.getElementById('windowPhotoB');
const captionText = document.getElementById('captionText');
const captionCount = document.getElementById('captionCount');
const progressDots = document.getElementById('progressDots');
const tapHint = document.getElementById('tapHint');
const flash = document.getElementById('flash');
const recapGrid = document.getElementById('recapGrid');

/* ---------- placeholder si falta una foto ---------- */
function placeholderFor(i){
  const hues = ['#ff3fc4', '#c8b6ff', '#ffd27a', '#7a5cff'];
  const hue = hues[i % hues.length];
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'>
    <defs><radialGradient id='g' cx='50%' cy='40%' r='75%'>
      <stop offset='0%' stop-color='${hue}' stop-opacity='.55'/>
      <stop offset='100%' stop-color='#0a0620'/>
    </radialGradient></defs>
    <rect width='400' height='400' fill='url(#g)'/>
    <text x='50%' y='54%' font-size='70' text-anchor='middle' fill='#ffffff' opacity='.85'>&#9825;</text>
  </svg>`;
  return 'data:image/svg+xml;base64,' + btoa(svg);
}

/* ---------- puntos de progreso ---------- */
memories.forEach(() => {
  const d = document.createElement('div');
  d.className = 'dot';
  progressDots.appendChild(d);
});
function updateDots(){
  [...progressDots.children].forEach((d, i) => d.classList.toggle('active', i === index));
}

/* ---------- mostrar un recuerdo en la ventana de la cabina ---------- */
let usingA = true;
function showMemory(i, animate){
  const m = memories[i];
  const showEl = usingA ? windowPhoto : windowPhotoB;
  const hideEl = usingA ? windowPhotoB : windowPhoto;
  usingA = !usingA;

  hideEl.classList.remove('show');

  const test = new Image();
  test.onload = () => { showEl.src = m.src; };
  test.onerror = () => { showEl.src = placeholderFor(i); };
  test.src = m.src;

  requestAnimationFrame(() => showEl.classList.add('show'));

  captionText.classList.remove('show');
  setTimeout(() => {
    captionText.textContent = m.caption;
    captionCount.textContent = `Recuerdo ${i + 1} / ${memories.length}`;
    captionText.classList.add('show');
  }, animate ? 250 : 0);

  updateDots();
  tapHint.style.opacity = i === 0 ? '1' : '0.5';
}

/* ---------- construir el recap final (grid 2D con frases) ---------- */
function buildRecap(){
  memories.forEach((m, i) => {
    const item = document.createElement('div');
    item.className = 'recap-item';
    const img = document.createElement('img');
    img.src = placeholderFor(i);
    const test = new Image();
    test.onload = () => { img.src = m.src; };
    test.onerror = () => { img.src = placeholderFor(i); };
    test.src = m.src;
    const span = document.createElement('span');
    span.textContent = m.caption;
    item.appendChild(img);
    item.appendChild(span);
    recapGrid.appendChild(item);
  });
}

/* ---------- transición entre pantallas ---------- */
function goTo(screenEl){
  Object.values(screens).forEach(s => {
    if (s !== screenEl) s.classList.remove('active');
  });
  screenEl.classList.add('active');
}

/* ---------- flujo principal ---------- */
document.getElementById('startBtn').addEventListener('click', () => {
  goTo(screens.cabin);
  warpBurst();
  showMemory(0, false);
});

screens.cabin.addEventListener('click', () => {
  if (locked) return;
  warpBurst(0.5);

  if (index < memories.length - 1){
    index++;
    showMemory(index, true);
  } else {
    arrive();
  }
});

function arrive(){
  locked = true;
  warpBurst(1);
  setTimeout(() => { flash.classList.add('burst'); }, 250);
  setTimeout(() => {
    goTo(screens.final);
    initGalaxyScene();
    startHeartReveal();
  }, 700);
  setTimeout(() => { flash.classList.remove('burst'); locked = false; }, 1500);
}

/* ============================================================
   CAMPO DE ESTRELLAS 2D — efecto de viaje en la cabina (canvas)
   ============================================================ */
const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');
let W, H, stars = [];
let speed = 0.4;
let targetSpeed = 0.4;

function resize2D(){
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize2D);
resize2D();

function initStars(n){
  stars = [];
  for (let i = 0; i < n; i++){
    stars.push({
      x: (Math.random() - 0.5) * W,
      y: (Math.random() - 0.5) * H,
      z: Math.random() * W,
      r: Math.random() * 1.2 + 0.3,
    });
  }
}
initStars(220);

function warpBurst(intensity = 0.7){
  targetSpeed = 4 + intensity * 10;
  setTimeout(() => { targetSpeed = 0.4; }, 550 + intensity * 300);
}

function drawStars(){
  ctx.fillStyle = 'rgba(6,2,23,0.35)';
  ctx.fillRect(0, 0, W, H);

  speed += (targetSpeed - speed) * 0.08;

  const cx = W / 2, cy = H / 2;
  ctx.save();
  ctx.translate(cx, cy);

  for (const s of stars){
    s.z -= speed;
    if (s.z <= 1){
      s.x = (Math.random() - 0.5) * W;
      s.y = (Math.random() - 0.5) * H;
      s.z = W;
    }
    const k = 128 / s.z;
    const px = s.x * k;
    const py = s.y * k;
    const size = (1 - s.z / W) * 2.4 + 0.2;
    const alpha = Math.min(1, (1 - s.z / W) * 1.6);

    ctx.beginPath();
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fill();

    if (speed > 2){
      const prevK = 128 / (s.z + speed * 2);
      const ppx = s.x * prevK;
      const ppy = s.y * prevK;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(200,182,255,${alpha * 0.5})`;
      ctx.lineWidth = size * 0.6;
      ctx.moveTo(ppx, ppy);
      ctx.lineTo(px, py);
      ctx.stroke();
    }
  }
  ctx.restore();
  requestAnimationFrame(drawStars);
}
drawStars();

/* ============================================================
   ESCENA FINAL — GALAXIA + CORAZÓN 3D CON FOTOS EN ÓRBITA
   (Three.js) — se inicializa una sola vez, al llegar
   ============================================================ */
let galaxyReady = false;
let scene3, camera3, renderer3, controls3, clock3;
let galaxyPoints, heartPoints, heartHitbox;
let fotoSprites = [];
let textoSprites = [];
let raycaster3, mouse3;
let revealStart = null;
let heartScaleCurrent = 0.001;

function startHeartReveal(){
  revealStart = null; // se fija dentro de initGalaxyScene/tick usando clock3
  pendingReveal = true;
}
let pendingReveal = false;

function initGalaxyScene(){
  if (galaxyReady) {
    pendingReveal = true;
    return;
  }
  galaxyReady = true;

  scene3 = new THREE.Scene();
  scene3.fog = new THREE.FogExp2(0x060217, 0.028);
  clock3 = new THREE.Clock();

  /* --- estrellas de fondo --- */
  const starGeo = new THREE.BufferGeometry();
  const starCount = 3500;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount * 3; i++){ starPos[i] = (Math.random() - 0.5) * 400; }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.6, transparent: true });
  scene3.add(new THREE.Points(starGeo, starMat));

  /* --- galaxia espiral --- */
  const params = { count: 45000, size: 0.012, radius: 6, branches: 4, spin: 1, randomness: 0.25, randomnessPower: 3,
    insideColor: '#ff1b6b', outsideColor: '#3000ff' };
  const galGeo = new THREE.BufferGeometry();
  const galPos = new Float32Array(params.count * 3);
  const galCol = new Float32Array(params.count * 3);
  const cIn = new THREE.Color(params.insideColor);
  const cOut = new THREE.Color(params.outsideColor);
  for (let i = 0; i < params.count; i++){
    const i3 = i * 3;
    const radius = Math.random() * params.radius;
    const spinAngle = radius * params.spin;
    const branchAngle = ((i % params.branches) / params.branches) * Math.PI * 2;
    const rx = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * radius;
    const ry = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * radius;
    const rz = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * radius;
    galPos[i3]     = Math.cos(branchAngle + spinAngle) * radius + rx;
    galPos[i3 + 1] = ry * 0.4;
    galPos[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + rz;
    const mixed = cIn.clone().lerp(cOut, radius / params.radius);
    galCol[i3] = mixed.r; galCol[i3 + 1] = mixed.g; galCol[i3 + 2] = mixed.b;
  }
  galGeo.setAttribute('position', new THREE.BufferAttribute(galPos, 3));
  galGeo.setAttribute('color', new THREE.BufferAttribute(galCol, 3));
  const galMat = new THREE.PointsMaterial({ size: params.size, vertexColors: true, blending: THREE.AdditiveBlending, depthWrite: false });
  galaxyPoints = new THREE.Points(galGeo, galMat);
  galaxyPoints.position.set(-6, -1, -10);
  galaxyPoints.rotation.x = 0.3;
  scene3.add(galaxyPoints);

  /* --- corazón 3D de partículas --- */
  const heartGeo = new THREE.BufferGeometry();
  const hPos = [], hCol = [];
  for (let i = 0; i < 4000; i++){
    const t = Math.random() * Math.PI * 2;
    const s = Math.random() * 0.6 + 0.4;
    let x = 17 * Math.pow(Math.sin(t), 3);
    let y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    let z = (Math.random() - 0.5) * 1.2;
    x *= s * 0.15; y *= s * 0.15; z *= s * 0.15;
    hPos.push(x, y, z);
    const c = new THREE.Color();
    c.setHSL(0.92 + Math.random() * 0.05, 1, 0.62 + Math.random() * 0.15);
    hCol.push(c.r, c.g, c.b);
  }
  heartGeo.setAttribute('position', new THREE.Float32BufferAttribute(hPos, 3));
  heartGeo.setAttribute('color', new THREE.Float32BufferAttribute(hCol, 3));
  const heartMat = new THREE.PointsMaterial({ size: 0.13, vertexColors: true, transparent: true });
  heartPoints = new THREE.Points(heartGeo, heartMat);
  heartPoints.position.set(0, 1.5, 0);
  heartPoints.scale.setScalar(0.001);
  scene3.add(heartPoints);

  /* --- objetivo invisible para detectar el toque sobre el corazón --- */
  const hitGeo = new THREE.SphereGeometry(3.2, 12, 12);
  const hitMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });
  heartHitbox = new THREE.Mesh(hitGeo, hitMat);
  heartHitbox.position.copy(heartPoints.position);
  scene3.add(heartHitbox);

  /* --- fotos en órbita alrededor del corazón --- */
  const texLoader = new THREE.TextureLoader();
  const orbitCount = Math.min(memories.length, 12);
  for (let i = 0; i < orbitCount; i++){
    const m = memories[i];
    const mat = new THREE.SpriteMaterial({ transparent: true });
    const sprite = new THREE.Sprite(mat);
    texLoader.load(
      m.src,
      (t) => { mat.map = t; mat.needsUpdate = true; },
      undefined,
      () => { texLoader.load(placeholderFor(i), (t2) => { mat.map = t2; mat.needsUpdate = true; }); }
    );
    const scale = 1.3 + Math.random() * 0.55;
    sprite.scale.set(scale, scale, 1);

    const orbitRadius = 6 + Math.random() * 3.5;
    const orbitAngle = (i / orbitCount) * Math.PI * 2;
    const baseY = heartPoints.position.y + (Math.random() - 0.5) * 3.5;

    sprite.userData = {
      orbitRadius, orbitAngle,
      orbitSpeed: 0.09 + Math.random() * 0.05,
      baseY,
      floatAmp: Math.random() * 0.4 + 0.15,
      floatSpeed: Math.random() * 0.8 + 0.5,
      phase: Math.random() * Math.PI * 2,
      baseScale: scale,
    };
    scene3.add(sprite);
    fotoSprites.push(sprite);
  }

  /* --- frases flotando por el universo --- */
  const frases = memories.map(m => m.caption).concat(['Mi universo 🌌', 'Para siempre 💫', 'Tú y yo ✨', 'Nuestro amor 💗', 'Feliz aniversario 💘']);
  function crearTexto(msg){
    const cvs = document.createElement('canvas');
    cvs.width = 512; cvs.height = 128;
    const c2 = cvs.getContext('2d');
    c2.font = 'bold 42px Poppins, Arial';
    c2.textAlign = 'center';
    c2.textBaseline = 'middle';
    c2.fillStyle = '#ffd7ef';
    c2.shadowColor = '#ff3ea5';
    c2.shadowBlur = 14;
    c2.fillText(msg, cvs.width / 2, cvs.height / 2, 480);
    const tex = new THREE.CanvasTexture(cvs);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
    return new THREE.Sprite(mat);
  }
  for (let i = 0; i < frases.length; i++){
    const t = crearTexto(frases[i]);
    const angle = Math.random() * Math.PI * 2;
    const radius = 13 + Math.random() * 11;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = (Math.random() - 0.5) * 14;
    t.position.set(x, y, z);
    const size = 0.7 + Math.random() * 0.55;
    t.scale.set(size * 4, size, 1);
    t.material.opacity = 0;
    t.userData = {
      orbitRadius: Math.sqrt(x * x + z * z),
      orbitAngle: Math.atan2(z, x),
      orbitSpeed: 0.012,
      baseY: y,
      floatAmp: Math.random() * 0.6 + 0.2,
      floatSpeed: Math.random() * 0.8 + 0.5,
      phase: Math.random() * Math.PI * 2,
      baseSize: size,
      baseOpacity: 0.32 + Math.random() * 0.18,
    };
    scene3.add(t);
    textoSprites.push(t);
  }

  /* --- cámara y render --- */
  camera3 = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 500);
  camera3.position.set(0, 2.5, 14);
  scene3.add(camera3);

  const canvasEl = document.getElementById('galaxyCanvas');
  renderer3 = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true, alpha: true });
  renderer3.setSize(window.innerWidth, window.innerHeight);
  renderer3.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  controls3 = new THREE.OrbitControls(camera3, renderer3.domElement);
  controls3.enableDamping = true;
  controls3.dampingFactor = 0.06;
  controls3.enablePan = false;
  controls3.minDistance = 7;
  controls3.maxDistance = 22;
  controls3.target.set(0, 1.5, 0);
  controls3.autoRotate = true;
  controls3.autoRotateSpeed = 0.35;

  raycaster3 = new THREE.Raycaster();
  mouse3 = new THREE.Vector2();

  canvasEl.addEventListener('pointerdown', onGalaxyPointerDown);
  window.addEventListener('resize', onGalaxyResize);

  document.getElementById('cerrarCarta').addEventListener('click', () => {
    document.getElementById('modalCarta').classList.remove('visible');
  });
  document.getElementById('modalCarta').addEventListener('click', (e) => {
    if (e.target.id === 'modalCarta') e.currentTarget.classList.remove('visible');
  });

  pendingReveal = true;
  tickGalaxy();
}

function onGalaxyResize(){
  if (!camera3 || !renderer3) return;
  camera3.aspect = window.innerWidth / window.innerHeight;
  camera3.updateProjectionMatrix();
  renderer3.setSize(window.innerWidth, window.innerHeight);
}

function onGalaxyPointerDown(event){
  if (!screens.final.classList.contains('active')) return;
  mouse3.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse3.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster3.setFromCamera(mouse3, camera3);
  const hits = raycaster3.intersectObject(heartHitbox);
  if (hits.length > 0){
    document.getElementById('mensajeRomantico').textContent = CARTA_TEXTO;
    document.getElementById('modalCarta').classList.add('visible');
  }
}

function tickGalaxy(){
  requestAnimationFrame(tickGalaxy);
  if (!galaxyReady) return;

  const elapsed = clock3.getElapsedTime();

  if (pendingReveal && revealStart === null){
    revealStart = elapsed;
    pendingReveal = false;
  }
  const revealT = revealStart === null ? 0 : Math.min(1, (elapsed - revealStart) / 1.6);
  const eased = 1 - Math.pow(1 - revealT, 3);
  heartScaleCurrent = eased;
  heartPoints.scale.setScalar(Math.max(0.001, heartScaleCurrent));

  galaxyPoints.rotation.y += 0.0015;
  heartPoints.rotation.y += 0.004;
  heartPoints.rotation.z = Math.sin(elapsed * 1.6) * 0.06;

  fotoSprites.forEach(s => {
    const d = s.userData;
    d.orbitAngle += d.orbitSpeed * 0.02;
    s.position.x = heartPoints.position.x + Math.cos(d.orbitAngle) * d.orbitRadius;
    s.position.z = heartPoints.position.z + Math.sin(d.orbitAngle) * d.orbitRadius;
    s.position.y = d.baseY + Math.sin(elapsed * d.floatSpeed + d.phase) * d.floatAmp;
    const pulse = 1 + Math.sin(elapsed * 1.6 + d.phase) * 0.06;
    const scl = d.baseScale * pulse * eased;
    s.scale.set(scl, scl, 1);
    s.material.opacity = (0.85 + Math.sin(elapsed * 1.4 + d.phase) * 0.15) * eased;
  });

  textoSprites.forEach(t => {
    const d = t.userData;
    d.orbitAngle += d.orbitSpeed * 0.02;
    t.position.x = Math.cos(d.orbitAngle) * d.orbitRadius;
    t.position.z = Math.sin(d.orbitAngle) * d.orbitRadius;
    t.position.y = d.baseY + Math.sin(elapsed * d.floatSpeed + d.phase) * d.floatAmp;
    t.material.opacity = (d.baseOpacity + Math.sin(elapsed * 1.7 + d.phase) * 0.12) * eased;
  });

  if (controls3) controls3.update();
  if (renderer3 && camera3 && screens.final.classList.contains('active')){
    renderer3.render(scene3, camera3);
  }
}

/* ---------- init ---------- */
buildRecap();
