(function() {
  var AtomGitDiffDetailsView, DiffDetailsDataManager, Housekeeping, Point, Range, View, _, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom-space-pen-views').View;

  _ref = require('atom'), Range = _ref.Range, Point = _ref.Point;

  _ = require('underscore-plus');

  DiffDetailsDataManager = require('./data-manager');

  Housekeeping = require('./housekeeping');

  module.exports = AtomGitDiffDetailsView = (function(_super) {
    __extends(AtomGitDiffDetailsView, _super);

    function AtomGitDiffDetailsView() {
      this.notifyContentsModified = __bind(this.notifyContentsModified, this);
      return AtomGitDiffDetailsView.__super__.constructor.apply(this, arguments);
    }

    Housekeeping.includeInto(AtomGitDiffDetailsView);

    AtomGitDiffDetailsView.content = function() {
      return this.div({
        "class": "git-diff-details-outer"
      }, (function(_this) {
        return function() {
          return _this.div({
            "class": "git-diff-details-main-panel",
            outlet: "mainPanel"
          }, function() {
            return _this.div({
              "class": "editor git-diff-editor",
              outlet: "contents"
            });
          });
        };
      })(this));
    };

    AtomGitDiffDetailsView.prototype.initialize = function(editor) {
      this.editor = editor;
      this.editorView = atom.views.getView(this.editor);
      this.diffDetailsDataManager = new DiffDetailsDataManager();
      this.initializeHousekeeping();
      this.preventFocusOut();
      this.diffEditor = atom.workspace.buildTextEditor({
        lineNumberGutterVisible: false,
        scrollPastEnd: false
      });
      this.contents.html(atom.views.getView(this.diffEditor));
      this.markers = [];
      this.showDiffDetails = false;
      this.lineDiffDetails = null;
      return this.updateCurrentRow();
    };

    AtomGitDiffDetailsView.prototype.preventFocusOut = function() {
      return this.mainPanel.on('mousedown', function() {
        return false;
      });
    };

    AtomGitDiffDetailsView.prototype.getActiveTextEditor = function() {
      return atom.workspace.getActiveTextEditor();
    };

    AtomGitDiffDetailsView.prototype.updateCurrentRow = function() {
      var newCurrentRow, _ref1, _ref2;
      newCurrentRow = ((_ref1 = this.getActiveTextEditor()) != null ? (_ref2 = _ref1.getCursorBufferPosition()) != null ? _ref2.row : void 0 : void 0) + 1;
      if (newCurrentRow !== this.currentRow) {
        this.currentRow = newCurrentRow;
        return true;
      }
      return false;
    };

    AtomGitDiffDetailsView.prototype.notifyContentsModified = function() {
      if (this.editor.isDestroyed()) {
        return;
      }
      this.diffDetailsDataManager.invalidate(this.repositoryForPath(this.editor.getPath()), this.editor.getPath(), this.editor.getText());
      if (this.showDiffDetails) {
        return this.updateDiffDetailsDisplay();
      }
    };

    AtomGitDiffDetailsView.prototype.updateDiffDetails = function() {
      this.diffDetailsDataManager.invalidatePreviousSelectedHunk();
      this.updateCurrentRow();
      return this.updateDiffDetailsDisplay();
    };

    AtomGitDiffDetailsView.prototype.toggleShowDiffDetails = function() {
      this.showDiffDetails = !this.showDiffDetails;
      return this.updateDiffDetails();
    };

    AtomGitDiffDetailsView.prototype.closeDiffDetails = function() {
      this.showDiffDetails = false;
      return this.updateDiffDetails();
    };

    AtomGitDiffDetailsView.prototype.notifyChangeCursorPosition = function() {
      var currentRowChanged;
      if (this.showDiffDetails) {
        currentRowChanged = this.updateCurrentRow();
        if (currentRowChanged) {
          return this.updateDiffDetailsDisplay();
        }
      }
    };

    AtomGitDiffDetailsView.prototype.copy = function() {
      var selectedHunk;
      selectedHunk = this.diffDetailsDataManager.getSelectedHunk(this.currentRow).selectedHunk;
      if (selectedHunk != null) {
        atom.clipboard.write(selectedHunk.oldString);
        if (atom.config.get('git-diff-details.closeAfterCopy')) {
          return this.closeDiffDetails();
        }
      }
    };

    AtomGitDiffDetailsView.prototype.undo = function() {
      var buffer, selectedHunk;
      selectedHunk = this.diffDetailsDataManager.getSelectedHunk(this.currentRow).selectedHunk;
      if ((selectedHunk != null) && (buffer = this.editor.getBuffer())) {
        if (selectedHunk.kind === "m") {
          buffer.setTextInRange([[selectedHunk.start - 1, 0], [selectedHunk.end, 0]], selectedHunk.oldString);
        } else {
          buffer.insert([selectedHunk.start, 0], selectedHunk.oldString);
        }
        if (!atom.config.get('git-diff-details.keepViewToggled')) {
          return this.closeDiffDetails();
        }
      }
    };

    AtomGitDiffDetailsView.prototype.destroyDecoration = function() {
      var marker, _i, _len, _ref1;
      _ref1 = this.markers;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        marker = _ref1[_i];
        marker.destroy();
      }
      return this.markers = [];
    };

    AtomGitDiffDetailsView.prototype.decorateLines = function(editor, start, end, type) {
      var marker, range;
      range = new Range(new Point(start, 0), new Point(end, 0));
      marker = editor.markBufferRange(range);
      editor.decorateMarker(marker, {
        type: 'line',
        "class": "git-diff-details-" + type
      });
      return this.markers.push(marker);
    };

    AtomGitDiffDetailsView.prototype.decorateWords = function(editor, start, words, type) {
      var marker, range, row, word, _i, _len, _results;
      if (!words) {
        return;
      }
      _results = [];
      for (_i = 0, _len = words.length; _i < _len; _i++) {
        word = words[_i];
        if (!word.changed) {
          continue;
        }
        row = start + word.offsetRow;
        range = new Range(new Point(row, word.startCol), new Point(row, word.endCol));
        marker = editor.markBufferRange(range);
        editor.decorateMarker(marker, {
          type: 'highlight',
          "class": "git-diff-details-" + type
        });
        _results.push(this.markers.push(marker));
      }
      return _results;
    };

    AtomGitDiffDetailsView.prototype.display = function(selectedHunk) {
      var classPostfix, marker, range, _ref1;
      this.destroyDecoration();
      classPostfix = atom.config.get('git-diff-details.enableSyntaxHighlighting') ? "highlighted" : "flat";
      if (selectedHunk.kind === "m") {
        this.decorateLines(this.editor, selectedHunk.start - 1, selectedHunk.end, "new-" + classPostfix);
        if (atom.config.get('git-diff-details.showWordDiffs')) {
          this.decorateWords(this.editor, selectedHunk.start - 1, selectedHunk.newWords, "new-" + classPostfix);
        }
      }
      range = new Range(new Point(selectedHunk.end - 1, 0), new Point(selectedHunk.end - 1, 0));
      marker = this.editor.markBufferRange(range);
      this.editor.decorateMarker(marker, {
        type: 'block',
        position: 'after',
        item: this
      });
      this.markers.push(marker);
      this.diffEditor.setGrammar((_ref1 = this.getActiveTextEditor()) != null ? _ref1.getGrammar() : void 0);
      this.diffEditor.setText(selectedHunk.oldString.replace(/[\r\n]+$/g, ""));
      this.decorateLines(this.diffEditor, 0, selectedHunk.oldLines.length, "old-" + classPostfix);
      if (atom.config.get('git-diff-details.showWordDiffs')) {
        return this.decorateWords(this.diffEditor, 0, selectedHunk.oldWords, "old-" + classPostfix);
      }
    };

    AtomGitDiffDetailsView.prototype.updateDiffDetailsDisplay = function() {
      var isDifferent, selectedHunk, _ref1;
      if (this.showDiffDetails) {
        _ref1 = this.diffDetailsDataManager.getSelectedHunk(this.currentRow), selectedHunk = _ref1.selectedHunk, isDifferent = _ref1.isDifferent;
        if (selectedHunk != null) {
          if (!isDifferent) {
            return;
          }
          this.display(selectedHunk);
          return;
        } else {
          if (!atom.config.get('git-diff-details.keepViewToggled')) {
            this.closeDiffDetails();
          }
        }
        this.previousSelectedHunk = selectedHunk;
      }
      this.destroyDecoration();
    };

    return AtomGitDiffDetailsView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtZGlmZi1kZXRhaWxzL2xpYi9naXQtZGlmZi1kZXRhaWxzLXZpZXcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHlGQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUMsT0FBUSxPQUFBLENBQVEsc0JBQVIsRUFBUixJQUFELENBQUE7O0FBQUEsRUFDQSxPQUFpQixPQUFBLENBQVEsTUFBUixDQUFqQixFQUFDLGFBQUEsS0FBRCxFQUFRLGFBQUEsS0FEUixDQUFBOztBQUFBLEVBRUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUZKLENBQUE7O0FBQUEsRUFHQSxzQkFBQSxHQUF5QixPQUFBLENBQVEsZ0JBQVIsQ0FIekIsQ0FBQTs7QUFBQSxFQUlBLFlBQUEsR0FBZSxPQUFBLENBQVEsZ0JBQVIsQ0FKZixDQUFBOztBQUFBLEVBTUEsTUFBTSxDQUFDLE9BQVAsR0FBdUI7QUFDckIsNkNBQUEsQ0FBQTs7Ozs7S0FBQTs7QUFBQSxJQUFBLFlBQVksQ0FBQyxXQUFiLENBQXlCLHNCQUF6QixDQUFBLENBQUE7O0FBQUEsSUFFQSxzQkFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxPQUFBLEVBQU8sd0JBQVA7T0FBTCxFQUFzQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUNwQyxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsWUFBQSxPQUFBLEVBQU8sNkJBQVA7QUFBQSxZQUFzQyxNQUFBLEVBQVEsV0FBOUM7V0FBTCxFQUFnRSxTQUFBLEdBQUE7bUJBQzlELEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxjQUFBLE9BQUEsRUFBTyx3QkFBUDtBQUFBLGNBQWlDLE1BQUEs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

//# sourceURL=/home/takaaki/.atom/packages/git-diff-details/lib/git-diff-details-view.coffee
