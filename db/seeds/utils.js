const db = require("../../db/connection");

exports.convertTimestampToDate = ({ created_at, ...otherProperties }) => {
  if (!created_at) return { ...otherProperties };
  return { created_at: new Date(created_at), ...otherProperties };
};


exports.createRef = (array, key, value) => {
  return array.reduce((ref, item) => {
    ref[item[key]] = item[value];
    return ref;
  }, {});
};


