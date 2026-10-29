/**
 * VARITA - cliente movil
 *
 *   MUEVE el telefono  -> apunta en la pantalla grande
 *   GOLPE SECO hacia adelante -> elige
 *   (tocar la pantalla hace lo mismo, por si el golpe no se detecta)
 *
 * Por que un golpe y no un boton: con boton la gente mira el telefono justo
 * cuando deberia estar mirando la pantalla grande. El golpe se hace sin mirar.
 *
 * Dos fuentes de inclinacion. 'orientacion' viene del giroscopio y es la
 * buena; 'gravedad' se deduce del acelerometro y es el respaldo para los
 * telefonos que no traen giroscopio (Galaxy A16 y buena parte de la gama
 * media). Si no hay ninguna se cae a modo tactil, nunca se queda trabado.
 */

let socket;
let conectado = false;

let fase = 'inicio';      // inicio | varita
let modo = null;          // 'inclinacion' | 'tactil'
let fuente = null;        // 'orientacion' | 'gravedad'
let motivo = '';

let beta = 0, gamma = 0;
let hayLectura = false, hayMotion = false;
let beta0 = null, gamma0 = 0;
let gx = 0, gy = 0, gz = 9.8;

let cx = 0.5, cy = 0.5;
let sx = 0.5, sy = 0.5;

// Mas amplio que antes: con rangos estrechos las opciones de los extremos
// quedaban fuera de alcance y la de arriba no se podia elegir.
const RANGO_X = 34;
const RANGO_Y = 28;
const SUAVIZADO = 0.18;
const ENVIOS_POR_SEG = 30;

// Golpe: pico de aceleracion propia, en m/s2, con espera entre golpes.
const UMBRAL_GOLPE = 13;
const ESPERA_GOLPE = 700;

// Promesa de los permisos. Se crea en el manejador del toque, no dentro de
// la funcion async, para que iOS la vea nacer dentro del gesto.
let esperaPermisos = null;

let sacudida = 0;
let ultimoGolpe = 0;
let ultimoEnvio = 0;
let destello = 0;
let chispas = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('Georgia');
  socket = io();
  socket.on('connect', () => { conectado = true; socket.emit('hola', 'mobile'); });
  socket.on('disconnect', () => { conectado = false; });

  window.addEventListener('deviceorientation', (e) => {
    if (e.beta === null && e.gamma === null) return;
    hayLectura = true;
    beta = e.beta || 0;
    gamma = e.gamma || 0;
  });

  window.addEventListener('devicemotion', (e) => {
    const g = e.accelerationIncludingGravity;
    if (g && g.x !== null && g.x !== undefined) {
      hayMotion = true;
      gx = gx * 0.82 + g.x * 0.18;
      gy = gy * 0.82 + g.y * 0.18;
      gz = gz * 0.82 + g.z * 0.18;
    }
    // Aceleracion propia, ya sin gravedad: es la que delata el golpe.
    const a = e.acceleration;
    if (a && a.x !== null && a.x !== undefined) {
      sacudida = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
    } else if (g && g.x !== null) {
      // Algunos navegadores no entregan 'acceleration'. Se estima quitandole
      // la gravedad al vector filtrado.
      const dx = g.x - gx, dy = g.y - gy, dz = g.z - gz;
      sacudida = Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
  });
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }
function seguro() { return window.isSecureContext === true; }

// iOS solo concede los sensores si requestPermission() sale DIRECTAMENTE de
// un toque. Por eso las dos solicitudes se lanzan juntas y sincronas: si se
// pide la segunda despues de un await, el gesto ya se perdio y iOS la
// rechaza sin preguntar nada. Android no pide permiso y devuelve 'granted'.
function pedirPermisos() {
  const O = window.DeviceOrientationEvent;
  const M = window.DeviceMotionEvent;
  const pide = (E) => (E && typeof E.requestPermission === 'function')
    ? E.requestPermission().catch(() => 'error')
    : Promise.resolve('granted');
  return Promise.all([pide(O), pide(M)]);   // ambas arrancan ya, sin esperar
}

async function pedirSensores() {
  if (!window.DeviceOrientationEvent && !window.DeviceMotionEvent) {
    motivo = 'el navegador no expone sensores';
    return false;
  }
  if (!seguro()) { motivo = 'la pagina no esta en HTTPS'; return false; }

  const [rO, rM] = await esperaPermisos;
  if (rO !== 'granted' && rM !== 'granted') {
    motivo = (rO === 'denied' || rM === 'denied')
      ? 'permiso denegado - borra los datos del sitio y reintenta'
      : 'el telefono rechazo la solicitud';
    return false;
  }

  // Basta con que conteste uno de los dos.
  const limite = Date.now() + 2500;
  while (Date.now() < limite && !hayLectura && !hayMotion) {
    await new Promise((r) => setTimeout(r, 100));
  }
  if (hayLectura) { fuente = 'orientacion'; return true; }
  if (hayMotion) { fuente = 'gravedad'; return true; }
  motivo = 'ningun sensor envia datos';
  return false;
}

