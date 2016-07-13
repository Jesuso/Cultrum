var Cultrum = function (game) {}

// Load images and sounds
Cultrum.prototype.preload = function () {
    this.game.load.image('star', 'assets/star.png');
    this.game.load.image('tree', 'assets/tree.png', 32, 32);
};

Cultrum.prototype.create = function () {
  // Players currently online
  this.players = [];

  // Points to the current player
  this.me = null;

  this.speed = 200;
  this.trees = [];

  // Advanced profiling, including the fps rate, fps min/max, suggestedFps and msMin/msMax are updated
  this.game.time.advancedTiming = true;

  // Connect to the server
  this.connection();

  // Change the BG color
  this.game.stage.backgroundColor = 0x4488cc;

  // Add a few trees
  for (var i = 0; i < 32; i++) {
    var x = Math.round(Math.random() * (800 / 32));
    var y = Math.round(Math.random() * (600 / 32));

    var tree = this.game.add.sprite(x * 32, y * 32, 'tree');
    this.trees.push(tree);
    //tree.anchor.set(0.5);
    tree.inputEnabled = true;
    tree.events.onInputOver.add(function (tree) { tree.tint = 0x00ff00; });
    tree.events.onInputOut.add(function (tree) { tree.tint = 0xffffff;   });
    tree.events.onInputDown.add(function (tree) { tree.kill(); });
  }

  // Init the game controls
  // this.game.input.keyboard.addKeyCapture([ Phaser.Keyboard.W, Phaser.Keyboard.A, Phaser.Keyboard.S, Phaser.Keyboard.D ]);
  this.controls = {};
  this.controls.upKey = this.game.input.keyboard.addKey(Phaser.Keyboard.W);
  this.controls.leftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
  this.controls.downKey = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
	this.controls.rightKey = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
  this.game.input.keyboard.addCallbacks(this, this.onKeyDown, this.onKeyUp);
}

Cultrum.prototype.update = function () {
  if (this.me) {
    // Show the line
    this.line = new Phaser.Line(this.me.x, this.me.y, 0, 0);
    this.line.start = this.me.position;
    this.line.end = this.game.input.activePointer.position;

    this.game.debug.geom(this.line, 'rgb(0,255,0)');

    // Ray casting!
    // Check for any possible intersections along the way.
    this.trees.forEach(function (tree) {
      var ray = new Phaser.Line(this.me.x, this.me.y, this.game.input.activePointer.x, this.game.input.activePointer.y);

      // Create an array of lines that represent the four edges of each tree
      var lines = [
          new Phaser.Line(tree.x, tree.y, tree.x + tree.width, tree.y),
          new Phaser.Line(tree.x, tree.y, tree.x, tree.y + tree.height),
          new Phaser.Line(tree.x + tree.width, tree.y, tree.x + tree.width, tree.y + tree.height),
          new Phaser.Line(tree.x, tree.y + tree.height, tree.x + tree.width, tree.y + tree.height)
      ];

      // Test each of the edges in this tree against the ray.
      // If the ray intersects any of the edges then the tree must be in the way.
      for (var i = 0; i < lines.length; i++) {
        // this.game.debug.geom(lines[i], 'rgb(0,255,0)');
        var intersect = Phaser.Line.intersects(ray, lines[i]);

        if (intersect) {
          distance = this.game.math.distance(ray.start.x, ray.start.y, intersect.x, intersect.y);
          tree.tint = 0xff0000;
          // game.debug.spriteBounds(tree, null, false);
          break;
        } else {
          tree.tint = 0xffffff;
        }
      }
    }, this);
  }
}

Cultrum.prototype.render = function () {
  // Just renders out the pointer data when you touch the canvas
  // this.game.debug.pointer(this.game.input.mousePointer);

  // Show FPS
  this.game.debug.text(this.game.time.fps || '--', 2, 14, "#00FF00");
}

