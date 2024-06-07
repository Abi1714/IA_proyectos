function randomSign() {
    return Math.random() < 0.5 ? -1 : 1;
}

var w = 800;
var h = 400;
var jugador, fondo, nave, bala;
var subir, bajar, avanza, retrocede, pausaL, menu;
var velocidadBala, despBala;
var estatusAire, estatuSuelo, estatusDerecha, estatusIzquierda;
var nnNetwork, nnEntrenamiento, nnSalida, datosEntrenamiento = [];
var modoAuto = false, eCompleto = false;
var maxDerecha = 650, maxIzquierda = 50, minRetroceso = 650;
var balaD = false;

var juego = new Phaser.Game(w, h, Phaser.CANVAS, '', { preload: preload, create: create, update: update, render: render });

function preload() {
    juego.load.image('fondo', 'assets/game/fondo.jpg');
    juego.load.spritesheet('mono', 'assets/sprites/altair.png', 32, 48);
    juego.load.image('nave', 'assets/game/ufo.png');
    juego.load.image('bala', 'assets/sprites/purple_ball.png');
    juego.load.image('menu', 'assets/game/menu.png');
}

function create() {
    juego.physics.startSystem(Phaser.Physics.ARCADE);
    juego.physics.arcade.gravity.y = 800;

    fondo = juego.add.tileSprite(0, 0, w, h, 'fondo');
    nave = juego.add.sprite(w - 100, h - 70, 'nave');
    bala = juego.add.sprite(w - 100, h, 'bala');
    jugador = juego.add.sprite(50, h, 'mono');

    juego.physics.enable(jugador);
    jugador.body.collideWorldBounds = true;
    jugador.animations.add('corre', [8, 9, 10, 11]);
    jugador.animations.play('corre', 10, true);

    juego.physics.enable(bala);
    bala.body.collideWorldBounds = true;
    bala.body.bounce.set(1);
    juego.physics.enable(nave);
    nave.body.collideWorldBounds = true;

    pausaL = juego.add.text(w - 100, 20, 'Pausa', { font: '20px Arial', fill: '#fff' });
    pausaL.inputEnabled = true;
    pausaL.events.onInputUp.add(pausa, this);
    juego.input.onDown.add(mPausa, this);

    subir = juego.input.keyboard.addKey(Phaser.Keyboard.UP);
    bajar = juego.input.keyboard.addKey(Phaser.Keyboard.DOWN);
    avanza = juego.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
    retrocede = juego.input.keyboard.addKey(Phaser.Keyboard.LEFT);

    nnNetwork = new synaptic.Architect.Perceptron(8, 5, 5, 5, 4); // Ajuste la cantidad de entradas a 8
    nnEntrenamiento = new synaptic.Trainer(nnNetwork);
}

function enRedNeural() {
    nnEntrenamiento.train(datosEntrenamiento, { rate: 0.0003, iterations: 10000, shuffle: true });
}

function verificarEntrada(input) {
    if (input.some(isNaN)) {
        console.error('Las entradas contienen NaN:', input);
        return false;
    }
    return true;
}

function datosDeEntrenamiento(param_entrada) {
    if (!verificarEntrada(param_entrada)) return false;

    nnSalida = nnNetwork.activate(param_entrada);
    if (nnSalida.some(isNaN)) {
        console.error('Salida inválida de la red neuronal:', nnSalida);
        return false;
    }

    var aire = Math.round(nnSalida[0] * 100);
    var piso = Math.round(nnSalida[1] * 100);
    var derecha = Math.round(nnSalida[2] * 100);
    var izquierda = Math.round(nnSalida[3] * 100);
    console.log(" En el Aire %: " + aire
        + "\n En el suelo %: " + piso
        + "\n En la derecha %: " + derecha
        + "\n En la izquierda %: " + izquierda
    );
    return nnSalida[2] >= nnSalida[3];
}

function EntrenamientoMovimiento(param_entrada) {
    if (!verificarEntrada(param_entrada)) return false;

    nnSalida = nnNetwork.activate(param_entrada);
    if (nnSalida.some(isNaN)) {
        console.error('Salida inválida de la red neuronal:', nnSalida);
        return false;
    }

    var arriba = Math.round(nnSalida[0] * 100);
    var abajo = Math.round(nnSalida[1] * 100);
    console.log(" Arriba %: " + arriba
        + "\n Abajo %: " + abajo
    );
    return nnSalida[0] >= nnSalida[1];
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
            if (mouse_x >= menu_x1 && mouse_x <= menu_x2 && mouse_y >= menu_y1 && mouse_y <= menu_y1 + 90) {
                eCompleto = false;
                datosEntrenamiento = [];
                modoAuto = false;
            } else if (mouse_x >= menu_x1 && mouse_x <= menu_x2 && mouse_y >= menu_y1 + 90 && mouse_y <= menu_y2) {
                if (!eCompleto) {
                    console.log("", "Entrenamiento " + datosEntrenamiento.length + " valores");
                    enRedNeural();
                    eCompleto = true;
                }
                modoAuto = true;
            }

            resetVariables();
            resetPlayer();
            juego.paused = false;
            menu.destroy();
        }
    }
}

