(function() {
  var AtomGitDiffDetailsView, DiffDetailsDataManager, Housekeeping, Point, Range, View, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom-space-pen-views').View;

  _ref = require('atom'), Range = _ref.Range, Point = _ref.Point;

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
          buffer.deleteRows(selectedHunk.start - 1, selectedHunk.end - 1);
          buffer.insert([selectedHunk.start - 1, 0], selectedHunk.oldString);
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
      html = selectedHunk.oldString.split(/\r\n?|\n/g).map(function(line) {
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtZGlmZi1kZXRhaWxzL2xpYi9naXQtZGlmZi1kZXRhaWxzLXZpZXcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHNGQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUMsT0FBUSxPQUFBLENBQVEsc0JBQVIsRUFBUixJQUFELENBQUE7O0FBQUEsRUFDQSxPQUFpQixPQUFBLENBQVEsTUFBUixDQUFqQixFQUFDLGFBQUEsS0FBRCxFQUFRLGFBQUEsS0FEUixDQUFBOztBQUFBLEVBRUEsc0JBQUEsR0FBeUIsT0FBQSxDQUFRLGdCQUFSLENBRnpCLENBQUE7O0FBQUEsRUFHQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGdCQUFSLENBSGYsQ0FBQTs7QUFBQSxFQUtBLE1BQU0sQ0FBQyxPQUFQLEdBQXVCO0FBQ3JCLDZDQUFBLENBQUE7Ozs7O0tBQUE7O0FBQUEsSUFBQSxZQUFZLENBQUMsV0FBYixDQUF5QixzQkFBekIsQ0FBQSxDQUFBOztBQUFBLElBRUEsc0JBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsT0FBQSxFQUFPLHdCQUFQO09BQUwsRUFBc0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFDcEMsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsT0FBQSxFQUFPLDZCQUFQO0FBQUEsWUFBc0MsTUFBQSxFQUFRLFdBQTlDO1dBQUwsRUFBZ0UsU0FBQSxHQUFBO21CQUM5RCxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsY0FBQSxPQUFBLEVBQU8sd0JBQVA7QUFBQSxjQUFpQyxNQUFBLEVBQVEsVUFBekM7YUFBTCxFQUQ4RDtVQUFBLENBQWhFLEVBRG9DO1FBQUEsRUFB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

//# sourceURL=/home/takaaki/.atom/packages/git-diff-details/lib/git-diff-details-view.coffee
