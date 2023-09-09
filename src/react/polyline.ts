import {SupportEvents, SvgAttr} from "../interface";
import {Fragment, createElement} from "react";
import type {FC} from "react";
import ShapePolygon from '../shape/polygon'
import {useInstance} from "./hooks";

export interface PolylineProps extends Partial<SvgAttr>, Partial<SupportEvents> {
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

const Polyline: FC<PolylineProps> = (props) => {
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
            FC: Polyline,
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
            points: formatter(points),
            close: false
        }),
        [
            points,
        ]
    )
    return createElement(Fragment)
}
export default Polyline