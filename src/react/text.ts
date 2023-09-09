import {SvgAttr} from "../interface";
import {Fragment, createElement, useEffect, useContext, useRef} from "react";
import type {FC} from "react";
import ShapeText from '../shape/text'
import Context from "./context";
import {getSvgComputedStyle} from "../utils/convert";

export interface TextProps extends Partial<Omit<SvgAttr, "style">> {
    x: number | string,
    y: number | string,
    dx?: number | string;
    dy?: number | string
    children?: string,
    path?: string;
    startOffset?: number;
    spacing?: number;
    style?: Partial<SvgAttr> & {
        fontSize?: number;
        fontFamily?: string;
        fontWeight?: string;
    }
}

const Text: FC<TextProps> = ({
                                 x, y, dx, dy, children, path, startOffset, spacing, ...style
                             }) => {

    const _styles = getSvgComputedStyle(style)
    const {instance} = useContext(Context);

    const ref = useRef<ShapeText>()

    if (!ref.current) {
        ref.current = new ShapeText({
            x: parseFloat(`${x}`),
            y: parseFloat(`${y}`),
            dx: dx !== undefined ? parseFloat(`${dx}`) : undefined,
            dy: dy !== undefined ? parseFloat(`${dy}`) : undefined,
            text: children,
            path,
            startOffset,
            spacing
        })
        ref.current.style.fontSize = style.style?.fontSize;
        ref.current.style.fontFamily = style.style?.fontFamily;
        ref.current.style.fontWeight = style.style?.fontWeight;
        //ref.current.style = svgAttrToCanvas(style)
        instance?.add(ref.current)
    } else {
        //ref.current.style = svgAttrToCanvas(style)
    }

    useEffect(() => {
        instance?.update();
    }, [
        x, y, children, path, startOffset, spacing,
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
            instance?.removeChild(ref.current!)
        }
    }, [])

    return createElement(Fragment)
}
export default Text