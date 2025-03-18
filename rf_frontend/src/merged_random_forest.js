import Konva from "konva";
import { stage } from "./stage";
import { CombinedTree, RandomForest } from "rf_shared";


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

function murmurhash3_32(key, seed = 0) {
  let h1 = seed ^ key;
  h1 = Math.imul(h1, 0xcc9e2d51);
  h1 = (h1 << 15) | (h1 >>> 17);
  h1 = Math.imul(h1, 0x1b873593);
  h1 ^= h1 >>> 13;
  h1 = Math.imul(h1, 0x85ebca6b);
  h1 ^= h1 >>> 16;
  return h1 >>> 0; // Convert to unsigned 32-bit integer
}

function seededRandom(unsignedInt) {
  const hash = murmurhash3_32(unsignedInt);
  return (hash % 1000000) / 1000000; // Normalize to [0,1)
}


export class MergedRandomForest {
  /** @type {RandomForest} */
  #rf;

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

    this.#rf = RandomForest.fromJSON(json);

    const centerX = stage.width() / 2;
    const centerY = stage.height() / 2;

    const treesCount = this.#rf.trees.length;
    
    this._layer_crosshair.add(new Konva.Circle({
      x: centerX,
      y: centerY,
      radius: 5,
      fill: 'black'
    }));

    let layersCount = 0;
    for (const tree of this.#rf.combinedTrees) {
      layersCount = Math.max(tree.layers.length, layersCount);
    }
    layersCount += 1;
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

    const rootNodesCount = this.#rf.combinedTrees.length;
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

    for (const treeIndex in this.#rf.combinedTrees) {
      /** @type {CombinedTree} */
      const tree = this.#rf.combinedTrees[treeIndex];
      const seg = treeSegments[treeIndex];

      const angleStart = seg.angleStart;
      const angleSize = seg.angle;
      const treeLayersCount = tree.layers.length;

      for (let i = 0; i < treeLayersCount; i++) {
        const layer = tree.layers[i];
        const distance = ((i + 1) * layerRadius);

        const partOffset = angleSize / (layer.length + 1);
        for (const nodeIndex in layer) {
          const node = layer[nodeIndex];
          const nodeId = node.id;
          let angle = partOffset * (parseInt(nodeIndex)+1);
          angle += (seededRandom(nodeId) * 0.05) - 0.025;
          
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
            // text: getLetterByIndex(node.feature.id),
            text: node.feature.name,
            align: 'center',
            verticalAlign: 'middle',
            fontSize: 20,
          }));
          const createLine = (pId, score) => {
            let pPos = posCache[pId];
            if (pId == null) {
              pPos = {x:0, y:0};
            }
            const coords = [centerX + x, centerY + y, centerX + pPos.x, centerY + pPos.y];
            const line = new Konva.Line({
              points: coords,
              stroke: 'purple',
              strokeWidth: 1
            });
            this._layer_connections.add(line);
            const midX = (coords[0] + coords[2]) / 2;
            const midY = (coords[1] + coords[3]) / 2;
            if (score != null) {
              this._layer_connections.add(new Konva.Text({
                align: 'center',
                verticalAlign: 'middle',
                text: `${(score * 100.0).toFixed(2)}%`,
                width: 300,
                height: 300,
                x: midX - 150,
                y: midY - 150,
                fontSize: 20,
                fontFamily: 'Calibri',
                fill: 'black'
              }));
            }
          };
          if (node.level == 0) {
            createLine(null);
          }
          for (const edge of node.inEdges) {
            createLine(edge.from.id, edge.inTrees.length / treesCount);
          }
        }
        // break;
      }

      {
        const layer = tree.leafLayer;
        const distance = ((layersCount) * layerRadius);
        const partOffset = angleSize / (layer.length + 1);

        for (const nodeIndex in layer) {
          const node = tree.leafLayer[nodeIndex];
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
            text: node.target.name,
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
          for (const edge of node.inEdges) {
            createLine(edge.from.id, 0);
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