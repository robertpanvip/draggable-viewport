import {SupportEvents, SvgAttr} from "../interface";
import {Fragment, createElement} from "react";
import type {FC} from "react";
import ShapeCircle from '../shape/circle'
import {useInstance} from "./hooks";

export interface CircleProps extends Partial<SvgAttr>, Partial<SupportEvents> {
    r: number | string,
    cx?: number | string,
    cy?: number | string,
}

const Circle: FC<CircleProps> = (props) => {
    const {
        r = 0, cx = 0, cy = 0,
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
    } = props

    useInstance(
        {
            FC: Circle,
            props
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
        () => new ShapeCircle({
            cx: parseFloat(`${cx}`),
            cy: parseFloat(`${cy}`),
            r: parseFloat(`${r}`),
        }), [
            r, cx, cy,
        ])
    return createElement(Fragment)
}
export default Circle