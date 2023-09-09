import {SupportEvents, SvgAttr} from "../interface";
import {Fragment, createElement} from "react";
import type {FC} from "react";
import ShapeRect from '../shape/rect'
import {useInstance} from "./hooks";

export interface RectProps extends Partial<SvgAttr>, Partial<SupportEvents> {
    x: number | string,
    y: number | string,
    width: number | string,
    height: number | string,
    rx?: number | string,
    ry?: number | string,
}

const Rect: FC<RectProps> = ({
                                 x,
                                 y,
                                 rx = 0,
                                 ry = 0,
                                 width,
                                 height,
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
        () => new ShapeRect({
            x: parseFloat(`${x}`),
            y: parseFloat(`${y}`),
            w: parseFloat(`${width}`),
            h: parseFloat(`${height}`),
            rx: parseFloat(`${rx}`),
            ry: parseFloat(`${ry}`),
        }), [
            x, y, width, height, rx, ry,
        ])

    return createElement(Fragment)
}
export default Rect