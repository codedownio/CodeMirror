// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE
// Adapted for Nix language support

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

CodeMirror.defineMode("nix", function(_config, modeConfig) {

  function switchState(source, setState, f) {
    setState(f);
    return f(source, setState);
  }

  // These should all be Unicode extended
  var smallRE = /[a-z_]/;
  var largeRE = /[A-Z]/;
  var digitRE = /\d/;
  var hexitRE = /[0-9A-Fa-f]/;
  var octitRE = /[0-7]/;
  var idRE = /[a-z_A-Z0-9'-]/;
  var pathRE = /[a-zA-Z0-9._\-+\/]/;
  var symbolRE = /[-!#$%&*+.\/<=>?@\\^|~:]/;
  var specialRE = /[(),;[\]`{}]/;
  var whiteCharRE = /[ \t\v\f]/; // newlines are handled in tokenizer

  function normal(source, setState) {
    if (source.eatWhile(whiteCharRE)) {
      return null;
    }

    var ch = source.next();
    if (specialRE.test(ch)) {
      if (ch == '$' && source.eat('{')) {
        return switchState(source, setState, interpolation);
      }
      return null;
    }

    if (ch == '#') {
      source.skipToEnd();
      return "comment";
    }

    if (ch == '\'') {
      if (source.eat('\'')) {
        return switchState(source, setState, multiStringLiteral);
      }
      if (source.eat('\\')) {
        source.next();  // should handle other escapes here
      }
      else {
        source.next();
      }
      if (source.eat('\'')) {
        return "string";
      }
      return "string error";
    }

    if (ch == '"') {
      return switchState(source, setState, stringLiteral);
    }

    if (largeRE.test(ch)) {
      source.eatWhile(idRE);
      if (source.eat('.')) {
        return "qualifier";
      }
      return "variable-2";
    }

    if (smallRE.test(ch)) {
      source.eatWhile(idRE);
      return "variable";
    }

    if (digitRE.test(ch)) {
      if (ch == '0') {
        if (source.eat(/[xX]/)) {
          source.eatWhile(hexitRE); // should require at least 1
          return "number";
        }
        if (source.eat(/[oO]/)) {
          source.eatWhile(octitRE); // should require at least 1
          return "number";
        }
      }
      source.eatWhile(digitRE);
      var t = "number";
      if (source.match(/^\.\d+/)) {
        t = "number";
      }
      if (source.eat(/[eE]/)) {
        t = "number";
        source.eat(/[-+]/);
        source.eatWhile(digitRE); // should require at least 1
      }
      return t;
    }

    if (ch == "/" && source.eat("/")) {
      // Could be a path or division operator
      if (source.eat(pathRE)) {
        source.eatWhile(pathRE);
        return "string-2"; // Path
      }
      return "operator";
    }

    if (ch == "." && source.eat("."))
      return "operator";

    if (symbolRE.test(ch)) {
      if (ch == '-' && source.eat(/-/)) {
        source.eatWhile(/-/);
        if (!source.eat(symbolRE)) {
          source.skipToEnd();
          return "comment";
        }
      }
      source.eatWhile(symbolRE);
      return "operator";
    }

    // Path literals
    if (pathRE.test(ch)) {
      source.eatWhile(pathRE);
      return "string-2";
    }

    return "error";
  }

  // Nix only has single-line comments, no block comments

  // Regular string literals
  function stringLiteral(source, setState) {
    while (!source.eol()) {
      var ch = source.next();
      if (ch == '"') {
        setState(normal);
        return "string";
      }
      if (ch == '\\') {
        if (source.eol() || source.eat(whiteCharRE)) {
          setState(stringGap);
          return "string";
        }
        if (source.eat('&')) {
        }
        else {
          source.next(); // should handle other escapes here
        }
      }
      if (ch == '$' && source.eat('{')) {
        setState(interpolationInString);
        return "string";
      }
    }
    setState(normal);
    return "string error";
  }

  // Multi-line string literals in Nix with ''
  function multiStringLiteral(source, setState) {
    var triple = false;
    while (!source.eol()) {
      var ch = source.next();
      if (ch == '\'' && source.eat('\'')) {
        setState(normal);
        return "string";
      }
      if (ch == '$' && source.eat('{')) {
        setState(interpolationInMultiString);
        return "string";
      }
    }
    setState(multiStringLiteral);
    return "string";
  }

  function stringGap(source, setState) {
    if (source.eat('\\')) {
      return switchState(source, setState, stringLiteral);
    }
    source.next();
    setState(normal);
    return "error";
  }

  // Interpolation within strings
  function interpolation(source, setState) {
    while (!source.eol()) {
      var ch = source.next();
      if (ch == '}') {
        setState(normal);
        return "string-2";
      }
      if (ch == '{') {
        return switchState(source, setState, interpolation);
      }
    }
    setState(normal);
    return "string-2";
  }

  // Interpolation within double-quoted strings
  function interpolationInString(source, setState) {
    while (!source.eol()) {
      var ch = source.next();
      if (ch == '}') {
        setState(stringLiteral);
        return "string-2";
      }
      if (ch == '{') {
        return switchState(source, setState, interpolation);
      }
    }
    setState(stringLiteral);
    return "string-2";
  }

  // Interpolation within multi-line strings
  function interpolationInMultiString(source, setState) {
    while (!source.eol()) {
      var ch = source.next();
      if (ch == '}') {
        setState(multiStringLiteral);
        return "string-2";
      }
      if (ch == '{') {
        return switchState(source, setState, interpolation);
      }
    }
    setState(multiStringLiteral);
    return "string-2";
  }

  var wellKnownWords = (function() {
    var wkw = {};
    function setType(t) {
      return function () {
        for (var i = 0; i < arguments.length; i++)
          wkw[arguments[i]] = t;
      };
    }

    // Nix language keywords
    setType("keyword")(
      "if", "then", "else", "with", "let", "in", "rec", "inherit", "or", "assert",
      "import", "null", "true", "false");

    // Nix operators
    setType("operator")(
      "!", "!=", "&&", "+", "++", "-", ".", "//", "<", "<=", "==", ">", ">=", "?", "||", "->",
      "=", "@", "...");

    // Nix builtins
    setType("builtin")(
      "abort", "add", "addErrorContext", "all", "any", "attrNames", "attrValues", "baseNameOf",
      "break", "builtins", "compareVersions", "concatLists", "concatMap", "concatStringsSep",
      "currentSystem", "currentTime", "deepSeq", "derivation", "dirOf", "div", "elem", "elemAt",
      "fetchGit", "fetchurl", "filter", "filterSource", "findFile", "foldl'", "fromJSON", "functionArgs",
      "genList", "genericClosure", "getAttr", "getEnv", "hasAttr", "hashFile", "hashString",
      "head", "intersectAttrs", "isAttrs", "isBool", "isFunction", "isInt", "isList", "isNull",
      "isString", "length", "lessThan", "listToAttrs", "map", "mapAttrs", "match", "mul",
      "nixPath", "nixVersion", "parseDrvName", "pathExists", "path", "placeholder", "readDir", "readFile",
      "removeAttrs", "replaceStrings", "seq", "sort", "split", "splitVersion", "stringLength",
      "sub", "substring", "tail", "throw", "toJSON", "toPath", "toString", "toXML", "trace",
      "tryEval", "typeOf", "unsafeDiscardOutputDependency", "unsafeDiscardStringContext",
      "unsafeGetAttrPos", "valueSize");

    var override = modeConfig.overrideKeywords;
    if (override) for (var word in override) if (override.hasOwnProperty(word))
      wkw[word] = override[word];

    return wkw;
  })();

  return {
    startState: function () { return { f: normal }; },
    copyState:  function (s) { return { f: s.f }; },

    token: function(stream, state) {
      var t = state.f(stream, function(s) { state.f = s; });
      var w = stream.current();
      return wellKnownWords.hasOwnProperty(w) ? wellKnownWords[w] : t;
    },

    // Nix has no block comments
    lineComment: "#"
  };

});

CodeMirror.defineMIME("text/x-nix", "nix");

});
