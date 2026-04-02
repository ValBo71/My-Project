const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;

const playerHealthBar = document.getElementById('playerHealth');
const enemyHealthBar = document.getElementById('enemyHealth');
const overlay = document.getElementById('overlay');
const overlayText = document.getElementById('overlayText');
const overlaySubtext = document.getElementById('overlaySubtext');

let gameState = 'START'; // START, PLAYING, WIN, LOSE, PAUSED
let animationId;

// Physics
const gravity = 0.7;
const floorY = canvas.height - 96;

class Fighter {
    constructor({ position, velocity, color = 'red', isEnemy = false }) {
        this.position = position;
        this.velocity = velocity;
        this.width = 60;
        this.height = 150;
        this.color = color;
        this.isEnemy = isEnemy;
        this.health = 100;
        
        this.attackBox = {
            position: { x: this.position.x, y: this.position.y },
            width: 120, // Punch distance
            height: 50
        };
        
        this.isAttacking = false;
        this.isBlocking = false;
        this.blockCooldown = 0;
        this.attackCooldown = 0;
        
        this.colorDefault = color;
        this.hitFlashTimer = 0;
        this.facingRight = !isEnemy;
        this.attackType = 'punch'; // 'punch' или 'kick'
    }

    draw() {
        // Hit flash effect
        if (this.hitFlashTimer > 0) {
            ctx.fillStyle = 'white';
            this.hitFlashTimer--;
        } else {
            ctx.fillStyle = this.color;
        }

        // Draw body 
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

        // Draw 'head' for stick-figure-ish retro feel
        ctx.fillStyle = '#ffb6c1'; // skin color approximation
        ctx.fillRect(this.position.x + 10, this.position.y - 40, 40, 40);

        // Draw block shield
        if (this.isBlocking) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            if (this.facingRight) {
                ctx.fillRect(this.position.x + this.width, this.position.y + 10, 10, 80);
            } else {
                ctx.fillRect(this.position.x - 10, this.position.y + 10, 10, 80);
            }
        }

        // Draw attack box (Visualized punch/kick)
        if (this.isAttacking) {
            ctx.fillStyle = this.attackType === 'kick' ? '#ff9900' : 'yellow';
            ctx.fillRect(
                this.attackBox.position.x, 
                this.attackBox.position.y, 
                this.attackBox.width, 
                this.attackBox.height
            );
        }
    }

    update() {
        this.draw();
        
        // Cooldowns decrease
        if (this.attackCooldown > 0) this.attackCooldown--;
        if (this.blockCooldown > 0) this.blockCooldown--;

        // Update attack box position (kick is lower, punch is higher)
        this.attackBox.position.y = this.attackType === 'kick' ? this.position.y + 80 : this.position.y + 20;

        if (this.facingRight) {
            this.attackBox.position.x = this.position.x + this.width;
        } else {
            this.attackBox.position.x = this.position.x - this.attackBox.width;
        }

        // Apply velocities (Movement)
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        // Apply Gravity
        if (this.position.y + this.height + this.velocity.y >= floorY) {
            this.velocity.y = 0;
            this.position.y = floorY - this.height; // Keep strictly on floor
        } else {
            this.velocity.y += gravity;
        }
        
        // Boundaries checks
        if (this.position.x < 0) this.position.x = 0;
        if (this.position.x + this.width > canvas.width) this.position.x = canvas.width - this.width;
    }

    attack(type = 'punch') {
        if (this.attackCooldown <= 0 && !this.isBlocking) {
            this.isAttacking = true;
            this.attackType = type;
            this.attackCooldown = 40; // Timeout between attacks

            // Attack frame window
            setTimeout(() => {
                this.isAttacking = false;
            }, 100); 
        }
    }

    block() {
        if (this.blockCooldown <= 0 && !this.isAttacking) {
            this.isBlocking = true;
        }
    }

    stopBlock() {
        this.isBlocking = false;
    }

    takeHit(damage) {
        if (this.isBlocking) {
            damage = Math.floor(damage / 4); // Reduces damage greatly
        } else {
            this.hitFlashTimer = 10;
        }
        
        this.health -= damage;
        if (this.health < 0) this.health = 0;
        
        // Update Health UI
        const healthPercentage = `calc(${this.health}% - 6px)`;
        if (this.isEnemy) {
            enemyHealthBar.style.width = healthPercentage;
            if (this.health < 30) enemyHealthBar.style.background = '#ff0000';
            else enemyHealthBar.style.background = '#00ffff';
        } else {
            playerHealthBar.style.width = healthPercentage;
            if (this.health < 30) playerHealthBar.style.background = '#ff0000';
            else playerHealthBar.style.background = '#00ff00';
        }
    }
}

let player;
let enemy;

const keys = {
    a: { pressed: false },
    d: { pressed: false }
};

