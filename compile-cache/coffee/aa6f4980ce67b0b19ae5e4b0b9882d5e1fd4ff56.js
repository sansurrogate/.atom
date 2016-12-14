(function() {
  var DiffDetailsDataManager, JsDiff;

  JsDiff = require('diff');

  module.exports = DiffDetailsDataManager = (function() {
    function DiffDetailsDataManager() {
      this.invalidate();
    }

    DiffDetailsDataManager.prototype.liesBetween = function(hunk, row) {
      return (hunk.start <= row && row <= hunk.end);
    };

    DiffDetailsDataManager.prototype.isDifferentHunk = function() {
      if ((this.previousSelectedHunk != null) && (this.previousSelectedHunk.start != null) && (this.selectedHunk != null) && (this.selectedHunk.start != null)) {
        return this.selectedHunk.start !== this.previousSelectedHunk.start;
      }
      return true;
    };

    DiffDetailsDataManager.prototype.getSelectedHunk = function(currentRow) {
      var isDifferent;
      if ((this.selectedHunk == null) || this.selectedHunkInvalidated || !this.liesBetween(this.selectedHunk, currentRow)) {
        this.updateLineDiffDetails();
        this.updateSelectedHunk(currentRow);
      }
      this.selectedHunkInvalidated = false;
      isDifferent = this.isDifferentHunk();
      this.previousSelectedHunk = this.selectedHunk;
      return {
        selectedHunk: this.selectedHunk,
        isDifferent: isDifferent
      };
    };

    DiffDetailsDataManager.prototype.updateSelectedHunk = function(currentRow) {
      var hunk, _i, _len, _ref, _results;
      this.selectedHunk = null;
      if (this.lineDiffDetails != null) {
        _ref = this.lineDiffDetails;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          hunk = _ref[_i];
          if (this.liesBetween(hunk, currentRow)) {
            this.selectedHunk = hunk;
            break;
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    };

    DiffDetailsDataManager.prototype.updateLineDiffDetails = function() {
      if ((this.lineDiffDetails == null) || this.lineDiffDetailsInvalidated) {
        this.prepareLineDiffDetails(this.repo, this.path, this.text);
        this.prepareWordDiffs(this.lineDiffDetails);
      }
      this.lineDiffDetailsInvalidated = false;
      return this.lineDiffDetails;
    };

    DiffDetailsDataManager.prototype.prepareLineDiffDetails = function(repo, path, text) {
      var hunk, kind, line, newEnd, newLineNumber, newLines, newStart, oldLineNumber, oldLines, oldStart, options, rawLineDiffDetails, _i, _len, _ref, _results;
      this.lineDiffDetails = null;
      repo = repo.getRepo(path);
      options = {
        ignoreEolWhitespace: process.platform === 'win32'
      };
      rawLineDiffDetails = repo.getLineDiffDetails(repo.relativize(path), text, options);
      if (rawLineDiffDetails == null) {
        return;
      }
      this.lineDiffDetails = [];
      hunk = null;
      _results = [];
      for (_i = 0, _len = rawLineDiffDetails.length; _i < _len; _i++) {
        _ref = rawLineDiffDetails[_i], oldStart = _ref.oldStart, newStart = _ref.newStart, oldLines = _ref.oldLines, newLines = _ref.newLines, oldLineNumber = _ref.oldLineNumber, newLineNumber = _ref.newLineNumber, line = _ref.line;
        if (!(oldLines === 0 && newLines > 0)) {
          if ((hunk == null) || (newStart !== hunk.start)) {
            newEnd = null;
            kind = null;
            if (newLines === 0 && oldLines > 0) {
              newEnd = newStart;
              kind = "d";
            } else {
              newEnd = newStart + newLines - 1;
              kind = "m";
            }
            hunk = {
              start: newStart,
              end: newEnd,
              oldLines: [],
              newLines: [],
              newString: "",
              oldString: "",
              kind: kind
            };
            this.lineDiffDetails.push(hunk);
          }
          if (newLineNumber >= 0) {
            hunk.newLines.push(line);
            _results.push(hunk.newString += line);
          } else {
            hunk.oldLines.push(line);
            _results.push(hunk.oldString += line);
          }
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    DiffDetailsDataManager.prototype.prepareWordDiffs = function(lineDiffDetails) {
      var diff, hunk, i, newCol, oldCol, word, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = lineDiffDetails.length; _i < _len; _i++) {
        hunk = lineDiffDetails[_i];
        if (hunk.kind !== "m" || hunk.newLines.length !== hunk.oldLines.length) {
          continue;
        }
        hunk.newWords = [];
        hunk.oldWords = [];
        _results.push((function() {
          var _j, _ref, _results1;
          _results1 = [];
          for (i = _j = 0, _ref = hunk.newLines.length; _j < _ref; i = _j += 1) {
            newCol = oldCol = 0;
            diff = JsDiff.diffWordsWithSpace(hunk.oldLines[i], hunk.newLines[i]);
            _results1.push((function() {
              var _k, _len1, _results2;
              _results2 = [];
              for (_k = 0, _len1 = diff.length; _k < _len1; _k++) {
                word = diff[_k];
                word.offsetRow = i;
                if (word.added) {
                  word.changed = true;
                  word.startCol = newCol;
                  newCol += word.value.length;
                  word.endCol = newCol;
                  _results2.push(hunk.newWords.push(word));
                } else if (word.removed) {
                  word.changed = true;
                  word.startCol = oldCol;
                  oldCol += word.value.length;
                  word.endCol = oldCol;
                  _results2.push(hunk.oldWords.push(word));
                } else {
                  newCol += word.value.length;
                  oldCol += word.value.length;
                  hunk.newWords.push(word);
                  _results2.push(hunk.oldWords.push(word));
                }
              }
              return _results2;
            })());
          }
          return _results1;
        })());
      }
      return _results;
    };

    DiffDetailsDataManager.prototype.invalidate = function(repo, path, text) {
      this.repo = repo;
      this.path = path;
      this.text = text;
      this.selectedHunkInvalidated = true;
      this.lineDiffDetailsInvalidated = true;
      return this.invalidatePreviousSelectedHunk();
    };

    DiffDetailsDataManager.prototype.invalidatePreviousSelectedHunk = function() {
      return this.previousSelectedHunk = null;
    };

    return DiffDetailsDataManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtZGlmZi1kZXRhaWxzL2xpYi9kYXRhLW1hbmFnZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDhCQUFBOztBQUFBLEVBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxNQUFSLENBQVQsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQXVCO0FBQ1IsSUFBQSxnQ0FBQSxHQUFBO0FBQ1gsTUFBQSxJQUFDLENBQUEsVUFBRCxDQUFBLENBQUEsQ0FEVztJQUFBLENBQWI7O0FBQUEscUNBR0EsV0FBQSxHQUFhLFNBQUMsSUFBRCxFQUFPLEdBQVAsR0FBQTthQUNYLENBQUEsSUFBSSxDQUFDLEtBQUwsSUFBYyxHQUFkLElBQWMsR0FBZCxJQUFxQixJQUFJLENBQUMsR0FBMUIsRUFEVztJQUFBLENBSGIsQ0FBQTs7QUFBQSxxQ0FNQSxlQUFBLEdBQWlCLFNBQUEsR0FBQTtBQUNmLE1BQUEsSUFBRyxtQ0FBQSxJQUEyQix5Q0FBM0IsSUFBNEQsMkJBQTVELElBQStFLGlDQUFsRjtBQUNFLGVBQU8sSUFBQyxDQUFBLFlBQVksQ0FBQyxLQUFkLEtBQXVCLElBQUMsQ0FBQSxvQkFBb0IsQ0FBQyxLQUFwRCxDQURGO09BQUE7QUFFQSxhQUFPLElBQVAsQ0FIZTtJQUFBLENBTmpCLENBQUE7O0FBQUEscUNBV0EsZUFBQSxHQUFpQixTQUFDLFVBQUQsR0FBQTtBQUNmLFVBQUEsV0FBQTtBQUFBLE1BQUEsSUFBSSwyQkFBRCxJQUFtQixJQUFDLENBQUEsdUJBQXBCLElBQStDLENBQUEsSUFBRSxDQUFBLFdBQUQsQ0FBYSxJQUFDLENBQUEsWUFBZCxFQUE0QixVQUE1QixDQUFuRDtBQUNFLFFBQUEsSUFBQyxDQUFBLHFCQUFELENBQUEsQ0FBQSxDQUFBO0FBQUEsUUFD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

//# sourceURL=/home/takaaki/.atom/packages/git-diff-details/lib/data-manager.coffee
