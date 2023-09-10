import type {Point, SvgAttr, TangentPoint, ViewStyle} from "../interface";
import tinyColor from "tinycolor2";
import type {IFont, ISystemFont} from "parse-css-font";

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d', {willReadFrequently: true})!
const svgPath: SVGPathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');

const svgTextPath: SVGTextPathElement = document.createElementNS("http://www.w3.org/2000/svg", "textPath")

class CanvasPath {
    private path: Path2D;
    private d: string;

    constructor() {
        this.path = new Path2D();
        this.d = '';
    }

    get path2D(): Path2D {
        return this.path;
    }

    get svgPath(): string {
        return this.d.trim();
    }

    arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void {
        this.path.arc(x, y, radius, startAngle, endAngle, counterclockwise);
        const largeArcFlag = Math.abs(endAngle - startAngle) <= Math.PI ? 0 : 1;
        const sweepFlag = counterclockwise ? 0 : 1;
        const endX = x + radius * Math.cos(endAngle);
        const endY = y + radius * Math.sin(endAngle);
        this.d += `A ${radius},${radius} 0 ${largeArcFlag},${sweepFlag} ${endX},${endY} `;
    }

    arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void {
        this.path.arcTo(x1, y1, x2, y2, radius);
        this.d += `M ${x1},${y1} `;
        this.d += `A ${radius},${radius} 0 0,0 ${x2},${y2} `;
    }

    ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void {
        this.path.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, counterclockwise);
        const largeArcFlag = Math.abs(endAngle - startAngle) <= Math.PI ? 0 : 1;
        const sweepFlag = counterclockwise ? 0 : 1;
        const endX = x + radiusX * Math.cos(endAngle);
        const endY = y + radiusY * Math.sin(endAngle);
        this.d += `A ${radiusX},${radiusY} ${rotation} ${largeArcFlag},${sweepFlag} ${endX},${endY} `;
    }

    rect(x: number, y: number, w: number, h: number): void {
        this.path.rect(x, y, w, h);
        this.d += `M ${x},${y} `;
        this.d += `L ${x + w},${y} `;
        this.d += `L ${x + w},${y + h} `;
        this.d += `L ${x},${y + h} `;
        this.d += `Z `;
    }

    roundRect(x: number, y: number, w: number, h: number, radii?: number | DOMPointInit | (number | DOMPointInit)[]): void {
        this.path.roundRect(x, y, w, h, radii);
        const radiiArray = (Array.isArray(radii) ? radii : [radii, radii, radii, radii]) as number[];
        const [topLeftRadius = 0, topRightRadius = 0, bottomRightRadius = 0, bottomLeftRadius = 0] = radiiArray;
        const topLeftX = x + topLeftRadius;
        const topLeftY = y + topLeftRadius;
        const topRightX = x + w - topRightRadius;
        const topRightY = y + topRightRadius;
        const bottomRightX = x + w - bottomRightRadius;
        const bottomRightY = y + h - bottomRightRadius;
        const bottomLeftX = x + bottomLeftRadius;
        const bottomLeftY = y + h - bottomLeftRadius;

        this.d += `M ${topLeftX},${y} `;
        this.d += `H ${topRightX} `;
        this.d += `Q ${x + w},${y},${topRightX},${topRightY} `;
        this.d += `V ${bottomRightY} `;
        this.d += `Q ${x + w},${y + h},${bottomRightX},${bottomRightY} `;
        this.d += `H ${bottomLeftX} `;
        this.d += `Q ${x},${y + h},${bottomLeftX},${bottomLeftY} `;
        this.d += `V ${topLeftY} `;
        this.d += `Q ${x},${y},${topLeftX},${topLeftY} `;
        this.d += `Z `;
    }
}

export function measureWidth(text: string, font: string) {
    ctx.font = font;
    const metrics = ctx.measureText(text);
    return metrics.width
}

export function measureHeight(font: string) {
    ctx.font = font;
    const metrics = ctx.measureText('我');
    return metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent
}

export function calculateVerticalPoint(x1: number, y1: number, x2: number, y2: number, dy: number) {
    // 计算线段的中点坐标
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    // 计算线段的长度
    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

    // 计算单位向量
    const unitX = (x2 - x1) / length;
    const unitY = (y2 - y1) / length;

    // 计算垂直线上的点的坐标
    const x3 = midX - unitY * dy;
    const y3 = midY + unitX * dy;

    return {x: x3, y: y3};
}

export function genClosePath(d: string, font: string, dy: number = 0, x: number = 0, y: number = 0) {
    svgPath.setAttribute('d', d);
    const total = svgPath.getTotalLength();
    const h = measureHeight(font!);
    const vPoints: Point[] = []
    const points: Point[] = [];
    for (let len = 0; len < total; len = len + 2) {
        const point = svgPath.getPointAtLength(len);
        const nextPoint = svgPath.getPointAtLength(len + 2);

        const vPoint = calculateVerticalPoint(point.x, point.y, nextPoint.x, nextPoint.y, dy + h)
        points.push({
            x: point.x + x,
            y: point.y + y
        })
        vPoints.push({
            x: vPoint.x + x,
            y: vPoint.y + y
        })
    }
    return points.concat(vPoints.reverse())
}


export function getTotalLength(d: string): number {
    if (!d) {
        return 0
    }
    svgPath.setAttribute('d', d);
    return svgPath.getTotalLength();
}

export function getPointAtLength(d: string, len: number): Point {
    svgPath.setAttribute('d', d);
    return svgPath.getPointAtLength(len);
}

