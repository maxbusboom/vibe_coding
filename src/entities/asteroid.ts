import { Entity } from './entity';
import { Vector } from '../utils/vector';
import { getBasePath } from '../utils/base-path';

export type AsteroidSize = 'large' | 'medium' | 'small';

export class Asteroid extends Entity {
    private rotationSpeed: number;
    private vertices: Vector[] = [];
    static buttImage: HTMLImageElement | null = null;
    static imageLoaded: boolean = false;
    
    constructor(
        position: Vector,
        velocity: Vector,
        rotation: number,
        rotationSpeed: number,
        public size: AsteroidSize
    ) {
        // Set radius based on size
        let radius: number;
        switch (size) {
            case 'large': radius = 40; break;
            case 'medium': radius = 20; break;
            case 'small': radius = 10; break;
        }
        
        super(position, velocity, rotation, radius);
        this.rotationSpeed = rotationSpeed;
        this.generateVertices(); // Keep this for collision detection
        
        // Load the butt image if not already loaded
        if (!Asteroid.buttImage) {
            Asteroid.buttImage = new Image();
            // Get the base path based on environment
            const basePath = getBasePath();
            // First try to load the PNG file
            Asteroid.buttImage.src = `${basePath}/assets/butt.png`;
            Asteroid.buttImage.onload = () => {
                Asteroid.imageLoaded = true;
            };
            Asteroid.buttImage.onerror = () => {
                // If PNG fails, try the SVG fallback
                Asteroid.buttImage!.src = `${basePath}/assets/butt.svg`;
                Asteroid.buttImage!.onload = () => {
                    Asteroid.imageLoaded = true;
                };
            };
        }
    }
    
    public update(deltaTime: number, canvasWidth: number, canvasHeight: number): void {
        // Update rotation
        this.rotation += this.rotationSpeed * deltaTime;
        
        super.update(deltaTime, canvasWidth, canvasHeight);
    }
    
    public split(): Asteroid[] {
        if (this.size === 'small') {
            // Smallest asteroids don't split
            return [];
        }
        
        const newSize: AsteroidSize = this.size === 'large' ? 'medium' : 'small';
        const newAsteroids: Asteroid[] = [];
        
        // Create two smaller asteroids
        for (let i = 0; i < 2; i++) {
            // Random velocity direction with similar speed to parent
            const angle = Math.random() * Math.PI * 2;
            const speed = this.velocity.length() * (1.2 + Math.random() * 0.4); // 20-60% faster
            const newVelocity = new Vector(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            );
            
            // Random rotation
            const newRotation = Math.random() * Math.PI * 2;
            const newRotationSpeed = (Math.random() - 0.5) * 3; // Random direction and faster rotation
            
            // Create new asteroid slightly offset from the original
            const offset = new Vector(
                (Math.random() - 0.5) * this.radius,
                (Math.random() - 0.5) * this.radius
            );
            
            newAsteroids.push(new Asteroid(
                this.position.add(offset),
                newVelocity,
                newRotation,
                newRotationSpeed,
                newSize
            ));
        }
        
        return newAsteroids;
    }
    
    public getScoreValue(): number {
        switch (this.size) {
            case 'large': return 20;
            case 'medium': return 50;
            case 'small': return 100;
        }
    }
    
    public getVertices(): Vector[] {
        return this.vertices.map(v => v.rotate(this.rotation));
    }
    
    private generateVertices(): void {
        // For a more pronounced buttocks shape, we'll design it directly
        // rather than modifying a circle
        
        // Base size of the butt depends on asteroid size
        const buttSize = this.radius;
        this.vertices = [];
        
        // Create a more explicit buttocks shape with a crack in the middle
        
        // Start with the top of the buttocks (narrower part)
        this.vertices.push(new Vector(0, -buttSize * 0.7));
        
        // Left side curve (upper left quadrant)
        this.vertices.push(new Vector(-buttSize * 0.6, -buttSize * 0.5));
        this.vertices.push(new Vector(-buttSize * 0.8, -buttSize * 0.2));
        this.vertices.push(new Vector(-buttSize * 0.9, 0));
        
        // Left cheek (lower left quadrant)
        this.vertices.push(new Vector(-buttSize * 0.8, buttSize * 0.4));
        this.vertices.push(new Vector(-buttSize * 0.5, buttSize * 0.8));
        
        // Bottom crack (clearly defining the separation between cheeks)
        this.vertices.push(new Vector(-buttSize * 0.2, buttSize * 0.9));
        this.vertices.push(new Vector(0, buttSize * 0.7)); // Center bottom (crack)
        this.vertices.push(new Vector(buttSize * 0.2, buttSize * 0.9));
        
        // Right cheek (lower right quadrant)
        this.vertices.push(new Vector(buttSize * 0.5, buttSize * 0.8));
        this.vertices.push(new Vector(buttSize * 0.8, buttSize * 0.4));
        
        // Right side curve (upper right quadrant)
        this.vertices.push(new Vector(buttSize * 0.9, 0));
        this.vertices.push(new Vector(buttSize * 0.8, -buttSize * 0.2));
        this.vertices.push(new Vector(buttSize * 0.6, -buttSize * 0.5));
        
        // Close the shape by returning to the top
        this.vertices.push(new Vector(0, -buttSize * 0.7));
        
        // Add some randomness to the vertices to make each asteroid unique
        // but keep the essential butt shape intact
        if (this.size !== 'small') { // Keep small asteroids more regular
            const randomFactor = this.size === 'large' ? 0.15 : 0.1;
            for (let i = 0; i < this.vertices.length; i++) {
                // Don't randomize the center crack too much to preserve the butt look
                const isCenter = i >= 6 && i <= 8;
                const factor = isCenter ? randomFactor * 0.3 : randomFactor;
                
                this.vertices[i].x += (Math.random() - 0.5) * factor * buttSize;
                this.vertices[i].y += (Math.random() - 0.5) * factor * buttSize;
            }
        }
    }
}
