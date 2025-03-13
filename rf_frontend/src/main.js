import './style.css';
import Konva from "konva";
import { stage } from "./stage.js";
import { MergedRandomForest } from "./merged_random_forest.js";


async function main() {
  const mrf = new MergedRandomForest();
  await mrf.init();
}

main();


// // then create layer
// var layer = new Konva.Layer();

// // create our shape
// var circle = new Konva.Circle({
//   x: stage.width() / 2,
//   y: stage.height() / 2,
//   radius: 70,
//   fill: 'red',
//   stroke: 'black',
//   strokeWidth: 4
// });

// layer.add(circle);

// stage.add(layer);
