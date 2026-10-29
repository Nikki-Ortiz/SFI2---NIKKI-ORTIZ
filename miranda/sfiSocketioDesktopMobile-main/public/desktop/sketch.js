/**
 * VISTA PREVIA de escritorio
 *
 * Replica el layout de zonas de TouchDesigner para poder probar la varita
 * sin tener TD abierto. En el montaje real quien manda es TouchDesigner;
 * esta pagina es solo para depurar.
 *
 * Las zonas deben coincidir con el CHOP 'estado' de /project1/patronus.
 */

const ZONA = { x: 0.5, w: 0.72, h: 0.115, y0: 0.46, dy: 0.15 };

let socket;
let cx = 0.5, cy = 0.5;
let hover = 0;
let flash = 0;
let ultimoToque = '-';
let conectado = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('system-ui');

  socket = io();
  socket.on('connect', () => {
    conectado = true;
    socket.emit('hola', 'desktop');
  });
  socket.on('disconnect', () => { conectado = false; });

  socket.on('cursor', (d) => {
    if (!d) return;
    cx = d.x;
    cy = d.y;
  });

  socket.on('confirmar', () => {
    flash = 1;
    ultimoToque = hover > 0 ? ('respuesta ' + hover) : 'fuera de zona';
  });
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }

function zonaBajoCursor() {
  for (let k = 0; k < 3; k++) {
    const zy = ZONA.y0 - k * ZONA.dy;
    if (Math.abs(cx - ZONA.x) <= ZONA.w / 2 && Math.abs(cy - zy) <= ZONA.h / 2) {
      return k + 1;
    }
  }
  return 0;
}

function draw() {
  background(7, 8, 13);
  hover = zonaBajoCursor();

  // paneles
  for (let k = 0; k < 3; k++) {
    const zy = ZONA.y0 - k * ZONA.dy;
    const px = (ZONA.x - ZONA.w / 2) * width;
    const py = (1 - zy - ZONA.h / 2) * height;   // y arriba -> y pantalla
    const pw = ZONA.w * width;
    const ph = ZONA.h * height;
    const activo = hover === k + 1;

    noStroke();
    fill(activo ? color(32, 97, 158) : color(26, 31, 51));
    rect(px, py, pw, ph, 6);
    noFill();
    stroke(activo ? color(153, 217, 255) : color(90, 100, 125));
    strokeWeight(activo ? 3 : 1.5);
    rect(px, py, pw, ph, 6);

    noStroke();
    fill(activo ? 255 : 170);
    textAlign(CENTER, CENTER);
    textSize(min(width, height) * 0.035);
    text('Respuesta ' + (k + 1), px + pw / 2, py + ph / 2);
  }

  // cursor de la varita
  const px = cx * width;
  const py = (1 - cy) * height;
  noStroke();
  fill(120, 200, 255, 230);
  circle(px, py, 20);
  noFill();
  stroke(120, 200, 255, 140);
  strokeWeight(2);
  circle(px, py, 40);

  // telemetria
  noStroke();
  fill(conectado ? color(80, 200, 130) : color(220, 90, 80));
  circle(20, 20, 12);
  fill(120, 135, 160);
  textAlign(LEFT, CENTER);
  textSize(14);
  text(`x ${cx.toFixed(3)}   y ${cy.toFixed(3)}   zona ${hover || '-'}   ultimo: ${ultimoToque}`,
       38, 20);

  if (flash > 0) {
    noStroke();
    fill(120, 200, 255, flash * 70);
    rect(0, 0, width, height);
    flash -= 0.05;
  }
}
