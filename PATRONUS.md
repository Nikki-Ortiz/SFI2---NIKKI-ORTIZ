# HARRY POTTER - PATRONUS

## DE QUE SE TRATA EL PROYECTO

Nuestro proyecto se basa en un sistema inspirado en el Wizarding World de Harry Potter, en donde el usuario puede interactuar por medio de la conexion del un celular y la interaccion de una pantalla para responde un quiz que le asignara su patronus.

### Para replicar este proyecto se debe tener en cuenta:

1. Hacer conceptualización de la temática, donde va a estar y para que va a servir (el tipo de publico que lo va a usar es importante)
2. Entender la parte de diseño y la parte de ingenieria, en el diseño deben ir los patronus como modelos de blender para hacer el sistema de particulas, las ilustraciones, el diseño de las preguntas. En la ingenieria iria el modelo que se va a usar para seleccionar las preguntas, como la selección va a funcionar como una maquina de estados que te asignaá un patronus segun la combinación de preguntas, como va a funcionar el websocket para la conexion y que va a tener. Por último, la musica en struel y como incluir el human in the loop con Open Stage Control, enlazanolo con la musica y con las partículas.

### Pasos para replicar este proyecto:

1. Prepara el entorno

- Instala TouchDesigner, Node.js, Git Bash y VS Code.

<img width="372" height="159" alt="imagen" src="https://github.com/user-attachments/assets/8e8c885c-fb90-4b63-8d36-b1e690e21c35" />
<img width="200" height="150" alt="imagen" src="https://github.com/user-attachments/assets/23ab9c7e-b85e-4460-bf65-282ea371fb53" />

---

- El celular y el computador deben estar en la misma red, o usar un túnel de VS Code (fijarse en el paso 4)

- Necesitaras también una composición de strudel (web)

<img width="2488" height="1323" alt="imagen" src="https://github.com/user-attachments/assets/9e082432-33e5-487f-9a02-f6de35324733" />

--- 

<details>

<summary> EJEMPLO </summary>

### ESTE ES UN EJEMPLO DE LA COMPOSICIÓN DE STRUDEL:

