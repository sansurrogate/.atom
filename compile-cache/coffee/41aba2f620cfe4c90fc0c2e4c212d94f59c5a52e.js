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
      this.initializeHousekeeping();
      this.preventFocusOut();
      this.diffDetailsDataManager = new DiffDetailsDataManager();
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
      var _ref1, _ref2;
      if ((_ref1 = this.oldLinesMarker) != null) {
        _ref1.destroy();
      }
      this.oldLinesMarker = null;
      if ((_ref2 = this.newLinesMarker) != null) {
        _ref2.destroy();
      }
      return this.newLinesMarker = null;
    };

    AtomGitDiffDetailsView.prototype.attach = function(selectedHunk) {
      var range;
      this.destroyDecoration();
      range = new Range(new Point(selectedHunk.end - 1, 0), new Point(selectedHunk.end - 1, 0));
      this.oldLinesMarker = this.editor.markBufferRange(range);
      this.editor.decorateMarker(this.oldLinesMarker, {
        type: 'block',
        position: 'after',
        item: this
      });
      if (selectedHunk.kind !== "d") {
        range = new Range(new Point(selectedHunk.start - 1, 0), new Point(selectedHunk.end, 0));
        this.newLinesMarker = this.editor.markBufferRange(range);
        return this.editor.decorateMarker(this.newLinesMarker, {
          type: 'line',
          "class": "git-diff-details-new"
        });
      }
    };

    AtomGitDiffDetailsView.prototype.populate = function(selectedHunk) {
      var html;
      html = _.escape(selectedHunk.oldString).split(/\r\n?|\n/g).map(function(line) {
        return line.replace(/\s/g, '&nbsp;');
      }).map(function(line) {
        return "<div class='line git-diff-details-old'>" + line + "</div>";
      });
      return this.contents.html(html);
    };

    AtomGitDiffDetailsView.prototype.updateDiffDetailsDisplay = function() {
      var isDifferent, selectedHunk, _ref1;
      if (this.showDiffDetails) {
        _ref1 = this.diffDetailsDataManager.getSelectedHunk(this.currentRow), selectedHunk = _ref1.selectedHunk, isDifferent = _ref1.isDifferent;
        if (selectedHunk != null) {
          if (!isDifferent) {
            return;
          }
          this.attach(selectedHunk);
          this.populate(selectedHunk);
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
