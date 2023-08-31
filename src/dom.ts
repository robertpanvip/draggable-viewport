import {MatrixLike, PointLike, Rotation, Scale, Translation, RectangleLike} from "./interface";
import {Rectangle} from "./rectangle";

export const ns = {
    svg: "http://www.w3.org/2000/svg",
    xmlns: "http://www.w3.org/2000/xmlns/",
    xml: "http://www.w3.org/XML/1998/namespace",
    xlink: "http://www.w3.org/1999/xlink",
    xhtml: "http://www.w3.org/1999/xhtml",
};

export function createElementNS<T extends Element>(
    tagName: string,
    namespaceURI: string = ns.xhtml,
    doc: Document = document
): T {
    return doc.createElementNS(namespaceURI, tagName) as any as T;
}

export function createSvgElement<T extends SVGElement>(
    tagName: string,
    doc: Document = document
): T {
    return createElementNS<SVGElement>(tagName, ns.svg, doc) as T;
}

const svgDocument = createSvgElement<SVGSVGElement>("svg");


export function createSVGMatrix(matrix?: DOMMatrix | MatrixLike | null) {
    const mat = svgDocument.createSVGMatrix();
    if (matrix != null) {
        const source = matrix as any;
        const target = mat as any;
        // eslint-disable-next-line
        for (const key in source) {
            target[key] = source[key];
        }
    }
    return mat;
}


function deltaTransformPoint(matrix: DOMMatrix | MatrixLike, point: PointLike) {
    const dx = point.x * matrix.a + point.y * matrix.c
    const dy = point.x * matrix.b + point.y * matrix.d
    return {x: dx, y: dy}
}

export function matrixToRotation(matrix: DOMMatrix | MatrixLike): Rotation {
    let p = {x: 0, y: 1}
    if (matrix) {
        p = deltaTransformPoint(matrix, p)
    }

    const deg = (((180 * Math.atan2(p.y, p.x)) / Math.PI) % 360) - 90
    const angle = (deg % 360) + (deg < 0 ? 360 : 0)
    return {
        angle,
    }
}

export function matrixToTransformString(
    matrix?: DOMMatrix | Partial<MatrixLike>
) {
    const m = matrix || ({} as DOMMatrix);
    const a = m.a != null ? m.a : 1;
    const b = m.b != null ? m.b : 0;
    const c = m.c != null ? m.c : 0;
    const d = m.d != null ? m.d : 1;
    const e = m.e != null ? m.e : 0;
    const f = m.f != null ? m.f : 0;
    return `matrix(${a},${b},${c},${d},${e},${f})`;
}

export function matrixToTranslation(
    matrix: DOMMatrix | MatrixLike
): Translation {
    return {
        tx: (matrix && matrix.e) || 0,
        ty: (matrix && matrix.f) || 0,
    };
}

export function matrixToScale(matrix: DOMMatrix): Scale {
    let a;
    let b;
    let c;
    let d;
    if (matrix) {
        a = matrix.a == null ? 1 : matrix.a;
        d = matrix.d == null ? 1 : matrix.d;
        b = matrix.b;
        c = matrix.c;
    } else {
        // eslint-disable-next-line no-multi-assign
        a = d = 1;
    }
    return {
        sx: b ? Math.sqrt(a * a + b * b) : a,
        sy: c ? Math.sqrt(c * c + d * d) : d,
    };
}

/**
 * Returns true if object is an instance of SVGGraphicsElement.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/SVGGraphicsElement
 */
export function isSVGGraphicsElement(
    elem?: any | null,
): elem is SVGGraphicsElement {
    if (elem == null) {
        return false
    }

    return typeof elem.getScreenCTM === 'function' && elem instanceof SVGElement
}

// Determines whether a node is an HTML node
export function isHTMLElement(elem: any): elem is HTMLElement {
    try {
        // Using W3 DOM2 (works for FF, Opera and Chrome)
        return elem instanceof HTMLElement
    } catch (e) {
        // Browsers not supporting W3 DOM2 don't have HTMLElement and
        // an exception is thrown and we end up here. Testing some
        // properties that all elements have (works on IE7)
        return (
            typeof elem === 'object' &&
            elem.nodeType === 1 &&
            typeof elem.style === 'object' &&
            typeof elem.ownerDocument === 'object'
        )
    }
}

export function getComputedStyle(elem: Element, name?: string) {
    // IE9+
    const computed =
        elem.ownerDocument &&
        elem.ownerDocument.defaultView &&
        elem.ownerDocument.defaultView.opener
            ? elem.ownerDocument.defaultView.getComputedStyle(elem, null)
            : window.getComputedStyle(elem, null)

    if (computed && name) {
        return computed.getPropertyValue(name) || (computed as any)[name]
    }

    return computed
}

