import CTNode from "./ctnode.js";
import Entity from "./entity.js";
import Tree from "./tree.js";
import utils from "./utils.js";

export default class CTEdge extends Entity {
  /** @type {CTNode?} */
  from;
  /** @type {CTNode} */
  to;
  /** @type {Tree[]} */
  inTrees = [];
  /** @type {number?} */
  score;

  constructor(from, to) {
    super('ctedge');
    this.from = from;
    this.to = to;
  }

  /** @param {RandomForest} rf  */
  resolveReferences(rf) {
    utils.resolveReferences(rf, this, 'from');
    utils.resolveReferences(rf, this, 'to');
    utils.resolveReferences(rf, this, 'inTrees');
  }

  toJSON() {
    return {
      ...this,
      from: this.from?.id,
      to: this.to?.id,
      inTrees: this.inTrees.map(t => t.id),
    }
  }
}