// Inclinacion deducida del vector gravedad, para telefonos sin giroscopio.
function anguloDesdeGravedad() {
  const g = 180 / Math.PI;
  gamma = Math.atan2(-gx, Math.sqrt(gy * gy + gz * gz)) * g;
  beta = Math.atan2(gy, gz) * g;
}

function calibrar() {
  if (fuente === 'gravedad') anguloDesdeGravedad();
  beta0 = beta;
  gamma0 = gamma;
  cx = cy = sx = sy = 0.5;
}

function cursorDesdeInclinacion() {
  if (fuente === 'gravedad') anguloDesdeGravedad();
  // La primera lectura fija el cero: la postura en que uno ya tiene el
  // telefono es el centro. Sin esto hacia falta un paso de calibracion que
  // nadie entendia.
  if (beta0 === null) calibrar();
  cx = constrain(0.5 + (gamma - gamma0) / (RANGO_X * 2), 0, 1);
  cy = constrain(0.5 - (beta - beta0) / (RANGO_Y * 2), 0, 1);
}

function elegir() {
  if (conectado) socket.emit('confirmar');
  destello = 1;
  for (let i = 0; i < 26; i++) chispas.push(nuevaChispa());
}

function revisarGolpe() {
  const t = millis();
  if (sacudida > UMBRAL_GOLPE && t - ultimoGolpe > ESPERA_GOLPE) {
    ultimoGolpe = t;
    elegir();
  }
}

function enviar() {
  sx = lerp(sx, cx, SUAVIZADO);
  sy = lerp(sy, cy, SUAVIZADO);
  const t = millis();
  if (conectado && t - ultimoEnvio > 1000 / ENVIOS_POR_SEG) {
    ultimoEnvio = t;
    socket.emit('cursor', { x: sx, y: sy });
  }
}

// ------------------------------------------------------------------ dibujo
// Paleta igual a la de TouchDesigner: tinta y oro.
const TINTA = [10, 9, 8];
const ORO = [196, 153, 72];
const ORO_VIVO = [255, 222, 143];
const APAGADO = [120, 102, 72];

function punta() {
  // De donde sale la luz: el extremo de la varita dibujada.
  return { x: width * 0.5 + (sx - 0.5) * width * 0.52,
           y: height * 0.30 - (sy - 0.5) * height * 0.22 };
}

function nuevaChispa() {
  const p = punta();
  const a = random(TWO_PI);
  const v = random(1.5, 6);
  return { x: p.x, y: p.y, vx: cos(a) * v, vy: sin(a) * v - 1, vida: 1 };
}

function dibujarChispas() {
  noStroke();
  for (let i = chispas.length - 1; i >= 0; i--) {
    const c = chispas[i];
    c.x += c.vx; c.y += c.vy;
    c.vy += 0.12;
    c.vida -= 0.022;
    if (c.vida <= 0) { chispas.splice(i, 1); continue; }
    fill(ORO_VIVO[0], ORO_VIVO[1], ORO_VIVO[2], c.vida * 230);
    circle(c.x, c.y, 2 + c.vida * 4);
  }
}

function dibujarVarita() {
  const p = punta();
  const mango = { x: width * 0.5 - (sx - 0.5) * width * 0.16,
                  y: height * 0.90 };
  const dx = p.x - mango.x, dy = p.y - mango.y;
  const largo = Math.sqrt(dx * dx + dy * dy);
  const ang = Math.atan2(dy, dx);

  push();
  translate(mango.x, mango.y);
  rotate(ang);
  noStroke();
  // La madera se afina hacia la punta: un trapecio, no una linea.
  fill(38, 27, 18);
  beginShape();
  vertex(0, -9); vertex(largo, -2.2); vertex(largo, 2.2); vertex(0, 9);
  endShape(CLOSE);
  fill(58, 42, 27);
  beginShape();
  vertex(0, -9); vertex(largo, -2.2); vertex(largo, -0.6); vertex(0, -2);
  endShape(CLOSE);
  // empunadura
  fill(28, 20, 13);
  rect(0, -10, largo * 0.22, 20, 5);
  fill(ORO[0], ORO[1], ORO[2], 150);
  rect(largo * 0.21, -8, 4, 16, 2);
  pop();

  // resplandor de la punta
  const brillo = 0.55 + 0.45 * sin(frameCount * 0.08) + destello * 1.2;
  noStroke();
  for (let i = 5; i >= 1; i--) {
    fill(ORO_VIVO[0], ORO_VIVO[1], ORO_VIVO[2], 16 * brillo * i * 0.5);
    circle(p.x, p.y, i * 16 * (1 + destello));
  }
  fill(255, 248, 225, 240);
  circle(p.x, p.y, 9 + destello * 10);
}

