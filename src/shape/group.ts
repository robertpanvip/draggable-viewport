import {Events} from "../event";
import {Point} from "../interface";
import type View from "./view";

type PrivateScope = {
    zIndex: number,
}

const vm = new WeakMap<Group, PrivateScope>()

class Group extends Events {
    public id: string = Math.floor((Math.random() * 1000000)).toString()

    public children: Group[] = []

    public parent: Group | null = null

    public visible: boolean = true;

    constructor() {
        super();
        vm.set(this, {zIndex: 0})
    }

    public get zIndex() {
        return vm.get(this)!.zIndex
    }

    public set zIndex(val: number) {
        vm.get(this)!.zIndex = val
    }

    public isView(): this is View {
        return false
    }

    public getChildren(): Group[] {
        return this.children.sort((a, b) => a.zIndex - b.zIndex)
    }

    addChild(child: Group) {
        child.parent = this;
        this.children.push(child);
        return this;
    }

    getChildAt(index: number) {
        return this.children != null && index >= 0 ? this.children[index] : null
    }

    removeChild(child: Group) {
        const index = this.children.indexOf(child)
        return this.removeChildAt(index)
    }

    removeChildAt(index: number) {
        this.children = this.children.splice(index, 1)
        return this
    }

    remove() {
        const parent = this.parent
        if (parent) {
            parent.removeChild(this)
        }
        return this
    }

    getAncestors(options: { deep?: boolean } = {}): Group[] {
        const ancestors: Group[] = []
        let parent = this.parent;
        while (parent) {
            ancestors.push(parent)
            parent = options.deep !== false ? parent.parent : null
        }
        return ancestors
    }

    getDescendants(options: { deep?: boolean } = {}): Group[] {
        if (options.deep !== false) {
            const cells = this.getChildren() || []
            cells.forEach((cell) => {
                cells.push(...cell.getDescendants(options))
            })
            return cells
        }

        return this.getChildren() || []
    }

    isChildOf(parent: Group | null): boolean {
        return parent != null && this.parent === parent
    }

    isDescendantOf(
        ancestor: Group | null,
        options: { deep?: boolean } = {},
    ): boolean {
        if (ancestor == null) {
            return false
        }

        if (options.deep !== false) {
            let current = this.parent
            while (current) {
                if (current === ancestor) {
                    return true
                }
                current = current.parent
            }

            return false
        }

        return this.isChildOf(ancestor)
    }

    isAncestorOf(
        descendant: Group | null,
        options: { deep?: boolean } = {},
    ): boolean {
        if (descendant == null) {
            return false
        }
        return descendant.isDescendantOf(this, options)
    }

    contains(cell: Group | null) {
        return this.isAncestorOf(cell)
    }

    isPointContains(point: Point): boolean {
        return false
        //return this.children.some(child => child.isPointContains(point))
    }

    getChildGroupByPoint(point: Point): Group | null {
        return [...this.children].reverse().find(child => child.isPointContains(point)) || null
    }

    getSrcElement(point: Point): Group | null {
        let srcEle = null;

        const loop = (ele: Group): boolean => {
            const contains = ele.isPointContains(point);

            if (contains) {
                srcEle = ele;
                return true;
            }

            const children = ele.getChildren();
            for (const child of children) {

                const found = loop(child);
                if (found) {
                    return true;
                }
            }

            return false;
        };
        loop(this!);
        return srcEle;
    }

    moveElementToEnd(element: Group) {
        const children = this.children;
        let index = children.indexOf(element);

        if (index !== -1) {
            children.splice(index, 1);
            children.push(element);
        }
        this.children = children;

        return children;
    }

    render() {
        this.getChildren().forEach(child => {
            child.render()
        })
    }
}

export default Group