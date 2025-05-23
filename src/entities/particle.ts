import { Entity } from './entity';
import { Vector } from '../utils/vector';

export class Particle extends Entity {
    public readonly maxLifetime: number;
    public lifetime: number;

    constructor(
        position: Vector,
        velocity: Vector,
        maxLifetime: number
    ) {
        super(position, velocity, 0, 2); // Particles have 2 unit radius
        this.maxLifetime = maxLifetime;
        this.lifetime = maxLifetime;
    }

    public update(deltaTime: number): void {
        // Update position based on velocity
        this.position = this.position.add(this.velocity.scale(deltaTime));
        
        // No screen wrapping for particles
        
        // Decrease lifetime
        this.lifetime -= deltaTime;
        
        // Slow down particles over time
        this.velocity = this.velocity.scale(0.97);
    }

    public isExpired(): boolean {
        return this.lifetime <= 0;
    }
}
