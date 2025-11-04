// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE
// Typst mode for CodeMirror

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

CodeMirror.defineMode("typst", function(config, modeConfig) {

  var smallRE = /[a-z_]/;
  var largeRE = /[A-Z]/;
  var digitRE = /\d/;
  var hexitRE = /[0-9A-Fa-f]/;
  var idRE = /[a-z_A-Z0-9\-]/;
  var operatorRE = /[+\-*\/=<>!&|]/;
  var specialRE = /[(),;[\]`]/;
  var whiteCharRE = /[ \t\v\f]/;

  // Keywords
  var keywords = {
    "let": "keyword",
    "if": "keyword",
    "else": "keyword",
    "for": "keyword",
    "while": "keyword",
    "break": "keyword",
    "continue": "keyword",
    "import": "keyword",
    "include": "keyword",
    "as": "keyword",
    "in": "keyword",
    "not": "keyword",
    "and": "keyword",
    "or": "keyword",
    "none": "atom",
    "auto": "atom",
    "true": "atom",
    "false": "atom"
  };

  return {
    startState: function() {
      return {
        inCode: false,
        braceDepth: 0,
        inBlockComment: false,
        inEmphasis: false,
        inStrong: false,
        inHeading: false
      };
    },

    copyState: function(s) {
      return {
        inCode: s.inCode,
        braceDepth: s.braceDepth,
        inBlockComment: s.inBlockComment,
        inEmphasis: s.inEmphasis,
        inStrong: s.inStrong,
        inHeading: s.inHeading
      };
    },

    token: function(stream, state) {
      // Handle block comments first
      if (state.inBlockComment) {
        while (!stream.eol()) {
          if (stream.next() === '*' && stream.eat('/')) {
            state.inBlockComment = false;
            break;
          }
        }
        return "comment";
      }

      // At start of line, reset to markup mode unless we're in braces
      if (stream.sol() && state.braceDepth === 0) {
        state.inCode = false;
        state.inHeading = false;
      }

      // Skip whitespace
      if (stream.eatSpace()) {
        return null;
      }

      var ch = stream.next();

      // Handle braces for tracking depth
      if (ch === '{') {
        state.braceDepth++;
        return "punctuation";
      }
      if (ch === '}') {
        state.braceDepth--;
        if (state.braceDepth === 0) {
          state.inCode = false;
        }
        return "punctuation";
      }

      // Comments (work in both modes)
      if (ch === '/' && stream.eat('/')) {
        stream.skipToEnd();
        return "comment";
      }
      if (ch === '/' && stream.eat('*')) {
        state.inBlockComment = true;
        while (!stream.eol()) {
          if (stream.next() === '*' && stream.eat('/')) {
            state.inBlockComment = false;
            break;
          }
        }
        return "comment";
      }

      // Math mode
      if (ch === '$') {
        while (!stream.eol()) {
          var next = stream.next();
          if (next === '$') break;
          if (next === '\\') stream.next();
        }
        return "variable-3";
      }

      // Code mode entry
      if (ch === '#' && !state.inCode) {
        state.inCode = true;
        // Check if it's a keyword
        if (stream.match(/[a-zA-Z_]/)) {
          stream.eatWhile(idRE);
          var word = stream.current().substring(1); // Remove the #
          if (keywords.hasOwnProperty(word)) {
            return "keyword";
          }
          return "variable";
        }
        return "operator";
      }

      // If we're in code mode
      if (state.inCode) {
        // Strings
        if (ch === '"') {
          while (!stream.eol()) {
            var next = stream.next();
            if (next === '"') break;
            if (next === '\\') stream.next();
          }
          return "string";
        }

        // Numbers
        if (digitRE.test(ch)) {
          stream.eatWhile(digitRE);
          if (stream.eat('.')) {
            stream.eatWhile(digitRE);
          }
          if (stream.eat(/[eE]/)) {
            stream.eat(/[-+]/);
            stream.eatWhile(digitRE);
          }
          return "number";
        }

        // Identifiers and keywords
        if (smallRE.test(ch) || largeRE.test(ch) || ch === '_') {
          stream.eatWhile(idRE);
          var word = stream.current();

          if (keywords.hasOwnProperty(word)) {
            return "keyword";
          }

          // Function calls
          if (stream.eat('(')) {
            stream.backUp(1);
            return "def";
          }

          return "variable";
        }

        // Operators
        if (operatorRE.test(ch)) {
          stream.eatWhile(operatorRE);
          return "operator";
        }

        // Special characters
        if (specialRE.test(ch)) {
          return "punctuation";
        }

        // Content blocks
        if (ch === '[') {
          var depth = 1;
          while (!stream.eol() && depth > 0) {
            var next = stream.next();
            if (next === '[') depth++;
            else if (next === ']') depth--;
          }
          return "string";
        }

        return null;
      }

      // Markup mode
      else {
        // If we're in a heading, style everything as header
        if (state.inHeading) {
          return "header";
        }

        // Raw text
        if (ch === '`') {
          while (!stream.eol()) {
            if (stream.next() === '`') break;
          }
          return "variable-2";
        }

        // Handle emphasis states
        if (state.inStrong) {
          if (ch === '*' && stream.eat('*')) {
            state.inStrong = false;
            return "strong";
          }
          return "strong";
        }

        if (state.inEmphasis) {
          if (ch === '*' || ch === '_') {
            state.inEmphasis = false;
            return "em";
          }
          return "em";
        }

        // Strong emphasis
        if (ch === '*') {
          if (stream.eat('*')) {
            state.inStrong = true;
            return "strong";
          }
          state.inEmphasis = true;
          return "em";
        }

        // Emphasis
        if (ch === '_') {
          state.inEmphasis = true;
          return "em";
        }

        // Headings - back up and use stream.match
        if (ch === '=' && stream.sol()) {
          stream.backUp(1);
          var match = stream.match(/^(=+)\s*/);
          if (match) {
            state.inHeading = true;
            return "header";
          }
        }

        // Lists
        if ((ch === '-' || ch === '+') && stream.sol()) {
          stream.eatSpace();
          return "variable-2";
        }

        // Escape sequences
        if (ch === '\\') {
          if (stream.eat('u') && stream.eat('{')) {
            stream.eatWhile(hexitRE);
            stream.eat('}');
            return "string-2";
          }
          stream.next();
          return "string-2";
        }

        // Links
        if (ch === 'h' && stream.match(/ttps?:\/\/[^\s]*/)) {
          return "link";
        }

        return null;
      }
    },

    indent: function(state, textAfter) {
      return state.braceDepth * config.indentUnit;
    },

    lineComment: "//"
  };
});

CodeMirror.defineMIME("text/x-typst", "typst");

});
