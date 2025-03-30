import Feature from "./feature.js";
import Target from "./target.js";
import Entity from "./entity.js";
import Tree from "./tree.js";
import Node from "./node.js";
import CombinedTree from "./combined_tree.js";
import CTNode from "./ctnode.js";
import CTEdge from "./ctedge.js";
import utils from "./utils.js";

export default class RandomForest {
  info = {
    /** @type {?string} */
    type: null,
    /** @type {?string} */
    model: null,
    /** @type {?number} */
    testSize: null,
    /** @type {?number} */
    randomState: null,
    /** @type {?number} */
    accuracy: null,
  };

  /** @type {Feature[]} */
  features = [];
  /** @type {Target[]} */
  targets = [];

  /** @type {Entity[]} */
  entities = [];

  /** @type {Tree[]} */
  trees = [];

  /** @type {Node[]} */
  nodes = [];

  /** @type {?CombinedTree[]} */
  combinedTrees = [];

  constructor () {
  }

  /** @param {Tree} tree */
  addTree(tree) {
    tree.id = this.entities.length;
    this.entities.push(tree);
    this.trees.push(tree);
  }

  /** @param {Node} node */
  addNode(node) {
    node.id = this.entities.length;
    this.entities.push(node);
    this.nodes.push(node);
  }

  /** @param {CombinedTree} tree  */
  addCombinedTree(tree) {
    tree.id = this.entities.length;
    this.entities.push(tree);
    this.combinedTrees.push(tree);
  }

  /** @param {CTNode} node  */
  addCTNode(node) {
    node.id = this.entities.length;
    this.entities.push(node);
  }

  /** @param {CTEdge} edge  */
  addCTEdge(edge) {
    edge.id = this.entities.length;
    this.entities.push(edge);
  }

  toJSON() {
    return {
      ...this,
      trees: this.trees.map(t => t.id),
      nodes: this.nodes.map(n => n.id),
      combinedTrees: this.combinedTrees.map(t => t.id),
    };
  }

  /** @returns {?Entity} */
  getEntityById(id) {
    return this.entities.find(e => e.id == id);
  }

  static #getEntityClassByType(type) {
    switch (type) {
      case "node": return Node;
      case "tree": return Tree;
      case "ctree": return CombinedTree;
      case "ctnode": return CTNode;
      case "ctedge": return CTEdge;
      default: return null;
    }
  }

  static fromJSON(json) {
    const rf = new RandomForest();
    rf.features = json.features.map(f => Feature.fromJSON(f));
    rf.targets = json.targets.map(t => Target.fromJSON(t));
    for (const entityJson of json.entities) {
      const _Entity = this.#getEntityClassByType(entityJson.type);
      if (_Entity == null) { 
        console.error(`Entity ${entityJson.type} cannot be parsed from JSON`);
        continue;
      }
      const entity = _Entity.fromJSON(entityJson);
      rf.entities.push(entity);
    }
    for (const entity of rf.entities) {
      entity.resolveReferences(rf);
    }
    rf.trees = json.trees;
    rf.nodes = json.nodes;
    rf.combinedTrees = json.combinedTrees;
    rf.info = json.info;
    utils.resolveReferences(rf, rf, 'trees');
    utils.resolveReferences(rf, rf, 'nodes');
    utils.resolveReferences(rf, rf, 'combinedTrees');
    return rf;
  }
}