const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Version only the interview's references; asset bytes and other pages stay unchanged.
const version = (file) => crypto.createHash("sha256")
  .update(fs.readFileSync(path.join(__dirname, "..", file)))
  .digest("hex");

module.exports = {
  stylesheetVersion: version("assets/css/system.css"),
  scriptVersion: version("js/search-profile.js"),
};
