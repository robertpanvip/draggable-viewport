import {SupportEvents, SvgAttr} from "../interface";
import {Fragment, createElement} from "react";
import type {FC} from "react";
import ShapeEllipse from '../shape/ellipse'
import {useInstance} from "./hooks";

export interface EllipseProps extends Partial<SvgAttr>, Partial<SupportEvents> {
    cx: number,
    cy: number,
    rx: number,
    ry: number,
}

const Ellipse: FC<EllipseProps> = ({
                                       rx, ry, cx = 0, cy = 0,
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
                                   }) => {

    useInstance(
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
        () => new ShapeEllipse({
            cx: parseFloat(`${cx}`),
            cy: parseFloat(`${cy}`),
            rx: parseFloat(`${rx}`),
            ry: parseFloat(`${ry}`),
        }), [
            rx, ry, cx, cy,
        ])

    return createElement(Fragment)
}
export default Ellipse