```js
// Strudel: "Expecto Patronum" - versión épica sinfónica
// strudel_visual_router_v2
const { visualid } = createParams('visualid')

setcpm(34) // vals más enérgico (~102 bpm)

// ── ESTRUCTURA (40 compases) ──
// 0-7   BOSQUE      : drone, arpa, flauta
// 8-15  BÚSQUEDA    : + celesta, bajo, timbal suave
// 16-23 TENSIÓN     : + violines, cuerdas, cornos, timbal fuerte
// 24-27 INVOCACIÓN  : redoble, riser, coro, crescendo
// 28-39 PATRONUS    : orquesta completa, taiko, trompetas, destellos

// ── 0. SEÑAL DE SECCIÓN (silenciosa, solo OSC) ──
$seccion: n("<0!8 1!8 2!8 3!4 4!12>")
  .visualid("seccion")
  .osc()

// ── 1. DRONE DEL BOSQUE ──
let drone = note("e1")
  .sound("sawtooth")
  .attack(2).release(3)
  .lpf(slider(380, 100, 1200))
  .room(2)
  .gain("<0.5!28 0.8!12>")
  .visualid("bosque_drone")

$drone: stack(drone, drone.osc())

// ── 2. ARPA ──
let armoniaOscura = note("<[e3 g3 b3 e4 b3 g3] [c3 e3 g3 c4 g3 e3] [a2 c3 e3 a3 e3 c3] [b2 d#3 f#3 b3 f#3 d#3]>")
let armoniaBrillante = note("<[c3 e3 g3 c4 g3 e3] [g2 b2 d3 g3 d3 b2] [d3 f#3 a3 d4 a3 f#3] [e3 g3 b3 e4 b3 g3]>")

let arpa = arrange([28, armoniaOscura], [12, armoniaBrillante])
  .sound("gm_harp")
  .room(slider(1.5, 0, 4))
  .gain(0.8)
  .visualid("arpa")

$arpa: stack(arpa, arpa.osc())

// ── 3. FLAUTA / PÁJAROS (solo en el bosque) ──
let flauta = note("<[~ ~ e6] [~ ~ ~] [g6 f#6 ~] [~ ~ ~] [~ b5 ~] [~ ~ ~] [e6 ~ d6] [~ ~ ~]>")
  .sound("gm_flute")
  .mask("<1!24 0!16>")
  .degradeBy(0.3)
  .room(2).gain(0.5)
  .visualid("flauta_pajaros")

$flauta: stack(flauta, flauta.osc())

// ── 4. CELESTA: TEMA DE LA BÚSQUEDA ──
let celesta = note("<[~ b4 e5] [g5 ~ f#5] [e5 ~ c6] [b5 ~ ~] [~ a4 d5] [f5 ~ e5] [d#5 ~ f#5] [b4 ~ ~]>")
  .sound("gm_celesta")
  .mask("<0!8 1!16 0!16>")
  .legato(1).room(2).gain(0.9)
  .visualid("celesta_tema")

$celesta: stack(celesta, celesta.osc())

// ── 5. VIOLINES RÁPIDOS (tensión → triunfo) ──
let violinesOscuros = note("<[e4 g4 b4 e5 b4 g4 e5 b4 g4 b4 g4 e4] [c4 e4 g4 c5 g4 e4 c5 g4 e4 g4 e4 c4] [a3 c4 e4 a4 e4 c4 a4 e4 c4 e4 c4 a3] [b3 d#4 f#4 b4 f#4 d#4 b4 f#4 d#4 f#4 d#4 b3]>")
let violinesBrillantes = note("<[c4 e4 g4 c5 g4 e4 c5 g4 e4 g4 e4 c4] [g3 b3 d4 g4 d4 b3 g4 d4 b3 d4 b3 g3] [d4 f#4 a4 d5 a4 f#4 d5 a4 f#4 a4 f#4 d4] [e4 g4 b4 e5 b4 g4 e5 b4 g4 b4 g4 e4]>")

let violines = arrange([16, silence], [12, violinesOscuros], [12, violinesBrillantes])
  .sound("gm_violin")
  .room(2).gain(0.55)
  .visualid("violines")

$violines: stack(violines, violines.osc())

// ── 6. CUERDAS SOSTENIDAS ──
let cuerdasOscuras = note("<[e3,b3,e4] [c3,g3,c4] [a2,e3,a3] [b2,f#3,b3]>")
let cuerdasBrillantes = note("<[c3,g3,c4,e4] [g2,d3,g3,b3] [d3,a3,d4,f#4] [e3,b3,e4,g4]>")

let cuerdas = arrange([16, silence], [12, cuerdasOscuras], [12, cuerdasBrillantes])
  .sound("gm_string_ensemble_1")
  .attack(0.4).release(1)
  .lpf(slider(2600, 500, 6000))
  .room(2).gain(0.75)
  .visualid("cuerdas")

$cuerdas: stack(cuerdas, cuerdas.osc())

// ── 7. BAJO (contrabajo) ──
let bajoOscuro = note("<[e2 ~ e2] [c2 ~ c2] [a1 ~ a1] [b1 ~ b1]>")
let bajoBrillante = note("<[c2 ~ c2] [g1 ~ g1] [d2 ~ d2] [e2 ~ e2]>")

let bajo = arrange([8, silence], [20, bajoOscuro], [12, bajoBrillante])
  .sound("gm_contrabass")
  .room(1).gain(0.9)
  .visualid("bajo")

$bajo: stack(bajo, bajo.osc())

// ── 8. TIMBAL: LATIDO ──
let timbal = stack(
  note("e2 ~ ~").gain(0.5).mask("<0!8 1!8 0!24>"),
  note("e2 ~ [e2 e2]").gain(0.9).mask("<0!16 1!8 0!16>"),
  note("e2*12").gain("<0!24 0.45 0.6 0.8 1 0!12>").mask("<0!24 1!4 0!12>")
).sound("gm_timpani").room(1.5)
  .visualid("timbal_latido")

$timbal: stack(timbal, timbal.osc())

// ── 9. REDOBLE DE CAJA (invocación) ──
let redoble = s("sd*16")
  .bank("RolandTR909")
  .mask("<0!24 1!4 0!12>")
  .gain("<0!24 0.25 0.4 0.6 0.9 0!12>")
  .lpf(5000).room(1.5)
  .visualid("redoble")

$redoble: stack(redoble, redoble.osc())

// ── 10. TAIKO: GOLPES ÉPICOS (patronus) ──
let taiko = note("c2 [~ c2] c2")
  .sound("gm_taiko_drum")
  .mask("<0!28 1!12>")
  .room(2).gain(1)
  .visualid("taiko")

$taiko: stack(taiko, taiko.osc())

// ── 11. PLATILLOS: CRASH EN CADA CAMBIO DE SECCIÓN ──
let platillo = s("<~!8 cr ~!7 cr ~!7 cr ~!3 cr ~!11>")
  .bank("RolandTR909")
  .room(3).gain(0.7)
  .visualid("platillo")

$platillo: stack(platillo, platillo.osc())

// ── 12. RISER: SUBIDA ANTES DEL PATRONUS ──
let riser = s("<~@24 pink@4 ~@12>")
  .attack(3.5).release(0.5)
  .hpf(slider(1500, 200, 6000))
  .room(2).gain(0.5)
  .visualid("riser")

$riser: stack(riser, riser.osc())

// ── 13. CORNOS: GRAVES (tensión) y TEMA DEL PATRONUS ──
let cornosTension = note("<[e3 ~ ~] [~ ~ ~] [c3 ~ ~] [~ ~ ~] [a2 ~ ~] [~ ~ ~] [b2 ~ ~] [~ ~ ~]>")
  .mask("<0!16 1!8 0!16>")
let cornosPatronus = note("<[c5 ~ e5] [d5 ~ b4] [a4 ~ f#5] [e5 ~ ~]>")
  .superimpose(x => x.transpose(-12))
  .mask("<0!28 1!12>")

let cornos = stack(cornosTension, cornosPatronus)
  .sound("gm_french_horn")
  .attack(0.1).release(0.8)
  .room(2).gain(0.9)
  .visualid("cornos")

$cornos: stack(cornos, cornos.osc())

// ── 14. TROMPETAS: FANFARRIA (patronus) ──
let trompetas = note("<[g4 c5 e5] [b4 d5 g5] [a4 d5 f#5] [g5 ~ ~]>")
  .sound("gm_trumpet")
  .mask("<0!28 1!12>")
  .room(2).gain(0.7)
  .visualid("trompetas")

$trompetas: stack(trompetas, trompetas.osc())

// ── 15. CORO: LA LUZ DEL PATRONUS ──
let coro = note("<[c4,e4,g4,c5] [b3,d4,g4,b4] [a3,d4,f#4,a4] [g3,b3,e4,g4]>")
  .sound("gm_choir_aahs")
  .mask("<0!24 1!16>")
  .attack(0.5).release(1.5)
  .room(3)
  .gain("<0!24 0.4 0.55 0.7 0.85 1!12>")
  .visualid("coro_patronus")

$coro: stack(coro, coro.osc())

// ── 16. DESTELLOS: PARTÍCULAS DEL PATRONUS ──
let destellos = note("<[c5 e5 g5 c6 g5 e5] [g5 b5 d6 g6 d6 b5] [d5 f#5 a5 d6 a5 f#5] [e5 g5 b5 e6 b5 g5]>")
  .sound("gm_glockenspiel")
  .mask("<0!24 1!16>")
  .room(3).gain(0.65)
  .visualid("destellos_patronus")

$destellos: stack(destellos, destellos.osc())
```
</details>

