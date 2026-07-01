// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE

(function() {
  var mode = CodeMirror.getMode({tabSize: 4, indentUnit: 2}, "typst");
  function MT(name) { test.mode(name, mode, Array.prototype.slice.call(arguments, 1)); }

  // ---------------------------------------------------------------------------
  // Headings
  // ---------------------------------------------------------------------------

  // A run of `=` at the start of a line sets the header level, and the rest of the line is styled
  // `header header-N`. (Spaces between words are unstyled, so each word is a separate run.)
  MT("headings",
     "[header&header-1 = Hello] [header&header-1 world]",
     "[header&header-2 == Second] [header&header-2 level]",
     "[header&header-3 === Third]");

  // A heading is recognized on the line *after* a balanced `#call(...)`: the call's parens open and
  // close, parenDepth returns to 0, so the leading `=` starts a header again.
  MT("headingAfterCall",
     "[variable #foo][punctuation (][number 1][punctuation ,] [number 2][punctuation )]",
     "[header&header-1 = Heading] [header&header-1 after] [header&header-1 call]");

  // Regression: a `#codedown(```lang ... ```, output: ...)` cell must leave parenDepth balanced so a
  // heading right after it is still a header. The opening `(` and both closing `)` net to zero. If
  // the mode ever saw a closing `)` without its opening `(` — e.g. a multiplexing outer mode that
  // hides the `#codedown(` prefix but not the closing line — parenDepth would go negative and this
  // heading would silently stop being highlighted.
  MT("headingAfterCodedownCell",
     "[variable #codedown][punctuation (```][variable python3]",
     "[def print][punctuation (][string \"hi\"][punctuation )]",
     "[punctuation ```,] [variable output]: [def raw][punctuation (][string \"x\"][punctuation ,] [variable block]: [atom true][punctuation ))]",
     "[header&header-2 == Heading] [header&header-2 after] [header&header-2 cell]");

  // ---------------------------------------------------------------------------
  // Inline markup
  // ---------------------------------------------------------------------------

  // Strong `*...*` and emphasis `_..._`.
  MT("strongAndEmphasis",
     "[strong *strong*] and [em _emphasis_]");

  // Like headings, a strong/emphasis span is broken up by spaces (the space itself is unstyled), so
  // a multi-word `*...*` shows up as one run per word rather than a single span.
  MT("strongSplitBySpaces",
     "[strong *two] [strong words*]");

  // Emphasis does not nest inside strong: once inside `*...*`, the `_` is treated as strong content
  // rather than opening an emphasis span.
  MT("nestedEmphasisStaysStrong",
     "[strong *_both_*]");

  // Inline raw `` `...` ``.
  MT("inlineRaw",
     "text [variable-2 `let x = 1`] more");

  // Escape sequences, including unicode escapes `\\u{...}`.
  MT("escapes",
     "a [string-2 \\*] b [string-2 \\_] c [string-2 \\u{1F600}]");

  // Bare http(s) URLs are highlighted as links.
  MT("link",
     "see [link https://typst.app/docs] ok");

  // Bullet (`-`) and numbered (`+`) list markers at the start of a line (the marker and its trailing
  // space are the styled run; the item text after it is plain).
  MT("listItems",
     "[variable-2 - ]first item",
     "[variable-2 + ]second item");

  // ---------------------------------------------------------------------------
  // Math
  // ---------------------------------------------------------------------------

  // Inline math `$...$` is one run; parens inside it don't affect the markup paren depth, so a
  // heading after math still works.
  MT("inlineMath",
     "Euler: [variable-3 $e^(i pi) + 1 = 0$]",
     "[header&header-1 = After] [header&header-1 math]");

  // ---------------------------------------------------------------------------
  // Code expressions
  // ---------------------------------------------------------------------------

  // `#let` bindings: keyword, identifier, operator, and a number or string value.
  MT("letBindings",
     "[keyword #let] [variable x] [operator =] [number 42]",
     "[keyword #let] [variable s] [operator =] [string \"hello\"]");

  // Control-flow keywords, the `in` keyword, and a function call (`range(...)` is styled `def`).
  MT("controlFlow",
     "[keyword #if] [variable x] [operator >] [number 1] [punctuation {] [punctuation }]",
     "[keyword #for] [variable i] [keyword in] [def range][punctuation (][number 3][punctuation )] [punctuation {] [punctuation }]");

  // Import and show statements (`=>` is an operator).
  MT("importAndShow",
     "[keyword #import] [string \"t.typ\"]: [variable foo]",
     "[keyword #show] [variable heading]: [variable it] [operator =>] [variable it]");

  // The value literals `none`, `auto`, `true` and `false` are styled `atom`, distinct from control
  // keywords like `let`/`if`.
  MT("atoms",
     "[keyword #let] [variable a] [operator =] [atom none]",
     "[keyword #let] [variable b] [operator =] [atom auto]",
     "[keyword #let] [variable c] [operator =] [atom true]",
     "[keyword #let] [variable d] [operator =] [atom false]");

  // Numbers: integers, decimals, and exponents.
  MT("numbers",
     "[keyword #let] [variable n] [operator =] [number 3.14]",
     "[keyword #let] [variable e] [operator =] [number 1e10]",
     "[keyword #let] [variable z] [operator =] [number 0]");

  // A `#{ ... }` code block; a bare identifier followed by `(` inside code is styled `def`.
  MT("codeBlockCall",
     "[operator #][punctuation {] [def foo][punctuation (][number 1][punctuation )] [punctuation }]");

  // ---------------------------------------------------------------------------
  // Comments
  // ---------------------------------------------------------------------------

  // Line comments, in both markup and code positions.
  MT("lineComments",
     "[comment // a comment]",
     "[keyword #let] [variable y] [operator =] [number 1] [comment // trailing]");

  // Block comments span lines (comment state carries across the newline).
  MT("blockComment",
     "[comment /* multi]",
     "[comment    line */] text");
})();
