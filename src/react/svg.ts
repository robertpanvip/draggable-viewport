import {createElement, useEffect, useRef, Fragment, useState} from "react";
import type {FC, ReactNode, DependencyList} from "react";
import Context from "./context";
import CanvasManager from "../canvas";

export interface SvgProps {
    children: ReactNode
    width?: number;
    height?: number
}

function depsAreSame(oldDeps: DependencyList, deps: DependencyList) {
    if (oldDeps === deps) return true;
    for (let i = 0; i < oldDeps.length; i++) {
        if (!Object.is(oldDeps[i], deps[i])) return false;
    }
    return true;
}

function useCreation<T>(factory: () => T, deps: DependencyList) {
    const current = useRef<{
        deps: DependencyList,
        obj?: T,
        initialized: boolean
    }>({
        deps: deps,
        obj: undefined,
        initialized: false
    }).current;
    if (current.initialized === false || !depsAreSame(current.deps, deps)) {
        current.deps = deps;
        current.obj = factory();
        current.initialized = true;
    }
    return current.obj;
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
    const value = useCreation(() => ({
        get instance() {
            return svgRef.current || null
        }
    }), [svgRef.current])
    return value ? createElement(Context.Provider, {value}, canvasJsx) : createElement(Fragment)
}
export default Svg