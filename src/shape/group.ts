import {Events} from "../event";
import {Point} from "../interface";

type PrivateScope = {
    zIndex: number
}

const vm = new WeakMap<Group, PrivateScope>()

class Group extends Events {

    public children: Group[] = []

    public parent: Group | null = null

    public visible: boolean = true;

    constructor() {
        super();
        vm.set(this, {zIndex: 0,})
    }

    public get zIndex() {
        return vm.get(this)!.zIndex
    }

    public set zIndex(val: number) {
        vm.get(this)!.zIndex = val
    }

    public getChildren(): Group[] {
        return this.children.sort((a, b) => a.zIndex - b.zIndex)
    }

    addChild(child: Group) {
        child.parent = this;
        return this.children.push(child)
    }

    getChildAt(index: number) {
        return this.children != null && index >= 0 ? this.children[index] : null
    }

    removeChild(child: Group) {
        const index = this.children.indexOf(child)
        return this.removeChildAt(index)
    }

    removeChildAt(index: number) {
        const child = this.getChildAt(index)
        const children = this.children
        if (children != null && child != null) {
            child.remove()
        }
        return child
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
        let parent = this.parent
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
        return this.children.some(child => child.isPointContains(point))
    }

    getChildGroupByPoint(point: Point): Group | null {
        return [...this.children].reverse().find(child => child.isPointContains(point)) || null
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