2. Construye la lógica en TouchDesigner

- Dibuja las 3 zonas de respuesta en pantalla (cada pregunta tiene 3 opciones).
- Crea un CHOP estado (el README lo ubica en /project1/patronus) que decida en qué zona está el cursor. El celular no conoce las zonas, y esa decisión es de TD a propósito.
- Cuando llegue confirmar, suma los rasgos de la respuesta elegida y pasa a la siguiente pregunta.
- Las preguntas y respuestas se leen del JSON, por ejemplo con un Table DAT o un script Python.
- Al terminar las 5 preguntas, compara tus rasgos con los de cada patronus y gana el más cercano. Se le asigna un numero a la preguntas y segun la repetición del mismo número se asigna el patronus
- Muestra las preguntas con un Text TOP. El JSON pide no usar tildes ni eñes porque ese TOP las dibuja mal.

<img width="1285" height="1165" alt="imagen" src="https://github.com/user-attachments/assets/20398516-c619-47fd-840c-6ffad631c8e1" />
<img width="1242" height="1266" alt="imagen" src="https://github.com/user-attachments/assets/37691c80-36c9-4d2a-9078-3afa34a1791e" />

**ESTE ES EL CÓDIGO DE REFERENCIA**

```js
{
  "_comentario": "Editar libremente. El sistema se adapta a cuantas preguntas y patronus haya.",
  "_rasgos": ["valor", "lealtad", "astucia", "calma", "empatia", "impulso"],

  "preguntas": [
    {
      "texto": "Algo se mueve en la oscuridad. Que haces?",
      "respuestas": [
        { "texto": "Avanzo hacia el ruido",        "rasgos": { "valor": 2, "impulso": 1 } },
        { "texto": "Me quedo quieto y escucho",    "rasgos": { "calma": 2, "astucia": 1 } },
        { "texto": "Busco a alguien mas",          "rasgos": { "lealtad": 2, "empatia": 1 } }
      ]
    },
    {
      "texto": "Un amigo te oculto algo importante",
      "respuestas": [
        { "texto": "Le reclamo de frente",         "rasgos": { "impulso": 2, "valor": 1 } },
        { "texto": "Espero a entender por que",    "rasgos": { "calma": 2, "empatia": 1 } },
        { "texto": "Averiguo por mi cuenta",       "rasgos": { "astucia": 2, "impulso": 1 } }
      ]
    },
    {
      "texto": "Que te da mas miedo perder?",
      "respuestas": [
        { "texto": "A la gente que quiero",        "rasgos": { "lealtad": 2, "empatia": 2 } },
        { "texto": "El control de mi mismo",       "rasgos": { "calma": 2, "astucia": 1 } },
        { "texto": "La oportunidad de intentarlo", "rasgos": { "valor": 2, "impulso": 1 } }
      ]
    },
    {
      "texto": "Como enfrentas un problema nuevo?",
      "respuestas": [
        { "texto": "Lo desarmo hasta entenderlo",  "rasgos": { "astucia": 3 } },
        { "texto": "Pruebo hasta que funcione",    "rasgos": { "impulso": 2, "valor": 1 } },
        { "texto": "Pido ayuda sin pena",          "rasgos": { "empatia": 2, "lealtad": 1 } }
      ]
    },
    {
      "texto": "En un grupo, tu sueles ser",
      "respuestas": [
        { "texto": "Quien decide y arrastra",      "rasgos": { "valor": 2, "impulso": 2 } },
        { "texto": "Quien observa y aconseja",     "rasgos": { "astucia": 2, "calma": 2 } },
        { "texto": "Quien sostiene a los demas",   "rasgos": { "lealtad": 2, "empatia": 2 } }
      ]
    }
  ],

  "patronus": [
    { "nombre": "CIERVO",   "icono": "\ud83e\udd8c", "rasgos": { "valor": 3, "lealtad": 3, "calma": 1 } },
    { "nombre": "LOBO",     "icono": "\ud83d\udc3a", "rasgos": { "impulso": 3, "lealtad": 2, "valor": 2 } },
    { "nombre": "GATO",   "icono": "\ud83e\udda6", "rasgos": { "astucia": 3, "empatia": 2, "calma": 1 } },
    { "nombre": "LIEBRE",   "icono": "\ud83d\udc07", "rasgos": { "calma": 3, "empatia": 2 } },
    { "nombre": "ZORRO",    "icono": "\ud83e\udd8a", "rasgos": { "astucia": 3, "impulso": 2 } },
    { "nombre": "LECHUZA",  "icono": "\ud83e\udd89", "rasgos": { "calma": 2, "astucia": 2, "lealtad": 2 } },
    { "nombre": "PERRO",    "icono": "\ud83d\udc15", "rasgos": { "lealtad": 3, "impulso": 2, "empatia": 2 } },
    { "nombre": "FENIX",    "icono": "\ud83d\udd25", "rasgos": { "valor": 3, "empatia": 3 } }
  ]
}
```
---

