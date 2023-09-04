import {SvgAttr} from "../interface";
import {Fragment, createElement, useEffect, useContext, useRef} from "react";
import type {FC} from "react";
import ShapePath from '../shape/path'
import Context from "./context";
import {svgAttrToCanvas} from "../utils/convert";

export interface PathProps extends Partial<SvgAttr> {
    d: string
}

const Path: FC<PathProps> = ({d, stroke}) => {
    const {instance} = useContext(Context);

    const pathRef = useRef<ShapePath>(new ShapePath({d}))

    useEffect(() => {
        console.log(instance);
        pathRef.current.style = svgAttrToCanvas({stroke})
        if (instance?.containsView(pathRef.current)) {
            pathRef.current.d = d;
            instance.render();
        } else {
            instance?.addView(pathRef.current)
        }
        return () => {
            instance?.removeView(pathRef.current)
        }
    }, [d, stroke])

    return createElement(Fragment)
}
export default Path