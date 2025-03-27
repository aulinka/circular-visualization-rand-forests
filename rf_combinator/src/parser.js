import { Feature, Node, RandomForest, Target, Tree } from "rf_shared";
import assert from 'assert';
import utils from "rf_shared/src/utils.js";

const NODE_IS_LEAF = -1;

export class Parser {
  #finalForest = new RandomForest();
  #forest = null;
  /** @type {?Tree} */
  #finalTree = null;
  #rawTree = null;

  constructor() {

  }

  parse(rfProcData) {
    this.#forest = JSON.parse(rfProcData);
    this.#finalForest = new RandomForest();

    this.#finalForest.info.model = this.#forest.config.model;
    this.#finalForest.info.randomState = this.#forest.config.random_state;
    this.#finalForest.info.testSize = this.#forest.config.test_size;
    this.#finalForest.info.accuracy = this.#forest.accuracy;

    for (const [ key, val ] of this.#forest.feature_names.entries()) {
      this.#finalForest.features.push(new Feature(parseInt(key), val));
    }
    for (const [ key, val ] of this.#forest.target_names.entries()) {
      this.#finalForest.targets.push(new Target(parseInt(key), val));
    }

    for (const [ id, tree ] of this.#forest.trees.entries()) {
      this.#parseTree(tree, id);
    }
    return this.#finalForest;
  }

  #parseTree(rawTree, treeId) {
    this.#rawTree = rawTree;
    const tree = new Tree();
    tree.uid = treeId;
    this.#finalTree = tree;
    this.#finalForest.addTree(tree);

    this.#parseNode(0, 0);
  }

  #parseNode(tid, depth) {
    const node = new Node();
    this.#finalForest.addNode(node);
    this.#finalTree.addNode(node);
    node.treeNodeId = tid;
    const isLeaf = this.#rawTree['children_left'][tid] == NODE_IS_LEAF;
    const isRootNode = depth == 0;
    node.depth = depth;
    node.values = this.#rawTree.values[tid][0];

    if (!isLeaf) {
      node.feature = this.#finalForest.features[this.#rawTree['features'][tid]];
      node.featureThreshold = this.#rawTree['threshold'][tid];

      node.left = this.#parseNode(this.#rawTree['children_left'][tid], depth + 1);
      node.left.parent = node;
      node.right = this.#parseNode(this.#rawTree['children_right'][tid], depth + 1);
      node.right.parent = node;
    } else {
      const targetId = node.values.indexOf(Math.max(...node.values));
      node.target = this.#finalForest.targets[targetId];
    }
    return node;
  }
}