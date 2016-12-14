(function() {
  var MergeState;

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
      return this.context.joinPath(relativePath);
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9tZXJnZS1jb25mbGljdHMvbGliL21lcmdlLXN0YXRlLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxVQUFBOztBQUFBLEVBQU07QUFFUyxJQUFBLG9CQUFFLFNBQUYsRUFBYyxPQUFkLEVBQXdCLFFBQXhCLEdBQUE7QUFBbUMsTUFBbEMsSUFBQyxDQUFBLFlBQUEsU0FBaUMsQ0FBQTtBQUFBLE1BQXRCLElBQUMsQ0FBQSxVQUFBLE9BQXFCLENBQUE7QUFBQSxNQUFaLElBQUMsQ0FBQSxXQUFBLFFBQVcsQ0FBbkM7SUFBQSxDQUFiOztBQUFBLHlCQUVBLGFBQUEsR0FBZSxTQUFBLEdBQUE7QUFBRyxVQUFBLDJCQUFBO0FBQUE7QUFBQTtXQUFBLDJDQUFBO3FCQUFBO0FBQUEsc0JBQUEsQ0FBQyxDQUFDLEtBQUYsQ0FBQTtBQUFBO3NCQUFIO0lBQUEsQ0FGZixDQUFBOztBQUFBLHlCQUlBLE1BQUEsR0FBUSxTQUFDLFFBQUQsR0FBQTthQUNOLElBQUMsQ0FBQSxPQUFPLENBQUMsYUFBVCxDQUFBLENBQ0EsQ0FBQyxJQURELENBQ00sQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUUsU0FBRixHQUFBO0FBQ0osVUFESyxLQUFDLENBQUEsWUFBQSxTQUNOLENBQUE7aUJBQUEsUUFBQSxDQUFTLElBQVQsRUFBZSxLQUFmLEVBREk7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUROLENBR0EsQ0FBQyxPQUFELENBSEEsQ0FHTyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxHQUFELEdBQUE7aUJBQ0wsUUFBQSxDQUFTLEdBQVQsRUFBYyxLQUFkLEVBREs7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUhQLEVBRE07SUFBQSxDQUpSLENBQUE7O0FBQUEseUJBV0EsT0FBQSxHQUFTLFNBQUEsR0FBQTthQUFHLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBWCxLQUFxQixFQUF4QjtJQUFBLENBWFQsQ0FBQTs7QUFBQSx5QkFhQSxVQUFBLEdBQVksU0FBQyxRQUFELEdBQUE7YUFBYyxJQUFDLENBQUEsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFVBQTFCLENBQXFDLFFBQXJDLEVBQWQ7SUFBQSxDQWJaLENBQUE7O0FBQUEseUJBZUEsSUFBQSxHQUFNLFNBQUMsWUFBRCxHQUFBO2FBQWtCLElBQUMsQ0FBQSxPQUFPLENBQUMsUUFBVCxDQUFrQixZQUFsQixFQUFsQjtJQUFBLENBZk4sQ0FBQTs7QUFBQSxJQWlCQSxVQUFDLENBQUEsSUFBRCxHQUFPLFNBQUMsT0FBRCxFQUFVLFFBQVYsR0FBQTtBQUNMLFVBQUEsR0FBQTtBQUFBLE1BQUEsR0FBQSxHQUFNLE9BQU8sQ0FBQyxVQUFSLENBQUEsQ0FBTixDQUFBO2FBQ0EsT0FBTyxDQUFDLGFBQVIsQ0FBQSxDQUNBLENBQUMsSUFERCxDQUNNLFNBQUMsRUFBRCxHQUFBO2VBQ0osUUFBQSxDQUFTLElBQVQsRUFBbUIsSUFBQSxVQUFBLENBQVcsRUFBWCxFQUFlLE9BQWYsRUFBd0IsR0FBeEIsQ0FBbkIsRUFESTtNQUFBLENBRE4sQ0FHQSxDQUFDLE9BQUQsQ0FIQSxDQUdPLFNBQUMsR0FBRCxHQUFBO2VBQ0wsUUFBQSxDQUFTLEdBQVQsRUFBYyxJQUFkLEVBREs7TUFBQSxDQUhQLEVBRks7SUFBQSxDQWpCUCxDQUFBOztzQkFBQTs7TUFGRixDQUFBOztBQUFBLEVBMkJBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLFVBQUEsRUFBWSxVQUFaO0dBNUJGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/takaaki/.atom/packages/merge-conflicts/lib/merge-state.coffee
