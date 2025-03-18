import utils from "./utils.js";

export default class Feature {
  /** @param {string} name */
  constructor (id, name) {
    /** @type {number} */
    this.id = id;
    /** @type {string} */
    this.name = name;
  }

  static fromJSON(json) {
    const f = new Feature();
    utils.assignFields(f, json);
    return f;
  }
}