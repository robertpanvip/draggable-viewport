import View from "./view";
import {RectangleLike, ViewStyle} from "../interface";
import {getPathBounds} from "../utils/convert";

type PathConfig = {
    d: string
}

interface PrivateScope extends PathConfig {
    path?: Path2D
}

const vm = new WeakMap<Path, PrivateScope>()

class Path extends View {
    name = "Path";

    get d(): string {
        return vm.get(this)!.d
    }

    set d(d: string) {
        vm.get(this)!.d = d;
        vm.get(this)!.path = new Path2D(d)
    }

    constructor({d}: PathConfig) {
        super();
        vm.set(this, {d: d, path: new Path2D(d)})
    }

    getBBox(): RectangleLike {
        // 获取Path2D对象的边界框
        return getPathBounds(vm.get(this)!.path!);
    }

    getShape(): Path2D[] {
        return [vm.get(this)!.path!];
    }

    render() {
        const ctx = this.ctx!;
        super.render();
        ctx.save()
        ctx.setTransform(this.getRenderMatrix());
        const {cursor, ...rest} = this.style || {}
        Object.entries(rest).forEach(([key, val]) => {
            if (val !== undefined && (typeof val !== 'function')) {
                // @ts-ignore
                ctx[key as keyof Omit<ViewStyle, 'cursor'>] = val;
            }
        })
        const path = this.getShape()[0]

        if (this.style.strokeStyle) {
            ctx.stroke(path)
        }
        if (this.style.fillStyle) {
            ctx.fill(path)
        }


        ctx.restore();
        if (this.drawShape) {
            this.renderShape({
                strokeStyle: 'red'!,
                //fillStyle: this.style?.color!,
                strokeWidth: 1!
            })
        }

        if (this.drawBBox) {
            this.renderBBox()
        }
    }
}

export default Path