import {clamp} from 'lodash'
import {
    matrixToRotation,
    matrixToScale,
    matrixToTranslation,
} from "./dom";
import type {Options, Panning, Point, Rotation, Scaling, Translation, RectangleLike} from "./interface";
import {Events} from "./event";

export default abstract class DraggableViewport<T extends Element, O extends Options = {}> extends Events {

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
        super();
        if (scaling) {
            this.scaling = scaling;
        }
        this.minScale = minScale || null;
        this.maxScale = maxScale || null;
        this.panning = panning;

    }


    protected abstract get root(): T;


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
            x: clickX / this.ratio,
            y: clickY / this.ratio
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


}