3. Agrega los modelos 3D, el audio y el fondo

Importa los scene.gltf de Fenix, Lobo y el gato.
Pon los tres en un Switch (/project1/base1/switch1) como nullPOP llamados gato, lobo y fenix. El nombre debe coincidir con el patronus ganador del JSON. Si no coincide, sale la pantalla de texto en vez del animal.
Usa Bosque_prohibido.jpg como fondo con un Movie File In TOP.
Reproduce intro_voz_raul.wav al inicio con un Audio File In CHOP.
Cuando se muestre el resultado, envía /patronus/invocar para el momento de la invocación.

<img width="1182" height="832" alt="imagen" src="https://github.com/user-attachments/assets/5195fa4a-418d-4f30-a463-871a662f9558" />
<img width="1450" height="928" alt="imagen" src="https://github.com/user-attachments/assets/11cc5275-3826-4ace-9a64-e4318073910d" />

---

4. Levanta el servidor

En la carpeta sfiSocketioDesktopMobile-main ejecuta npm install y luego npm start por medio de Git Bash
Abre http://localhost:9000/desktop/ para ver la vista previa de depuración.
Si el puerto 9000 está ocupado, debes fijarte en uno que este disponible y asignarlo en touch design
3. Arma el canal OSC hacia TouchDesigner

