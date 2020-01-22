/* eslint-disable func-style */
const config = {
  type: Phaser.AUTO,
  width: 1024,
  height: 1024,
  physics: {
    default: "arcade"
    // arcade: { debug: SVGComponentTransferFunctionElement }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);

const players = [];

let bombCountGroup;
let movementSpeedroup;
let bombPowerGroup;
let bombCountSound;
let msSound;

//calculates the center of the tile player is standing on
const calculateCenterTileXY = playerLocation => {
  return 32 - (playerLocation % 64) + playerLocation;
};

let gameStart = false;
let gameOver = false;
let time = 46;
const countdown = () => {
  const timer = setInterval(() => {
    if (time === 0) {
      clearInterval(timer);
      gameStart = true;
      $(".countdown").addClass("hidden");
    } else {
      time = time - 1;
      $(".countdown").html(
        `<p style= 'margin-left: 18%;' >Game Starting In ${time} Seconds!</p> <img src='../assets/controls.jpeg' /> <p style='padding-top:10px'>Please have your phone locked to portrait mode!</p>`
      );
      $(".countdown").removeClass("hidden");
    }
  }, 1000);
};

$(() => {
  $(".start").click(() => {
    countdown();
  });
});

function preload() {
  this.load.spritesheet({
    key: "white",
    url: "assets/characters/characters-white.png",
    frameConfig: {
      frameWidth: 71,
      frameHeight: 56
    }
  });
  this.load.spritesheet({
    key: "black",
    url: "assets/characters/characters-black.png",
    frameConfig: {
      frameWidth: 71,
      frameHeight: 56
    }
  });
  this.load.spritesheet({
    key: "blue",
    url: "assets/characters/characters-blue.png",
    frameConfig: {
      frameWidth: 71,
      frameHeight: 56
    }
  });
  this.load.spritesheet({
    key: "red",
    url: "assets/characters/characters-red.png",
    frameConfig: {
      frameWidth: 71,
      frameHeight: 56
    }
  });

  this.load.audio({
    key: "gamemusic",
    url: "assets/audio/music.mp3",
    config: {
      loop: true,
      volume: 0.1
    }
  });

  this.load.spritesheet({
    key: "blocks",
    url: "assets/maps/blocks.png",
    frameConfig: {
      frameWidth: 64,
      frameHeight: 64
    }
  });
  this.load.spritesheet({
    key: "chest",
    url: "assets/maps/chests.png",
    frameConfig: {
      frameWidth: 64,
      frameHeight: 64
    }
  });

  this.load.spritesheet({
    key: "bomb",
    url: "assets/bombs/bomb.png",
    frameConfig: {
      frameWidth: 46,
      frameHeight: 46,
      startFrame: 0,
      endFrame: 1
    }
  });
  this.load.spritesheet({
    key: "explosion",
    url: "assets/bombs/explosion.png",
    frameConfig: {
      frameWidth: 64,
      frameHeight: 64,
      startFrame: 0,
      endFrame: 16
    }
  });

  this.load.audio("bombExplosion", "assets/audio/explosionSound.wav");
  this.load.audio("bombCountSound", "assets/audio/bombCountSound.wav");
  this.load.audio("msSound", "assets/audio/msSound.wav");

  this.load.tilemapTiledJSON("map1", "assets/maps/map1.json");
  this.load.image("floor", "assets/maps/floor.png");

  //powerups
  this.load.image("movementSpeedIncrease", "assets/powerups/movementincrease.png");
  this.load.image("bombCountIncrease", "assets/powerups/bombincrease.png");
  this.load.image("bombPowerIncrease", "assets/powerups/bombpowerincrease.png");
}

function create() {
  this.socket = io("/game");
  //gameplay music
  const music = this.sound.add("gamemusic");
  music.loop = true;
  music.play();

  const explosionSound = this.sound.add("bombExplosion");
  bombCountSound = this.sound.add("bombCountSound");
  msSound = this.sound.add("msSound");

  this.map = this.add.tilemap("map1");

  let floorSet = this.map.addTilesetImage("floor", "floor");

  this.blocksLayer = this.map.createStaticLayer("floor", floorSet);

  this.player = this.physics.add.group();

  this.chest = this.map.createFromObjects("chest", 41, { key: "chest" });
  const chest = this.physics.add.group(this.chest);
  this.physics.world.enable(chest);
  this.physics.add.collider(this.player, chest);
  this.chest.forEach(c => c.body.setSize(55, 55).setImmovable());

  this.wall = this.map.createFromObjects("chest", 1, { key: "blocks" });
  const wall = this.physics.add.group(this.wall);
  this.physics.world.enable(wall);
  this.physics.add.collider(this.player, wall);
  this.wall.forEach(c => c.body.setSize(55, 55).setImmovable());

  bombCountGroup = this.physics.add.group();
  movementSpeedGroup = this.physics.add.group();
  bombPowerGroup = this.physics.add.group();

  //hash maps
  this.chestMap = {};
  for (let chest of this.chest) {
    const x = (chest.x - 32) / 64;
    const y = (chest.y - 32) / 64;

    this.chestMap[`${x},${y}`] = chest;
  }

  this.wallMap = {};
  for (let wall of this.wall) {
    const x = (wall.x - 32) / 64;
    const y = (wall.y - 32) / 64;

    this.wallMap[`${x},${y}`] = wall;
  }

  this.bombMap = {};
  const bombLocation = (bombX, bombY) => {
    const x = (bombX - 32) / 64;
    const y = (bombY - 32) / 64;

    this.bombMap[`${x},${y}`] = true;
  };

  //bomb animation
  this.anims.create({
    key: "boom",
    frames: this.anims.generateFrameNumbers("bomb", { start: 0, end: 1 }),
    frameRate: 3,
    repeat: 3
  });

  //explosion animation
  this.anims.create({
    key: "fire",
    frames: this.anims.generateFrameNumbers("explosion", { start: 0, end: 16 }),
    frameRate: 30,
    repeat: 0
  });

  const movePlayer = data => {
    //player turn animation
    let player = this.player[data.playerId];

    this.anims.create({
      key: `${player.texture.key}-left`,
      frames: this.anims.generateFrameNumbers(`${player.texture.key}`, { start: 3, end: 3 }),
      repeat: -1
    });
    this.anims.create({
      key: `${player.texture.key}-right`,
      frames: this.anims.generateFrameNumbers(`${player.texture.key}`, { start: 1, end: 1 }),
      repeat: -1
    });
    this.anims.create({
      key: `${player.texture.key}-down`,
      frames: this.anims.generateFrameNumbers(`${player.texture.key}`, { start: 0, end: 0 }),
      repeat: -1
    });
    this.anims.create({
      key: `${player.texture.key}-up`,
      frames: this.anims.generateFrameNumbers(`${player.texture.key}`, { start: 2, end: 2 }),
      repeat: -1
    });

    //down
    if ((data.angle >= 0 && data.angle < 22.5) || (data.angle < 359 && data.angle > 337.5)) {
      player.play(`${player.texture.key}-down`, true);
      player.body.setVelocityY(player.speed);
      //right/down
    } else if (data.angle >= 22.5 && data.angle < 67.5) {
      player.play(`${player.texture.key}-right`, true);
      player.body.setVelocityX(player.speed);
      player.body.setVelocityY(player.speed);

      //right
    } else if (data.angle >= 67.5 && data.angle < 112.5) {
      player.play(`${player.texture.key}-right`, true);
      player.body.setVelocityX(player.speed);
      //right/up
    } else if (data.angle >= 112.5 && data.angle < 157.5) {
      player.play(`${player.texture.key}-right`, true);
      player.body.setVelocityX(player.speed);
      player.body.setVelocityY(-player.speed);

      //up
    } else if (data.angle >= 157.5 && data.angle < 202.5) {
      player.play(`${player.texture.key}-up`, true);
      player.body.setVelocityY(-player.speed);

      //up/left
    } else if (data.angle >= 202.5 && data.angle < 247.5) {
      player.play(`${player.texture.key}-left`, true);
      player.body.setVelocityX(-player.speed);
      player.body.setVelocityY(-player.speed);

      //left
    } else if (data.angle >= 247.5 && data.angle < 292.5) {
      player.play(`${player.texture.key}-left`, true);
      player.body.setVelocityX(-player.speed);

      //down/left
    } else if (data.angle >= 292.5 && data.angle < 337.5) {
      player.play(`${player.texture.key}-left`, true);
      player.body.setVelocityX(-player.speed);
      player.body.setVelocityY(player.speed);
    }
  };

  this.socket.on("playerMovement", data => {
    if (gameStart && !gameOver) {
      movePlayer(data);
    }
  });

  // Stop any previous movement from the last frame
  this.socket.on("playerMovementEnd", data => {
    this.player[data.playerId].body.setVelocity(0);
  });

  //checks if bomb is already on spot
  const isBombOnXY = (x, y) => {
    return `${x},${y}` in this.bombMap;
  };

  //checks overlaps with game objects
  function checkOverlap(gameObjectOne, gameObjectTwo) {
    if (!gameObjectOne) {
      return false;
    }
    var boundsA = gameObjectOne.getBounds();
    var boundsB = gameObjectTwo.getBounds();
    return Phaser.Geom.Rectangle.Overlaps(boundsA, boundsB);
  }

  this.socket.on("dropBomb", data => {
    if (
      this.player[data.playerId].body &&
      this.player[data.playerId].bombCount > 0 &&
      !isBombOnXY(
        (calculateCenterTileXY(this.player[data.playerId].x) - 32) / 64,
        (calculateCenterTileXY(this.player[data.playerId].y) - 32) / 64
      ) &&
      gameStart
    ) {
      this.bomb = this.physics.add
        .sprite(
          calculateCenterTileXY(this.player[data.playerId].x),
          calculateCenterTileXY(this.player[data.playerId].y),
          "bomb"
        )
        .setImmovable()
        .setSize(64, 64);
      bombLocation(this.bomb.x, this.bomb.y);

      this.player[data.playerId].bombCount--;

      for (let player of players) {
        this.physics.add.collider(this.player[player], this.bomb);
      }

      this.bomb.play("boom", true);

      let bomb = this.bomb;

      //destory bomb after detonation animations
      this.bomb.once(Phaser.Animations.Events.SPRITE_ANIMATION_COMPLETE, () => {
        delete this.bombMap[`${(bomb.x - 32) / 64},${(bomb.y - 32) / 64}`];
        bomb.destroy();
        this.player[data.playerId].bombCount++;
        //bomb power level
        let bombPower = this.player[data.playerId].bombPower;

        //directions for bombs to spread
        const explosionDirection = [
          { x: 0, y: 0 },
          { x: 0, y: -1 },
          { x: 1, y: 0 },
          { x: 0, y: 1 },
          { x: -1, y: 0 }
        ];

        for (const direction of explosionDirection) {
          for (let blastLength = 0; blastLength <= bombPower; blastLength++) {
            const bombX = bomb.x + direction.x * blastLength * 64;
            const bombY = bomb.y + direction.y * blastLength * 64;

            let explosion = this.physics.add.sprite(bombX, bombY, "fire").setImmovable();

            for (const player of players) {
              if (checkOverlap(this.player[player], explosion)) {
                this.player[player].destroy();
                this.socket.emit("playerDied", player);
                this.socket.on("removeClass", data => {
                  $(`#${data.color}`).removeClass("joinedGame");
                });
                players.splice(players.indexOf(player), 1);
              }
            }
            //break if explosion collides with walls
            if (checkOverlap(this.wallMap[`${(bombX - 32) / 64},${(bombY - 32) / 64}`], explosion)) {
              explosion.destroy();
              break;
            }

            //plays explosion animation
            explosion.play("fire", true);
            explosionSound.play();

            //clears the explosion after animation is complete
            explosion.once(Phaser.Animations.Events.SPRITE_ANIMATION_COMPLETE, () => {
              explosion.destroy();
            });

            //checks for explosion-chest overlap and destorys chest
            if (checkOverlap(this.chestMap[`${(bombX - 32) / 64},${(bombY - 32) / 64}`], explosion)) {
              this.chestMap[`${(bombX - 32) / 64},${(bombY - 32) / 64}`].destroy();
              delete this.chestMap[`${(bombX - 32) / 64},${(bombY - 32) / 64}`];
              const generatePowerup = () => {
                const number = Math.round(Math.random() * 10);
                if (number === 1) {
                  return bombCountGroup.add(
                    this.physics.add.sprite(explosion.x, explosion.y, "bombCountIncrease").setSize(64, 64)
                  );
                } else if (number === 2) {
                  return movementSpeedGroup.add(
                    this.physics.add.sprite(explosion.x, explosion.y, "movementSpeedIncrease").setSize(64, 64)
                  );
                } else if (number === 3) {
                  return bombPowerGroup.add(
                    this.physics.add.sprite(explosion.x, explosion.y, "bombPowerIncrease").setSize(64, 64)
                  );
                } else return;
              };
              generatePowerup();
              break;
            }
          }
        }
      });
    }
  });

  this.socket.on("newPlayer", data => {
    if (!gameStart && !gameOver) {
      players.push(data.playerId);
      this.player[data.playerId] = this.physics.add.sprite(data.spawnx, data.spawny, data.color).setSize(64, 64);

      this.player[data.playerId]["bombCount"] = 1;
      this.player[data.playerId]["speed"] = 200;
      this.player[data.playerId]["bombPower"] = 1;

      this.player[data.playerId].setCollideWorldBounds(true);
      this.player[data.playerId].depth = 1;

      this.physics.add.collider(this.player[data.playerId], chest);
      this.physics.add.collider(this.player[data.playerId], wall);
      $(`#${data.color}`).addClass("joinedGame");
    }
  });

  this.socket.on("disconnect", data => {
    if (this.player[data.playerId]) {
      this.player[data.playerId].destroy();
      players.splice(players.indexOf(data.playerxId), 1);
      $(`#${data.color}`).removeClass("joinedGame");
    }
  });
}

function update() {
  if (gameStart && !gameOver && players.length <= 1) {
    if (players.length === 1) {
      this.socket.emit("gameOver", players[0]);
      $(".winner").html(
        `<img src='./assets/characters/${
          this.player[players[0]].texture.key
        }.png'/> <p>You Boomed All Your Friends!</p>`
      );
      $(".winner").removeClass("hidden");
    } else if (players.length === 0) {
      $(".winner").html(` <p>Everyone Is Dead!</p>`);
      $(".winner").removeClass("hidden");
    }
    gameOver = true;
  }
  for (let player of players) {
    const increaseBombCount = (player, bombCountPowerup) => {
      player.bombCount = player.bombCount + 1;
      bombCountPowerup.destroy();
      bombCountSound.play();
      setTimeout(() => {
        $(`#${player.texture.key}BombCount`).text(`: ${player.bombCount}`);
      }, 200);
    };
    this.physics.overlap(this.player[player], bombCountGroup, increaseBombCount, null, this);

    const increaseMovementSpeed = (player, movementSpeedPowerup) => {
      player.speed = player.speed + 50;
      movementSpeedPowerup.destroy();
      msSound.play();
    };
    this.physics.overlap(this.player[player], movementSpeedGroup, increaseMovementSpeed, null, this);

    const increaseBombPower = (player, bombPowerPowerup) => {
      player.bombPower = player.bombPower + 1;
      bombPowerPowerup.destroy();
      bombCountSound.play();
    };
    this.physics.overlap(this.player[player], bombPowerGroup, increaseBombPower, null, this);
  }
}
