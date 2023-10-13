
if (typeof exports == "object" && typeof module == "object") // CommonJS
  module.exports = require("../lib/codemirror");
else if (typeof define == "function" && define.amd) // AMD
  define(["../lib/codemirror"], mod);
else // Plain browser env
  return CodeMirror;
