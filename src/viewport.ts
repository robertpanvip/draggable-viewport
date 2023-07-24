import {clamp} from 'lodash'
import {
    matrixToRotation,
    matrixToScale,
    matrixToTranslation,
} from "./dom";
import type {Options, Panning, Point, Rotation, Scaling, Translation} from "./interface";
import {RectangleLike} from "./rectangle";

export default abstract class DraggableViewport<T extends Element, O extends Options = {}> {

    minScale: number | null = null;

    maxScale: number | null = null;

    isDragging = false; // 标记是否正在拖拽

    panning: Panning //是否允许拖拽

    ratio: number = 1;

    clientX: number = 0
    clientY: number = 0 // 记录鼠标按下时的位置

    protected cumulatedFactor = 1;

    protected currentScale: number | null = null;

    readonly scaling: Scaling = {
        min: 0.01,
        max: 16,
    };

    protected constructor({
                              scaling,
                              minScale,
                              maxScale,
                              panning = true,
                          }: O) {
        if (scaling) {
            this.scaling = scaling;
        }
        this.minScale = minScale || null;
        this.maxScale = maxScale || null;
        this.panning = panning
    }

    /**
     * 是否允许拖动
     * @param ele
     * @private
     */
    private enablePanning(ele: Element): boolean {
        return typeof this.panning === 'function' ? this.panning(ele) : !!this.panning
    }

    protected abstract get root(): T;

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

    /**
     * 获取元素的位置和尺寸信息
     */
    getSize() {
        return this.root.getBoundingClientRect()
    }

    /**表示获取某种变换的矩阵**/
    abstract getMatrix(): DOMMatrix;

    /**表示设置某种变换的矩阵**/
    abstract setMatrix(matrix: DOMMatrix): this;

    /**获取元素的边界框信息，以便在进行一些操作时，如元素的相对定位、碰撞检测、布局等**/
    abstract getBBox(): RectangleLike

    /**旋转方法**/
    rotate(): Rotation
    rotate(angle: number, cx?: number, cy?: number): this
    rotate(angle?: number, cx?: number, cy?: number) {
        if (typeof angle === 'undefined') {
            return matrixToRotation(this.getMatrix())
        }
        if (cx == null || cy == null) {
            const bbox = this.getBBox()
            cx = bbox.width / 2 // eslint-disable-line
            cy = bbox.height / 2 // eslint-disable-line
        }

        const ctm = this.getMatrix()
            .translate(cx, cy)
            .rotate(angle)
            .translate(-cx, -cy)
        this.setMatrix(ctm)
        return this
    }

    /**平移递增方法**/
    translateBy(dx: number, dy: number) {
        const ts = this.translate()
        const tx = ts.tx + dx
        const ty = ts.ty + dy
        return this.translate(tx, ty)
    }

    /**平移方法**/
    translate(): Translation

    translate(tx: number, ty: number): this

    translate(tx?: number, ty?: number) {
        if (typeof tx === 'undefined') {
            return this.getTranslation()
        }
        const matrix = this.getMatrix();
        matrix.e = tx || 0;
        matrix.f = ty || 0;
        this.setMatrix(matrix);

        return this;
    };

    clampScale(scale: number) {
        const range = this.scaling;
        return clamp(scale, range.min || 0.01, range.max || 16);
    };

    getScale() {
        return matrixToScale(this.getMatrix());
    };

    /**设置缩放方法**/
    scale(sx: number, sy = sx, ox = 0, oy = 0) {
        sx = this.clampScale(sx);
        sy = this.clampScale(sy);

        if (ox || oy) {
            const ts = this.getTranslation();
            const tx = ts.tx - ox * (sx - 1);
            const ty = ts.ty - oy * (sy - 1);
            if (tx !== ts.tx || ty !== ts.ty) {
                this.translate(tx, ty);
            }
        }
        const matrix = this.getMatrix();
        matrix.a = sx;
        matrix.d = sy;
        this.setMatrix(matrix);
        return this;
    }

    /**获取位置方法**/
    getTranslation() {
        return matrixToTranslation(this.getMatrix())
    };

    /**进行放大操作**/
    zoomIn() {
        const targetScale = this.calcScale(1)
        this.scale(targetScale, targetScale);
        return this;
    };

    /**进行缩小操作**/
    zoomOut() {
        const targetScale = this.calcScale(-1)
        this.scale(targetScale, targetScale);
        return this;
    };

    /**进行放大缩小操作**/
    zoom(factor: number, {x, y}: Point) {
        let sx = factor;
        let sy = factor;

        if (this.maxScale) {
            sx = Math.min(this.maxScale, sx)
            sy = Math.min(this.maxScale, sy)
        }

        if (this.minScale) {
            sx = Math.max(this.minScale, sx)
            sy = Math.max(this.minScale, sy)
        }
        let cx = x * this.ratio;
        let cy = y * this.ratio;

        const scale = this.getScale();
        sx = this.clampScale(sx);
        sy = this.clampScale(sy);
        if (cx || cy) {
            const ts = this.getTranslation();
            const tx = cx - (cx - ts.tx) * (sx / scale.sx);
            const ty = cy - (cy - ts.ty) * (sy / scale.sy);
            if (tx !== ts.tx || ty !== ts.ty) {
                this.translate(tx, ty);
            }
        }
        return this.scale(sx, sy);
    }

    /**
     *鼠标点击点 转换为相对于最近视口元素左上角的图形坐标
     */
    clientToGraph(rect: Point) {
        const {left, top} = this.getSize();
        const clickX = rect.x - left;
        const clickY = rect.y - top;
        return {
            x: clickX,
            y: clickY
        }
    }

    calcScale(delta: number, factor: number = 1.2) {
        if (this.currentScale == null) {
            this.currentScale = this.getScale().sx;
        }
        if (delta < 0) {
            if (this.currentScale < 0.15) {
                this.cumulatedFactor = (this.currentScale + 0.01) / this.currentScale;
            } else {
                this.cumulatedFactor =
                    Math.round(this.currentScale * factor * 20) /
                    20 /
                    this.currentScale;
            }
        } else if (this.currentScale <= 0.15) {
            this.cumulatedFactor = (this.currentScale - 0.01) / this.currentScale;
        } else {
            this.cumulatedFactor =
                Math.round(this.currentScale * (1 / factor) * 20) /
                20 /
                this.currentScale;
        }

        this.cumulatedFactor = Math.max(
            0.01,
            Math.min(this.currentScale * this.cumulatedFactor, 160) /
            this.currentScale
        );

        const currentScale = this.currentScale!;
        let targetScale = this.clampScale(currentScale * this.cumulatedFactor);

        const minScale = this.minScale || Number.MIN_SAFE_INTEGER;
        const maxScale = this.maxScale || Number.MAX_SAFE_INTEGER;

        targetScale = clamp(targetScale, minScale, maxScale);
        return targetScale
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

        const target = event.target as T;
        const enable = this.enablePanning(target)
        if (enable) {
            this.isDragging = true;
            this.clientX = event.clientX;
            this.clientY = event.clientY;
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
            this.clientY = event.clientY
            this.translateBy(dx * this.ratio, dy * this.ratio);
        }
    };

    onMouseUp = () => {
        this.isDragging = false;
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
}
