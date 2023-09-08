import View from "./view";
import {
    calculateVerticalPoint, genClosePath,
    getPathBounds, getTotalLength,
    measureHeight,
    measureWidth,
    renderText,
    svgPathToTangentPoints
} from "../utils/convert";
import {Point, TangentPoint} from "../interface";
import Path from "./path";

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
    dx?: number;
    dy?: number;
    text?: string;
    path?: string;
    startOffset?: number;
    spacing?: number;
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


interface PrivateScope {
    closePathPoints: Point[];
    wordPoints: TangentPoint[]
}

const vm = new WeakMap<Text, PrivateScope>()


class Text extends View {

    name: string = "Text"

    public x: number
    public y: number
    public maxWidth?: number

    public text: string = "";
    public path: string = ""

    public style: TextStyle = {...defaultStyle};
    private dx: number = 0;
    private dy: number = 0;
    private spacing: number = 0;

    constructor(
        {
            x,
            y,
            dx,
            dy,
            text,
            path,
            startOffset,
            spacing,
            style = {...defaultStyle}
        }: TextConfig = {
            x: 0,
            y: 0,
            text: '',
            path: '',
            startOffset: 0,
            spacing: 0,
            style: {...defaultStyle}
        }) {
        super();
        this.x = x;
        this.y = y;
        this.text = text || "";
        this.path = path || '';
        this.dx = startOffset || dx || 0;
        this.dy = dy || 0
        this.spacing = spacing || 0
        this.style = style;
        this.maxWidth = this.maxWidth || getTotalLength(this.path)
        vm.set(this, {
            closePathPoints: genClosePath(this.path, this.style.font!, this.dy, this.x, this.y),
            wordPoints: path ? svgPathToTangentPoints({
                d: path,
                x: this.x,
                y: this.y,
                text: this.text,
                font: this.style.font || "",
                dx: this.dx,
                dy: this.dy,
                spacing: this.spacing
            }) : []
        })
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
        if (this.path) {
            return getPathBounds(this.getShape()[0],this.ctx!)
        }
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
        if (this.path) {
            // 绘制围绕路径的文字
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            //ctx.stroke(new Path2D(this.path))
            const points = vm.get(this)!.wordPoints || []
            for (let i = 0; i < points.length; i++) {
                const point = points[i];
                ctx.save();
                // 将坐标原点移到路径上的点
                ctx.translate(point.x, point.y);
                // 旋转坐标系
                ctx.rotate(point.angle);
                // 绘制文字
                ctx.fillText(point.word, 0, 0);

                ctx.restore();
            }
            ctx.restore();
            if (this.drawBBox) {
                this.renderBBox()
            }
            if (this.drawShape) {
                this.renderShape()
            }
        } else {
            const h = measureHeight(this.style.font!)
            this.calcTexts.forEach((text, index) => {
                ctx!.fillText(text, this.x, this.y + h * index + this.style.linePadding! * (index * 2 + 1))
            })
            if (this.drawBBox) {
                this.renderBBox()
            }
            if (this.drawShape) {
                this.renderShape()
            }
        }
        ctx?.restore();
        super.render();
    }

    getShape(): Path2D[] {
        const h = measureHeight(this.style.font!)
        const {x, y} = this;
        if (this.path) {
            const closePathPoints = vm.get(this)!.closePathPoints || []
            const path = new Path2D();
            for (let i = 0; i < closePathPoints.length; i++) {
                const point = closePathPoints[i];
                if (i === 0) {
                    path.moveTo(point.x, point.y);
                } else {
                    path.lineTo(point.x, point.y);
                }
            }
            path.closePath();
            return [path]
        }
        return this.calcTexts.flatMap((item, index) => {
            const height = (h + this.style.linePadding! * 2);
            const width = measureWidth(item, this.style.font!)
            const path = new Path2D();
            const cornerRadius = 0;
            const _y = y + height * index;
            // 从左上角开始绘制矩形路径
            path.moveTo(x + cornerRadius, _y);
            path.lineTo(x + width - cornerRadius, _y);
            path.arcTo(x + width, _y, x + width, _y + cornerRadius, cornerRadius);
            path.lineTo(x + width, _y + height - cornerRadius);
            path.arcTo(x + width, _y + height, x + width - cornerRadius, _y + height, cornerRadius);
            path.lineTo(x + cornerRadius, _y + height);
            path.arcTo(x, _y + height, x, _y + height - cornerRadius, cornerRadius);
            path.lineTo(x, _y + cornerRadius);
            path.arcTo(x, _y, x + cornerRadius, _y, cornerRadius);
            path.closePath();
            return path
        })
    };
}

export default Text