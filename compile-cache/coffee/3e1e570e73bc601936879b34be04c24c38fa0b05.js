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

    MergeState.prototype.reread = function() {
      return this.context.readConflicts().then((function(_this) {
        return function(conflicts) {
          _this.conflicts = conflicts;
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

    MergeState.read = function(context) {
      var isr;
      isr = context.isRebasing();
      return context.readConflicts().then(function(cs) {
        return new MergeState(cs, context, isr);
      });
    };

    return MergeState;

  })();

  module.exports = {
    MergeState: MergeState
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9tZXJnZS1jb25mbGljdHMvbGliL21lcmdlLXN0YXRlLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxVQUFBOztBQUFBLEVBQU07QUFFUyxJQUFBLG9CQUFFLFNBQUYsRUFBYyxPQUFkLEVBQXdCLFFBQXhCLEdBQUE7QUFBbUMsTUFBbEMsSUFBQyxDQUFBLFlBQUEsU0FBaUMsQ0FBQTtBQUFBLE1BQXRCLElBQUMsQ0FBQSxVQUFBLE9BQXFCLENBQUE7QUFBQSxNQUFaLElBQUMsQ0FBQSxXQUFBLFFBQVcsQ0FBbkM7SUFBQSxDQUFiOztBQUFBLHlCQUVBLGFBQUEsR0FBZSxTQUFBLEdBQUE7QUFBRyxVQUFBLDJCQUFBO0FBQUE7QUFBQTtXQUFBLDJDQUFBO3FCQUFBO0FBQUEsc0JBQUEsQ0FBQyxDQUFDLEtBQUYsQ0FBQTtBQUFBO3NCQUFIO0lBQUEsQ0FGZixDQUFBOztBQUFBLHlCQUlBLE1BQUEsR0FBUSxTQUFBLEdBQUE7YUFDTixJQUFDLENBQUEsT0FBTyxDQUFDLGFBQVQsQ0FBQSxDQUF3QixDQUFDLElBQXpCLENBQThCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFFLFNBQUYsR0FBQTtBQUFjLFVBQWIsS0FBQyxDQUFBLFlBQUEsU0FBWSxDQUFkO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBOUIsRUFETTtJQUFBLENBSlIsQ0FBQTs7QUFBQSx5QkFPQSxPQUFBLEdBQVMsU0FBQSxHQUFBO2FBQUcsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLEtBQXFCLEVBQXhCO0lBQUEsQ0FQVCxDQUFBOztBQUFBLHlCQVNBLFVBQUEsR0FBWSxTQUFDLFFBQUQsR0FBQTthQUFjLElBQUMsQ0FBQSxPQUFPLENBQUMsZ0JBQWdCLENBQUMsVUFBMUIsQ0FBcUMsUUFBckMsRUFBZDtJQUFBLENBVFosQ0FBQTs7QUFBQSx5QkFXQSxJQUFBLEdBQU0sU0FBQyxZQUFELEdBQUE7YUFBa0IsSUFBQyxDQUFBLE9BQU8sQ0FBQyxRQUFULENBQWtCLFlBQWxCLEVBQWxCO0lBQUEsQ0FYTixDQUFBOztBQUFBLElBYUEsVUFBQyxDQUFBLElBQUQsR0FBTyxTQUFDLE9BQUQsR0FBQTtBQUNMLFVBQUEsR0FBQTtBQUFBLE1BQUEsR0FBQSxHQUFNLE9BQU8sQ0FBQyxVQUFSLENBQUEsQ0FBTixDQUFBO2FBQ0EsT0FBTyxDQUFDLGFBQVIsQ0FBQSxDQUF1QixDQUFDLElBQXhCLENBQTZCLFNBQUMsRUFBRCxHQUFBO2VBQ3ZCLElBQUEsVUFBQSxDQUFXLEVBQVgsRUFBZSxPQUFmLEVBQXdCLEdBQXhCLEVBRHVCO01BQUEsQ0FBN0IsRUFGSztJQUFBLENBYlAsQ0FBQTs7c0JBQUE7O01BRkYsQ0FBQTs7QUFBQSxFQW9CQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxVQUFBLEVBQVksVUFBWjtHQXJCRixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/takaaki/.atom/packages/merge-conflicts/lib/merge-state.coffee
