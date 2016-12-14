Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _underscorePlus = require('underscore-plus');

var _underscorePlus2 = _interopRequireDefault(_underscorePlus);

var _mixto = require('mixto');

var _mixto2 = _interopRequireDefault(_mixto);

var _main = require('../main');

var _main2 = _interopRequireDefault(_main);

var _canvasLayer = require('../canvas-layer');

var _canvasLayer2 = _interopRequireDefault(_canvasLayer);

/**
 * The `CanvasDrawer` mixin is responsible for the rendering of a `Minimap`
 * in a `canvas` element.
 *
 * This mixin is injected in the `MinimapElement` prototype, so all these
 * methods  are available on any `MinimapElement` instance.
 */
'use babel';

var CanvasDrawer = (function (_Mixin) {
  _inherits(CanvasDrawer, _Mixin);

  function CanvasDrawer() {
    _classCallCheck(this, CanvasDrawer);

    _get(Object.getPrototypeOf(CanvasDrawer.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(CanvasDrawer, [{
    key: 'initializeCanvas',

    /**
     * Initializes the canvas elements needed to perform the `Minimap` rendering.
     */
    value: function initializeCanvas() {
      /**
      * The main canvas layer where lines are rendered.
      * @type {CanvasLayer}
      */
      this.tokensLayer = new _canvasLayer2['default']();
      /**
      * The canvas layer for decorations below the text.
      * @type {CanvasLayer}
      */
      this.backLayer = new _canvasLayer2['default']();
      /**
      * The canvas layer for decorations above the text.
      * @type {CanvasLayer}
      */
      this.frontLayer = new _canvasLayer2['default']();

      if (!this.pendingChanges) {
        /**
         * Stores the changes from the text editor.
         * @type {Array<Object>}
         * @access private
         */
        this.pendingChanges = [];
      }

      if (!this.pendingBackDecorationChanges) {
        /**
         * Stores the changes from the minimap back decorations.
         * @type {Array<Object>}
         * @access private
         */
        this.pendingBackDecorationChanges = [];
      }

      if (!this.pendingFrontDecorationChanges) {
        /**
         * Stores the changes from the minimap front decorations.
         * @type {Array<Object>}
         * @access private
         */
        this.pendingFrontDecorationChanges = [];
      }
    }

    /**
     * Returns the uppermost canvas in the MinimapElement.
     *
     * @return {HTMLCanvasElement} the html canvas element
     */
  }, {
    key: 'getFrontCanvas',
    value: function getFrontCanvas() {
      return this.frontLayer.canvas;
    }

    /**
     * Attaches the canvases into the specified container.
     *
     * @param  {HTMLElement} parent the canvases' container
     * @access private
     */
  }, {
    key: 'attachCanvases',
    value: function attachCanvases(parent) {
      this.backLayer.attach(parent);
      this.tokensLayer.attach(parent);
      this.frontLayer.attach(parent);
    }

    /**
     * Changes the size of all the canvas layers at once.
     *
     * @param {number} width the new width for the three canvases
     * @param {number} height the new height for the three canvases
     * @access private
     */
  }, {
    key: 'setCanvasesSize',
    value: function setCanvasesSize(width, height) {
      this.backLayer.setSize(width, height);
      this.tokensLayer.setSize(width, height);
      this.frontLayer.setSize(width, height);
    }

    /**
     * Performs an update of the rendered `Minimap` based on the changes
     * registered in the instance.
     */
  }, {
    key: 'updateCanvas',
    value: function updateCanvas() {
      var firstRow = this.minimap.getFirstVisibleScreenRow();
      var lastRow = this.minimap.getLastVisibleScreenRow();

      this.updateTokensLayer(firstRow, lastRow);
      this.updateBackDecorationsLayer(firstRow, lastRow);
      this.updateFrontDecorationsLayer(firstRow, lastRow);

      this.pendingChanges = [];
      this.pendingBackDecorationChanges = [];
      this.pendingFrontDecorationChanges = [];

      /**
       * The first row in the last render of the offscreen canvas.
       * @type {number}
       * @access private
       */
      this.offscreenFirstRow = firstRow;
      /**
       * The last row in the last render of the offscreen canvas.
       * @type {number}
       * @access private
       */
      this.offscreenLastRow = lastRow;
    }

    /**
     * Performs an update of the tokens layer using the pending changes array.
     *
     * @param  {number} firstRow firstRow the first row of the range to update
     * @param  {number} lastRow lastRow the last row of the range to update
     * @access private
     */
  }, {
    key: 'updateTokensLayer',
    value: function updateTokensLayer(firstRow, lastRow) {
      var intactRanges = this.computeIntactRanges(firstRow, lastRow, this.pendingChanges);

      this.redrawRangesOnLayer(this.tokensLayer, intactRanges, firstRow, lastRow, this.drawLines);
    }

    /**
     * Performs an update of the back decorations layer using the pending back
     * decorations changes arrays.
     *
     * @param  {number} firstRow firstRow the first row of the range to update
     * @param  {number} lastRow lastRow the last row of the range to update
     * @access private
     */
  }, {
    key: 'updateBackDecorationsLayer',
    value: function updateBackDecorationsLayer(firstRow, lastRow) {
      var intactRanges = this.computeIntactRanges(firstRow, lastRow, this.pendingBackDecorationChanges);

      this.redrawRangesOnLayer(this.backLayer, intactRanges, firstRow, lastRow, this.drawBackDecorationsForLines);
    }

    /**
     * Performs an update of the front decorations layer using the pending front
     * decorations changes arrays.
     *
     * @param  {number} firstRow firstRow the first row of the range to update
     * @param  {number} lastRow lastRow the last row of the range to update
     * @access private
     */
  }, {
    key: 'updateFrontDecorationsLayer',
    value: function updateFrontDecorationsLayer(firstRow, lastRow) {
      var intactRanges = this.computeIntactRanges(firstRow, lastRow, this.pendingFrontDecorationChanges);

      this.redrawRangesOnLayer(this.frontLayer, intactRanges, firstRow, lastRow, this.drawFrontDecorationsForLines);
    }

    //     ######   #######  ##        #######  ########   ######
    //    ##    ## ##     ## ##       ##     ## ##     ## ##    ##
    //    ##       ##     ## ##       ##     ## ##     ## ##
    //    ##       ##     ## ##       ##     ## ########   ######
    //    ##       ##     ## ##       ##     ## ##   ##         ##
    //    ##    ## ##     ## ##       ##     ## ##    ##  ##    ##
    //     ######   #######  ########  #######  ##     ##  ######

    /**
     * Returns the opacity value to use when rendering the `Minimap` text.
     *
     * @return {Number} the text opacity value
     */
  }, {
    key: 'getTextOpacity',
    value: function getTextOpacity() {
      return this.textOpacity;
    }

    /**
     * Returns the default text color for an editor content.
     *
     * The color value is directly read from the `TextEditorView` computed styles.
     *
     * @return {string} a CSS color
     */
  }, {
    key: 'getDefaultColor',
    value: function getDefaultColor() {
      var color = this.retrieveStyleFromDom(['.editor'], 'color', false, true);
      return this.transparentize(color, this.getTextOpacity());
    }

    /**
     * Returns the text color for the passed-in `token` object.
     *
     * The color value is read from the DOM by creating a node structure that
     * match the token `scope` property.
     *
     * @param  {Object} token a `TextEditor` token
     * @return {string} the CSS color for the provided token
     */
  }, {
    key: 'getTokenColor',
    value: function getTokenColor(token) {
      var scopes = token.scopeDescriptor || token.scopes;
      var color = this.retrieveStyleFromDom(scopes, 'color');

      return this.transparentize(color, this.getTextOpacity());
    }

    /**
     * Returns the background color for the passed-in `decoration` object.
     *
     * The color value is read from the DOM by creating a node structure that
     * match the decoration `scope` property unless the decoration provides
     * its own `color` property.
     *
     * @param  {Decoration} decoration the decoration to get the color for
     * @return {string} the CSS color for the provided decoration
     */
  }, {
    key: 'getDecorationColor',
    value: function getDecorationColor(decoration) {
      var properties = decoration.getProperties();
      if (properties.color) {
        return properties.color;
      }

      if (properties.scope) {
        var scopeString = properties.scope.split(/\s+/);
        return this.retrieveStyleFromDom(scopeString, 'background-color', false);
      } else {
        return this.getDefaultColor();
      }
    }

    /**
     * Converts a `rgb(...)` color into a `rgba(...)` color with the specified
     * opacity.
     *
     * @param  {string} color the CSS RGB color to transparentize
     * @param  {number} [opacity=1] the opacity amount
     * @return {string} the transparentized CSS color
     * @access private
     */
  }, {
    key: 'transparentize',
    value: function transparentize(color) {
      var opacity = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];

      return color.replace('rgb(', 'rgba(').replace(')', ', ' + opacity + ')');
    }

    //    ########  ########     ###    ##      ##
    //    ##     ## ##     ##   ## ##   ##  ##  ##
    //    ##     ## ##     ##  ##   ##  ##  ##  ##
    //    ##     ## ########  ##     ## ##  ##  ##
    //    ##     ## ##   ##   ######### ##  ##  ##
    //    ##     ## ##    ##  ##     ## ##  ##  ##
    //    ########  ##     ## ##     ##  ###  ###

    /**
     * Routine used to render changes in specific ranges for one layer.
     *
     * @param  {CanvasLayer} layer the layer to redraw
     * @param  {Array<Object>} intactRanges an array of the ranges to leave intact
     * @param  {number} firstRow firstRow the first row of the range to update
     * @param  {number} lastRow lastRow the last row of the range to update
     * @param  {Function} method the render method to use for the lines drawing
     * @access private
     */
  }, {
    key: 'redrawRangesOnLayer',
    value: function redrawRangesOnLayer(layer, intactRanges, firstRow, lastRow, method) {
      var devicePixelRatio = this.minimap.getDevicePixelRatio();
      var lineHeight = this.minimap.getLineHeight() * devicePixelRatio;

      layer.clearCanvas();

      if (intactRanges.length === 0) {
        method.call(this, firstRow, lastRow, 0);
      } else {
        for (var j = 0, len = intactRanges.length; j < len; j++) {
          var intact = intactRanges[j];

          layer.copyPartFromOffscreen(intact.offscreenRow * lineHeight, (intact.start - firstRow) * lineHeight, (intact.end - intact.start) * lineHeight);
        }
        this.drawLinesForRanges(method, intactRanges, firstRow, lastRow);
      }

      layer.resetOffscreenSize();
      layer.copyToOffscreen();
    }

    /**
     * Renders the lines between the intact ranges when an update has pending
     * changes.
     *
     * @param  {Function} method the render method to use for the lines drawing
     * @param  {Array<Object>} intactRanges the intact ranges in the minimap
     * @param  {number} firstRow the first row of the rendered region
     * @param  {number} lastRow the last row of the rendered region
     * @access private
     */
  }, {
    key: 'drawLinesForRanges',
    value: function drawLinesForRanges(method, ranges, firstRow, lastRow) {
      var currentRow = firstRow;
      for (var i = 0, len = ranges.length; i < len; i++) {
        var range = ranges[i];

        method.call(this, currentRow, range.start, currentRow - firstRow);

        currentRow = range.end;
      }
      if (currentRow <= lastRow) {
        method.call(this, currentRow, lastRow, currentRow - firstRow);
      }
    }

    /**
     * Draws back decorations on the corresponding layer.
     *
     * The lines range to draw is specified by the `firstRow` and `lastRow`
     * parameters.
     *
     * @param  {number} firstRow the first row to render
     * @param  {number} lastRow the last row to render
     * @param  {number} offsetRow the relative offset to apply to rows when
     *                            rendering them
     * @access private
     */
  }, {
    key: 'drawBackDecorationsForLines',
    value: function drawBackDecorationsForLines(firstRow, lastRow, offsetRow) {
      if (firstRow > lastRow) {
        return;
      }

      var devicePixelRatio = this.minimap.getDevicePixelRatio();
      var lineHeight = this.minimap.getLineHeight() * devicePixelRatio;
      var charHeight = this.minimap.getCharHeight() * devicePixelRatio;
      var charWidth = this.minimap.getCharWidth() * devicePixelRatio;
      var decorations = this.minimap.decorationsByTypeThenRows(firstRow, lastRow);

      var _tokensLayer$getSize = this.tokensLayer.getSize();

      var canvasWidth = _tokensLayer$getSize.width;
      var canvasHeight = _tokensLayer$getSize.height;

      var renderData = {
        context: this.backLayer.context,
        canvasWidth: canvasWidth,
        canvasHeight: canvasHeight,
        lineHeight: lineHeight,
        charWidth: charWidth,
        charHeight: charHeight,
        orders: _main2['default'].getPluginsOrder()
      };

      for (var screenRow = firstRow; screenRow <= lastRow; screenRow++) {
        renderData.row = offsetRow + (screenRow - firstRow);
        renderData.yRow = renderData.row * lineHeight;
        renderData.screenRow = screenRow;

        this.drawDecorations(screenRow, decorations, renderData, {
          'line': this.drawLineDecoration,
          'highlight-under': this.drawHighlightDecoration,
          'background-custom': this.drawCustomDecoration
        });
      }

      this.backLayer.context.fill();
    }

    /**
     * Draws front decorations on the corresponding layer.
     *
     * The lines range to draw is specified by the `firstRow` and `lastRow`
     * parameters.
     *
     * @param  {number} firstRow the first row to render
     * @param  {number} lastRow the last row to render
     * @param  {number} offsetRow the relative offset to apply to rows when
     *                            rendering them
     * @access private
     */
  }, {
    key: 'drawFrontDecorationsForLines',
    value: function drawFrontDecorationsForLines(firstRow, lastRow, offsetRow) {
      if (firstRow > lastRow) {
        return;
      }

      var devicePixelRatio = this.minimap.getDevicePixelRatio();
      var lineHeight = this.minimap.getLineHeight() * devicePixelRatio;
      var charHeight = this.minimap.getCharHeight() * devicePixelRatio;
      var charWidth = this.minimap.getCharWidth() * devicePixelRatio;
      var decorations = this.minimap.decorationsByTypeThenRows(firstRow, lastRow);

      var _tokensLayer$getSize2 = this.tokensLayer.getSize();

      var canvasWidth = _tokensLayer$getSize2.width;
      var canvasHeight = _tokensLayer$getSize2.height;

      var renderData = {
        context: this.frontLayer.context,
        canvasWidth: canvasWidth,
        canvasHeight: canvasHeight,
        lineHeight: lineHeight,
        charWidth: charWidth,
        charHeight: charHeight,
        orders: _main2['default'].getPluginsOrder()
      };

      for (var screenRow = firstRow; screenRow <= lastRow; screenRow++) {
        renderData.row = offsetRow + (screenRow - firstRow);
        renderData.yRow = renderData.row * lineHeight;
        renderData.screenRow = screenRow;

        this.drawDecorations(screenRow, decorations, renderData, {
          'gutter': this.drawGutterDecoration,
          'highlight-over': this.drawHighlightDecoration,
          'highlight-outline': this.drawHighlightOutlineDecoration,
          'foreground-custom': this.drawCustomDecoration
        });
      }

      renderData.context.fill();
    }

    /**
     * Returns an array of tokens by line.
     *
     * @param  {number} startRow The start row
     * @param  {number} endRow The end row
     * @return {Array<Array>} An array of tokens by line
     * @access private
     */
  }, {
    key: 'tokenLinesForScreenRows',
    value: function tokenLinesForScreenRows(startRow, endRow) {
      var _this = this;

      var editor = this.getTextEditor();
      var tokenLines = [];
      if (typeof editor.tokenizedLinesForScreenRows === 'function') {
        for (var tokenizedLine of editor.tokenizedLinesForScreenRows(startRow, endRow)) {
          if (tokenizedLine) {
            (function () {
              var invisibleRegExp = _this.getInvisibleRegExpForLine(tokenizedLine);
              tokenLines.push(tokenizedLine.tokens.map(function (token) {
                return {
                  value: token.value.replace(invisibleRegExp, ' '),
                  scopes: token.scopes.slice()
                };
              }));
            })();
          } else {
            return {
              value: '',
              scopes: []
            };
          }
        }
      } else {
        var displayLayer = editor.displayLayer;
        var invisibleRegExp = this.getInvisibleRegExp();
        var screenLines = displayLayer.getScreenLines(startRow, endRow);
        for (var _ref2 of screenLines) {
          var lineText = _ref2.lineText;
          var tagCodes = _ref2.tagCodes;

          var tokens = [];
          var scopes = [];
          var textIndex = 0;
          // console.log(lineText, invisibleRegExp, lineText.replace(invisibleRegExp, ' '))
          for (var tagCode of tagCodes) {
            if (displayLayer.isOpenTagCode(tagCode)) {
              scopes.push(displayLayer.tagForCode(tagCode));
            } else if (displayLayer.isCloseTagCode(tagCode)) {
              scopes.pop();
            } else {
              var value = lineText.substr(textIndex, tagCode);
              if (invisibleRegExp) {
                value = value.replace(invisibleRegExp, ' ');
              }
              tokens.push({ value: value, scopes: scopes.slice() });
              textIndex += tagCode;
            }
          }

          tokenLines.push(tokens);
        }
      }
      return tokenLines;
    }

    /**
     * Draws lines on the corresponding layer.
     *
     * The lines range to draw is specified by the `firstRow` and `lastRow`
     * parameters.
     *
     * @param  {number} firstRow the first row to render
     * @param  {number} lastRow the last row to render
     * @param  {number} offsetRow the relative offset to apply to rows when
     *                            rendering them
     * @access private
     */
  }, {
    key: 'drawLines',
    value: function drawLines(firstRow, lastRow, offsetRow) {
      if (firstRow > lastRow) {
        return;
      }

      var devicePixelRatio = this.minimap.getDevicePixelRatio();
      var lineHeight = this.minimap.getLineHeight() * devicePixelRatio;
      var charHeight = this.minimap.getCharHeight() * devicePixelRatio;
      var charWidth = this.minimap.getCharWidth() * devicePixelRatio;
      var displayCodeHighlights = this.displayCodeHighlights;
      var context = this.tokensLayer.context;

      var _tokensLayer$getSize3 = this.tokensLayer.getSize();

      var canvasWidth = _tokensLayer$getSize3.width;

      if (typeof this.tokenLinesForScreenRows !== 'function') {
        console.error('tokenLinesForScreenRows should be a function but it was ' + typeof this.tokenLinesForScreenRows, this.tokenLinesForScreenRows);

        return;
      }

      var screenRowsTokens = this.tokenLinesForScreenRows(firstRow, lastRow);

      var y = offsetRow * lineHeight;
      for (var i = 0; i < screenRowsTokens.length; i++) {
        var tokens = screenRowsTokens[i];
        var x = 0;
        context.clearRect(x, y, canvasWidth, lineHeight);
        for (var j = 0; j < tokens.length; j++) {
          var token = tokens[j];
          if (/^\s+$/.test(token.value)) {
            x += token.value.length * charWidth;
          } else {
            var color = displayCodeHighlights ? this.getTokenColor(token) : this.getDefaultColor();
            x = this.drawToken(context, token.value, color, x, y, charWidth, charHeight);
          }
          if (x > canvasWidth) {
            break;
          }
        }

        y += lineHeight;
      }

      context.fill();
    }

    /**
     * Returns the regexp to replace invisibles substitution characters
     * in editor lines.
     *
     * @return {RegExp} the regular expression to match invisible characters
     * @access private
     */
  }, {
    key: 'getInvisibleRegExp',
    value: function getInvisibleRegExp() {
      var invisibles = this.getTextEditor().getInvisibles();
      var regexp = [];
      if (invisibles.cr != null) {
        regexp.push(invisibles.cr);
      }
      if (invisibles.eol != null) {
        regexp.push(invisibles.eol);
      }
      if (invisibles.space != null) {
        regexp.push(invisibles.space);
      }
      if (invisibles.tab != null) {
        regexp.push(invisibles.tab);
      }

      return regexp.length === 0 ? null : RegExp(regexp.filter(function (s) {
        return typeof s === 'string';
      }).map(_underscorePlus2['default'].escapeRegExp).join('|'), 'g');
    }

    /**
     * Returns the regexp to replace invisibles substitution characters
     * in editor lines.
     *
     * @param  {Object} line the tokenized line
     * @return {RegExp} the regular expression to match invisible characters
     * @deprecated Is used only to support Atom version before display layer API
     * @access private
     */
  }, {
    key: 'getInvisibleRegExpForLine',
    value: function getInvisibleRegExpForLine(line) {
      if (line != null && line.invisibles != null) {
        var invisibles = [];
        if (line.invisibles.cr != null) {
          invisibles.push(line.invisibles.cr);
        }
        if (line.invisibles.eol != null) {
          invisibles.push(line.invisibles.eol);
        }
        if (line.invisibles.space != null) {
          invisibles.push(line.invisibles.space);
        }
        if (line.invisibles.tab != null) {
          invisibles.push(line.invisibles.tab);
        }

        return RegExp(invisibles.filter(function (s) {
          return typeof s === 'string';
        }).map(_underscorePlus2['default'].escapeRegExp).join('|'), 'g');
      }
    }

    /**
     * Draws a single token on the given context.
     *
     * @param  {CanvasRenderingContext2D} context the target canvas context
     * @param  {string} text the token's text content
     * @param  {string} color the token's CSS color
     * @param  {number} x the x position of the token in the line
     * @param  {number} y the y position of the line in the minimap
     * @param  {number} charWidth the width of a character in the minimap
     * @param  {number} charHeight the height of a character in the minimap
     * @return {number} the x position at the end of the token
     * @access private
     */
  }, {
    key: 'drawToken',
    value: function drawToken(context, text, color, x, y, charWidth, charHeight) {
      context.fillStyle = color;

      if (this.ignoreWhitespacesInTokens) {
        var _length = text.length * charWidth;
        context.fillRect(x, y, _length, charHeight);

        return x + _length;
      } else {
        var chars = 0;
        for (var j = 0, len = text.length; j < len; j++) {
          var char = text[j];
          if (/\s/.test(char)) {
            if (chars > 0) {
              context.fillRect(x - chars * charWidth, y, chars * charWidth, charHeight);
            }
            chars = 0;
          } else {
            chars++;
          }
          x += charWidth;
        }
        if (chars > 0) {
          context.fillRect(x - chars * charWidth, y, chars * charWidth, charHeight);
        }
        return x;
      }
    }

    /**
     * Draws the specified decorations for the current `screenRow`.
     *
     * The `decorations` object contains all the decorations grouped by type and
     * then rows.
     *
     * @param  {number} screenRow the screen row index for which
     *                            render decorations
     * @param  {Object} decorations the object containing all the decorations
     * @param  {Object} renderData the object containing the render data
     * @param  {Object} types an object with the type to render as key and the
     *                        render method as value
     * @access private
     */
  }, {
    key: 'drawDecorations',
    value: function drawDecorations(screenRow, decorations, renderData, types) {
      var decorationsToRender = [];

      renderData.context.clearRect(0, renderData.yRow, renderData.canvasWidth, renderData.lineHeight);

      for (var i in types) {
        decorationsToRender = decorationsToRender.concat(decorations[i] != null ? decorations[i][screenRow] || [] : []);
      }

      decorationsToRender.sort(function (a, b) {
        return (renderData.orders[a.properties.plugin] || 0) - (renderData.orders[b.properties.plugin] || 0);
      });

      if (decorationsToRender != null ? decorationsToRender.length : void 0) {
        for (var i = 0, len = decorationsToRender.length; i < len; i++) {
          types[decorationsToRender[i].properties.type].call(this, decorationsToRender[i], renderData);
        }
      }
    }

    /**
     * Draws a line decoration.
     *
     * @param  {Decoration} decoration the decoration to render
     * @param  {Object} data the data need to perform the render
     * @access private
     */
  }, {
    key: 'drawLineDecoration',
    value: function drawLineDecoration(decoration, data) {
      data.context.fillStyle = this.getDecorationColor(decoration);
      data.context.fillRect(0, data.yRow, data.canvasWidth, data.lineHeight);
    }

    /**
     * Draws a gutter decoration.
     *
     * @param  {Decoration} decoration the decoration to render
     * @param  {Object} data the data need to perform the render
     * @access private
     */
  }, {
    key: 'drawGutterDecoration',
    value: function drawGutterDecoration(decoration, data) {
      data.context.fillStyle = this.getDecorationColor(decoration);
      data.context.fillRect(0, data.yRow, 1, data.lineHeight);
    }

    /**
     * Draws a highlight decoration.
     *
     * It renders only the part of the highlight corresponding to the specified
     * row.
     *
     * @param  {Decoration} decoration the decoration to render
     * @param  {Object} data the data need to perform the render
     * @access private
     */
  }, {
    key: 'drawHighlightDecoration',
    value: function drawHighlightDecoration(decoration, data) {
      var range = decoration.getMarker().getScreenRange();
      var rowSpan = range.end.row - range.start.row;

      data.context.fillStyle = this.getDecorationColor(decoration);

      if (rowSpan === 0) {
        var colSpan = range.end.column - range.start.column;
        data.context.fillRect(range.start.column * data.charWidth, data.yRow, colSpan * data.charWidth, data.lineHeight);
      } else if (data.screenRow === range.start.row) {
        var x = range.start.column * data.charWidth;
        data.context.fillRect(x, data.yRow, data.canvasWidth - x, data.lineHeight);
      } else if (data.screenRow === range.end.row) {
        data.context.fillRect(0, data.yRow, range.end.column * data.charWidth, data.lineHeight);
      } else {
        data.context.fillRect(0, data.yRow, data.canvasWidth, data.lineHeight);
      }
    }

    /**
     * Draws a highlight outline decoration.
     *
     * It renders only the part of the highlight corresponding to the specified
     * row.
     *
     * @param  {Decoration} decoration the decoration to render
     * @param  {Object} data the data need to perform the render
     * @access private
     */
  }, {
    key: 'drawHighlightOutlineDecoration',
    value: function drawHighlightOutlineDecoration(decoration, data) {
      var bottomWidth = undefined,
          colSpan = undefined,
          width = undefined,
          xBottomStart = undefined,
          xEnd = undefined,
          xStart = undefined;
      var lineHeight = data.lineHeight;
      var charWidth = data.charWidth;
      var canvasWidth = data.canvasWidth;
      var screenRow = data.screenRow;

      var range = decoration.getMarker().getScreenRange();
      var rowSpan = range.end.row - range.start.row;
      var yStart = data.yRow;
      var yEnd = yStart + lineHeight;

      data.context.fillStyle = this.getDecorationColor(decoration);

      if (rowSpan === 0) {
        colSpan = range.end.column - range.start.column;
        width = colSpan * charWidth;
        xStart = range.start.column * charWidth;
        xEnd = xStart + width;

        data.context.fillRect(xStart, yStart, width, 1);
        data.context.fillRect(xStart, yEnd, width, 1);
        data.context.fillRect(xStart, yStart, 1, lineHeight);
        data.context.fillRect(xEnd, yStart, 1, lineHeight);
      } else if (rowSpan === 1) {
        xStart = range.start.column * data.charWidth;
        xEnd = range.end.column * data.charWidth;

        if (screenRow === range.start.row) {
          width = data.canvasWidth - xStart;
          xBottomStart = Math.max(xStart, xEnd);
          bottomWidth = data.canvasWidth - xBottomStart;

          data.context.fillRect(xStart, yStart, width, 1);
          data.context.fillRect(xBottomStart, yEnd, bottomWidth, 1);
          data.context.fillRect(xStart, yStart, 1, lineHeight);
          data.context.fillRect(canvasWidth - 1, yStart, 1, lineHeight);
        } else {
          width = canvasWidth - xStart;
          bottomWidth = canvasWidth - xEnd;

          data.context.fillRect(0, yStart, xStart, 1);
          data.context.fillRect(0, yEnd, xEnd, 1);
          data.context.fillRect(0, yStart, 1, lineHeight);
          data.context.fillRect(xEnd, yStart, 1, lineHeight);
        }
      } else {
        xStart = range.start.column * charWidth;
        xEnd = range.end.column * charWidth;
        if (screenRow === range.start.row) {
          width = canvasWidth - xStart;

          data.context.fillRect(xStart, yStart, width, 1);
          data.context.fillRect(xStart, yStart, 1, lineHeight);
          data.context.fillRect(canvasWidth - 1, yStart, 1, lineHeight);
        } else if (screenRow === range.end.row) {
          width = canvasWidth - xStart;

          data.context.fillRect(0, yEnd, xEnd, 1);
          data.context.fillRect(0, yStart, 1, lineHeight);
          data.context.fillRect(xEnd, yStart, 1, lineHeight);
        } else {
          data.context.fillRect(0, yStart, 1, lineHeight);
          data.context.fillRect(canvasWidth - 1, yStart, 1, lineHeight);
          if (screenRow === range.start.row + 1) {
            data.context.fillRect(0, yStart, xStart, 1);
          }
          if (screenRow === range.end.row - 1) {
            data.context.fillRect(xEnd, yEnd, canvasWidth - xEnd, 1);
          }
        }
      }
    }

    /**
     * Draws a custom decoration.
     *
     * It renders only the part of the highlight corresponding to the specified
     * row.
     *
     * @param  {Decoration} decoration the decoration to render
     * @param  {Object} data the data need to perform the render
     * @access private
     */
  }, {
    key: 'drawCustomDecoration',
    value: function drawCustomDecoration(decoration, data) {
      var renderRoutine = decoration.getProperties().render;

      if (renderRoutine) {
        data.color = this.getDecorationColor(decoration);
        renderRoutine(decoration, data);
      }
    }

    //    ########     ###    ##    ##  ######   ########  ######
    //    ##     ##   ## ##   ###   ## ##    ##  ##       ##    ##
    //    ##     ##  ##   ##  ####  ## ##        ##       ##
    //    ########  ##     ## ## ## ## ##   #### ######    ######
    //    ##   ##   ######### ##  #### ##    ##  ##             ##
    //    ##    ##  ##     ## ##   ### ##    ##  ##       ##    ##
    //    ##     ## ##     ## ##    ##  ######   ########  ######

    /**
     * Computes the ranges that are not affected by the current pending changes.
     *
     * @param  {number} firstRow the first row of the rendered region
     * @param  {number} lastRow the last row of the rendered region
     * @return {Array<Object>} the intact ranges in the rendered region
     * @access private
     */
  }, {
    key: 'computeIntactRanges',
    value: function computeIntactRanges(firstRow, lastRow, changes) {
      if (this.offscreenFirstRow == null && this.offscreenLastRow == null) {
        return [];
      }

      // At first, the whole range is considered intact
      var intactRanges = [{
        start: this.offscreenFirstRow,
        end: this.offscreenLastRow,
        offscreenRow: 0
      }];

      for (var i = 0, len = changes.length; i < len; i++) {
        var change = changes[i];
        var newIntactRanges = [];

        for (var j = 0, intactLen = intactRanges.length; j < intactLen; j++) {
          var range = intactRanges[j];

          if (change.end < range.start && change.screenDelta !== 0) {
            // The change is above of the range and lines are either
            // added or removed
            newIntactRanges.push({
              start: range.start + change.screenDelta,
              end: range.end + change.screenDelta,
              offscreenRow: range.offscreenRow
            });
          } else if (change.end < range.start || change.start > range.end) {
            // The change is outside the range but didn't add
            // or remove lines
            newIntactRanges.push(range);
          } else {
            // The change is within the range, there's one intact range
            // from the range start to the change start
            if (change.start > range.start) {
              newIntactRanges.push({
                start: range.start,
                end: change.start - 1,
                offscreenRow: range.offscreenRow
              });
            }
            if (change.end < range.end) {
              // The change ends within the range
              if (change.bufferDelta !== 0) {
                // Lines are added or removed, the intact range starts in the
                // next line after the change end plus the screen delta
                newIntactRanges.push({
                  start: change.end + change.screenDelta + 1,
                  end: range.end + change.screenDelta,
                  offscreenRow: range.offscreenRow + change.end + 1 - range.start
                });
              } else if (change.screenDelta !== 0) {
                // Lines are added or removed in the display buffer, the intact
                // range starts in the next line after the change end plus the
                // screen delta
                newIntactRanges.push({
                  start: change.end + change.screenDelta + 1,
                  end: range.end + change.screenDelta,
                  offscreenRow: range.offscreenRow + change.end + 1 - range.start
                });
              } else {
                // No lines are added, the intact range starts on the line after
                // the change end
                newIntactRanges.push({
                  start: change.end + 1,
                  end: range.end,
                  offscreenRow: range.offscreenRow + change.end + 1 - range.start
                });
              }
            }
          }
        }
        intactRanges = newIntactRanges;
      }

      return this.truncateIntactRanges(intactRanges, firstRow, lastRow);
    }

    /**
     * Truncates the intact ranges so that they doesn't expand past the visible
     * area of the minimap.
     *
     * @param  {Array<Object>} intactRanges the initial array of ranges
     * @param  {number} firstRow the first row of the rendered region
     * @param  {number} lastRow the last row of the rendered region
     * @return {Array<Object>} the array of truncated ranges
     * @access private
     */
  }, {
    key: 'truncateIntactRanges',
    value: function truncateIntactRanges(intactRanges, firstRow, lastRow) {
      var i = 0;
      while (i < intactRanges.length) {
        var range = intactRanges[i];

        if (range.start < firstRow) {
          range.offscreenRow += firstRow - range.start;
          range.start = firstRow;
        }

        if (range.end > lastRow) {
          range.end = lastRow;
        }

        if (range.start >= range.end) {
          intactRanges.splice(i--, 1);
        }

        i++;
      }

      return intactRanges.sort(function (a, b) {
        return a.offscreenRow - b.offscreenRow;
      });
    }
  }]);

  return CanvasDrawer;
})(_mixto2['default']);

exports['default'] = CanvasDrawer;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvbWluaW1hcC9saWIvbWl4aW5zL2NhbnZhcy1kcmF3ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OEJBRWMsaUJBQWlCOzs7O3FCQUNiLE9BQU87Ozs7b0JBQ1IsU0FBUzs7OzsyQkFDRixpQkFBaUI7Ozs7Ozs7Ozs7O0FBTHpDLFdBQVcsQ0FBQTs7SUFjVSxZQUFZO1lBQVosWUFBWTs7V0FBWixZQUFZOzBCQUFaLFlBQVk7OytCQUFaLFlBQVk7OztlQUFaLFlBQVk7Ozs7OztXQUlkLDRCQUFHOzs7OztBQUtsQixVQUFJLENBQUMsV0FBVyxHQUFHLDhCQUFpQixDQUFBOzs7OztBQUtwQyxVQUFJLENBQUMsU0FBUyxHQUFHLDhCQUFpQixDQUFBOzs7OztBQUtsQyxVQUFJLENBQUMsVUFBVSxHQUFHLDhCQUFpQixDQUFBOztBQUVuQyxVQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRTs7Ozs7O0FBTXhCLFlBQUksQ0FBQyxjQUFjLEdBQUcsRUFBRSxDQUFBO09BQ3pCOztBQUVELFVBQUksQ0FBQyxJQUFJLENBQUMsNEJBQTRCLEVBQUU7Ozs7OztBQU10QyxZQUFJLENBQUMsNEJBQTRCLEdBQUcsRUFBRSxDQUFBO09BQ3ZDOztBQUVELFVBQUksQ0FBQyxJQUFJLENBQUMsNkJBQTZCLEVBQUU7Ozs7OztBQU12QyxZQUFJLENBQUMsNkJBQTZCLEdBQUcsRUFBRSxDQUFBO09BQ3hDO0tBQ0Y7Ozs7Ozs7OztXQU9jLDBCQUFHO0FBQUUsYUFBTyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQTtLQUFFOzs7Ozs7Ozs7O1dBUXBDLHdCQUFDLE1BQU0sRUFBRTtBQUN0QixVQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUM3QixVQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUMvQixVQUFJLENBQUMsVUFB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QyxLQUFLLEdBQUcsUUFBUSxFQUFFO0FBQzFCLGVBQUssQ0FBQyxZQUFZLElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUE7QUFDNUMsZUFBSyxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUE7U0FDdkI7O0FBRUQsWUFBSSxLQUFLLENBQUMsR0FBRyxHQUFHLE9BQU8sRUFBRTtBQUFFLGVBQUssQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFBO1NBQUU7O0FBRWhELFlBQUksS0FBSyxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsR0FBRyxFQUFFO0FBQUUsc0JBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUE7U0FBRTs7QUFFN0QsU0FBQyxFQUFFLENBQUE7T0FDSjs7QUFFRCxhQUFPLFlBQVksQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFLO0FBQ2pDLGVBQU8sQ0FBQyxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUMsWUFBWSxDQUFBO09BQ3ZDLENBQUMsQ0FBQTtLQUNIOzs7U0F2NEJrQixZQUFZOzs7cUJBQVosWUFBWSIsImZpbGUiOiIvaG9tZS90YWthYWtpLy5hdG9tL3BhY2thZ2VzL21pbmltYXAvbGliL21peGlucy9jYW52YXMtZHJhd2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZS1wbHVzJ1xuaW1wb3J0IE1peGluIGZyb20gJ21peHRvJ1xuaW1wb3J0IE1haW4gZnJvbSAnLi4vbWFpbidcbmltcG9ydCBDYW52YXNMYXllciBmcm9tICcuLi9jYW52YXMtbGF5ZXInXG5cbi8qKlxuICogVGhlIGBDYW52YXNEcmF3ZXJgIG1peGluIGlzIHJlc3BvbnNpYmxlIGZvciB0aGUgcmVuZGVyaW5nIG9mIGEgYE1pbmltYXBgXG4gKiBpbiBhIGBjYW52YXNgIGVsZW1lbnQuXG4gKlxuICogVGhpcyBtaXhpbiBpcyBpbmplY3RlZCBpbiB0aGUgYE1pbmltYXBFbGVtZW50YCBwcm90b3R5cGUsIHNvIGFsbCB0aGVzZVxuICogbWV0aG9kcyAgYXJlIGF2YWlsYWJsZSBvbiBhbnkgYE1pbmltYXBFbGVtZW50YCBpbnN0YW5jZS5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2FudmFzRHJhd2VyIGV4dGVuZHMgTWl4aW4ge1xuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIGNhbnZhcyBlbGVtZW50cyBuZWVkZWQgdG8gcGVyZm9ybSB0aGUgYE1pbmltYXBgIHJlbmRlcmluZy5cbiAgICovXG4gIGluaXRpYWxpemVDYW52YXMgKCkge1xuICAgIC8qKlxuICAgICogVGhlIG1haW4gY2FudmFzIGxheWVyIHdoZXJlIGxpbmVzIGFyZSByZW5kZXJlZC5cbiAgICAqIEB0eXBlIHtDYW52YXNMYXllcn1cbiAgICAqL1xuICAgIHRoaXMudG9rZW5zTGF5ZXIgPSBuZXcgQ2FudmFzTGF5ZXIoKVxuICAgIC8qKlxuICAgICogVGhlIGNhbnZhcyBsYXllciBmb3IgZGVjb3JhdGlvbnMgYmVsb3cgdGhlIHRleHQuXG4gICAgKiBAdHlwZSB7Q2FudmFzTGF5ZXJ9XG4gICAgKi9cbiAgICB0aGlzLmJhY2tMYXllciA9IG5ldyBDYW52YXNMYXllcigpXG4gICAgLyoqXG4gICAgKiBUaGUgY2FudmFzIGxheWVyIGZvciBkZWNvcmF0aW9ucyBhYm92ZSB0aGUgdGV4dC5cbiAgICAqIEB0eXBlIHtDYW52YXNMYXllcn1cbiAgICAqL1xuICAgIHRoaXMuZnJvbnRMYXllciA9IG5ldyBDYW52YXNMYXllcigpXG5cbiAgICBpZiAoIXRoaXMucGVuZGluZ0NoYW5nZXMpIHtcbiAgICAgIC8qKlxuICAgICAgICogU3RvcmVzIHRoZSBjaGFuZ2VzIGZyb20gdGhlIHRleHQgZWRpdG9yLlxuICAgICAgICogQHR5cGUge0FycmF5PE9iamVjdD59XG4gICAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgICAqL1xuICAgICAgdGhpcy5wZW5kaW5nQ2hhbmdlcyA9IFtdXG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLnBlbmRpbmdCYWNrRGVjb3JhdGlvbkNoYW5nZXMpIHtcbiAgICAgIC8qKlxuICAgICAgICogU3RvcmVzIHRoZSBjaGFuZ2VzIGZyb20gdGhlIG1pbmltYXAgYmFjayBkZWNvcmF0aW9ucy5cbiAgICAgICAqIEB0eXBlIHtBcnJheTxPYmplY3Q+fVxuICAgICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICAgKi9cbiAgICAgIHRoaXMucGVuZGluZ0JhY2tEZWNvcmF0aW9uQ2hhbmdlcyA9IFtdXG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLnBlbmRpbmdGcm9udERlY29yYXRpb25DaGFuZ2VzKSB7XG4gICAgICAvKipcbiAgICAgICAqIFN0b3JlcyB0aGUgY2hhbmdlcyBmcm9tIHRoZSBtaW5pbWFwIGZyb250IGRlY29yYXRpb25zLlxuICAgICAgICogQHR5cGUge0FycmF5PE9iamVjdD59XG4gICAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgICAqL1xuICAgICAgdGhpcy5wZW5kaW5nRnJvbnREZWNvcmF0aW9uQ2hhbmdlcyA9IFtdXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHVwcGVybW9zdCBjYW52YXMgaW4gdGhlIE1pbmltYXBFbGVtZW50LlxuICAgKlxuICAgKiBAcmV0dXJuIHtIVE1MQ2FudmFzRWxlbWVudH0gdGhlIGh0bWwgY2FudmFzIGVsZW1lbnRcbiAgICovXG4gIGdldEZyb250Q2FudmFzICgpIHsgcmV0dXJuIHRoaXMuZnJvbnRMYXllci5jYW52YXMgfVxuXG4gIC8qKlxuICAgKiBBdHRhY2hlcyB0aGUgY2FudmFzZXMgaW50byB0aGUgc3BlY2lmaWVkIGNvbnRhaW5lci5cbiAgICpcbiAgICogQHBhcmFtICB7SFRNTEVsZW1lbnR9IHBhcmVudCB0aGUgY2FudmFzZXMnIGNvbnRhaW5lclxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGF0dGFjaENhbnZhc2VzIChwYXJlbnQpIHtcbiAgICB0aGlzLmJhY2tMYXllci5hdHRhY2gocGFyZW50KVxuICAgIHRoaXMudG9rZW5zTGF5ZXIuYXR0YWNoKHBhcmVudClcbiAgICB0aGlzLmZyb250TGF5ZXIuYXR0YWNoKHBhcmVudClcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGFuZ2VzIHRoZSBzaXplIG9mIGFsbCB0aGUgY2FudmFzIGxheWVycyBhdCBvbmNlLlxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGggdGhlIG5ldyB3aWR0aCBmb3IgdGhlIHRocmVlIGNhbnZhc2VzXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHQgdGhlIG5ldyBoZWlnaHQgZm9yIHRoZSB0aHJlZSBjYW52YXNlc1xuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIHNldENhbnZhc2VzU2l6ZSAod2lkdGgsIGhlaWdodCkge1xuICAgIHRoaXMuYmFja0xheWVyLnNldFNpemUod2lkdGgsIGhlaWdodClcbiAgICB0aGlzLnRva2Vuc0xheWVyLnNldFNpemUod2lkdGgsIGhlaWdodClcbiAgICB0aGlzLmZyb250TGF5ZXIuc2V0U2l6ZSh3aWR0aCwgaGVpZ2h0KVxuICB9XG5cbiAgLyoqXG4gICAqIFBlcmZvcm1zIGFuIHVwZGF0ZSBvZiB0aGUgcmVuZGVyZWQgYE1pbmltYXBgIGJhc2VkIG9uIHRoZSBjaGFuZ2VzXG4gICAqIHJlZ2lzdGVyZWQgaW4gdGhlIGluc3RhbmNlLlxuICAgKi9cbiAgdXBkYXRlQ2FudmFzICgpIHtcbiAgICBjb25zdCBmaXJzdFJvdyA9IHRoaXMubWluaW1hcC5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKVxuICAgIGNvbnN0IGxhc3RSb3cgPSB0aGlzLm1pbmltYXAuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKVxuXG4gICAgdGhpcy51cGRhdGVUb2tlbnNMYXllcihmaXJzdFJvdywgbGFzdFJvdylcbiAgICB0aGlzLnVwZGF0ZUJhY2tEZWNvcmF0aW9uc0xheWVyKGZpcnN0Um93LCBsYXN0Um93KVxuICAgIHRoaXMudXBkYXRlRnJvbnREZWNvcmF0aW9uc0xheWVyKGZpcnN0Um93LCBsYXN0Um93KVxuXG4gICAgdGhpcy5wZW5kaW5nQ2hhbmdlcyA9IFtdXG4gICAgdGhpcy5wZW5kaW5nQmFja0RlY29yYXRpb25DaGFuZ2VzID0gW11cbiAgICB0aGlzLnBlbmRpbmdGcm9udERlY29yYXRpb25DaGFuZ2VzID0gW11cblxuICAgIC8qKlxuICAgICAqIFRoZSBmaXJzdCByb3cgaW4gdGhlIGxhc3QgcmVuZGVyIG9mIHRoZSBvZmZzY3JlZW4gY2FudmFzLlxuICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5vZmZzY3JlZW5GaXJzdFJvdyA9IGZpcnN0Um93XG4gICAgLyoqXG4gICAgICogVGhlIGxhc3Qgcm93IGluIHRoZSBsYXN0IHJlbmRlciBvZiB0aGUgb2Zmc2NyZWVuIGNhbnZhcy5cbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMub2Zmc2NyZWVuTGFzdFJvdyA9IGxhc3RSb3dcbiAgfVxuXG4gIC8qKlxuICAgKiBQZXJmb3JtcyBhbiB1cGRhdGUgb2YgdGhlIHRva2VucyBsYXllciB1c2luZyB0aGUgcGVuZGluZyBjaGFuZ2VzIGFycmF5LlxuICAgKlxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGZpcnN0Um93IGZpcnN0Um93IHRoZSBmaXJzdCByb3cgb2YgdGhlIHJhbmdlIHRvIHVwZGF0ZVxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGxhc3RSb3cgbGFzdFJvdyB0aGUgbGFzdCByb3cgb2YgdGhlIHJhbmdlIHRvIHVwZGF0ZVxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIHVwZGF0ZVRva2Vuc0xheWVyIChmaXJzdFJvdywgbGFzdFJvdykge1xuICAgIGNvbnN0IGludGFjdFJhbmdlcyA9IHRoaXMuY29tcHV0ZUludGFjdFJhbmdlcyhmaXJzdFJvdywgbGFzdFJvdywgdGhpcy5wZW5kaW5nQ2hhbmdlcylcblxuICAgIHRoaXMucmVkcmF3UmFuZ2VzT25MYXllcih0aGlzLnRva2Vuc0xheWVyLCBpbnRhY3RSYW5nZXMsIGZpcnN0Um93LCBsYXN0Um93LCB0aGlzLmRyYXdMaW5lcylcbiAgfVxuXG4gIC8qKlxuICAgKiBQZXJmb3JtcyBhbiB1cGRhdGUgb2YgdGhlIGJhY2sgZGVjb3JhdGlvbnMgbGF5ZXIgdXNpbmcgdGhlIHBlbmRpbmcgYmFja1xuICAgKiBkZWNvcmF0aW9ucyBjaGFuZ2VzIGFycmF5cy5cbiAgICpcbiAgICogQHBhcmFtICB7bnVtYmVyfSBmaXJzdFJvdyBmaXJzdFJvdyB0aGUgZmlyc3Qgcm93IG9mIHRoZSByYW5nZSB0byB1cGRhdGVcbiAgICogQHBhcmFtICB7bnVtYmVyfSBsYXN0Um93IGxhc3RSb3cgdGhlIGxhc3Qgcm93IG9mIHRoZSByYW5nZSB0byB1cGRhdGVcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICB1cGRhdGVCYWNrRGVjb3JhdGlvbnNMYXllciAoZmlyc3RSb3csIGxhc3RSb3cpIHtcbiAgICBjb25zdCBpbnRhY3RSYW5nZXMgPSB0aGlzLmNvbXB1dGVJbnRhY3RSYW5nZXMoZmlyc3RSb3csIGxhc3RSb3csIHRoaXMucGVuZGluZ0JhY2tEZWNvcmF0aW9uQ2hhbmdlcylcblxuICAgIHRoaXMucmVkcmF3UmFuZ2VzT25MYXllcih0aGlzLmJhY2tMYXllciwgaW50YWN0UmFuZ2VzLCBmaXJzdFJvdywgbGFzdFJvdywgdGhpcy5kcmF3QmFja0RlY29yYXRpb25zRm9yTGluZXMpXG4gIH1cblxuICAvKipcbiAgICogUGVyZm9ybXMgYW4gdXBkYXRlIG9mIHRoZSBmcm9udCBkZWNvcmF0aW9ucyBsYXllciB1c2luZyB0aGUgcGVuZGluZyBmcm9udFxuICAgKiBkZWNvcmF0aW9ucyBjaGFuZ2VzIGFycmF5cy5cbiAgICpcbiAgICogQHBhcmFtICB7bnVtYmVyfSBmaXJzdFJvdyBmaXJzdFJvdyB0aGUgZmlyc3Qgcm93IG9mIHRoZSByYW5nZSB0byB1cGRhdGVcbiAgICogQHBhcmFtICB7bnVtYmVyfSBsYXN0Um93IGxhc3RSb3cgdGhlIGxhc3Qgcm93IG9mIHRoZSByYW5nZSB0byB1cGRhdGVcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICB1cGRhdGVGcm9udERlY29yYXRpb25zTGF5ZXIgKGZpcnN0Um93LCBsYXN0Um93KSB7XG4gICAgY29uc3QgaW50YWN0UmFuZ2VzID0gdGhpcy5jb21wdXRlSW50YWN0UmFuZ2VzKGZpcnN0Um93LCBsYXN0Um93LCB0aGlzLnBlbmRpbmdGcm9udERlY29yYXRpb25DaGFuZ2VzKVxuXG4gICAgdGhpcy5yZWRyYXdSYW5nZXNPbkxheWVyKHRoaXMuZnJvbnRMYXllciwgaW50YWN0UmFuZ2VzLCBmaXJzdFJvdywgbGFzdFJvdywgdGhpcy5kcmF3RnJvbnREZWNvcmF0aW9uc0ZvckxpbmVzKVxuICB9XG5cbiAgLy8gICAgICMjIyMjIyAgICMjIyMjIyMgICMjICAgICAgICAjIyMjIyMjICAjIyMjIyMjIyAgICMjIyMjI1xuICAvLyAgICAjIyAgICAjIyAjIyAgICAgIyMgIyMgICAgICAgIyMgICAgICMjICMjICAgICAjIyAjIyAgICAjI1xuICAvLyAgICAjIyAgICAgICAjIyAgICAgIyMgIyMgICAgICAgIyMgICAgICMjICMjICAgICAjIyAjI1xuICAvLyAgICAjIyAgICAgICAjIyAgICAgIyMgIyMgICAgICAgIyMgICAgICMjICMjIyMjIyMjICAgIyMjIyMjXG4gIC8vICAgICMjICAgICAgICMjICAgICAjIyAjIyAgICAgICAjIyAgICAgIyMgIyMgICAjIyAgICAgICAgICMjXG4gIC8vICAgICMjICAgICMjICMjICAgICAjIyAjIyAgICAgICAjIyAgICAgIyMgIyMgICAgIyMgICMjICAgICMjXG4gIC8vICAgICAjIyMjIyMgICAjIyMjIyMjICAjIyMjIyMjIyAgIyMjIyMjIyAgIyMgICAgICMjICAjIyMjIyNcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgb3BhY2l0eSB2YWx1ZSB0byB1c2Ugd2hlbiByZW5kZXJpbmcgdGhlIGBNaW5pbWFwYCB0ZXh0LlxuICAgKlxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IHRoZSB0ZXh0IG9wYWNpdHkgdmFsdWVcbiAgICovXG4gIGdldFRleHRPcGFjaXR5ICgpIHsgcmV0dXJuIHRoaXMudGV4dE9wYWNpdHkgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBkZWZhdWx0IHRleHQgY29sb3IgZm9yIGFuIGVkaXRvciBjb250ZW50LlxuICAgKlxuICAgKiBUaGUgY29sb3IgdmFsdWUgaXMgZGlyZWN0bHkgcmVhZCBmcm9tIHRoZSBgVGV4dEVkaXRvclZpZXdgIGNvbXB1dGVkIHN0eWxlcy5cbiAgICpcbiAgICogQHJldHVybiB7c3RyaW5nfSBhIENTUyBjb2xvclxuICAgKi9cbiAgZ2V0RGVmYXVsdENvbG9yICgpIHtcbiAgICBjb25zdCBjb2xvciA9IHRoaXMucmV0cmlldmVTdHlsZUZyb21Eb20oWycuZWRpdG9yJ10sICdjb2xvcicsIGZhbHNlLCB0cnVlKVxuICAgIHJldHVybiB0aGlzLnRyYW5zcGFyZW50aXplKGNvbG9yLCB0aGlzLmdldFRleHRPcGFjaXR5KCkpXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgdGV4dCBjb2xvciBmb3IgdGhlIHBhc3NlZC1pbiBgdG9rZW5gIG9iamVjdC5cbiAgICpcbiAgICogVGhlIGNvbG9yIHZhbHVlIGlzIHJlYWQgZnJvbSB0aGUgRE9NIGJ5IGNyZWF0aW5nIGEgbm9kZSBzdHJ1Y3R1cmUgdGhhdFxuICAgKiBtYXRjaCB0aGUgdG9rZW4gYHNjb3BlYCBwcm9wZXJ0eS5cbiAgICpcbiAgICogQHBhcmFtICB7T2JqZWN0fSB0b2tlbiBhIGBUZXh0RWRpdG9yYCB0b2tlblxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IHRoZSBDU1MgY29sb3IgZm9yIHRoZSBwcm92aWRlZCB0b2tlblxuICAgKi9cbiAgZ2V0VG9rZW5Db2xvciAodG9rZW4pIHtcbiAgICBjb25zdCBzY29wZXMgPSB0b2tlbi5zY29wZURlc2NyaXB0b3IgfHwgdG9rZW4uc2NvcGVzXG4gICAgY29uc3QgY29sb3IgPSB0aGlzLnJldHJpZXZlU3R5bGVGcm9tRG9tKHNjb3BlcywgJ2NvbG9yJylcblxuICAgIHJldHVybiB0aGlzLnRyYW5zcGFyZW50aXplKGNvbG9yLCB0aGlzLmdldFRleHRPcGFjaXR5KCkpXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYmFja2dyb3VuZCBjb2xvciBmb3IgdGhlIHBhc3NlZC1pbiBgZGVjb3JhdGlvbmAgb2JqZWN0LlxuICAgKlxuICAgKiBUaGUgY29sb3IgdmFsdWUgaXMgcmVhZCBmcm9tIHRoZSBET00gYnkgY3JlYXRpbmcgYSBub2RlIHN0cnVjdHVyZSB0aGF0XG4gICAqIG1hdGNoIHRoZSBkZWNvcmF0aW9uIGBzY29wZWAgcHJvcGVydHkgdW5sZXNzIHRoZSBkZWNvcmF0aW9uIHByb3ZpZGVzXG4gICAqIGl0cyBvd24gYGNvbG9yYCBwcm9wZXJ0eS5cbiAgICpcbiAgICogQHBhcmFtICB7RGVjb3JhdGlvbn0gZGVjb3JhdGlvbiB0aGUgZGVjb3JhdGlvbiB0byBnZXQgdGhlIGNvbG9yIGZvclxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IHRoZSBDU1MgY29sb3IgZm9yIHRoZSBwcm92aWRlZCBkZWNvcmF0aW9uXG4gICAqL1xuICBnZXREZWNvcmF0aW9uQ29sb3IgKGRlY29yYXRpb24pIHtcbiAgICBjb25zdCBwcm9wZXJ0aWVzID0gZGVjb3JhdGlvbi5nZXRQcm9wZXJ0aWVzKClcbiAgICBpZiAocHJvcGVydGllcy5jb2xvcikgeyByZXR1cm4gcHJvcGVydGllcy5jb2xvciB9XG5cbiAgICBpZiAocHJvcGVydGllcy5zY29wZSkge1xuICAgICAgY29uc3Qgc2NvcGVTdHJpbmcgPSBwcm9wZXJ0aWVzLnNjb3BlLnNwbGl0KC9cXHMrLylcbiAgICAgIHJldHVybiB0aGlzLnJldHJpZXZlU3R5bGVGcm9tRG9tKHNjb3BlU3RyaW5nLCAnYmFja2dyb3VuZC1jb2xvcicsIGZhbHNlKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXREZWZhdWx0Q29sb3IoKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhIGByZ2IoLi4uKWAgY29sb3IgaW50byBhIGByZ2JhKC4uLilgIGNvbG9yIHdpdGggdGhlIHNwZWNpZmllZFxuICAgKiBvcGFjaXR5LlxuICAgKlxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IGNvbG9yIHRoZSBDU1MgUkdCIGNvbG9yIHRvIHRyYW5zcGFyZW50aXplXG4gICAqIEBwYXJhbSAge251bWJlcn0gW29wYWNpdHk9MV0gdGhlIG9wYWNpdHkgYW1vdW50XG4gICAqIEByZXR1cm4ge3N0cmluZ30gdGhlIHRyYW5zcGFyZW50aXplZCBDU1MgY29sb3JcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICB0cmFuc3BhcmVudGl6ZSAoY29sb3IsIG9wYWNpdHkgPSAxKSB7XG4gICAgcmV0dXJuIGNvbG9yLnJlcGxhY2UoJ3JnYignLCAncmdiYSgnKS5yZXBsYWNlKCcpJywgYCwgJHtvcGFjaXR5fSlgKVxuICB9XG5cbiAgLy8gICAgIyMjIyMjIyMgICMjIyMjIyMjICAgICAjIyMgICAgIyMgICAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAgICMjICAgIyMgIyMgICAjIyAgIyMgICMjXG4gIC8vICAgICMjICAgICAjIyAjIyAgICAgIyMgICMjICAgIyMgICMjICAjIyAgIyNcbiAgLy8gICAgIyMgICAgICMjICMjIyMjIyMjICAjIyAgICAgIyMgIyMgICMjICAjI1xuICAvLyAgICAjIyAgICAgIyMgIyMgICAjIyAgICMjIyMjIyMjIyAjIyAgIyMgICMjXG4gIC8vICAgICMjICAgICAjIyAjIyAgICAjIyAgIyMgICAgICMjICMjICAjIyAgIyNcbiAgLy8gICAgIyMjIyMjIyMgICMjICAgICAjIyAjIyAgICAgIyMgICMjIyAgIyMjXG5cbiAgLyoqXG4gICAqIFJvdXRpbmUgdXNlZCB0byByZW5kZXIgY2hhbmdlcyBpbiBzcGVjaWZpYyByYW5nZXMgZm9yIG9uZSBsYXllci5cbiAgICpcbiAgICogQHBhcmFtICB7Q2FudmFzTGF5ZXJ9IGxheWVyIHRoZSBsYXllciB0byByZWRyYXdcbiAgICogQHBhcmFtICB7QXJyYXk8T2JqZWN0Pn0gaW50YWN0UmFuZ2VzIGFuIGFycmF5IG9mIHRoZSByYW5nZXMgdG8gbGVhdmUgaW50YWN0XG4gICAqIEBwYXJhbSAge251bWJlcn0gZmlyc3RSb3cgZmlyc3RSb3cgdGhlIGZpcnN0IHJvdyBvZiB0aGUgcmFuZ2UgdG8gdXBkYXRlXG4gICAqIEBwYXJhbSAge251bWJlcn0gbGFzdFJvdyBsYXN0Um93IHRoZSBsYXN0IHJvdyBvZiB0aGUgcmFuZ2UgdG8gdXBkYXRlXG4gICAqIEBwYXJhbSAge0Z1bmN0aW9ufSBtZXRob2QgdGhlIHJlbmRlciBtZXRob2QgdG8gdXNlIGZvciB0aGUgbGluZXMgZHJhd2luZ1xuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIHJlZHJhd1Jhbmdlc09uTGF5ZXIgKGxheWVyLCBpbnRhY3RSYW5nZXMsIGZpcnN0Um93LCBsYXN0Um93LCBtZXRob2QpIHtcbiAgICBjb25zdCBkZXZpY2VQaXhlbFJhdGlvID0gdGhpcy5taW5pbWFwLmdldERldmljZVBpeGVsUmF0aW8oKVxuICAgIGNvbnN0IGxpbmVIZWlnaHQgPSB0aGlzLm1pbmltYXAuZ2V0TGluZUhlaWdodCgpICogZGV2aWNlUGl4ZWxSYXRpb1xuXG4gICAgbGF5ZXIuY2xlYXJDYW52YXMoKVxuXG4gICAgaWYgKGludGFjdFJhbmdlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIG1ldGhvZC5jYWxsKHRoaXMsIGZpcnN0Um93LCBsYXN0Um93LCAwKVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGxldCBqID0gMCwgbGVuID0gaW50YWN0UmFuZ2VzLmxlbmd0aDsgaiA8IGxlbjsgaisrKSB7XG4gICAgICAgIGNvbnN0IGludGFjdCA9IGludGFjdFJhbmdlc1tqXVxuXG4gICAgICAgIGxheWVyLmNvcHlQYXJ0RnJvbU9mZnNjcmVlbihcbiAgICAgICAgICBpbnRhY3Qub2Zmc2NyZWVuUm93ICogbGluZUhlaWdodCxcbiAgICAgICAgICAoaW50YWN0LnN0YXJ0IC0gZmlyc3RSb3cpICogbGluZUhlaWdodCxcbiAgICAgICAgICAoaW50YWN0LmVuZCAtIGludGFjdC5zdGFydCkgKiBsaW5lSGVpZ2h0XG4gICAgICAgIClcbiAgICAgIH1cbiAgICAgIHRoaXMuZHJhd0xpbmVzRm9yUmFuZ2VzKG1ldGhvZCwgaW50YWN0UmFuZ2VzLCBmaXJzdFJvdywgbGFzdFJvdylcbiAgICB9XG5cbiAgICBsYXllci5yZXNldE9mZnNjcmVlblNpemUoKVxuICAgIGxheWVyLmNvcHlUb09mZnNjcmVlbigpXG4gIH1cblxuICAvKipcbiAgICogUmVuZGVycyB0aGUgbGluZXMgYmV0d2VlbiB0aGUgaW50YWN0IHJhbmdlcyB3aGVuIGFuIHVwZGF0ZSBoYXMgcGVuZGluZ1xuICAgKiBjaGFuZ2VzLlxuICAgKlxuICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gbWV0aG9kIHRoZSByZW5kZXIgbWV0aG9kIHRvIHVzZSBmb3IgdGhlIGxpbmVzIGRyYXdpbmdcbiAgICogQHBhcmFtICB7QXJyYXk8T2JqZWN0Pn0gaW50YWN0UmFuZ2VzIHRoZSBpbnRhY3QgcmFuZ2VzIGluIHRoZSBtaW5pbWFwXG4gICAqIEBwYXJhbSAge251bWJlcn0gZmlyc3RSb3cgdGhlIGZpcnN0IHJvdyBvZiB0aGUgcmVuZGVyZWQgcmVnaW9uXG4gICAqIEBwYXJhbSAge251bWJlcn0gbGFzdFJvdyB0aGUgbGFzdCByb3cgb2YgdGhlIHJlbmRlcmVkIHJlZ2lvblxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGRyYXdMaW5lc0ZvclJhbmdlcyAobWV0aG9kLCByYW5nZXMsIGZpcnN0Um93LCBsYXN0Um93KSB7XG4gICAgbGV0IGN1cnJlbnRSb3cgPSBmaXJzdFJvd1xuICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSByYW5nZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGNvbnN0IHJhbmdlID0gcmFuZ2VzW2ldXG5cbiAgICAgIG1ldGhvZC5jYWxsKHRoaXMsIGN1cnJlbnRSb3csIHJhbmdlLnN0YXJ0LCBjdXJyZW50Um93IC0gZmlyc3RSb3cpXG5cbiAgICAgIGN1cnJlbnRSb3cgPSByYW5nZS5lbmRcbiAgICB9XG4gICAgaWYgKGN1cnJlbnRSb3cgPD0gbGFzdFJvdykge1xuICAgICAgbWV0aG9kLmNhbGwodGhpcywgY3VycmVudFJvdywgbGFzdFJvdywgY3VycmVudFJvdyAtIGZpcnN0Um93KVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEcmF3cyBiYWNrIGRlY29yYXRpb25zIG9uIHRoZSBjb3JyZXNwb25kaW5nIGxheWVyLlxuICAgKlxuICAgKiBUaGUgbGluZXMgcmFuZ2UgdG8gZHJhdyBpcyBzcGVjaWZpZWQgYnkgdGhlIGBmaXJzdFJvd2AgYW5kIGBsYXN0Um93YFxuICAgKiBwYXJhbWV0ZXJzLlxuICAgKlxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGZpcnN0Um93IHRoZSBmaXJzdCByb3cgdG8gcmVuZGVyXG4gICAqIEBwYXJhbSAge251bWJlcn0gbGFzdFJvdyB0aGUgbGFzdCByb3cgdG8gcmVuZGVyXG4gICAqIEBwYXJhbSAge251bWJlcn0gb2Zmc2V0Um93IHRoZSByZWxhdGl2ZSBvZmZzZXQgdG8gYXBwbHkgdG8gcm93cyB3aGVuXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlcmluZyB0aGVtXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgZHJhd0JhY2tEZWNvcmF0aW9uc0ZvckxpbmVzIChmaXJzdFJvdywgbGFzdFJvdywgb2Zmc2V0Um93KSB7XG4gICAgaWYgKGZpcnN0Um93ID4gbGFzdFJvdykgeyByZXR1cm4gfVxuXG4gICAgY29uc3QgZGV2aWNlUGl4ZWxSYXRpbyA9IHRoaXMubWluaW1hcC5nZXREZXZpY2VQaXhlbFJhdGlvKClcbiAgICBjb25zdCBsaW5lSGVpZ2h0ID0gdGhpcy5taW5pbWFwLmdldExpbmVIZWlnaHQoKSAqIGRldmljZVBpeGVsUmF0aW9cbiAgICBjb25zdCBjaGFySGVpZ2h0ID0gdGhpcy5taW5pbWFwLmdldENoYXJIZWlnaHQoKSAqIGRldmljZVBpeGVsUmF0aW9cbiAgICBjb25zdCBjaGFyV2lkdGggPSB0aGlzLm1pbmltYXAuZ2V0Q2hhcldpZHRoKCkgKiBkZXZpY2VQaXhlbFJhdGlvXG4gICAgY29uc3QgZGVjb3JhdGlvbnMgPSB0aGlzLm1pbmltYXAuZGVjb3JhdGlvbnNCeVR5cGVUaGVuUm93cyhmaXJzdFJvdywgbGFzdFJvdylcbiAgICBjb25zdCB7d2lkdGg6IGNhbnZhc1dpZHRoLCBoZWlnaHQ6IGNhbnZhc0hlaWdodH0gPSB0aGlzLnRva2Vuc0xheWVyLmdldFNpemUoKVxuICAgIGNvbnN0IHJlbmRlckRhdGEgPSB7XG4gICAgICBjb250ZXh0OiB0aGlzLmJhY2tMYXllci5jb250ZXh0LFxuICAgICAgY2FudmFzV2lkdGg6IGNhbnZhc1dpZHRoLFxuICAgICAgY2FudmFzSGVpZ2h0OiBjYW52YXNIZWlnaHQsXG4gICAgICBsaW5lSGVpZ2h0OiBsaW5lSGVpZ2h0LFxuICAgICAgY2hhcldpZHRoOiBjaGFyV2lkdGgsXG4gICAgICBjaGFySGVpZ2h0OiBjaGFySGVpZ2h0LFxuICAgICAgb3JkZXJzOiBNYWluLmdldFBsdWdpbnNPcmRlcigpXG4gICAgfVxuXG4gICAgZm9yIChsZXQgc2NyZWVuUm93ID0gZmlyc3RSb3c7IHNjcmVlblJvdyA8PSBsYXN0Um93OyBzY3JlZW5Sb3crKykge1xuICAgICAgcmVuZGVyRGF0YS5yb3cgPSBvZmZzZXRSb3cgKyAoc2NyZWVuUm93IC0gZmlyc3RSb3cpXG4gICAgICByZW5kZXJEYXRhLnlSb3cgPSByZW5kZXJEYXRhLnJvdyAqIGxpbmVIZWlnaHRcbiAgICAgIHJlbmRlckRhdGEuc2NyZWVuUm93ID0gc2NyZWVuUm93XG5cbiAgICAgIHRoaXMuZHJhd0RlY29yYXRpb25zKHNjcmVlblJvdywgZGVjb3JhdGlvbnMsIHJlbmRlckRhdGEsIHtcbiAgICAgICAgJ2xpbmUnOiB0aGlzLmRyYXdMaW5lRGVjb3JhdGlvbixcbiAgICAgICAgJ2hpZ2hsaWdodC11bmRlcic6IHRoaXMuZHJhd0hpZ2hsaWdodERlY29yYXRpb24sXG4gICAgICAgICdiYWNrZ3JvdW5kLWN1c3RvbSc6IHRoaXMuZHJhd0N1c3RvbURlY29yYXRpb25cbiAgICAgIH0pXG4gICAgfVxuXG4gICAgdGhpcy5iYWNrTGF5ZXIuY29udGV4dC5maWxsKClcbiAgfVxuXG4gIC8qKlxuICAgKiBEcmF3cyBmcm9udCBkZWNvcmF0aW9ucyBvbiB0aGUgY29ycmVzcG9uZGluZyBsYXllci5cbiAgICpcbiAgICogVGhlIGxpbmVzIHJhbmdlIHRvIGRyYXcgaXMgc3BlY2lmaWVkIGJ5IHRoZSBgZmlyc3RSb3dgIGFuZCBgbGFzdFJvd2BcbiAgICogcGFyYW1ldGVycy5cbiAgICpcbiAgICogQHBhcmFtICB7bnVtYmVyfSBmaXJzdFJvdyB0aGUgZmlyc3Qgcm93IHRvIHJlbmRlclxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGxhc3RSb3cgdGhlIGxhc3Qgcm93IHRvIHJlbmRlclxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IG9mZnNldFJvdyB0aGUgcmVsYXRpdmUgb2Zmc2V0IHRvIGFwcGx5IHRvIHJvd3Mgd2hlblxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW5kZXJpbmcgdGhlbVxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGRyYXdGcm9udERlY29yYXRpb25zRm9yTGluZXMgKGZpcnN0Um93LCBsYXN0Um93LCBvZmZzZXRSb3cpIHtcbiAgICBpZiAoZmlyc3RSb3cgPiBsYXN0Um93KSB7IHJldHVybiB9XG5cbiAgICBjb25zdCBkZXZpY2VQaXhlbFJhdGlvID0gdGhpcy5taW5pbWFwLmdldERldmljZVBpeGVsUmF0aW8oKVxuICAgIGNvbnN0IGxpbmVIZWlnaHQgPSB0aGlzLm1pbmltYXAuZ2V0TGluZUhlaWdodCgpICogZGV2aWNlUGl4ZWxSYXRpb1xuICAgIGNvbnN0IGNoYXJIZWlnaHQgPSB0aGlzLm1pbmltYXAuZ2V0Q2hhckhlaWdodCgpICogZGV2aWNlUGl4ZWxSYXRpb1xuICAgIGNvbnN0IGNoYXJXaWR0aCA9IHRoaXMubWluaW1hcC5nZXRDaGFyV2lkdGgoKSAqIGRldmljZVBpeGVsUmF0aW9cbiAgICBjb25zdCBkZWNvcmF0aW9ucyA9IHRoaXMubWluaW1hcC5kZWNvcmF0aW9uc0J5VHlwZVRoZW5Sb3dzKGZpcnN0Um93LCBsYXN0Um93KVxuICAgIGNvbnN0IHt3aWR0aDogY2FudmFzV2lkdGgsIGhlaWdodDogY2FudmFzSGVpZ2h0fSA9IHRoaXMudG9rZW5zTGF5ZXIuZ2V0U2l6ZSgpXG4gICAgY29uc3QgcmVuZGVyRGF0YSA9IHtcbiAgICAgIGNvbnRleHQ6IHRoaXMuZnJvbnRMYXllci5jb250ZXh0LFxuICAgICAgY2FudmFzV2lkdGg6IGNhbnZhc1dpZHRoLFxuICAgICAgY2FudmFzSGVpZ2h0OiBjYW52YXNIZWlnaHQsXG4gICAgICBsaW5lSGVpZ2h0OiBsaW5lSGVpZ2h0LFxuICAgICAgY2hhcldpZHRoOiBjaGFyV2lkdGgsXG4gICAgICBjaGFySGVpZ2h0OiBjaGFySGVpZ2h0LFxuICAgICAgb3JkZXJzOiBNYWluLmdldFBsdWdpbnNPcmRlcigpXG4gICAgfVxuXG4gICAgZm9yIChsZXQgc2NyZWVuUm93ID0gZmlyc3RSb3c7IHNjcmVlblJvdyA8PSBsYXN0Um93OyBzY3JlZW5Sb3crKykge1xuICAgICAgcmVuZGVyRGF0YS5yb3cgPSBvZmZzZXRSb3cgKyAoc2NyZWVuUm93IC0gZmlyc3RSb3cpXG4gICAgICByZW5kZXJEYXRhLnlSb3cgPSByZW5kZXJEYXRhLnJvdyAqIGxpbmVIZWlnaHRcbiAgICAgIHJlbmRlckRhdGEuc2NyZWVuUm93ID0gc2NyZWVuUm93XG5cbiAgICAgIHRoaXMuZHJhd0RlY29yYXRpb25zKHNjcmVlblJvdywgZGVjb3JhdGlvbnMsIHJlbmRlckRhdGEsIHtcbiAgICAgICAgJ2d1dHRlcic6IHRoaXMuZHJhd0d1dHRlckRlY29yYXRpb24sXG4gICAgICAgICdoaWdobGlnaHQtb3Zlcic6IHRoaXMuZHJhd0hpZ2hsaWdodERlY29yYXRpb24sXG4gICAgICAgICdoaWdobGlnaHQtb3V0bGluZSc6IHRoaXMuZHJhd0hpZ2hsaWdodE91dGxpbmVEZWNvcmF0aW9uLFxuICAgICAgICAnZm9yZWdyb3VuZC1jdXN0b20nOiB0aGlzLmRyYXdDdXN0b21EZWNvcmF0aW9uXG4gICAgICB9KVxuICAgIH1cblxuICAgIHJlbmRlckRhdGEuY29udGV4dC5maWxsKClcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGFycmF5IG9mIHRva2VucyBieSBsaW5lLlxuICAgKlxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IHN0YXJ0Um93IFRoZSBzdGFydCByb3dcbiAgICogQHBhcmFtICB7bnVtYmVyfSBlbmRSb3cgVGhlIGVuZCByb3dcbiAgICogQHJldHVybiB7QXJyYXk8QXJyYXk+fSBBbiBhcnJheSBvZiB0b2tlbnMgYnkgbGluZVxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIHRva2VuTGluZXNGb3JTY3JlZW5Sb3dzIChzdGFydFJvdywgZW5kUm93KSB7XG4gICAgY29uc3QgZWRpdG9yID0gdGhpcy5nZXRUZXh0RWRpdG9yKClcbiAgICBsZXQgdG9rZW5MaW5lcyA9IFtdXG4gICAgaWYgKHR5cGVvZiBlZGl0b3IudG9rZW5pemVkTGluZXNGb3JTY3JlZW5Sb3dzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBmb3IgKGxldCB0b2tlbml6ZWRMaW5lIG9mIGVkaXRvci50b2tlbml6ZWRMaW5lc0ZvclNjcmVlblJvd3Moc3RhcnRSb3csIGVuZFJvdykpIHtcbiAgICAgICAgaWYgKHRva2VuaXplZExpbmUpIHtcbiAgICAgICAgICBjb25zdCBpbnZpc2libGVSZWdFeHAgPSB0aGlzLmdldEludmlzaWJsZVJlZ0V4cEZvckxpbmUodG9rZW5pemVkTGluZSlcbiAgICAgICAgICB0b2tlbkxpbmVzLnB1c2godG9rZW5pemVkTGluZS50b2tlbnMubWFwKCh0b2tlbikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgdmFsdWU6IHRva2VuLnZhbHVlLnJlcGxhY2UoaW52aXNpYmxlUmVnRXhwLCAnICcpLFxuICAgICAgICAgICAgICBzY29wZXM6IHRva2VuLnNjb3Blcy5zbGljZSgpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSkpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHZhbHVlOiAnJyxcbiAgICAgICAgICAgIHNjb3BlczogW11cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZGlzcGxheUxheWVyID0gZWRpdG9yLmRpc3BsYXlMYXllclxuICAgICAgY29uc3QgaW52aXNpYmxlUmVnRXhwID0gdGhpcy5nZXRJbnZpc2libGVSZWdFeHAoKVxuICAgICAgY29uc3Qgc2NyZWVuTGluZXMgPSBkaXNwbGF5TGF5ZXIuZ2V0U2NyZWVuTGluZXMoc3RhcnRSb3csIGVuZFJvdylcbiAgICAgIGZvciAobGV0IHtsaW5lVGV4dCwgdGFnQ29kZXN9IG9mIHNjcmVlbkxpbmVzKSB7XG4gICAgICAgIGxldCB0b2tlbnMgPSBbXVxuICAgICAgICBsZXQgc2NvcGVzID0gW11cbiAgICAgICAgbGV0IHRleHRJbmRleCA9IDBcbiAgICAgICAgLy8gY29uc29sZS5sb2cobGluZVRleHQsIGludmlzaWJsZVJlZ0V4cCwgbGluZVRleHQucmVwbGFjZShpbnZpc2libGVSZWdFeHAsICcgJykpXG4gICAgICAgIGZvciAobGV0IHRhZ0NvZGUgb2YgdGFnQ29kZXMpIHtcbiAgICAgICAgICBpZiAoZGlzcGxheUxheWVyLmlzT3BlblRhZ0NvZGUodGFnQ29kZSkpIHtcbiAgICAgICAgICAgIHNjb3Blcy5wdXNoKGRpc3BsYXlMYXllci50YWdGb3JDb2RlKHRhZ0NvZGUpKVxuICAgICAgICAgIH0gZWxzZSBpZiAoZGlzcGxheUxheWVyLmlzQ2xvc2VUYWdDb2RlKHRhZ0NvZGUpKSB7XG4gICAgICAgICAgICBzY29wZXMucG9wKClcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IHZhbHVlID0gbGluZVRleHQuc3Vic3RyKHRleHRJbmRleCwgdGFnQ29kZSlcbiAgICAgICAgICAgIGlmIChpbnZpc2libGVSZWdFeHApIHtcbiAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKGludmlzaWJsZVJlZ0V4cCwgJyAnKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdG9rZW5zLnB1c2goeyB2YWx1ZTogdmFsdWUsIHNjb3Blczogc2NvcGVzLnNsaWNlKCkgfSlcbiAgICAgICAgICAgIHRleHRJbmRleCArPSB0YWdDb2RlXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdG9rZW5MaW5lcy5wdXNoKHRva2VucylcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRva2VuTGluZXNcbiAgfVxuXG4gIC8qKlxuICAgKiBEcmF3cyBsaW5lcyBvbiB0aGUgY29ycmVzcG9uZGluZyBsYXllci5cbiAgICpcbiAgICogVGhlIGxpbmVzIHJhbmdlIHRvIGRyYXcgaXMgc3BlY2lmaWVkIGJ5IHRoZSBgZmlyc3RSb3dgIGFuZCBgbGFzdFJvd2BcbiAgICogcGFyYW1ldGVycy5cbiAgICpcbiAgICogQHBhcmFtICB7bnVtYmVyfSBmaXJzdFJvdyB0aGUgZmlyc3Qgcm93IHRvIHJlbmRlclxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGxhc3RSb3cgdGhlIGxhc3Qgcm93IHRvIHJlbmRlclxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IG9mZnNldFJvdyB0aGUgcmVsYXRpdmUgb2Zmc2V0IHRvIGFwcGx5IHRvIHJvd3Mgd2hlblxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW5kZXJpbmcgdGhlbVxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGRyYXdMaW5lcyAoZmlyc3RSb3csIGxhc3RSb3csIG9mZnNldFJvdykge1xuICAgIGlmIChmaXJzdFJvdyA+IGxhc3RSb3cpIHsgcmV0dXJuIH1cblxuICAgIGNvbnN0IGRldmljZVBpeGVsUmF0aW8gPSB0aGlzLm1pbmltYXAuZ2V0RGV2aWNlUGl4ZWxSYXRpbygpXG4gICAgY29uc3QgbGluZUhlaWdodCA9IHRoaXMubWluaW1hcC5nZXRMaW5lSGVpZ2h0KCkgKiBkZXZpY2VQaXhlbFJhdGlvXG4gICAgY29uc3QgY2hhckhlaWdodCA9IHRoaXMubWluaW1hcC5nZXRDaGFySGVpZ2h0KCkgKiBkZXZpY2VQaXhlbFJhdGlvXG4gICAgY29uc3QgY2hhcldpZHRoID0gdGhpcy5taW5pbWFwLmdldENoYXJXaWR0aCgpICogZGV2aWNlUGl4ZWxSYXRpb1xuICAgIGNvbnN0IGRpc3BsYXlDb2RlSGlnaGxpZ2h0cyA9IHRoaXMuZGlzcGxheUNvZGVIaWdobGlnaHRzXG4gICAgY29uc3QgY29udGV4dCA9IHRoaXMudG9rZW5zTGF5ZXIuY29udGV4dFxuICAgIGNvbnN0IHt3aWR0aDogY2FudmFzV2lkdGh9ID0gdGhpcy50b2tlbnNMYXllci5nZXRTaXplKClcblxuICAgIGlmICh0eXBlb2YgdGhpcy50b2tlbkxpbmVzRm9yU2NyZWVuUm93cyAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29uc29sZS5lcnJvcihgdG9rZW5MaW5lc0ZvclNjcmVlblJvd3Mgc2hvdWxkIGJlIGEgZnVuY3Rpb24gYnV0IGl0IHdhcyAke3R5cGVvZiB0aGlzLnRva2VuTGluZXNGb3JTY3JlZW5Sb3dzfWAsIHRoaXMudG9rZW5MaW5lc0ZvclNjcmVlblJvd3MpXG5cbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IHNjcmVlblJvd3NUb2tlbnMgPSB0aGlzLnRva2VuTGluZXNGb3JTY3JlZW5Sb3dzKGZpcnN0Um93LCBsYXN0Um93KVxuXG4gICAgbGV0IHkgPSBvZmZzZXRSb3cgKiBsaW5lSGVpZ2h0XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzY3JlZW5Sb3dzVG9rZW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQgdG9rZW5zID0gc2NyZWVuUm93c1Rva2Vuc1tpXVxuICAgICAgbGV0IHggPSAwXG4gICAgICBjb250ZXh0LmNsZWFyUmVjdCh4LCB5LCBjYW52YXNXaWR0aCwgbGluZUhlaWdodClcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgdG9rZW5zLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGxldCB0b2tlbiA9IHRva2Vuc1tqXVxuICAgICAgICBpZiAoL15cXHMrJC8udGVzdCh0b2tlbi52YWx1ZSkpIHtcbiAgICAgICAgICB4ICs9IHRva2VuLnZhbHVlLmxlbmd0aCAqIGNoYXJXaWR0aFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IGNvbG9yID0gZGlzcGxheUNvZGVIaWdobGlnaHRzID8gdGhpcy5nZXRUb2tlbkNvbG9yKHRva2VuKSA6IHRoaXMuZ2V0RGVmYXVsdENvbG9yKClcbiAgICAgICAgICB4ID0gdGhpcy5kcmF3VG9rZW4oY29udGV4dCwgdG9rZW4udmFsdWUsIGNvbG9yLCB4LCB5LCBjaGFyV2lkdGgsIGNoYXJIZWlnaHQpXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHggPiBjYW52YXNXaWR0aCkgeyBicmVhayB9XG4gICAgICB9XG5cbiAgICAgIHkgKz0gbGluZUhlaWdodFxuICAgIH1cblxuICAgIGNvbnRleHQuZmlsbCgpXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcmVnZXhwIHRvIHJlcGxhY2UgaW52aXNpYmxlcyBzdWJzdGl0dXRpb24gY2hhcmFjdGVyc1xuICAgKiBpbiBlZGl0b3IgbGluZXMuXG4gICAqXG4gICAqIEByZXR1cm4ge1JlZ0V4cH0gdGhlIHJlZ3VsYXIgZXhwcmVzc2lvbiB0byBtYXRjaCBpbnZpc2libGUgY2hhcmFjdGVyc1xuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGdldEludmlzaWJsZVJlZ0V4cCAoKSB7XG4gICAgbGV0IGludmlzaWJsZXMgPSB0aGlzLmdldFRleHRFZGl0b3IoKS5nZXRJbnZpc2libGVzKClcbiAgICBsZXQgcmVnZXhwID0gW11cbiAgICBpZiAoaW52aXNpYmxlcy5jciAhPSBudWxsKSB7IHJlZ2V4cC5wdXNoKGludmlzaWJsZXMuY3IpIH1cbiAgICBpZiAoaW52aXNpYmxlcy5lb2wgIT0gbnVsbCkgeyByZWdleHAucHVzaChpbnZpc2libGVzLmVvbCkgfVxuICAgIGlmIChpbnZpc2libGVzLnNwYWNlICE9IG51bGwpIHsgcmVnZXhwLnB1c2goaW52aXNpYmxlcy5zcGFjZSkgfVxuICAgIGlmIChpbnZpc2libGVzLnRhYiAhPSBudWxsKSB7IHJlZ2V4cC5wdXNoKGludmlzaWJsZXMudGFiKSB9XG5cbiAgICByZXR1cm4gcmVnZXhwLmxlbmd0aCA9PT0gMCA/IG51bGwgOiBSZWdFeHAocmVnZXhwLmZpbHRlcigocykgPT4ge1xuICAgICAgcmV0dXJuIHR5cGVvZiBzID09PSAnc3RyaW5nJ1xuICAgIH0pLm1hcChfLmVzY2FwZVJlZ0V4cCkuam9pbignfCcpLCAnZycpXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcmVnZXhwIHRvIHJlcGxhY2UgaW52aXNpYmxlcyBzdWJzdGl0dXRpb24gY2hhcmFjdGVyc1xuICAgKiBpbiBlZGl0b3IgbGluZXMuXG4gICAqXG4gICAqIEBwYXJhbSAge09iamVjdH0gbGluZSB0aGUgdG9rZW5pemVkIGxpbmVcbiAgICogQHJldHVybiB7UmVnRXhwfSB0aGUgcmVndWxhciBleHByZXNzaW9uIHRvIG1hdGNoIGludmlzaWJsZSBjaGFyYWN0ZXJzXG4gICAqIEBkZXByZWNhdGVkIElzIHVzZWQgb25seSB0byBzdXBwb3J0IEF0b20gdmVyc2lvbiBiZWZvcmUgZGlzcGxheSBsYXllciBBUElcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBnZXRJbnZpc2libGVSZWdFeHBGb3JMaW5lIChsaW5lKSB7XG4gICAgaWYgKChsaW5lICE9IG51bGwpICYmIChsaW5lLmludmlzaWJsZXMgIT0gbnVsbCkpIHtcbiAgICAgIGNvbnN0IGludmlzaWJsZXMgPSBbXVxuICAgICAgaWYgKGxpbmUuaW52aXNpYmxlcy5jciAhPSBudWxsKSB7IGludmlzaWJsZXMucHVzaChsaW5lLmludmlzaWJsZXMuY3IpIH1cbiAgICAgIGlmIChsaW5lLmludmlzaWJsZXMuZW9sICE9IG51bGwpIHsgaW52aXNpYmxlcy5wdXNoKGxpbmUuaW52aXNpYmxlcy5lb2wpIH1cbiAgICAgIGlmIChsaW5lLmludmlzaWJsZXMuc3BhY2UgIT0gbnVsbCkgeyBpbnZpc2libGVzLnB1c2gobGluZS5pbnZpc2libGVzLnNwYWNlKSB9XG4gICAgICBpZiAobGluZS5pbnZpc2libGVzLnRhYiAhPSBudWxsKSB7IGludmlzaWJsZXMucHVzaChsaW5lLmludmlzaWJsZXMudGFiKSB9XG5cbiAgICAgIHJldHVybiBSZWdFeHAoaW52aXNpYmxlcy5maWx0ZXIoKHMpID0+IHtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBzID09PSAnc3RyaW5nJ1xuICAgICAgfSkubWFwKF8uZXNjYXBlUmVnRXhwKS5qb2luKCd8JyksICdnJylcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRHJhd3MgYSBzaW5nbGUgdG9rZW4gb24gdGhlIGdpdmVuIGNvbnRleHQuXG4gICAqXG4gICAqIEBwYXJhbSAge0NhbnZhc1JlbmRlcmluZ0NvbnRleHQyRH0gY29udGV4dCB0aGUgdGFyZ2V0IGNhbnZhcyBjb250ZXh0XG4gICAqIEBwYXJhbSAge3N0cmluZ30gdGV4dCB0aGUgdG9rZW4ncyB0ZXh0IGNvbnRlbnRcbiAgICogQHBhcmFtICB7c3RyaW5nfSBjb2xvciB0aGUgdG9rZW4ncyBDU1MgY29sb3JcbiAgICogQHBhcmFtICB7bnVtYmVyfSB4IHRoZSB4IHBvc2l0aW9uIG9mIHRoZSB0b2tlbiBpbiB0aGUgbGluZVxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IHkgdGhlIHkgcG9zaXRpb24gb2YgdGhlIGxpbmUgaW4gdGhlIG1pbmltYXBcbiAgICogQHBhcmFtICB7bnVtYmVyfSBjaGFyV2lkdGggdGhlIHdpZHRoIG9mIGEgY2hhcmFjdGVyIGluIHRoZSBtaW5pbWFwXG4gICAqIEBwYXJhbSAge251bWJlcn0gY2hhckhlaWdodCB0aGUgaGVpZ2h0IG9mIGEgY2hhcmFjdGVyIGluIHRoZSBtaW5pbWFwXG4gICAqIEByZXR1cm4ge251bWJlcn0gdGhlIHggcG9zaXRpb24gYXQgdGhlIGVuZCBvZiB0aGUgdG9rZW5cbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBkcmF3VG9rZW4gKGNvbnRleHQsIHRleHQsIGNvbG9yLCB4LCB5LCBjaGFyV2lkdGgsIGNoYXJIZWlnaHQpIHtcbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9IGNvbG9yXG5cbiAgICBpZiAodGhpcy5pZ25vcmVXaGl0ZXNwYWNlc0luVG9rZW5zKSB7XG4gICAgICBjb25zdCBsZW5ndGggPSB0ZXh0Lmxlbmd0aCAqIGNoYXJXaWR0aFxuICAgICAgY29udGV4dC5maWxsUmVjdCh4LCB5LCBsZW5ndGgsIGNoYXJIZWlnaHQpXG5cbiAgICAgIHJldHVybiB4ICsgbGVuZ3RoXG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBjaGFycyA9IDBcbiAgICAgIGZvciAobGV0IGogPSAwLCBsZW4gPSB0ZXh0Lmxlbmd0aDsgaiA8IGxlbjsgaisrKSB7XG4gICAgICAgIGNvbnN0IGNoYXIgPSB0ZXh0W2pdXG4gICAgICAgIGlmICgvXFxzLy50ZXN0KGNoYXIpKSB7XG4gICAgICAgICAgaWYgKGNoYXJzID4gMCkge1xuICAgICAgICAgICAgY29udGV4dC5maWxsUmVjdCh4IC0gKGNoYXJzICogY2hhcldpZHRoKSwgeSwgY2hhcnMgKiBjaGFyV2lkdGgsIGNoYXJIZWlnaHQpXG4gICAgICAgICAgfVxuICAgICAgICAgIGNoYXJzID0gMFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNoYXJzKytcbiAgICAgICAgfVxuICAgICAgICB4ICs9IGNoYXJXaWR0aFxuICAgICAgfVxuICAgICAgaWYgKGNoYXJzID4gMCkge1xuICAgICAgICBjb250ZXh0LmZpbGxSZWN0KHggLSAoY2hhcnMgKiBjaGFyV2lkdGgpLCB5LCBjaGFycyAqIGNoYXJXaWR0aCwgY2hhckhlaWdodClcbiAgICAgIH1cbiAgICAgIHJldHVybiB4XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERyYXdzIHRoZSBzcGVjaWZpZWQgZGVjb3JhdGlvbnMgZm9yIHRoZSBjdXJyZW50IGBzY3JlZW5Sb3dgLlxuICAgKlxuICAgKiBUaGUgYGRlY29yYXRpb25zYCBvYmplY3QgY29udGFpbnMgYWxsIHRoZSBkZWNvcmF0aW9ucyBncm91cGVkIGJ5IHR5cGUgYW5kXG4gICAqIHRoZW4gcm93cy5cbiAgICpcbiAgICogQHBhcmFtICB7bnVtYmVyfSBzY3JlZW5Sb3cgdGhlIHNjcmVlbiByb3cgaW5kZXggZm9yIHdoaWNoXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlciBkZWNvcmF0aW9uc1xuICAgKiBAcGFyYW0gIHtPYmplY3R9IGRlY29yYXRpb25zIHRoZSBvYmplY3QgY29udGFpbmluZyBhbGwgdGhlIGRlY29yYXRpb25zXG4gICAqIEBwYXJhbSAge09iamVjdH0gcmVuZGVyRGF0YSB0aGUgb2JqZWN0IGNvbnRhaW5pbmcgdGhlIHJlbmRlciBkYXRhXG4gICAqIEBwYXJhbSAge09iamVjdH0gdHlwZXMgYW4gb2JqZWN0IHdpdGggdGhlIHR5cGUgdG8gcmVuZGVyIGFzIGtleSBhbmQgdGhlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyIG1ldGhvZCBhcyB2YWx1ZVxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGRyYXdEZWNvcmF0aW9ucyAoc2NyZWVuUm93LCBkZWNvcmF0aW9ucywgcmVuZGVyRGF0YSwgdHlwZXMpIHtcbiAgICBsZXQgZGVjb3JhdGlvbnNUb1JlbmRlciA9IFtdXG5cbiAgICByZW5kZXJEYXRhLmNvbnRleHQuY2xlYXJSZWN0KFxuICAgICAgMCwgcmVuZGVyRGF0YS55Um93LFxuICAgICAgcmVuZGVyRGF0YS5jYW52YXNXaWR0aCwgcmVuZGVyRGF0YS5saW5lSGVpZ2h0XG4gICAgKVxuXG4gICAgZm9yIChsZXQgaSBpbiB0eXBlcykge1xuICAgICAgZGVjb3JhdGlvbnNUb1JlbmRlciA9IGRlY29yYXRpb25zVG9SZW5kZXIuY29uY2F0KFxuICAgICAgICBkZWNvcmF0aW9uc1tpXSAhPSBudWxsID8gZGVjb3JhdGlvbnNbaV1bc2NyZWVuUm93XSB8fCBbXSA6IFtdXG4gICAgICApXG4gICAgfVxuXG4gICAgZGVjb3JhdGlvbnNUb1JlbmRlci5zb3J0KChhLCBiKSA9PlxuICAgICAgKHJlbmRlckRhdGEub3JkZXJzW2EucHJvcGVydGllcy5wbHVnaW5dIHx8IDApIC0gKHJlbmRlckRhdGEub3JkZXJzW2IucHJvcGVydGllcy5wbHVnaW5dIHx8IDApXG4gICAgKVxuXG4gICAgaWYgKGRlY29yYXRpb25zVG9SZW5kZXIgIT0gbnVsbCA/IGRlY29yYXRpb25zVG9SZW5kZXIubGVuZ3RoIDogdm9pZCAwKSB7XG4gICAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gZGVjb3JhdGlvbnNUb1JlbmRlci5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICB0eXBlc1tkZWNvcmF0aW9uc1RvUmVuZGVyW2ldLnByb3BlcnRpZXMudHlwZV0uY2FsbCh0aGlzLCBkZWNvcmF0aW9uc1RvUmVuZGVyW2ldLCByZW5kZXJEYXRhKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEcmF3cyBhIGxpbmUgZGVjb3JhdGlvbi5cbiAgICpcbiAgICogQHBhcmFtICB7RGVjb3JhdGlvbn0gZGVjb3JhdGlvbiB0aGUgZGVjb3JhdGlvbiB0byByZW5kZXJcbiAgICogQHBhcmFtICB7T2JqZWN0fSBkYXRhIHRoZSBkYXRhIG5lZWQgdG8gcGVyZm9ybSB0aGUgcmVuZGVyXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgZHJhd0xpbmVEZWNvcmF0aW9uIChkZWNvcmF0aW9uLCBkYXRhKSB7XG4gICAgZGF0YS5jb250ZXh0LmZpbGxTdHlsZSA9IHRoaXMuZ2V0RGVjb3JhdGlvbkNvbG9yKGRlY29yYXRpb24pXG4gICAgZGF0YS5jb250ZXh0LmZpbGxSZWN0KDAsIGRhdGEueVJvdywgZGF0YS5jYW52YXNXaWR0aCwgZGF0YS5saW5lSGVpZ2h0KVxuICB9XG5cbiAgLyoqXG4gICAqIERyYXdzIGEgZ3V0dGVyIGRlY29yYXRpb24uXG4gICAqXG4gICAqIEBwYXJhbSAge0RlY29yYXRpb259IGRlY29yYXRpb24gdGhlIGRlY29yYXRpb24gdG8gcmVuZGVyXG4gICAqIEBwYXJhbSAge09iamVjdH0gZGF0YSB0aGUgZGF0YSBuZWVkIHRvIHBlcmZvcm0gdGhlIHJlbmRlclxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGRyYXdHdXR0ZXJEZWNvcmF0aW9uIChkZWNvcmF0aW9uLCBkYXRhKSB7XG4gICAgZGF0YS5jb250ZXh0LmZpbGxTdHlsZSA9IHRoaXMuZ2V0RGVjb3JhdGlvbkNvbG9yKGRlY29yYXRpb24pXG4gICAgZGF0YS5jb250ZXh0LmZpbGxSZWN0KDAsIGRhdGEueVJvdywgMSwgZGF0YS5saW5lSGVpZ2h0KVxuICB9XG5cbiAgLyoqXG4gICAqIERyYXdzIGEgaGlnaGxpZ2h0IGRlY29yYXRpb24uXG4gICAqXG4gICAqIEl0IHJlbmRlcnMgb25seSB0aGUgcGFydCBvZiB0aGUgaGlnaGxpZ2h0IGNvcnJlc3BvbmRpbmcgdG8gdGhlIHNwZWNpZmllZFxuICAgKiByb3cuXG4gICAqXG4gICAqIEBwYXJhbSAge0RlY29yYXRpb259IGRlY29yYXRpb24gdGhlIGRlY29yYXRpb24gdG8gcmVuZGVyXG4gICAqIEBwYXJhbSAge09iamVjdH0gZGF0YSB0aGUgZGF0YSBuZWVkIHRvIHBlcmZvcm0gdGhlIHJlbmRlclxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGRyYXdIaWdobGlnaHREZWNvcmF0aW9uIChkZWNvcmF0aW9uLCBkYXRhKSB7XG4gICAgY29uc3QgcmFuZ2UgPSBkZWNvcmF0aW9uLmdldE1hcmtlcigpLmdldFNjcmVlblJhbmdlKClcbiAgICBjb25zdCByb3dTcGFuID0gcmFuZ2UuZW5kLnJvdyAtIHJhbmdlLnN0YXJ0LnJvd1xuXG4gICAgZGF0YS5jb250ZXh0LmZpbGxTdHlsZSA9IHRoaXMuZ2V0RGVjb3JhdGlvbkNvbG9yKGRlY29yYXRpb24pXG5cbiAgICBpZiAocm93U3BhbiA9PT0gMCkge1xuICAgICAgY29uc3QgY29sU3BhbiA9IHJhbmdlLmVuZC5jb2x1bW4gLSByYW5nZS5zdGFydC5jb2x1bW5cbiAgICAgIGRhdGEuY29udGV4dC5maWxsUmVjdChyYW5nZS5zdGFydC5jb2x1bW4gKiBkYXRhLmNoYXJXaWR0aCwgZGF0YS55Um93LCBjb2xTcGFuICogZGF0YS5jaGFyV2lkdGgsIGRhdGEubGluZUhlaWdodClcbiAgICB9IGVsc2UgaWYgKGRhdGEuc2NyZWVuUm93ID09PSByYW5nZS5zdGFydC5yb3cpIHtcbiAgICAgIGNvbnN0IHggPSByYW5nZS5zdGFydC5jb2x1bW4gKiBkYXRhLmNoYXJXaWR0aFxuICAgICAgZGF0YS5jb250ZXh0LmZpbGxSZWN0KHgsIGRhdGEueVJvdywgZGF0YS5jYW52YXNXaWR0aCAtIHgsIGRhdGEubGluZUhlaWdodClcbiAgICB9IGVsc2UgaWYgKGRhdGEuc2NyZWVuUm93ID09PSByYW5nZS5lbmQucm93KSB7XG4gICAgICBkYXRhLmNvbnRleHQuZmlsbFJlY3QoMCwgZGF0YS55Um93LCByYW5nZS5lbmQuY29sdW1uICogZGF0YS5jaGFyV2lkdGgsIGRhdGEubGluZUhlaWdodClcbiAgICB9IGVsc2Uge1xuICAgICAgZGF0YS5jb250ZXh0LmZpbGxSZWN0KDAsIGRhdGEueVJvdywgZGF0YS5jYW52YXNXaWR0aCwgZGF0YS5saW5lSGVpZ2h0KVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEcmF3cyBhIGhpZ2hsaWdodCBvdXRsaW5lIGRlY29yYXRpb24uXG4gICAqXG4gICAqIEl0IHJlbmRlcnMgb25seSB0aGUgcGFydCBvZiB0aGUgaGlnaGxpZ2h0IGNvcnJlc3BvbmRpbmcgdG8gdGhlIHNwZWNpZmllZFxuICAgKiByb3cuXG4gICAqXG4gICAqIEBwYXJhbSAge0RlY29yYXRpb259IGRlY29yYXRpb24gdGhlIGRlY29yYXRpb24gdG8gcmVuZGVyXG4gICAqIEBwYXJhbSAge09iamVjdH0gZGF0YSB0aGUgZGF0YSBuZWVkIHRvIHBlcmZvcm0gdGhlIHJlbmRlclxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGRyYXdIaWdobGlnaHRPdXRsaW5lRGVjb3JhdGlvbiAoZGVjb3JhdGlvbiwgZGF0YSkge1xuICAgIGxldCBib3R0b21XaWR0aCwgY29sU3Bhbiwgd2lkdGgsIHhCb3R0b21TdGFydCwgeEVuZCwgeFN0YXJ0XG4gICAgY29uc3Qge2xpbmVIZWlnaHQsIGNoYXJXaWR0aCwgY2FudmFzV2lkdGgsIHNjcmVlblJvd30gPSBkYXRhXG4gICAgY29uc3QgcmFuZ2UgPSBkZWNvcmF0aW9uLmdldE1hcmtlcigpLmdldFNjcmVlblJhbmdlKClcbiAgICBjb25zdCByb3dTcGFuID0gcmFuZ2UuZW5kLnJvdyAtIHJhbmdlLnN0YXJ0LnJvd1xuICAgIGNvbnN0IHlTdGFydCA9IGRhdGEueVJvd1xuICAgIGNvbnN0IHlFbmQgPSB5U3RhcnQgKyBsaW5lSGVpZ2h0XG5cbiAgICBkYXRhLmNvbnRleHQuZmlsbFN0eWxlID0gdGhpcy5nZXREZWNvcmF0aW9uQ29sb3IoZGVjb3JhdGlvbilcblxuICAgIGlmIChyb3dTcGFuID09PSAwKSB7XG4gICAgICBjb2xTcGFuID0gcmFuZ2UuZW5kLmNvbHVtbiAtIHJhbmdlLnN0YXJ0LmNvbHVtblxuICAgICAgd2lkdGggPSBjb2xTcGFuICogY2hhcldpZHRoXG4gICAgICB4U3RhcnQgPSByYW5nZS5zdGFydC5jb2x1bW4gKiBjaGFyV2lkdGhcbiAgICAgIHhFbmQgPSB4U3RhcnQgKyB3aWR0aFxuXG4gICAgICBkYXRhLmNvbnRleHQuZmlsbFJlY3QoeFN0YXJ0LCB5U3RhcnQsIHdpZHRoLCAxKVxuICAgICAgZGF0YS5jb250ZXh0LmZpbGxSZWN0KHhTdGFydCwgeUVuZCwgd2lkdGgsIDEpXG4gICAgICBkYXRhLmNvbnRleHQuZmlsbFJlY3QoeFN0YXJ0LCB5U3RhcnQsIDEsIGxpbmVIZWlnaHQpXG4gICAgICBkYXRhLmNvbnRleHQuZmlsbFJlY3QoeEVuZCwgeVN0YXJ0LCAxLCBsaW5lSGVpZ2h0KVxuICAgIH0gZWxzZSBpZiAocm93U3BhbiA9PT0gMSkge1xuICAgICAgeFN0YXJ0ID0gcmFuZ2Uuc3RhcnQuY29sdW1uICogZGF0YS5jaGFyV2lkdGhcbiAgICAgIHhFbmQgPSByYW5nZS5lbmQuY29sdW1uICogZGF0YS5jaGFyV2lkdGhcblxuICAgICAgaWYgKHNjcmVlblJvdyA9PT0gcmFuZ2Uuc3RhcnQucm93KSB7XG4gICAgICAgIHdpZHRoID0gZGF0YS5jYW52YXNXaWR0aCAtIHhTdGFydFxuICAgICAgICB4Qm90dG9tU3RhcnQgPSBNYXRoLm1heCh4U3RhcnQsIHhFbmQpXG4gICAgICAgIGJvdHRvbVdpZHRoID0gZGF0YS5jYW52YXNXaWR0aCAtIHhCb3R0b21TdGFydFxuXG4gICAgICAgIGRhdGEuY29udGV4dC5maWxsUmVjdCh4U3RhcnQsIHlTdGFydCwgd2lkdGgsIDEpXG4gICAgICAgIGRhdGEuY29udGV4dC5maWxsUmVjdCh4Qm90dG9tU3RhcnQsIHlFbmQsIGJvdHRvbVdpZHRoLCAxKVxuICAgICAgICBkYXRhLmNvbnRleHQuZmlsbFJlY3QoeFN0YXJ0LCB5U3RhcnQsIDEsIGxpbmVIZWlnaHQpXG4gICAgICAgIGRhdGEuY29udGV4dC5maWxsUmVjdChjYW52YXNXaWR0aCAtIDEsIHlTdGFydCwgMSwgbGluZUhlaWdodClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdpZHRoID0gY2FudmFzV2lkdGggLSB4U3RhcnRcbiAgICAgICAgYm90dG9tV2lkdGggPSBjYW52YXNXaWR0aCAtIHhFbmRcblxuICAgICAgICBkYXRhLmNvbnRleHQuZmlsbFJlY3QoMCwgeVN0YXJ0LCB4U3RhcnQsIDEpXG4gICAgICAgIGRhdGEuY29udGV4dC5maWxsUmVjdCgwLCB5RW5kLCB4RW5kLCAxKVxuICAgICAgICBkYXRhLmNvbnRleHQuZmlsbFJlY3QoMCwgeVN0YXJ0LCAxLCBsaW5lSGVpZ2h0KVxuICAgICAgICBkYXRhLmNvbnRleHQuZmlsbFJlY3QoeEVuZCwgeVN0YXJ0LCAxLCBsaW5lSGVpZ2h0KVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB4U3RhcnQgPSByYW5nZS5zdGFydC5jb2x1bW4gKiBjaGFyV2lkdGhcbiAgICAgIHhFbmQgPSByYW5nZS5lbmQuY29sdW1uICogY2hhcldpZHRoXG4gICAgICBpZiAoc2NyZWVuUm93ID09PSByYW5nZS5zdGFydC5yb3cpIHtcbiAgICAgICAgd2lkdGggPSBjYW52YXNXaWR0aCAtIHhTdGFydFxuXG4gICAgICAgIGRhdGEuY29udGV4dC5maWxsUmVjdCh4U3RhcnQsIHlTdGFydCwgd2lkdGgsIDEpXG4gICAgICAgIGRhdGEuY29udGV4dC5maWxsUmVjdCh4U3RhcnQsIHlTdGFydCwgMSwgbGluZUhlaWdodClcbiAgICAgICAgZGF0YS5jb250ZXh0LmZpbGxSZWN0KGNhbnZhc1dpZHRoIC0gMSwgeVN0YXJ0LCAxLCBsaW5lSGVpZ2h0KVxuICAgICAgfSBlbHNlIGlmIChzY3JlZW5Sb3cgPT09IHJhbmdlLmVuZC5yb3cpIHtcbiAgICAgICAgd2lkdGggPSBjYW52YXNXaWR0aCAtIHhTdGFydFxuXG4gICAgICAgIGRhdGEuY29udGV4dC5maWxsUmVjdCgwLCB5RW5kLCB4RW5kLCAxKVxuICAgICAgICBkYXRhLmNvbnRleHQuZmlsbFJlY3QoMCwgeVN0YXJ0LCAxLCBsaW5lSGVpZ2h0KVxuICAgICAgICBkYXRhLmNvbnRleHQuZmlsbFJlY3QoeEVuZCwgeVN0YXJ0LCAxLCBsaW5lSGVpZ2h0KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGF0YS5jb250ZXh0LmZpbGxSZWN0KDAsIHlTdGFydCwgMSwgbGluZUhlaWdodClcbiAgICAgICAgZGF0YS5jb250ZXh0LmZpbGxSZWN0KGNhbnZhc1dpZHRoIC0gMSwgeVN0YXJ0LCAxLCBsaW5lSGVpZ2h0KVxuICAgICAgICBpZiAoc2NyZWVuUm93ID09PSByYW5nZS5zdGFydC5yb3cgKyAxKSB7XG4gICAgICAgICAgZGF0YS5jb250ZXh0LmZpbGxSZWN0KDAsIHlTdGFydCwgeFN0YXJ0LCAxKVxuICAgICAgICB9XG4gICAgICAgIGlmIChzY3JlZW5Sb3cgPT09IHJhbmdlLmVuZC5yb3cgLSAxKSB7XG4gICAgICAgICAgZGF0YS5jb250ZXh0LmZpbGxSZWN0KHhFbmQsIHlFbmQsIGNhbnZhc1dpZHRoIC0geEVuZCwgMSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEcmF3cyBhIGN1c3RvbSBkZWNvcmF0aW9uLlxuICAgKlxuICAgKiBJdCByZW5kZXJzIG9ubHkgdGhlIHBhcnQgb2YgdGhlIGhpZ2hsaWdodCBjb3JyZXNwb25kaW5nIHRvIHRoZSBzcGVjaWZpZWRcbiAgICogcm93LlxuICAgKlxuICAgKiBAcGFyYW0gIHtEZWNvcmF0aW9ufSBkZWNvcmF0aW9uIHRoZSBkZWNvcmF0aW9uIHRvIHJlbmRlclxuICAgKiBAcGFyYW0gIHtPYmplY3R9IGRhdGEgdGhlIGRhdGEgbmVlZCB0byBwZXJmb3JtIHRoZSByZW5kZXJcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBkcmF3Q3VzdG9tRGVjb3JhdGlvbiAoZGVjb3JhdGlvbiwgZGF0YSkge1xuICAgIGNvbnN0IHJlbmRlclJvdXRpbmUgPSBkZWNvcmF0aW9uLmdldFByb3BlcnRpZXMoKS5yZW5kZXJcblxuICAgIGlmIChyZW5kZXJSb3V0aW5lKSB7XG4gICAgICBkYXRhLmNvbG9yID0gdGhpcy5nZXREZWNvcmF0aW9uQ29sb3IoZGVjb3JhdGlvbilcbiAgICAgIHJlbmRlclJvdXRpbmUoZGVjb3JhdGlvbiwgZGF0YSlcbiAgICB9XG4gIH1cblxuICAvLyAgICAjIyMjIyMjIyAgICAgIyMjICAgICMjICAgICMjICAjIyMjIyMgICAjIyMjIyMjIyAgIyMjIyMjXG4gIC8vICAgICMjICAgICAjIyAgICMjICMjICAgIyMjICAgIyMgIyMgICAgIyMgICMjICAgICAgICMjICAgICMjXG4gIC8vICAgICMjICAgICAjIyAgIyMgICAjIyAgIyMjIyAgIyMgIyMgICAgICAgICMjICAgICAgICMjXG4gIC8vICAgICMjIyMjIyMjICAjIyAgICAgIyMgIyMgIyMgIyMgIyMgICAjIyMjICMjIyMjIyAgICAjIyMjIyNcbiAgLy8gICAgIyMgICAjIyAgICMjIyMjIyMjIyAjIyAgIyMjIyAjIyAgICAjIyAgIyMgICAgICAgICAgICAgIyNcbiAgLy8gICAgIyMgICAgIyMgICMjICAgICAjIyAjIyAgICMjIyAjIyAgICAjIyAgIyMgICAgICAgIyMgICAgIyNcbiAgLy8gICAgIyMgICAgICMjICMjICAgICAjIyAjIyAgICAjIyAgIyMjIyMjICAgIyMjIyMjIyMgICMjIyMjI1xuXG4gIC8qKlxuICAgKiBDb21wdXRlcyB0aGUgcmFuZ2VzIHRoYXQgYXJlIG5vdCBhZmZlY3RlZCBieSB0aGUgY3VycmVudCBwZW5kaW5nIGNoYW5nZXMuXG4gICAqXG4gICAqIEBwYXJhbSAge251bWJlcn0gZmlyc3RSb3cgdGhlIGZpcnN0IHJvdyBvZiB0aGUgcmVuZGVyZWQgcmVnaW9uXG4gICAqIEBwYXJhbSAge251bWJlcn0gbGFzdFJvdyB0aGUgbGFzdCByb3cgb2YgdGhlIHJlbmRlcmVkIHJlZ2lvblxuICAgKiBAcmV0dXJuIHtBcnJheTxPYmplY3Q+fSB0aGUgaW50YWN0IHJhbmdlcyBpbiB0aGUgcmVuZGVyZWQgcmVnaW9uXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgY29tcHV0ZUludGFjdFJhbmdlcyAoZmlyc3RSb3csIGxhc3RSb3csIGNoYW5nZXMpIHtcbiAgICBpZiAoKHRoaXMub2Zmc2NyZWVuRmlyc3RSb3cgPT0gbnVsbCkgJiYgKHRoaXMub2Zmc2NyZWVuTGFzdFJvdyA9PSBudWxsKSkge1xuICAgICAgcmV0dXJuIFtdXG4gICAgfVxuXG4gICAgLy8gQXQgZmlyc3QsIHRoZSB3aG9sZSByYW5nZSBpcyBjb25zaWRlcmVkIGludGFjdFxuICAgIGxldCBpbnRhY3RSYW5nZXMgPSBbXG4gICAgICB7XG4gICAgICAgIHN0YXJ0OiB0aGlzLm9mZnNjcmVlbkZpcnN0Um93LFxuICAgICAgICBlbmQ6IHRoaXMub2Zmc2NyZWVuTGFzdFJvdyxcbiAgICAgICAgb2Zmc2NyZWVuUm93OiAwXG4gICAgICB9XG4gICAgXVxuXG4gICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IGNoYW5nZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGNvbnN0IGNoYW5nZSA9IGNoYW5nZXNbaV1cbiAgICAgIGNvbnN0IG5ld0ludGFjdFJhbmdlcyA9IFtdXG5cbiAgICAgIGZvciAobGV0IGogPSAwLCBpbnRhY3RMZW4gPSBpbnRhY3RSYW5nZXMubGVuZ3RoOyBqIDwgaW50YWN0TGVuOyBqKyspIHtcbiAgICAgICAgY29uc3QgcmFuZ2UgPSBpbnRhY3RSYW5nZXNbal1cblxuICAgICAgICBpZiAoY2hhbmdlLmVuZCA8IHJhbmdlLnN0YXJ0ICYmIGNoYW5nZS5zY3JlZW5EZWx0YSAhPT0gMCkge1xuICAgICAgICAgIC8vIFRoZSBjaGFuZ2UgaXMgYWJvdmUgb2YgdGhlIHJhbmdlIGFuZCBsaW5lcyBhcmUgZWl0aGVyXG4gICAgICAgICAgLy8gYWRkZWQgb3IgcmVtb3ZlZFxuICAgICAgICAgIG5ld0ludGFjdFJhbmdlcy5wdXNoKHtcbiAgICAgICAgICAgIHN0YXJ0OiByYW5nZS5zdGFydCArIGNoYW5nZS5zY3JlZW5EZWx0YSxcbiAgICAgICAgICAgIGVuZDogcmFuZ2UuZW5kICsgY2hhbmdlLnNjcmVlbkRlbHRhLFxuICAgICAgICAgICAgb2Zmc2NyZWVuUm93OiByYW5nZS5vZmZzY3JlZW5Sb3dcbiAgICAgICAgICB9KVxuICAgICAgICB9IGVsc2UgaWYgKGNoYW5nZS5lbmQgPCByYW5nZS5zdGFydCB8fCBjaGFuZ2Uuc3RhcnQgPiByYW5nZS5lbmQpIHtcbiAgICAgICAgICAvLyBUaGUgY2hhbmdlIGlzIG91dHNpZGUgdGhlIHJhbmdlIGJ1dCBkaWRuJ3QgYWRkXG4gICAgICAgICAgLy8gb3IgcmVtb3ZlIGxpbmVzXG4gICAgICAgICAgbmV3SW50YWN0UmFuZ2VzLnB1c2gocmFuZ2UpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gVGhlIGNoYW5nZSBpcyB3aXRoaW4gdGhlIHJhbmdlLCB0aGVyZSdzIG9uZSBpbnRhY3QgcmFuZ2VcbiAgICAgICAgICAvLyBmcm9tIHRoZSByYW5nZSBzdGFydCB0byB0aGUgY2hhbmdlIHN0YXJ0XG4gICAgICAgICAgaWYgKGNoYW5nZS5zdGFydCA+IHJhbmdlLnN0YXJ0KSB7XG4gICAgICAgICAgICBuZXdJbnRhY3RSYW5nZXMucHVzaCh7XG4gICAgICAgICAgICAgIHN0YXJ0OiByYW5nZS5zdGFydCxcbiAgICAgICAgICAgICAgZW5kOiBjaGFuZ2Uuc3RhcnQgLSAxLFxuICAgICAgICAgICAgICBvZmZzY3JlZW5Sb3c6IHJhbmdlLm9mZnNjcmVlblJvd1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGNoYW5nZS5lbmQgPCByYW5nZS5lbmQpIHtcbiAgICAgICAgICAgIC8vIFRoZSBjaGFuZ2UgZW5kcyB3aXRoaW4gdGhlIHJhbmdlXG4gICAgICAgICAgICBpZiAoY2hhbmdlLmJ1ZmZlckRlbHRhICE9PSAwKSB7XG4gICAgICAgICAgICAgIC8vIExpbmVzIGFyZSBhZGRlZCBvciByZW1vdmVkLCB0aGUgaW50YWN0IHJhbmdlIHN0YXJ0cyBpbiB0aGVcbiAgICAgICAgICAgICAgLy8gbmV4dCBsaW5lIGFmdGVyIHRoZSBjaGFuZ2UgZW5kIHBsdXMgdGhlIHNjcmVlbiBkZWx0YVxuICAgICAgICAgICAgICBuZXdJbnRhY3RSYW5nZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgc3RhcnQ6IGNoYW5nZS5lbmQgKyBjaGFuZ2Uuc2NyZWVuRGVsdGEgKyAxLFxuICAgICAgICAgICAgICAgIGVuZDogcmFuZ2UuZW5kICsgY2hhbmdlLnNjcmVlbkRlbHRhLFxuICAgICAgICAgICAgICAgIG9mZnNjcmVlblJvdzogcmFuZ2Uub2Zmc2NyZWVuUm93ICsgY2hhbmdlLmVuZCArIDEgLSByYW5nZS5zdGFydFxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSBlbHNlIGlmIChjaGFuZ2Uuc2NyZWVuRGVsdGEgIT09IDApIHtcbiAgICAgICAgICAgICAgLy8gTGluZXMgYXJlIGFkZGVkIG9yIHJlbW92ZWQgaW4gdGhlIGRpc3BsYXkgYnVmZmVyLCB0aGUgaW50YWN0XG4gICAgICAgICAgICAgIC8vIHJhbmdlIHN0YXJ0cyBpbiB0aGUgbmV4dCBsaW5lIGFmdGVyIHRoZSBjaGFuZ2UgZW5kIHBsdXMgdGhlXG4gICAgICAgICAgICAgIC8vIHNjcmVlbiBkZWx0YVxuICAgICAgICAgICAgICBuZXdJbnRhY3RSYW5nZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgc3RhcnQ6IGNoYW5nZS5lbmQgKyBjaGFuZ2Uuc2NyZWVuRGVsdGEgKyAxLFxuICAgICAgICAgICAgICAgIGVuZDogcmFuZ2UuZW5kICsgY2hhbmdlLnNjcmVlbkRlbHRhLFxuICAgICAgICAgICAgICAgIG9mZnNjcmVlblJvdzogcmFuZ2Uub2Zmc2NyZWVuUm93ICsgY2hhbmdlLmVuZCArIDEgLSByYW5nZS5zdGFydFxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gTm8gbGluZXMgYXJlIGFkZGVkLCB0aGUgaW50YWN0IHJhbmdlIHN0YXJ0cyBvbiB0aGUgbGluZSBhZnRlclxuICAgICAgICAgICAgICAvLyB0aGUgY2hhbmdlIGVuZFxuICAgICAgICAgICAgICBuZXdJbnRhY3RSYW5nZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgc3RhcnQ6IGNoYW5nZS5lbmQgKyAxLFxuICAgICAgICAgICAgICAgIGVuZDogcmFuZ2UuZW5kLFxuICAgICAgICAgICAgICAgIG9mZnNjcmVlblJvdzogcmFuZ2Uub2Zmc2NyZWVuUm93ICsgY2hhbmdlLmVuZCArIDEgLSByYW5nZS5zdGFydFxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaW50YWN0UmFuZ2VzID0gbmV3SW50YWN0UmFuZ2VzXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMudHJ1bmNhdGVJbnRhY3RSYW5nZXMoaW50YWN0UmFuZ2VzLCBmaXJzdFJvdywgbGFzdFJvdylcbiAgfVxuXG4gIC8qKlxuICAgKiBUcnVuY2F0ZXMgdGhlIGludGFjdCByYW5nZXMgc28gdGhhdCB0aGV5IGRvZXNuJ3QgZXhwYW5kIHBhc3QgdGhlIHZpc2libGVcbiAgICogYXJlYSBvZiB0aGUgbWluaW1hcC5cbiAgICpcbiAgICogQHBhcmFtICB7QXJyYXk8T2JqZWN0Pn0gaW50YWN0UmFuZ2VzIHRoZSBpbml0aWFsIGFycmF5IG9mIHJhbmdlc1xuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGZpcnN0Um93IHRoZSBmaXJzdCByb3cgb2YgdGhlIHJlbmRlcmVkIHJlZ2lvblxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGxhc3RSb3cgdGhlIGxhc3Qgcm93IG9mIHRoZSByZW5kZXJlZCByZWdpb25cbiAgICogQHJldHVybiB7QXJyYXk8T2JqZWN0Pn0gdGhlIGFycmF5IG9mIHRydW5jYXRlZCByYW5nZXNcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICB0cnVuY2F0ZUludGFjdFJhbmdlcyAoaW50YWN0UmFuZ2VzLCBmaXJzdFJvdywgbGFzdFJvdykge1xuICAgIGxldCBpID0gMFxuICAgIHdoaWxlIChpIDwgaW50YWN0UmFuZ2VzLmxlbmd0aCkge1xuICAgICAgY29uc3QgcmFuZ2UgPSBpbnRhY3RSYW5nZXNbaV1cblxuICAgICAgaWYgKHJhbmdlLnN0YXJ0IDwgZmlyc3RSb3cpIHtcbiAgICAgICAgcmFuZ2Uub2Zmc2NyZWVuUm93ICs9IGZpcnN0Um93IC0gcmFuZ2Uuc3RhcnRcbiAgICAgICAgcmFuZ2Uuc3RhcnQgPSBmaXJzdFJvd1xuICAgICAgfVxuXG4gICAgICBpZiAocmFuZ2UuZW5kID4gbGFzdFJvdykgeyByYW5nZS5lbmQgPSBsYXN0Um93IH1cblxuICAgICAgaWYgKHJhbmdlLnN0YXJ0ID49IHJhbmdlLmVuZCkgeyBpbnRhY3RSYW5nZXMuc3BsaWNlKGktLSwgMSkgfVxuXG4gICAgICBpKytcbiAgICB9XG5cbiAgICByZXR1cm4gaW50YWN0UmFuZ2VzLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgIHJldHVybiBhLm9mZnNjcmVlblJvdyAtIGIub2Zmc2NyZWVuUm93XG4gICAgfSlcbiAgfVxufVxuIl19
//# sourceURL=/home/takaaki/.atom/packages/minimap/lib/mixins/canvas-drawer.js
