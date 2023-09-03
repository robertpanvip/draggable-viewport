import {RectangleLike} from "../interface";
import Ellipse from "./ellipse";

type EllipseConfig = {
    cx: number;//CX属性定义的圆中心的x坐标
    cy: number;
    r: number;
}

class Circle extends Ellipse {
    public r: number;

    constructor({cx, cy, r}: EllipseConfig = {cx: 0, cy: 0, r: 10}) {
        super({cx, cy, rx: r, ry: r,});
        this.r = r;
    }

    getBBox(): RectangleLike {
        return {
            x: this.cx - this.r,
            y: this.cy - this.r,
            width: 2 * this.r,
            height: 2 * this.r
        };
    }
}

export default Circle