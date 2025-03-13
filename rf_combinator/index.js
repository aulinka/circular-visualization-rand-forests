import fs from 'fs/promises';
import { Feature } from './feature.js';
import { Clasz } from './clasz.js';
import { FeatureNode } from './feature-node.js';
import assert from 'assert';
import { LeafNode } from './leaf-node.js';

class RootTree {
    constructor (feature) {
        /** @type {Feature} */
        this.feature = feature;
        /** @type {Node?} */
        this.rootNode = null;
        /** @type {Object.<number, FeatureNode[]>} */
        this.layers = {};
        /** @type {LeafNode[]} */
        this.leafLayer = [];
    }

    toJSON() {
        const layers = {};
        for (const [ layerId, layer ] of Object.entries(this.layers)) {
            const larr = [];
            for (const node of layer) {
                larr.push(node.id);
            }
            layers[layerId] = larr;
        }
        const leafLayer = [];
        for (const leaf of this.leafLayer) {
            leafLayer.push(leaf.id);
        }
        return {
            rootNode: this.rootNode.id,
            layers,
            leafLayer,
        }
    }
}

class Combinator {
    constructor () {
        this._forest = null;
        /** @type {Feature[]} */
        this._features = [];
        /** @type {Clasz[]} */
        this._classes = [];
    
        this._curLevel = 0;
        this._curTree = null;
        /** @type {FeatureNode[]} */
        this._curChain = [];

        this._nid = 0;

        /** @type {FeatureNode[]} */
        this._nodes = [];

        // /** @type {Object.<number, FeatureNode[]>} */
        // this._layers = {};
        
        /** @type {RootTree[]} */
        this._rootTrees = [];

        /** @type {RootTree} */
        this._curRootTree = null

        // /** @type {LeafNode[]} */
        // this._leafLayer = [];
    }

    /** @returns {FeatureNode?} */
    getLastInChain() {
        if (this._curChain.length === 0) return null;
        return this._curChain[this._curChain.length - 1];
    }

    getFeatureById(id) {
        return this._features.find(f => f.id == id);
    }

    getClassById(id) {
        return this._classes.find(f => f.id == id);
    }

    /**
     * @param {Feature} feature
     * @returns {FeatureNode?}
     * */
    findMatchInLayer(feature) {
        const layer = this._curRootTree.layers[this._curLevel];
        mainLoop: for (const featNode of layer) {
            if (featNode.feature == feature) {
                // let _chainNode = this._curChain[this._curChain.length - 1];
                // let _featNode = featNode.parent;
                // while (_chainNode != null && _featNode != null) {
                //     if (_chainNode.feature != _featNode.feature) {
                //         continue mainLoop;
                //     }
                //     _chainNode = _chainNode.parent;
                //     _featNode = _featNode.parent;
                // }
                return featNode;
            }
        }
        return null;
    }

    parseNode(childId) {
        const parent = this.getLastInChain();
        const rootNode = this._curChain[0] ?? null;
        if (this._curTree.feature[childId] == -2) {
            const values = this._curTree.values[childId][0];
            let bestIndex = -1;
            let bestValue = 0;
            for (const i in values) {
                if (bestValue < values[i]) {
                    bestIndex = i;
                    bestValue = values[i];
                }
            }
            const clasz = this.getClassById(bestIndex);
            let leaf = this._curRootTree.leafLayer.find(l => (l.rootNode === rootNode && l.clasz.id == clasz.id));
            if (leaf == null) {
                leaf = new LeafNode(this._nid++, clasz);
                leaf.rootNode = rootNode;
                leaf.parents = [ ];
                this._nodes.push(leaf);
                this._curRootTree.leafLayer.push(leaf);    
            }
            if (!leaf.parents.includes(parent)) {
                leaf.parents.push(parent);
            }
            if (!parent.children.includes(leaf)) {
                parent.children.push(leaf);
            }
            return;
        }

        const feature = this.getFeatureById(this._curTree.feature[childId]);
        if (rootNode == null) {
            let rootTree = this._rootTrees.find(t => t.feature == feature);
            if (rootTree != null) {
                this._curRootTree = rootTree;
            } else {
                rootTree = new RootTree(feature);
                this._rootTrees.push(rootTree);
                this._curRootTree = rootTree;
            }
        }

        if (this._curRootTree.layers[this._curLevel] == undefined) {
            this._curRootTree.layers[this._curLevel] = [];
        }
        const layer = this._curRootTree.layers[this._curLevel];
        let node = this.findMatchInLayer(feature);
        // assert(!(parent != null && node != null && node.parent != null && node.parent.id !== parent.id));

        if (node === null) {
            node = new FeatureNode(this._nid++, feature);
            node.parent = parent;
            node.rootNode = rootNode;
            layer.push(node);
            this._nodes.push(node);
            if (rootNode == null && this._curRootTree.rootNode == null) {
                this._curRootTree.rootNode = node;
            }
        }
        if (parent != null && !parent.children.includes(node)) {
            parent.children.push(node);
        }

        this._curLevel++;
        this._curChain.push(node);
        if (this._curTree.children_left[childId] != -1) this.parseNode(this._curTree.children_left[childId]);
        if (this._curTree.children_right[childId] != -1) this.parseNode(this._curTree.children_right[childId]);
        this._curChain.pop();
        this._curLevel--;
    }

    async parseForest(forest) {
        this._forest = forest;

        for (const featureId in this._forest.feature_names) {
            this._features.push(new Feature(parseInt(featureId), this._forest.feature_names[featureId]));
        }
        for (const classId in this._forest.class_names) {
            this._classes.push(new Clasz(parseInt(classId), this._forest.class_names[classId]));
        }

        for (const tree of forest.trees) {
            this._curLevel = 0;
            this._curTree = tree;
            this._curChain = [];
            this.parseNode(0);
        }
    }

    serialize() {
        const nodes = [];
        for (const node of this._nodes) {
            nodes.push(node.toJSON());
        }
        const features = this._features;
        const classes = this._classes;
        // const leaves = [];
        // for (const leaf of this._leafLayer) {
        //     leaves.push(leaf.id);
        // }
        // const layers = {};
        // for (const [ layerId, layer ] of Object.entries(this._layers)) {
        //     const larr = [];
        //     for (const node of layer) {
        //         larr.push(node.id);
        //     }
        //     layers[layerId] = larr;
        // }
        const trees = []
        let layersCount = 0;
        for (const tree of this._rootTrees) {
            trees.push(tree.toJSON());
            layersCount = Math.max(Object.keys(tree.layers).length, layersCount);
        }
        

        return {
            layersCount,
            classes,
            features,
            nodes,
            trees,
        };
    }
}

async function main() {
    const com = new Combinator();
    com.parseForest(JSON.parse(await fs.readFile('../rf_circular_visualization/data.json')));
    await fs.writeFile('tree.json', JSON.stringify(com.serialize(), null, 2));
}

main();