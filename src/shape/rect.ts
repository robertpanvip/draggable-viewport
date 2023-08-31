import {Point} from "../interface";
import View from "./view";

type RectStyle = {
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

    getRenderMatrix() {
        return this.vp.getMatrix().multiply(this.matrix)
    }

    render() {
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
        ctx?.restore();
        /*const leftTop = this.matrix.transformPoint({x: this.x, y: this.y})
        const bottomRight = this.matrix.transformPoint({x: this.x + this.w, y: this.y + this.h})
        const w = bottomRight.x - leftTop.x;
        const h = bottomRight.y - leftTop.y;
        ctx!.strokeStyle = 'red'
        ctx!.strokeRect(leftTop.x, leftTop.y, w, h);*/
        super.render();
    }

    samplePointsOnRoundRect(rectX: number, rectY: number, rectWidth: number, rectHeight: number, borderRadius: number, numSamples: number): Point[] {
        const points: { x: number, y: number }[] = [];

        const radius = Math.min(borderRadius, rectWidth / 2, rectHeight / 2);

        const numArcSamples = Math.floor(numSamples / 4);
        const arcAngleIncrement = Math.PI / (2 * numArcSamples);

        for (let i = 0; i <= numArcSamples; i++) {
            const angle = i * arcAngleIncrement;
            const x = rectX + rectWidth - radius + radius * Math.cos(angle);
            const y = rectY + rectHeight - radius + radius * Math.sin(angle);
            points.push({x, y});
        }

        for (let i = 0; i <= numArcSamples; i++) {
            const angle = i * arcAngleIncrement;
            const x = rectX + radius - radius * Math.cos(angle);
            const y = rectY + rectHeight - radius + radius * Math.sin(angle);
            points.push({x, y});
        }

        for (let i = 0; i <= numArcSamples; i++) {
            const angle = i * arcAngleIncrement;
            const x = rectX + radius - radius * Math.cos(angle);
            const y = rectY + radius - radius * Math.sin(angle);
            points.push({x, y});
        }

        for (let i = 0; i <= numArcSamples; i++) {
            const angle = i * arcAngleIncrement;
            const x = rectX + rectWidth - radius + radius * Math.cos(angle);
            const y = rectY + radius - radius * Math.sin(angle);
            points.push({x, y});
        }

        return points;
    }

    isPointContains({x, y}: Point): boolean {
        const samplePoints = this.samplePointsOnRoundRect(this.x, this.y, this.w, this.h, this.style.borderRadius || 1, (this.w + this.h) * 2)
        const points = samplePoints.map(point => this.getRenderMatrix().transformPoint(point));
        return this.isPointInPolygon(x, y, points)
    }
}

export default Rect