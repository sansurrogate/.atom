(function() {
  var CompositeDisposable, ResolverView, View, handleErr,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  CompositeDisposable = require('atom').CompositeDisposable;

  View = require('space-pen').View;

  handleErr = require('./error-view').handleErr;

  ResolverView = (function(_super) {
    __extends(ResolverView, _super);

    function ResolverView() {
      return ResolverView.__super__.constructor.apply(this, arguments);
    }

    ResolverView.content = function(editor, state, pkg) {
      var resolveText;
      resolveText = state.context.resolveText;
      return this.div({
        "class": 'overlay from-top resolver'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'block text-highlight'
          }, "We're done here");
          _this.div({
            "class": 'block'
          }, function() {
            _this.div({
              "class": 'block text-info'
            }, function() {
              return _this.text("You've dealt with all of the conflicts in this file.");
            });
            return _this.div({
              "class": 'block text-info'
            }, function() {
              _this.span({
                outlet: 'actionText'
              }, "Save and " + resolveText);
              return _this.text(' this file?');
            });
          });
          _this.div({
            "class": 'pull-left'
          }, function() {
            return _this.button({
              "class": 'btn btn-primary',
              click: 'dismiss'
            }, 'Maybe Later');
          });
          return _this.div({
            "class": 'pull-right'
          }, function() {
            return _this.button({
              "class": 'btn btn-primary',
              click: 'resolve'
            }, resolveText);
          });
        };
      })(this));
    };

    ResolverView.prototype.initialize = function(editor, state, pkg) {
      this.editor = editor;
      this.state = state;
      this.pkg = pkg;
      this.subs = new CompositeDisposable();
      this.refresh();
      this.subs.add(this.editor.onDidSave((function(_this) {
        return function() {
          return _this.refresh();
        };
      })(this)));
      return this.subs.add(atom.commands.add(this.element, 'merge-conflicts:quit', (function(_this) {
        return function() {
          return _this.dismiss();
        };
      })(this)));
    };

    ResolverView.prototype.detached = function() {
      return this.subs.dispose();
    };

    ResolverView.prototype.getModel = function() {
      return null;
    };

    ResolverView.prototype.relativePath = function() {
      return this.state.relativize(this.editor.getURI());
    };

    ResolverView.prototype.refresh = function() {
      return this.state.context.isResolvedFile(this.relativePath()).then((function(_this) {
        return function(resolved) {
          var modified, needsResolve, needsSaved, resolveText;
          modified = _this.editor.isModified();
          needsSaved = modified;
          needsResolve = modified || !resolved;
          if (!(needsSaved || needsResolve)) {
            _this.hide('fast', function() {
              return _this.remove();
            });
            _this.pkg.didResolveFile({
              file: _this.editor.getURI()
            });
            return;
          }
          resolveText = _this.state.context.resolveText;
          if (needsSaved) {
            return _this.actionText.text("Save and " + (resolveText.toLowerCase()));
          } else if (needsResolve) {
            return _this.actionText.text(resolveText);
          }
        };
      })(this))["catch"](handleErr);
    };

    ResolverView.prototype.resolve = function() {
      return Promise.resolve(this.editor.save()).then((function(_this) {
        return function() {
          return _this.state.context.resolveFile(_this.relativePath()).then(function() {
            return _this.refresh();
          })["catch"](handleErr);
        };
      })(this));
    };

    ResolverView.prototype.dismiss = function() {
      return this.hide('fast', (function(_this) {
        return function() {
          return _this.remove();
        };
      })(this));
    };

    return ResolverView;

  })(View);

  module.exports = {
    ResolverView: ResolverView
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9tZXJnZS1jb25mbGljdHMvbGliL3ZpZXcvcmVzb2x2ZXItdmlldy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsa0RBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUixFQUF2QixtQkFBRCxDQUFBOztBQUFBLEVBQ0MsT0FBUSxPQUFBLENBQVEsV0FBUixFQUFSLElBREQsQ0FBQTs7QUFBQSxFQUdDLFlBQWEsT0FBQSxDQUFRLGNBQVIsRUFBYixTQUhELENBQUE7O0FBQUEsRUFLTTtBQUVKLG1DQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFlBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQyxNQUFELEVBQVMsS0FBVCxFQUFnQixHQUFoQixHQUFBO0FBQ1IsVUFBQSxXQUFBO0FBQUEsTUFBQSxXQUFBLEdBQWMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxXQUE1QixDQUFBO2FBQ0EsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsT0FBQSxFQUFPLDJCQUFQO09BQUwsRUFBeUMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUN2QyxVQUFBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxZQUFBLE9BQUEsRUFBTyxzQkFBUDtXQUFMLEVBQW9DLGlCQUFwQyxDQUFBLENBQUE7QUFBQSxVQUNBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxZQUFBLE9BQUEsRUFBTyxPQUFQO1dBQUwsRUFBcUIsU0FBQSxHQUFBO0FBQ25CLFlBQUEsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLGNBQUEsT0FBQSxFQUFPLGlCQUFQO2FBQUwsRUFBK0IsU0FBQSxHQUFBO3FCQUM3QixLQUFDLENBQUEsSUFBRCxDQUFNLHNEQUFOLEVBRDZC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

//# sourceURL=/home/takaaki/.atom/packages/merge-conflicts/lib/view/resolver-view.coffee
