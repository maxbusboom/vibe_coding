import { Entity } from './entity';
import { Vector } from '../utils/vector';

export class Bullet extends Entity {
    private readonly lifetime: number = 2; // Bullet lifetime in seconds
    private timeAlive: number = 0;
    
    constructor(position: Vector, velocity: Vector) {
        super(position, velocity, 0, 3); // Bullets have 3 unit radius
    }
    
    public update(deltaTime: number, canvasWidth: number, canvasHeight: number): void {
        super.update(deltaTime, canvasWidth, canvasHeight);
        
        // Track bullet lifetime
        this.timeAlive += deltaTime;
    }
    
    public isExpired(): boolean {
        return this.timeAlive >= this.lifetime;
    }
}
