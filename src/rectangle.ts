export interface RectangleLike {
    x: number
    y: number
    width: number
    height: number
}

export class Rectangle {
    public x: number
    public y: number
    public width: number
    public height: number

    constructor(x?: number, y?: number, width?: number, height?: number) {
        this.x = x == null ? 0 : x
        this.y = y == null ? 0 : y
        this.width = width == null ? 0 : width
        this.height = height == null ? 0 : height
    }

    public get corner() {
        return {
            x: this.x + this.width,
            y: this.y + this.height,
        }
    }

    static isRectangle(instance: any): instance is Rectangle {
        return instance != null && instance instanceof Rectangle
    }

    static isRectangleLike(o: any): o is RectangleLike {
        return (
            o != null &&
            typeof o === 'object' &&
            typeof o.x === 'number' &&
            typeof o.y === 'number' &&
            typeof o.width === 'number' &&
            typeof o.height === 'number'
        )
    }

    /**
     * Normalize the rectangle, i.e. make it so that it has non-negative
     * width and height. If width is less than `0`, the function swaps left and
     * right corners and if height is less than `0`, the top and bottom corners
     * are swapped.
     */
    normalize() {
        let newx = this.x
        let newy = this.y
        let newwidth = this.width
        let newheight = this.height
        if (this.width < 0) {
            newx = this.x + this.width
            newwidth = -this.width
        }
        if (this.height < 0) {
            newy = this.y + this.height
            newheight = -this.height
        }
        this.x = newx
        this.y = newy
        this.width = newwidth
        this.height = newheight
        return this
    }

    equals(rect: RectangleLike) {
        return (
            rect != null &&
            rect.x === this.x &&
            rect.y === this.y &&
            rect.width === this.width &&
            rect.height === this.height
        )
    }

    toJSON() {
        return {x: this.x, y: this.y, width: this.width, height: this.height}
    }

    serialize() {
        return `${this.x} ${this.y} ${this.width} ${this.height}`
    }

    clone() {
        return new Rectangle(this.x, this.y, this.width, this.height)
    }

    static create(rect: RectangleLike): Rectangle
    static create(
        x?: number,
        y?: number,
        width?: number,
        height?: number,
    ): Rectangle
    static create(
        x?: number | RectangleLike,
        y?: number,
        width?: number,
        height?: number,
    ): Rectangle

    static create(
        x?: number | RectangleLike,
        y?: number,
        width?: number,
        height?: number,
    ): Rectangle {
        if (x == null || typeof x === 'number') {
            return new Rectangle(x as number, y, width, height)
        }

        return Rectangle.clone(x)
    }

    static clone(rect: RectangleLike) {
        if (Rectangle.isRectangle(rect)) {
            return rect.clone()
        }

        if (Array.isArray(rect)) {
            return new Rectangle(rect[0], rect[1], rect[2], rect[3])
        }

        return new Rectangle(rect.x, rect.y, rect.width, rect.height)
    }

    public get origin() {
        return {
            x: this.x,
            y: this.y,
        }
    }

    /**
     * Returns a rectangle that is a union of this rectangle and rectangle `rect`.
     */
    union(rect: RectangleLike) {
        const ref = Rectangle.clone(rect)
        const myOrigin = this.origin
        const myCorner = this.corner
        const rOrigin = ref.origin
        const rCorner = ref.corner

        const originX = Math.min(myOrigin.x, rOrigin.x)
        const originY = Math.min(myOrigin.y, rOrigin.y)
        const cornerX = Math.max(myCorner.x, rCorner.x)
        const cornerY = Math.max(myCorner.y, rCorner.y)

        return new Rectangle(originX, originY, cornerX - originX, cornerY - originY)
    }
}