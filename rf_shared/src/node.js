import Entity from "./entity.js";
import Feature from "./feature.js";
import RandomForest from "./random_forest.js";
import Target from "./target.js";
import utils from "./utils.js";

export default class Node extends Entity {
  /** @type {number} */
  treeNodeId;
  /** @type {?Node} */
  left;
  /** @type {?Node} */
  right;
  /** @type {?Node} */
  parent;
  /** @type {?Feature} */
  feature;
  /** @type {?number} */
  featureThreshold;
  /** @type {?Target} */
  target;
  /** @type {number} */
  depth;
  /** @type {?Object.<number,number>} */
  values;

  constructor() {
    super('node');
  }

  /** @param {RandomForest} rf  */
  resolveReferences(rf) {
    utils.resolveReferences(rf, this, 'left');
    utils.resolveReferences(rf, this, 'right');
    utils.resolveReferences(rf, this, 'parent');
    this.feature = rf.features.find(x => x.id == this.feature);
    this.target = rf.targets.find(x => x.id == this.target);
  }

  toJSON() {
    return {
      ...this,
      left: this.left?.id,
      right: this.right?.id,
      parent: this.parent?.id,
      feature: this.feature?.id,
      target: this.target?.id,
    }
  }
}