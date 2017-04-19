var heigth_screen = window.innerHeight;
var width_screen = window.innerWidth;

var game,ship,shipZoom,shipSize,enemies,bigEnemies,healths,starfield,cursors,
    shipHP,shipHPCaption,speed,velocityX,velocityY,gameState;
var timer;
var seconds = 0;
var bestTimeSec;

var Start = function(){
    shipZoom = 2;
    shipSize = 30;
    shipHP = 3;
    speed = 200;
    velocityX = 100;
    velocityY = 100;
};

Start();

game = new Phaser.Game(width_screen, heigth_screen, Phaser.CANVAS, 'phaser-example',
    {preload: preload, create: create, update: update,render: render});

function create() {
    game.physics.startSystem(Phaser.Physics.BOX2D);
    game.physics.box2d.restitution = 0.9;
    game.physics.box2d.setBoundsToWorld();
    cursors = game.input.keyboard.createCursorKeys();

    starfield = game.add.tileSprite(0, 0, width_screen, heigth_screen, 'stars');
    shipHPCaption = game.add.text(5, 30, 'Ship health: ' + shipHP, { fill: '#aaffaa', font: '14pt Arial' });
    var sound = this.game.add.audio('sound');
    sound.loopFull();

    timerCreate();

    bestTimeCreate();

    shipCreate();

    healthCreate();

    enemiesCreate();

    bigEnemiesCreate();

    difficultyCreate();
}

function bestTimeCreate() {
    bestTimeSec = getCookie('bestTimeSec')
    bestTime = game.add.text(width_screen - 150, 30, 'Best Time: '+fmtMSS(bestTimeSec), { fill: '#aaffaa', font: '14pt Arial' });
}

function timerCreate() {
    timer = game.add.text(500, 30, 'Your Time: '+fmtMSS(seconds), { fill: '#aaffaa', font: '14pt Arial' });

    setInterval(function(){
        if(!game.paused){
            seconds += 1;
            timer.setText('Your Time: '+fmtMSS(seconds));
        }

    }, 1000);

}

function shipCreate() {
    ship = game.add.sprite(200, 200, 'ship');
    ship.scale.set(shipZoom);
    ship.smoothed = false;
    ship.animations.add('fly', [0,1,2,3,4,5], 10, true);
    ship.play('fly');

    game.physics.box2d.enable(ship, false);
    ship.body.fixedRotation = true;
    ship.body.setCircle(shipSize);

}

function healthCreate() {
    healths = game.add.group();
    healths.enableBody = true;
    healths.physicsBodyType = Phaser.Physics.BOX2D;

    var healthEntity = healths.create(game.world.randomX, game.world.randomY, 'firstaid');
    healthEntity.body.sensor = true;

    ship.body.setBodyContactCallback(healthEntity, healthCallback, this);
    shipHPCaption.text = 'Ship health: ' + shipHP;
}

function healthCallback(body1, body2, fixture1, fixture2, begin) {
    if (!begin) return;

    shipHP += 1;
    shipHPCaption.text = 'Ship health: ' + shipHP;

    body2.sprite.destroy();
}

function enemiesCreate() {
    enemies = game.add.group();
    enemies.enableBody = true;
    enemies.physicsBodyType = Phaser.Physics.BOX2D;

    for (var i = 0; i < 6; i++)
    {
        var sprite = enemies.create(game.world.randomX, game.world.randomY, 'enemy');
        sprite.body.setCircle(16);
        sprite.body.velocity.x = -velocityX;
        sprite.body.velocity.y = velocityY;

        ship.body.setBodyContactCallback(sprite, enemyCallback, this);
    }
}

function bigEnemiesCreate() {
    bigEnemies = game.add.group();
    bigEnemies.enableBody = true;
    bigEnemies.physicsBodyType = Phaser.Physics.BOX2D;

    for (var k = 0; k < 3; k++)
    {
        var sprite_big = bigEnemies.create(game.world.randomX, game.world.randomY, 'enemy');
        sprite_big.body.setCircle(40);
        sprite_big.body.velocity.x = velocityX;
        sprite_big.body.velocity.y = -velocityY;
        ship.body.setBodyContactCallback(sprite_big, enemyCallback, this);
    }
}

