(function() {
  var CompositeDisposable, MinimapGitDiffBinding, repositoryForPath,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  CompositeDisposable = require('atom').CompositeDisposable;

  repositoryForPath = require('./helpers').repositoryForPath;

  module.exports = MinimapGitDiffBinding = (function() {
    MinimapGitDiffBinding.prototype.active = false;

    function MinimapGitDiffBinding(minimap) {
      var repository;
      this.minimap = minimap;
      this.destroy = __bind(this.destroy, this);
      this.updateDiffs = __bind(this.updateDiffs, this);
      this.decorations = {};
      this.markers = null;
      this.subscriptions = new CompositeDisposable;
      if (this.minimap == null) {
        return console.warn('minimap-git-diff binding created without a minimap');
      }
      this.editor = this.minimap.getTextEditor();
      this.subscriptions.add(this.minimap.onDidDestroy(this.destroy));
      if (repository = this.getRepo()) {
        this.subscriptions.add(this.editor.getBuffer().onDidStopChanging(this.updateDiffs));
        this.subscriptions.add(repository.onDidChangeStatuses((function(_this) {
          return function() {
            return _this.scheduleUpdate();
          };
        })(this)));
        this.subscriptions.add(repository.onDidChangeStatus((function(_this) {
          return function(changedPath) {
            if (changedPath === _this.editor.getPath()) {
              return _this.scheduleUpdate();
            }
          };
        })(this)));
        this.subscriptions.add(repository.onDidDestroy((function(_this) {
          return function() {
            return _this.destroy();
          };
        })(this)));
        this.subscriptions.add(atom.config.observe('minimap-git-diff.useGutterDecoration', (function(_this) {
          return function(useGutterDecoration) {
            _this.useGutterDecoration = useGutterDecoration;
            return _this.scheduleUpdate();
          };
        })(this)));
      }
      this.scheduleUpdate();
    }

    MinimapGitDiffBinding.prototype.cancelUpdate = function() {
      return clearImmediate(this.immediateId);
    };

    MinimapGitDiffBinding.prototype.scheduleUpdate = function() {
      this.cancelUpdate();
      return this.immediateId = setImmediate(this.updateDiffs);
    };

    MinimapGitDiffBinding.prototype.updateDiffs = function() {
      this.removeDecorations();
      if (this.getPath() && (this.diffs = this.getDiffs())) {
        return this.addDecorations(this.diffs);
      }
    };

    MinimapGitDiffBinding.prototype.addDecorations = function(diffs) {
      var endRow, newLines, newStart, oldLines, oldStart, startRow, _i, _len, _ref, _results;
      _results = [];
      for (_i = 0, _len = diffs.length; _i < _len; _i++) {
        _ref = diffs[_i], oldStart = _ref.oldStart, newStart = _ref.newStart, oldLines = _ref.oldLines, newLines = _ref.newLines;
        startRow = newStart - 1;
        endRow = newStart + newLines - 2;
        if (oldLines === 0 && newLines > 0) {
          _results.push(this.markRange(startRow, endRow, '.git-line-added'));
        } else if (newLines === 0 && oldLines > 0) {
          _results.push(this.markRange(startRow, startRow, '.git-line-removed'));
        } else {
          _results.push(this.markRange(startRow, endRow, '.git-line-modified'));
        }
      }
      return _results;
    };

    MinimapGitDiffBinding.prototype.removeDecorations = function() {
      var marker, _i, _len, _ref;
      if (this.markers == null) {
        return;
      }
      _ref = this.markers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        marker = _ref[_i];
        marker.destroy();
      }
      return this.markers = null;
    };

    MinimapGitDiffBinding.prototype.markRange = function(startRow, endRow, scope) {
      var marker, type;
      if (this.editor.displayBuffer.isDestroyed()) {
        return;
      }
      marker = this.editor.markBufferRange([[startRow, 0], [endRow, Infinity]], {
        invalidate: 'never'
      });
      type = this.useGutterDecoration ? 'gutter' : 'line';
      this.minimap.decorateMarker(marker, {
        type: type,
        scope: ".minimap ." + type + " " + scope,
        plugin: 'git-diff'
      });
      if (this.markers == null) {
        this.markers = [];
      }
      return this.markers.push(marker);
    };

    MinimapGitDiffBinding.prototype.destroy = function() {
      this.removeDecorations();
      this.subscriptions.dispose();
      this.diffs = null;
      return this.minimap = null;
    };

    MinimapGitDiffBinding.prototype.getPath = function() {
      var _ref;
      return (_ref = this.editor.getBuffer()) != null ? _ref.getPath() : void 0;
    };

    MinimapGitDiffBinding.prototype.getRepositories = function() {
      return atom.project.getRepositories().filter(function(repo) {
        return repo != null;
      });
    };

    MinimapGitDiffBinding.prototype.getRepo = function() {
      return this.repository != null ? this.repository : this.repository = repositoryForPath(this.editor.getPath());
    };

    MinimapGitDiffBinding.prototype.getDiffs = function() {
      var e, _ref;
      try {
        return (_ref = this.getRepo()) != null ? _ref.getLineDiffs(this.getPath(), this.editor.getBuffer().getText()) : void 0;
      } catch (_error) {
        e = _error;
        return null;
      }
    };

    return MinimapGitDiffBinding;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9taW5pbWFwLWdpdC1kaWZmL2xpYi9taW5pbWFwLWdpdC1kaWZmLWJpbmRpbmcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDZEQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUNDLG9CQUFxQixPQUFBLENBQVEsV0FBUixFQUFyQixpQkFERCxDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUVKLG9DQUFBLE1BQUEsR0FBUSxLQUFSLENBQUE7O0FBRWEsSUFBQSwrQkFBRSxPQUFGLEdBQUE7QUFDWCxVQUFBLFVBQUE7QUFBQSxNQURZLElBQUMsQ0FBQSxVQUFBLE9BQ2IsQ0FBQTtBQUFBLCtDQUFBLENBQUE7QUFBQSx1REFBQSxDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsV0FBRCxHQUFlLEVBQWYsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQURYLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxhQUFELEdBQWlCLEdBQUEsQ0FBQSxtQkFGakIsQ0FBQTtBQUlBLE1BQUEsSUFBTyxvQkFBUDtBQUNFLGVBQU8sT0FBTyxDQUFDLElBQVIsQ0FBYSxvREFBYixDQUFQLENBREY7T0FKQTtBQUFBLE1BT0EsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsT0FBTyxDQUFDLGFBQVQsQ0FBQSxDQVBWLENBQUE7QUFBQSxNQVNBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsT0FBTyxDQUFDLFlBQVQsQ0FBc0IsSUFBQyxDQUFBLE9BQXZCLENBQW5CLENBVEEsQ0FBQTtBQVdBLE1BQUEsSUFBRyxVQUFBLEdBQWEsSUFB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

//# sourceURL=/home/takaaki/.atom/packages/minimap-git-diff/lib/minimap-git-diff-binding.coffee
