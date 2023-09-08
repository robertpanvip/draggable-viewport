import {SvgAttr} from "../interface";
import {Fragment, createElement, useEffect, useContext, useRef} from "react";
import type {FC} from "react";
import ShapePath from '../shape/path'
import Context from "./context";
import {getSvgComputedStyle, svgAttrToCanvas} from "../utils/convert";

export interface PathProps extends Partial<SvgAttr> {
    d: string
}

const Path: FC<PathProps> = ({d, ...style}) => {

    const _styles = getSvgComputedStyle(style)

    const {instance} = useContext(Context);

    const ref = useRef<ShapePath>()

    if (!ref.current) {
        ref.current = new ShapePath({d})
        ref.current.style = svgAttrToCanvas(style)
        instance?.addView(ref.current)
    } else {
        ref.current.d = d;
        ref.current.style = svgAttrToCanvas(style)
    }

    useEffect(() => {
        instance?.render();
    }, [
        d,
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
export default Path