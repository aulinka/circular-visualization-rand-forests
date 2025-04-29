import Konva from "konva";
import { Stage } from "konva/lib/Stage.js";

/** @type {Stage} */
export const stage = new Stage({
  container: 'app',
  width: window.innerWidth,
  height: window.innerHeight,
  draggable: true
});

let onUnfocus;

export function setOnUnfocus(callback) {
  onUnfocus = callback;
}

export function unfocus() {
  onUnfocus?.();
  onUnfocus = null;
}

stage.on('click', e => {
  unfocus();
});

export function reset() {
  stage.position({x:0.0, y:0.0});
  stage.scale({x:1.0,y:1.0});
}

var scaleBy = 1.1;
stage.on('wheel', (e) => {
  // stop default scrolling
  e.evt.preventDefault();

  var oldScale = stage.scaleX();
  var pointer = stage.getPointerPosition();

  var mousePointTo = {
    x: (pointer.x - stage.x()) / oldScale,
    y: (pointer.y - stage.y()) / oldScale,
  };

  // how to scale? Zoom in? Or zoom out?
  let direction = e.evt.deltaY > 0 ? 1 : -1;

  // when we zoom on trackpad, e.evt.ctrlKey is true
  // in that case lets revert direction
  if (e.evt.ctrlKey) {
    direction = -direction;
  }

  var newScale = direction < 0 ? oldScale * scaleBy : oldScale / scaleBy;

  stage.scale({ x: newScale, y: newScale });

  var newPos = {
    x: pointer.x - mousePointTo.x * newScale,
    y: pointer.y - mousePointTo.y * newScale,
  };
  stage.position(newPos);
});

window.stage = stage;