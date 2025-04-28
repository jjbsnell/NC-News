const express = require("express");
const app = require("./app.js");
const db = require("./db/connection");

app.listen(9090, () => {
  console.log("listening on port 9090");
});
