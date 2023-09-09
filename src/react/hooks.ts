import {useRef, useMemo, useContext, useEffect, createElement} from "react";
import type {DependencyList, FC} from "react";
import {getSvgComputedStyle, svgAttrToCanvas} from "../utils/convert";
import Context, {DefsContext} from "./context";
import {CanvasEvent, SupportEvents, SvgAttr} from "../interface";
import View from "../shape/view";

function depsAreSame(oldDeps: DependencyList, deps: DependencyList) {
    if (oldDeps === deps) return true;
    for (let i = 0; i < oldDeps.length; i++) {
        if (!Object.is(oldDeps[i], deps[i])) return false;
    }
    return true;
}

export function useCreation<T>(factory: () => T, deps: DependencyList) {
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

const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'

const isFunction = function (value: Function) {
    return typeof value === 'function';
};
type noop = (this: any, ...args: any[]) => any;

type PickFunction<T extends noop> = (
    this: ThisParameterType<T>,
    ...args: Parameters<T>
) => ReturnType<T>;

export function useMemoizedFn<T extends noop>(fn: T) {
    if (isDev) {
        if (!isFunction(fn)) {
            console.error(`useMemoizedFn expected parameter is a function, got ${typeof fn}`);
        }
    }

    const fnRef = useRef<T>(fn);

    fnRef.current = useMemo(() => fn, [fn]);

    const memoizedFn = useRef<PickFunction<T>>();
    if (!memoizedFn.current) {
        memoizedFn.current = function (this, ...args) {
            return fnRef.current.apply(this, args);
        };
    }

    return memoizedFn.current as T;
}


export function useInstance<T extends object>(
    copy: { FC: FC<T>, props: T },
    style: Partial<SvgAttr>,
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
    }: Partial<SupportEvents>,
    init: () => View,
    deps: DependencyList
) {
    const _styles = getSvgComputedStyle(style || {})
    const {instance, setDefs} = useContext(Context);
    const defsContext = useContext(DefsContext);
    const ref = useRef<View>();
    if (!ref.current && style.id) {
        setDefs(style.id, createElement(copy.FC, {...copy.props}))
    }

    const dblClickListener = useMemoizedFn((e: CanvasEvent) => {
        return onDblClick?.(e)
    })
    const clickListener = useMemoizedFn((e: CanvasEvent) => {
        return onClick?.(e)
    })
    const contextMenuListener = useMemoizedFn((e: CanvasEvent) => {
        return onContextMenu?.(e)
    })
    const mouseMoveListener = useMemoizedFn((e: CanvasEvent) => {
        return onMouseMove?.(e)
    })
    const mouseEnterListener = useMemoizedFn((e: CanvasEvent) => {
        return onMouseEnter?.(e)
    })
    const mouseLeaveListener = useMemoizedFn((e: CanvasEvent) => {
        return onMouseLeave?.(e)
    })
    const dragStartListener = useMemoizedFn((e: CanvasEvent) => {
        return onDragStart?.(e)
    })
    const dragListener = useMemoizedFn((e: CanvasEvent) => {
        return onDrag?.(e)
    })
    const dragEndListener = useMemoizedFn((e: CanvasEvent) => {
        return onDragEnd?.(e)
    })
    if (!ref.current) {
        ref.current = init()
        ref.current!.addEventListener('dblclick', dblClickListener)
        ref.current!.addEventListener('click', clickListener)
        ref.current!.addEventListener('contextMenu', contextMenuListener)
        ref.current!.addEventListener('mouseMove', mouseMoveListener)
        ref.current!.addEventListener('mouseEnter', mouseEnterListener)
        ref.current!.addEventListener('mouseLeave', mouseLeaveListener)
        ref.current!.addEventListener('dragStart', dragStartListener)
        ref.current!.addEventListener('drag', dragListener)
        ref.current!.addEventListener('dragEnd', dragEndListener)
        ref.current!.style = svgAttrToCanvas(style || {})
    } else {
        ref.current.style = svgAttrToCanvas(style || {})
    }

    useEffect(() => {
        instance?.update()
    }, [
        ...deps,
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
        if (!defsContext.underDefs) {
            instance?.add(ref.current!)
        }
        return () => {
            ref.current?.removeEventListener('dblclick', dblClickListener)
            ref.current?.removeEventListener('click', clickListener)
            ref.current?.removeEventListener('contextMenu', contextMenuListener)
            ref.current?.removeEventListener('mouseMove', mouseMoveListener)
            ref.current?.removeEventListener('mouseEnter', mouseEnterListener)
            ref.current?.removeEventListener('mouseLeave', mouseLeaveListener)
            ref.current?.removeEventListener('dragStart', dragStartListener)
            ref.current?.removeEventListener('drag', dragListener)
            ref.current?.removeEventListener('dragEnd', dragEndListener)
            instance?.removeChild(ref.current!)
        }
    }, [])
}