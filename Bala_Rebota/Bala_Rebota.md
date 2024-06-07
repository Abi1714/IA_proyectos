# Bala que rebota
# Introducción

Este código implementa un juego 2D utilizando el framework Phaser, con la incorporación de una red neuronal mediante la biblioteca Synaptic. El objetivo del juego es controlar un jugador que debe evitar colisiones con una bala en movimiento. La red neuronal se utiliza para entrenar el comportamiento automático del jugador, permitiendo que tome decisiones basadas en su posición relativa a la bala.

## Código y Explicación

### Función para Generar un Signo Aleatorio

```javascript
function randomSign() {
    return Math.random() < 0.5 ? -1 : 1;
}
```

Esta función devuelve aleatoriamente -1 o 1, que se utiliza para determinar la dirección de movimiento de la bala.

### Variables Globales

```javascript
var w = 800;
var h = 400;
var jugador, fondo, bala3;
var arriba, abajo, avanza, retrocede, pausaL, menu;
var velocidadBala3, despBalaHorizontal3, despBalaVertical3, despBala3;
var estatusAire, estatuSuelo, estatusDerecha, estatusIzquierda;
var nnNetwork, nnEntrenamiento, nnSalida, datosEntrenamiento = [];
var modoAuto = false, eCompleto = false;
var maxDerecha = 650, maxIzquierda = 50, minRetroceso = 650;
var velocidadBala3Horizontal = 0, velocidadBala3Vertical = 0;
var direccionBala3Horizontal = 1, direccionBala3Vertical = 1;
var distanciaReboteHorizontal = 0, distanciaReboteVertical = 0;
var reboteActivo = false;
var balaD3 = false;

var juego = new Phaser.Game(w, h, Phaser.CANVAS, '', { preload: preload, create: create, update: update, render: render });
```

Se definen las variables globales necesarias para el juego, incluyendo las dimensiones del juego, los objetos del jugador y la bala, controles, parámetros de la red neuronal, y estados del juego.

### Pre-carga de Activos

```javascript
function preload() {
    juego.load.image('fondo', 'assets/game/fondo.jpg');
    juego.load.spritesheet('mono', 'assets/sprites/altair.png', 32, 48);
    juego.load.image('bala', 'assets/sprites/purple_ball.png');
    juego.load.image('menu', 'assets/game/menu.png');
}
```

Se cargan los activos del juego, incluyendo el fondo, los sprites del jugador, y la imagen de la bala.

### Creación del Juego

```javascript
function create() {
    juego.physics.startSystem(Phaser.Physics.ARCADE);
    juego.physics.arcade.gravity.y = 300;

    fondo = juego.add.tileSprite(0, 0, w, h, 'fondo');
    jugador = juego.add.sprite(w / 2, h / 2, 'mono');
    bala3 = juego.add.sprite(w - 100, h - 370, 'bala');
    
    juego.physics.enable(jugador);
    jugador.body.collideWorldBounds = true;
    jugador.body.allowGravity = false;
    jugador.animations.add('corre', [8, 9, 10, 11]);
    jugador.animations.play('corre', 10, true);

    juego.physics.enable(bala3);
    bala3.body.collideWorldBounds = true;
    bala3.body.bounce.set(1);

    pausaL = juego.add.text(w - 100, 20, 'Pausa', { font: '20px Arial', fill: '#fff' });
    pausaL.inputEnabled = true;
    pausaL.events.onInputUp.add(pausa, this);
    juego.input.onDown.add(mPausa, this);

    arriba = juego.input.keyboard.addKey(Phaser.Keyboard.UP);
    abajo = juego.input.keyboard.addKey(Phaser.Keyboard.DOWN);
    avanza = juego.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
    retrocede = juego.input.keyboard.addKey(Phaser.Keyboard.LEFT);

    nnNetwork = new synaptic.Architect.Perceptron(3, 10, 10, 4);
    nnEntrenamiento = new synaptic.Trainer(nnNetwork);
}
```

### Funciones de Entrenamiento de la Red Neuronal

```javascript
function enRedNeural() {
    nnEntrenamiento.train(datosEntrenamiento, { rate: 0.0003, iterations: 30000, shuffle: true });
    console.log("Entrenamiento Terminado");
}

function verificarEntrada(input) {
    if (input.some(isNaN)) {
        console.error('Las entradas contienen NaN:', input);
        return false;
    }
    return true;
}

function datosDeEntrenamiento(param_entrada) {
    if (!verificarEntrada(param_entrada)) return 4;

    nnSalida = nnNetwork.activate(param_entrada);
    if (nnSalida.some(isNaN)) {
        console.error('Salida inválida de la red neuronal:', nnSalida);
        return 4;
    }

    var porcentajeArriba = Math.round(nnSalida[0] * 100);
    var porcentajeAbajo = Math.round(nnSalida[1] * 100);
    var porcentajeDerecha = Math.round(nnSalida[2] * 100);
    var porcentajeIzquierda = Math.round(nnSalida[3] * 100);

    console.log("Arriba: " + porcentajeArriba + " Abajo: " + porcentajeAbajo + " Der: " + porcentajeDerecha + " Izq: " + porcentajeIzquierda);
    
    var maxValue = Math.max(nnSalida[0], nnSalida[1], nnSalida[2], nnSalida[3]);
    var minValue = Math.min(nnSalida[0], nnSalida[1], nnSalida[2], nnSalida[3]);
    var umbral = maxValue - minValue;
    var accion = nnSalida.indexOf(maxValue);

    if (umbral < 0.01) {
        return 4;
    }
    return accion;
}
```

