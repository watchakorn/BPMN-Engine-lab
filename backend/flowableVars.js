function flowableVarsToObject(list) {
  const vars = {};

  for (const item of list || []) {
    const variable = item.variable || item;
    const name = variable.variableName || variable.name;
    if (!name) continue;
    vars[name] = variable.value;
  }

  return vars;
}

module.exports = {
  flowableVarsToObject,
};
