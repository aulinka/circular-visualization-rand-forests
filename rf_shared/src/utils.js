export default {
  assignFields: (target, source) => Object.keys(source).filter(key => key in target).forEach(key => target[key] = source[key]),

  resolveReferences: (rf, obj, property) => {
    const prop = obj[property];
    if (prop == null) {
      return; 
    }
    if (prop?.constructor === Array) {
      obj[property] = obj[property].map(e => rf.getEntityById(e));
    } else {
      obj[property] = rf.getEntityById(prop);
    }
  }
}