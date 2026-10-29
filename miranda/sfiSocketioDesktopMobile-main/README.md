# Varita — puente celular → TouchDesigner

El celular funciona como control: **arrastrar el dedo apunta**, **el botón ELEGIR
confirma**. El servidor traduce eso a mensajes OSC que consume TouchDesigner.

Funciona igual en **iOS y Android**, sin permisos ni certificados.

## Cómo correrlo

```bash
npm install
npm start
```

- **Desktop** (vista previa): `http://localhost:9000/desktop/`
- **Celular**: `http://<TU-IP>:9000/mobile/`

En el celular **no uses `localhost`**: ahí significa el propio teléfono. Ambos
dispositivos deben estar en la misma red Wi-Fi, y Windows debe permitir Node.js
en el Firewall.

Si el puerto está ocupado: `PORT=9100 npm start`.

## Decisión de diseño importante

El celular **no sabe** dónde están las respuestas. Solo envía un cursor normalizado
`0..1`. Quien decide sobre qué respuesta está el cursor es **TouchDesigner**, que es
el que conoce la posición de las zonas.

Esto es a propósito: si las zonas estuvieran definidas en dos lugares, al mover una
en TD habría que acordarse de moverla también aquí, y tarde o temprano se
desincronizan.

## Protocolo OSC

| Dirección | Argumentos | Cuándo |
|---|---|---|
| `/patronus/cursor` | `f x`, `f y` | continuo (~30/s) mientras se arrastra |
| `/patronus/confirmar` | `i 1` | al pulsar ELEGIR |
| `/patronus/invocar` | `i 1` | momento de invocar el patronus |
| `/patronus/conectado` | `i 0\|1` | al conectarse o desconectarse un celular |

Coordenadas normalizadas `0..1`, con **`y = 0` abajo** (igual que el espacio UV de
TouchDesigner, para no tener que invertir nada del otro lado).

## Puertos

| Qué | Puerto | Protocolo |
|---|---|---|
| Web (celular y desktop) | `9000` | TCP |
| OSC hacia TouchDesigner | `10000` | UDP |
| OSC local de escucha | `10001` | UDP |

```powershell
$env:OSC_HOST = "192.168.1.50"   # IP del equipo con TouchDesigner
npm start
```

> La plantilla original enviaba OSC al `9000`, el mismo del servidor web.
> Funciona porque son protocolos distintos, pero se presta a confusión.

## Apuntar inclinando el telefono

Los sensores de orientacion solo se entregan en **contexto seguro (HTTPS)**, en
iOS y Android por igual. En HTTP plano el navegador los bloquea y la pagina cae
sola a modo tactil.

La forma practica de conseguir HTTPS es el **reenvio de puertos de VS Code**:

1. `npm start`
2. Panel **PORTS** -> *Forward a Port* -> `9000`
3. Clic derecho en el puerto -> **Port Visibility -> Public**
4. Abrir en el celular la URL `https://....devtunnels.ms/mobile/`

El certificado del tunel es de verdad, asi que no sale ninguna advertencia. Si
la visibilidad queda en *Private*, el celular pide iniciar sesion con GitHub y
no carga.

> Hubo un intento con certificado autofirmado (`generar-cert.js`, carpeta
> `cert/`). Funciona, pero obliga a aceptar un aviso de seguridad en cada
> telefono y a regenerarlo cada vez que cambia la IP. Quedo desactivado como
> `cert.sinusar/`: si existe una carpeta `cert/` con `key.pem` y `cert.pem`,
> el servidor arranca en HTTPS por su cuenta.

## Como se usa la varita

1. Abrir la pagina y **tocar una vez** (iOS exige que el permiso salga de un
   gesto; ademas despierta los sensores en Android).
2. **Mover el telefono** para apuntar. El centro se fija solo en la postura
   que uno ya tiene: no hay paso de calibracion.
3. **Golpe seco hacia adelante** para elegir.

Dos dedos vuelven a centrar. Tocar la pantalla tambien elige, por si el golpe
no se detecta en algun telefono.

### Por que se quito el boton

En pruebas con gente el boton de abajo resulto poco intuitivo: obliga a mirar
el telefono justo cuando la persona deberia estar mirando la pantalla grande.
El golpe se hace sin mirar y encaja con el gesto de una varita.

La deteccion usa `DeviceMotionEvent.acceleration`, que ya viene sin gravedad.
Cuando el navegador no la entrega, se estima restandole al vector total la
gravedad filtrada. Umbral 13 m/s2 con 700 ms de espera entre golpes, para que
el rebote de un golpe no cuente como dos.

Un toque solo cuenta si fue **corto (<400 ms) y sin arrastre (<22 px)**. Sin
esa condicion, soltar el dedo despues de apuntar en modo tactil seleccionaba
sola, y el primer dedo del gesto de dos dedos disparaba la eleccion antes de
que llegara el segundo.

### Si las opciones de los extremos no se alcanzan

Los rangos estan en `public/mobile/sketch.js`:

    RANGO_X = 34    grados de inclinacion que equivalen a media pantalla
    RANGO_Y = 28

Son los grados que hay que inclinar para llegar del centro al borde. Valores
mas bajos = mas sensible, pero tambien mas tembloroso. Estaban en 26 y 20, y
con eso las opciones de arriba y abajo quedaban fuera de alcance.

### Que sensor esta usando

La segunda linea del pie lo dice: **giroscopio** o **acelerometro**. El
giroscopio es el bueno; el acelerometro es el respaldo para telefonos que no
lo traen (Galaxy A16 y buena parte de la gama media) y tiembla mas. Si dice
"Arrastra para apuntar", no hubo ninguno de los dos y entre parentesis esta
el motivo exacto.

## Ajustes

En `public/mobile/sketch.js`:

| Constante | Default | Efecto |
|---|---|---|
| `RANGO_X` / `RANGO_Y` | 34 / 28 | grados para llegar del centro al borde |
| `SUAVIZADO` | 0.18 | filtro del cursor. Bajarlo si tiembla, subirlo si se siente lento |
| `ENVIOS_POR_SEG` | 30 | frecuencia de envío del cursor |
| `UMBRAL_GOLPE` | 13 | m/s² para que un movimiento cuente como golpe |
| `ESPERA_GOLPE` | 700 | ms mínimos entre dos golpes |

El filtro del vector gravedad (`0.82 / 0.18`, en el listener de `devicemotion`)
solo importa en teléfonos sin giroscopio: subir el `0.18` responde más rápido,
bajarlo tiembla menos.

## Vista previa de escritorio

`public/desktop/` dibuja las tres zonas y el cursor para probar sin TouchDesigner
abierto. Muestra en vivo `x`, `y`, la zona detectada y el último toque.

Las zonas están en la constante `ZONA` y **deben coincidir** con el CHOP `estado`
de `/project1/patronus`. Es solo una herramienta de depuración: en el montaje real
manda TouchDesigner.

---

Los archivos `.bak` son la versión original del proyecto, por si hay que volver.
