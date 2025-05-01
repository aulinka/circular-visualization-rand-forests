import { Layer } from "konva/lib/Layer.js";
import { setOnUnfocus, stage, unfocus } from "./stage.js";
import { CombinedTree, CTEdge, CTNode, Entity, Node, RandomForest } from "rf_shared";
import { app } from "./app.js";
import { calculateAngle, lerp, radToDeg, seededRandom } from "./utils.js";
import { Arc } from "konva/lib/shapes/Arc.js";
import Konva from "konva";
import * as uiState from "./ui/uiState.svelte.js";
import { get } from "svelte/store";

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
    "conCircle": null,
    "edges": null,
    "nodes": null
  };

  #treeEdgeScoreBounds = { min: 0.0, max: 0.0 };

  constructor(config) {
    this.#config = config;
    this.#targetCTree = config?.targetRootNode;
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

  #generateConCircle() {
    if (this.#targetCTree == null) {
      this.#layers.conCircle.add(new Konva.Circle({
        x: this.#centerX,
        y: this.#centerY,
        radius: 5,
        fill: 'black'
      }));
    }

    let layersCount = 0;
    for (const tree of this.#rf.combinedTrees) {
      layersCount = Math.max(tree.layers.length, layersCount);
    }
    layersCount += 1;

    this.#totalLayersCount = layersCount;
    const treeRadius = (layersCount * this.#layerRadius);

    for (let i = 0; i < layersCount; i++) {
      this.#layers.conCircle.add(new Konva.Circle({
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
        this.#layers.conCircle?.add(line);
        const arc = new Arc({
          x: this.#centerX,
          y: this.#centerY,
          innerRadius: 0,
          outerRadius: this.#layerRadius,
          angle: radToDeg(segmentSize),
          fill: 'rgba(255, 124, 124, 1.0)',
          rotation: radToDeg((Math.PI*2) - angle - segmentSize),
          opacity: 0.0,
        });
        this.#layers.edges?.add(arc);
        this.#uiRfMap.push({uiNode: arc, rfEntity: this.#rf.combinedTrees[i]});
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
    const alignedScore = Math.max(0.0, (edge.score - this.#treeEdgeScoreBounds.min) / (this.#treeEdgeScoreBounds.max - this.#treeEdgeScoreBounds.min));

    const coords = [fromPos.x, fromPos.y, toPos.x, toPos.y];
    const line = new Konva.Line({
      points: coords,
      stroke: isLeaf ? 'purple' : '#ffb347',
      // strokeWidth: lerp(1, 10, score)
      strokeWidth: lerp(3, 8, alignedScore)
    });

    const midX = lerp(fromPos.x, toPos.x, 0.5);
    const midY = lerp(fromPos.y, toPos.y, 0.5);
    const rot = calculateAngle(fromPos.x, fromPos.y, toPos.x, toPos.y);

    const text = new Konva.Text({
      align: 'center',
      verticalAlign: 'middle',
      text: `${(score).toFixed(3)}`,
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
      width: 60,
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
    this.#treeEdgeScoreBounds.min = 2.0;
    this.#treeEdgeScoreBounds.max = 0.0;

    for (const edge of tree.edges) {
      this.#treeEdgeScoreBounds.min = Math.min(this.#treeEdgeScoreBounds.min, edge.score);
      this.#treeEdgeScoreBounds.max = Math.max(this.#treeEdgeScoreBounds.max, edge.score);
    }

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
      this.#generateTree(this.#targetCTree ?? this.#rf.combinedTrees[0], 0, Math.PI);
    } else {
      let i = 0;
      for (const segmentInfo of this.#segments) {
        this.#generateTree(this.#rf.combinedTrees[i++], segmentInfo.angle, segmentInfo.segmentSize);
      }
    }
  }

  init() {
    this.#layerRadius = 140;
    this.#centerX = stage.width() / 2;
    this.#centerY = stage.height() / 2;
    this.#rf = app.getRandomForest();
    this.#layers.conCircle = new Layer({
      listening: false
    });
    this.#layers.nodes = new Layer();
    this.#layers.nodes.on('click', e => this.#onNodeClick(e));
    this.#layers.edges = new Layer();
    this.#layers.edges.on('click', e => this.#onEdgeClick(e));
    this.#render();

    this.#zoomTheView();
  }

  #render() {
    this.#isSingleTreeView = this.#targetCTree != null || this.#rf.combinedTrees.length == 1;
    this.#uiRfMap = [];
    for (const key of Object.keys(this.#layers)) {
      this.#layers[key]?.destroyChildren();
    }

    this.#generateConCircle();
    this.#generateTrees();
  }

  #zoomTheView() {
    const rect = this.#layers.nodes.getClientRect({ skipTransform: true });
    const scaleX = stage.width()  / rect.width;
    const scaleY = stage.height() / rect.height;
    const scale  = Math.min(scaleX, scaleY);

    const scaledWidth  = rect.width  * scale;
    const scaledHeight = rect.height * scale;

    const posOffsetX = (stage.width()  - scaledWidth ) / 2;
    const posOffsetY = (stage.height() - scaledHeight) / 2;

    stage.scale({ x: scale, y: scale });
    stage.position({
      x: -rect.x * scale + posOffsetX,
      y: -rect.y * scale + posOffsetY
    });
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
      uiState.selectedNode.set(ctNode);
      e.cancelBubble = true;
      setOnUnfocus(() => {
        uiNode.fill('black');
        uiState.selectedNode.set(null);
      });
    }
  }

  /**
   * 
   * @param {import("konva/lib/Node.js").KonvaEventObject<MouseEvent, Layer>} e 
   */
  #onEdgeClick(e) {
    let uiNode = e.target;
    if (uiNode instanceof Konva.Arc) {
      unfocus();
      e.cancelBubble = true;
      uiNode.opacity(0.3);
      const ctree = this.findRfEntityByUiNode(uiNode);
      uiState.selectedCTree.set(ctree);
      setOnUnfocus(() => {
        uiNode.opacity(0.0);
        uiState.selectedCTree.set(null);
      });
    } else {
      unfocus();
      const ctEdge = this.findRfEntityByUiNode(uiNode);
      if (uiNode instanceof Konva.Text) {
        uiNode = this.findUiNodeByRfEntity(ctEdge, Konva.Line);
      }
      const defaultStroke = uiNode.stroke();
      uiNode.stroke('red');
      uiState.selectedEdge.set(ctEdge);
      setOnUnfocus(() => {
        uiNode.stroke(defaultStroke);
        uiState.selectedEdge.set(null);
      });
      e.cancelBubble = true;
    }
  }

  deinit() {
    for (const key of Object.keys(this.#layers)) {
      if (this.#layers[key] != null) {
        this.#layers[key]?.destroy();
        this.#layers[key] = null;
      }
    }
  }

  #onViewSettingsUpdate(viewSettings) {
    unfocus();

    for (const ele of this.#uiRfMap) {
      if (ele.rfEntity instanceof CTEdge) {
        const isLeaf = ele.rfEntity.to.target != null;
        let visibility = true;
        if (isLeaf) { // is leaf
          if (viewSettings.hideEdgesToLeaves) {
            visibility = false;
          }
          if (viewSettings.edgesToLeavesWithinLayersMin != null && 
            ele.rfEntity.from.level < viewSettings.edgesToLeavesWithinLayersMin) {
            visibility = false;
          }
          if (viewSettings.edgesToLeavesWithinLayersMax != null && 
            ele.rfEntity.from.level > viewSettings.edgesToLeavesWithinLayersMax) {
            visibility = false;
          }
        }
        if (viewSettings.edgesWithinScoreMin != null && 
          ele.rfEntity.score < viewSettings.edgesWithinScoreMin) {
          visibility = false;
        }
        if (viewSettings.edgesWithinScoreMax != null && 
          ele.rfEntity.score > viewSettings.edgesWithinScoreMax) {
          visibility = false;
        }
        ele.uiNode.visible(visibility);
        if (ele.uiNode instanceof Konva.Line) {
          ele.uiNode.stroke(isLeaf ? viewSettings.nodeToLeafColor : viewSettings.nodeToNodeColor);
        }
      } else if (ele.rfEntity instanceof CTNode) {
        if (ele.uiNode instanceof Konva.Rect) {
          ele.uiNode.fill(ele.rfEntity.target != null ? viewSettings.leafColor : viewSettings.nodeColor);
        }
      }  
    }
  }

  #viewSettingsUnsubscribe = null;
  #currentCTreeUnsubscribe = null;

  onEnter() {
    for (const layer of Object.values(this.#layers)) {
      if (layer != null) {
        stage.add(layer);
      }
    }
    this.#viewSettingsUnsubscribe = uiState.viewSettings.subscribe((f) => this.#onViewSettingsUpdate(f));
    let ignoredFirstCTreeEvent = false;
    this.#currentCTreeUnsubscribe = uiState.currentCTree.subscribe((ctree) => {
      if (!ignoredFirstCTreeEvent) {
        ignoredFirstCTreeEvent = true;
        return;
      }
      if (ctree != this.#targetCTree) {
        unfocus();
        uiState.selectedCTree.set(null);
        uiState.clearViewSettings();
        this.#targetCTree = ctree;
        this.#render();
        this.#zoomTheView();
      }
    });
  }

  onExit() {
    unfocus();
    uiState.selectedEdge.set(null);
    uiState.selectedNode.set(null);
    this.#viewSettingsUnsubscribe();
    this.#currentCTreeUnsubscribe();
    uiState.currentCTree.set(null);
    uiState.selectedCTree.set(null);
    for (const layer of Object.values(this.#layers)) {
      if (layer != null) {
        layer.remove();
      }
    }
  }
}