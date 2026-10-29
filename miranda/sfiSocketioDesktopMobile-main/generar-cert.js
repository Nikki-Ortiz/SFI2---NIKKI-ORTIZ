/**
 * Genera el certificado autofirmado para servir en HTTPS.
 *
 * Los sensores de orientacion (movimiento de varita) solo funcionan en
 * contexto seguro. Aplica a iOS Y a Android por igual: sobre http:// el
 * navegador los bloquea aunque estes en red local.
 *
 * La IP va DENTRO del certificado, asi que hay que correrlo de nuevo cada
 * vez que cambies de red:   npm run cert
 */

const { execFileSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const DIR = path.join(__dirname, "cert");

function ipsLocales() {
  const out = [];
  const ifaces = os.networkInterfaces();
  for (const nombre of Object.keys(ifaces)) {
    for (const i of ifaces[nombre] || []) {
      if (i.family === "IPv4" && !i.internal) out.push(i.address);
    }
  }
  return out;
}

const ips = ipsLocales();
if (!ips.length) {
  console.error("No se encontro ninguna IP de red. Conectate al Wi-Fi primero.");
  process.exit(1);
}

fs.mkdirSync(DIR, { recursive: true });

const alt = [
  "DNS.1 = localhost",
  "IP.1 = 127.0.0.1",
].concat(ips.map(function (ip, n) { return "IP." + (n + 2) + " = " + ip; })).join("\n");

fs.writeFileSync(
  path.join(DIR, "openssl.cnf"),
  "[req]\ndistinguished_name = dn\nx509_extensions = v3_req\nprompt = no\n\n" +
  "[dn]\nCN = varita-local\n\n" +
  "[v3_req]\nsubjectAltName = @alt\nbasicConstraints = CA:FALSE\n" +
  "keyUsage = digitalSignature, keyEncipherment\nextendedKeyUsage = serverAuth\n\n" +
  "[alt]\n" + alt + "\n"
);

try {
  execFileSync("openssl", [
    "req", "-x509", "-nodes",
    "-newkey", "rsa:2048",
    "-keyout", path.join(DIR, "key.pem"),
    "-out", path.join(DIR, "cert.pem"),
    "-days", "825",
    "-config", path.join(DIR, "openssl.cnf"),
  ], { stdio: ["ignore", "ignore", "pipe"] });
} catch (e) {
  console.error("Fallo openssl. En Windows viene con Git: prueba desde Git Bash.");
  console.error(String(e.stderr || e.message).trim());
  process.exit(1);
}

console.log("");
console.log("Certificado listo. Entra desde el celular a:");
ips.forEach(function (ip) { console.log("    https://" + ip + ":9000/mobile/"); });
console.log("");
console.log("Escribe el https:// completo. Sin eso el navegador asume http");
console.log("y la pagina no carga.");
console.log("");
