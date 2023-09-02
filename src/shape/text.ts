import {Point} from "../interface";
import View from "./view";

type TextStyle = {
    cursor?: string;
    font?: string;
    overflow?: 'default' | "hidden" | 'ellipsis';//hidden。这个关键字会在内容区域隐藏文本 ellipsis 这个关键字会用一个省略号（'…'）来表示被截断的文本。这个省略号被添加在内容区域中，因此会减少显示的文本。如果空间太小以至于连省略号都容纳不下，那么这个省略号也会被截断
    wrap?: 'wrap' | 'nowrap'
    color?: string | CanvasGradient | CanvasPattern;
    linePadding?: number
    textBaseline?: CanvasTextBaseline;
    textAlign?: CanvasTextAlign;
    textRendering?: CanvasTextRendering;
}
type TextConfig = {
    x: number,
    y: number,
    text?: string;
    style?: TextStyle
}

const defaultStyle = {
    color: 'black',
    font: '20px Georgia',
    textBaseline: 'top' as const,
    textAlign: 'left' as const,
    linePadding: 10,
    wrap: 'wrap' as const,
    overflow: 'ellipsis' as const
}
const canvas = document.createElement('canvas')
const fCtx = canvas.getContext('2d')!

function measureWidth(text: string, font: string) {
    fCtx.font = font;
    const metrics = fCtx.measureText(text);
    return metrics.width
}

function measureHeight(font: string) {
    fCtx.font = font;
    const metrics = fCtx.measureText('我');
    return metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent
}

function renderText(text: string, font: string, maxWidth: number) {
    const arr = text.split('');
    let res: string[] = [];
    let tmp = 0;
    let tmpWord = '';
    arr.forEach(word => {
        const wordWidth = measureWidth(word, font)
        tmp = tmp + wordWidth;
        tmpWord = tmpWord + word
        if (tmp + wordWidth > maxWidth) {
            res.push(tmpWord);
            tmp = 0;
            tmpWord = ''
        }
    })
    if (tmpWord) {
        res.push(tmpWord);
    }
    return res
}

class Text extends View {

    name: string = "Text"

    public x: number
    public y: number
    public maxWidth?: number

    public text: string = "";

    public style: TextStyle = {...defaultStyle};

    constructor(
        {
            x,
            y,
            text,
            style = {...defaultStyle}
        }: TextConfig = {
            x: 0,
            y: 0,
            text: '',
            style: {...defaultStyle}
        }) {
        super();
        this.x = x;
        this.y = y;
        this.text = text || ""
        this.style = style
    }

    get calcTexts() {
        const {wrap, font, overflow} = this.style;
        if (!this.maxWidth) {
            return [this.text]
        }
        if (wrap === 'wrap') {
            return renderText(this.text, font!, this.maxWidth)
        }
        if (overflow === 'hidden') {
            const texts = renderText(this.text, font!, this.maxWidth);
            return [texts[0]]
        }
        if (overflow === 'ellipsis') {
            const texts = renderText(this.text, font!, this.maxWidth)
            if (texts.length >= 2) {
                const line = texts[0];
                const arr = line.split('')
                const ellipsisWidth = measureWidth(`…`, font!)
                if (ellipsisWidth > this.maxWidth) {
                    return []
                }
                while (measureWidth(`${arr.join('')}…`, font!) > this.maxWidth) {
                    arr.pop()
                }
                return [`${arr.join('')}…`]
            }
        }
        return [this.text]
    }

    getBBox() {
        const h = measureHeight(this.style.font!);
        const sizes = this.calcTexts.map((text, index) => {
            return {
                w: measureWidth(text, this.style.font!),
                h: h + this.style.linePadding! * 2,
            }
        })
        return {
            x: this.x,
            y: this.y,
            width: Math.max(...sizes.map(size => size.w)),
            height: sizes.length * (h + this.style.linePadding! * 2)
        }
    }

    getRenderMatrix() {
        return this.vp.getMatrix().multiply(this.matrix)
    }

    render() {
        const ctx = this.ctx!;
        ctx?.save()
        ctx!.setTransform(this.getRenderMatrix());
        ctx!.fillStyle = this.style?.color!;
        //ctx!.strokeStyle = this.style?.borderColor!;

        if (this.style.font) {
            ctx!.font = this.style.font;
            ctx!.textBaseline = this.style.textBaseline!;
            ctx!.textAlign = this.style.textAlign!
        }
        const h = measureHeight(this.style.font!)

        this.calcTexts.forEach((text, index) => {
            ctx!.fillText(text, this.x, this.y + h * index + this.style.linePadding! * (index * 2 + 1))
        })

        /*if (this.maxWidth) {
            ctx!.beginPath();
            ctx!.roundRect(this.x, this.y, this.maxWidth, this.getBBox().height, 0);
            ctx!.stroke();
        }*/
        // 渲染多边形
       /* ctx.beginPath();
        this.getSamplePoint().forEach((vertex, index) => {
            if (index === 0) {
                ctx.moveTo(vertex.x, vertex.y);
            } else {
                ctx.lineTo(vertex.x, vertex.y);
            }
        });
        ctx.closePath();
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.stroke();*/

        ctx?.restore();
        super.render();
    }

    /**计算两点之间的极角*/
    calcAngle(p1: Point, p2: Point) {
        return Math.atan2(p2.y - p1.y, p2.x - p1.x)
    }

    sortMaxArea(points: Point[]) {
        const start_point = points.reduce((min, p) => p.x < min.x ? p : min)
        const sorted_points: Point[] = [start_point]
        points.splice(points.indexOf(start_point), 1)
        points.sort((p1, p2) => this.calcAngle(start_point, p1) - this.calcAngle(start_point, p2))
        sorted_points.push(...points)
        return sorted_points
    }

    getSamplePoint() {
        const h = measureHeight(this.style.font!)
        const points = this.calcTexts.flatMap((item, index) => {
            const _h = (h + this.style.linePadding! * 2)
            const w = measureWidth(item, this.style.font!)
            return this.samplePointsOnRoundRect(this.x, this.y + _h * index, w, _h, 0, 1)
        });
        return this.sortMaxArea(points)
    }


    isPointContains({x, y}: Point): boolean {
        const points = this.getSamplePoint().map(point => this.getRenderMatrix().transformPoint(point));
        return this.isPointInPolygon(x, y, points)
    }
}

export default Text