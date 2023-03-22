import { Pos } from "../line/pos.js"
import { charCoords, cursorCoords, displayWidth, paddingH, wrappedLineExtentChar } from "../measurement/position_measurement.js"
import { elt } from "../util/dom.js"
import { getLine } from "../line/utils_line.js"
import { getOrder, iterateBidiSections } from "../util/bidi.js"
import { visualLine } from "../line/spans.js"

export function updateSelection(cm) {
  cm.display.input.showSelection(cm.display.input.prepareSelection())
}

export function prepareSelection(cm, primary = true) {
  let doc = cm.doc, result = {}
  let curFragment = result.cursors = document.createDocumentFragment()
  let selFragment = result.selection = document.createDocumentFragment()

  for (let i = 0; i < doc.sel.ranges.length; i++) {
    if (!primary && i == doc.sel.primIndex) continue
    let range = doc.sel.ranges[i]
    if (range.from().line >= cm.display.viewTo || range.to().line < cm.display.viewFrom) continue
    let collapsed = range.empty()
    if (collapsed || cm.options.showCursorWhenSelecting)
      drawSelectionCursor(cm, range.head, curFragment)
    if (!collapsed)
      drawSelectionRange(cm, range, selFragment)
  }
  return result
}

// Draws a cursor for the given range
export function drawSelectionCursor(cm, head, output) {
  let pos = cursorCoords(cm, head, "div", null, null, !cm.options.singleCursorHeightPerLine)

  let cursor = output.appendChild(elt("div", "\u00a0", "CodeMirror-cursor cursor"))
  cursor.style.left = pos.left + "px"
  cursor.style.top = pos.top + "px"
  cursor.style.height = Math.max(0, pos.bottom - pos.top) * cm.options.cursorHeight + "px"

  if (pos.other) {
    // Secondary cursor, shown when on a 'jump' in bi-directional text
    let otherCursor = output.appendChild(elt("div", "\u00a0", "CodeMirror-cursor CodeMirror-secondarycursor"))
    otherCursor.style.display = ""
    otherCursor.style.left = pos.other.left + "px"
    otherCursor.style.top = pos.other.top + "px"
    otherCursor.style.height = (pos.other.bottom - pos.other.top) * .85 + "px"
  }
}

function cmpCoords(a, b) { return a.top - b.top || a.left - b.left }

