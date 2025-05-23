import { Vector } from '../utils/vector';

export abstract class Entity {
    constructor(
        public position: Vector,
        public velocity: Vector,
        public rotation: number = 0,
        public radius: number = 0
    ) {}

    public update(deltaTime: number, canvasWidth: number, canvasHeight: number, ...args: any[]): void {
        // Update position based on velocity
        this.position = this.position.add(this.velocity.scale(deltaTime));
        
        // Wrap around screen edges
        this.handleScreenWrapping(canvasWidth, canvasHeight);
    }

    protected handleScreenWrapping(canvasWidth: number, canvasHeight: number): void {
        // Wrap horizontally
        if (this.position.x < -this.radius) {
            this.position.x = canvasWidth + this.radius;
        } else if (this.position.x > canvasWidth + this.radius) {
            this.position.x = -this.radius;
        }
        
        // Wrap vertically
        if (this.position.y < -this.radius) {
            this.position.y = canvasHeight + this.radius;
        } else if (this.position.y > canvasHeight + this.radius) {
            this.position.y = -this.radius;
        }
    }
}