Estas funciones entrenan la red neuronal con los datos recopilados y determinan la acción a tomar basada en la salida de la red neuronal.

### Función de Pausa

```javascript
function pausa() {
    juego.paused = true;
    menu = juego.add.sprite(w / 2, h / 2, 'menu');
    menu.anchor.setTo(0.5, 0.5);
}

function mPausa(event) {
    if (juego.paused) {
        var menu_x1 = w / 2 - 270 / 2, menu_x2 = w / 2 + 270 / 2,
            menu_y1 = h / 2 - 180 / 2, menu_y2 = h / 2 + 180 / 2;

        var mouse_x = event.x,
            mouse_y = event.y;

        if (mouse_x > menu_x1 && mouse_x < menu_x2 && mouse_y > menu_y1 && mouse_y < menu_y2) {
            if (mouse_y <= menu_y1 + 90) {
                eCompleto = false;
                datosEntrenamiento = [];
                modoAuto = false;
            } else {
                if (!eCompleto) {
                    enRedNeural();
                    eCompleto = true;
                }
                modoAuto = true;
            }
            resetVariables3();
            resetPlayer();
            juego.paused = false;
            menu.destroy();
        }
    }
}
```

Permite pausar y reanudar el juego, y maneja el menú de pausa.

### Funciones de Restablecimiento y Movimiento del Jugador

```javascript
function resetVariables3() {
    bala3.body.velocity.y = -270;
    bala3.body.velocity.x = 0;
    bala3.position.x = w - 100;
    bala3.position.y = h - 370;
    balaD3 = false;
}

function resetPlayer() {
    jugador.position.x = w / 2;
    jugador.position.y = h / 2;
    jugador.body.velocity.x = 0;
    jugador.body.velocity.y = 0;
}
```

Estas funciones manejan el restablecimiento de variables del juego y la posición del jugador.

### Función de Actualización del Juego

```javascript
function update() {
    if (!juego.paused) {
        if (modoAuto) {
            var inputDatos = [despBala3, jugador.position.x, jugador.position.y];
            var decision = datosDeEntrenamiento(inputDatos);
            if (decision === 0) {
                jugador.body.velocity.y = -150;
                jugador.body.velocity.x = 0;
            } else if (decision === 1) {
                jugador.body.velocity.y = 150;
                jugador.body.velocity.x = 0;
            } else if (decision === 2) {
                jugador.body.velocity.x = 150;
                jugador.body.velocity.y = 0;
            } else if (decision === 3) {
                jugador.body.velocity.x = -150;
                jugador.body.velocity.y = 0;
            }

        } else {
            jugador.body.velocity.x = avanza.isDown ? 150 : retrocede.isDown ? -150 : 0;
            jugador.body.velocity.y = arriba.isDown ? -150 : abajo.isDown ? 150 : 0;
        }
    }

    if (bala3.position.x <= 0 || bala3.position.x >= juego.world.width) {
        direccionBala3Horizontal *= -1;
    }

    if (bala3.position.y <= 0 || bala3.position.y >= juego.world.height) {
        direccionB

ala3Vertical *= -1;
    }

    velocidadBala3Horizontal = bala3.body.velocity.x;
    velocidadBala3Vertical = bala3.body.velocity.y;

    distanciaReboteHorizontal = Math.floor(jugador.position.x - bala3.position.x);
    distanciaReboteVertical = Math.floor(jugador.position.y - bala3.position.y);

    reboteActivo = bala3.position.x > 0 && bala3.position.x < juego.world.width && bala3.position.y > 0 && bala3.position.y < juego.world.height;

    fondo.tilePosition.x -= 1;

    juego.physics.arcade.collide(bala3, jugador, colisionH, null, this);

    despBalaHorizontal3 = Math.floor(jugador.position.x - bala3.position.x);
    despBalaVertical3 = Math.floor(jugador.position.y - bala3.position.y);
    despBala3 = despBalaHorizontal3 + despBalaVertical3;

    if (!balaD3) {
        disparo3();
    }

    if (!modoAuto && bala3.position.x > 0) {
        datosEntrenamiento.push({
            'input': [despBala3, jugador.position.x, jugador.position.y],
            'output': [
                jugador.body.velocity.y < 0 ? 1 : 0, // estado_arriba
                jugador.body.velocity.y > 0 ? 1 : 0, // estado_abajo
                jugador.body.velocity.x > 0 ? 1 : 0, // estado_derecha
                jugador.body.velocity.x < 0 ? 1 : 0  // estado_izquierda
            ]
        });
    }
}
```

Esta función maneja la lógica principal del juego, incluyendo la detección de colisiones, la actualización del estado del jugador y el control de la red neuronal en modo automático.

### Funciones de Disparo y Colisión

```javascript
function disparo3() {
    velocidadBala3 = -velocidadRandom(200, 370);
    bala3.body.velocity.y = 0;
    bala3.body.velocity.x = 1.6 * velocidadBala3;
    balaD3 = true;
}

function colisionH() {
    pausa();
}

function velocidadRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function render() {}
```

Estas funciones manejan los disparos de las balas, la detección de colisiones y la generación de velocidades aleatorias para las balas.
