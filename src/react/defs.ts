import React, {createElement, Fragment, SVGAttributes, useContext, useState} from "react";
import type {FC, ReactNode, ReactElement} from "react";
import {createPortal} from "react-dom";
import {DefsContext, DefsContextConfig} from "./context";
import {useCreation} from "./hooks";

export interface FilterProps extends SVGAttributes<SVGElement> {
    children?: ReactNode
}

const SVGFactory = (name: string) => {
    return ({children, ...args}: FilterProps) => {
        return createElement(name, {...args}, children)
    }
}

const Filter: FC<FilterProps> = ({children, ...args}) => {
    const {} = useContext(DefsContext)
    return createElement("filter", {...args}, children)
}

export const SvgElement = {
    Animate: SVGFactory("animate"),
    //Circle: SVGFactory("Circle"),
    ClipPath: SVGFactory("clipPath"),
    //Defs: SVGFactory("defs"),
    Desc: SVGFactory("desc"),
    //Ellipse: SVGFactory("Ellipse"),
    FeBlend: SVGFactory("feBlend"),
    FeColorMatrix: SVGFactory("feColorMatrix"),
    FeComponentTransfer: SVGFactory("feComponentTransfer"),
    FeComposite: SVGFactory("feComposite"),
    FeConvolveMatrix: SVGFactory("feConvolveMatrix"),
    FeDiffuseLighting: SVGFactory("feDiffuseLighting"),
    FeDisplacementMap: SVGFactory("feDisplacementMap"),
    FeDistantLight: SVGFactory("feDistantLight"),
    FeDropShadow: SVGFactory("feDropShadow"),
    FeFlood: SVGFactory("feFlood"),
    FeFuncA: SVGFactory("feFuncA"),
    FeFuncB: SVGFactory("feFuncB"),
    FeFuncG: SVGFactory("feFuncG"),
    FeFuncR: SVGFactory("feFuncR"),
    FeGaussianBlur: SVGFactory("feGaussianBlur"),
    FeImage: SVGFactory("feImage"),
    FeMerge: SVGFactory("feMerge"),
    FeMergeNode: SVGFactory("feMergeNode"),
    FeMorphology: SVGFactory("feMorphology"),
    FeOffset: SVGFactory("feOffset"),
    FePointLight: SVGFactory("fePointLight"),
    FeSpecularLighting: SVGFactory("feSpecularLighting"),
    FeSpotLight: SVGFactory("feSpotLight"),
    FeTile: SVGFactory("feTile"),
    FeTurbulence: SVGFactory("feTurbulence"),
    Filter: Filter,
    ForeignObject: SVGFactory("foreignObject"),
    //G: SVGFactory("FeBlend"),
    Image: SVGFactory("image"),
    //Line: SVGFactory,
    LinearGradient: SVGFactory("linearGradient"),
    Marker: SVGFactory("marker"),
    Mask: SVGFactory("mask"),
    Metadata: SVGFactory("metadata"),
    //Path: SVGFactory,
    Pattern: SVGFactory("pattern"),
    //Polygon: SVGFactory("FeBlend"),
    //Polyline: SVGFactory,
    RadialGradient: SVGFactory("radialGradient"),
    //Rect: SVGFactory,
    Stop: SVGFactory("stop"),
    //Svg: SVGFactory,
    Switch: SVGFactory("switch"),
    //Symbol:SVGFactory("Symbol"),
    //Text: SVGFactory,
    //TextPath: SVGFactory,
    //Tspan: SVGFactory,
    //Use: SVGFactory("Use"),
    View: SVGFactory("view"),
}

export type DefsProps = {
    children: ReactNode
}

const Defs: FC<DefsProps> = ({children}) => {
    const defs = createElement('defs', {}, children)
    const svg = createPortal(
        createElement('svg',
            {
                xmlns: 'http://www.w3.org/2000/svg',
                style: {display: 'none'}
            },
            defs
        ),
        document.body)

    const value = useCreation<DefsContextConfig>(() => ({underDefs: true}), [])

    return value ? createElement(DefsContext.Provider, {value}, svg) : createElement(Fragment)
}
export default Defs