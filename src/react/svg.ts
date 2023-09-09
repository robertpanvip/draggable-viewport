import {createElement, useEffect, useRef, Fragment, useState} from "react";
import type {FC, ReactNode} from "react";
import Context, {ContextConfig} from "./context";
import CanvasManager from "../canvas";
import { useCreation } from "./hooks";

export interface SvgProps {
    children: ReactNode
    width?: number;
    height?: number
}

const Svg: FC<SvgProps> = ({children, width, height, ...rest}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const svgRef = useRef<CanvasManager>()
    const [mounted, setMounted] = useState<boolean>(false)

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
        instance: {
            add(view){
                svgRef.current!.addView(view);
                console.log(svgRef.current!.group);
            },
            update(){
                svgRef.current!.render()
            },
            removeChild(view){
                svgRef.current!.removeView(view)
            }
        }
    }), [svgRef.current])
    return value ? createElement(Context.Provider, {value}, canvasJsx) : createElement(Fragment)
}
export default Svg