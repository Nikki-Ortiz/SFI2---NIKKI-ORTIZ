# BITÁCORA - SISTEMAS FÍSICOS INTERACTIVOS 2 
## INVESTIGACIÓN
### ACTIVIDAD 1-10

**CÓDIGO**

<details>

<summary>STRUDEL RPL</summary>

### CÓDIGO DE LA EXPERIMENTACIÓN SONORA - RESULTADO ACTIVIDAD 9

```js
$: arrange( // ARREGLO PARA EL BAJO
  [4, note("<[e2 e2 ~ e2 e2 ~ g2 fs2]>").sound("gm_slap_bass_2").lpf(800).attack(0.01).decay(0.1).sustain(0.6).release(0.2).gain(1.0)],
  [8, note("<[e2 e2 ~ e2 e2 ~ g2 fs2] [d2 d2 ~ d2 d2 ~ f2 e2] [a1 a1 ~ a1 a1 ~ c2 b1] [e2 e2 ~ e2 e2 ~ g2 fs2]>").sound("gm_slap_bass_2").lpf(800).attack(0.01).decay(0.1).sustain(0.6).release(0.2).gain(1.2)],
  [8, note("<[e2 e2 e2 e2 e2 e2 g2 fs2] [d2 d2 d2 d2 d2 d2 f2 e2] [a1 a1 a1 a1 a1 a1 c2 b1] [e2 e2 e2 e2 e2 e2 g2 fs2]>").sound("gm_slap_bass_2").lpf(1000).attack(0.01).decay(0.1).sustain(0.6).release(0.2).gain(1.3)],
  [4, note("<[a1 a1 ~ a1 a1 ~ c2 b1]>").sound("gm_slap_bass_2").lpf(600).attack(0.01).decay(0.1).sustain(0.6).release(0.2).gain(0.9)],
  [4, note("<[e2 e2 ~ e2 e2 ~ g2 fs2]>").sound("gm_slap_bass_2").lpf(800).attack(0.01).decay(0.1).sustain(0.6).release(0.2).gain(1.2)]

)
  ._scope()
  .color("cyan") // bajo = cian

$: arrange( // GUITARRA
  [4, silence],
  [8, note("<[~ e3,b3 e3,b3 ~ g3,d4 ~ e3,b3 ~] [~ d3,a3 d3,a3 ~ f3,c4 ~ d3,a3 ~] [~ a2,e3 a2,e3 ~ c3,g3 ~ a2,e3 ~] [~ e3,b3 e3,b3 ~ g3,d4 ~ e3,b3 ~]>").sound("gm_distortion_guitar").hpf(300).lpf(2200).attack(0.002).decay(0.08).sustain(0.15).release(0.05).gain(0.9)],
  [8, note("<[e4 g4 a4 b4 a4 g4 e4 d4] [d4 f4 g4 a4 g4 f4 d4 c4] [a3 c4 d4 e4 d4 c4 a3 g3] [e4 g4 a4 b4 d5 b4 a4 g4]>").sound("gm_distortion_guitar").hpf(250).lpf(3200).attack(0.003).decay(0.1).sustain(0.25).release(0.15).gain(1.2)
    .jux(rev)
    .off(1/8, x=>x.add(12).gain(0.3))
  ],
  [4, note("<[~ a2,e3 ~ ~ ~ ~ ~ ~]>").sound("gm_distortion_guitar").hpf(300).lpf(1600).attack(0.002).decay(0.1).sustain(0.3).release(0.2).gain(0.5)],
  [4, note("<[~ e3,b3 e3,b3 ~ g3,d4 ~ e3,b3 ~] [~ d3,a3 d3,a3 ~ f3,c4 ~ d3,a3 ~] [~ a2,e3 a2,e3 ~ c3,g3 ~ a2,e3 ~] [~ e3,b3 e3,b3 ~ g3,d4 ~ e3,b3 ~]>").sound("gm_distortion_guitar").hpf(300).lpf(2200).attack(0.002).decay(0.08).sustain(0.15).release(0.05).gain(1.0)]
)
  ._spiral({ steady: .96 })
  .color("cyan") // guitarra = celeste (jux la hace ver también en verde, propio de jux)

$: arrange( // TECLADO
  [4, silence],
  [8, silence],
  [8, note("<[e3,g3,b3 ~ ~ ~ ~ ~ ~ ~] [d3,f3,a3 ~ ~ ~ ~ ~ ~ ~] [a2,c3,e3 ~ ~ ~ ~ ~ ~ ~] [e3,g3,b3 ~ ~ ~ ~ ~ ~ ~]>").sound("gm_epiano1").lpf(3000).attack(0.01).decay(0.3).sustain(0.7).release(0.4).gain(0.6)
    .vib(4).vibmod(0.3)
    .room(0.4)
  ],
  [4, silence],
  [4, silence]
)
  ._pianoroll()
  .color("magenta") // teclado = magenta

$: arrange( // KICK - SNARE
  [4, s("<[bd ~ ~ ~ bd ~ ~ ~]>").lpf(2000).attack(0.001).decay(0.15).sustain(0.3).release(0.1)],
  [8, s("<[bd ~ sn ~ bd ~ bd sn] [bd ~ sn ~ bd ~ bd sn] [bd ~ sn ~ bd ~ bd sn] [bd ~ sn ~ bd ~ bd sn]>").lpf(2000).attack(0.001).decay(0.15).sustain(0.3).release(0.1)],
  [8, s("<[bd ~ sn bd bd ~ bd sn] [bd ~ sn bd bd ~ bd sn] [bd ~ sn bd bd ~ bd sn] [bd ~ sn bd bd ~ bd sn]>").lpf(2200).attack(0.001).decay(0.15).sustain(0.3).release(0.1).gain(1.1)],
  [4, s("<[~ ~ sn ~ ~ ~ ~ ~]>").lpf(1500).attack(0.001).decay(0.15).sustain(0.3).release(0.1).gain(0.6)],
  [4, s("<[bd ~ sn ~ bd ~ bd sn] [bd ~ sn ~ bd ~ bd sn] [bd ~ sn ~ bd ~ bd sn] [bd sn bd sn bd ~ sn sn]>").lpf(2000).attack(0.001).decay(0.15).sustain(0.3).release(0.1)]
).color("red") // kick/snare = rojo

$: arrange( // HI-HATS
  [4, silence],
  [8, s("<[hh hh hh hh hh hh hh oh] [hh hh hh hh hh hh hh oh] [hh hh hh hh hh hh hh oh] [hh hh hh hh hh hh hh oh]>").gain(0.6).lpf(6000).attack(0.001).decay(0.05).sustain(0.1).release(0.05)],
  [8, s("<[hh hh hh hh hh hh hh oh] [hh hh hh hh hh hh hh oh] [hh hh hh hh hh hh hh oh] [hh hh hh hh hh hh hh oh]>").gain(0.7).lpf(7000).attack(0.001).decay(0.05).sustain(0.1).release(0.05)],
  [4, s("<hh*4>").gain(0.3).lpf(4000).attack(0.001).decay(0.05).sustain(0.1).release(0.05)],
  [4, s("<[hh hh hh hh hh hh hh oh] [hh hh hh hh hh hh hh oh] [hh hh hh hh hh hh hh oh] [hh hh hh hh hh hh hh oh]>").gain(0.6).lpf(6000).attack(0.001).decay(0.05).sustain(0.1).release(0.05).ply("<1 1 2 1>")]
).color("yellow") // hi-hat = amarillo

$: arrange( // CRASH
  [4, s("<crash ~ ~ ~>").gain(0.6).lpf(6000)],
  [8, silence],
  [8, s("<crash ~ ~ ~ crash ~ ~ ~>").gain(0.8).lpf(7000)],
  [4, s("<~ ~ ~ ~>")],
  [4, s("<crash ~ ~ ~>").gain(0.7).lpf(6000)]
).color("orange") // crash = naranja

$: arrange( // TOMS
  [4, silence],
  [8, s("<[~ ~ ~ ~ ~ ~ ~ ~] [~ ~ ~ ~ ~ ~ ~ ~] [~ ~ ~ ~ ~ ~ ~ ~] [~ ~ lt ~ mt ht mt sn]>").gain(0.7).lpf(2500)],
  [8, silence],
  [4, silence],
  [4, s("<[~ ~ ~ ~ ~ ~ ~ ~] [~ ~ ~ ~ ~ ~ ~ ~] [~ ~ ~ ~ ~ ~ ~ ~] [~ ~ lt mt ht mt ht sn]>").gain(0.8).lpf(2500)]
).color("brown") // toms = marrón

$: arrange( // SNARE GHOST
  [4, silence],
  [8, s("<[~ sn:0.3 ~ ~ ~ sn:0.3 ~ ~] [~ sn:0.3 ~ ~ ~ sn:0.3 ~ ~] [~ sn:0.3 ~ ~ ~ sn:0.3 ~ ~] [~ sn:0.3 ~ ~ ~ ~ ~ ~]>").gain(0.4).lpf(1800).sound("tr727_sh")],
  [8, silence],
  [4, silence],
  [4, s("<[~ sn:0.3 ~ ~ ~ sn:0.3 ~ ~] [~ sn:0.3 ~ ~ ~ sn:0.3 ~ ~] [~ sn:0.3 ~ ~ ~ sn:0.3 ~ ~] [~ sn:0.3 ~ ~ ~ ~ ~ ~]>").gain(0.4).lpf(1800).sound("tr727_sh")]
).color("pink") // snare ghost = rosa
```
</details>

