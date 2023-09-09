import Rect, {RectConfig} from "./rect";

export interface ImageConfig extends Partial<RectConfig> {
    xlinkHref?: string
}

enum Status {
    loading,
    loaded,
    error
}

type PrivateScope = {
    xlinkHref: string,
    resource: HTMLImageElement | null,
    angle: number;
    status: Status
}

const vm = new WeakMap<Image, PrivateScope>()

const loadingPaths = [
    new Path2D(`m249.84957,6.55789c-0.64377,-33.76527 -7.97562,-67.44396 -21.49483,-98.23096c-13.48345,-30.80432 -33.04696,-58.71694 -57.06323,-81.78122c-23.99839,-23.08159 -52.46741,-41.33215 -83.27905,-53.36644c-30.79376,-12.08624 -63.91225,-17.85231 -96.61945,-17.15969c-32.70719,0.65799 -65.28921,7.77467 -95.06366,20.89984c-29.81022,13.07322 -56.81288,32.05103 -79.13031,55.34041c-22.31743,23.27207 -39.94962,50.87301 -51.57329,80.72497c-11.67731,29.83465 -17.23878,61.88568 -16.52348,93.57308c0.64377,31.70473 7.54644,63.21897 20.24306,92.04932c12.67873,28.83035 31.04411,54.95947 53.57613,76.53461c22.51413,21.60977 49.19491,38.64825 78.03947,49.86871c28.82668,11.27241 59.79927,16.6229 90.43208,15.93028c30.6507,-0.65799 61.05105,-7.3591 88.8763,-19.65312c27.84314,-12.2767 53.07542,-30.04243 73.89072,-51.85999c20.83318,-21.78293 37.26724,-47.60037 48.08619,-75.47837c6.58078,-16.89995 11.03354,-34.54447 13.39404,-52.4314c0.62589,0.05195 1.26966,0.06926 1.89555,0.06926c17.84679,0 32.31378,-14.47578 32.31378,-32.32808c0,-0.90041 -0.05365,-1.80082 -0.12518,-2.70123l0.12518,0l0,0zm-51.34082,85.85036c-11.83825,26.87369 -29.0055,51.21932 -50.05327,71.30532c-21.04777,20.12064 -45.94028,35.96434 -72.81776,46.37097c-26.87748,10.44126 -55.66839,15.37618 -84.24472,14.68356c-28.57632,-0.64068 -56.83075,-6.92621 -82.68893,-18.42372c-25.87606,-11.44556 -49.32009,-28.01652 -68.65113,-48.34494c-19.34892,-20.29379 -34.60274,-44.32774 -44.58121,-70.23176c-10.03212,-25.90402 -14.75311,-53.66081 -14.07357,-81.20981c0.66166,-27.54899 6.72384,-54.75168 17.79314,-79.65141c11.03354,-24.89972 27.00266,-47.46185 46.56617,-66.07603c19.54563,-18.61419 42.66778,-33.26312 67.57817,-42.85592c24.9104,-9.62743 51.5554,-14.14678 78.05735,-13.45416c26.50195,0.65799 52.61048,6.52795 76.50157,17.19432c23.90898,10.63173 45.56475,26.00792 63.41154,44.82989c17.88255,18.82198 31.92036,41.07242 41.09411,65.00248c9.20951,23.94736 13.51921,49.53971 12.83967,75.01084l0.1073,0c-0.07154,0.90041 -0.1073,1.7835 -0.1073,2.70123c0,16.67485 12.6072,30.38874 28.8088,32.13761c-3.14733,17.59257 -8.35115,34.75225 -15.53994,51.01153z`),
]
const errorPaths = [new Path2D(`M747.8 322l-195-10.2-0.7 1.7-14 30.4-2.3 5 21.1 60.6-39.5 76.7 13.7 64.3 60.2-32.8c4.8-2.6 10.7-1 13.5 3.6l59.7 97.9c1.9 3.2 1.9 7.3 0 10.5s-5.5 5.1-9.2 4.9L515.9 627l-13.3 39.6-1.3 3.8 10.5 28.8 215.7 11.3c20.2 1.1 31-10.1 32.2-33.5l16.7-318.3c1.1-23.4-8.4-35.6-28.6-36.7z m-50.3 138.4c-1 19.9-18 35.2-37.9 34.2s-35.2-18-34.1-38c1-19.9 18-35.2 37.9-34.2 19.9 1.1 35.1 18.1 34.1 38zM483.7 668.6l9.1-40.7-123.1 6.5c-3.4 0.2-6.7-1.3-8.7-4.1-2-2.7-2.6-6.3-1.4-9.5l59.3-164.3c1.3-3.5 4.4-6 8.1-6.6 3.7-0.5 7.4 1 9.6 4.1l58.2 79.5-15.7-48.1 30.6-78.6-27-57.4 1.8-5.3 11.3-33.4L277.4 322c-20.2 1.1-29.7 13.3-28.5 36.7L265.5 677c1.2 23.4 12 34.5 32.2 33.5L495 700.1l-12.6-25.8 1.3-5.7z`)]

