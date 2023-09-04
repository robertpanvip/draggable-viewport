import {MouseMove, MouseEnter, MouseLeave, DragStart, Drag, DragEnd, Click, DblClick, ContextMenu} from './const'
import Group from "./shape/group";

export type Scaling = {
    min: number, max: number
}
export type Scale = {
    sx: number, sy: number
}

export interface PointLike {
    x: number;
    y: number;

    [key: string]: any
}

export type Point = {
    x: number,
    y: number
}

export interface Rotation {
    angle: number
    cx?: number
    cy?: number
}

export interface MatrixLike {
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
    f: number;
}

export interface Translation {
    tx: number;
    ty: number;
}

export interface Options {
    scaling?: Scaling;
    minScale?: number,
    maxScale?: number,
    panning?: Panning,
}

export interface SVGManagerOptions extends Options {
    svg: SVGSVGElement;
    viewport: SVGGElement;
}

export interface CanvasManagerOptions extends Options {
    viewport: HTMLCanvasElement;
    grid?: boolean,
    axis?: boolean
}

export interface RectangleLike {
    x: number
    y: number
    width: number
    height: number
}

export type Panning = undefined | boolean | ((target: Element) => boolean)

export interface CanvasEvent extends Point {
    srcElement: Group | null;
    eventName: string;

    stopPropagation(): void
}

export type EventName =
    typeof DblClick |
    typeof Click |
    typeof ContextMenu |
    typeof MouseMove
    | typeof MouseEnter
    | typeof MouseLeave
    | typeof DragStart
    | typeof Drag
    | typeof DragEnd;

export type ViewStyle = {
    cursor: string;

    fillStyle: string | CanvasGradient | CanvasPattern;
    strokeStyle: string | CanvasGradient | CanvasPattern,

    lineCap: CanvasLineCap;
    lineDashOffset: number
    lineJoin: CanvasLineJoin;
    lineWidth: number;
    miterLimit: number;

    filter: string;

    shadowBlur: number;
    shadowColor: string;
    shadowOffsetX: number;
    shadowOffsetY: number;

    globalAlpha: number;
    globalCompositeOperation: GlobalCompositeOperation;
}

export type SvgAttr={
    fill:string;
    fillRule:string;
    stroke:string;
    strokeDasharray:string;
    strokeDashoffset:string;
    strokeLinecap:string;
    strokeLinejoin:string;
    strokeMiterlimit:string;
    strokeWidth:string;
}