/** @type{HTMLCanvasElement} */
const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = 1200;
canvas.height = 700;

const speedFrame = 40;
let score = 0;
let gameFrame = 1;
let gameOver = false;
const canvasPosi = canvas.getBoundingClientRect();
let bubbleArray = [];
let enemyArray = [];
const startX = canvas.width / 2;
const startY = canvas.height / 2;
const fontColor = "White";
const gameSpeed = 2;

const mouse = {
  x: startX,
  y: startY,
  radius: 42,
};

canvas.addEventListener("click", (event) => {
  mouse.x = event.x - canvasPosi.x;
  mouse.y = event.y - canvasPosi.y;
});

function reset() {
  mouse.x = startX;
  mouse.y = startY;
}

ctx.font = "30px Verdana";

const playerImageLeft = new Image();
playerImageLeft.src = "fish_left.png";
const playerImageRight = new Image();
playerImageRight.src = "fish_right.png";
class Player {
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.hx = x;
    this.hy = y;
    this.speedFrameX = speedFrame;
    this.speedFrameY = speedFrame;
    this.timeX = 0;
    this.timeY = 0;
    this.radius = radius;
    this.angle = 0;
    this.frameX = 0;
    this.frameY = 0;
    this.frame = 0;
    this.spriteWidth = 498;
    this.spriteHeight = 327;
  }
  update() {
    this.speedFrameX = speedFrame;
    this.speedFrameY = speedFrame;
    this.timeX = 0;
    this.timeY = 0;
    if (this.x !== mouse.x || this.y !== mouse.y) {
      const dx = Math.abs(this.x - mouse.x);
      const dy = Math.abs(this.y - mouse.y);
      const adx = this.hx - mouse.x;
      const ady = this.hy - mouse.y;
      let theta = Math.atan2(ady, adx);
      this.angle = theta;

      if (mouse.x != this.hx) {
        this.hx -= adx / 10;
      }
      if (mouse.y != this.hy) {
        this.hy -= ady / 10;
      }

      if (dx > dy) {
        this.timeX = dx / this.speedFrameX;
        this.speedFrameY = dy / this.timeX;
      }
      if (dy > dx) {
        this.timeY = dy / this.speedFrameY;
        this.speedFrameX = dx / this.timeY;
      }
      if (mouse.x > this.x) {
        if (dx > this.speedFrameX) {
          this.x += this.speedFrameX;
        } else {
          this.x += dx;
        }
      }
      if (mouse.x < this.x) {
        if (dx > this.speedFrameX) {
          this.x -= this.speedFrameX;
        }
        if (dx <= this.speedFrameX) {
          this.x -= dx;
        }
      }
      if (mouse.y > this.y) {
        if (dy > this.speedFrameY) {
          this.y += this.speedFrameY;
        } else {
          this.y += dy;
        }
      }
      if (mouse.y < this.y) {
        if (dy > this.speedFrameY) {
          this.y -= this.speedFrameY;
        }
        if (dy <= this.speedFrameY) {
          this.y -= dy;
        }
      }
    }
  }
  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    if (this.hx >= mouse.x) {
      ctx.drawImage(
        playerImageLeft,
        this.frameX * this.spriteWidth,
        this.frameY * this.spriteHeight,
        this.spriteWidth,
        this.spriteHeight,
        0 - this.radius - 20,
        0 - this.radius,
        this.spriteWidth / 4,
        this.spriteHeight / 4
      );
    } else {
      ctx.drawImage(
        playerImageRight,
        this.frameX * this.spriteWidth,
        this.frameY * this.spriteHeight,
        this.spriteWidth,
        this.spriteHeight,
        0 - this.radius - 20,
        0 - this.radius,
        this.spriteWidth / 4,
        this.spriteHeight / 4
      );
    }
    ctx.restore();
  }
}

const bubbleImage = new Image();
bubbleImage.src = "bubble_pop.png";
const bubbleBurstSound1 = document.createElement("audio");
bubbleBurstSound1.src = "Plop.ogg";
const bubbleBurstSound2 = document.createElement("audio");
bubbleBurstSound2.src = "pop1.ogg";
class Bubble {
  constructor(radius) {
    this.radius = radius;
    this.x = Math.random() * (canvas.width - this.radius) + this.radius;
    this.y = canvas.height + (Math.random() * 50 + 50);
    this.speed = Math.random() * 2 + 5;
    this.distance;
    this.sound = Math.random() <= 0.5 ? "sound1" : "sound2";
    this.spriteWidth = 512;
    this.spriteHeight = 512;
    this.frameX = 0;
    this.frameY = 0;
    this.end = false;
    this.shallDestroyed = false;
    this.ff = 2;
  }
  update() {
    this.y -= this.speed;
    let dx = this.x - player.x;
    let dy = this.y - player.y;
    this.distance = Math.sqrt(dx * dx + dy * dy);
    if (this.distance < player.radius + this.radius) {
      this.shallDestroyed = true;
    }
    if (this.shallDestroyed) {
      if (this.sound === "sound1") {
        bubbleBurstSound1.play();
      } else {
        bubbleBurstSound2.play();
      }
      if (gameFrame % 2 === 0) {
        this.frameX++;
        if (this.frameX >= 3) {
          this.frameX = 0;
          this.frameY++;
        }
        if (this.frameY >= 2) {
          this.end = true;
        }
      }
    }
  }
  draw() {
    ctx.drawImage(
      bubbleImage,
      this.frameX * this.spriteWidth,
      this.frameY * this.spriteHeight,
      this.spriteWidth,
      this.spriteHeight,
      this.x - this.radius - 20,
      this.y - this.radius - 20,
      this.spriteWidth / 4,
      this.spriteHeight / 4
    );
  }
}

