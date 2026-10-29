/**
 * Puente celular -> TouchDesigner
 *
 * El celular actua como control tactil: se arrastra el dedo para mover un
 * cursor y se pulsa ELEGIR para confirmar. Este servidor solo transporta;
 * NO decide sobre que respuesta esta el cursor. Esa decision vive en
 * TouchDesigner, que es quien conoce la posicion de las zonas.
 *
 * Protocolo OSC hacia TouchDesigner:
 *   /patronus/cursor     f x, f y   posicion normalizada 0..1 (y: 0 abajo)
 *   /patronus/confirmar  i 1        el usuario pulso ELEGIR
 *   /patronus/invocar    i 1        momento de invocar el patronus
 *   /patronus/conectado  i 0|1      hay un celular conectado
 */

const express = require("express");
const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const socketIO = require("socket.io");
const osc = require("osc");

const app = express();

// HTTPS si hay certificado. Los sensores del celular (orientacion) solo
// funcionan en contexto seguro, en iOS y Android por igual.
const CERT = path.join(__dirname, 'cert');
const HAY_CERT = fs.existsSync(path.join(CERT, 'key.pem')) &&
                 fs.existsSync(path.join(CERT, 'cert.pem'));

const server = HAY_CERT
  ? https.createServer({
      key: fs.readFileSync(path.join(CERT, 'key.pem')),
      cert: fs.readFileSync(path.join(CERT, 'cert.pem')),
    }, app)
  : http.createServer(app);

const io = socketIO(server);

const HTTP_PORT = Number(process.env.PORT) || 9000;
const OSC_HOST = process.env.OSC_HOST || "127.0.0.1";
// OJO: distinto al puerto HTTP a proposito. El 9000 ya lo usa la web.
const OSC_PORT = Number(process.env.OSC_PORT) || 10000;
const OSC_LOCAL_PORT = Number(process.env.OSC_LOCAL_PORT) || 10001;

app.use(express.static("public"));

// ----------------------------------------------------------------- OSC
const udpPort = new osc.UDPPort({
  localAddress: "0.0.0.0",
  localPort: OSC_LOCAL_PORT,
  remoteAddress: OSC_HOST,
  remotePort: OSC_PORT,
  metadata: true,
});

let oscListo = false;
udpPort.on("ready", () => { oscListo = true; });
udpPort.on("error", (e) => { console.error("Error OSC:", e.message); });
udpPort.open();

function enviarOSC(address, args) {
  if (!oscListo) return;
  try {
    udpPort.send({ address, args });
  } catch (e) {
    console.error("No se pudo enviar OSC:", e.message);
  }
}

// ----------------------------------------------------------------- estado
let celulares = 0;

function avisarConexion() {
  enviarOSC("/patronus/conectado", [
    { type: "i", value: celulares > 0 ? 1 : 0 },
  ]);
}

// ----------------------------------------------------------------- socket
io.on("connection", (socket) => {
  let esCelular = false;

  socket.on("hola", (rol) => {
    esCelular = rol === "mobile";
    if (esCelular) {
      celulares += 1;
      console.log("Celular conectado");
      avisarConexion();
    }
    socket.emit("estado", { celulares });
  });

  socket.on("cursor", (d) => {
    const x = Number(d && d.x);
    const y = Number(d && d.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    const cx = Math.min(1, Math.max(0, x));
    const cy = Math.min(1, Math.max(0, y));
    enviarOSC("/patronus/cursor", [
      { type: "f", value: cx },
      { type: "f", value: cy },
    ]);
    socket.broadcast.emit("cursor", { x: cx, y: cy });
  });

  socket.on("confirmar", () => {
    enviarOSC("/patronus/confirmar", [{ type: "i", value: 1 }]);
    socket.broadcast.emit("confirmar", {});
  });

  socket.on("invocar", () => {
    enviarOSC("/patronus/invocar", [{ type: "i", value: 1 }]);
    socket.broadcast.emit("invocar", {});
  });

  socket.on("disconnect", () => {
    if (esCelular) {
      celulares = Math.max(0, celulares - 1);
      avisarConexion();
    }
  });
});

// ----------------------------------------------------------------- arranque
server.on("error", (e) => {
  if (e.code === "EADDRINUSE") {
    console.error(`El puerto ${HTTP_PORT} ya esta ocupado. Cierra la otra instancia.`);
  } else {
    console.error("Error del servidor:", e.message);
  }
  process.exit(1);
});

server.listen(HTTP_PORT, "0.0.0.0", () => {
  console.log(HAY_CERT ? 'Servidor conectado (HTTPS)' : 'Servidor conectado (HTTP, sin sensores)');
  if (!HAY_CERT) console.log('Para la varita por inclinacion:  npm run cert');
});
