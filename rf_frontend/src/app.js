import { RandomForest } from "rf_shared";
import { ui } from "./ui/ui.js";
import { RandomForestView } from "./random_forest_view.js";
import { currentRf } from "./ui/uiState.svelte.js";

export class App {
  /** @type {RandomForest} */
  #rf

  #rfv;

  async init() {
    ui.init();
    await this.loadRandomForest();
    this.#rfv = new RandomForestView({
      // targetRootNode: this.#rf.combinedTrees[0] // polkruh
    });
    this.#rfv.init();
    this.#rfv.onEnter();
  }

  getRandomForest() {
    return this.#rf;
  }

  async loadRandomForest() {
    const res = await fetch('/tree.json');
    const json = await res.json();
    this.#rf = RandomForest.fromJSON(json);
    currentRf.set(this.#rf);
  }
}

export const app = new App();
window.app = app;