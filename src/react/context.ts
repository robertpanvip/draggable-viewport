import React from "react";
import CanvasManager from "../canvas";

export type ContextConfig = {
    instance: CanvasManager | null
}
const Context = React.createContext<ContextConfig>({
    instance: null
})
export default Context