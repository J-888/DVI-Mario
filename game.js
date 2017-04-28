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
			
			//scaleToFit: true // Scale the game to fit the screen of the player's device

		})
  
		// And turn on default input controls and touch input (for UI)
		.controls().touch();


/********************************/
/***********ANIMATIONS***********/
/********************************/

	Q.animations('mario anim', {
		run_right: { frames: [3,2,1], rate: 1/4.5 }, 
		run_left: { frames: [17,16,15], rate:1/4.5 },
		//fire_right: { frames: [9,10,10], next: 'stand_right', rate: 1/30, trigger: "fired" },
		//fire_left: { frames: [20,21,21], next: 'stand_left', rate: 1/30, trigger: "fired" },
		stand_right: { frames: [0], loop: true },
		stand_left: { frames: [14], loop: true },
		fall_right: { frames: [4], loop: true },
		fall_left: { frames: [18], loop: true }
	});

	Q.animations('goomba anim', {
		run: { frames: [0, 1], rate: 1/4.5 },
		die: { frames: [2], rate: 1/2, loop: false, trigger: "die" },
		upside_down: { frames: [3], loop: true }
	});

	Q.animations('bloopa anim', {
		swim_up: { frames: [0], loop: true },
		swim_down: { frames: [1], loop: true },
		die: { frames: [2], rate: 1/2, loop: false, trigger: "die" }
	});


