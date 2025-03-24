import { RandomForest } from "rf_shared";
import { panel } from "./panel/panel";

export class App {
  /** @type {RandomForest} */
  #rf

  async init() {
    panel.init();
    await this.loadRandomForest();
  }

  getRandomForest() {
    return this.#rf;
  }

  async loadRandomForest() {
    const res = await fetch('/tree.json');
    const json = await res.json();
    this.#rf = RandomForest.fromJSON(json);

    const myData = { foo: 'bar' };
    window.dispatchEvent(new CustomEvent('updateUI', { detail: myData }));
  }
}

export const app = new App();