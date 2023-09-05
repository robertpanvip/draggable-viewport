import Path from "./path";
import {ViewStyle} from "../interface";

export type RectConfig = {
    readonly x: number,
    readonly y: number,
    readonly w: number,
    readonly h: number,
    readonly rx: number
    readonly ry: number
    style?: Partial<ViewStyle & { borderRadius: number }>
}


class Rect extends Path {

    name: string = "Rect"

    style: Partial<ViewStyle & { borderRadius?: number }> = {}

    readonly x: number
    readonly y: number
    readonly w: number
    readonly h: number
    readonly rx: number
    readonly ry: number

    constructor(
        {
            x,
            y,
            w,
            h,
            rx,
            ry,
            style = {}
        }: RectConfig = {
            x: 0,
            y: 0,
            w: 10,
            h: 10,
            rx: 0,
            ry: 0,
            style: {}
        }) {
        super({
            d: ''
        });
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.rx = rx > w / 2 ? w / 2 : rx;
        this.ry = ry > h / 2 ? h / 2 : ry;
        this.style = style
    }

    getBBox() {
        return {x: this.x, y: this.y, width: this.w, height: this.h}
    }


    getShape(): Path2D[] {
        const path = new Path2D();
        const {x, y, rx, ry, w, h} = this;
        path.roundRect(x, y, w, h, [rx, ry])
        path.closePath();
        return [path]
    };
}

export default Rect