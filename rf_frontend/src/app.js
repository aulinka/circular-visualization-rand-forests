import { RandomForest } from "rf_shared";
import { ui } from "./ui/ui.js";
import { RandomForestView } from "./random_forest_view.js";
import { clearViewSettings, currentRf, resetViewSettings, selectedEdge, selectedNode } from "./ui/uiState.svelte.js";
import { stage, unfocus, reset as stageReset } from "./stage.js";

export class App {
  /** @type {RandomForest} */
  #rf

  /** @type {RandomForestView} */
  #rfv;

  async init() {
    ui.init();
    if (false) { // Auto-load tree.json for easier debugging
      const res = await fetch('/tree.json');
      const json = await res.json();
      this.loadRandomForest(json);
    }
  }

  getRandomForest() {
    return this.#rf;
  }

  loadRandomForest(jsonData) {
    stageReset();
    this.#rf = RandomForest.fromJSON(jsonData);
    currentRf.set(this.#rf);
    this.#rfv = new RandomForestView({});
    this.#rfv.init();
    this.#rfv.onEnter();
  }

  closeRandomForest() {
    this.#rfv.onExit();
    this.#rfv.deinit();
    clearViewSettings();
    stage.destroyChildren();
    currentRf.set(null);
  }
}

export const app = new App();
window.app = app;