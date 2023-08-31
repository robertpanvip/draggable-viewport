import {CanvasManagerOptions, Point} from "./interface";
import Viewport from "./viewport";
import {getComputedStyle} from './dom'
import Group from "./shape/group";
import View from "./shape/view";

type PrivateScope = {
    matrix: DOMMatrix
}

const vm = new WeakMap<CanvasManager, PrivateScope>()

export default class CanvasManager extends Viewport<HTMLCanvasElement> {

    readonly canvas: HTMLCanvasElement | null = null;
    readonly ctx: CanvasRenderingContext2D | null = null

    readonly ratio: number = 1;
    readonly group: Group | null = null;
    private active: Group | null = null;

    constructor({
                    viewport,
                    scaling,
                    minScale,
                    maxScale,
                    panning = true,
                }: CanvasManagerOptions) {
        super({
            scaling,
            minScale,
            maxScale,
            panning,
        })
        vm.set(this, {matrix: new DOMMatrix()})
        this.canvas = viewport;
        this.ctx = viewport.getContext('2d');
        const ratio = window.devicePixelRatio || 1;
        this.ratio = ratio;
        const {width, height} = getComputedStyle(viewport)
        const w = parseFloat(width)
        const h = parseFloat(height)
        viewport.width = w * ratio; // 实际渲染像素
        viewport.height = h * ratio; // 实际渲染像素
        this.scale(ratio);
        this.group = new Group();
    }

    protected get root() {
        return this.canvas!;
    }

    getMatrix() {
        return vm.get(this)!.matrix
    };

    setMatrix(matrix: DOMMatrix) {
        vm.get(this)!.matrix = matrix;
        this.render()
        return this;
    };

    getBBox() {
        return this.getSize()
    }

    render() {
        if (this.canvas) {
            this.canvas!.width = this.canvas!.width
        }
        this.group?.getChildren().forEach(child => {
            this.ctx?.setTransform(this.getMatrix())
            child.render()
        })
    }

    addView(view: View) {
        view.vp = this;
        this.group?.addChild(view)
        this.render()
    }


    /**
     * 是否允许拖动
     * @param ele
     * @private
     */
    private enablePanning(ele: Element): boolean {
        return typeof this.panning === 'function' ? this.panning(ele) : !!this.panning
    }


    onMouseWheel = (event: Event) => {
        const evt = event as WheelEvent
        // 判断是否按下了Ctrl键
        const isCtrlPressed = evt.ctrlKey;

        if (isCtrlPressed) {
            evt.preventDefault();

            const delta = evt.deltaY;

            const targetScale = this.calcScale(delta)

            const center = this.clientToGraph({x: evt.clientX, y: evt.clientY})

            this.zoom(targetScale, center);

            this.currentScale = null;
            this.cumulatedFactor = 1;
        }
    };

    onMouseDown = (evt: Event) => {
        const event = evt as MouseEvent

        const target = event.target as HTMLCanvasElement;
        const enable = this.enablePanning(target)
        if (enable) {
            this.isDragging = true;
            this.clientX = event.clientX;
            this.clientY = event.clientY;
            const mouse = this.clientToGraph({x: event.clientX, y: event.clientY})
            this.active = this.group?.getChildGroupByPoint(mouse) || null;

            if (this.active) {
                this.group?.moveElementToEnd(this.active)
            }
            // 监听鼠标移动事件
            document.addEventListener("mousemove", this.onMouseMove);
            document.addEventListener("drag", this.onMouseMove);
            //document.addEventListener("touchmove", this.onMouseMove);

            // 监听鼠标松开事件
            document.addEventListener("mouseup", this.onMouseUp);
            document.addEventListener("dragend", this.onMouseUp);
            document.addEventListener("touchend", this.onMouseUp);
            document.addEventListener("mouseleave", this.onMouseUp);
        }
    };

    onMouseMove = (event: MouseEvent) => {
        if (this.isDragging) {
            const dx = event.clientX - this.clientX
            const dy = event.clientY - this.clientY
            this.clientX = event.clientX
            this.clientY = event.clientY;

            if (!this.active) {
                this.translateBy(dx * this.ratio, dy * this.ratio);
            } else if (this.active instanceof View) {
                const scale = this.getScale()
                this.active.translateBy(dx * this.ratio / scale.sx, dy * this.ratio / scale.sx)
            }
        }
    };

    onMouseUp = () => {
        this.isDragging = false;
        this.active = null;
        // 监听鼠标移动事件
        document.removeEventListener("mousemove", this.onMouseMove);
        document.removeEventListener("drag", this.onMouseMove);
        //document.removeEventListener("touchmove", this.onMouseMove);

        // 监听鼠标松开事件
        document.removeEventListener("mouseup", this.onMouseUp);
        // 监听鼠标松开事件
        document.removeEventListener("dragend", this.onMouseUp);
        document.removeEventListener("touchend", this.onMouseUp);
        document.removeEventListener("mouseleave", this.onMouseUp);
    };

    /**
     * 开始监听
     */
    startListening() {
        // 监听鼠标按下事件
        this.root.addEventListener("mousedown", this.onMouseDown);
        this.root.addEventListener("wheel", this.onMouseWheel);
    };

    /**
     * 停止监听
     */
    stopListening() {
        // 监听鼠标按下事件
        this.root.removeEventListener("mousedown", this.onMouseDown);
        this.root.removeEventListener("wheel", this.onMouseWheel);
    };
}
