import {SupportEvents, SvgAttr} from "../interface";
import {Fragment, createElement, useEffect, useContext, useRef} from "react";
import type {FC} from "react";
import ShapePolygon from '../shape/polygon'
import Context from "./context";
import {getSvgComputedStyle, svgAttrToCanvas} from "../utils/convert";
import {useInstance} from "./hooks";
import ShapeEllipse from "../shape/ellipse";

export interface PolygonProps extends Partial<SvgAttr>, Partial<SupportEvents> {
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

const Polygon: FC<PolygonProps> = (props) => {
    const {
        points,
        onDblClick,
        onClick,
        onContextMenu,
        onMouseMove,
        onMouseEnter,
        onMouseLeave,
        onDragStart,
        onDrag,
        onDragEnd,
        ...style
    } = props;
    useInstance(
        {
            FC: Polygon,
            props,
        },
        style,
        {
            onDblClick,
            onClick,
            onContextMenu,
            onMouseMove,
            onMouseEnter,
            onMouseLeave,
            onDragStart,
            onDrag,
            onDragEnd,
        },
        () => new ShapePolygon({
            points: formatter(points)
        }),
        [
            points,
        ]
    )

    return createElement(Fragment)
}
export default Polygon