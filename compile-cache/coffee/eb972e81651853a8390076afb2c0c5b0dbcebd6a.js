(function() {
  var DiffDetailsDataManager;

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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtZGlmZi1kZXRhaWxzL2xpYi9kYXRhLW1hbmFnZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHNCQUFBOztBQUFBLEVBQUEsTUFBTSxDQUFDLE9BQVAsR0FBdUI7QUFDUixJQUFBLGdDQUFBLEdBQUE7QUFDWCxNQUFBLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FBQSxDQURXO0lBQUEsQ0FBYjs7QUFBQSxxQ0FHQSxXQUFBLEdBQWEsU0FBQyxJQUFELEVBQU8sR0FBUCxHQUFBO2FBQ1gsQ0FBQSxJQUFJLENBQUMsS0FBTCxJQUFjLEdBQWQsSUFBYyxHQUFkLElBQXFCLElBQUksQ0FBQyxHQUExQixFQURXO0lBQUEsQ0FIYixDQUFBOztBQUFBLHFDQU1BLGVBQUEsR0FBaUIsU0FBQSxHQUFBO0FBQ2YsTUFBQSxJQUFHLG1DQUFBLElBQTJCLHlDQUEzQixJQUE0RCwyQkFBNUQsSUFBK0UsaUNBQWxGO0FBQ0UsZUFBTyxJQUFDLENBQUEsWUFBWSxDQUFDLEtBQWQsS0FBdUIsSUFBQyxDQUFBLG9CQUFvQixDQUFDLEtBQXBELENBREY7T0FBQTtBQUVBLGFBQU8sSUFBUCxDQUhlO0lBQUEsQ0FOakIsQ0FBQTs7QUFBQSxxQ0FXQSxlQUFBLEdBQWlCLFNBQUMsVUFBRCxHQUFBO0FBQ2YsVUFBQSxXQUFBO0FBQUEsTUFBQSxJQUFJLDJCQUFELElBQW1CLElBQUMsQ0FBQSx1QkFBcEIsSUFBK0MsQ0FBQSxJQUFFLENBQUEsV0FBRCxDQUFhLElBQUMsQ0FBQSxZQUFkLEVBQTRCLFVBQTVCLENBQW5EO0FBQ0UsUUFBQSxJQUFDLENBQUEscUJBQUQsQ0FBQSxDQUFBLENBQUE7QUFBQSxRQUNBLElBQUMsQ0FBQSxrQkFBRCxDQUFvQixVQUFwQixDQURBLENBREY7T0FBQTtB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

//# sourceURL=/home/takaaki/.atom/packages/git-diff-details/lib/data-manager.coffee
