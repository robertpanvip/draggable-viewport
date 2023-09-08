import {SvgAttr} from "../interface";
import {Fragment, createElement, useEffect, useContext, useRef} from "react";
import type {FC} from "react";
import ShapeEllipse from '../shape/ellipse'
import Context from "./context";
import {getSvgComputedStyle, svgAttrToCanvas} from "../utils/convert";

export interface EllipseProps extends Partial<SvgAttr> {
    cx: number,
    cy: number,
    rx: number,
    ry: number,
}

const Ellipse: FC<EllipseProps> = ({
                                       rx, ry, cx = 0, cy = 0, ...style
                                   }) => {

    const _styles = getSvgComputedStyle(style)
    const {instance} = useContext(Context);

    const ref = useRef<ShapeEllipse>()

    if (!ref.current) {
        ref.current = new ShapeEllipse({
            cx: parseFloat(`${cx}`),
            cy: parseFloat(`${cy}`),
            rx: parseFloat(`${rx}`),
            ry: parseFloat(`${ry}`),
        })
        ref.current.style = svgAttrToCanvas(style)
        instance?.addView(ref.current)
    } else {
        ref.current.style = svgAttrToCanvas(style)
    }

    useEffect(() => {
        instance?.render();
    }, [
        rx, ry, cx, cy,
        _styles.fill,
        _styles.fillRule,
        _styles.stroke,
        _styles.strokeDasharray,
        _styles.strokeDashoffset,
        _styles.strokeLinecap,
        _styles.strokeLinejoin,
        _styles.strokeMiterlimit,
        _styles.strokeWidth
    ])

    useEffect(() => {
        return () => {
            instance?.removeView(ref.current!)
        }
    }, [])

    return createElement(Fragment)
}
export default Ellipse