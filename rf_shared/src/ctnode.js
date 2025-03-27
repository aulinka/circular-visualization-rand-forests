import CTEdge from "./ctedge.js";
import Entity from "./entity.js";
import Feature from "./feature.js";
import Node from "./node.js";
import Target from "./target.js";
import Tree from "./tree.js";
import utils from "./utils.js";

export default class CTNode extends Entity {
  /** @type {?CTEdge[]} */
  inEdges = [];
  /** @type {?CTEdge[]} */
  outEdges = [];
  /** @type {number} */
  level;
  /** @type {?Feature} */
  feature;
  /** @type {?Target} */
  target;
  /** @type {Tree[]} */
  inTrees = [];
  /** @type {Node[]} */
  nodes = [];
  /** @type {number?} */
  averageFeatureThreshold;

  constructor() {
    super('ctnode');
  }

  /** @param {RandomForest} rf  */
  resolveReferences(rf) {
    utils.resolveReferences(rf, this, 'inEdges');
    utils.resolveReferences(rf, this, 'outEdges');
    utils.resolveReferences(rf, this, 'inTrees');
    utils.resolveReferences(rf, this, 'nodes');
    this.feature = rf.features.find(x => x.id == this.feature);
    this.target = rf.targets.find(x => x.id == this.target);
  }

  toJSON() {
    return {
      ...this,
      inEdges: this.inEdges.map(e => e.id),
      outEdges: this.outEdges.map(e => e.id),
      feature: this.feature?.id,
      target: this.target?.id,
      inTrees: this.inTrees.map(t => t.id),
      nodes: this.nodes.map(n => n.id),
    }
  }
}