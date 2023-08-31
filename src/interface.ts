export type Scaling = {
    min: number, max: number
}
export type Scale = {
    sx: number, sy: number
}

export interface PointLike {
    x: number;
    y: number;
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
}

export interface RectangleLike {
    x: number
    y: number
    width: number
    height: number
}

export type Panning = undefined | boolean | ((target: Element) => boolean)
