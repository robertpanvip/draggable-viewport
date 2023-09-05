import {SvgAttr} from "../interface";
import {Fragment, createElement, useEffect, useContext, useRef} from "react";
import type {FC} from "react";
import ShapeRect from '../shape/rect'
import Context from "./context";
import {getSvgComputedStyle, svgAttrToCanvas} from "../utils/convert";

export interface RectProps extends Partial<SvgAttr> {
    x: number | string,
    y: number | string,
    width: number | string,
    height: number | string,
    rx?: number | string,
    ry?: number | string,
}

const Rect: FC<RectProps> = ({
                                 x, y, rx = 0, ry = 0, width, height, ...style
                             }) => {

    const _styles = getSvgComputedStyle(style)
    const {instance} = useContext(Context);

    const ref = useRef<ShapeRect>()

    if (!ref.current) {
        ref.current = new ShapeRect({
            x: parseFloat(`${x}`),
            y: parseFloat(`${y}`),
            w: parseFloat(`${width}`),
            h: parseFloat(`${height}`),
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
        x, y, width, height, rx, ry,
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
export default Rect