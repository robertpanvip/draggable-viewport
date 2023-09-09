import {createContext, createElement, Fragment} from "react";
import type  {ReactElement,} from "react";
import View from "../shape/view";

export type ContextConfig = {
    instance: {
        add(view: View): void
        update(): void,
        removeChild(view: View): void
    }
    setDefs(id: string, val: ReactElement): void,
    getDefsById(id: string): ReactElement,
}

const Context = createContext<ContextConfig>({
    setDefs: () => {
    },
    getDefsById: () => createElement(Fragment),
    instance: {
        add() {
        },
        update() {
        },
        removeChild() {
        }
    }
})

export type DefsContextConfig = {
    underDefs: boolean
}

export const DefsContext = createContext<DefsContextConfig>({underDefs: false})
export default Context