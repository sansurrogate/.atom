Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _underscorePlus = require('underscore-plus');

var _underscorePlus2 = _interopRequireDefault(_underscorePlus);

var _side = require('./side');

var _navigator = require('./navigator');

// Public: Model an individual conflict parsed from git's automatic conflict resolution output.
'use babel';

var Conflict = (function () {

  /*
   * Private: Initialize a new Conflict with its constituent Sides, Navigator, and the MergeState
   * it belongs to.
   *
   * ours [Side] the lines of this conflict that the current user contributed (by our best guess).
   * theirs [Side] the lines of this conflict that another contributor created.
   * base [Side] the lines of merge base of this conflict. Optional.
   * navigator [Navigator] maintains references to surrounding Conflicts in the original file.
   * state [MergeState] repository-wide information about the current merge.
   */

  function Conflict(ours, theirs, base, navigator, merge) {
    _classCallCheck(this, Conflict);

    this.ours = ours;
    this.theirs = theirs;
    this.base = base;
    this.navigator = navigator;
    this.merge = merge;

    this.emitter = new _atom.Emitter();

    // Populate back-references
    this.ours.conflict = this;
    this.theirs.conflict = this;
    if (this.base) {
      this.base.conflict = this;
    }
    this.navigator.conflict = this;

    // Begin unresolved
    this.resolution = null;
  }

  // Regular expression that matches the beginning of a potential conflict.

  /*
   * Public: Has this conflict been resolved in any way?
   *
   * Return [Boolean]
   */

  _createClass(Conflict, [{
    key: 'isResolved',
    value: function isResolved() {
      return this.resolution !== null;
    }

    /*
     * Public: Attach an event handler to be notified when this conflict is resolved.
     *
     * callback [Function]
     */
  }, {
    key: 'onDidResolveConflict',
    value: function onDidResolveConflict(callback) {
      return this.emitter.on('resolve-conflict', callback);
    }

    /*
     * Public: Specify which Side is to be kept. Note that either side may have been modified by the
     * user prior to resolution. Notify any subscribers.
     *
     * side [Side] our changes or their changes.
     */
  }, {
    key: 'resolveAs',
    value: function resolveAs(side) {
      this.resolution = side;
      this.emitter.emit('resolve-conflict');
    }

    /*
     * Public: Locate the position that the editor should scroll to in order to make this conflict
     * visible.
     *
     * Return [Point] buffer coordinates
     */
  }, {
    key: 'scrollTarget',
    value: function scrollTarget() {
      return this.ours.marker.getTailBufferPosition();
    }

    /*
     * Public: Audit all Marker instances owned by subobjects within this Conflict.
     *
     * Return [Array<Marker>]
     */
  }, {
    key: 'markers',
    value: function markers() {
      var ms = [this.ours.markers(), this.theirs.markers(), this.navigator.markers()];
      if (this.baseSide) {
        ms.push(this.baseSide.markers());
      }
      return _underscorePlus2['default'].flatten(ms, true);
    }

    /*
     * Public: Console-friendly identification of this conflict.
     *
     * Return [String] that distinguishes this conflict from others.
     */
  }, {
    key: 'toString',
    value: function toString() {
      return '[conflict: ' + this.ours + ' ' + this.theirs + ']';
    }

    /*
     * Public: Parse any conflict markers in a TextEditor's buffer and return a Conflict that contains
     * markers corresponding to each.
     *
     * merge [MergeState] Repository-wide state of the merge.
     * editor [TextEditor] The editor to search.
     * return [Array<Conflict>] A (possibly empty) collection of parsed Conflicts.
     */
  }], [{
    key: 'all',
    value: function all(merge, editor) {
      var conflicts = [];
      var lastRow = -1;

      editor.getBuffer().scan(CONFLICT_START_REGEX, function (m) {
        conflictStartRow = m.range.start.row;
        if (conflictStartRow < lastRow) {
          // Match within an already-parsed conflict.
          return;
        }

        var visitor = new ConflictVisitor(merge, editor);

        try {
          lastRow = parseConflict(merge, editor, conflictStartRow, visitor);
          var conflict = visitor.conflict();

          if (conflicts.length > 0) {
            conflict.navigator.linkToPrevious(conflicts[conflicts.length - 1]);
          }
          conflicts.push(conflict);
        } catch (e) {
          if (!e.parserState) throw e;

          if (!atom.inSpecMode()) {
            console.error('Unable to parse conflict: ' + e.message + '\n' + e.stack);
          }
        }
      });

      return conflicts;
    }
  }]);

  return Conflict;
})();

exports.Conflict = Conflict;
var CONFLICT_START_REGEX = /^<{7} (.+)\r?\n/g;

// Side positions.
var TOP = 'top';
var BASE = 'base';
var BOTTOM = 'bottom';

// Options used to initialize markers.
var options = {
  persistent: false,
  invalidate: 'never'
};

/*
 * Private: conflict parser visitor that ignores all events.
 */

var NoopVisitor = (function () {
  function NoopVisitor() {
    _classCallCheck(this, NoopVisitor);
  }

  /*
   * Private: conflict parser visitor that marks each buffer range and assembles a Conflict from the
   * pieces.
   */

  _createClass(NoopVisitor, [{
    key: 'visitOurSide',
    value: function visitOurSide(position, bannerRow, textRowStart, textRowEnd) {}
  }, {
    key: 'visitBaseSide',
    value: function visitBaseSide(position, bannerRow, textRowStart, textRowEnd) {}
  }, {
    key: 'visitSeparator',
    value: function visitSeparator(sepRowStart, sepRowEnd) {}
  }, {
    key: 'visitTheirSide',
    value: function visitTheirSide(position, bannerRow, textRowStart, textRowEnd) {}
  }]);

  return NoopVisitor;
})();

