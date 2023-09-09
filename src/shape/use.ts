import type {FC} from "react"
import {useContext, createElement, Fragment, cloneElement} from "react"
import type {SvgAttr} from "../interface";
import Context from "../react/context";

export interface UseProps extends Partial<SvgAttr> {
    xlinkHref: string
}

const Use: FC<UseProps> = ({xlinkHref, ...rest}) => {
    const {getDefsById} = useContext(Context);
    const id = xlinkHref.split('#')[1];
    const defs = getDefsById(id);
    const jsx = defs && cloneElement(defs, {
        ...defs.props,
        ...rest
    })
    return createElement(Fragment, {}, jsx)
}

export default Use