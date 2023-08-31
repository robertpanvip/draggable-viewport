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

    constructor() {
        super();
        vm.set(this, {matrix: new DOMMatrix()})
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

    getPointView(point: Point): Group | null {
        if (this.isPointContains(point)) {
            return this
        }
        return super.getChildGroupByPoint(point)
    }

    isPointInPolygon(x: number, y: number, points: { x: number, y: number }[]): boolean {
        let isInside = false;

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

        return isInside;
    }

}

export default View