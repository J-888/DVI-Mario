window.addEventListener("load",function() {

	// Set up an instance of the Quintus engine and include
	// the Sprites, Scenes, Input and 2D module. The 2D module
	// includes the `TileLayer` class as well as the `2d` component.
	var Q = window.Q = Quintus()
		.include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX")
		.setup({ 
			maximize: false, // Maximize only on touch devices
			width: 320, // Set the default width to 320 pixels
			height: 480, // Set the default height to 480 pixels

			/*upsampleWidth:  160,  // Double the pixel density of the
			upsampleHeight: 240,  // game if the w or h is 640x960

			downsampleWidth: 640, // Halve the pixel density if resolution
			downsampleHeight: 960  // is larger than or equal to 640x960*/
			
			scaleToFit: true // Scale the game to fit the screen of the player's device

		})
  
		// And turn on default input controls and touch input (for UI)
		.controls().touch()

	/*
	Q.SPRITE_NONE = 0;
	Q.SPRITE_DEFAULT = 1;
	Q.SPRITE_PARTICLE = 2;
	Q.SPRITE_ACTIVE = 4;
	Q.SPRITE_FRIENDLY = 8;
	Q.SPRITE_ENEMY = 16;
	Q.SPRITE_UI = 32;
	Q.SPRITE_ALL = 0xFFFF;
	*/
	
	// ## Mario Sprite
	// The very basic player sprite, this is just a normal sprite
	// using the player sprite sheet with default controls added to it.
	Q.Sprite.extend("Mario",{

		// the init constructor is called on creation
		init: function(p) {
			// You can call the parent's constructor with this._super(..)
			this._super(p, {
				sheet: "marioR",	// Setting a sprite sheet sets sprite width and height
				x: 150,			// You can also set additional properties that can
				y: 380				// be overridden on object creation
			});

			// Add in pre-made components to get up and running quickly
			// The `2d` component adds in default 2d collision detection
			// and kinetics (velocity, gravity)
			// The `platformerControls` makes the player controllable by the
			// default input actions (left, right to move, up or action to jump)
			// It also checks to make sure the player is on a horizontal surface before
			// letting them jump.
			this.add('2d, platformerControls');

			// Write event handlers to respond hook into behaviors.
			// hit.sprite is called everytime the player collides with a sprite
			/*this.on("hit.sprite",function(collision) {

				// Check the collision, if it's the Tower, you win!
				if(collision.obj.isA("Tower")) {
					Q.stageScene("endGame",1, { label: "You Won!" }); 
					this.destroy();
				}
			});*/

		},
		step: function(dt) {
			//console.log(this.p.y);
			if(this.p.y > 610) { //falls
				this.p.x = 150;
				this.p.y = 380;
			}
		},

		loseLife: function(){
			this.p.x = 150;
			this.p.y = 380;
		}
	});

	Q.Sprite.extend("Goomba",{

		// the init constructor is called on creation
		init: function(p) {
			// You can call the parent's constructor with this._super(..)
			this._super(p, {
				sheet: "goomba",
				vx: -100
			});

			// Add in pre-made components to get up and running quickly
			// The `2d` component adds in default 2d collision detection
			// and kinetics (velocity, gravity)
			this.add('2d, aiBounce');

			// Write event handlers to respond hook into behaviors.
			// hit.sprite is called everytime the player collides with a sprite

			this.on("bump.left,bump.right,bump.bottom",function(collision) {
				if(collision.obj.isA("Mario")) { 
					//collision.obj.destroy();
					collision.obj.loseLife();
				}
			});

			this.on("bump.top",function(collision) {
				if(collision.obj.isA("Mario")) { 
					this.destroy();
					collision.obj.p.vy = -300;
				}
			});
		}
	});

	Q.scene("level1",function(stage) {
		Q.stageTMX("level1.tmx",stage);

		/*SPAWN PLAYER*/
		var mario = stage.insert(new Q.Mario());

		/*SPAWN ENEMIES*/
		stage.insert(new Q.Goomba({x: 900, y: 380}));
		stage.insert(new Q.Goomba({x: 1800, y: 380}));
		stage.insert(new Q.Goomba({x: 2000, y: 380}));

		/*VIEWPORT*/
		stage.add("viewport").follow(mario,{ x: true, y: true });
		stage.viewport.offsetX = -100;
		stage.viewport.offsetY = 155;
		stage.centerOn(150,380);
	});

	Q.load("mario_small.png, mario_small.json, goomba.png, goomba.json", function() {
		Q.compileSheets("mario_small.png","mario_small.json");
		Q.compileSheets("goomba.png","goomba.json");
	});

	Q.loadTMX("level1.tmx, sprites.json", function() {
		Q.stageScene("level1");
	});
});