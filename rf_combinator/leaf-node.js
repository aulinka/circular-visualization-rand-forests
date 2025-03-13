import { Clasz } from "./clasz.js";
import { Node } from "./node.js";

export class LeafNode extends Node {
    constructor (nodeId, clasz) {
        super(nodeId, 'leaf');
        /** @type {Clasz} */
        this.clasz = clasz;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            'class': this.clasz.id,
        }
    }
}