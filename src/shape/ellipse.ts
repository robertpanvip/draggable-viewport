import {RectangleLike} from "../interface";
import View from "./view";
//cx="240" cy="50" rx="220" ry="30"
type EllipseConfig = {
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    rotation?: number;//椭圆的旋转角度，以弧度表示 (非角度度数)
    startAngle?: number;//将要绘制的起始点角度，从 x 轴测量，以弧度表示 (非角度度数)。
    endAngle?: number;//椭圆将要绘制的结束点角度，以弧度表示 (非角度度数)。
}

class Ellipse extends View {
    name: string = "Ellipse";
    style: { cursor?: string } = {};
    x: number = 0;
    y: number = 0;
    public cx: number;//CX属性定义的椭圆中心的x坐标
    public cy: number;
    public rx: number;//RX属性定义的水平半径
    public ry: number;
    public rotation: number;//椭圆的旋转角度，以弧度表示 (非角度度数)
    public startAngle: number;//将要绘制的起始点角度，从 x 轴测量，以弧度表示 (非角度度数)。
    public endAngle: number;//椭圆将要绘制的结束点角度，以弧度表示 (非角度度数)。

    constructor({cx, cy, rx, ry, rotation = 0, startAngle = 0, endAngle = 2 * Math.PI}: EllipseConfig) {
        super();
        this.cx = cx;
        this.cy = cy;
        this.rx = rx;
        this.ry = ry;
        this.rotation = rotation;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
    }

    getBBox(): RectangleLike {
        const rx = this.rx;
        const ry = this.ry;
        const cx = this.cx;
        const cy = this.cy;
        const startAngle = this.startAngle;
        const endAngle = this.endAngle;
        const rotation = this.rotation;
        const sinRotation = Math.sin(rotation);
        const cosRotation = Math.cos(rotation);

        const startX = cx + rx * Math.cos(startAngle) * cosRotation - ry * Math.sin(startAngle) * sinRotation;
        const startY = cy + rx * Math.cos(startAngle) * sinRotation + ry * Math.sin(startAngle) * cosRotation;

        let minX = startX;
        let minY = startY;
        let maxX = startX;
        let maxY = startY;

        for (let angle = startAngle; angle <= endAngle; angle += 0.01) {
            const x = cx + rx * Math.cos(angle) * cosRotation - ry * Math.sin(angle) * sinRotation;
            const y = cy + rx * Math.cos(angle) * sinRotation + ry * Math.sin(angle) * cosRotation;

            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
        }

        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }

    render() {
        const ctx = this.ctx!;
        ctx.save()
        this.ctx!.setTransform(this.getRenderMatrix());
        ctx.beginPath();
        ctx.ellipse(this.cx, this.cy, this.rx, this.ry, this.rotation, this.startAngle, this.endAngle)
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
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
        super.render();
    }

    getShape(): Path2D[] {
        const rx = this.rx;
        const ry = this.ry;
        const cx = this.cx;
        const cy = this.cy;
        const startAngle = this.startAngle;
        const endAngle = this.endAngle;
        const rotation = this.rotation;
        const path = new Path2D();
        path.ellipse(cx, cy, rx, ry, rotation, startAngle, endAngle)
        return [path]
    }

}

export default Ellipse