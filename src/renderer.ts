import { Ship } from './entities/ship';
import { Asteroid } from './entities/asteroid';
import { Bullet } from './entities/bullet';
import { Particle } from './entities/particle';

export class Renderer {
    private ctx: CanvasRenderingContext2D;

    constructor(private canvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    }

    public clear(): void {
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    public renderShip(ship: Ship): void {
        const { position, rotation } = ship;
        
        this.ctx.save();
        this.ctx.translate(position.x, position.y);
        this.ctx.rotate(rotation);
        
        // Draw ship if it's not in respawning blinking state or should be visible during blink
        if (!ship.isRespawning() || ship.isVisibleDuringRespawn()) {
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            // Draw a triangular ship
            this.ctx.moveTo(15, 0);
            this.ctx.lineTo(-10, 10);
            this.ctx.lineTo(-5, 0);
            this.ctx.lineTo(-10, -10);
            this.ctx.lineTo(15, 0);
            this.ctx.stroke();
            this.ctx.closePath();
        }
        
        // Draw thrust flame if accelerating
        if (ship.isAccelerating() && (!ship.isRespawning() || ship.isVisibleDuringRespawn())) {
            this.ctx.strokeStyle = '#FFA500';
            this.ctx.beginPath();
            this.ctx.moveTo(-5, 0);
            this.ctx.lineTo(-15, 5);
            this.ctx.lineTo(-12, 0);
            this.ctx.lineTo(-15, -5);
            this.ctx.lineTo(-5, 0);
            this.ctx.stroke();
            this.ctx.closePath();
        }
        
        this.ctx.restore();
    }

    public renderAsteroid(asteroid: Asteroid): void {
        const { position, rotation, size, radius } = asteroid;
        
        this.ctx.save();
        this.ctx.translate(position.x, position.y);
        this.ctx.rotate(rotation);
        
        // Use the butt image if it's loaded, otherwise fallback to the shape
        if (Asteroid.buttImage && Asteroid.imageLoaded) {
            // Scale image based on asteroid size
            let scale = 1;
            switch (size) {
                case 'large': scale = 1.0; break;
                case 'medium': scale = 0.6; break;
                case 'small': scale = 0.3; break;
            }
            
            // Draw the image centered on the asteroid position
            const imageSize = radius * 2.5; // Make sure image covers the collision radius
            this.ctx.drawImage(
                Asteroid.buttImage, 
                -imageSize / 2, 
                -imageSize / 2, 
                imageSize, 
                imageSize
            );
        } else {
            // Fallback to drawing the outline if image isn't loaded
            const vertices = asteroid.getVertices();
            
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(vertices[0].x, vertices[0].y);
            for (let i = 1; i < vertices.length; i++) {
                this.ctx.lineTo(vertices[i].x, vertices[i].y);
            }
            this.ctx.closePath();
            this.ctx.stroke();
            
            // Add a subtle fill
            this.ctx.fillStyle = 'rgba(255, 200, 200, 0.2)';
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }

    public renderBullet(bullet: Bullet): void {
        const { position, radius } = bullet;
        
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.closePath();
    }

    public renderParticle(particle: Particle): void {
        const { position, radius, lifetime, maxLifetime } = particle;
        
        // Fade out as the particle ages
        const alpha = lifetime / maxLifetime;
        
        this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        this.ctx.beginPath();
        this.ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.closePath();
    }
}