function enemyCallback(body1, body2, fixture1, fixture2, begin) {
    if (!begin){return;}

    shipHP -= 1;

    if (shipHP <= 0){
        ship.destroy();
        gameOver();
    }

    shipHPCaption.text = 'Ship health: ' + (shipHP > 0 ? shipHP : 'dead!');
}

function gameOver() {
    healths.destroy();
    enemies.destroy();
    bigEnemies.destroy();
    starfield.inputEnabled = true;
    starfield.events.onInputDown.add(listener, this);

    if(seconds > bestTimeSec){
        bestTimeSec = seconds;
        var date = new Date(new Date().getTime() + 60 * 10000);
        document.cookie = "bestTimeSec="+bestTimeSec+"; path=/; expires=" + date.toUTCString();
    }

    gameState = 'GAME OVER\n\n' + 'Your Time: '+fmtMSS(seconds) +'\nBest Time: '+fmtMSS(bestTimeSec)+'\n\nCLICK FOR RESTART!';
    overTxt = game.add.text(game.world.centerX, game.world.centerY, gameState, { fill: 'white', font: '35pt Arial' , align: 'center'});
    overTxt.anchor.x = 0.5;
    overTxt.anchor.y = 0.5;
    setTimeout(function () {
        game.paused = true;
    },50);
}

function difficultyCreate() {

    setInterval(function () {
        if(!game.paused){
            var sprite = enemies.create(game.world.randomX, game.world.randomY, 'enemy');
            sprite.body.setCircle(16);
            sprite.body.velocity.x = velocityX;
            sprite.body.velocity.y = velocityY;
            ship.body.setBodyContactCallback(sprite, enemyCallback, this);
        }
    },2800);

    setInterval(function () {
        if(!game.paused) {
            speed += 5;
            velocityY = (velocityY + 5) * -1;
            velocityX = (velocityY + 5) * -1;
        }
    },4700);

    setInterval(function () {
        if(!game.paused) {
            var sprite = bigEnemies.create(game.world.randomX, game.world.randomY, 'enemy');
            sprite.body.setCircle(40);
            sprite.body.velocity.x = velocityX;
            sprite.body.velocity.y = velocityY;
            ship.body.setBodyContactCallback(sprite, enemyCallback, this);
        }
    },9000);

    setInterval(function () {
        if(!game.paused) {
            shipZoom += 0.062;
            shipSize += 1;
            ship.scale.set(shipZoom);
            ship.body.setCircle(shipSize);
        }
    },10500);

    setInterval(function () {
        if(!game.paused) {
            var sprite = healths.create(game.world.randomX, game.world.randomY, 'firstaid');
            sprite.body.sensor = true;
            ship.body.setBodyContactCallback(sprite, healthCallback, this);
        }
    },16500);
}

function update() {
    ship.body.setZeroVelocity();

    if (cursors.left.isDown)
    {
        ship.body.moveLeft(speed);
    }
    else if (cursors.right.isDown)
    {
        ship.body.moveRight(speed);
    }

    if (cursors.up.isDown)
    {
        ship.body.moveUp(speed);
    }
    else if (cursors.down.isDown)
    {
        ship.body.moveDown(speed);
    }
}

function render() {
    game.debug.box2dWorld();
}

function preload() {
    game.load.image('stars', 'images/starfield.jpg');
    game.load.image('enemy', 'images/shinyball.png');
    game.load.image('firstaid', 'images/firstaid.png');
    game.load.spritesheet('ship', 'images/humstar.png', 32, 32);
    game.load.audio('sound', 'sound.ogg');

}

function listener () {
    game.paused = false;
    starfield.inputEnabled = false;
    seconds = -1;

    Start();

    shipCreate();

    healthCreate();

    enemiesCreate();

    bigEnemiesCreate();

    overTxt.text = "";
}

function fmtMSS(s){return(s-(s%=60))/60+(9<s?':':':0')+s}

function getCookie(name) {
    var matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : 0;
}