import Group from "./group";
import {matrixToRotation, matrixToTranslation} from "../dom";
import type {Rotation, Translation, RectangleLike} from "../interface";
import {Point} from "../interface";
import CanvasManager from "../canvas";

type PrivateScope = {
    vp?: CanvasManager
    matrix: DOMMatrix
}

const vm = new WeakMap<View, PrivateScope>()

abstract class View extends Group {

    abstract style: {
        cursor?: string
    }

    constructor() {
        super();
        vm.set(this, {matrix: new DOMMatrix()});
        this.on('view:added', (vp: CanvasManager) => {
            this.vp = vp;
        })
        let active: View | null;
        this.on('dragStart', (e: { x: number, y: number, srcElement: View | null; }) => {
            active = e.srcElement;
        })
        this.on('drag', ({dx, dy}: { dx: number, dy: number, srcElement: View | null; }) => {
            if (active === this) {
                const scale = this.vp.getScale();
                const ratio = this.vp.ratio;
                this?.translateBy(dx * ratio / scale.sx, dy * ratio / scale.sy)
            }
        })
    }

    public isView():this is View {
        return true
    }

    public get vp() {
        return vm.get(this)!.vp!
    }

    public set vp(vp: CanvasManager) {
        vm.get(this)!.vp = vp
    }

    public get ctx() {
        return vm.get(this)!.vp?.ctx || null
    }

    get matrix() {
        return this.getMatrix()
    }

    set matrix(matrix: DOMMatrix) {
        this.setMatrix(matrix)
    }

    /**表示获取某种变换的矩阵**/
    getMatrix() {
        const scope = vm.get(this)!
        return scope.matrix
    };

    /**表示设置某种变换的矩阵**/
    setMatrix(matrix: DOMMatrix) {
        const scope = vm.get(this)!
        scope.matrix = matrix;
        this.vp?.render()
    };

    getGroupMatrix() {


        return this.vp.getMatrix().multiply(this.matrix)


        /*return ancestors.reduce((pre, item) => {
            if (item instanceof View) {
                return pre.multiply(item.matrix)
            }
            return pre.multiply(new DOMMatrix())
        }, this.vp.getMatrix()).multiply(this.matrix)*/
    }

    /**获取位置方法**/
    getTranslation() {
        return matrixToTranslation(this.getMatrix())
    };

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

    /**平移方法**/
    translate(): Translation

    translate(tx: number, ty: number): this

    translate(tx?: number, ty?: number) {
        if (typeof tx === 'undefined' || typeof ty === 'undefined') {
            return this.getTranslation()
        }
        const matrix = this.getMatrix();
        matrix.e = tx || 0;
        matrix.f = ty || 0;
        this.setMatrix(matrix);
        return this
    }

    translateBy(dx: number, dy: number) {
        const ts = this.translate()
        const tx = ts.tx + dx
        const ty = ts.ty + dy
        return this.translate(tx, ty)
    }

    addEventListener(name: string, callback: (e: any) => void) {
        this.on(name, callback);
    }

    removeEventListener(name: string, callback: (e: any) => void) {
        this.off(name, callback);
    }

    getPointView(point: Point): Group | null {
        if (this.isPointContains(point)) {
            return this
        }
        return super.getChildGroupByPoint(point)
    }

    isPointInPolygon(x: number, y: number, points: { x: number, y: number }[]): boolean {
        /*let isInside = false;

        const numPoints = points.length;
        let j = numPoints - 1;

        for (let i = 0; i < numPoints; i++) {
            if ((points[i].y < y && points[j].y >= y) || (points[j].y < y && points[i].y >= y)) {
                if (points[i].x + (y - points[i].y) / (points[j].y - points[i].y) * (points[j].x - points[i].x) < x) {
                    isInside = !isInside;
                }
            }
            j = i;
        }

        return isInside;*/
        const path = new Path2D();
        points.forEach((vertex, index) => {
            if (index === 0) {
                path.moveTo(vertex.x, vertex.y);
            } else {
                path.lineTo(vertex.x, vertex.y);
            }
        })
        path.closePath();
        return this.ctx!.isPointInPath(path, x, y)
    }

    /**抽样点*/
    samplePointsOnRoundRect(rectX: number, rectY: number, rectWidth: number, rectHeight: number, borderRadius: number, numSamples: number): Point[] {
        const points: { x: number, y: number }[] = [];

        const radius = Math.min(borderRadius, rectWidth / 2, rectHeight / 2);

        let numArcSamples = Math.floor(numSamples / 4);
        if (numArcSamples == 0) {
            numArcSamples = 1
        }
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

}

export default View