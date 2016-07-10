var Cultrum = function (game) {}

// Load images and sounds
Cultrum.prototype.preload = function () {
    this.game.load.image('star', 'assets/star.png');
    this.game.load.image('tree', 'assets/tree.png', 32, 32);
};

Cultrum.prototype.create = function () {
  this.player = null;
  this.speed = 200;

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
  this.player = game.add.graphics(32, 32);
  this.player.beginFill(0xff0000);
  this.player.arc(0, 0, 16, 90 * (Math.PI / 180), 270 * (Math.PI / 180), false, 8);
  this.player.moveTo(0, -16);
  this.player.lineTo(16, 0);
  this.player.lineTo(0, 16);
  this.player.endFill();

  // Listen for clicks and move the character
  game.input.onDown.add(this.moveCharacter, this);
}

Cultrum.prototype.update = function () {
  //
}

Cultrum.prototype.render = function () {
  // Just renders out the pointer data when you touch the canvas
  game.debug.pointer(game.input.mousePointer);
  // Show FPS
  game.debug.text(game.time.fps || '--', 2, 14, "#FF0000");
}

Cultrum.prototype.moveCharacter = function (pointer) {
  // Set the character rotation
  this.player.rotation = game.physics.arcade.angleToPointer(this.player, pointer);

  // Calculate the distance
  var duration = (game.physics.arcade.distanceToPointer(this.player, pointer) / this.speed) * 1000;
  // Stop the previous tween
  this.player.tween && this.player.tween.stop();
  // And start a new one
  this.player.tween = game.add.tween(this.player).to({ x: pointer.x, y: pointer.y }, duration, Phaser.Easing.Linear.None, true);
}

// Setup game
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game');
game.state.add('game', Cultrum, true);