var ConflictVisitor = (function () {

  /*
   * merge - [MergeState] passed to each instantiated Side.
   * editor - [TextEditor] displaying the conflicting text.
   */

  function ConflictVisitor(merge, editor) {
    _classCallCheck(this, ConflictVisitor);

    this.merge = merge;
    this.editor = editor;
    this.previousSide = null;

    this.ourSide = null;
    this.baseSide = null;
    this.navigator = null;
  }

  /*
   * Private: parseConflict discovers git conflict markers in a corpus of text and constructs Conflict
   * instances that mark the correct lines.
   *
   * Returns [Integer] the buffer row after the final <<<<<< boundary.
   */

  /*
   * position - [String] one of TOP or BOTTOM.
   * bannerRow - [Integer] of the buffer row that contains our side's banner.
   * textRowStart - [Integer] of the first buffer row that contain this side's text.
   * textRowEnd - [Integer] of the first buffer row beyond the extend of this side's text.
   */

  _createClass(ConflictVisitor, [{
    key: 'visitOurSide',
    value: function visitOurSide(position, bannerRow, textRowStart, textRowEnd) {
      this.ourSide = this.markSide(position, _side.OurSide, bannerRow, textRowStart, textRowEnd);
    }

    /*
     * bannerRow - [Integer] the buffer row that contains our side's banner.
     * textRowStart - [Integer] first buffer row that contain this side's text.
     * textRowEnd - [Integer] first buffer row beyond the extend of this side's text.
     */
  }, {
    key: 'visitBaseSide',
    value: function visitBaseSide(bannerRow, textRowStart, textRowEnd) {
      this.baseSide = this.markSide(BASE, _side.BaseSide, bannerRow, textRowStart, textRowEnd);
    }

    /*
     * sepRowStart - [Integer] buffer row that contains the "=======" separator.
     * sepRowEnd - [Integer] the buffer row after the separator.
     */
  }, {
    key: 'visitSeparator',
    value: function visitSeparator(sepRowStart, sepRowEnd) {
      var marker = this.editor.markBufferRange([[sepRowStart, 0], [sepRowEnd, 0]], options);
      this.previousSide.followingMarker = marker;

      this.navigator = new _navigator.Navigator(marker);
      this.previousSide = this.navigator;
    }

    /*
     * position - [String] Always BASE; accepted for consistency.
     * bannerRow - [Integer] the buffer row that contains our side's banner.
     * textRowStart - [Integer] first buffer row that contain this side's text.
     * textRowEnd - [Integer] first buffer row beyond the extend of this side's text.
     */
  }, {
    key: 'visitTheirSide',
    value: function visitTheirSide(position, bannerRow, textRowStart, textRowEnd) {
      this.theirSide = this.markSide(position, _side.TheirSide, bannerRow, textRowStart, textRowEnd);
    }
  }, {
    key: 'markSide',
    value: function markSide(position, sideKlass, bannerRow, textRowStart, textRowEnd) {
      var description = this.sideDescription(bannerRow);

      var bannerMarker = this.editor.markBufferRange([[bannerRow, 0], [bannerRow + 1, 0]], options);

      if (this.previousSide) {
        this.previousSide.followingMarker = bannerMarker;
      }

      var textRange = [[textRowStart, 0], [textRowEnd, 0]];
      var textMarker = this.editor.markBufferRange(textRange, options);
      var text = this.editor.getTextInBufferRange(textRange);

      var side = new sideKlass(text, description, textMarker, bannerMarker, position);
      this.previousSide = side;
      return side;
    }

    /*
     * Parse the banner description for the current side from a banner row.
     */
  }, {
    key: 'sideDescription',
    value: function sideDescription(bannerRow) {
      return this.editor.lineTextForBufferRow(bannerRow).match(/^[<|>]{7} (.*)$/)[1];
    }
  }, {
    key: 'conflict',
    value: function conflict() {
      this.previousSide.followingMarker = this.previousSide.refBannerMarker;

      return new Conflict(this.ourSide, this.theirSide, this.baseSide, this.navigator, this.merge);
    }
  }]);

  return ConflictVisitor;
})();

