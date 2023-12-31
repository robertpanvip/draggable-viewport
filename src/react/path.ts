import {SupportEvents, SvgAttr} from "../interface";
import {Fragment, createElement} from "react";
import type {FC} from "react";
import ShapePath from '../shape/path'
import {useInstance} from "./hooks";

export interface PathProps extends Partial<SvgAttr>, Partial<SupportEvents> {
    d: string
}

const Path: FC<PathProps> = (props) => {
    const {
        d,
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
            FC: Path,
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
        () => new ShapePath({d}), [
            d,
        ])

    return createElement(Fragment)
}
export default Path