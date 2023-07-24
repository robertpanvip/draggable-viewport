import {
    createSVGMatrix,
    getBBox,
    matrixToTransformString,
} from "./dom";

import type {SVGManagerOptions} from "./interface";
import Viewport from "./viewport";

export default class SVGManager extends Viewport<SVGSVGElement> {
    svg: SVGSVGElement | null = null;

    g: SVGGElement | null = null;

    viewportTransformString: string | null | undefined;

    viewportMatrix: DOMMatrix | null | undefined;

    constructor({
                    svg,
                    viewport,
                    scaling,
                    minScale,
                    maxScale,
                    panning,
                }: SVGManagerOptions) {
        if (panning === undefined) {
            panning = (target) => !!target.textContent || target === this.root
        }
        super({
            scaling,
            minScale,
            maxScale,
            panning
        })
        this.g = viewport;
        this.svg = svg;
    }

    protected get root() {
        return this.svg!;
    }

    protected get viewport() {
        return this.g!;
    }

    getSize() {
        return this.root.getBoundingClientRect()
    }

    getMatrix = () => {
        const transform = this.viewport.getAttribute("transform");
        if (transform !== this.viewportTransformString) {
            this.viewportMatrix = this.viewport.getCTM();
            this.viewportTransformString = transform;
        }
        return createSVGMatrix(this.viewportMatrix);
    };

    setMatrix = (matrix: DOMMatrix) => {
        const ctm = createSVGMatrix(matrix);
        const transform = matrixToTransformString(ctm);
        this.viewport.setAttribute("transform", transform);
        this.viewportMatrix = ctm;
        this.viewportTransformString = transform;
        return this;
    };

    getBBox() {
        return getBBox(this.viewport)
    }
}