/********************************/
/************SPRITES*************/
/********************************/

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
				sheet: "mario",	// Setting a sprite sheet sets sprite width and height
				sprite: "mario anim",
				x: 150,			// You can also set additional properties that can
				y: 380,				// be overridden on object creation
				jumpSpeed: -550
			});

			// Add in pre-made components to get up and running quickly
			// The `2d` component adds in default 2d collision detection
			// and kinetics (velocity, gravity)
			// The `platformerControls` makes the player controllable by the
			// default input actions (left, right to move, up or action to jump)
			// It also checks to make sure the player is on a horizontal surface before
			// letting them jump.
			this.add('2d, platformerControls, animation');

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
			//console.log(this.p.landed > 0);
			if(!this.p.jumping && this.p.landed > 0)
				if(this.p.vx > 0) {
					this.play("run_right");
				}
				else if(this.p.vx < 0) {
					this.play("run_left");
				}
				else {
					this.play("stand_" + this.p.direction);
				}
			else {
				this.play("fall_" + this.p.direction);
			}

			if(this.p.y > 610) { //falls
				//this.p.x = 150;
				//this.p.y = 380;	
				this.destroy();
				Q.stageScene("endGame",1, { label: "You Lose" });
			}
		},

		loseLife: function(){
			//this.p.x = 150;
			//this.p.y = 380;
			this.destroy();
			Q.stageScene("endGame",1, { label: "You Lose" });
		}
	});

	Q.Sprite.extend("Goomba",{

		// the init constructor is called on creation
		init: function(p) {
			// You can call the parent's constructor with this._super(..)
			this._super(p, {
				sheet: "goomba",
				sprite: "goomba anim",
				vx: -100,
				type: Q.SPRITE_ENEMY
			});

			// Add in pre-made components to get up and running quickly
			// The `2d` component adds in default 2d collision detection
			// and kinetics (velocity, gravity)
			this.add('2d, aiBounce, animation');
			this.play("run");

			this.on("die",this,"die");

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
					//this.destroy();
					this.play("die", 1);
					collision.obj.p.vy = -300;
				}
			});
		},
		die: function(p) {
			this.destroy();
		}

	});

	Q.Sprite.extend("Bloopa",{

		// the init constructor is called on creation
		init: function(p) {
			// You can call the parent's constructor with this._super(..)
			this._super(p, {
				sheet: "bloopa",
				sprite: "bloopa anim",
				vx: -30,
				gravity: 0.3,
				originalY: null,
				type: Q.SPRITE_ENEMY
			});

			// Add in pre-made components to get up and running quickly
			// The `2d` component adds in default 2d collision detection
			// and kinetics (velocity, gravity)
			this.add('2d, aiBounce, animation');

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
		},
		step: function(p) {				
			if(this.p.vy > 120)
				this.p.vy = -132;


			if(this.p.vy < 0)
				this.play("swim_up");
			else
				this.play("swim_down");
		},
		die: function(p) {
			this.destroy();
		}
	});

	Q.Sprite.extend("Princess",{

		// the init constructor is called on creation
		init: function(p) {
			// You can call the parent's constructor with this._super(..)
			this._super(p, {
				sheet: "princess",
				sensor: true,
				collisionMask: Q.SPRITE_DEFAULT
			});

			// Add in pre-made components to get up and running quickly
			// The `2d` component adds in default 2d collision detection
			// and kinetics (velocity, gravity)
			this.add('2d');
			//this.on("sensor");


			this.on("hit",this,"collision");
		},
		/*sensor: function() {
			collision.obj.destroy();
			Q.stageScene("endGame",1, { label: "You Win" });
		}*/
		collision: function(col) {
			if(col.obj.isA("Mario")) { 
				col.obj.destroy();
				Q.stageScene("endGame",1, { label: "You Win" });
			}
		}
	});

	Q.scene("level1",function(stage) {
		Q.stageTMX("level1.tmx",stage);

		/*SPAWN PLAYER*/
		var mario = stage.insert(new Q.Mario());

		/*SPAWN ENEMIES*/
		stage.insert(new Q.Goomba({x: 600, y: 300}));
		stage.insert(new Q.Bloopa({x: 1200, y: 450}));
		stage.insert(new Q.Goomba({x: 1800, y: 380}));
		stage.insert(new Q.Goomba({x: 1900, y: 380}));

		/*SPAWN PRINCESS*/
		stage.insert(new Q.Princess({x: 1950, y: 380}));

		/*VIEWPORT*/
		stage.add("viewport").follow(mario,{ x: true, y: false });
		stage.viewport.offsetX = -100;
		stage.viewport.offsetY = 155;
		stage.centerOn(150,380);
	});

	Q.scene('endGame',function(stage) {
		var container = stage.insert(new Q.UI.Container({ x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)" }));
		var button = container.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC", label: "Play Again" }));
		var label = container.insert(new Q.UI.Text({x:10, y: -10 - button.p.h, label: stage.options.label }));
		
		button.on("click",function() {
			Q.clearStages();
			//Q.stageScene('level1');
			Q.stageScene('titleScreen');
		});

		button.on("push",function() {
			Q.clearStages();
			//Q.stageScene('level1');
			Q.stageScene('titleScreen');
		});

		container.fit(20);
	});

	Q.scene('titleScreen',function(stage) {
		var container = stage.insert(new Q.UI.Container({ x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)" }));
		var button = container.insert(new Q.UI.Button({ asset: "mainTitle.png", x: 0, y: 0}))
		var label = container.insert(new Q.UI.Text({x:0, y: 70, weight: 100, size:24, family: "SuperMario", color: "#FFFFFF", outlineWidth: 4, label: "Start" }));
		
		button.on("click",function() {
			Q.clearStages();
			Q.stageScene('level1');
		});

		container.fit(20);
	});

	Q.load("mario_small.png, mario_small.json, goomba.png, goomba.json, bloopa.png, bloopa.json, princess.png, princess.json, mainTitle.png", function() {
		Q.compileSheets("mario_small.png","mario_small.json");
		Q.compileSheets("goomba.png","goomba.json");
		Q.compileSheets("bloopa.png","bloopa.json");
		Q.compileSheets("princess.png","princess.json");
	});

	Q.loadTMX("level1.tmx, sprites.json", function() {
		Q.stageScene('titleScreen');
		//Q.stageScene("level1");
	});
});