export class Vector {
    constructor(public x: number, public y: number) {}

    public add(other: Vector): Vector {
        return new Vector(this.x + other.x, this.y + other.y);
    }

    public subtract(other: Vector): Vector {
        return new Vector(this.x - other.x, this.y - other.y);
    }

    public scale(scalar: number): Vector {
        return new Vector(this.x * scalar, this.y * scalar);
    }

    public length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    public normalize(): Vector {
        const len = this.length();
        if (len === 0) {
            return new Vector(0, 0);
        }
        return new Vector(this.x / len, this.y / len);
    }

    public clone(): Vector {
        return new Vector(this.x, this.y);
    }

    public rotate(angle: number): Vector {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return new Vector(
            this.x * cos - this.y * sin,
            this.x * sin + this.y * cos
        );
    }

    public distance(other: Vector): number {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}
