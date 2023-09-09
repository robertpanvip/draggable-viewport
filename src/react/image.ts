import {SupportEvents, SvgAttr} from "../interface";
import {Fragment, createElement} from "react";
import type {FC} from "react";
import ShapeImage from '../shape/image'
import {useInstance} from "./hooks";

export interface ImageProps extends Partial<SvgAttr>, Partial<SupportEvents> {
    x?: number | string,
    y?: number | string,
    width?: number | string,
    height?: number | string,
    rx?: number | string,
    ry?: number | string,
    xlinkHref?: string
}

const Image: FC<ImageProps> = (props) => {
    const {
        x,
        y,
        rx = 0,
        ry = 0,
        width,
        height,
        xlinkHref,
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
            FC: Image,
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
        () => {
            return new ShapeImage({
                x: parseFloat(`${x}`),
                y: parseFloat(`${y}`),
                w: parseFloat(`${width}`),
                h: parseFloat(`${height}`),
                rx: parseFloat(`${rx}`),
                ry: parseFloat(`${ry}`),
                xlinkHref: xlinkHref
            });
        }, [
            x, y, width, height, rx, ry,
        ])

    return createElement(Fragment)
}
export default Image