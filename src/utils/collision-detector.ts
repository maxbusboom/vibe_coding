import { Entity } from '../entities/entity';

export class CollisionDetector {
    public static checkCollision(entity1: Entity, entity2: Entity): boolean {
        // Simple circle collision detection
        const distance = entity1.position.distance(entity2.position);
        const combinedRadius = entity1.radius + entity2.radius;
        return distance < combinedRadius;
    }
}
