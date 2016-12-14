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
        if (this.lineDiffDetails) {
          this.prepareWordDiffs(this.lineDiffDetails);
        }
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtZGlmZi1kZXRhaWxzL2xpYi9kYXRhLW1hbmFnZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDhCQUFBOztBQUFBLEVBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxNQUFSLENBQVQsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQXVCO0FBQ1IsSUFBQSxnQ0FBQSxHQUFBO0FBQ1gsTUFBQSxJQUFDLENBQUEsVUFBRCxDQUFBLENBQUEsQ0FEVztJQUFBLENBQWI7O0FBQUEscUNBR0EsV0FBQSxHQUFhLFNBQUMsSUFBRCxFQUFPLEdBQVAsR0FBQTthQUNYLENBQUEsSUFBSSxDQUFDLEtBQUwsSUFBYyxHQUFkLElBQWMsR0FBZCxJQUFxQixJQUFJLENBQUMsR0FBMUIsRUFEVztJQUFBLENBSGIsQ0FBQTs7QUFBQSxxQ0FNQSxlQUFBLEdBQWlCLFNBQUEsR0FBQTtBQUNmLE1BQUEsSUFBRyxtQ0FBQSxJQUEyQix5Q0FBM0IsSUFBNEQsMkJBQTVELElBQStFLGlDQUFsRjtBQUNFLGVBQU8sSUFBQyxDQUFBLFlBQVksQ0FBQyxLQUFkLEtBQXVCLElBQUMsQ0FBQSxvQkFBb0IsQ0FBQyxLQUFwRCxDQURGO09BQUE7QUFFQSxhQUFPLElBQVAsQ0FIZTtJQUFBLENBTmpCLENBQUE7O0FBQUEscUNBV0EsZUFBQSxHQUFpQixTQUFDLFVBQUQsR0FBQTtBQUNmLFVBQUEsV0FBQTtBQUFBLE1BQUEsSUFBSSwyQkFBRCxJQUFtQixJQUFDLENBQUEsdUJBQXBCLElBQStDLENBQUEsSUFBRSxDQUFBLFdBQUQsQ0FBYSxJQUFDLENBQUEsWUFBZCxFQUE0QixVQUE1QixDQUFuRDtBQUNFLFFBQUEsSUFBQyxDQUFBLHFCQUFELENBQUEsQ0FBQSxDQUFBO0FBQUEsUUFDQSxJQUFDLENBQUEsa0JBQUQsQ0FBb0IsVUFBcEIsQ0FEQSxDQURGO09BQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSx1QkFBRCxHQUEyQixLQUozQixDQUFBO0FBQUEsTUFNQSxXQUFBLEdBQWMsSUFBQyxDQUFBLGVBQUQsQ0FBQSxDQU5kLENBQUE7QUFBQSxNQVFBLElBQUMsQ0FBQSxvQkFBRCxHQUF3QixJQUFDLENBQUEsWUFSekIsQ0FBQTthQVVBO0FBQUEsUUFBQyxZQUFBLEVBQWMsSUFBQyxDQUFBLFlBQWhCO0FBQUEsUUFBOEIsYUFBQSxXQUE5QjtRQVhlO0lBQUEsQ0FYakIsQ0FBQTs7QUFBQSxxQ0F3QkEsa0JBQUEsR0FBb0IsU0FBQyxVQUFELEdBQUE7QUFDbEIsVUFBQSw4QkFBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsSUFBaEIsQ0FBQTtBQUVBLE1BQUEsSUFBRyw0QkFBSDtBQUNFO0FBQUE7YUFBQSwyQ0FBQTswQkFBQTtBQUNFLFVBQUEsSUFBRyxJQUFDLENBQUEsV0FBRCxDQUFhLElBQWIsRUFBbUIsVUFBbkIsQ0FBSDtBQUNFLFlBQUEsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsSUFBaEIsQ0FBQTtBQUNBLGtCQUZGO1dBQUEsTUFBQTtrQ0FBQTtXQURGO0FBQUE7d0JBREY7T0FIa0I7SUFBQSxDQXhCcEIsQ0FBQTs7QUFBQSxxQ0FpQ0EscUJBQUEsR0FBdUIsU0FBQSxHQUFBO0FBQ3JCLE1BQUEsSUFBSSw4QkFBRCxJQUFzQixJQUFDLENBQUEsMEJBQTFCO0FBQ0UsUUFBQSxJQUFDLENBQUEsc0JBQUQsQ0FBd0IsSUFBQyxDQUFBLElBQXpCLEVBQStCLElBQUMsQ0FBQSxJQUFoQyxFQUFzQyxJQUFDLENBQUEsSUFBdkMsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxJQUF1QyxJQUFDLENBQUEsZUFBeEM7QUFBQSxVQUFBLElBQUMsQ0FBQSxnQkFBRCxDQUFrQixJQUFDLENBQUEsZUFBbkIsQ0FBQSxDQUFBO1NBRkY7T0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLDBCQUFELEdBQThCLEtBSjlCLENBQUE7YUFLQSxJQUFDLENBQUEsZ0JBTm9CO0lBQUEsQ0FqQ3ZCLENBQUE7O0FBQUEscUNBeUNBLHNCQUFBLEdBQXdCLFNBQUMsSUFBRCxFQUFPLElBQVAsRUFBYSxJQUFiLEdBQUE7QUFDdEIsVUFBQSxxSkFBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLGVBQUQsR0FBbUIsSUFBbkIsQ0FBQTtBQUFBLE1BRUEsSUFBQSxHQUFPLElBQUksQ0FBQyxPQUFMLENBQWEsSUFBYixDQUZQLENBQUE7QUFBQSxNQUlBLE9BQUEsR0FBVTtBQUFBLFFBQUEsbUJBQUEsRUFBcUIsT0FBTyxDQUFDLFFBQVIsS0FBb0IsT0FBekM7T0FKVixDQUFBO0FBQUEsTUFNQSxrQkFBQSxHQUFxQixJQUFJLENBQUMsa0JBQUwsQ0FBd0IsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsSUFBaEIsQ0FBeEIsRUFBK0MsSUFBL0MsRUFBcUQsT0FBckQsQ0FOckIsQ0FBQTtBQVFBLE1BQUEsSUFBYywwQkFBZDtBQUFBLGNBQUEsQ0FBQTtPQVJBO0FBQUEsTUFVQSxJQUFDLENBQUEsZUFBRCxHQUFtQixFQVZuQixDQUFBO0FBQUEsTUFXQSxJQUFBLEdBQU8sSUFYUCxDQUFBO0FBYUE7V0FBQSx5REFBQSxHQUFBO0FBRUUsdUNBRkcsZ0JBQUEsVUFBVSxnQkFBQSxVQUFVLGdCQUFBLFVBQVUsZ0JBQUEsVUFBVSxxQkFBQSxlQUFlLHFCQUFBLGVBQWUsWUFBQSxJQUV6RSxDQUFBO0FBQUEsUUFBQSxJQUFBLENBQUEsQ0FBTyxRQUFBLEtBQVksQ0FBWixJQUFrQixRQUFBLEdBQVcsQ0FBcEMsQ0FBQTtBQUdFLFVBQUEsSUFBTyxjQUFKLElBQWEsQ0FBQyxRQUFBLEtBQWMsSUFBSSxDQUFDLEtBQXBCLENBQWhCO0FBQ0UsWUFBQSxNQUFBLEdBQVMsSUFBVCxDQUFBO0FBQUEsWUFDQSxJQUFBLEdBQU8sSUFEUCxDQUFBO0FBRUEsWUFBQSxJQUFHLFFBQUEsS0FBWSxDQUFaLElBQWtCLFFBQUEsR0FBVyxDQUFoQztBQUNFLGNBQUEsTUFBQSxHQUFTLFFBQVQsQ0FBQTtBQUFBLGNBQ0EsSUFBQSxHQUFPLEdBRFAsQ0FERjthQUFBLE1BQUE7QUFJRSxjQUFBLE1BQUEsR0FBUyxRQUFBLEdBQVcsUUFBWCxHQUFzQixDQUEvQixDQUFBO0FBQUEsY0FDQSxJQUFBLEdBQU8sR0FEUCxDQUpGO2FBRkE7QUFBQSxZQVNBLElBQUEsR0FBTztBQUFBLGNBQ0wsS0FBQSxFQUFPLFFBREY7QUFBQSxjQUNZLEdBQUEsRUFBSyxNQURqQjtBQUFBLGNBRUwsUUFBQSxFQUFVLEVBRkw7QUFBQSxjQUVTLFFBQUEsRUFBVSxFQUZuQjtBQUFBLGNBR0wsU0FBQSxFQUFXLEVBSE47QUFBQSxjQUdVLFNBQUEsRUFBVyxFQUhyQjtBQUFBLGNBSUwsTUFBQSxJQUpLO2FBVFAsQ0FBQTtBQUFBLFlBZUEsSUFBQyxDQUFBLGVBQWUsQ0FBQyxJQUFqQixDQUFzQixJQUF0QixDQWZBLENBREY7V0FBQTtBQWtCQSxVQUFBLElBQUcsYUFBQSxJQUFpQixDQUFwQjtBQUNFLFlBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFkLENBQW1CLElBQW5CLENBQUEsQ0FBQTtBQUFBLDBCQUNBLElBQUksQ0FBQyxTQUFMLElBQWtCLEtBRGxCLENBREY7V0FBQSxNQUFBO0FBSUUsWUFBQSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQWQsQ0FBbUIsSUFBbkIsQ0FBQSxDQUFBO0FBQUEsMEJBQ0EsSUFBSSxDQUFDLFNBQUwsSUFBa0IsS0FEbEIsQ0FKRjtXQXJCRjtTQUFBLE1BQUE7Z0NBQUE7U0FGRjtBQUFBO3NCQWRzQjtJQUFBLENBekN4QixDQUFBOztBQUFBLHFDQXFGQSxnQkFBQSxHQUFrQixTQUFDLGVBQUQsR0FBQTtBQUNoQixVQUFBLHVEQUFBO0FBQUE7V0FBQSxzREFBQTttQ0FBQTtBQUNFLFFBQUEsSUFBWSxJQUFJLENBQUMsSUFBTCxLQUFlLEdBQWYsSUFBc0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFkLEtBQXdCLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBeEU7QUFBQSxtQkFBQTtTQUFBO0FBQUEsUUFDQSxJQUFJLENBQUMsUUFBTCxHQUFnQixFQURoQixDQUFBO0FBQUEsUUFFQSxJQUFJLENBQUMsUUFBTCxHQUFnQixFQUZoQixDQUFBO0FBQUE7O0FBR0E7ZUFBUywrREFBVCxHQUFBO0FBQ0UsWUFBQSxNQUFBLEdBQVMsTUFBQSxHQUFTLENBQWxCLENBQUE7QUFBQSxZQUNBLElBQUEsR0FBTyxNQUFNLENBQUMsa0JBQVAsQ0FBMEIsSUFBSSxDQUFDLFFBQVMsQ0FBQSxDQUFBLENBQXhDLEVBQTRDLElBQUksQ0FBQyxRQUFTLENBQUEsQ0FBQSxDQUExRCxDQURQLENBQUE7QUFBQTs7QUFFQTttQkFBQSw2Q0FBQTtnQ0FBQTtBQUNFLGdCQUFBLElBQUksQ0FBQyxTQUFMLEdBQWlCLENBQWpCLENBQUE7QUFDQSxnQkFBQSxJQUFHLElBQUksQ0FBQyxLQUFSO0FBQ0Usa0JBQUEsSUFBSSxDQUFDLE9BQUwsR0FBZSxJQUFmLENBQUE7QUFBQSxrQkFDQSxJQUFJLENBQUMsUUFBTCxHQUFnQixNQURoQixDQUFBO0FBQUEsa0JBRUEsTUFBQSxJQUFVLElBQUksQ0FBQyxLQUFLLENBQUMsTUFGckIsQ0FBQTtBQUFBLGtCQUdBLElBQUksQ0FBQyxNQUFMLEdBQWMsTUFIZCxDQUFBO0FBQUEsaUNBSUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFkLENBQW1CLElBQW5CLEVBSkEsQ0FERjtpQkFBQSxNQU1LLElBQUcsSUFBSSxDQUFDLE9BQVI7QUFDSCxrQkFBQSxJQUFJLENBQUMsT0FBTCxHQUFlLElBQWYsQ0FBQTtBQUFBLGtCQUNBLElBQUksQ0FBQyxRQUFMLEdBQWdCLE1BRGhCLENBQUE7QUFBQSxrQkFFQSxNQUFBLElBQVUsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUZyQixDQUFBO0FBQUEsa0JBR0EsSUFBSSxDQUFDLE1BQUwsR0FBYyxNQUhkLENBQUE7QUFBQSxpQ0FJQSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQWQsQ0FBbUIsSUFBbkIsRUFKQSxDQURHO2lCQUFBLE1BQUE7QUFPSCxrQkFBQSxNQUFBLElBQVUsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFyQixDQUFBO0FBQUEsa0JBQ0EsTUFBQSxJQUFVLElBQUksQ0FBQyxLQUFLLENBQUMsTUFEckIsQ0FBQTtBQUFBLGtCQUVBLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBZCxDQUFtQixJQUFuQixDQUZBLENBQUE7QUFBQSxpQ0FHQSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQWQsQ0FBbUIsSUFBbkIsRUFIQSxDQVBHO2lCQVJQO0FBQUE7O2lCQUZBLENBREY7QUFBQTs7YUFIQSxDQURGO0FBQUE7c0JBRGdCO0lBQUEsQ0FyRmxCLENBQUE7O0FBQUEscUNBaUhBLFVBQUEsR0FBWSxTQUFFLElBQUYsRUFBUyxJQUFULEVBQWdCLElBQWhCLEdBQUE7QUFDVixNQURXLElBQUMsQ0FBQSxPQUFBLElBQ1osQ0FBQTtBQUFBLE1BRGtCLElBQUMsQ0FBQSxPQUFBLElBQ25CLENBQUE7QUFBQSxNQUR5QixJQUFDLENBQUEsT0FBQSxJQUMxQixDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsdUJBQUQsR0FBMkIsSUFBM0IsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLDBCQUFELEdBQThCLElBRDlCLENBQUE7YUFFQSxJQUFDLENBQUEsOEJBQUQsQ0FBQSxFQUhVO0lBQUEsQ0FqSFosQ0FBQTs7QUFBQSxxQ0FzSEEsOEJBQUEsR0FBZ0MsU0FBQSxHQUFBO2FBQzlCLElBQUMsQ0FBQSxvQkFBRCxHQUF3QixLQURNO0lBQUEsQ0F0SGhDLENBQUE7O2tDQUFBOztNQUhGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/takaaki/.atom/packages/git-diff-details/lib/data-manager.coffee
