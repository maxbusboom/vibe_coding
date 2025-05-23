import { Ship } from './entities/ship';
import { Asteroid } from './entities/asteroid';
import { Bullet } from './entities/bullet';
import { Renderer } from './renderer';
import { InputHandler } from './input-handler';
import { Vector } from './utils/vector';
import { CollisionDetector } from './utils/collision-detector';
import { Particle } from './entities/particle';

export class Game {
    private canvas: HTMLCanvasElement;
    private renderer: Renderer;
    private inputHandler: InputHandler;
    private ship: Ship;
    private asteroids: Asteroid[] = [];
    private bullets: Bullet[] = [];
    private particles: Particle[] = [];
    private score: number = 0;
    private lives: number = 3;
    private gameOver: boolean = false;
    private level: number = 1;
    private lastTime: number = 0;
    private scoreDisplay: HTMLElement;
    private livesDisplay: HTMLElement;
    private gameOverDisplay: HTMLElement;
    private finalScoreDisplay: HTMLElement;
    private restartButton: HTMLElement;
    private canvasWidth: number;
    private canvasHeight: number;
    private asteroidSpawnInterval: number = 3000; // milliseconds
    private lastAsteroidSpawn: number = 0;

    constructor() {
        this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
        this.canvasWidth = this.canvas.width;
        this.canvasHeight = this.canvas.height;
        this.renderer = new Renderer(this.canvas);
        this.inputHandler = new InputHandler();
        
        this.scoreDisplay = document.getElementById('score-display') as HTMLElement;
        this.livesDisplay = document.getElementById('lives-display') as HTMLElement;
        this.gameOverDisplay = document.getElementById('game-over') as HTMLElement;
        this.finalScoreDisplay = document.getElementById('final-score') as HTMLElement;
        this.restartButton = document.getElementById('restart-button') as HTMLElement;
        
        // Initialize player ship
        this.ship = new Ship(
            new Vector(this.canvasWidth / 2, this.canvasHeight / 2),
            new Vector(0, 0),
            0
        );
        
        // Set up event listener for restart button
        this.restartButton.addEventListener('click', () => this.restart());
    }

    public start(): void {
        this.spawnInitialAsteroids();
        this.lastTime = performance.now();
        this.gameLoop(this.lastTime);
    }

    private gameLoop(currentTime: number): void {
        const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        if (!this.gameOver) {
            requestAnimationFrame((time) => this.gameLoop(time));
        }
    }

    private update(deltaTime: number): void {
        const currentTime = performance.now();
        // Check if we should spawn a new asteroid
        if (currentTime - this.lastAsteroidSpawn > this.asteroidSpawnInterval) {
            this.spawnRandomAsteroid();
            this.lastAsteroidSpawn = currentTime;
        }
        
        // Update ship
        if (!this.ship.isDestroyed()) {
            this.ship.update(deltaTime, this.canvasWidth, this.canvasHeight, this.inputHandler);
            
            // Fire bullets if space key is pressed
            if (this.inputHandler.isKeyPressed(' ') && this.ship.canFire()) {
                const bullet = this.ship.fire();
                this.bullets.push(bullet);
            }
        } else if (this.ship.isRespawning()) {
            this.ship.update(deltaTime, this.canvasWidth, this.canvasHeight, this.inputHandler);
        }
        
        // Update bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].update(deltaTime, this.canvasWidth, this.canvasHeight);
            
            // Remove bullets that are out of bounds or expired
            if (this.bullets[i].isExpired()) {
                this.bullets.splice(i, 1);
            }
        }
        
