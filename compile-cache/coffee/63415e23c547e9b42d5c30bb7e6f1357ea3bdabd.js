(function() {
  var CompositeDisposable, Emitter, GitOps, MergeConflictsView, pkgApi, pkgEmitter, _ref;

  _ref = require('atom'), CompositeDisposable = _ref.CompositeDisposable, Emitter = _ref.Emitter;

  MergeConflictsView = require('./view/merge-conflicts-view').MergeConflictsView;

  GitOps = require('./git').GitOps;

  pkgEmitter = null;

  pkgApi = null;

  module.exports = {
    activate: function(state) {
      this.subs = new CompositeDisposable;
      this.emitter = new Emitter;
      MergeConflictsView.registerContextApi(GitOps);
      pkgEmitter = {
        onDidResolveConflict: (function(_this) {
          return function(callback) {
            return _this.onDidResolveConflict(callback);
          };
        })(this),
        didResolveConflict: (function(_this) {
          return function(event) {
            return _this.emitter.emit('did-resolve-conflict', event);
          };
        })(this),
        onDidResolveFile: (function(_this) {
          return function(callback) {
            return _this.onDidResolveFile(callback);
          };
        })(this),
        didResolveFile: (function(_this) {
          return function(event) {
            return _this.emitter.emit('did-resolve-file', event);
          };
        })(this),
        onDidQuitConflictResolution: (function(_this) {
          return function(callback) {
            return _this.onDidQuitConflictResolution(callback);
          };
        })(this),
        didQuitConflictResolution: (function(_this) {
          return function() {
            return _this.emitter.emit('did-quit-conflict-resolution');
          };
        })(this),
        onDidCompleteConflictResolution: (function(_this) {
          return function(callback) {
            return _this.onDidCompleteConflictResolution(callback);
          };
        })(this),
        didCompleteConflictResolution: (function(_this) {
          return function() {
            return _this.emitter.emit('did-complete-conflict-resolution');
          };
        })(this)
      };
      return this.subs.add(atom.commands.add('atom-workspace', 'merge-conflicts:detect', function() {
        return MergeConflictsView.detect(pkgEmitter);
      }));
    },
    deactivate: function() {
      this.subs.dispose();
      return this.emitter.dispose();
    },
    config: {
      gitPath: {
        type: 'string',
        "default": '',
        description: 'Absolute path to your git executable.'
      }
    },
    onDidResolveConflict: function(callback) {
      return this.emitter.on('did-resolve-conflict', callback);
    },
    onDidResolveFile: function(callback) {
      return this.emitter.on('did-resolve-file', callback);
    },
    onDidQuitConflictResolution: function(callback) {
      return this.emitter.on('did-quit-conflict-resolution', callback);
    },
    onDidCompleteConflictResolution: function(callback) {
      return this.emitter.on('did-complete-conflict-resolution', callback);
    },
    registerContextApi: function(contextApi) {
      return MergeConflictsView.registerContextApi(contextApi);
    },
    provideApi: function() {
      if (pkgApi === null) {
        pkgApi = Object.freeze({
          registerContextApi: this.registerContextApi,
          onDidResolveConflict: pkgEmitter.onDidResolveConflict,
          onDidResolveFile: pkgEmitter.onDidResolveConflict,
          onDidQuitConflictResolution: pkgEmitter.onDidQuitConflictResolution,
          onDidCompleteConflictResolution: pkgEmitter.onDidCompleteConflictResolution
        });
      }
      return pkgApi;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9tZXJnZS1jb25mbGljdHMvbGliL21haW4uY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtGQUFBOztBQUFBLEVBQUEsT0FBaUMsT0FBQSxDQUFRLE1BQVIsQ0FBakMsRUFBQywyQkFBQSxtQkFBRCxFQUFzQixlQUFBLE9BQXRCLENBQUE7O0FBQUEsRUFFQyxxQkFBc0IsT0FBQSxDQUFRLDZCQUFSLEVBQXRCLGtCQUZELENBQUE7O0FBQUEsRUFHQyxTQUFVLE9BQUEsQ0FBUSxPQUFSLEVBQVYsTUFIRCxDQUFBOztBQUFBLEVBS0EsVUFBQSxHQUFhLElBTGIsQ0FBQTs7QUFBQSxFQU1BLE1BQUEsR0FBUyxJQU5ULENBQUE7O0FBQUEsRUFRQSxNQUFNLENBQUMsT0FBUCxHQUVFO0FBQUEsSUFBQSxRQUFBLEVBQVUsU0FBQyxLQUFELEdBQUE7QUFDUixNQUFBLElBQUMsQ0FBQSxJQUFELEdBQVEsR0FBQSxDQUFBLG1CQUFSLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxPQUFELEdBQVcsR0FBQSxDQUFBLE9BRFgsQ0FBQTtBQUFBLE1BR0Esa0JBQWtCLENBQUMsa0JBQW5CLENBQXNDLE1BQXRDLENBSEEsQ0FBQTtBQUFBLE1BS0EsVUFBQSxHQUNFO0FBQUEsUUFBQSxvQkFBQSxFQUFzQixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUMsUUFBRCxHQUFBO21CQUFjLEtBQUMsQ0FBQSxvQkFBRCxDQUFzQixRQUF0QixFQUFkO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEI7QUFBQSxRQUNBLGtCQUFBLEVBQW9CLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQyxLQUFELEdBQUE7bUJBQVcsS0FBQyxDQUFBLE9BQU8sQ0FBQyxJQUFU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

//# sourceURL=/home/takaaki/.atom/packages/merge-conflicts/lib/main.coffee
