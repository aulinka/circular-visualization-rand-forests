import Entity from "./entity.js";
import utils from "./utils.js";

export default class Tree extends Entity {
  /** @type {number} */
  uid;

  /** @type {Node[]} */
  nodes = [];

  constructor() {
    super('tree');
  }

  addNode(node) {
    this.nodes.push(node);
  }

  /** @param {RandomForest} rf  */
  resolveReferences(rf) {
    utils.resolveReferences(rf, this, 'nodes');
  }

  toJSON() {
    return {
      ...this,
      nodes: this.nodes.map(n => n.id)
    }
  }
}