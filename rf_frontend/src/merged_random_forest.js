import Konva from "konva";
import { stage } from "./stage";


class TreeSegment {
  constructor (angleStart, angle) {
    this.angleStart = angleStart;
    this.angle = angle;
  }
}

function getLetterByIndex(index) {
  let result = '';
  index++; // To make it 1-based indexing
  while (index > 0) {
      index--; // Adjust because we're working with 0-based indexes
      result = String.fromCharCode(65 + (index % 26)) + result;
      index = Math.floor(index / 26);
  }
  return result;
}

export class MergedRandomForest {
  async init() {
    this._layer_crosshair = new Konva.Layer();
    this._layer_connections = new Konva.Layer();
    this._layer_nodes = new Konva.Layer();
    this._layer_crosshair.listening(false);
    this._layer_connections.listening(false);
    this._layer_nodes.listening(false);
    stage.add(this._layer_crosshair);
    stage.add(this._layer_connections);
    stage.add(this._layer_nodes);

    const res = await fetch('/tree.json');
    const json = await res.json();
    this._tree = json;

    const centerX = stage.width() / 2;
    const centerY = stage.height() / 2;
    
    this._layer_crosshair.add(new Konva.Circle({
      x: centerX,
      y: centerY,
      radius: 5,
      fill: 'black'
    }));

    const layersCount = this._tree.layersCount + 1;
    const layerRadius = 140;
    const treeRadius = (layersCount * layerRadius);

    for (let i = 0; i < layersCount; i++) {
       this._layer_crosshair.add(new Konva.Circle({
        x: centerX,
        y: centerY,
        radius: ((i + 1) * layerRadius),
        stroke: 'black',
        strokeWidth: 1,
        dash: [10,5],
        dashEnabled: (i != layersCount-1)
      }));
    }

    const treeSegments = [];

    const rootNodesCount = this._tree.trees.length;
    const segmentSize = ((Math.PI*2) / (rootNodesCount))
    for (let i = 0; i < rootNodesCount; i++) {
      const angle = (i * segmentSize) + (Math.PI/2);
      const x = Math.sin(angle) * treeRadius;
      const y = Math.cos(angle) * treeRadius;
      const line = new Konva.Line({
        points: [centerX, centerY, centerX + x, centerY + y],
        stroke: 'black',
        strokeWidth: 1
      });
      this._layer_crosshair.add(line);
      treeSegments.push(new TreeSegment(angle, segmentSize));
    }

    const posCache = {};

    for (const treeIndex in this._tree.trees) {
      const tree = this._tree.trees[treeIndex];
      const seg = treeSegments[treeIndex];

      const angleStart = seg.angleStart;
      const angleSize = seg.angle;
      const treeLayersCount = Object.keys(tree.layers).length;

      for (let i = 0; i < treeLayersCount; i++) {
        const layer = tree.layers[i];
        const distance = ((i + 1) * layerRadius);

        const partOffset = angleSize / (layer.length + 1);
        for (const nodeIndex in layer) {
          const nodeId = layer[nodeIndex];
          const node = this._tree.nodes.find(n => n.id === nodeId);
          const angle = partOffset * (parseInt(nodeIndex)+1);
          const x = Math.sin(angleStart + angle) * distance;
          const y = Math.cos(angleStart + angle) * distance;
          posCache[nodeId] = {
            x, y
          };

          this._layer_nodes.add(new Konva.Circle({
            x: centerX + x,
            y: centerY + y,
            radius: 30.0,
            fill: 'red'
          }));
          this._layer_nodes.add(new Konva.Text({
            x: centerX + x - 100,
            y: centerY + y - 15,
            width: 200,
            height: 30,
            // text: getLetterByIndex(node.feature) + " " + node.id,
            // text: getLetterByIndex(node.feature),
            text: this._tree.features.find(f => f.id == node.feature).name,
            align: 'center',
            verticalAlign: 'middle',
            fontSize: 20,
          }));
          const createLine = (pId) => {
            let pPos = posCache[pId];
            if (pId == null) {
              pPos = {x:0, y:0};
            }
            const line = new Konva.Line({
              points: [centerX + x, centerY + y, centerX + pPos.x, centerY + pPos.y],
              stroke: 'purple',
              strokeWidth: 1
            });
            this._layer_connections.add(line);
          };
          if (node.parent != null || node.rootNode == null) {
            createLine(node.parent);
          }
          for (const pId of node.parents ?? []) {
            createLine(pId);
          }
        }
        // break;
      }

      {
        const layer = tree.leafLayer;
        const distance = ((layersCount) * layerRadius);
        const partOffset = angleSize / (layer.length + 1);

        for (const nodeIndex in layer) {
          const nodeId = layer[nodeIndex];
          const node = this._tree.nodes.find(n => n.id === nodeId);
          const angle = partOffset * (parseInt(nodeIndex)+1);
          const x = Math.sin(angleStart + angle) * distance;
          const y = Math.cos(angleStart + angle) * distance;

          this._layer_nodes.add(new Konva.Circle({
            x: centerX + x,
            y: centerY + y,
            radius: 30.0,
            fill: 'green'
          }));
          this._layer_nodes.add(new Konva.Text({
            x: centerX + x - 100,
            y: centerY + y - 15,
            width: 200,
            height: 30,
            // text: getLetterByIndex(node.feature) + " " + node.id,
            // text: getLetterByIndex(node.feature),
            text: this._tree.classes.find(c => c.id == node.class).name,
            align: 'center',
            verticalAlign: 'middle',
            fontSize: 20,
          }));
          const createLine = (pId) => {
            let pPos = posCache[pId];
            if (pId == null) {
              pPos = {x:0, y:0};
            }
            const line = new Konva.Line({
              points: [centerX + x, centerY + y, centerX + pPos.x, centerY + pPos.y],
              stroke: 'rgba(0,255,0,0.5)',
              strokeWidth: 1
            });
            this._layer_connections.add(line);
          };
          if (node.parent != null || node.rootNode == null) {
            createLine(node.parent);
          }
          for (const pId of node.parents ?? []) {
            createLine(pId);
          }
        }
      }

      // break;
    }
  }

  // draw() {

  // }

  deinit() {
    this._layer_nodes.remove();
    this._layer_nodes.destroy();
  }
}