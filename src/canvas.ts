import {CanvasManagerOptions} from "./interface";
import Viewport from "./viewport";
import {getComputedStyle} from './dom'

export default class CanvasManager extends Viewport<HTMLCanvasElement> {

    readonly canvas: HTMLCanvasElement | null = null;
    readonly ctx: CanvasRenderingContext2D | null = null
    readonly render: (ctx: CanvasRenderingContext2D) => void
    readonly ratio: number = 1;

    constructor({
                    viewport,
                    scaling,
                    minScale,
                    maxScale,
                    panning = true,
                    render
                }: CanvasManagerOptions) {
        super({
            scaling,
            minScale,
            maxScale,
            panning,
        })
        this.canvas = viewport;
        this.ctx = viewport.getContext('2d');
        const ratio = window.devicePixelRatio || 1;
        this.ratio = ratio;
        const {width, height} = getComputedStyle(viewport)
        const w = parseFloat(width)
        const h = parseFloat(height)
        viewport.width = w * ratio; // 实际渲染像素
        viewport.height = h * ratio; // 实际渲染像素
        this.render = render;
        this.scale(ratio);
        this.render(this.ctx!)
    }

    protected get root() {
        return this.canvas!;
    }

    getMatrix() {
        return this.ctx!.getTransform() || new DOMMatrix()
    };

    setMatrix(matrix: DOMMatrix) {
        this.canvas!.width = this.canvas!.width
        this.ctx?.setTransform(matrix)
        this.render(this.ctx!)
        return this;
    };

    getBBox() {
        return this.getSize()
    }
}
