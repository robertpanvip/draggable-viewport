import type {Point} from "../interface";
import Path from "./path";
import View from "./view";

export type PolygonOptions = {
    points: readonly Point[],
    close: boolean,//是否闭合
}

type PrivateScope = {} & PolygonOptions

const getPathStrFromPoints = (points: readonly Point[], close: boolean) => {
    return points.map((p, index) => `${index === 0 ? "M" : "L"}${p.x},${p.y} `).join('') + (close ? 'Z' : '')
}

const vm = new WeakMap<View, PrivateScope>()

class Polygon extends Path {

    constructor(options: Partial<PolygonOptions> = {points: [], close: true}) {
        const _options = {points: [], close: true, ...options}
        super({
            d: getPathStrFromPoints(_options.points, _options.close)
        });
        vm.set(this, {..._options})
    }

    get close() {
        return vm.get(this)!.close
    }

    set close(close) {
        vm.get(this)!.close = close;
        this.d = getPathStrFromPoints(this.points, close)
    }

    get points() {
        return vm.get(this)!.points
    }

    set points(points) {
        vm.get(this)!.points = points;
        this.d = getPathStrFromPoints(points, this.close)
    }

}

export default Polygon