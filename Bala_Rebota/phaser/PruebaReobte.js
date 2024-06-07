function randomSign() {
    return Math.random() < 0.5 ? -1 : 1;
}

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

function preload() {
    juego.load.image('fondo', 'assets/game/fondo.jpg');
    juego.load.spritesheet('mono', 'assets/sprites/altair.png', 32, 48);
    juego.load.image('bala', 'assets/sprites/purple_ball.png');
    juego.load.image('menu', 'assets/game/menu.png');
}

function create() {
    juego.physics.startSystem(Phaser.Physics.ARCADE);
    juego.physics.arcade.gravity.y = 300;  // Configurar la gravedad global

    fondo = juego.add.tileSprite(0, 0, w, h, 'fondo');
    jugador = juego.add.sprite(w / 2, h / 2, 'mono');
    bala3 = juego.add.sprite(w - 100, h - 370, 'bala');
    
    juego.physics.enable(jugador);
    jugador.body.collideWorldBounds = true;
    jugador.body.allowGravity = false; // Desactivar la gravedad para el jugador
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

    nnNetwork = new synaptic.Architect.Perceptron(3, 10, 10, 4); // Ajuste la cantidad de entradas y capas ocultas
    nnEntrenamiento = new synaptic.Trainer(nnNetwork);
}

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
        direccionBala3Vertical *= -1;
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
