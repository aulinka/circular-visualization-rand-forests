import { Feature } from "./feature.js";
import { Node } from "./node.js";

export class FeatureNode extends Node {
    constructor (nodeId, feature) {
        super(nodeId, 'feature');
        /** @type {Feature} */
        this.feature = feature;
    }

    toString() {
        return `${this.id} - ${this.feature.name}`;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            feature: this.feature.id,
        }
    }
}