var parseConflict = function parseConflict(merge, editor, row, visitor) {
  var lastBoundary = null;

  // Visit a side that begins with a banner and description as its first line.
  var visitHeaderSide = function visitHeaderSide(position, visitMethod) {
    var sideRowStart = row;
    row += 1;
    advanceToBoundary('|=');
    var sideRowEnd = row;

    visitor[visitMethod](position, sideRowStart, sideRowStart + 1, sideRowEnd);
  };

  // Visit the base side from diff3 output, if one is present, then visit the separator.
  var visitBaseAndSeparator = function visitBaseAndSeparator() {
    if (lastBoundary === '|') {
      visitBaseSide();
    }

    visitSeparator();
  };

  // Visit a base side from diff3 output.
  var visitBaseSide = function visitBaseSide() {
    var sideRowStart = row;
    row += 1;

    var b = advanceToBoundary('<=');
    while (b === '<') {
      // Embedded recursive conflict within a base side, caused by a criss-cross merge.
      // Advance beyond it without marking anything.
      row = parseConflict(merge, editor, row, new NoopVisitor());
      b = advanceToBoundary('<=');
    }

    var sideRowEnd = row;

    visitor.visitBaseSide(sideRowStart, sideRowStart + 1, sideRowEnd);
  };

  // Visit a "========" separator.
  var visitSeparator = function visitSeparator() {
    var sepRowStart = row;
    row += 1;
    var sepRowEnd = row;

    visitor.visitSeparator(sepRowStart, sepRowEnd);
  };

  // Vidie a side with a banner and description as its last line.
  var visitFooterSide = function visitFooterSide(position, visitMethod) {
    var sideRowStart = row;
    var b = advanceToBoundary('>');
    row += 1;
    sideRowEnd = row;

    visitor[visitMethod](position, sideRowEnd - 1, sideRowStart, sideRowEnd - 1);
  };

  // Determine if the current row is a side boundary.
  //
  // boundaryKinds - [String] any combination of <, |, =, or > to limit the kinds of boundary
  //   detected.
  //
  // Returns the matching boundaryKinds character, or `null` if none match.
  var isAtBoundary = function isAtBoundary() {
    var boundaryKinds = arguments.length <= 0 || arguments[0] === undefined ? '<|=>' : arguments[0];

    var line = editor.lineTextForBufferRow(row);
    for (b of boundaryKinds) {
      if (line.startsWith(b.repeat(7))) {
        return b;
      }
    }
    return null;
  };

  // Increment the current row until the current line matches one of the provided boundary kinds,
  // or until there are no more lines in the editor.
  //
  // boundaryKinds - [String] any combination of <, |, =, or > to limit the kinds of boundaries
  //   that halt the progression.
  //
  // Returns the matching boundaryKinds character, or 'null' if there are no matches to the end of
  // the editor.
  var advanceToBoundary = function advanceToBoundary() {
    var boundaryKinds = arguments.length <= 0 || arguments[0] === undefined ? '<|=>' : arguments[0];

    var b = isAtBoundary(boundaryKinds);
    while (b === null) {
      row += 1;
      if (row > editor.getLastBufferRow()) {
        var e = new Error('Unterminated conflict side');
        e.parserState = true;
        throw e;
      }
      b = isAtBoundary(boundaryKinds);
    }

    lastBoundary = b;
    return b;
  };

  if (!merge.isRebase) {
    visitHeaderSide(TOP, 'visitOurSide');
    visitBaseAndSeparator();
    visitFooterSide(BOTTOM, 'visitTheirSide');
  } else {
    visitHeaderSide(TOP, 'visitTheirSide');
    visitBaseAndSeparator();
    visitFooterSide(BOTTOM, 'visitOurSide');
  }

  return row;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvbWVyZ2UtY29uZmxpY3RzL2xpYi9jb25mbGljdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O29CQUVzQixNQUFNOzs4QkFDZCxpQkFBaUI7Ozs7b0JBRWtCLFFBQVE7O3lCQUNqQyxhQUFhOzs7QUFOckMsV0FBVyxDQUFBOztJQVNFLFFBQVE7Ozs7Ozs7Ozs7Ozs7QUFZUCxXQVpELFFBQVEsQ0FZTixJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFOzBCQVp4QyxRQUFROztBQWFqQixRQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtBQUNoQixRQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtBQUNwQixRQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtBQUNoQixRQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQTtBQUMxQixRQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTs7QUFFbEIsUUFBSSxDQUFDLE9BQU8sR0FBRyxtQkFBYSxDQUFBOzs7QUFHNUIsUUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFBO0FBQ3pCLFFBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQTtBQUMzQixRQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7QUFDYixVQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUE7S0FDMUI7QUFDRCxRQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUE7OztBQUc5QixRQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQTtHQUN2Qjs7Ozs7Ozs7OztlQS9CVSxRQUFROztXQXNDVCxzQkFBRztBQUNYLGFBQU8sSUFBSSxDQUFDLFVBQVUsS0FBSyxJQUFJLENBQUE7S0FDaEM7Ozs7Ozs7OztXQU9vQiw4QkFBQyxRQUFRLEVBQUU7QUFDOUIsYUFB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QyxDQUFBO09BQ1I7QUFDRCxPQUFDLEdBQUcsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFBO0tBQ2hDOztBQUVELGdCQUFZLEdBQUcsQ0FBQyxDQUFBO0FBQ2hCLFdBQU8sQ0FBQyxDQUFBO0dBQ1QsQ0FBQTs7QUFFRCxNQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRTtBQUNuQixtQkFBZSxDQUFDLEdBQUcsRUFBRSxjQUFjLENBQUMsQ0FBQTtBQUNwQyx5QkFBcUIsRUFBRSxDQUFBO0FBQ3ZCLG1CQUFlLENBQUMsTUFBTSxFQUFFLGdCQUFnQixDQUFDLENBQUE7R0FDMUMsTUFBTTtBQUNMLG1CQUFlLENBQUMsR0FBRyxFQUFFLGdCQUFnQixDQUFDLENBQUE7QUFDdEMseUJBQXFCLEVBQUUsQ0FBQTtBQUN2QixtQkFBZSxDQUFDLE1BQU0sRUFBRSxjQUFjLENBQUMsQ0FBQTtHQUN4Qzs7QUFFRCxTQUFPLEdBQUcsQ0FBQTtDQUNYLENBQUEiLCJmaWxlIjoiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9tZXJnZS1jb25mbGljdHMvbGliL2NvbmZsaWN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IHtFbWl0dGVyfSBmcm9tICdhdG9tJ1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZS1wbHVzJ1xuXG5pbXBvcnQge1NpZGUsIE91clNpZGUsIFRoZWlyU2lkZSwgQmFzZVNpZGV9IGZyb20gJy4vc2lkZSdcbmltcG9ydCB7TmF2aWdhdG9yfSBmcm9tICcuL25hdmlnYXRvcidcblxuLy8gUHVibGljOiBNb2RlbCBhbiBpbmRpdmlkdWFsIGNvbmZsaWN0IHBhcnNlZCBmcm9tIGdpdCdzIGF1dG9tYXRpYyBjb25mbGljdCByZXNvbHV0aW9uIG91dHB1dC5cbmV4cG9ydCBjbGFzcyBDb25mbGljdCB7XG5cbiAgLypcbiAgICogUHJpdmF0ZTogSW5pdGlhbGl6ZSBhIG5ldyBDb25mbGljdCB3aXRoIGl0cyBjb25zdGl0dWVudCBTaWRlcywgTmF2aWdhdG9yLCBhbmQgdGhlIE1lcmdlU3RhdGVcbiAgICogaXQgYmVsb25ncyB0by5cbiAgICpcbiAgICogb3VycyBbU2lkZV0gdGhlIGxpbmVzIG9mIHRoaXMgY29uZmxpY3QgdGhhdCB0aGUgY3VycmVudCB1c2VyIGNvbnRyaWJ1dGVkIChieSBvdXIgYmVzdCBndWVzcykuXG4gICAqIHRoZWlycyBbU2lkZV0gdGhlIGxpbmVzIG9mIHRoaXMgY29uZmxpY3QgdGhhdCBhbm90aGVyIGNvbnRyaWJ1dG9yIGNyZWF0ZWQuXG4gICAqIGJhc2UgW1NpZGVdIHRoZSBsaW5lcyBvZiBtZXJnZSBiYXNlIG9mIHRoaXMgY29uZmxpY3QuIE9wdGlvbmFsLlxuICAgKiBuYXZpZ2F0b3IgW05hdmlnYXRvcl0gbWFpbnRhaW5zIHJlZmVyZW5jZXMgdG8gc3Vycm91bmRpbmcgQ29uZmxpY3RzIGluIHRoZSBvcmlnaW5hbCBmaWxlLlxuICAgKiBzdGF0ZSBbTWVyZ2VTdGF0ZV0gcmVwb3NpdG9yeS13aWRlIGluZm9ybWF0aW9uIGFib3V0IHRoZSBjdXJyZW50IG1lcmdlLlxuICAgKi9cbiAgY29uc3RydWN0b3IgKG91cnMsIHRoZWlycywgYmFzZSwgbmF2aWdhdG9yLCBtZXJnZSkge1xuICAgIHRoaXMub3VycyA9IG91cnNcbiAgICB0aGlzLnRoZWlycyA9IHRoZWlyc1xuICAgIHRoaXMuYmFzZSA9IGJhc2VcbiAgICB0aGlzLm5hdmlnYXRvciA9IG5hdmlnYXRvclxuICAgIHRoaXMubWVyZ2UgPSBtZXJnZVxuXG4gICAgdGhpcy5lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKVxuXG4gICAgLy8gUG9wdWxhdGUgYmFjay1yZWZlcmVuY2VzXG4gICAgdGhpcy5vdXJzLmNvbmZsaWN0ID0gdGhpc1xuICAgIHRoaXMudGhlaXJzLmNvbmZsaWN0ID0gdGhpc1xuICAgIGlmICh0aGlzLmJhc2UpIHtcbiAgICAgIHRoaXMuYmFzZS5jb25mbGljdCA9IHRoaXNcbiAgICB9XG4gICAgdGhpcy5uYXZpZ2F0b3IuY29uZmxpY3QgPSB0aGlzXG5cbiAgICAvLyBCZWdpbiB1bnJlc29sdmVkXG4gICAgdGhpcy5yZXNvbHV0aW9uID0gbnVsbFxuICB9XG5cbiAgLypcbiAgICogUHVibGljOiBIYXMgdGhpcyBjb25mbGljdCBiZWVuIHJlc29sdmVkIGluIGFueSB3YXk/XG4gICAqXG4gICAqIFJldHVybiBbQm9vbGVhbl1cbiAgICovXG4gIGlzUmVzb2x2ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVzb2x1dGlvbiAhPT0gbnVsbFxuICB9XG5cbiAgLypcbiAgICogUHVibGljOiBBdHRhY2ggYW4gZXZlbnQgaGFuZGxlciB0byBiZSBub3RpZmllZCB3aGVuIHRoaXMgY29uZmxpY3QgaXMgcmVzb2x2ZWQuXG4gICAqXG4gICAqIGNhbGxiYWNrIFtGdW5jdGlvbl1cbiAgICovXG4gIG9uRGlkUmVzb2x2ZUNvbmZsaWN0IChjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ3Jlc29sdmUtY29uZmxpY3QnLCBjYWxsYmFjaylcbiAgfVxuXG4gIC8qXG4gICAqIFB1YmxpYzogU3BlY2lmeSB3aGljaCBTaWRlIGlzIHRvIGJlIGtlcHQuIE5vdGUgdGhhdCBlaXRoZXIgc2lkZSBtYXkgaGF2ZSBiZWVuIG1vZGlmaWVkIGJ5IHRoZVxuICAgKiB1c2VyIHByaW9yIHRvIHJlc29sdXRpb24uIE5vdGlmeSBhbnkgc3Vic2NyaWJlcnMuXG4gICAqXG4gICAqIHNpZGUgW1NpZGVdIG91ciBjaGFuZ2VzIG9yIHRoZWlyIGNoYW5nZXMuXG4gICAqL1xuICByZXNvbHZlQXMgKHNpZGUpIHtcbiAgICB0aGlzLnJlc29sdXRpb24gPSBzaWRlXG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ3Jlc29sdmUtY29uZmxpY3QnKVxuICB9XG5cbiAgLypcbiAgICogUHVibGljOiBMb2NhdGUgdGhlIHBvc2l0aW9uIHRoYXQgdGhlIGVkaXRvciBzaG91bGQgc2Nyb2xsIHRvIGluIG9yZGVyIHRvIG1ha2UgdGhpcyBjb25mbGljdFxuICAgKiB2aXNpYmxlLlxuICAgKlxuICAgKiBSZXR1cm4gW1BvaW50XSBidWZmZXIgY29vcmRpbmF0ZXNcbiAgICovXG4gIHNjcm9sbFRhcmdldCAoKSB7XG4gICAgcmV0dXJuIHRoaXMub3Vycy5tYXJrZXIuZ2V0VGFpbEJ1ZmZlclBvc2l0aW9uKClcbiAgfVxuXG4gIC8qXG4gICAqIFB1YmxpYzogQXVkaXQgYWxsIE1hcmtlciBpbnN0YW5jZXMgb3duZWQgYnkgc3Vib2JqZWN0cyB3aXRoaW4gdGhpcyBDb25mbGljdC5cbiAgICpcbiAgICogUmV0dXJuIFtBcnJheTxNYXJrZXI+XVxuICAgKi9cbiAgbWFya2VycyAoKSB7XG4gICAgY29uc3QgbXMgPSBbdGhpcy5vdXJzLm1hcmtlcnMoKSwgdGhpcy50aGVpcnMubWFya2VycygpLCB0aGlzLm5hdmlnYXRvci5tYXJrZXJzKCldXG4gICAgaWYgKHRoaXMuYmFzZVNpZGUpIHtcbiAgICAgIG1zLnB1c2godGhpcy5iYXNlU2lkZS5tYXJrZXJzKCkpXG4gICAgfVxuICAgIHJldHVybiBfLmZsYXR0ZW4obXMsIHRydWUpXG4gIH1cblxuICAvKlxuICAgKiBQdWJsaWM6IENvbnNvbGUtZnJpZW5kbHkgaWRlbnRpZmljYXRpb24gb2YgdGhpcyBjb25mbGljdC5cbiAgICpcbiAgICogUmV0dXJuIFtTdHJpbmddIHRoYXQgZGlzdGluZ3Vpc2hlcyB0aGlzIGNvbmZsaWN0IGZyb20gb3RoZXJzLlxuICAgKi9cbiAgdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiBgW2NvbmZsaWN0OiAke3RoaXMub3Vyc30gJHt0aGlzLnRoZWlyc31dYFxuICB9XG5cbiAgLypcbiAgICogUHVibGljOiBQYXJzZSBhbnkgY29uZmxpY3QgbWFya2VycyBpbiBhIFRleHRFZGl0b3IncyBidWZmZXIgYW5kIHJldHVybiBhIENvbmZsaWN0IHRoYXQgY29udGFpbnNcbiAgICogbWFya2VycyBjb3JyZXNwb25kaW5nIHRvIGVhY2guXG4gICAqXG4gICAqIG1lcmdlIFtNZXJnZVN0YXRlXSBSZXBvc2l0b3J5LXdpZGUgc3RhdGUgb2YgdGhlIG1lcmdlLlxuICAgKiBlZGl0b3IgW1RleHRFZGl0b3JdIFRoZSBlZGl0b3IgdG8gc2VhcmNoLlxuICAgKiByZXR1cm4gW0FycmF5PENvbmZsaWN0Pl0gQSAocG9zc2libHkgZW1wdHkpIGNvbGxlY3Rpb24gb2YgcGFyc2VkIENvbmZsaWN0cy5cbiAgICovXG4gIHN0YXRpYyBhbGwgKG1lcmdlLCBlZGl0b3IpIHtcbiAgICBjb25zdCBjb25mbGljdHMgPSBbXVxuICAgIGxldCBsYXN0Um93ID0gLTFcblxuICAgIGVkaXRvci5nZXRCdWZmZXIoKS5zY2FuKENPTkZMSUNUX1NUQVJUX1JFR0VYLCAobSkgPT4ge1xuICAgICAgY29uZmxpY3RTdGFydFJvdyA9IG0ucmFuZ2Uuc3RhcnQucm93XG4gICAgICBpZiAoY29uZmxpY3RTdGFydFJvdyA8IGxhc3RSb3cpIHtcbiAgICAgICAgLy8gTWF0Y2ggd2l0aGluIGFuIGFscmVhZHktcGFyc2VkIGNvbmZsaWN0LlxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgY29uc3QgdmlzaXRvciA9IG5ldyBDb25mbGljdFZpc2l0b3IobWVyZ2UsIGVkaXRvcilcblxuICAgICAgdHJ5IHtcbiAgICAgICAgbGFzdFJvdyA9IHBhcnNlQ29uZmxpY3QobWVyZ2UsIGVkaXRvciwgY29uZmxpY3RTdGFydFJvdywgdmlzaXRvcilcbiAgICAgICAgY29uc3QgY29uZmxpY3QgPSB2aXNpdG9yLmNvbmZsaWN0KClcblxuICAgICAgICBpZiAoY29uZmxpY3RzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBjb25mbGljdC5uYXZpZ2F0b3IubGlua1RvUHJldmlvdXMoY29uZmxpY3RzW2NvbmZsaWN0cy5sZW5ndGggLSAxXSlcbiAgICAgICAgfVxuICAgICAgICBjb25mbGljdHMucHVzaChjb25mbGljdClcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgaWYgKCFlLnBhcnNlclN0YXRlKSB0aHJvdyBlXG5cbiAgICAgICAgaWYgKCFhdG9tLmluU3BlY01vZGUoKSkge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFVuYWJsZSB0byBwYXJzZSBjb25mbGljdDogJHtlLm1lc3NhZ2V9XFxuJHtlLnN0YWNrfWApXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIGNvbmZsaWN0c1xuICB9XG59XG5cbi8vIFJlZ3VsYXIgZXhwcmVzc2lvbiB0aGF0IG1hdGNoZXMgdGhlIGJlZ2lubmluZyBvZiBhIHBvdGVudGlhbCBjb25mbGljdC5cbmNvbnN0IENPTkZMSUNUX1NUQVJUX1JFR0VYID0gL148ezd9ICguKylcXHI/XFxuL2dcblxuLy8gU2lkZSBwb3NpdGlvbnMuXG5jb25zdCBUT1AgPSAndG9wJ1xuY29uc3QgQkFTRSA9ICdiYXNlJ1xuY29uc3QgQk9UVE9NID0gJ2JvdHRvbSdcblxuLy8gT3B0aW9ucyB1c2VkIHRvIGluaXRpYWxpemUgbWFya2Vycy5cbmNvbnN0IG9wdGlvbnMgPSB7XG4gIHBlcnNpc3RlbnQ6IGZhbHNlLFxuICBpbnZhbGlkYXRlOiAnbmV2ZXInXG59XG5cbi8qXG4gKiBQcml2YXRlOiBjb25mbGljdCBwYXJzZXIgdmlzaXRvciB0aGF0IGlnbm9yZXMgYWxsIGV2ZW50cy5cbiAqL1xuY2xhc3MgTm9vcFZpc2l0b3Ige1xuXG4gIHZpc2l0T3VyU2lkZSAocG9zaXRpb24sIGJhbm5lclJvdywgdGV4dFJvd1N0YXJ0LCB0ZXh0Um93RW5kKSB7IH1cblxuICB2aXNpdEJhc2VTaWRlIChwb3NpdGlvbiwgYmFubmVyUm93LCB0ZXh0Um93U3RhcnQsIHRleHRSb3dFbmQpIHsgfVxuXG4gIHZpc2l0U2VwYXJhdG9yIChzZXBSb3dTdGFydCwgc2VwUm93RW5kKSB7IH1cblxuICB2aXNpdFRoZWlyU2lkZSAocG9zaXRpb24sIGJhbm5lclJvdywgdGV4dFJvd1N0YXJ0LCB0ZXh0Um93RW5kKSB7IH1cblxufVxuXG4vKlxuICogUHJpdmF0ZTogY29uZmxpY3QgcGFyc2VyIHZpc2l0b3IgdGhhdCBtYXJrcyBlYWNoIGJ1ZmZlciByYW5nZSBhbmQgYXNzZW1ibGVzIGEgQ29uZmxpY3QgZnJvbSB0aGVcbiAqIHBpZWNlcy5cbiAqL1xuY2xhc3MgQ29uZmxpY3RWaXNpdG9yIHtcblxuICAvKlxuICAgKiBtZXJnZSAtIFtNZXJnZVN0YXRlXSBwYXNzZWQgdG8gZWFjaCBpbnN0YW50aWF0ZWQgU2lkZS5cbiAgICogZWRpdG9yIC0gW1RleHRFZGl0b3JdIGRpc3BsYXlpbmcgdGhlIGNvbmZsaWN0aW5nIHRleHQuXG4gICAqL1xuICBjb25zdHJ1Y3RvciAobWVyZ2UsIGVkaXRvcikge1xuICAgIHRoaXMubWVyZ2UgPSBtZXJnZVxuICAgIHRoaXMuZWRpdG9yID0gZWRpdG9yXG4gICAgdGhpcy5wcmV2aW91c1NpZGUgPSBudWxsXG5cbiAgICB0aGlzLm91clNpZGUgPSBudWxsXG4gICAgdGhpcy5iYXNlU2lkZSA9IG51bGxcbiAgICB0aGlzLm5hdmlnYXRvciA9IG51bGxcbiAgfVxuXG4gIC8qXG4gICAqIHBvc2l0aW9uIC0gW1N0cmluZ10gb25lIG9mIFRPUCBvciBCT1RUT00uXG4gICAqIGJhbm5lclJvdyAtIFtJbnRlZ2VyXSBvZiB0aGUgYnVmZmVyIHJvdyB0aGF0IGNvbnRhaW5zIG91ciBzaWRlJ3MgYmFubmVyLlxuICAgKiB0ZXh0Um93U3RhcnQgLSBbSW50ZWdlcl0gb2YgdGhlIGZpcnN0IGJ1ZmZlciByb3cgdGhhdCBjb250YWluIHRoaXMgc2lkZSdzIHRleHQuXG4gICAqIHRleHRSb3dFbmQgLSBbSW50ZWdlcl0gb2YgdGhlIGZpcnN0IGJ1ZmZlciByb3cgYmV5b25kIHRoZSBleHRlbmQgb2YgdGhpcyBzaWRlJ3MgdGV4dC5cbiAgICovXG4gIHZpc2l0T3VyU2lkZSAocG9zaXRpb24sIGJhbm5lclJvdywgdGV4dFJvd1N0YXJ0LCB0ZXh0Um93RW5kKSB7XG4gICAgdGhpcy5vdXJTaWRlID0gdGhpcy5tYXJrU2lkZShwb3NpdGlvbiwgT3VyU2lkZSwgYmFubmVyUm93LCB0ZXh0Um93U3RhcnQsIHRleHRSb3dFbmQpXG4gIH1cblxuICAvKlxuICAgKiBiYW5uZXJSb3cgLSBbSW50ZWdlcl0gdGhlIGJ1ZmZlciByb3cgdGhhdCBjb250YWlucyBvdXIgc2lkZSdzIGJhbm5lci5cbiAgICogdGV4dFJvd1N0YXJ0IC0gW0ludGVnZXJdIGZpcnN0IGJ1ZmZlciByb3cgdGhhdCBjb250YWluIHRoaXMgc2lkZSdzIHRleHQuXG4gICAqIHRleHRSb3dFbmQgLSBbSW50ZWdlcl0gZmlyc3QgYnVmZmVyIHJvdyBiZXlvbmQgdGhlIGV4dGVuZCBvZiB0aGlzIHNpZGUncyB0ZXh0LlxuICAgKi9cbiAgdmlzaXRCYXNlU2lkZSAoYmFubmVyUm93LCB0ZXh0Um93U3RhcnQsIHRleHRSb3dFbmQpIHtcbiAgICB0aGlzLmJhc2VTaWRlID0gdGhpcy5tYXJrU2lkZShCQVNFLCBCYXNlU2lkZSwgYmFubmVyUm93LCB0ZXh0Um93U3RhcnQsIHRleHRSb3dFbmQpXG4gIH1cblxuICAvKlxuICAgKiBzZXBSb3dTdGFydCAtIFtJbnRlZ2VyXSBidWZmZXIgcm93IHRoYXQgY29udGFpbnMgdGhlIFwiPT09PT09PVwiIHNlcGFyYXRvci5cbiAgICogc2VwUm93RW5kIC0gW0ludGVnZXJdIHRoZSBidWZmZXIgcm93IGFmdGVyIHRoZSBzZXBhcmF0b3IuXG4gICAqL1xuICB2aXNpdFNlcGFyYXRvciAoc2VwUm93U3RhcnQsIHNlcFJvd0VuZCkge1xuICAgIGNvbnN0IG1hcmtlciA9IHRoaXMuZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShbW3NlcFJvd1N0YXJ0LCAwXSwgW3NlcFJvd0VuZCwgMF1dLCBvcHRpb25zKVxuICAgIHRoaXMucHJldmlvdXNTaWRlLmZvbGxvd2luZ01hcmtlciA9IG1hcmtlclxuXG4gICAgdGhpcy5uYXZpZ2F0b3IgPSBuZXcgTmF2aWdhdG9yKG1hcmtlcilcbiAgICB0aGlzLnByZXZpb3VzU2lkZSA9IHRoaXMubmF2aWdhdG9yXG4gIH1cblxuICAvKlxuICAgKiBwb3NpdGlvbiAtIFtTdHJpbmddIEFsd2F5cyBCQVNFOyBhY2NlcHRlZCBmb3IgY29uc2lzdGVuY3kuXG4gICAqIGJhbm5lclJvdyAtIFtJbnRlZ2VyXSB0aGUgYnVmZmVyIHJvdyB0aGF0IGNvbnRhaW5zIG91ciBzaWRlJ3MgYmFubmVyLlxuICAgKiB0ZXh0Um93U3RhcnQgLSBbSW50ZWdlcl0gZmlyc3QgYnVmZmVyIHJvdyB0aGF0IGNvbnRhaW4gdGhpcyBzaWRlJ3MgdGV4dC5cbiAgICogdGV4dFJvd0VuZCAtIFtJbnRlZ2VyXSBmaXJzdCBidWZmZXIgcm93IGJleW9uZCB0aGUgZXh0ZW5kIG9mIHRoaXMgc2lkZSdzIHRleHQuXG4gICAqL1xuICB2aXNpdFRoZWlyU2lkZSAocG9zaXRpb24sIGJhbm5lclJvdywgdGV4dFJvd1N0YXJ0LCB0ZXh0Um93RW5kKSB7XG4gICAgdGhpcy50aGVpclNpZGUgPSB0aGlzLm1hcmtTaWRlKHBvc2l0aW9uLCBUaGVpclNpZGUsIGJhbm5lclJvdywgdGV4dFJvd1N0YXJ0LCB0ZXh0Um93RW5kKVxuICB9XG5cbiAgbWFya1NpZGUgKHBvc2l0aW9uLCBzaWRlS2xhc3MsIGJhbm5lclJvdywgdGV4dFJvd1N0YXJ0LCB0ZXh0Um93RW5kKSB7XG4gICAgY29uc3QgZGVzY3JpcHRpb24gPSB0aGlzLnNpZGVEZXNjcmlwdGlvbihiYW5uZXJSb3cpXG5cbiAgICBjb25zdCBiYW5uZXJNYXJrZXIgPSB0aGlzLmVkaXRvci5tYXJrQnVmZmVyUmFuZ2UoW1tiYW5uZXJSb3csIDBdLCBbYmFubmVyUm93ICsgMSwgMF1dLCBvcHRpb25zKVxuXG4gICAgaWYgKHRoaXMucHJldmlvdXNTaWRlKSB7XG4gICAgICB0aGlzLnByZXZpb3VzU2lkZS5mb2xsb3dpbmdNYXJrZXIgPSBiYW5uZXJNYXJrZXJcbiAgICB9XG5cbiAgICBjb25zdCB0ZXh0UmFuZ2UgPSBbW3RleHRSb3dTdGFydCwgMF0sIFt0ZXh0Um93RW5kLCAwXV1cbiAgICBjb25zdCB0ZXh0TWFya2VyID0gdGhpcy5lZGl0b3IubWFya0J1ZmZlclJhbmdlKHRleHRSYW5nZSwgb3B0aW9ucylcbiAgICBjb25zdCB0ZXh0ID0gdGhpcy5lZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UodGV4dFJhbmdlKVxuXG4gICAgY29uc3Qgc2lkZSA9IG5ldyBzaWRlS2xhc3ModGV4dCwgZGVzY3JpcHRpb24sIHRleHRNYXJrZXIsIGJhbm5lck1hcmtlciwgcG9zaXRpb24pXG4gICAgdGhpcy5wcmV2aW91c1NpZGUgPSBzaWRlXG4gICAgcmV0dXJuIHNpZGVcbiAgfVxuXG4gIC8qXG4gICAqIFBhcnNlIHRoZSBiYW5uZXIgZGVzY3JpcHRpb24gZm9yIHRoZSBjdXJyZW50IHNpZGUgZnJvbSBhIGJhbm5lciByb3cuXG4gICAqL1xuICBzaWRlRGVzY3JpcHRpb24gKGJhbm5lclJvdykge1xuICAgIHJldHVybiB0aGlzLmVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhiYW5uZXJSb3cpLm1hdGNoKC9eWzx8Pl17N30gKC4qKSQvKVsxXVxuICB9XG5cbiAgY29uZmxpY3QgKCkge1xuICAgIHRoaXMucHJldmlvdXNTaWRlLmZvbGxvd2luZ01hcmtlciA9IHRoaXMucHJldmlvdXNTaWRlLnJlZkJhbm5lck1hcmtlclxuXG4gICAgcmV0dXJuIG5ldyBDb25mbGljdCh0aGlzLm91clNpZGUsIHRoaXMudGhlaXJTaWRlLCB0aGlzLmJhc2VTaWRlLCB0aGlzLm5hdmlnYXRvciwgdGhpcy5tZXJnZSlcbiAgfVxuXG59XG5cbi8qXG4gKiBQcml2YXRlOiBwYXJzZUNvbmZsaWN0IGRpc2NvdmVycyBnaXQgY29uZmxpY3QgbWFya2VycyBpbiBhIGNvcnB1cyBvZiB0ZXh0IGFuZCBjb25zdHJ1Y3RzIENvbmZsaWN0XG4gKiBpbnN0YW5jZXMgdGhhdCBtYXJrIHRoZSBjb3JyZWN0IGxpbmVzLlxuICpcbiAqIFJldHVybnMgW0ludGVnZXJdIHRoZSBidWZmZXIgcm93IGFmdGVyIHRoZSBmaW5hbCA8PDw8PDwgYm91bmRhcnkuXG4gKi9cbmNvbnN0IHBhcnNlQ29uZmxpY3QgPSBmdW5jdGlvbiAobWVyZ2UsIGVkaXRvciwgcm93LCB2aXNpdG9yKSB7XG4gIGxldCBsYXN0Qm91bmRhcnkgPSBudWxsXG5cbiAgLy8gVmlzaXQgYSBzaWRlIHRoYXQgYmVnaW5zIHdpdGggYSBiYW5uZXIgYW5kIGRlc2NyaXB0aW9uIGFzIGl0cyBmaXJzdCBsaW5lLlxuICBjb25zdCB2aXNpdEhlYWRlclNpZGUgPSAocG9zaXRpb24sIHZpc2l0TWV0aG9kKSA9PiB7XG4gICAgY29uc3Qgc2lkZVJvd1N0YXJ0ID0gcm93XG4gICAgcm93ICs9IDFcbiAgICBhZHZhbmNlVG9Cb3VuZGFyeSgnfD0nKVxuICAgIGNvbnN0IHNpZGVSb3dFbmQgPSByb3dcblxuICAgIHZpc2l0b3JbdmlzaXRNZXRob2RdKHBvc2l0aW9uLCBzaWRlUm93U3RhcnQsIHNpZGVSb3dTdGFydCArIDEsIHNpZGVSb3dFbmQpXG4gIH1cblxuICAvLyBWaXNpdCB0aGUgYmFzZSBzaWRlIGZyb20gZGlmZjMgb3V0cHV0LCBpZiBvbmUgaXMgcHJlc2VudCwgdGhlbiB2aXNpdCB0aGUgc2VwYXJhdG9yLlxuICBjb25zdCB2aXNpdEJhc2VBbmRTZXBhcmF0b3IgPSAoKSA9PiB7XG4gICAgaWYgKGxhc3RCb3VuZGFyeSA9PT0gJ3wnKSB7XG4gICAgICB2aXNpdEJhc2VTaWRlKClcbiAgICB9XG5cbiAgICB2aXNpdFNlcGFyYXRvcigpXG4gIH1cblxuICAvLyBWaXNpdCBhIGJhc2Ugc2lkZSBmcm9tIGRpZmYzIG91dHB1dC5cbiAgY29uc3QgdmlzaXRCYXNlU2lkZSA9ICgpID0+IHtcbiAgICBjb25zdCBzaWRlUm93U3RhcnQgPSByb3dcbiAgICByb3cgKz0gMVxuXG4gICAgbGV0IGIgPSBhZHZhbmNlVG9Cb3VuZGFyeSgnPD0nKVxuICAgIHdoaWxlIChiID09PSAnPCcpIHtcbiAgICAgIC8vIEVtYmVkZGVkIHJlY3Vyc2l2ZSBjb25mbGljdCB3aXRoaW4gYSBiYXNlIHNpZGUsIGNhdXNlZCBieSBhIGNyaXNzLWNyb3NzIG1lcmdlLlxuICAgICAgLy8gQWR2YW5jZSBiZXlvbmQgaXQgd2l0aG91dCBtYXJraW5nIGFueXRoaW5nLlxuICAgICAgcm93ID0gcGFyc2VDb25mbGljdChtZXJnZSwgZWRpdG9yLCByb3csIG5ldyBOb29wVmlzaXRvcigpKVxuICAgICAgYiA9IGFkdmFuY2VUb0JvdW5kYXJ5KCc8PScpXG4gICAgfVxuXG4gICAgY29uc3Qgc2lkZVJvd0VuZCA9IHJvd1xuXG4gICAgdmlzaXRvci52aXNpdEJhc2VTaWRlKHNpZGVSb3dTdGFydCwgc2lkZVJvd1N0YXJ0ICsgMSwgc2lkZVJvd0VuZClcbiAgfVxuXG4gIC8vIFZpc2l0IGEgXCI9PT09PT09PVwiIHNlcGFyYXRvci5cbiAgY29uc3QgdmlzaXRTZXBhcmF0b3IgPSAoKSA9PiB7XG4gICAgY29uc3Qgc2VwUm93U3RhcnQgPSByb3dcbiAgICByb3cgKz0gMVxuICAgIGNvbnN0IHNlcFJvd0VuZCA9IHJvd1xuXG4gICAgdmlzaXRvci52aXNpdFNlcGFyYXRvcihzZXBSb3dTdGFydCwgc2VwUm93RW5kKVxuICB9XG5cbiAgLy8gVmlkaWUgYSBzaWRlIHdpdGggYSBiYW5uZXIgYW5kIGRlc2NyaXB0aW9uIGFzIGl0cyBsYXN0IGxpbmUuXG4gIGNvbnN0IHZpc2l0Rm9vdGVyU2lkZSA9IChwb3NpdGlvbiwgdmlzaXRNZXRob2QpID0+IHtcbiAgICBjb25zdCBzaWRlUm93U3RhcnQgPSByb3dcbiAgICBjb25zdCBiID0gYWR2YW5jZVRvQm91bmRhcnkoJz4nKVxuICAgIHJvdyArPSAxXG4gICAgc2lkZVJvd0VuZCA9IHJvd1xuXG4gICAgdmlzaXRvclt2aXNpdE1ldGhvZF0ocG9zaXRpb24sIHNpZGVSb3dFbmQgLSAxLCBzaWRlUm93U3RhcnQsIHNpZGVSb3dFbmQgLSAxKVxuICB9XG5cbiAgLy8gRGV0ZXJtaW5lIGlmIHRoZSBjdXJyZW50IHJvdyBpcyBhIHNpZGUgYm91bmRhcnkuXG4gIC8vXG4gIC8vIGJvdW5kYXJ5S2luZHMgLSBbU3RyaW5nXSBhbnkgY29tYmluYXRpb24gb2YgPCwgfCwgPSwgb3IgPiB0byBsaW1pdCB0aGUga2luZHMgb2YgYm91bmRhcnlcbiAgLy8gICBkZXRlY3RlZC5cbiAgLy9cbiAgLy8gUmV0dXJucyB0aGUgbWF0Y2hpbmcgYm91bmRhcnlLaW5kcyBjaGFyYWN0ZXIsIG9yIGBudWxsYCBpZiBub25lIG1hdGNoLlxuICBjb25zdCBpc0F0Qm91bmRhcnkgPSAoYm91bmRhcnlLaW5kcyA9ICc8fD0+JykgPT4ge1xuICAgIGNvbnN0IGxpbmUgPSBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cocm93KVxuICAgIGZvciAoYiBvZiBib3VuZGFyeUtpbmRzKSB7XG4gICAgICBpZiAobGluZS5zdGFydHNXaXRoKGIucmVwZWF0KDcpKSkge1xuICAgICAgICByZXR1cm4gYlxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgLy8gSW5jcmVtZW50IHRoZSBjdXJyZW50IHJvdyB1bnRpbCB0aGUgY3VycmVudCBsaW5lIG1hdGNoZXMgb25lIG9mIHRoZSBwcm92aWRlZCBib3VuZGFyeSBraW5kcyxcbiAgLy8gb3IgdW50aWwgdGhlcmUgYXJlIG5vIG1vcmUgbGluZXMgaW4gdGhlIGVkaXRvci5cbiAgLy9cbiAgLy8gYm91bmRhcnlLaW5kcyAtIFtTdHJpbmddIGFueSBjb21iaW5hdGlvbiBvZiA8LCB8LCA9LCBvciA+IHRvIGxpbWl0IHRoZSBraW5kcyBvZiBib3VuZGFyaWVzXG4gIC8vICAgdGhhdCBoYWx0IHRoZSBwcm9ncmVzc2lvbi5cbiAgLy9cbiAgLy8gUmV0dXJucyB0aGUgbWF0Y2hpbmcgYm91bmRhcnlLaW5kcyBjaGFyYWN0ZXIsIG9yICdudWxsJyBpZiB0aGVyZSBhcmUgbm8gbWF0Y2hlcyB0byB0aGUgZW5kIG9mXG4gIC8vIHRoZSBlZGl0b3IuXG4gIGNvbnN0IGFkdmFuY2VUb0JvdW5kYXJ5ID0gKGJvdW5kYXJ5S2luZHMgPSAnPHw9PicpID0+IHtcbiAgICBsZXQgYiA9IGlzQXRCb3VuZGFyeShib3VuZGFyeUtpbmRzKVxuICAgIHdoaWxlIChiID09PSBudWxsKSB7XG4gICAgICByb3cgKz0gMVxuICAgICAgaWYgKHJvdyA+IGVkaXRvci5nZXRMYXN0QnVmZmVyUm93KCkpIHtcbiAgICAgICAgY29uc3QgZSA9IG5ldyBFcnJvcignVW50ZXJtaW5hdGVkIGNvbmZsaWN0IHNpZGUnKVxuICAgICAgICBlLnBhcnNlclN0YXRlID0gdHJ1ZVxuICAgICAgICB0aHJvdyBlXG4gICAgICB9XG4gICAgICBiID0gaXNBdEJvdW5kYXJ5KGJvdW5kYXJ5S2luZHMpXG4gICAgfVxuXG4gICAgbGFzdEJvdW5kYXJ5ID0gYlxuICAgIHJldHVybiBiXG4gIH1cblxuICBpZiAoIW1lcmdlLmlzUmViYXNlKSB7XG4gICAgdmlzaXRIZWFkZXJTaWRlKFRPUCwgJ3Zpc2l0T3VyU2lkZScpXG4gICAgdmlzaXRCYXNlQW5kU2VwYXJhdG9yKClcbiAgICB2aXNpdEZvb3RlclNpZGUoQk9UVE9NLCAndmlzaXRUaGVpclNpZGUnKVxuICB9IGVsc2Uge1xuICAgIHZpc2l0SGVhZGVyU2lkZShUT1AsICd2aXNpdFRoZWlyU2lkZScpXG4gICAgdmlzaXRCYXNlQW5kU2VwYXJhdG9yKClcbiAgICB2aXNpdEZvb3RlclNpZGUoQk9UVE9NLCAndmlzaXRPdXJTaWRlJylcbiAgfVxuXG4gIHJldHVybiByb3dcbn1cbiJdfQ==
//# sourceURL=/home/takaaki/.atom/packages/merge-conflicts/lib/conflict.js
