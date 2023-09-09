import {createContext} from "react";
import View from "../shape/view";

export type ContextConfig = {
    instance: {
        add(view:View):void
        update(): void,
        removeChild(view:View):void
    }
}

const Context = createContext<ContextConfig>({
    instance: {
        add() {
        },
        update() {
        },
        removeChild() {
        }
    }
})
export default Context