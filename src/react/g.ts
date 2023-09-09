import {SvgAttr} from "../interface";
import {Fragment, createElement, useEffect, useContext, useRef} from "react";
import type {FC, ReactNode} from "react";
import ShapeG from '../shape/g'
import Context, {ContextConfig} from "./context";
import {getSvgComputedStyle, parseTransformToMatrix, svgAttrToCanvas} from "../utils/convert";
import {useCreation} from "./hooks";

export interface GProps extends Partial<SvgAttr> {
    transform?: string;
    children: ReactNode
}

const G: FC<GProps> = ({
                           transform, children, ...style
                       }) => {
    const _styles = getSvgComputedStyle(style)
    const {instance} = useContext(Context);

    const ref = useRef<ShapeG>()

    if (!ref.current) {
        ref.current = new ShapeG()
        ref.current.visible = false;
        ref.current.style = svgAttrToCanvas(style)
    } else {
        ref.current.style = svgAttrToCanvas(style)
    }

    useEffect(() => {
        if (transform) {
            ref.current!.setMatrix(parseTransformToMatrix(transform))
        }
        instance?.update();
    }, [
        transform,
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
        instance?.add(ref.current!)
        return () => {
            instance?.removeChild(ref.current!)
        }
    }, [])
    const value = useCreation<ContextConfig>(() => ({
        instance: {
            add(view) {
                ref.current!.addChild(view)
            },
            update() {
                instance!.update()
            },
            removeChild(view) {
                ref.current!.removeChild(view)
            }
        }
    }), [ref.current])
    return value ? createElement(Context.Provider, {value}, children) : createElement(Fragment)
}
export default G