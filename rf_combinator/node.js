
export class Node {
    constructor(nodeId, type) {
        this.id = nodeId;
        this.type = type;
        /** @type {Node[]} */
        this.children = [];
        /** @type {Node?} */
        this.parent = null;
        /** @type {Node[]?} */
        this.parents = null;
        /** @type {Node?} */
        this.rootNode = null;
    }

    toJSON() {
        return {
            id: this.id,
            type: this.type,
            children: this.children.map(ch => ch.id),
            parent: this.parent?.id ?? null,
            parents: this.parents?.map(ch => ch.id),
            rootNode: this.rootNode?.id ?? null
        }
    }
}