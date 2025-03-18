import utils from "./utils.js";

export default class Entity {
  /** @type {?number} */
  id = null;
  /** @type {string} */
  type = "-";
  
  constructor(type) {
    this.type = type;
  }

  resolveReferences(rf) {
    
  }
  
  static fromJSON(json) {
    const entity = new this();
    utils.assignFields(entity, json);
    return entity;
  }
}