import {SvgAttr} from "../interface";
import {Fragment, createElement, useEffect, useContext, useRef} from "react";
import type {FC} from "react";
import ShapeCircle from '../shape/circle'
import Context from "./context";
import {getSvgComputedStyle, svgAttrToCanvas} from "../utils/convert";

export interface CircleProps extends Partial<SvgAttr> {
    r: number | string,
    cx?: number | string,
    cy?: number | string,
}

const Circle: FC<CircleProps> = ({
                                     r = 0, cx = 0, cy = 0, ...style
                                 }) => {

    const _styles = getSvgComputedStyle(style)
    const {instance} = useContext(Context);

    const ref = useRef<ShapeCircle>()

    if (!ref.current) {
        ref.current = new ShapeCircle({
            cx: parseFloat(`${cx}`),
            cy: parseFloat(`${cy}`),
            r: parseFloat(`${r}`),
        })
        ref.current.style = svgAttrToCanvas(style)
        instance?.addView(ref.current)
    } else {
        ref.current.style = svgAttrToCanvas(style)
    }

    useEffect(() => {
        instance?.render();
    }, [
        r, cx, cy,
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
export default Circle