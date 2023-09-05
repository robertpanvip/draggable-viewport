import {SvgAttr} from "../interface";
import {Fragment, createElement, useEffect, useContext, useRef} from "react";
import type {FC} from "react";
import ShapePolygon from '../shape/polygon'
import Context from "./context";
import {getSvgComputedStyle, svgAttrToCanvas} from "../utils/convert";

export interface PolylineProps extends Partial<SvgAttr> {
    points: string
}

const formatter = (points: string) => {
    return points.split(' ').map(item => {
        const [x, y] = item.split(',')
        return {
            x: parseFloat(x),
            y: parseFloat(y)
        }
    })
}

const Polyline: FC<PolylineProps> = ({points, ...style}) => {

    const _styles = getSvgComputedStyle(style)
    const {instance} = useContext(Context);

    const ref = useRef<ShapePolygon>()

    if (!ref.current) {
        ref.current = new ShapePolygon({
            points: formatter(points),
            close:false
        })
        ref.current.style = svgAttrToCanvas(style)
        instance?.addView(ref.current)
    } else {
        ref.current.points = formatter(points);
        ref.current.style = svgAttrToCanvas(style)
    }

    useEffect(() => {
        instance?.render();
    }, [
        points,
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
export default Polyline