export function getBoundingOffsetRect(elem: HTMLElement) {
    let left = 0
    let top = 0
    let width = 0
    let height = 0
    if (elem) {
        let current = elem as any
        while (current) {
            left += current.offsetLeft
            top += current.offsetTop
            current = current.offsetParent
            if (current) {
                left += parseInt(getComputedStyle(current, 'borderLeft'), 10)
                top += parseInt(getComputedStyle(current, 'borderTop'), 10)
            }
        }
        width = elem.offsetWidth
        height = elem.offsetHeight
    }
    return {
        left,
        top,
        width,
        height,
    }
}

/**
 * Returns an DOMMatrix that specifies the transformation necessary
 * to convert `elem` coordinate system into `target` coordinate system.
 */
export function getTransformToElement(elem: SVGElement, target: SVGElement) {
    if (isSVGGraphicsElement(target) && isSVGGraphicsElement(elem)) {
        const targetCTM = target.getScreenCTM()
        const nodeCTM = elem.getScreenCTM()
        if (targetCTM && nodeCTM) {
            return targetCTM.inverse().multiply(nodeCTM)
        }
    }

    // Could not get actual transformation matrix
    return createSVGMatrix()
}

/**
 * Returns the bounding box of the element after transformations are
 * applied. Unlike `bbox()`, this function fixes a browser implementation
 * bug to return the correct bounding box if this elemenent is a group of
 * svg elements (if `options.recursive` is specified).
 */
export function getBBox(
    elem: SVGElement,
    options: {
        target?: SVGElement | null
        recursive?: boolean
    } = {},
): Rectangle {
    let outputBBox
    const ownerSVGElement = elem.ownerSVGElement

    // If the element is not in the live DOM, it does not have a bounding box
    // defined and so fall back to 'zero' dimension element.
    // If the element is not an SVGGraphicsElement, we could not measure the
    // bounding box either
    if (!ownerSVGElement || !isSVGGraphicsElement(elem)) {
        if (isHTMLElement(elem)) {
            // If the element is a HTMLElement, return the position relative to the body
            const {left, top, width, height} = getBoundingOffsetRect(elem as any)
            return new Rectangle(left, top, width, height)
        }
        return new Rectangle(0, 0, 0, 0)
    }

    let target = options.target
    const recursive = options.recursive

    if (!recursive) {
        try {
            outputBBox = elem.getBBox()
        } catch (e) {
            outputBBox = {
                x: elem.clientLeft,
                y: elem.clientTop,
                width: elem.clientWidth,
                height: elem.clientHeight,
            }
        }

        if (!target) {
            return Rectangle.create(outputBBox)
        }

        // transform like target
        const matrix = getTransformToElement(elem, target)
        return transformRectangle(outputBBox, matrix)
    }

    // recursive
    {
        const children = elem.childNodes
        const n = children.length

        if (n === 0) {
            return getBBox(elem, {
                target,
            })
        }

        if (!target) {
            target = elem // eslint-disable-line
        }

        for (let i = 0; i < n; i += 1) {
            const child = children[i] as SVGElement
            let childBBox

            if (child.childNodes.length === 0) {
                childBBox = getBBox(child, {
                    target,
                })
            } else {
                // if child is a group element, enter it with a recursive call
                childBBox = getBBox(child, {
                    target,
                    recursive: true,
                })
            }

            if (!outputBBox) {
                outputBBox = childBBox
            } else {
                outputBBox = outputBBox.union(childBBox)
            }
        }

        return outputBBox as Rectangle
    }
}

export function transformRectangle(
    rect: RectangleLike,
    matrix: DOMMatrix,
) {
    const p = svgDocument.createSVGPoint()

    p.x = rect.x
    p.y = rect.y
    const corner1 = p.matrixTransform(matrix)

    p.x = rect.x + rect.width
    p.y = rect.y
    const corner2 = p.matrixTransform(matrix)

    p.x = rect.x + rect.width
    p.y = rect.y + rect.height
    const corner3 = p.matrixTransform(matrix)

    p.x = rect.x
    p.y = rect.y + rect.height
    const corner4 = p.matrixTransform(matrix)

    const minX = Math.min(corner1.x, corner2.x, corner3.x, corner4.x)
    const maxX = Math.max(corner1.x, corner2.x, corner3.x, corner4.x)
    const minY = Math.min(corner1.y, corner2.y, corner3.y, corner4.y)
    const maxY = Math.max(corner1.y, corner2.y, corner3.y, corner4.y)

    return new Rectangle(minX, minY, maxX - minX, maxY - minY)
}