<img width="943" height="247" alt="imagen" src="https://github.com/user-attachments/assets/d2d2ae37-f676-4bd7-99ba-9841e2061663" />
<img width="2491" height="312" alt="imagen" src="https://github.com/user-attachments/assets/25b84f2b-8f0f-4e59-8bdd-d1b7b36e9d58" />


5. Habilita el celular como varita

Los sensores de inclinación solo funcionan con HTTPS. El README recomienda el reenvío de puertos de VS Code:
Con el servidor corriendo, abre el panel PORTS y haz Forward a Port con 9000.
Cambia Port Visibility a Public.
Abre en el celular https://....devtunnels.ms/mobile/ -> ES MUY IMPORTANTE QUE DIGA MOBILE
Si lo dejas en Private, el celular pide login de GitHub y no carga, es muy importante que este en public

<img width="1246" height="156" alt="Captura de pantalla 2026-10-29 083425" src="https://github.com/user-attachments/assets/2c1eab43-778b-4108-bde5-59274678a0ac" />

---

6. Calibra y prueba con gente

Toca la pantalla una vez para activar los sensores. Mueve el teléfono para apuntar y da un golpe seco hacia adelante para elegir. Dos dedos recentran.
Los ajustes están al inicio de public/mobile/sketch.js: RANGO_X y RANGO_Y (34 y 28), SUAVIZADO (0.18), UMBRAL_GOLPE (13) y ESPERA_GOLPE (700 ms).
Probaron en celulares con y sin giroscopio. Sin giroscopio cae al acelerómetro, que tiembla más.

<img width="892" height="1600" alt="imagen" src="https://github.com/user-attachments/assets/f1105d0e-4522-4cf2-9af5-72b19917eda0" />

---

# VIDEO DE REFERENCIA

 https://youtu.be/NcrIpkBfovA?si=piJQPfflLbP8L8kx
