// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE

(function() {
  var config = {tabSize: 4, indentUnit: 2}
  var mode = CodeMirror.getMode(config, "markdown");
  function MT(name) { test.mode(name, mode, Array.prototype.slice.call(arguments, 1)); }
  var modeHighlightFormatting = CodeMirror.getMode(config, {name: "markdown", highlightFormatting: true});
  function FT(name) { test.mode(name, modeHighlightFormatting, Array.prototype.slice.call(arguments, 1)); }
  var modeMT_noXml = CodeMirror.getMode(config, {name: "markdown", xml: false});
  function MT_noXml(name) { test.mode(name, modeMT_noXml, Array.prototype.slice.call(arguments, 1)); }
  var modeMT_noFencedHighlight = CodeMirror.getMode(config, {name: "markdown", fencedCodeBlockHighlighting: false});
  function MT_noFencedHighlight(name) { test.mode(name, modeMT_noFencedHighlight, Array.prototype.slice.call(arguments, 1)); }
  var modeAtxNoSpace = CodeMirror.getMode(config, {name: "markdown", allowAtxHeaderWithoutSpace: true});
  function AtxNoSpaceTest(name) { test.mode(name, modeAtxNoSpace, Array.prototype.slice.call(arguments, 1)); }
  var modeOverrideClasses = CodeMirror.getMode(config, {
    name: "markdown",
    strikethrough: true,
    emoji: true,
    tokenTypeOverrides: {
      "header" : "override-header",
      "code" : "override-code",
      "quote" : "override-quote",
      "list1" : "override-list1",
      "list2" : "override-list2",
      "list3" : "override-list3",
      "hr" : "override-hr",
      "image" : "override-image",
      "imageAltText": "override-image-alt-text",
      "imageMarker": "override-image-marker",
      "linkInline" : "override-link-inline",
      "linkEmail" : "override-link-email",
      "linkText" : "override-link-text",
      "linkHref" : "override-link-href",
      "em" : "override-em",
      "strong" : "override-strong",
      "strikethrough" : "override-strikethrough",
      "emoji" : "override-emoji"
  }});
  function TokenTypeOverrideTest(name) { test.mode(name, modeOverrideClasses, Array.prototype.slice.call(arguments, 1)); }
  var modeFormattingOverride = CodeMirror.getMode(config, {
    name: "markdown",
    highlightFormatting: true,
    tokenTypeOverrides: {
      "formatting" : "override-formatting"
  }});
  function FormatTokenTypeOverrideTest(name) { test.mode(name, modeFormattingOverride, Array.prototype.slice.call(arguments, 1)); }
  var modeET = CodeMirror.getMode(config, {name: "markdown", emoji: true});
  function ET(name) { test.mode(name, modeET, Array.prototype.slice.call(arguments, 1)); }


  FT("formatting_emAsterisk",
     "[em&formatting&formatting-em *][em foo][em&formatting&formatting-em *]");

  FT("formatting_emUnderscore",
     "[em&formatting&formatting-em _][em foo][em&formatting&formatting-em _]");

  FT("formatting_strongAsterisk",
     "[strong&formatting&formatting-strong **][strong foo][strong&formatting&formatting-strong **]");

  FT("formatting_strongUnderscore",
     "[strong&formatting&formatting-strong __][strong foo][strong&formatting&formatting-strong __]");

  FT("formatting_codeBackticks",
     "[comment&formatting&formatting-code `][comment foo][comment&formatting&formatting-code `]");

  FT("formatting_doubleBackticks",
     "[comment&formatting&formatting-code ``][comment foo ` bar][comment&formatting&formatting-code ``]");

  FT("formatting_atxHeader",
     "[header&header-1&formatting&formatting-header&formatting-header-1 # ][header&header-1 foo # bar ][header&header-1&formatting&formatting-header&formatting-header-1 #]");

  FT("formatting_setextHeader",
     "[header&header-1 foo]",
     "[header&header-1&formatting&formatting-header&formatting-header-1 =]");

  FT("formatting_blockquote",
     "[quote&quote-1&formatting&formatting-quote&formatting-quote-1 > ][quote&quote-1 foo]");

  FT("formatting_list",
     "[list1&formatting&formatting-list&formatting-list-ul - ][list1 foo]");
  FT("formatting_list",
     "[list1&formatting&formatting-list&formatting-list-ol 1. ][list1 foo]");

  FT("formatting_link",
     "[link&formatting&formatting-link [][link foo][link&formatting&formatting-link ]]][string&formatting&formatting-link-string&url (][string&url http://example.com/][string&formatting&formatting-link-string&url )]");

  FT("formatting_linkReference",
     "[link&formatting&formatting-link [][link foo][link&formatting&formatting-link ]]][string&formatting&formatting-link-string&url [][string&url bar][string&formatting&formatting-link-string&url ]]]",
     "[link&formatting&formatting-link [][link bar][link&formatting&formatting-link ]]:] [string&url http://example.com/]");

  FT("formatting_linkWeb",
     "[link&formatting&formatting-link <][link http://example.com/][link&formatting&formatting-link >]");

  FT("formatting_linkEmail",
     "[link&formatting&formatting-link <][link user@example.com][link&formatting&formatting-link >]");

  FT("formatting_escape",
     "[formatting-escape \\*]");

  FT("formatting_image",
     "[formatting&formatting-image&image&image-marker !][formatting&formatting-image&image&image-alt-text&link [[][image&image-alt-text&link alt text][formatting&formatting-image&image&image-alt-text&link ]]][formatting&formatting-link-string&string&url (][url&string http://link.to/image.jpg][formatting&formatting-link-string&string&url )]");

  FT("codeBlock",
     "[comment&formatting&formatting-code-block ```css]",
     "[tag foo]",
     "[comment&formatting&formatting-code-block ```]");

  MT("plainText",
     "foo");

  // Don't style single trailing space
  MT("trailingSpace1",
     "foo ");

  // Two or more trailing spaces should be styled with line break character
  MT("trailingSpace2",
     "foo[trailing-space-a  ][trailing-space-new-line  ]");

  MT("trailingSpace3",
     "foo[trailing-space-a  ][trailing-space-b  ][trailing-space-new-line  ]");

  MT("trailingSpace4",
     "foo[trailing-space-a  ][trailing-space-b  ][trailing-space-a  ][trailing-space-new-line  ]");

  // Code blocks using 4 spaces (regardless of CodeMirror.tabSize value)
  MT("codeBlocksUsing4Spaces",
     "    [comment foo]");

  // Code blocks using 4 spaces with internal indentation
  MT("codeBlocksUsing4SpacesIndentation",
     "    [comment bar]",
     "        [comment hello]",
     "            [comment world]",
     "    [comment foo]",
     "bar");

  // Code blocks should end even after extra indented lines
  MT("codeBlocksWithTrailingIndentedLine",
     "    [comment foo]",
     "        [comment bar]",
     "    [comment baz]",
     "    ",
     "hello");

  // Code blocks using 1 tab (regardless of CodeMirror.indentWithTabs value)
  MT("codeBlocksUsing1Tab",
     "\t[comment foo]");

  // No code blocks directly after paragraph
  // http://spec.commonmark.org/0.19/#example-65
  MT("noCodeBlocksAfterParagraph",
     "Foo",
     "    Bar");

  MT("codeBlocksAfterATX",
     "[header&header-1 # foo]",
     "    [comment code]");

  MT("codeBlocksAfterSetext",
     "[header&header-2 foo]",
     "[header&header-2 ---]",
     "    [comment code]");

  MT("codeBlocksAfterFencedCode",
     "[comment ```]",
     "[comment foo]",
     "[comment ```]",
     "    [comment code]");

  // Inline code using backticks
  MT("inlineCodeUsingBackticks",
     "foo [comment `bar`]");

  // Block code using single backtick (shouldn't work)
  MT("blockCodeSingleBacktick",
     "[comment `]",
     "[comment foo]",
     "[comment `]");

  // Unclosed backticks
  // Instead of simply marking as CODE, it would be nice to have an
  // incomplete flag for CODE, that is styled slightly different.
  MT("unclosedBackticks",
     "foo [comment `bar]");

  // Per documentation: "To include a literal backtick character within a
  // code span, you can use multiple backticks as the opening and closing
  // delimiters"
  MT("doubleBackticks",
     "[comment ``foo ` bar``]");

  // Tests based on Dingus
  // http://daringfireball.net/projects/markdown/dingus
  //
  // Multiple backticks within an inline code block
  MT("consecutiveBackticks",
     "[comment `foo```bar`]");

  // Multiple backticks within an inline code block with a second code block
  MT("consecutiveBackticks",
     "[comment `foo```bar`] hello [comment `world`]");

  // Unclosed with several different groups of backticks
  MT("unclosedBackticks",
     "[comment ``foo ``` bar` hello]");

  // Closed with several different groups of backticks
  MT("closedBackticks",
     "[comment ``foo ``` bar` hello``] world");

  // info string cannot contain backtick, thus should result in inline code
  MT("closingFencedMarksOnSameLine",
     "[comment ``` code ```] foo");

  // atx headers
  // http://daringfireball.net/projects/markdown/syntax#header

  MT("atxH1",
     "[header&header-1 # foo]");

  MT("atxH2",
     "[header&header-2 ## foo]");

  MT("atxH3",
     "[header&header-3 ### foo]");

  MT("atxH4",
     "[header&header-4 #### foo]");

  MT("atxH5",
     "[header&header-5 ##### foo]");

  MT("atxH6",
     "[header&header-6 ###### foo]");

  // http://spec.commonmark.org/0.19/#example-24
  MT("noAtxH7",
     "####### foo");

  // http://spec.commonmark.org/0.19/#example-25
  MT("noAtxH1WithoutSpace",
     "#5 bolt");

  // CommonMark requires a space after # but most parsers don't
  AtxNoSpaceTest("atxNoSpaceAllowed_H1NoSpace",
     "[header&header-1 #foo]");

  AtxNoSpaceTest("atxNoSpaceAllowed_H4NoSpace",
     "[header&header-4 ####foo]");

  AtxNoSpaceTest("atxNoSpaceAllowed_H1Space",
     "[header&header-1 # foo]");

  // Inline styles should be parsed inside headers
  MT("atxH1inline",
     "[header&header-1 # foo ][header&header-1&em *bar*]");

  MT("atxIndentedTooMuch",
     "[header&header-1 # foo]",
     "    [comment # bar]");

  // disable atx inside blockquote until we implement proper blockquote inner mode
  // TODO: fix to be CommonMark-compliant
  MT("atxNestedInsideBlockquote",
     "[quote&quote-1 > # foo]");

  MT("atxAfterBlockquote",
     "[quote&quote-1 > foo]",
     "[header&header-1 # bar]");

  // Setext headers - H1, H2
  // Per documentation, "Any number of underlining =’s or -’s will work."
  // http://daringfireball.net/projects/markdown/syntax#header
  // Ideally, the text would be marked as `header` as well, but this is
  // not really feasible at the moment. So, instead, we're testing against
  // what works today, to avoid any regressions.
  //
  // Check if single underlining = works
  MT("setextH1",
     "[header&header-1 foo]",
     "[header&header-1 =]");

  // Check if 3+ ='s work
  MT("setextH1",
     "[header&header-1 foo]",
     "[header&header-1 ===]");

  // Check if single underlining - works
  MT("setextH2",
     "[header&header-2 foo]",
     "[header&header-2 -]");

  // Check if 3+ -'s work
  MT("setextH2",
     "[header&header-2 foo]",
     "[header&header-2 ---]");

  // http://spec.commonmark.org/0.19/#example-45
  MT("setextH2AllowSpaces",
     "[header&header-2 foo]",
     "   [header&header-2 ----      ]");

  // http://spec.commonmark.org/0.19/#example-44
  MT("noSetextAfterIndentedCodeBlock",
     "     [comment foo]",
     "[hr ---]");

  MT("setextAfterFencedCode",
     "[comment ```]",
     "[comment foo]",
     "[comment ```]",
     "[header&header-2 bar]",
     "[header&header-2 ---]");

  MT("setextAferATX",
     "[header&header-1 # foo]",
     "[header&header-2 bar]",
     "[header&header-2 ---]");

  // http://spec.commonmark.org/0.19/#example-51
  MT("noSetextAfterQuote",
     "[quote&quote-1 > foo]",
     "[hr ---]",
     "",
     "[quote&quote-1 > foo]",
     "[quote&quote-1 bar]",
     "[hr ---]");

  MT("noSetextAfterList",
     "[list1 - foo]",
     "[hr ---]");

  MT("noSetextAfterList_listContinuation",
     "[list1 - foo]",
     "bar",
     "[hr ---]");

  MT("setextAfterList_afterIndentedCode",
     "[list1 - foo]",
     "",
     "      [comment bar]",
     "[header&header-2 baz]",
     "[header&header-2 ---]");

  MT("setextAfterList_afterFencedCodeBlocks",
     "[list1 - foo]",
     "",
     "      [comment ```]",
     "      [comment bar]",
     "      [comment ```]",
     "[header&header-2 baz]",
     "[header&header-2 ---]");

  MT("setextAfterList_afterHeader",
     "[list1 - foo]",
     "  [list1&header&header-1 # bar]",
     "[header&header-2 baz]",
     "[header&header-2 ---]");

  MT("setextAfterList_afterHr",
     "[list1 - foo]",
     "",
     "  [hr ---]",
     "[header&header-2 bar]",
     "[header&header-2 ---]");

  MT("setext_nestedInlineMarkup",
     "[header&header-1 foo ][em&header&header-1 *bar*]",
     "[header&header-1 =]");

  MT("setext_linkDef",
     "[link [[aaa]]:] [string&url http://google.com 'title']",
     "[hr ---]");

  // currently, looks max one line ahead, thus won't catch valid CommonMark
  //  markup
  MT("setext_oneLineLookahead",
     "foo",
     "[header&header-1 bar]",
     "[header&header-1 =]");

  // ensure we don't regard space after dash as a list
  MT("setext_emptyList",
     "[header&header-2 foo]",
     "[header&header-2 - ]",
     "foo");

  // Single-line blockquote with trailing space
  MT("blockquoteSpace",
     "[quote&quote-1 > foo]");

  // Single-line blockquote
  MT("blockquoteNoSpace",
     "[quote&quote-1 >foo]");

  // No blank line before blockquote
  MT("blockquoteNoBlankLine",
     "foo",
     "[quote&quote-1 > bar]");

  MT("blockquoteNested",
     "[quote&quote-1 > foo]",
     "[quote&quote-1 >][quote&quote-2 > foo]",
     "[quote&quote-1 >][quote&quote-2 >][quote&quote-3 > foo]");

  // ensure quote-level is inferred correctly even if indented
  MT("blockquoteNestedIndented",
     " [quote&quote-1 > foo]",
     " [quote&quote-1 >][quote&quote-2 > foo]",
     " [quote&quote-1 >][quote&quote-2 >][quote&quote-3 > foo]");

  // ensure quote-level is inferred correctly even if indented
  MT("blockquoteIndentedTooMuch",
     "foo",
     "    > bar");

  // Single-line blockquote followed by normal paragraph
  MT("blockquoteThenParagraph",
     "[quote&quote-1 >foo]",
     "",
     "bar");

  // Multi-line blockquote (lazy mode)
  MT("multiBlockquoteLazy",
     "[quote&quote-1 >foo]",
     "[quote&quote-1 bar]");

  // Multi-line blockquote followed by normal paragraph (lazy mode)
  MT("multiBlockquoteLazyThenParagraph",
     "[quote&quote-1 >foo]",
     "[quote&quote-1 bar]",
     "",
     "hello");

  // Multi-line blockquote (non-lazy mode)
  MT("multiBlockquote",
     "[quote&quote-1 >foo]",
     "[quote&quote-1 >bar]");

  // Multi-line blockquote followed by normal paragraph (non-lazy mode)
  MT("multiBlockquoteThenParagraph",
     "[quote&quote-1 >foo]",
     "[quote&quote-1 >bar]",
     "",
     "hello");

  // disallow lists inside blockquote for now because it causes problems outside blockquote
  // TODO: fix to be CommonMark-compliant
  MT("listNestedInBlockquote",
     "[quote&quote-1 > - foo]");

  // disallow fenced blocks inside blockquote because it causes problems outside blockquote
  // TODO: fix to be CommonMark-compliant
  MT("fencedBlockNestedInBlockquote",
     "[quote&quote-1 > ```]",
     "[quote&quote-1 > code]",
     "[quote&quote-1 > ```]",
     // ensure we still allow inline code
     "[quote&quote-1 > ][quote&quote-1&comment `code`]");

  // Header with leading space after continued blockquote (#3287, negative indentation)
  MT("headerAfterContinuedBlockquote",
     "[quote&quote-1 > foo]",
     "[quote&quote-1 bar]",
     "",
     " [header&header-1 # hello]");

  // Check list types

  MT("listAsterisk",
     "foo",
     "bar",
     "",
     "[list1 * foo]",
     "[list1 * bar]");

  MT("listPlus",
     "foo",
     "bar",
     "",
     "[list1 + foo]",
     "[list1 + bar]");

  MT("listDash",
     "foo",
     "bar",
     "",
     "[list1 - foo]",
     "[list1 - bar]");

  MT("listNumber",
     "foo",
     "bar",
     "",
     "[list1 1. foo]",
     "[list1 2. bar]");

  MT("listFromParagraph",
     "foo",
     "[list1 1. bar]",
     "[list1 2. hello]");

  // List after hr
  MT("listAfterHr",
     "[hr ---]",
     "[list1 - bar]");

  // List after header
  MT("listAfterHeader",
     "[header&header-1 # foo]",
     "[list1 - bar]");

  // hr after list
  MT("hrAfterList",
     "[list1 - foo]",
     "[hr -----]");

  MT("hrAfterFencedCode",
     "[comment ```]",
     "[comment code]",
     "[comment ```]",
     "[hr ---]");

  // allow hr inside lists
  // (require prev line to be empty or hr, TODO: non-CommonMark-compliant)
  MT("hrInsideList",
     "[list1 - foo]",
     "",
     "  [hr ---]",
     "     [hr ---]",
     "",
     "      [comment ---]");

  MT("consecutiveHr",
     "[hr ---]",
     "[hr ---]",
     "[hr ---]");

  // Formatting in lists (*)
  MT("listAsteriskFormatting",
     "[list1 * ][list1&em *foo*][list1  bar]",
     "[list1 * ][list1&strong **foo**][list1  bar]",
     "[list1 * ][list1&em&strong ***foo***][list1  bar]",
     "[list1 * ][list1&comment `foo`][list1  bar]");

  // Formatting in lists (+)
  MT("listPlusFormatting",
     "[list1 + ][list1&em *foo*][list1  bar]",
     "[list1 + ][list1&strong **foo**][list1  bar]",
     "[list1 + ][list1&em&strong ***foo***][list1  bar]",
     "[list1 + ][list1&comment `foo`][list1  bar]");

  // Formatting in lists (-)
  MT("listDashFormatting",
     "[list1 - ][list1&em *foo*][list1  bar]",
     "[list1 - ][list1&strong **foo**][list1  bar]",
     "[list1 - ][list1&em&strong ***foo***][list1  bar]",
     "[list1 - ][list1&comment `foo`][list1  bar]");

  // Formatting in lists (1.)
  MT("listNumberFormatting",
     "[list1 1. ][list1&em *foo*][list1  bar]",
     "[list1 2. ][list1&strong **foo**][list1  bar]",
     "[list1 3. ][list1&em&strong ***foo***][list1  bar]",
     "[list1 4. ][list1&comment `foo`][list1  bar]");

  // Paragraph lists
  MT("listParagraph",
     "[list1 * foo]",
     "",
     "[list1 * bar]");

  // Multi-paragraph lists
  //
  // 4 spaces
  MT("listMultiParagraph",
     "[list1 * foo]",
     "",
     "[list1 * bar]",
     "",
     "    [list1 hello]");

  // 4 spaces, extra blank lines (should still be list, per Dingus)
  MT("listMultiParagraphExtra",
     "[list1 * foo]",
     "",
     "[list1 * bar]",
     "",
     "",
     "    [list1 hello]");

  // 4 spaces, plus 1 space (should still be list, per Dingus)
  MT("listMultiParagraphExtraSpace",
     "[list1 * foo]",
     "",
     "[list1 * bar]",
     "",
     "     [list1 hello]",
     "",
     "    [list1 world]");

  // 1 tab
  MT("listTab",
     "[list1 * foo]",
     "",
     "[list1 * bar]",
     "",
     "\t[list1 hello]");

  // No indent
  MT("listNoIndent",
     "[list1 * foo]",
     "",
     "[list1 * bar]",
     "",
     "hello");

  MT("listCommonMarkIndentationCode",
     "[list1 * Code blocks also affect]",
     "  [list2 * The next level starts where the contents start.]",
     "   [list2 *    Anything less than that will keep the item on the same level.]",
     "       [list2 * Each list item can indent the first level further and further.]",
     "  [list2 * For the most part, this makes sense while writing a list.]",
     "    [list3 * This means two items with same indentation can be different levels.]",
     "     [list3 *  Each level has an indent requirement that can change between items.]",
     "       [list3 * A list item that meets this will be part of the next level.]",
     "   [list2 * Otherwise, it will be part of the level where it does meet this.]",
     " [list1 * World]");

  // should handle nested and un-nested lists
  MT("listCommonMark_MixedIndents",
     "[list1 * list1]",
     "    [list1 list1]",
     "  [list1&header&header-1 # heading still part of list1]",
     "  [list1 text after heading still part of list1]",
     "",
     "      [comment indented codeblock]",
     "  [list1 list1 after code block]",
     "  [list2 * list2]",
     // amount of spaces on empty lines between lists doesn't matter
     "              ",
     // extra empty lines irrelevant
     "",
     "",
     "    [list2 indented text part of list2]",
     "    [list3 * list3]",
     "",
     "    [list2 text at level of list2]",
     "",
     "  [list1 de-indented text part of list1 again]",
     "",
     "  [list1&comment ```]",
     "  [comment code]",
     "  [list1&comment ```]",
     "",
     "  [list1 text after fenced code]");

  // should correctly parse numbered list content indentation
  MT("listCommonMark_NumeberedListIndent",
     "[list1 1000. list with base indent of 6]",
     "",
     "      [list1 text must be indented 6 spaces at minimum]",
     "",
     "         [list1 9-spaces indented text still part of list]",
     "",
     "          [comment indented codeblock starts at 10 spaces]",
     "",
     "     [comment text indented by 5 spaces no longer belong to list]");

  // should consider tab as 4 spaces
  MT("listCommonMark_TabIndented",
     "[list1 * list]",
     "\t[list2 * list2]",
     "",
     "\t\t[list2 part of list2]");

  MT("listAfterBlockquote",
     "[quote&quote-1 > foo]",
     "[list1 - bar]");

  // shouldn't create sublist if it's indented more than allowed
  MT("nestedListIndentedTooMuch",
     "[list1 - foo]",
     "          [list1 - bar]");

  MT("listIndentedTooMuchAfterParagraph",
     "foo",
     "    - bar");

  // Blockquote
  MT("blockquote",
     "[list1 * foo]",
     "",
     "[list1 * bar]",
     "",
     "    [list1&quote&quote-1 > hello]");

  // Code block
  MT("blockquoteCode",
     "[list1 * foo]",
     "",
     "[list1 * bar]",
     "",
     "        [comment > hello]",
     "",
     "    [list1 world]");

  // Code block followed by text
  MT("blockquoteCodeText",
     "[list1 * foo]",
     "",
     "    [list1 bar]",
     "",
     "        [comment hello]",
     "",
     "    [list1 world]");

  // Nested list

  MT("listAsteriskNested",
     "[list1 * foo]",
     "",
     "    [list2 * bar]");

  MT("listPlusNested",
     "[list1 + foo]",
     "",
     "    [list2 + bar]");

  MT("listDashNested",
     "[list1 - foo]",
     "",
     "    [list2 - bar]");

  MT("listNumberNested",
     "[list1 1. foo]",
     "",
     "    [list2 2. bar]");

  MT("listMixed",
     "[list1 * foo]",
     "",
     "    [list2 + bar]",
     "",
     "        [list3 - hello]",
     "",
     "            [list1 1. world]");

  MT("listBlockquote",
     "[list1 * foo]",
     "",
     "    [list2 + bar]",
     "",
     "        [quote&quote-1&list2 > hello]");

  MT("listCode",
     "[list1 * foo]",
     "",
     "    [list2 + bar]",
     "",
     "            [comment hello]");

  // Code with internal indentation
  MT("listCodeIndentation",
     "[list1 * foo]",
     "",
     "        [comment bar]",
     "            [comment hello]",
     "                [comment world]",
     "        [comment foo]",
     "    [list1 bar]");

  // List nesting edge cases
  MT("listNested",
    "[list1 * foo]",
    "",
    "    [list2 * bar]",
    "",
    "       [list2 hello]"
  );
  MT("listNested",
    "[list1 * foo]",
    "",
    "    [list2 * bar]",
    "",
    "      [list3 * foo]"
  );

  // Code followed by text
  MT("listCodeText",
     "[list1 * foo]",
     "",
     "        [comment bar]",
     "",
     "hello");

  // Following tests directly from official Markdown documentation
  // http://daringfireball.net/projects/markdown/syntax#hr

  MT("hrSpace",
     "[hr * * *]");

  MT("hr",
     "[hr ***]");

  MT("hrLong",
     "[hr *****]");

  MT("hrSpaceDash",
     "[hr - - -]");

  MT("hrDashLong",
     "[hr ---------------------------------------]");

  //Images
  MT("Images",
     "[image&image-marker !][image&image-alt-text&link [[alt text]]][string&url (http://link.to/image.jpg)]")

  //Images with highlight alt text
  MT("imageEm",
     "[image&image-marker !][image&image-alt-text&link [[][image-alt-text&em&image&link *alt text*][image&image-alt-text&link ]]][string&url (http://link.to/image.jpg)]");

  MT("imageStrong",
     "[image&image-marker !][image&image-alt-text&link [[][image-alt-text&strong&image&link **alt text**][image&image-alt-text&link ]]][string&url (http://link.to/image.jpg)]");

  MT("imageEmStrong",
     "[image&image-marker !][image&image-alt-text&link [[][image&image-alt-text&em&strong&link ***alt text***][image&image-alt-text&link ]]][string&url (http://link.to/image.jpg)]");

  // Inline link with title
  MT("linkTitle",
     "[link [[foo]]][string&url (http://example.com/ \"bar\")] hello");

  // Inline link without title
  MT("linkNoTitle",
     "[link [[foo]]][string&url (http://example.com/)] bar");

  // Inline link with image
  MT("linkImage",
     "[link [[][link&image&image-marker !][link&image&image-alt-text&link [[alt text]]][string&url (http://link.to/image.jpg)][link ]]][string&url (http://example.com/)] bar");

  // Inline link with Em
  MT("linkEm",
     "[link [[][link&em *foo*][link ]]][string&url (http://example.com/)] bar");

  // Inline link with Strong
  MT("linkStrong",
     "[link [[][link&strong **foo**][link ]]][string&url (http://example.com/)] bar");

  // Inline link with EmStrong
  MT("linkEmStrong",
     "[link [[][link&em&strong ***foo***][link ]]][string&url (http://example.com/)] bar");

  MT("multilineLink",
     "[link [[foo]",
     "[link bar]]][string&url (https://foo#_a)]",
     "should not be italics")

  // Image with title
  MT("imageTitle",
     "[image&image-marker !][image&image-alt-text&link [[alt text]]][string&url (http://example.com/ \"bar\")] hello");

  // Image without title
  MT("imageNoTitle",
     "[image&image-marker !][image&image-alt-text&link [[alt text]]][string&url (http://example.com/)] bar");

  // Image with asterisks
  MT("imageAsterisks",
     "[image&image-marker !][image&image-alt-text&link [[ ][image&image-alt-text&em&link *alt text*][image&image-alt-text&link ]]][string&url (http://link.to/image.jpg)] bar");

  // Not a link. Should be normal text due to square brackets being used
  // regularly in text, especially in quoted material, and no space is allowed
  // between square brackets and parentheses (per Dingus).
  MT("notALink",
     "[link [[foo]]] (bar)");

  // Reference-style links
  MT("linkReference",
     "[link [[foo]]][string&url [[bar]]] hello");

  // Reference-style links with Em
  MT("linkReferenceEm",
     "[link [[][link&em *foo*][link ]]][string&url [[bar]]] hello");

  // Reference-style links with Strong
  MT("linkReferenceStrong",
     "[link [[][link&strong **foo**][link ]]][string&url [[bar]]] hello");

  // Reference-style links with EmStrong
  MT("linkReferenceEmStrong",
     "[link [[][link&em&strong ***foo***][link ]]][string&url [[bar]]] hello");

  // Reference-style links with optional space separator (per documentation)
  // "You can optionally use a space to separate the sets of brackets"
  MT("linkReferenceSpace",
     "[link [[foo]]] [string&url [[bar]]] hello");

  // Should only allow a single space ("...use *a* space...")
  MT("linkReferenceDoubleSpace",
     "[link [[foo]]]  [link [[bar]]] hello");

  // Reference-style links with implicit link name
  MT("linkImplicit",
     "[link [[foo]]][string&url [[]]] hello");

  // @todo It would be nice if, at some point, the document was actually
  // checked to see if the referenced link exists

  // Link label, for reference-style links (taken from documentation)

  MT("labelNoTitle",
     "[link [[foo]]:] [string&url http://example.com/]");

  MT("labelIndented",
     "   [link [[foo]]:] [string&url http://example.com/]");

  MT("labelSpaceTitle",
     "[link [[foo bar]]:] [string&url http://example.com/ \"hello\"]");

  MT("labelDoubleTitle",
     "[link [[foo bar]]:] [string&url http://example.com/ \"hello\"] \"world\"");

  MT("labelTitleDoubleQuotes",
     "[link [[foo]]:] [string&url http://example.com/  \"bar\"]");

  MT("labelTitleSingleQuotes",
     "[link [[foo]]:] [string&url http://example.com/  'bar']");

  MT("labelTitleParentheses",
     "[link [[foo]]:] [string&url http://example.com/  (bar)]");

  MT("labelTitleInvalid",
     "[link [[foo]]:] [string&url http://example.com/] bar");

  MT("labelLinkAngleBrackets",
     "[link [[foo]]:] [string&url <http://example.com/>  \"bar\"]");

  MT("labelTitleNextDoubleQuotes",
     "[link [[foo]]:] [string&url http://example.com/]",
     "[string \"bar\"] hello");

  MT("labelTitleNextSingleQuotes",
     "[link [[foo]]:] [string&url http://example.com/]",
     "[string 'bar'] hello");

  MT("labelTitleNextParentheses",
     "[link [[foo]]:] [string&url http://example.com/]",
     "[string (bar)] hello");

  MT("labelTitleNextMixed",
     "[link [[foo]]:] [string&url http://example.com/]",
     "(bar\" hello");

  MT("labelEscape",
     "[link [[foo \\]] ]]:] [string&url http://example.com/]");

  MT("labelEscapeColon",
     "[link [[foo \\]]: bar]]:] [string&url http://example.com/]");

  MT("labelEscapeEnd",
     "\\[[foo\\]]: http://example.com/");

  MT("linkWeb",
     "[link <http://example.com/>] foo");

  MT("linkWebDouble",
     "[link <http://example.com/>] foo [link <http://example.com/>]");

  MT("linkEmail",
     "[link <user@example.com>] foo");

  MT("linkEmailDouble",
     "[link <user@example.com>] foo [link <user@example.com>]");

  MT("emAsterisk",
     "[em *foo*] bar");

  MT("emUnderscore",
     "[em _foo_] bar");

  MT("emInWordAsterisk",
     "foo[em *bar*]hello");

  MT("emInWordUnderscore",
     "foo_bar_hello");

  // Per documentation: "...surround an * or _ with spaces, it’ll be
  // treated as a literal asterisk or underscore."

  MT("emEscapedBySpaceIn",
     "foo [em _bar _ hello_] world");

  MT("emEscapedBySpaceOut",
     "foo _ bar [em _hello_] world");

  MT("emEscapedByNewline",
     "foo",
     "_ bar [em _hello_] world");

  // Unclosed emphasis characters
  // Instead of simply marking as EM / STRONG, it would be nice to have an
  // incomplete flag for EM and STRONG, that is styled slightly different.
  MT("emIncompleteAsterisk",
     "foo [em *bar]");

  MT("emIncompleteUnderscore",
     "foo [em _bar]");

  MT("strongAsterisk",
     "[strong **foo**] bar");

  MT("strongUnderscore",
     "[strong __foo__] bar");

  MT("emStrongAsterisk",
     "[em *foo][em&strong **bar*][strong hello**] world");

  MT("emStrongUnderscore",
     "[em _foo ][em&strong __bar_][strong  hello__] world");

  // "...same character must be used to open and close an emphasis span.""
  MT("emStrongMixed",
     "[em _foo][em&strong **bar*hello__ world]");

  MT("emStrongMixed",
     "[em *foo ][em&strong __bar_hello** world]");

  MT("linkWithNestedParens",
     "[link [[foo]]][string&url (bar(baz))]")

  // These characters should be escaped:
  // \   backslash
  // `   backtick
  // *   asterisk
  // _   underscore
  // {}  curly braces
  // []  square brackets
  // ()  parentheses
  // #   hash mark
  // +   plus sign
  // -   minus sign (hyphen)
  // .   dot
  // !   exclamation mark

  MT("escapeBacktick",
     "foo \\`bar\\`");

  MT("doubleEscapeBacktick",
     "foo \\\\[comment `bar\\\\`]");

  MT("escapeAsterisk",
     "foo \\*bar\\*");

  MT("doubleEscapeAsterisk",
     "foo \\\\[em *bar\\\\*]");

  MT("escapeUnderscore",
     "foo \\_bar\\_");

  MT("doubleEscapeUnderscore",
     "foo \\\\[em _bar\\\\_]");

  MT("escapeHash",
     "\\# foo");

  MT("doubleEscapeHash",
     "\\\\# foo");

  MT("escapeNewline",
     "\\",
     "[em *foo*]");

  // Class override tests
  TokenTypeOverrideTest("overrideHeader1",
    "[override-header&override-header-1 # Foo]");

  TokenTypeOverrideTest("overrideHeader2",
    "[override-header&override-header-2 ## Foo]");

  TokenTypeOverrideTest("overrideHeader3",
    "[override-header&override-header-3 ### Foo]");

  TokenTypeOverrideTest("overrideHeader4",
    "[override-header&override-header-4 #### Foo]");

  TokenTypeOverrideTest("overrideHeader5",
    "[override-header&override-header-5 ##### Foo]");

  TokenTypeOverrideTest("overrideHeader6",
    "[override-header&override-header-6 ###### Foo]");

  TokenTypeOverrideTest("overrideCode",
    "[override-code `foo`]");

  TokenTypeOverrideTest("overrideCodeBlock",
    "[override-code ```]",
    "[override-code foo]",
    "[override-code ```]");

  TokenTypeOverrideTest("overrideQuote",
    "[override-quote&override-quote-1 > foo]",
    "[override-quote&override-quote-1 > bar]");

  TokenTypeOverrideTest("overrideQuoteNested",
    "[override-quote&override-quote-1 > foo]",
    "[override-quote&override-quote-1 >][override-quote&override-quote-2 > bar]",
    "[override-quote&override-quote-1 >][override-quote&override-quote-2 >][override-quote&override-quote-3 > baz]");

  TokenTypeOverrideTest("overrideLists",
    "[override-list1 - foo]",
    "",
    "    [override-list2 + bar]",
    "",
    "        [override-list3 * baz]",
    "",
    "            [override-list1 1. qux]",
    "",
    "                [override-list2 - quux]");

  TokenTypeOverrideTest("overrideHr",
    "[override-hr * * *]");

  TokenTypeOverrideTest("overrideImage",
    "[override-image&override-image-marker !][override-image&override-image-alt-text&link [[alt text]]][override-link-href&url (http://link.to/image.jpg)]");

  TokenTypeOverrideTest("overrideLinkText",
    "[override-link-text [[foo]]][override-link-href&url (http://example.com)]");

  TokenTypeOverrideTest("overrideLinkEmailAndInline",
    "[override-link-email <][override-link-inline foo@example.com>]");

  TokenTypeOverrideTest("overrideEm",
    "[override-em *foo*]");

  TokenTypeOverrideTest("overrideStrong",
    "[override-strong **foo**]");

  TokenTypeOverrideTest("overrideStrikethrough",
    "[override-strikethrough ~~foo~~]");

  TokenTypeOverrideTest("overrideEmoji",
    "[override-emoji :foo:]");

  FormatTokenTypeOverrideTest("overrideFormatting",
    "[override-formatting-escape \\*]");

  // Tests to make sure GFM-specific things aren't getting through

  MT("taskList",
     "[list1 * ][link&list1 [[ ]]][list1 bar]");

  MT("fencedCodeBlocks",
     "[comment ```]",
     "[comment foo]",
     "",
     "[comment bar]",
     "[comment ```]",
     "baz");

  MT("fencedCodeBlocks_invalidClosingFence_trailingText",
     "[comment ```]",
     "[comment foo]",
     "[comment ``` must not have trailing text]",
     "[comment baz]");

  MT("fencedCodeBlocks_invalidClosingFence_trailingTabs",
     "[comment ```]",
     "[comment foo]",
     "[comment ```\t]",
     "[comment baz]");

  MT("fencedCodeBlocks_validClosingFence",
     "[comment ```]",
     "[comment foo]",
     // may have trailing spaces
     "[comment ```     ]",
     "baz");

  MT("fencedCodeBlocksInList_closingFenceIndented",
     "[list1 - list]",
     "    [list1&comment ```]",
     "    [comment foo]",
     "     [list1&comment ```]",
     "    [list1 baz]");

  MT("fencedCodeBlocksInList_closingFenceIndentedTooMuch",
     "[list1 - list]",
     "    [list1&comment ```]",
     "    [comment foo]",
     "      [comment ```]",
     "    [comment baz]");

  MT("fencedCodeBlockModeSwitching",
     "[comment ```javascript]",
     "[variable foo]",
     "",
     "[comment ```]",
     "bar");

  MT_noFencedHighlight("fencedCodeBlock_noHighlight",
     "[comment ```javascript]",
     "[comment foo]",
     "[comment ```]");

  MT("fencedCodeBlockModeSwitchingObjc",
     "[comment ```objective-c]",
     "[keyword @property] [variable NSString] [operator *] [variable foo];",
     "[comment ```]",
     "bar");

  MT("fencedCodeBlocksMultipleChars",
     "[comment `````]",
     "[comment foo]",
     "[comment ```]",
     "[comment foo]",
     "[comment `````]",
     "bar");

  MT("fencedCodeBlocksTildes",
     "[comment ~~~]",
     "[comment foo]",
     "[comment ~~~]",
     "bar");

  MT("fencedCodeBlocksTildesMultipleChars",
     "[comment ~~~~~]",
     "[comment ~~~]",
     "[comment foo]",
     "[comment ~~~~~]",
     "bar");

  MT("fencedCodeBlocksMultipleChars",
     "[comment `````]",
     "[comment foo]",
     "[comment ```]",
     "[comment foo]",
     "[comment `````]",
     "bar");

  MT("fencedCodeBlocksMixed",
     "[comment ~~~]",
     "[comment ```]",
     "[comment foo]",
     "[comment ~~~]",
     "bar");

  MT("fencedCodeBlocksAfterBlockquote",
     "[quote&quote-1 > foo]",
     "[comment ```]",
     "[comment bar]",
     "[comment ```]");

  // fencedCode indented too much should act as simple indentedCode
  //  (hence has no highlight formatting)
  FT("tooMuchIndentedFencedCode",
     "    [comment ```]",
     "    [comment code]",
     "    [comment ```]");

  MT("autoTerminateFencedCodeWhenLeavingList",
     "[list1 - list1]",
     "  [list2 - list2]",
     "    [list2&comment ```]",
     "    [comment code]",
     "  [list2 - list2]",
     "  [list1&comment ```]",
     "  [comment code]",
     "[quote&quote-1 > foo]");

  // Tests that require XML mode

  MT("xmlMode",
     "[tag&bracket <][tag div][tag&bracket >]",
     "  *foo*",
     "  [tag&bracket <][tag http://github.com][tag&bracket />]",
     "[tag&bracket </][tag div][tag&bracket >]",
     "[link <http://github.com/>]");

  MT("xmlModeWithMarkdownInside",
     "[tag&bracket <][tag div] [attribute markdown]=[string 1][tag&bracket >]",
     "[em *foo*]",
     "[link <http://github.com/>]",
     "[tag </div>]",
     "[link <http://github.com/>]",
     "[tag&bracket <][tag div][tag&bracket >]",
     "[tag&bracket </][tag div][tag&bracket >]");

  MT("xmlModeLineBreakInTags",
     "[tag&bracket <][tag div] [attribute id]=[string \"1\"]",
     "     [attribute class]=[string \"sth\"][tag&bracket >]xxx",
     "[tag&bracket </][tag div][tag&bracket >]");

  MT("xmlModeCommentWithBlankLine",
     "[comment <!-- Hello]",
     "",
     "[comment World -->]");

  MT("xmlModeCDATA",
     "[atom <![CDATA[ Hello]",
     "",
     "[atom FooBar]",
     "[atom Test ]]]]>]");

  MT("xmlModePreprocessor",
     "[meta <?php] [meta echo '1234'; ?>]");

  MT_noXml("xmlHighlightDisabled",
     "<div>foo</div>");

  // Tests Emojis

  ET("emojiDefault",
    "[builtin :foobar:]");

  ET("emojiTable",
    " :--:");
})();
