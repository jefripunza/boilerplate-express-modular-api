exports.isArray = (value) => {
  return value && typeof value === "object" && Array.isArray(value);
};

exports.isObject = (value) => {
  return value && typeof value === "object" && !Array.isArray(value);
};

exports.isNumber = (val) => /^(\d+)$/.test(val);

exports.isUndefined = (value) => {
  return typeof value === "undefined";
};