// Draws the given range as a highlighted selection
function drawSelectionRange(cm, range, output) {
  let display = cm.display, doc = cm.doc
  let fragment = document.createDocumentFragment()
  let padding = paddingH(cm.display), leftSide = padding.left

  let rightSide = display.lineDiv.offsetWidth - padding.right;
  let docLTR = doc.direction == "ltr"

  function isCodeBlockLineObj(obj) { return obj.wrapClass && (obj.wrapClass.split(" ").indexOf("codeblock") !== -1); }

  function add(left, top, width, bottom) {
    if (top < 0) top = 0
    top = Math.round(top)
    bottom = Math.round(bottom)
    fragment.appendChild(elt("div", null, "CodeMirror-selected selected-text", `position: absolute; left: ${left}px;
                             top: ${top}px; width: ${width == null ? rightSide - left : width}px;
                             height: ${bottom - top}px`))
  }

  function drawForLine(line, fromArg, toArg) {
    let lineObj = getLine(doc, line)
    let isCodeBlockLine = isCodeBlockLineObj(lineObj)
    let lineLen = lineObj.text.length
    let start, end
    function coords(ch, bias) {
      return charCoords(cm, Pos(line, ch), "div", lineObj, bias)
    }

    function wrapX(pos, dir, side) {
      let extent = wrappedLineExtentChar(cm, lineObj, null, pos)
      let prop = (dir == "ltr") == (side == "after") ? "left" : "right"
      let ch = side == "after" ? extent.begin : extent.end - (/\s/.test(lineObj.text.charAt(extent.end - 1)) ? 2 : 1)
      return coords(ch, prop)[prop]
    }

    let order = getOrder(lineObj, doc.direction)
    iterateBidiSections(order, fromArg || 0, toArg == null ? lineLen : toArg, (from, to, dir, i) => {
      let ltr = dir == "ltr"
      let fromPos = coords(from, ltr ? "left" : "right")
      let toPos = coords(to - 1, ltr ? "right" : "left")

      let openStart = fromArg == null && from == 0, openEnd = toArg == null && to == lineLen
      let first = i == 0, last = !order || i == order.length - 1
      if (toPos.top - fromPos.top <= 3) { // Single line
        let openLeft = (docLTR ? openStart : openEnd) && first
        let openRight = (docLTR ? openEnd : openStart) && last
        let left = openLeft ? leftSide : (ltr ? fromPos : toPos).left
        let right = openRight ? rightSide : (ltr ? toPos : fromPos).right
        let widthAdjust = (openRight && isCodeBlockLine) ? (-4) : 0;
        add(left, fromPos.top, right - left + widthAdjust, fromPos.bottom)
      } else { // Multiple lines
        let topLeft, topRight, botLeft, botRight
        let widthAdjust = isCodeBlockLine ? (-4) : 0;

        if (ltr) {
          topLeft = docLTR && openStart && first ? leftSide : fromPos.left
          topRight = docLTR ? rightSide : wrapX(from, dir, "before")
          botLeft = docLTR ? leftSide : wrapX(to, dir, "after")
          botRight = docLTR && openEnd && last ? rightSide : toPos.right
        } else {
          topLeft = !docLTR ? leftSide : wrapX(from, dir, "before")
          topRight = !docLTR && openStart && first ? rightSide : fromPos.right
          botLeft = !docLTR && openEnd && last ? leftSide : toPos.left
          botRight = !docLTR ? rightSide : wrapX(to, dir, "after")
        }
        add(topLeft, fromPos.top, topRight - topLeft + widthAdjust, fromPos.bottom)
        if (fromPos.bottom < toPos.top) add(leftSide, fromPos.bottom, rightSide - leftSide + widthAdjust, toPos.top)
        add(botLeft, toPos.top, botRight - botLeft + widthAdjust, toPos.bottom)
      }

      if (!start || cmpCoords(fromPos, start) < 0) start = fromPos
      if (cmpCoords(toPos, start) < 0) start = toPos
      if (!end || cmpCoords(fromPos, end) < 0) end = fromPos
      if (cmpCoords(toPos, end) < 0) end = toPos
    })
    return {start: start, end: end}
  }

  let sFrom = range.from(), sTo = range.to()
  if (sFrom.line == sTo.line) {
    drawForLine(sFrom.line, sFrom.ch, sTo.ch)
  } else {
    let fromLine = getLine(doc, sFrom.line), toLine = getLine(doc, sTo.line)
    let singleVLine = visualLine(fromLine) == visualLine(toLine)
    let leftEnd = drawForLine(sFrom.line, sFrom.ch, singleVLine ? fromLine.text.length + 1 : null).end
    let rightStart = drawForLine(sTo.line, 0, sTo.ch).start
    if (singleVLine) {
      if (leftEnd.top < rightStart.top - 2) {
        add(leftEnd.right, leftEnd.top, null, leftEnd.bottom)
        add(leftSide, rightStart.top, rightStart.left, rightStart.bottom)
      } else {
        add(leftEnd.right, leftEnd.top, rightStart.left - leftEnd.right, leftEnd.bottom)
      }
    }
    if (leftEnd.bottom < rightStart.top) {
      let curTop = leftEnd.bottom;
      for (let i = sFrom.line + 1; i < sTo.line; i += 1) {
        let start = i
        let currentValue = isCodeBlockLineObj(getLine(doc, i));
        while (i + 1 < sTo.line && isCodeBlockLineObj(getLine(doc, i + 1)) === currentValue) {
          i += 1
        }

        let bottom = charCoords(cm, Pos(i, cm.getLine(i).length), "div", getLine(doc, i), "left").bottom
        let left = leftSide + (currentValue ? 4 : 0)
        add(left, curTop, rightSide - left - (currentValue ? 4 : 0), bottom)
        curTop = bottom
      }
    }
  }

  output.appendChild(fragment)
}

// Cursor-blinking
export function restartBlink(cm) {
  if (!cm.state.focused) return
  let display = cm.display
  clearInterval(display.blinker)
  let on = true
  display.cursorDiv.style.visibility = ""
  if (cm.options.cursorBlinkRate > 0)
    display.blinker = setInterval(() => display.cursorDiv.style.visibility = (on = !on) ? "" : "hidden",
      cm.options.cursorBlinkRate)
  else if (cm.options.cursorBlinkRate < 0)
    display.cursorDiv.style.visibility = "hidden"
}
