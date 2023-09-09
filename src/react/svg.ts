import {createElement, useEffect, useRef, Fragment, useState} from "react";
import type {FC, ReactNode, ReactElement} from "react";
import Context, {ContextConfig} from "./context";
import CanvasManager from "../canvas";
import {useCreation} from "./hooks";

export interface SvgProps {
    children: ReactNode
    width?: number;
    height?: number
}

const Svg: FC<SvgProps> = ({children, width, height, ...rest}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const svgRef = useRef<CanvasManager>()
    const [mounted, setMounted] = useState<boolean>(false)

    const defs = useRef<{ [key: string]: ReactElement }>({})

    useEffect(() => {
        svgRef.current = new CanvasManager({
            viewport: canvasRef.current!,
            grid: true,
            axis: true
        })
        svgRef.current.startListening()
        setMounted(true)
        return () => {
            svgRef.current?.stopListening()
        }
    }, [])

    const canvasJsx = createElement('canvas', {ref: canvasRef, width, height}, mounted && children)
    const value = useCreation<ContextConfig>(() => ({
        setDefs(id, val) {
            defs.current[id] = val;
        },
        getDefsById(id) {
            return defs.current[id]
        },
        instance: {

            add(view) {
                svgRef.current!.addView(view);
            },
            update() {
                svgRef.current!.render()
            },
            removeChild(view) {
                svgRef.current!.removeView(view)
            }
        }
    }), [svgRef.current])
    return value ? createElement(Context.Provider, {value}, canvasJsx) : createElement(Fragment)
}
export default Svg