export function renderText(text: string, font: string, maxWidth: number) {
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

export function svgPathToTangentPoints(
    {d, x = 0, y = 0, text, font, dx = 0, dy = 0, spacing = 0}: {
        d: string,
        x: number,
        y: number,
        text: string,
        font: string,
        dx: number,
        dy: number,
        spacing: number
    }
): TangentPoint[] {
    svgPath.setAttribute('d', d)
    const total = svgPath.getTotalLength();
    const [line] = renderText(text, font, total)
    const points: TangentPoint[] = [];
    let length = 0;
    line.split('').forEach((word, idx) => {
        const w = measureWidth(word, font!);
        length += idx === 0 ? w / 2 + dx : w + spacing;
        const point = svgPath.getPointAtLength(length);
        const nextPoint = svgPath.getPointAtLength(length + 1);

        const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x);
        const _point = calculateVerticalPoint(point.x, point.y, nextPoint.x, nextPoint.y, dy)
        points.push({
            x: _point.x + x,
            y: _point.y + y,
            next: nextPoint,
            w,
            word,
            angle
        })
    })
    return points
}

export function getBoundsFromPoints(points: Point[]) {
    let minX = points[0].x;
    let maxX = points[0].x;
    let minY = points[0].y;
    let maxY = points[0].y;
    for (let i = 0; i < points.length; i = i + 1) {
        const point = points[i];
        minX = Math.min(minX, point.x)
        maxX = Math.max(maxX, point.x)
        minY = Math.min(minY, point.y)
        maxY = Math.max(maxY, point.y)
    }
    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
    }
}


export function getPathBounds(path: Path2D, ctx1: CanvasRenderingContext2D) {
    canvas.width = ctx1.canvas.width!;
    canvas.height = ctx1.canvas.height!;
    ctx1.save();
    // 将Path2D对象绘制到临时的Canvas上
    ctx.stroke(path);
    // 获取绘制的图像数据
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

// 初始化边界框的最小和最大值
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

// 分析图像数据，找到路径的最小矩形边界框
    for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];

        if (alpha > 0) {
            const x = (i / 4) % canvas.width;
            const y = Math.floor(i / 4 / canvas.width);

            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
        }
    }

// 计算边界框的宽度和高度
    const width = maxX - minX;
    const height = maxY - minY;

// 创建边界框对象
    const bounds = {
        x: minX,
        y: minY,
        width,
        height
    };
    ctx.restore();
    return bounds
}

const NameMap = {
    fill: 'fillStyle',
    fillOpacity: "fillOpacity",

    filter: 'filter',
    fillRule: 'fillRule',
    stroke: 'strokeStyle',
    strokeOpacity: 'strokeOpacity',
    //strokeDasharray: 'strokeDasharray',
    strokeDashoffset: 'lineDashOffset',
    strokeLinecap: 'lineCap',
    strokeLinejoin: 'lineJoin',
    strokeMiterlimit: 'miterLimit',
    strokeWidth: 'lineWidth',
    opacity: "globalAlpha"
}

export function svgAttrToCanvas(attrs: Partial<SvgAttr>): Partial<ViewStyle> {
    const computedStyles = getSvgComputedStyle(attrs);

    function remakeColor(name: "fill" | "stroke", opacityName: "fillOpacity" | "strokeOpacity") {
        if (computedStyles[name]) {
            const color = tinyColor(computedStyles[name])
            if (color.isValid()) {
                if (computedStyles[opacityName] !== undefined) {
                    color.setAlpha(parseFloat(computedStyles[opacityName] + ''));
                }
                computedStyles[name] = color.toRgbString()
            } else {
                computedStyles[name] = ""
            }
        }
    }

    remakeColor("fill", "fillOpacity");
    remakeColor("stroke", "strokeOpacity");
    return Object.fromEntries(Object.entries(computedStyles).map(([key, value]) => {
        // @ts-ignore
        return [NameMap[key], value]
    }))
}

export function getSvgComputedStyle(attrs: Partial<SvgAttr>): Partial<Omit<SvgAttr, "style">> {
    const {style, ...rest} = attrs;
    return {
        ...style,
        ...rest
    }
}

const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
const svgTransform = svgElement.createSVGTransform();

export function parseTransformToMatrix(transform: string): SVGMatrix {
    svgTransform.setMatrix(svgElement.createSVGMatrix());
    svgTransform.setMatrix(svgTransform.matrix.translate(0, 0));
    svgElement.transform.baseVal.initialize(svgTransform);
    const transformList = svgElement.transform.baseVal;
    transformList.initialize(svgElement.transform.baseVal.createSVGTransformFromMatrix(svgElement.getScreenCTM()!));

    svgElement.setAttribute("transform", transform);
    return transformList!.consolidate()!.matrix;
}


export function stringifyFont(iFont: ISystemFont | IFont) {
    if ((iFont as ISystemFont).system) {
        return (iFont as ISystemFont).system
    }
    const font = iFont as IFont
    let fontString = '';

    if (font.style) {
        fontString += font.style + ' ';
    }

    if (font.variant) {
        fontString += font.variant + ' ';
    }

    if (font.weight) {
        fontString += font.weight + ' ';
    }

    if (font.stretch) {
        fontString += font.stretch + ' ';
    }

    if (font.size) {
        fontString += font.size + ' ';
    }

    if (font.lineHeight) {
        fontString += '/' + font.lineHeight + ' ';
    }

    if (font.family) {
        fontString += "'" + font.family.join("', '") + "'";
    }
    return fontString
}