class Image extends Rect {

    name: string = "Image"

    get xlinkHref() {
        return vm.get(this)!.xlinkHref
    }

    set xlinkHref(xlinkHref: string) {
        vm.get(this)!.xlinkHref = xlinkHref;
        vm.get(this)!.status = Status.loading;
        const img = new window.Image();
        img.src = xlinkHref;
        let timer: NodeJS.Timeout;
        const loop = () => {
            timer = setTimeout(() => {
                vm.get(this)!.angle = vm.get(this)!.angle + Math.PI * 2 / 8;
                this.vp.render();
                loop();
            }, 100)
        }
        loop();
        const onLoad = () => {
            vm.get(this)!.status = Status.loaded;
            vm.get(this)!.resource = img;
            img.removeEventListener('load', onLoad)
            img.removeEventListener('error', onError);
            vm.get(this)!.angle = 0;
            clearTimeout(timer);
            if (!this.w) {
                if (this.h) {
                    this.w = img.width * this.h / img.height
                } else {
                    this.w = img.width
                }
            }
            if (!this.h) {
                if (this.w) {
                    this.h = img.height * this.w / img.width
                } else {
                    this.h = img.height
                }
            }
            this.vp?.render();
        }
        const onError = () => {
            vm.get(this)!.resource = null;
            vm.get(this)!.status = Status.error;
            img.removeEventListener('load', onLoad)
            img.removeEventListener('error', onError)
            vm.get(this)!.angle = 0;
            clearTimeout(timer)
            if (!this.w) {
                this.w = 200
            }
            if (!this.h) {
                this.h = 200
            }
            this.vp?.render();
        }
        img.addEventListener('load', onLoad)
        img.addEventListener('error', onError);
    }

    constructor(
        {
            x,
            y,
            w,
            h,
            rx,
            ry,
            xlinkHref,
        }: ImageConfig = {
            x: 0,
            y: 0,
            rx: 0,
            ry: 0,
            xlinkHref: "",
            style: {}
        }) {
        super({
            x: x || 0,
            y: y || 0,
            w: w || 0,
            h: h || 0,
            rx: rx || 0,
            ry: ry || 0,
        });
        vm.set(this, {xlinkHref: xlinkHref!, resource: null, status: Status.loading, angle: 0})
        this.xlinkHref = xlinkHref!;
    }

    render() {
        const ctx = this.ctx!;
        super.render();
        ctx.save();
        ctx.resetTransform()
        ctx.setTransform(this.getRenderMatrix());

        const scope = vm.get(this)!;
        if (scope.status === Status.loaded) {
            if (scope.resource) {
                ctx.drawImage(vm.get(this)!.resource!, this.x, this.y, this.w, this.h)
            }
        }

        if (scope.status === Status.loading) {

            ctx.translate(this.x, this.y)
            ctx.scale(this.w / 1024, this.h / 1024)
            ctx.translate(512, 512);
            ctx.rotate(vm.get(this)!.angle)
            loadingPaths.forEach(path => {
                ctx.fill(path)
            })

        }
        if (scope.status === Status.error) {
            ctx.translate(this.x, this.y)
            ctx.scale(this.w / 1024, this.h / 1024)
            errorPaths.forEach(path => {
                ctx.fill(path)
            })
            this.renderShape({
                strokeStyle: this.style.strokeStyle || 'red'!,
                strokeWidth: 1!
            })
        }
        ctx.restore();

    }
}

export default Image