function resetVariables() {
    bala.body.velocity.x = 0;
    bala.position.x = w - 100;
    balaD = false;
}

function resetPlayer() {
    jugador.position.x = maxIzquierda;
    jugador.position.y = h;
    jugador.body.velocity.x = 0;
    jugador.body.velocity.y = 0;
}

function moverArriba() {
    jugador.body.velocity.y = -100;
}

function moverAbajo() {
    jugador.body.velocity.y = 100;
}

function correr() {
    jugador.body.velocity.x = 100;
}

function correrAtras() {
    jugador.body.velocity.x = -5;
}

function Detenerse() {
    jugador.body.velocity.x = 0;
    jugador.body.velocity.y = 0;
}

function update() {
    if (!juego.paused) {
        if (modoAuto) {
            // Desactivar control manual en modo automático
            juego.input.keyboard.disabled = true;
        } else {
            // Activar control manual en modo manual
            juego.input.keyboard.disabled = false;
        }

        if (modoAuto) {
            despBala = Math.floor(jugador.position.x - bala.position.x);
            velocidadBala = bala.body.velocity.x;

            // Verifica los valores antes de usarlos
            if (isNaN(despBala) || isNaN(velocidadBala)) {
                console.error('despBala o velocidadBala es NaN', despBala, velocidadBala);
                return;
            }

            var inputDatos = [despBala, velocidadBala, jugador.position.x, jugador.position.y, estatusAire, estatuSuelo, estatusDerecha, estatusIzquierda];

            if (EntrenamientoMovimiento(inputDatos)) {
                moverArriba();
            } else {
                moverAbajo();
            }

            if (datosDeEntrenamiento(inputDatos)) {
                correr();
            } else if (jugador.body.onFloor() && jugador.position.x >= maxIzquierda) {
                Detenerse();
                correrAtras();
            }
        } else {
            if (avanza.isDown) {
                jugador.body.velocity.x = 150;
            } else if (retrocede.isDown) {
                jugador.body.velocity.x = -150;
            } else {
                jugador.body.velocity.x = 0;
            }

            // Lógica para mover arriba y abajo
            if (subir.isDown) {
                moverArriba();
            } else if (bajar.isDown) {
                moverAbajo();
            } else {
                jugador.body.velocity.y = 0;
            }
        }
    }

    fondo.tilePosition.x -= 1;

    juego.physics.arcade.collide(nave, jugador, colisionH, null, this);
    juego.physics.arcade.collide(bala, jugador, colisionH, null, this);

    estatuSuelo = 1;
    estatusAire = 0;
    estatusDerecha = 0;
    estatusIzquierda = 1;

    if (!jugador.body.onFloor() || jugador.body.velocity.y !== 0) {
        estatuSuelo = 0;
        estatusAire = 1;
    }

    if (jugador.body.velocity.x >= 140) {
        estatusDerecha = 1;
        estatusIzquierda = 0;
    }

    despBala = Math.floor(jugador.position.x - bala.position.x);

    if (!balaD) {
        disparo();
    }

    if (modoAuto === false && bala.position.x > 0) {
        datosEntrenamiento.push({
            'input': [despBala, velocidadBala, jugador.position.x, jugador.position.y],
            'output': [estatusAire, estatuSuelo, estatusDerecha, estatusIzquierda]
        });

        console.log(
            "Distancia de la Bala 1: ", despBala + "\n" +
            "Velocidad de la Bala 1: " + velocidadBala + "\n" +
            "Posición X del Jugador: ", jugador.position.x + "\n" +
            "Posición Y del Jugador: ", jugador.position.y + "\n"
        );
    }
}

function disparo() {
    velocidadBala = velocidadRandom(-540, -200);
    bala.body.velocity.setTo(velocidadBala, velocidadRandom(-540, -200));
    balaD = true;
}

function colisionH() {
    pausa();
}

function velocidadRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function render() {

}