const enemyImage = new Image();
enemyImage.src = "enemy.png";
class Enemy {
  constructor(radius) {
    this.radius = radius;
    this.x = canvas.width + Math.random() * 25 + 25;
    this.y = Math.random() * (canvas.height - this.radius) + this.radius;
    this.speedX = Math.random() * 5 + 2;
    this.distance;
    this.frame = 0;
    this.frameX = 0;
    this.frameY = 2;
    this.spriteWidth = 418;
    this.spriteHeight = 397;
  }
  update() {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    this.distance = Math.sqrt(dx * dx + dy * dy);
    this.x -= this.speedX;

    if (gameFrame % 10 === 0) {
      this.frame++;
      if (this.frame >= 12) this.frame = 0;
      if (this.frame == 3 || this.frame == 7 || this.frame == 11) {
        this.frameX = 0;
      } else {
        this.frameX++;
      }
      if (this.frame < 3) this.frameY = 2;
      else if (this.frame < 7) this.frameY = 3;
      else if (this.frame < 11) this.frameY = 4;
      else this.frameY = 0;
    }
  }
  draw() {
    ctx.drawImage(
      enemyImage,
      this.frameX * this.spriteWidth,
      this.frameY * this.spriteHeight,
      this.spriteWidth,
      this.spriteHeight,
      this.x - this.radius - 10,
      this.y - this.radius - 10,
      this.spriteWidth / 4,
      this.spriteHeight / 4
    );
  }
}

const player = new Player(mouse.x, mouse.y, mouse.radius);

function produceBubble() {
  bubbleArray.push(new Bubble(mouse.radius));
}
function handleBubble() {
  for (let i = 0; i < bubbleArray.length; i++) {
    bubbleArray[i].draw();
    bubbleArray[i].update();
    if (bubbleArray[i].end) {
      bubbleArray.splice(i, 1);
      score++;
      i--;
    } else if (bubbleArray[i].y < 0 - mouse.radius) {
      bubbleArray.splice(i, 1);
      i--;
    }
  }
}

function produceEnemy() {
  enemyArray.push(new Enemy(mouse.radius));
}
function handleEnemy() {
  for (let i = 0; i < enemyArray.length; i++) {
    enemyArray[i].draw();
    enemyArray[i].update();
    if (enemyArray[i].distance < player.radius + enemyArray[i].radius) {
      gameOver = true;
    } else if (enemyArray[i].x < 0 - mouse.radius) {
      enemyArray.splice(i, 1);
      i--;
    }
  }
}
const backgroundImage = new Image();
backgroundImage.src = "background1.png";
const BG = {
  width: canvas.width,
  height: canvas.height,
  x: 0,
  x2: canvas.width,
  y: 0,
};

function repeatBackground() {
  BG.x -= gameSpeed;
  BG.x2 -= gameSpeed;
  if (BG.x < -BG.width + 2) BG.x = BG.width;
  if (BG.x2 < -BG.width + 2) BG.x2 = BG.width;
  ctx.drawImage(backgroundImage, BG.x, BG.y, BG.width, BG.height);
  ctx.drawImage(backgroundImage, BG.x2, BG.y, BG.width, BG.height);
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  player.update();
  player.draw();
  repeatBackground();
  gameFrame++;
  if (gameFrame % 30 === 0) {
    produceBubble();
  }
  if (gameFrame % 130 === 0) {
    produceEnemy();
  }
  handleBubble();
  handleEnemy();
  ctx.fillStyle = `${fontColor}`;
  if (!gameOver) {
    ctx.fillText(`score : ${score}`, 10, 50);
    requestAnimationFrame(animate);
  } else {
    ctx.font = "30px Verdana";
    ctx.fillText(`Press SpaceBar to play Again`, startX - 220, startY - 100);
    ctx.font = "50px Verdana";
    ctx.fillText(
      `Game Fanished! Your score is: ${score}`,
      startX - 400,
      startY
    );
  }
}

animate();

document.body.onkeyup = function (e) {
  if (e.key == " " || e.code == "Space" || e.keyCode == 32) {
    if (gameOver == true) {
      enemyArray = [];
      bubbleArray = [];
      score = 0;
      gameFrame = 1;
      reset();
      gameOver = false;
      animate();
    }
  }
};
