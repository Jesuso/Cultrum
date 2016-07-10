var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', { preload: preload, create: create, update: update, render: render });
var player;
var speed = 200;

function preload() {
  game.load.image('sky', 'assets/sky.png');
  game.load.image('star', 'assets/star.png');
  game.load.image('tree', 'assets/tree.png', 32, 32);
}

function create() {
  // Change the BG color
  game.stage.backgroundColor = 0x4488cc;

  // Add a few trees
  for (var i = 0; i < 32; i++) {
    var x = Math.round(Math.random() * (800 / 32));
    var y = Math.round(Math.random() * (600 / 32));

    var tree = game.add.sprite(x * 32, y * 32, 'tree');
    tree.inputEnabled = true;
    tree.events.onInputOver.add(function (tree) {
      tree.alpha = 0.1;
    });
    tree.events.onInputOut.add(function (tree) {
      tree.alpha = 1;
    });
    tree.events.onInputDown.add(function (tree) {
      tree.kill();
    });
  }
  // Add a player
  player = game.add.graphics(32, 32);
  player.beginFill(0xff0000);
  player.arc(0, 0, 16, 90 * (Math.PI / 180), 270 * (Math.PI / 180), false, 8);
  player.moveTo(0, -16);
  player.lineTo(16, 0);
  player.lineTo(0, 16);
  player.endFill();

  // Listen for clicks and move the character
  game.input.onDown.add(moveCharacter, this);
}

function update() {
}

function render() {
  // Just renders out the pointer data when you touch the canvas
  game.debug.pointer(game.input.mousePointer);
  // Show FPS
  game.debug.text(game.time.fps || '--', 2, 14, "#FF0000");
}

function moveCharacter(pointer) {
  // Set the character rotation
  player.rotation = game.physics.arcade.angleToPointer(player, pointer);

  // Calculate the distance
  var duration = (game.physics.arcade.distanceToPointer(player, pointer) / speed) * 1000;
  // Stop the previous tween
  player.tween && player.tween.stop();
  // And start a new one
  player.tween = game.add.tween(player).to({ x: pointer.x, y: pointer.y }, duration, Phaser.Easing.Linear.None, true);
}
