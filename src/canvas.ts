import {CanvasManagerOptions, Point, PointLike} from "./interface";
import Viewport from "./viewport";
import {getComputedStyle} from './dom'
import Group from "./shape/group";
import View from "./shape/view";
import {Click, ContextMenu, DblClick, MouseEnter, MouseLeave, MouseMove} from "./const";

type PrivateScope = {
    matrix: DOMMatrix;
    setCursorTask: number;
    preSrcElement: Group | null
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
    public grid: boolean = false
    public axis: boolean = false

    private task: number | undefined;

    constructor({
                    viewport,
                    scaling,
                    minScale,
                    maxScale,
                    panning = true,
                    grid = false,
                    axis = false
                }: CanvasManagerOptions) {
        super({
            scaling,
            minScale,
            maxScale,
            panning,
        })
        vm.set(this, {matrix: new DOMMatrix(), setCursorTask: 0, preSrcElement: null})
        this.canvas = viewport;
        this.ctx = viewport.getContext('2d');
        this.grid = grid;
        this.axis = axis;
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

    drawGrid() {
        const ctx = this.ctx!;
        ctx.save();
        // 1. 设置网格大小
        const girdSize = 10;

        // 2. 获取Canvas的width、height
        const CanvasWidth = ctx.canvas.width;
        const CanvasHeight = ctx.canvas.height;

        // 3. 采用遍历的方式，绘画x轴的线条
        const xLineTotals = Math.floor(CanvasHeight / girdSize); // 计算需要绘画的x轴条数
        for (let i = 0; i < xLineTotals; i++) {
            ctx.beginPath(); // 开启路径，设置不同的样式
            ctx.moveTo(0, girdSize * i - 0.5); // -0.5是为了解决像素模糊问题
            ctx.lineTo(CanvasWidth, girdSize * i - 0.5);
            ctx.strokeStyle = "#ccc"; // 设置每个线条的颜色
            ctx.stroke();
        }

        // 4.采用遍历的方式，绘画y轴的线条
        const yLineTotals = Math.floor(CanvasWidth / girdSize); // 计算需要绘画y轴的条数
        for (let j = 0; j < yLineTotals; j++) {
            ctx.beginPath(); // 开启路径，设置不同的样式
            ctx.moveTo(girdSize * j, 0);
            ctx.lineTo(girdSize * j, CanvasHeight);
            ctx.strokeStyle = "#ccc"; // 设置每个线条的颜色
            ctx.stroke();
        }
        ctx.restore()
    }

    drawAxis() {
        const ctx = this.ctx!;
        ctx.save();
        ctx!.setTransform(this.getMatrix());
        // 2. 获取Canvas的width、height
        const CanvasWidth = ctx.canvas.width;
        const CanvasHeight = ctx.canvas.height;
        ctx.beginPath();
        ctx.moveTo(0, -CanvasHeight);
        ctx.lineTo(0, CanvasHeight);
        ctx.strokeStyle = "red"; // 设置每个线条的颜色
        ctx.stroke();
        ctx.moveTo(-CanvasWidth, 0);
        ctx.lineTo(CanvasWidth, 0);
        ctx.strokeStyle = "red"; // 设置每个线条的颜色
        ctx.stroke();
        ctx.restore()
    }

    renderGroup() {
        if (this.canvas) {
            this.canvas!.width = this.canvas!.width
        }
        if (this.grid) {
            this.drawGrid();
        }
        if (this.axis) {
            this.drawAxis()
        }
        this.group?.getChildren().forEach(child => {
            this.ctx?.setTransform(this.getMatrix())
            child.render()
        })
    }

    render() {
        if (this.task) {
            cancelAnimationFrame(this.task)
        }
        this.task = requestAnimationFrame(() => this.renderGroup())
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
        this.broadcast('view:added', this)
        this.render();
        return this;
    }

    updateView(view: View) {
        this.group?.addChild(view)
        this.broadcast('view:added', this)
        this.render();
        return this;
    }

    removeView(view: View) {
        this.group?.removeChild(view);
        this.render();
        return this;
    }

    containsView(view: View) {
        return this.group?.contains(view);
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
        const srcEle = mouse.srcElement;
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
            const srcEle = this.group.getSrcElement(mouse);
            this.active = srcEle;
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
            //console.time('getSrcElement')
            const srcEle = this.group.getSrcElement(mouse);
            //console.timeEnd('getSrcElement')
            const preSrcElement = vm.get(this)!.preSrcElement;

            if (srcEle !== preSrcElement) {
                if (srcEle && srcEle.isView()) {
                    srcEle?.dispatchEvent(MouseEnter, {...mouse, srcElement: srcEle})
                }
            }
            this.dispatchEvent(MouseMove, {...mouse, srcElement: srcEle})

            if (srcEle !== preSrcElement) {
                if (preSrcElement && preSrcElement.isView()) {
                    preSrcElement?.dispatchEvent(MouseLeave, {...mouse, srcElement: preSrcElement})
                }
            }
            vm.get(this)!.preSrcElement = srcEle;

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

    private onClick = (event: MouseEvent) => {
        const mouse = this.clientToGraph({x: event.clientX, y: event.clientY});
        const srcEle = this.group.getSrcElement(mouse);
        if (srcEle && srcEle.isView()) {
            srcEle?.dispatchEvent(Click, {...mouse, srcElement: srcEle})
        }
    }

    private onDblClick = (event: MouseEvent) => {
        const mouse = this.clientToGraph({x: event.clientX, y: event.clientY});
        const srcEle = this.group.getSrcElement(mouse);
        if (srcEle && srcEle.isView()) {
            srcEle?.dispatchEvent(DblClick, {...mouse, srcElement: srcEle})
        }
    }

    private onContextMenu = (event: MouseEvent) => {
        const mouse = this.clientToGraph({x: event.clientX, y: event.clientY});
        const srcEle = this.group.getSrcElement(mouse);
        if (srcEle && srcEle.isView()) {
            srcEle?.dispatchEvent(ContextMenu, {...mouse, srcElement: srcEle})
        }
    }

    /**
     * 开始监听
     */
    startListening() {
        // 监听鼠标按下事件
        this.root.addEventListener("mousedown", this.onMouseDown);
        this.root.addEventListener("wheel", this.onMouseWheel);
        // 监听鼠标移动事件
        document.addEventListener("mousemove", this.onMouseMove);
        document.addEventListener("drag", this.onMouseMove);
        this.root.addEventListener("click", this.onClick);
        this.root.addEventListener("dblclick", this.onDblClick);
        this.root.addEventListener("contextmenu", this.onContextMenu);
    };

    /**
     * 停止监听
     */
    stopListening() {
        // 监听鼠标按下事件
        this.root.removeEventListener("mousedown", this.onMouseDown);
        this.root.removeEventListener("wheel", this.onMouseWheel);
        // 监听鼠标移动事件
        document.removeEventListener("mousemove", this.onMouseMove);
        document.removeEventListener("drag", this.onMouseMove);
        this.root.removeEventListener("click", this.onClick);
        this.root.removeEventListener("dblclick", this.onDblClick);
        this.root.removeEventListener("contextmenu", this.onContextMenu);
    };
}
