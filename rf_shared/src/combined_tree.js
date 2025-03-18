import CTNode from "./ctnode.js";
import CTEdge from "./ctedge.js";
import Entity from "./entity.js";
import utils from "./utils.js";

export default class CombinedTree extends Entity {
  /** @type {CTNode[][]} */
  layers = [];
  /** @type {CTNode[]} */
  leafLayer = [];
  /** @type {CTEdge[]} */
  edges = [];

  constructor() {
    super('ctree');
  }

  /** @param {RandomForest} rf  */
  resolveReferences(rf) {
    this.layers = this.layers.map(l => l.map(n => rf.getEntityById(n)));
    utils.resolveReferences(rf, this, 'leafLayer');
    utils.resolveReferences(rf, this, 'edges');
  }

  toJSON() {
    return {
      ...this,
      layers: this.layers.map(l => l.map(n => n.id)),
      leafLayer: this.leafLayer.map(n => n.id),
      edges: this.edges.map(e => e.id),
    }
  }
}