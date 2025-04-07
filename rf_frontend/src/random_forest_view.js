import { Layer } from "konva/lib/Layer.js";
import { setOnUnfocus, stage, unfocus } from "./stage.js";
import { CombinedTree, CTEdge, CTNode, Entity, Node, RandomForest } from "rf_shared";
import { app } from "./app.js";
import { calculateAngle, lerp, radToDeg, seededRandom } from "./utils.js";
import { Arc } from "konva/lib/shapes/Arc.js";
import Konva from "konva";
import { selectedEdge, selectedNode } from "./ui/uiState.svelte.js";

export class RandomForestView {
  #config = {};
  /** @type {?CombinedTree} */
  #targetCTree;
  /** @type {RandomForest} */
  #rf;

  #segments;
  #layerRadius;
  #centerX;
  #centerY;

  /** @type {boolean} */
  #isSingleTreeView;

  #totalLayersCount;

  /**
   * @typedef UiRfMapObject
   * @type {object}
   * @property {Konva.Node} uiNode
   * @property {Entity} rfEntity
   */

  /** @type {UiRfMapObject[]} */
  #uiRfMap;
  
  /** @type {Object.<string,Layer?>} */
  #layers = {
    "crosshair": null,
    "edges": null,
    "nodes": null
  };

  constructor(config) {
    this.#config = config;
    this.#targetCTree = config?.targetRootNode;
    this.#isSingleTreeView = this.#targetCTree != null;
  }

  /**
   * 
   * @param {Entity} entity 
   * @param {*} uiNodeType 
   */
  findUiNodeByRfEntity(entity, uiNodeType) {
    return this.#uiRfMap.find(e => e.rfEntity == entity && (e.uiNode instanceof uiNodeType))?.uiNode;
  }

  findRfEntityByUiNode(uiNode) {
    return this.#uiRfMap.find(e => e.uiNode == uiNode)?.rfEntity;
  }

  #generateCrosshair() {
    if (this.#targetCTree == null) {
      this.#layers.crosshair.add(new Konva.Circle({
        x: this.#centerX,
        y: this.#centerY,
        radius: 5,
        fill: 'black'
      }));
    }

    let layersCount = 0;
    if (!this.#isSingleTreeView || true) {
      for (const tree of this.#rf.combinedTrees) {
        layersCount = Math.max(tree.layers.length, layersCount);
      }
      layersCount += 1;
    } else {
      layersCount = this.#targetCTree.layers.length;
    }
    this.#totalLayersCount = layersCount;
    const treeRadius = (layersCount * this.#layerRadius);

    for (let i = 0; i < layersCount; i++) {
      this.#layers.crosshair.add(new Konva.Circle({
        x: this.#centerX,
        y: this.#centerY,
        radius: ((i + 1) * this.#layerRadius),
        stroke: 'black',
        strokeWidth: 1,
        dash: [10,5],
        dashEnabled: (i != layersCount-1)
      }));
    }

    this.#segments = [];
    if (!this.#isSingleTreeView) {
      const treesCount = this.#rf.combinedTrees.length;
      const segmentSize = ((Math.PI*2) / (treesCount))
      for (let i = 0; i < treesCount; i++) {
        const angle = (i * segmentSize); // + (Math.PI/2);
        const x = Math.cos(angle) * treeRadius;
        const y = Math.sin(angle) * -treeRadius;
        const line = new Konva.Line({
          points: [this.#centerX, this.#centerY, this.#centerX + x, this.#centerY + y],
          stroke: 'black',
          strokeWidth: 1
        });
        this.#layers.crosshair?.add(line);
        const arc = new Arc({
          x: this.#centerX,
          y: this.#centerY,
          innerRadius: 0,
          outerRadius: this.#layerRadius,
          angle: radToDeg(segmentSize),
          fill: 'rgba(255, 124, 124, 1.0)',
          rotation: radToDeg(angle),
          opacity: 0.3,
        });
        this.#layers.edges?.add(arc);
        this.#segments.push({angle, segmentSize});
      }
    }
  }

  /**
   * 
   * @param {CTEdge} edge 
   */
  #generateEdge(edge) {
    const isLeaf = edge.to.target != null;
    const fromNode = this.findUiNodeByRfEntity(edge.from, Konva.Rect);
    const toNode = this.findUiNodeByRfEntity(edge.to, Konva.Rect);
    const fromPos = fromNode?.getPosition() ?? {x: this.#centerX, y: this.#centerY};
    const toPos = toNode.getPosition();

    const treesCount = this.#rf.trees.length;
    const score = edge.score;

    const coords = [fromPos.x, fromPos.y, toPos.x, toPos.y];
    const line = new Konva.Line({
      points: coords,
      stroke: isLeaf ? 'purple' : '#ffb347',
      strokeWidth: lerp(0.5, 10, score ?? 0.1)
    });

    const midX = lerp(fromPos.x, toPos.x, 0.5);
    const midY = lerp(fromPos.y, toPos.y, 0.5);
    const rot = calculateAngle(fromPos.x, fromPos.y, toPos.x, toPos.y);

    const text = new Konva.Text({
      align: 'center',
      verticalAlign: 'middle',
      text: `${(score).toFixed(2)}`,
      // width: 'auto',
      // height: 20,
      x: midX,
      y: midY,
      // offsetX: 50,
      // offsetY: 10,
      fontSize: 16,
      fontFamily: 'Calibri',
      fill: 'black',
      rotation: rot,
    });
    text.offsetX(text.width()/2);
    text.offsetY(text.height()/2);

    this.#layers.edges.add(line);
    this.#layers.edges.add(text);
    this.#uiRfMap.push({uiNode: line, rfEntity: edge});
    this.#uiRfMap.push({uiNode: text, rfEntity: edge});
  }

  /**
   * 
   * @param {number} nodeIndex 
   * @param {CTNode} node 
   * @param {CTNode[]} layer 
   * @param {number} partOffset 
   * @param {number} distance 
   * @param {number} angleStart 
   */
  #generateNode(nodeIndex, node, layer, partOffset, distance, angleStart) {
    const isLeaf = node.feature == null;
    const nodeId = node.id;
    let angle = partOffset * (parseInt(nodeIndex)+1);
    const randomAngleOffsetRatio = 0.05;
    angle += (seededRandom(nodeId) * randomAngleOffsetRatio) - (randomAngleOffsetRatio / 2);
    
    const x = Math.cos(angleStart + angle) * distance;
    const y = Math.sin(angleStart + angle) * -distance;
    
    let rot = (450 - radToDeg(angleStart + angle)) % 360;
    if (this.#isSingleTreeView && node.level == 0) rot = 0;
    const text = new Konva.Text({
      x: this.#centerX + x,
      y: this.#centerY + y,
      width: 50,
      height: 30,
      text: isLeaf ? node.target.name : node.feature.name,
      rotation: rot,
      align: 'center',
      verticalAlign: 'middle',
      fontSize: 10,
    });

    const width = text.width();
    const height = text.height();
    text.offsetX(width/2);
    text.offsetY(height/2);

    const rect = new Konva.Rect({
      x: this.#centerX + x,
      y: this.#centerY + y,
      width: width,
      height: height,
      offsetX: width/2,
      offsetY: height/2,
      rotation: rot,
      cornerRadius: 10,
      fill: isLeaf ? 'rgba(152, 251, 152, 1)' : '#7ba7cc',
      stroke: 'black',
      strokeWidth: 1,
    });
    this.#layers.nodes.add(rect);
    this.#layers.nodes.add(text);

    this.#uiRfMap.push({uiNode: rect, rfEntity: node});
    this.#uiRfMap.push({uiNode: text, rfEntity: node});

    if (!(this.#isSingleTreeView && node.level == 0)) {
      for (const edge of node.inEdges) {
        this.#generateEdge(edge);
      }
    }
  }

  /**
   * 
   * @param {CombinedTree} tree 
   * @param {*} angleStart 
   * @param {*} angleSize 
   */
  #generateTree(tree, angleStart, angleSize) {
    const treeLayersCount = tree.layers.length;
    const startOffset = this.#isSingleTreeView ? 1 : 1;
    for (let i = 0; i < treeLayersCount; i++) {
      const layer = tree.layers[i];
      const distance = ((i + startOffset) * this.#layerRadius);

      const partOffset = angleSize / (layer.length + startOffset);
      for (const nodeIndex in layer) {
        const node = layer[nodeIndex];
        this.#generateNode(nodeIndex, node, layer, partOffset, distance, angleStart);
      }
    }
    {
      const layer = tree.leafLayer;
      const distance = ((this.#totalLayersCount) * this.#layerRadius);
      const partOffset = angleSize / (layer.length + startOffset);
      for (const nodeIndex in layer) {
        const node = layer[nodeIndex];
        this.#generateNode(nodeIndex, node, layer, partOffset, distance, angleStart);
      }
    }
  }

  #generateTrees() {
    if (this.#isSingleTreeView) {
      this.#generateTree(this.#targetCTree, 0, Math.PI);
    } else {
      let i = 0;
      for (const segmentInfo of this.#segments) {
        this.#generateTree(this.#rf.combinedTrees[i++], segmentInfo.angle, segmentInfo.segmentSize);
      }
    }
  }

  init() {
    this.#uiRfMap = [];
    this.#layerRadius = 140;
    this.#centerX = stage.width() / 2;
    this.#centerY = stage.height() / 2;
    this.#rf = app.getRandomForest();
    this.#layers.crosshair = new Layer({
      listening: false
    });
    this.#layers.nodes = new Layer();
    this.#layers.nodes.on('click', e => this.#onNodeClick(e));
    this.#layers.edges = new Layer();
    this.#layers.edges.on('click', e => this.#onEdgeClick(e));
    this.#generateCrosshair();
    this.#generateTrees();
  }

  /**
   * 
   * @param {import("konva/lib/Node.js").KonvaEventObject<MouseEvent, Layer>} e 
   */
  #onNodeClick(e) {
    /** @type {?Konva.Text} */
    let uiNode = e.target;
    if (uiNode instanceof Konva.Arc) {
      e.cancelBubble = false;
    } else {
      unfocus();
      const ctNode = this.findRfEntityByUiNode(uiNode);
      uiNode?.fill('red');
      selectedNode.set(ctNode);
      e.cancelBubble = true;
      setOnUnfocus(() => {
        uiNode.fill('black');
        selectedNode.set(null);
      });
    }
  }

  /**
   * 
   * @param {import("konva/lib/Node.js").KonvaEventObject<MouseEvent, Layer>} e 
   */
  #onEdgeClick(e) {
    unfocus();
    let uiNode = e.target;
    const ctEdge = this.findRfEntityByUiNode(uiNode);
    if (uiNode instanceof Konva.Text) {
      uiNode = this.findUiNodeByRfEntity(ctEdge, Konva.Line);
    }
    const defaultStroke = uiNode.stroke();
    uiNode.stroke('red');
    selectedEdge.set(ctEdge);
    setOnUnfocus(() => {
      uiNode.stroke(defaultStroke);
      selectedEdge.set(null);
    });
    e.cancelBubble = true;
  }

  deinit() {
    for (const key of Object.keys(this.#layers)) {
      if (this.#layers[key] != null) {
        this.#layers[key]?.destroy();
        this.#layers[key] = null;
      }
    }
  }

  onEnter() {
    for (const layer of Object.values(this.#layers)) {
      if (layer != null) {
        stage.add(layer);
      }
    }
  }

  onExit() {
    for (const layer of Object.values(this.#layers)) {
      if (layer != null) {
        layer.remove();
      }
    }
  }
}