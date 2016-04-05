(function() {
  var MergeState, path;

  path = require('path');

  MergeState = (function() {
    function MergeState(conflicts, context, isRebase) {
      this.conflicts = conflicts;
      this.context = context;
      this.isRebase = isRebase;
    }

    MergeState.prototype.conflictPaths = function() {
      var c, _i, _len, _ref, _results;
      _ref = this.conflicts;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        c = _ref[_i];
        _results.push(c.path);
      }
      return _results;
    };

    MergeState.prototype.reread = function(callback) {
      return this.context.readConflicts().then((function(_this) {
        return function(conflicts) {
          _this.conflicts = conflicts;
          return callback(null, _this);
        };
      })(this))["catch"]((function(_this) {
        return function(err) {
          return callback(err, _this);
        };
      })(this));
    };

    MergeState.prototype.isEmpty = function() {
      return this.conflicts.length === 0;
    };

    MergeState.prototype.relativize = function(filePath) {
      return this.context.workingDirectory.relativize(filePath);
    };

    MergeState.prototype.join = function(relativePath) {
      return path.join(this.context.workingDirPath, relativePath);
    };

    MergeState.read = function(context, callback) {
      var isr;
      isr = context.isRebasing();
      return context.readConflicts().then(function(cs) {
        return callback(null, new MergeState(cs, context, isr));
      })["catch"](function(err) {
        return callback(err, null);
      });
    };

    return MergeState;

  })();

  module.exports = {
    MergeState: MergeState
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9tZXJnZS1jb25mbGljdHMvbGliL21lcmdlLXN0YXRlLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxnQkFBQTs7QUFBQSxFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUFQLENBQUE7O0FBQUEsRUFFTTtBQUVTLElBQUEsb0JBQUUsU0FBRixFQUFjLE9BQWQsRUFBd0IsUUFBeEIsR0FBQTtBQUFtQyxNQUFsQyxJQUFDLENBQUEsWUFBQSxTQUFpQyxDQUFBO0FBQUEsTUFBdEIsSUFBQyxDQUFBLFVBQUEsT0FBcUIsQ0FBQTtBQUFBLE1BQVosSUFBQyxDQUFBLFdBQUEsUUFBVyxDQUFuQztJQUFBLENBQWI7O0FBQUEseUJBRUEsYUFBQSxHQUFlLFNBQUEsR0FBQTtBQUFHLFVBQUEsMkJBQUE7QUFBQTtBQUFBO1dBQUEsMkNBQUE7cUJBQUE7QUFBQSxzQkFBQSxDQUFDLENBQUMsS0FBRixDQUFBO0FBQUE7c0JBQUg7SUFBQSxDQUZmLENBQUE7O0FBQUEseUJBSUEsTUFBQSxHQUFRLFNBQUMsUUFBRCxHQUFBO2FBQ04sSUFBQyxDQUFBLE9BQU8sQ0FBQyxhQUFULENBQUEsQ0FDQSxDQUFDLElBREQsQ0FDTSxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBRSxTQUFGLEdBQUE7QUFDSixVQURLLEtBQUMsQ0FBQSxZQUFBLFNBQ04sQ0FBQTtpQkFBQSxRQUFBLENBQVMsSUFBVCxFQUFlLEtBQWYsRUFESTtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRE4sQ0FHQSxDQUFDLE9BQUQsQ0FIQSxDQUdPLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLEdBQUQsR0FBQTtpQkFDTCxRQUFBLENBQVMsR0FBVCxFQUFjLEtBQWQsRUFESztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBSFAsRUFETTtJQUFBLENBSlIsQ0FBQTs7QUFBQSx5QkFXQSxPQUFBLEdBQVMsU0FBQSxHQUFBO2FBQUcsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLEtBQXFCLEVBQXhCO0lBQUEsQ0FYVCxDQUFBOztBQUFBLHlCQWFBLFVBQUEsR0FBWSxTQUFDLFFBQUQsR0FBQTthQUFjLElBQUMsQ0FBQSxPQUFPLENBQUMsZ0JBQWdCLENBQUMsVUFBMUIsQ0FBcUMsUUFBckMsRUFBZDtJQUFBLENBYlosQ0FBQTs7QUFBQSx5QkFlQSxJQUFBLEdBQU0sU0FBQyxZQUFELEdBQUE7YUFBa0IsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFDLENBQUEsT0FBTyxDQUFDLGNBQW5CLEVBQW1DLFlBQW5DLEVBQWxCO0lBQUEsQ0FmTixDQUFBOztBQUFBLElBaUJBLFVBQUMsQ0FBQSxJQUFELEdBQU8sU0FBQyxPQUFELEVBQVUsUUFBVixHQUFBO0FBQ0wsVUFBQSxHQUFBO0FBQUEsTUFBQSxHQUFBLEdBQU0sT0FBTyxDQUFDLFVBQVIsQ0FBQSxDQUFOLENBQUE7YUFDQSxPQUFPLENBQUMsYUFBUixDQUFBLENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxFQUFELEdBQUE7ZUFDSixRQUFBLENBQVMsSUFBVCxFQUFtQixJQUFBLFVBQUEsQ0FBVyxFQUFYLEVBQWUsT0FBZixFQUF3QixHQUF4QixDQUFuQixFQURJO01BQUEsQ0FETixDQUdBLENBQUMsT0FBRCxDQUhBLENBR08sU0FBQyxHQUFELEdBQUE7ZUFDTCxRQUFBLENBQVMsR0FBVCxFQUFjLElBQWQsRUFESztNQUFBLENBSFAsRUFGSztJQUFBLENBakJQLENBQUE7O3NCQUFBOztNQUpGLENBQUE7O0FBQUEsRUE2QkEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsVUFBQSxFQUFZLFVBQVo7R0E5QkYsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/takaaki/.atom/packages/merge-conflicts/lib/merge-state.coffee