## INVESTIGACIÓN
### ACTIVIDAD 11-15

**CÓDIGO**

<details>

<summary>STRUDEL RPL</summary>

### CÓDIGO DE LA EXPERIMENTACIÓN SONORA - RESULTADO ACTIVIDAD 9

```js
// Strudel example for strudel_visual_router_v2
const { visualid } = createParams('visualid')

setcpm(24.5)

let drum = stack(
  s("oh:1").beat("3,5,9,13", 16).visualid("holis_oh"),
  s("hh").beat("0,1,4,6,8,10,12,14", 16),
  s("cp").beat("4,12", 16),
  s("bd").beat("0,2,3,7,9,10,15", 16)
).bank("RolandTr909")

$drum: stack(drum, drum.osc())

let melody = note("[c4 c4 e4 g4 e4 e4 ~ d4 c4 a3 a3 a3 ~ d4 d4 c4]")
  .sound("piano").legato(1).visualid("holis_melo")

$melody: stack(melody, melody.osc())

let harmony = note("<[f3,a3,c4,e4] [g3,b3,d4,e4] [e3,g3,b3,d4] [a3,c4,e4,b4]>")
  .sound("piano")
  .attack(slider(0.233, 0, 1))
  .lpf(slider(1483.2, 300, 2000))
  .room(2)
  .visualid("holis_mony")

$harmony: stack(harmony, harmony.osc())
```
</details>



