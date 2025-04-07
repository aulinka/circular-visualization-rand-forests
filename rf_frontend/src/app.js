import { RandomForest } from "rf_shared";
import { ui } from "./ui/ui.js";
import { RandomForestView } from "./random_forest_view.js";
import { currentRf, selectedEdge, selectedNode } from "./ui/uiState.svelte.js";
import { stage } from "./stage.js";

export class App {
  /** @type {RandomForest} */
  #rf

  #rfv;

  async init() {
    ui.init();
    if (true) { // Auto-load tree.json for easier debugging
      const res = await fetch('/tree.json');
      const json = await res.json();
      this.loadRandomForest(json);
    }
  }

  getRandomForest() {
    return this.#rf;
  }

  loadRandomForest(jsonData) {
    this.#rf = RandomForest.fromJSON(jsonData);
    currentRf.set(this.#rf);
    this.#rfv = new RandomForestView({
      // targetRootNode: this.#rf.combinedTrees[0] // polkruh
    });
    this.#rfv.init();
    this.#rfv.onEnter();
  }

  closeRandomForest() {
    selectedEdge.set(null);
    selectedNode.set(null);
    stage.destroyChildren();
    currentRf.set(null);
  }
}

export const app = new App();
window.app = app;