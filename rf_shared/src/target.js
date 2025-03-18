import utils from "./utils.js";

export default class Target {
  /** @param {string} name */
  constructor (id, name) {
    /** @type {number} */
    this.id = id;
    /** @type {string} */
    this.name = name;
  }
  
  static fromJSON(json) {
    const t = new Target();
    utils.assignFields(t, json);
    return t;
  }
}