        // Update asteroids
        for (let i = this.asteroids.length - 1; i >= 0; i--) {
            this.asteroids[i].update(deltaTime, this.canvasWidth, this.canvasHeight);
        }
        
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update(deltaTime);
            if (this.particles[i].isExpired()) {
                this.particles.splice(i, 1);
            }
        }
        
        // Check collisions
        this.checkCollisions();
        
        // Check if level is complete (no asteroids left)
        if (this.asteroids.length === 0) {
            this.level++;
            this.spawnInitialAsteroids();
        }
        
        // Update UI
        this.updateUI();
    }

    private render(): void {
        this.renderer.clear();
        
        // Render ship
        if (!this.ship.isDestroyed() || this.ship.isRespawning()) {
            this.renderer.renderShip(this.ship);
        }
        
        // Render bullets
        for (const bullet of this.bullets) {
            this.renderer.renderBullet(bullet);
        }
        
        // Render asteroids
        for (const asteroid of this.asteroids) {
            this.renderer.renderAsteroid(asteroid);
        }
        
        // Render particles
        for (const particle of this.particles) {
            this.renderer.renderParticle(particle);
        }
    }

    private checkCollisions(): void {
        // Check bullet-asteroid collisions
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            for (let j = this.asteroids.length - 1; j >= 0; j--) {
                if (CollisionDetector.checkCollision(this.bullets[i], this.asteroids[j])) {
                    // Create explosion particles
                    this.createExplosion(this.asteroids[j].position, 10);
                    
                    // Split asteroid or remove if smallest
                    const newAsteroids = this.asteroids[j].split();
                    if (newAsteroids.length > 0) {
                        this.asteroids.push(...newAsteroids);
                    }
                    
                    // Update score based on asteroid size
                    this.score += this.asteroids[j].getScoreValue();
                    
                    // Remove the asteroid and bullet
                    this.asteroids.splice(j, 1);
                    this.bullets.splice(i, 1);
                    break;
                }
            }
        }
        
        // Check ship-asteroid collisions (only if ship is not respawning)
        if (!this.ship.isDestroyed() && !this.ship.isRespawning()) {
            for (let i = this.asteroids.length - 1; i >= 0; i--) {
                if (CollisionDetector.checkCollision(this.ship, this.asteroids[i])) {
                    this.lives--;
                    this.createExplosion(this.ship.position, 20);
                    this.ship.destroy();
                    
                    if (this.lives <= 0) {
                        this.gameOver = true;
                        this.gameOverDisplay.style.display = 'block';
                        this.finalScoreDisplay.textContent = this.score.toString();
                    } else {
                        // Respawn ship after a delay
                        setTimeout(() => {
                            this.ship.respawn(
                                new Vector(this.canvasWidth / 2, this.canvasHeight / 2),
                                new Vector(0, 0),
                                0
                            );
                        }, 2000);
                    }
                    break;
                }
            }
        }
    }

    private spawnInitialAsteroids(): void {
        const numAsteroids = 3 + Math.min(2 * this.level, 12); // More asteroids as levels progress
        
        for (let i = 0; i < numAsteroids; i++) {
            this.spawnRandomAsteroid();
        }
    }

    private spawnRandomAsteroid(): void {
        // Spawn from outside the screen
        let position: Vector;
        const buffer = 50; // Distance outside the screen
        
        // Determine which edge to spawn from
        const edge = Math.floor(Math.random() * 4);
        switch (edge) {
            case 0: // Top
                position = new Vector(
                    Math.random() * this.canvasWidth,
                    -buffer
                );
                break;
            case 1: // Right
                position = new Vector(
                    this.canvasWidth + buffer,
                    Math.random() * this.canvasHeight
                );
                break;
            case 2: // Bottom
                position = new Vector(
                    Math.random() * this.canvasWidth,
                    this.canvasHeight + buffer
                );
                break;
            case 3: // Left
            default:
                position = new Vector(
                    -buffer,
                    Math.random() * this.canvasHeight
                );
                break;
        }
        
        // Direction is roughly toward center of screen
        const centerDirection = new Vector(
            this.canvasWidth / 2 - position.x,
            this.canvasHeight / 2 - position.y
        ).normalize();
        
        // Add some randomness to direction
        const randomAngle = (Math.random() - 0.5) * Math.PI / 2; // +/- 45 degrees
        const direction = centerDirection.rotate(randomAngle);
        
        // Random speed based on level
        const speed = 50 + Math.random() * 30 * Math.min(this.level, 5);
        const velocity = direction.scale(speed);
        
        // Random rotation
        const rotation = Math.random() * Math.PI * 2;
        const rotationSpeed = (Math.random() - 0.5) * 2; // Random direction and speed
        
        // Create a new large asteroid
        const asteroid = new Asteroid(
            position,
            velocity,
            rotation,
            rotationSpeed,
            'large'
        );
        
        this.asteroids.push(asteroid);
        this.lastAsteroidSpawn = performance.now();
    }

    private createExplosion(position: Vector, numParticles: number): void {
        for (let i = 0; i < numParticles; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 30 + Math.random() * 70;
            const velocity = new Vector(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            );
            const lifetime = 0.5 + Math.random() * 1.0; // 0.5 to 1.5 seconds
            
            this.particles.push(new Particle(
                position.clone(),
                velocity,
                lifetime
            ));
        }
    }

    private updateUI(): void {
        this.scoreDisplay.textContent = `Score: ${this.score}`;
        this.livesDisplay.textContent = `Lives: ${this.lives}`;
    }

    private restart(): void {
        // Reset game state
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameOver = false;
        this.asteroids = [];
        this.bullets = [];
        this.particles = [];
        
        // Reset ship
        this.ship.respawn(
            new Vector(this.canvasWidth / 2, this.canvasHeight / 2),
            new Vector(0, 0),
            0
        );
        
        // Hide game over display
        this.gameOverDisplay.style.display = 'none';
        
        // Start new game
        this.start();
    }
}
