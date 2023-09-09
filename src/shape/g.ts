import View from "./view";
import {RectangleLike} from "../interface";

class G extends View {

    public children: View[] = []

    constructor() {
        super();
        this.drawBBox = true
    }

    getBBox(): RectangleLike {
        const childrenBBoxes = this.children.map(child => {
            const points = child.getBBoxPoints();
            const [a, b, c, d] = points.map(p => child.matrix.transformPoint(p))
            return {
                x: a.x,
                y: a.y,
                width: d.x - b.x,
                height: b.y - a.y
            }
        })
        let minX = Number.MAX_VALUE;
        let minY = Number.MAX_VALUE;
        let maxX = Number.MIN_VALUE;
        let maxY = Number.MIN_VALUE;

        for (const childBBox of childrenBBoxes) {
            minX = Math.min(minX, childBBox.x);
            minY = Math.min(minY, childBBox.y);
            maxX = Math.max(maxX, childBBox.x + childBBox.width);
            maxY = Math.max(maxY, childBBox.y + childBBox.height);
        }

        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
        };
    }

    getShape(): Path2D[] {
        return this.children.flatMap(child => child.getShape());
    }

    render() {
        super.render();
        if (this.drawShape) {
            this.renderShape({
                strokeStyle: 'red'!,
                //fillStyle: this.style?.color!,
                strokeWidth: 1!
            })
        }

        if (this.drawBBox) {
            this.renderBBox()
        }
    }

}

export default G