Cultrum.prototype.connection = function () {
  // Keep a reference to the "this" so we can use it inside our anon functions
  var SELF = this;

  this.socket = io('http://localhost');

  // Handles player joins
  this.socket.on('join', function (data) {
    console.log('Player joined: ', data);

    // Add a player
    var player = Cultrum.Player.CreateSprite(SELF.game);
    player.id = data.id;
    SELF.players.push(player);
  });

  // Handles your own join
  this.socket.on('online', function (data) {
    console.log('You are now online as player ' + data.id);
    SELF.me = SELF.getPlayerById(data.id);
  });

  this.socket.on('leave', function (data) {
    console.log('Player left: ', data);
  });

  this.socket.on('keydown', function (data) {
    console.log('Player keydown: ', data);
  });

  this.socket.on('keyup', function (data) {
    console.log('Player keyup: ', data);
  });
}

Cultrum.prototype.getPlayerById = function (id) {
  var player = null;

  this.players.forEach(function (p) {
    if (p.id === id)
      return player = p;
  });

  return player;
};

/**
 * Tells the server when certain keys are pressed.
 */
Cultrum.prototype.onKeyDown = function (event) {
  // Up
  if (event.keyCode == Phaser.Keyboard.W && this.controls.upKey.justDown) {
    this.socket.emit('keydown', { key: 'up' });
  }

  // Left
  if (event.keyCode == Phaser.Keyboard.A && this.controls.leftKey.justDown) {
    this.socket.emit('keydown', { key: 'left' });
  }

  // Down
  if (event.keyCode == Phaser.Keyboard.S && this.controls.downKey.justDown) {
    this.socket.emit('keydown', { key: 'down' });
  }

  // Right
  if (event.keyCode == Phaser.Keyboard.D && this.controls.rightKey.justDown) {
    this.socket.emit('keydown', { key: 'right' });
  }
};

/**
 * Tells the server when certain keys are released.
 */
Cultrum.prototype.onKeyUp = function () {
  // Up
  if (event.keyCode == Phaser.Keyboard.W && this.controls.upKey.justUp) {
    this.socket.emit('keyup', { key: 'up' });
  }

  // Left
  if (event.keyCode == Phaser.Keyboard.A && this.controls.leftKey.justUp) {
    this.socket.emit('keyup', { key: 'left' });
  }

  // Down
  if (event.keyCode == Phaser.Keyboard.S && this.controls.downKey.justUp) {
    this.socket.emit('keyup', { key: 'down' });
  }

  // Right
  if (event.keyCode == Phaser.Keyboard.D && this.controls.rightKey.justUp) {
    this.socket.emit('keyup', { key: 'right' });
  }
};

Cultrum.prototype.moveCharacter = function (pointer) {
  // Set the character rotation
  this.player.rotation = this.game.physics.arcade.angleToPointer(this.player, pointer);

  // Calculate the distance
  var duration = (this.game.physics.arcade.distanceToPointer(this.player, pointer) / this.speed) * 1000;
  // Stop the previous tween
  this.player.tween && this.player.tween.stop();
  // And start a new one
  this.player.tween = this.game.add.tween(this.player).to({ x: pointer.x, y: pointer.y }, duration, Phaser.Easing.Linear.None, true);
}

Cultrum.Player = function () {}

Cultrum.Player.CreateSprite = function (game) {
  var graphics = game.add.graphics(32, 32);
  graphics.beginFill(0xff0000);
  graphics.arc(0, 0, 16, 90 * (Math.PI / 180), 270 * (Math.PI / 180), false, 8);
  graphics.moveTo(0, -16);
  graphics.lineTo(16, 0);
  graphics.lineTo(0, 16);
  graphics.endFill();

  return graphics;
}

/**
 * A tree entity, this should extend a more basic class in the future
 */
Cultrum.Tree = function () {}

/**
 * Runs when a player clicks the tree.
 */
Cultrum.Tree.onClick = function () {
  //
}

/**
 * Launches the game. This should be executed when the document finishes loading.
 */
function launch () {
  // Setup game
  var game = new Phaser.Game(document.body.offsetWidth, window.innerHeight, Phaser.AUTO, 'game');
  game.state.add('game', Cultrum, true);
}
