import {Point} from "../interface";
import View from "./view";

type RectStyle = {
    cursor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    background?: string;
}
type RectConfig = {
    x: number,
    y: number,
    w: number,
    h: number,
    style?: RectStyle
}

const defaultStyle = {
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 0,
    background: 'transparent'
}

class Rect extends View {

    name: string = "Rect"

    readonly x: number
    readonly y: number
    readonly w: number
    readonly h: number

    public style: RectStyle = {...defaultStyle};

    constructor(
        {
            x,
            y,
            w,
            h,
            style = {...defaultStyle}
        }: RectConfig = {
            x: 0,
            y: 0,
            w: 10,
            h: 10,
            style: {...defaultStyle}
        }) {
        super();
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.style = style
    }

    getBBox() {
        return {x: this.x, y: this.y, width: this.w, height: this.h}
    }

    render() {
        super.render();
        const ctx = this.ctx;
        ctx?.save()
        ctx!.setTransform(this.getRenderMatrix());
        //ctx!.translate(this.x, this.y);
        ctx!.fillStyle = this.style?.background!;
        ctx!.strokeStyle = this.style?.borderColor!;
        ctx!.beginPath();
        ctx!.roundRect(this.x, this.y, this.w, this.h, this.style!.borderRadius);
        ctx!.stroke();
        ctx?.fill();
        if (this.drawBBox) {
            this.renderBBox();
        }

        ctx?.restore();
        /*const leftTop = this.matrix.transformPoint({x: this.x, y: this.y})
        const bottomRight = this.matrix.transformPoint({x: this.x + this.w, y: this.y + this.h})
        const w = bottomRight.x - leftTop.x;
        const h = bottomRight.y - leftTop.y;
        ctx!.strokeStyle = 'red'
        ctx!.strokeRect(leftTop.x, leftTop.y, w, h);*/


    }


    getShape(): Path2D[] {
        const path = new Path2D();
        const {x, y} = this;
        const width = this.w;
        const height = this.h;
        const cornerRadius = this.style.borderRadius || 0;
        // 从左上角开始绘制矩形路径
        path.moveTo(x + cornerRadius, y);
        path.lineTo(x + width - cornerRadius, y);
        path.arcTo(x + width, y, x + width, y + cornerRadius, cornerRadius);
        path.lineTo(x + width, y + height - cornerRadius);
        path.arcTo(x + width, y + height, x + width - cornerRadius, y + height, cornerRadius);
        path.lineTo(x + cornerRadius, y + height);
        path.arcTo(x, y + height, x, y + height - cornerRadius, cornerRadius);
        path.lineTo(x, y + cornerRadius);
        path.arcTo(x, y, x + cornerRadius, y, cornerRadius);
        path.closePath();
        return [path]
    };
}

export default Rect