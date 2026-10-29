# HARRY POTTER - PATRONUS

## DE QUE SE TRATA EL PROYECTO

Nuestro proyecto se basa en un sistema inspirado en el Wizarding World de Harry Potter, en donde el usuario puede interactuar por medio de la conexion del un celular y la interaccion de una pantalla para responde un quiz que le asignara su patronus.

### Para replicar este proyecto se debe tener en cuenta:

1. Hacer conceptualización de la temática, donde va a estar y para que va a servir (el tipo de publico que lo va a usar es importante)
2. Entender la parte de diseño y la parte de ingenieria, en el diseño deben ir los patronus como modelos de blender para hacer el sistema de particulas, las ilustraciones, el diseño de las preguntas. En la ingenieria iria el modelo que se va a usar para seleccionar las preguntas, como la selección va a funcionar como una maquina de estados que te asignaá un patronus segun la combinación de preguntas, como va a funcionar el websocket para la conexion y que va a tener. Por último, la musica en struel y como incluir el human in the loop con Open Stage Control, enlazanolo con la musica y con las partículas.

### Pasos para replicar este proyecto:

1. Prepara el entorno

Instala TouchDesigner, Node.js, Git Bash y VS Code.
El celular y el computador deben estar en la misma red, o usar un túnel de VS Code (fijarse en el paso 6)

2. Construye la lógica en TouchDesigner

- Dibuja las 3 zonas de respuesta en pantalla (cada pregunta tiene 3 opciones).
- Crea un CHOP estado (el README lo ubica en /project1/patronus) que decida en qué zona está el cursor. El celular no conoce las zonas, y esa decisión es de TD a propósito.
- Cuando llegue confirmar, suma los rasgos de la respuesta elegida y pasa a la siguiente pregunta.
- Las preguntas y respuestas se leen del JSON, por ejemplo con un Table DAT o un script Python.
- Al terminar las 5 preguntas, compara tus rasgos con los de cada patronus y gana el más cercano. Se le asigna un numero a la preguntas y segun la repetición del mismo número se asigna el patronus
- Muestra las preguntas con un Text TOP. El JSON pide no usar tildes ni eñes porque ese TOP las dibuja mal.

3. Agrega los modelos 3D, el audio y el fondo

Importa los scene.gltf de Fenix, Lobo y el gato.
Pon los tres en un Switch (/project1/base1/switch1) como nullPOP llamados gato, lobo y fenix. El nombre debe coincidir con el patronus ganador del JSON. Si no coincide, sale la pantalla de texto en vez del animal.
Usa Bosque_prohibido.jpg como fondo con un Movie File In TOP.
Reproduce intro_voz_raul.wav al inicio con un Audio File In CHOP.
Cuando se muestre el resultado, envía /patronus/invocar para el momento de la invocación.

4. Levanta el servidor

En la carpeta sfiSocketioDesktopMobile-main ejecuta npm install y luego npm start por medio de Git Bash
Abre http://localhost:9000/desktop/ para ver la vista previa de depuración.
Si el puerto 9000 está ocupado, debes fijarte en uno que este disponible y asignarlo en touch design
3. Arma el canal OSC hacia TouchDesigner


5. Habilita el celular como varita

Los sensores de inclinación solo funcionan con HTTPS. El README recomienda el reenvío de puertos de VS Code:
Con el servidor corriendo, abre el panel PORTS y haz Forward a Port con 9000.
Cambia Port Visibility a Public.
Abre en el celular https://....devtunnels.ms/mobile/.
Si lo dejas en Private, el celular pide login de GitHub y no carga.

6. Calibra y prueba con gente

Toca la pantalla una vez para activar los sensores. Mueve el teléfono para apuntar y da un golpe seco hacia adelante para elegir. Dos dedos recentran.
Los ajustes están al inicio de public/mobile/sketch.js: RANGO_X y RANGO_Y (34 y 28), SUAVIZADO (0.18), UMBRAL_GOLPE (13) y ESPERA_GOLPE (700 ms).
Probaron en celulares con y sin giroscopio. Sin giroscopio cae al acelerómetro, que tiembla más.


# VIDEO DE REFERENCIA

 https://youtu.be/NcrIpkBfovA?si=piJQPfflLbP8L8kx
