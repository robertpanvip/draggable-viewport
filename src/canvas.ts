import {CanvasManagerOptions, Point, PointLike} from "./interface";
import Viewport from "./viewport";
import {getComputedStyle} from './dom'
import Group from "./shape/group";
import View from "./shape/view";

type PrivateScope = {
    matrix: DOMMatrix;
    setCursorTask: number
}

interface CanvasEvent extends Point {
    srcElement: Group | null;
    eventName: string;

    stopPropagation(): void
}

const vm = new WeakMap<CanvasManager, PrivateScope>()

const eventVm = new WeakMap<CanvasEvent, { stopped: boolean }>()

export default class CanvasManager extends Viewport<HTMLCanvasElement> {

    readonly canvas: HTMLCanvasElement | null = null;
    readonly ctx: CanvasRenderingContext2D | null = null

    readonly ratio: number = 1;
    readonly group: Group;
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
        vm.set(this, {matrix: new DOMMatrix(), setCursorTask: 0})
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

    broadcast<T>(name: string, args: T) {
        const loop = (group: Group) => {
            group.trigger(name, args)
            group.getChildren().forEach(item => {
                loop(item)
            })
        }
        loop(this.group)
    }

    addView(view: View) {
        this.group?.addChild(view)
        console.log('broadcast');
        this.broadcast('view:added', this)
        this.render();
        return this;
    }

    removeView(view: View) {
        this.group?.removeChild(view);
        this.render();
        return this;
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

    private dispatchEvent(name: string, mouse: PointLike) {
        const srcEle = this.group.getSrcElement(mouse);
        // console.log(srcEle, name);
        const srcEleOwner = [];
        let parent: Group | null = srcEle;
        while (parent) {
            srcEleOwner.push(parent);
            parent = parent.parent
        }

        const canvasEvent: CanvasEvent = {
            ...mouse,
            eventName: name,
            srcElement: srcEle,
            stopPropagation: () => {
                eventVm.get(canvasEvent)!.stopped = true;
            }
        }

        eventVm.set(canvasEvent, {stopped: false})

        for (let i = 0; i < srcEleOwner.length - 1; i++) {
            const owner = srcEleOwner[i];
            if (eventVm.get(canvasEvent)!.stopped) {
                break;
            }
            owner.trigger(name, canvasEvent)
        }
    }

    onMouseDown = (evt: Event) => {
        const event = evt as MouseEvent

        const target = event.target as HTMLCanvasElement;
        const enable = this.enablePanning(target)
        if (enable) {
            this.isDragging = true;
            this.clientX = event.clientX;
            this.clientY = event.clientY;
            const mouse = this.clientToGraph({x: event.clientX, y: event.clientY})
            // this.active = this.group?.getChildGroupByPoint(mouse) || null;
            const srcEle = this.group.getSrcElement(mouse);
            this.active = srcEle;
            //this.dispatchSrcElementEvent('dragStart', mouse)
            this.broadcast('dragStartCapture', {srcElement: srcEle, ...mouse})

            if (srcEle) {
                const loop = (srcEle: Group | null) => {
                    srcEle?.parent?.moveElementToEnd(srcEle)
                    if (srcEle?.parent) {
                        loop(srcEle?.parent)
                    }
                }
                loop(srcEle)
            }


            // 监听鼠标松开事件
            document.addEventListener("mouseup", this.onMouseUp);
            document.addEventListener("dragend", this.onMouseUp);
        }
    };

    private setCursor(event: MouseEvent) {
        cancelAnimationFrame(vm.get(this)!.setCursorTask)
        vm.get(this)!.setCursorTask = requestAnimationFrame(() => {
            const mouse = this.clientToGraph({x: event.clientX, y: event.clientY});
            const srcEle = this.group.getSrcElement(mouse);
            if (srcEle && srcEle.isView()) {
                const cursor = srcEle.style.cursor || ""
                if (this.root.style.cursor != cursor) {
                    this.root.style.cursor = cursor
                }
            } else {
                if (this.root.style.cursor !== '') {
                    this.root.style.cursor = ""
                }
            }

        })
    }

    onMouseMove = (event: MouseEvent) => {
        this.setCursor(event)
        if (this.isDragging) {
            const dx = event.clientX - this.clientX
            const dy = event.clientY - this.clientY
            this.clientX = event.clientX
            this.clientY = event.clientY;

            if (!this.active) {
                this.translateBy(dx * this.ratio, dy * this.ratio);
            }
            //console.time('drag')

            const mouse = this.clientToGraph({x: event.clientX, y: event.clientY});
            //const srcEle = this.group.getSrcElement(mouse);
            this.broadcast('dragCapture', {...mouse, dx, dy})
            //this.dispatchSrcElementEvent('drag', {...mouse, dx, dy})
            //console.timeEnd("drag")
        }
    };

    onMouseUp = (event: MouseEvent) => {
        this.isDragging = false;
        this.active = null;
        const dx = event.clientX - this.clientX
        const dy = event.clientY - this.clientY
        const mouse = this.clientToGraph({x: event.clientX, y: event.clientY});
        const srcEle = this.group.getSrcElement(mouse);
        this.broadcast('dragEndCapture', {srcElement: srcEle, ...mouse, dx, dy})
        //this.dispatchSrcElementEvent('dragEnd', mouse)

        // 监听鼠标移动事件
        //document.removeEventListener("mousemove", this.onMouseMove);
        //document.removeEventListener("drag", this.onMouseMove);

        // 监听鼠标松开事件
        document.removeEventListener("mouseup", this.onMouseUp);
        // 监听鼠标松开事件
        document.removeEventListener("dragend", this.onMouseUp);
    };

    /**
     * 开始监听
     */
    startListening() {
        // 监听鼠标按下事件
        this.root.addEventListener("mousedown", this.onMouseDown);
        this.root.addEventListener("wheel", this.onMouseWheel);
        // 监听鼠标移动事件
        this.root.addEventListener("mousemove", this.onMouseMove);
        this.root.addEventListener("drag", this.onMouseMove);
    };

    /**
     * 停止监听
     */
    stopListening() {
        // 监听鼠标按下事件
        this.root.removeEventListener("mousedown", this.onMouseDown);
        this.root.removeEventListener("wheel", this.onMouseWheel);
        // 监听鼠标移动事件
        this.root.removeEventListener("mousemove", this.onMouseMove);
        this.root.removeEventListener("drag", this.onMouseMove);
    };
}
