import { CombinedTree, RandomForest, Node, Tree, Feature, CTNode } from "rf_shared";
import CTEdge from "rf_shared/src/ctedge.js";

export default class Combinator {
    /** @type {?RandomForest} */
    #rf
    /** @type {?Tree} */
    #curTree;
    /** @type {Node[]} */
    #curChain;
    /** @type {?CombinedTree} */
    #curCTree;
    /** @type {number} */
    #curLevel = 0;
    /**
     * 
     * @param {RandomForest} rf 
     */
    combine(rf) {
        this.#rf = rf;
        for (const tree of rf.trees) {
            this.#curChain = [];
            this.#curTree = tree;
            this.#curLevel = 0;
            this.#parseNode(tree.nodes[0]);
        }
    }

    /**
     * @param {Feature} feature
     * @returns {CTNode?}
     * */
    #findMatchInLayer(feature) {
        const layer = this.#curCTree.layers[this.#curLevel];
        for (const node of layer) {
            if (node.feature == feature) {
                return node;
            }
        }
        return null;
    }

    /** @returns {?CTNode} */
    getLastInChain() {
        if (this.#curChain.length === 0) return null;
        return this.#curChain[this.#curChain.length - 1];
    }

    /** @param {Node} node  */
    #parseNode(node) {
        const parent = this.getLastInChain();
        const rootNode = this.#curChain[0] ?? null;
        const isLeaf = node.target != null;

        if (rootNode == null) {
            let rootTree = this.#rf.combinedTrees.find(t => t.layers.at(0)?.at(0)?.feature == node.feature);
            if (rootTree != null) {
                this.#curCTree = rootTree
            } else {
                rootTree = new CombinedTree();
                this.#rf.addCombinedTree(rootTree);
                this.#curCTree = rootTree;
            }
        }

        /** @type {?CTNode[]} */
        let layer;
        /** @type {?CTNode} */
        let ctNode;
        if (isLeaf) {
            layer = this.#curCTree.leafLayer;
            ctNode = layer.find(n => n.target == node.target);
        } else {
            if (this.#curCTree.layers[this.#curLevel] == undefined) {
                this.#curCTree.layers[this.#curLevel] = [];
            }
            layer = this.#curCTree.layers[this.#curLevel];
            ctNode = this.#findMatchInLayer(node.feature);
        }

        if (ctNode == null) {
            ctNode = new CTNode();
            ctNode.level = this.#curLevel;
            ctNode.feature = node.feature;
            ctNode.target = node.target;
            this.#rf.addCTNode(ctNode);
            layer.push(ctNode);
        }
        ctNode.nodes.push(node);
        if (!ctNode.inTrees.includes(this.#curTree)) {
            ctNode.inTrees.push(this.#curTree);
        }
        if (parent != null) {
            let edge = this.#curCTree.edges.find(e => e.from == parent && e.to == ctNode);
            if (edge == null) {
                edge = new CTEdge(parent, ctNode);
                this.#rf.addCTEdge(edge);
                this.#curCTree.edges.push(edge);
                parent.outEdges.push(edge);
                ctNode.inEdges.push(edge);
            }
            if (!edge.inTrees.includes(this.#curTree)) {
                edge.inTrees.push(this.#curTree);
            }
        }

        if (!isLeaf) {
            this.#curLevel++;
            this.#curChain.push(ctNode);
            this.#parseNode(node.left);
            this.#parseNode(node.right);
            this.#curChain.pop();
            this.#curLevel--;
        }
    }
}