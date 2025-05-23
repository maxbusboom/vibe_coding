import { Entity } from './entity';
import { Vector } from '../utils/vector';
import { InputHandler } from '../input-handler';
import { Bullet } from './bullet';

export class Ship extends Entity {
    private readonly maxSpeed: number = 200;
    private readonly acceleration: number = 200;
    private readonly rotationSpeed: number = 4;
    private readonly fireRate: number = 0.25; // Time between shots in seconds
    private timeSinceLastShot: number = 0;
    private accelerating: boolean = false;
    private destroyed: boolean = false;
    private respawning: boolean = false;
    private respawnBlinkTimer: number = 0;
    private respawnBlinkInterval: number = 0.1; // Blink every 0.1 seconds
    private respawnDuration: number = 3; // 3 seconds of invulnerability when respawning

    constructor(position: Vector, velocity: Vector, rotation: number) {
        // Ship radius is 15 units to match its size
        super(position, velocity, rotation, 15);
    }

    public update(deltaTime: number, canvasWidth: number, canvasHeight: number, inputHandler?: InputHandler): void {
        if (this.destroyed) {
            return;
        }

        // Handle respawning blink effect
        if (this.respawning) {
            this.respawnBlinkTimer += deltaTime;
            if (this.respawnBlinkTimer >= this.respawnDuration) {
                this.respawning = false;
                this.respawnBlinkTimer = 0;
            }
        }

        // Increase timer since last shot
        this.timeSinceLastShot += deltaTime;

        if (inputHandler) {
            // Rotation
            if (inputHandler.isKeyPressed('ArrowLeft') || inputHandler.isKeyPressed('a')) {
                this.rotation -= this.rotationSpeed * deltaTime;
            }
            if (inputHandler.isKeyPressed('ArrowRight') || inputHandler.isKeyPressed('d')) {
                this.rotation += this.rotationSpeed * deltaTime;
            }

            // Thrust
            this.accelerating = inputHandler.isKeyPressed('ArrowUp') || inputHandler.isKeyPressed('w');
            if (this.accelerating) {
                const thrustDirection = new Vector(Math.cos(this.rotation), Math.sin(this.rotation));
                const acceleration = thrustDirection.scale(this.acceleration * deltaTime);
                this.velocity = this.velocity.add(acceleration);

                // Limit to max speed
                const speed = this.velocity.length();
                if (speed > this.maxSpeed) {
                    this.velocity = this.velocity.scale(this.maxSpeed / speed);
                }
            }
        }

        // Apply drag/friction to gradually slow down
        const drag = 0.99;
        this.velocity = this.velocity.scale(Math.pow(drag, deltaTime * 60));

        super.update(deltaTime, canvasWidth, canvasHeight);
    }

    public fire(): Bullet {
        this.timeSinceLastShot = 0;

        // Calculate bullet starting position (at the tip of the ship)
        const bulletOffset = new Vector(Math.cos(this.rotation), Math.sin(this.rotation)).scale(this.radius);
        const bulletPosition = this.position.add(bulletOffset);

        // Calculate bullet velocity (ship velocity + bullet speed in ship direction)
        const bulletSpeed = 400;
        const bulletDirection = new Vector(Math.cos(this.rotation), Math.sin(this.rotation));
        const bulletVelocity = bulletDirection.scale(bulletSpeed).add(this.velocity);

        return new Bullet(bulletPosition, bulletVelocity);
    }

    public canFire(): boolean {
        return this.timeSinceLastShot >= this.fireRate;
    }

    public isAccelerating(): boolean {
        return this.accelerating;
    }

    public isDestroyed(): boolean {
        return this.destroyed;
    }

    public destroy(): void {
        this.destroyed = true;
    }

    public respawn(position: Vector, velocity: Vector, rotation: number): void {
        this.position = position;
        this.velocity = velocity;
        this.rotation = rotation;
        this.destroyed = false;
        this.respawning = true;
        this.respawnBlinkTimer = 0;
    }

    public isRespawning(): boolean {
        return this.respawning;
    }

    public isVisibleDuringRespawn(): boolean {
        if (!this.respawning) return true;
        // Create a blinking effect during respawn
        return Math.floor(this.respawnBlinkTimer / this.respawnBlinkInterval) % 2 === 0;
    }
}