function marco() {
  // Donde esta apuntando, en la proporcion de la pantalla grande. Es el
  // unico modo de que el usuario entienda que el telefono no es la interfaz:
  // la interfaz es la pared.
  const m = min(width, height) * 0.08;
  const w = width - m * 2;
  const h = w * 9 / 16;
  const y0 = height * 0.055;

  noFill();
  stroke(ORO[0], ORO[1], ORO[2], 110);
  strokeWeight(1.5);
  rect(m, y0, w, h, 6);
  stroke(ORO[0], ORO[1], ORO[2], 35);
  strokeWeight(1);
  line(m + w / 2, y0, m + w / 2, y0 + h);
  line(m, y0 + h / 2, m + w, y0 + h / 2);

  const px = m + sx * w;
  const py = y0 + (1 - sy) * h;
  noStroke();
  fill(ORO_VIVO[0], ORO_VIVO[1], ORO_VIVO[2], 230);
  circle(px, py, 11);
  noFill();
  stroke(ORO_VIVO[0], ORO_VIVO[1], ORO_VIVO[2], 110);
  strokeWeight(1.5);
  circle(px, py, 24);
  noStroke();
}

function pie(linea1, linea2) {
  textAlign(CENTER, CENTER);
  noStroke();
  fill(ORO_VIVO[0], ORO_VIVO[1], ORO_VIVO[2], 230);
  textSize(min(width, height) * 0.045);
  text(linea1, width / 2, height * 0.955);
  if (linea2) {
    fill(APAGADO[0], APAGADO[1], APAGADO[2]);
    textSize(min(width, height) * 0.030);
    text(linea2, width / 2, height * 0.995);
  }
}

function pantallaInicio() {
  textAlign(CENTER, CENTER);
  noStroke();
  fill(ORO_VIVO[0], ORO_VIVO[1], ORO_VIVO[2]);
  textSize(min(width, height) * 0.075);
  text('VARITA', width / 2, height * 0.30);
  fill(APAGADO[0], APAGADO[1], APAGADO[2]);
  textSize(min(width, height) * 0.038);
  text('Toca para despertarla', width / 2, height * 0.40);
  if (!seguro()) {
    fill(200, 120, 70);
    textSize(min(width, height) * 0.028);
    text('sin HTTPS: solo modo tactil', width / 2, height * 0.47);
  }
  dibujarVarita();
}

function pantallaVarita() {
  marco();
  dibujarVarita();
  dibujarChispas();
  if (modo === 'inclinacion') {
    // Decir que sensor quedo activo no es adorno: si algo falla en un
    // telefono concreto, esta linea dice cual de los dos caminos tomo.
    const via = fuente === 'orientacion' ? 'giroscopio' : 'acelerometro';
    pie('Golpe seco para elegir', 'dos dedos = recentrar  ·  ' + via);
  } else {
    pie('Arrastra para apuntar, toca para elegir', '(' + motivo + ')');
  }
}

function draw() {
  background(TINTA[0], TINTA[1], TINTA[2]);

  if (fase === 'varita') {
    if (modo === 'inclinacion') { cursorDesdeInclinacion(); revisarGolpe(); }
    enviar();
  }
  if (fase === 'inicio') pantallaInicio(); else pantallaVarita();

  noStroke();
  fill(conectado ? color(120, 180, 110) : color(200, 90, 70));
  circle(16, 16, 9);

  if (destello > 0) {
    fill(ORO_VIVO[0], ORO_VIVO[1], ORO_VIVO[2], destello * 55);
    rect(0, 0, width, height);
    destello -= 0.06;
  }
}

// ----------------------------------------------------------------- entrada
// Un toque solo cuenta como eleccion si fue corto y sin arrastre. Asi no se
// confunde con apuntar (modo tactil) ni con el gesto de dos dedos.
const TOQUE_MS = 400;
const TOQUE_PX = 22;

let tIni = 0, xIni = 0, yIni = 0, variosDedos = false;

function moverTactil() {
  const m = min(width, height) * 0.08;
  const w = width - m * 2;
  const h = w * 9 / 16;
  const y0 = height * 0.055;
  cx = constrain((mouseX - m) / w, 0, 1);
  cy = constrain(1 - (mouseY - y0) / h, 0, 1);
}

function touchStarted() {
  if (fase === 'inicio') {
    esperaPermisos = pedirPermisos();   // sincrono: aqui todavia hay gesto
    pedirSensores().then((ok) => {
      modo = ok ? 'inclinacion' : 'tactil';
      fase = 'varita';
      if (ok) calibrar(); else console.warn('sin inclinacion:', motivo);
    });
    return false;
  }

  if (touches.length >= 2) { variosDedos = true; return false; }

  variosDedos = false;
  tIni = millis();
  xIni = mouseX;
  yIni = mouseY;
  if (modo === 'tactil') moverTactil();
  return false;
}

function touchMoved() {
  if (touches.length >= 2) variosDedos = true;
  if (fase === 'varita' && modo === 'tactil' && !variosDedos) moverTactil();
  return false;
}

function touchEnded() {
  if (fase !== 'varita') return false;

  if (variosDedos) {
    // Dos dedos ponen el centro donde uno tiene el telefono ahora.
    if (modo === 'inclinacion') calibrar();
    variosDedos = false;
    return false;
  }

  const corto = millis() - tIni < TOQUE_MS;
  const quieto = dist(xIni, yIni, mouseX, mouseY) < TOQUE_PX;
  if (corto && quieto) elegir();
  return false;
}