function initGame() {
    player = new Fighter({
        position: { x: 150, y: 0 },
        velocity: { x: 0, y: 0 },
        color: '#ff007f' // Neon pinkish red
    });

    enemy = new Fighter({
        position: { x: 800, y: 0 },
        velocity: { x: 0, y: 0 },
        color: '#00ffff', // Cyan
        isEnemy: true
    });
    
    player.facingRight = true;
    enemy.facingRight = false;
    
    // Reset Healthbars UI
    playerHealthBar.style.width = `calc(100% - 6px)`;
    playerHealthBar.style.background = '#00ff00';
    enemyHealthBar.style.width = `calc(100% - 6px)`;
    enemyHealthBar.style.background = '#00ffff';
    
    gameState = 'PLAYING';
    overlay.classList.remove('active');
}

function detectCollision(attacker, target) {
    return (
        attacker.attackBox.position.x < target.position.x + target.width &&
        attacker.attackBox.position.x + attacker.attackBox.width > target.position.x &&
        attacker.attackBox.position.y < target.position.y + target.height &&
        attacker.attackBox.position.y + attacker.attackBox.height > target.position.y
    );
}

// Enemy AI Logic
let aiActionTimer = 0;
function manageEnemyAI() {
    if (gameState !== 'PLAYING') return;
    
    // Face player
    enemy.facingRight = enemy.position.x < player.position.x;
    
    aiActionTimer++;
    
    const distanceX = player.position.x - enemy.position.x;
    const distanceAbs = Math.abs(distanceX);
    
    // Simple approach/attack logic
    if (distanceAbs > 120) { // Keep distance slightly larger than attackBox width
        enemy.velocity.x = (distanceX > 0) ? 3 : -3;
        enemy.stopBlock();
    } else {
        enemy.velocity.x = 0; // stop moving
        
        // At interval, punch or block
        if (aiActionTimer % 45 === 0) {
            const decision = Math.random();
            if (decision < 0.4) {
                enemy.stopBlock();
                enemy.attack('punch');
            } else if (decision < 0.7) {
                enemy.stopBlock();
                enemy.attack('kick'); 
            } else {
                enemy.block();
                setTimeout(() => enemy.stopBlock(), 800);
            }
        }
    }
}

function determineWinner() {
    if (player.health === enemy.health) {
        overlayText.innerText = 'DRAW';
    } else if (player.health > enemy.health) {
        overlayText.innerText = 'PLAYER WINS';
    } else {
        overlayText.innerText = 'CPU WINS';
    }
    overlaySubtext.innerText = 'Press R to Restart';
    overlay.classList.add('active');
    gameState = (player.health > enemy.health) ? 'WIN' : 'LOSE';
}

function animate() {
    requestAnimationFrame(animate);

    if (gameState === 'PAUSED') return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height); 

    // Update characters
    player.update();
    enemy.update();

    if (gameState !== 'PLAYING') return;

    // Movement Player 1
    player.velocity.x = 0;
    if (keys.a.pressed) {
        player.velocity.x = -5;
        player.facingRight = false;
    } else if (keys.d.pressed) {
        player.velocity.x = 5;
        player.facingRight = true;
    }
    
    manageEnemyAI();

    // Hit detection for Player
    if (player.isAttacking && detectCollision(player, enemy)) {
        player.isAttacking = false; // Prevents multi-hits per attack
        const damage = player.attackType === 'kick' ? 15 : 10;
        enemy.takeHit(damage);
    }
    
    // Hit detection for Enemy
    if (enemy.isAttacking && detectCollision(enemy, player)) {
        enemy.isAttacking = false;
        const damage = enemy.attackType === 'kick' ? 15 : 10;
        player.takeHit(damage);
    }
    
    // End Game Condition
    if (enemy.health <= 0 || player.health <= 0) {
        determineWinner();
    }
}

// Global Inputs
window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    
    if (gameState === 'START') {
        initGame();
        return;
    }
    
    if (key === 'r' && gameState !== 'START') {
        initGame();
        return;
    }

    if (key === 'p') {
        if (gameState === 'PLAYING') {
            gameState = 'PAUSED';
            overlayText.innerText = 'PAUSED';
            overlaySubtext.innerText = 'Press P to Resume';
            overlay.classList.add('active');
        } else if (gameState === 'PAUSED') {
            gameState = 'PLAYING';
            overlay.classList.remove('active');
        }
        return;
    }

    if (gameState !== 'PLAYING') return;

    switch (key) {
        case 'a': keys.a.pressed = true; break;
        case 'd': keys.d.pressed = true; break;
        case 'j': player.attack('punch'); break;
        case 'k': player.attack('kick'); break;
        case 'l': player.block(); break;
    }
});

window.addEventListener('keyup', (e) => {
    switch (e.key.toLowerCase()) {
        case 'a': keys.a.pressed = false; break;
        case 'd': keys.d.pressed = false; break;
        case 'l': player.stopBlock(); break;
    }
});

// Start loop visualization (initially shows start screen)
requestAnimationFrame(animate);
