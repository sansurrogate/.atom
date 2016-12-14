(function() {
  var $, CompositeDisposable, ConflictedEditor, MergeConflictsView, MergeState, ResolverView, View, handleErr, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('space-pen'), $ = _ref.$, View = _ref.View;

  CompositeDisposable = require('atom').CompositeDisposable;

  _ = require('underscore-plus');

  MergeState = require('../merge-state').MergeState;

  ConflictedEditor = require('../conflicted-editor').ConflictedEditor;

  ResolverView = require('./resolver-view').ResolverView;

  handleErr = require('./error-view').handleErr;

  MergeConflictsView = (function(_super) {
    __extends(MergeConflictsView, _super);

    function MergeConflictsView() {
      return MergeConflictsView.__super__.constructor.apply(this, arguments);
    }

    MergeConflictsView.instance = null;

    MergeConflictsView.contextApis = [];

    MergeConflictsView.content = function(state, pkg) {
      return this.div({
        "class": 'merge-conflicts tool-panel panel-bottom padded clearfix'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'panel-heading'
          }, function() {
            _this.text('Conflicts');
            _this.span({
              "class": 'pull-right icon icon-fold',
              click: 'minimize'
            }, 'Hide');
            return _this.span({
              "class": 'pull-right icon icon-unfold',
              click: 'restore'
            }, 'Show');
          });
          return _this.div({
            outlet: 'body'
          }, function() {
            _this.div({
              "class": 'conflict-list'
            }, function() {
              return _this.ul({
                "class": 'block list-group',
                outlet: 'pathList'
              }, function() {
                var message, p, _i, _len, _ref1, _ref2, _results;
                _ref1 = state.conflicts;
                _results = [];
                for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                  _ref2 = _ref1[_i], p = _ref2.path, message = _ref2.message;
                  _results.push(_this.li({
                    click: 'navigate',
                    "data-path": p,
                    "class": 'list-item navigate'
                  }, function() {
                    _this.span({
                      "class": 'inline-block icon icon-diff-modified status-modified path'
                    }, p);
                    return _this.div({
                      "class": 'pull-right'
                    }, function() {
                      _this.button({
                        click: 'resolveFile',
                        "class": 'btn btn-xs btn-success inline-block-tight stage-ready',
                        style: 'display: none'
                      }, state.context.resolveText);
                      _this.span({
                        "class": 'inline-block text-subtle'
                      }, message);
                      _this.progress({
                        "class": 'inline-block',
                        max: 100,
                        value: 0
                      });
                      return _this.span({
                        "class": 'inline-block icon icon-dash staged'
                      });
                    });
                  }));
                }
                return _results;
              });
            });
            return _this.div({
              "class": 'footer block pull-right'
            }, function() {
              return _this.button({
                "class": 'btn btn-sm',
                click: 'quit'
              }, 'Quit');
            });
          });
        };
      })(this));
    };

    MergeConflictsView.prototype.initialize = function(state, pkg) {
      this.state = state;
      this.pkg = pkg;
      this.subs = new CompositeDisposable;
      this.subs.add(this.pkg.onDidResolveConflict((function(_this) {
        return function(event) {
          var found, li, listElement, p, progress, _i, _len, _ref1;
          p = _this.state.relativize(event.file);
          found = false;
          _ref1 = _this.pathList.children();
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            listElement = _ref1[_i];
            li = $(listElement);
            if (li.data('path') === p) {
              found = true;
              progress = li.find('progress')[0];
              progress.max = event.total;
              progress.value = event.resolved;
              if (event.total === event.resolved) {
                li.find('.stage-ready').show();
              }
            }
          }
          if (!found) {
            return console.error("Unrecognized conflict path: " + p);
          }
        };
      })(this)));
      this.subs.add(this.pkg.onDidResolveFile((function(_this) {
        return function() {
          return _this.refresh();
        };
      })(this)));
      return this.subs.add(atom.commands.add(this.element, {
        'merge-conflicts:entire-file-ours': this.sideResolver('ours'),
        'merge-conflicts:entire-file-theirs': this.sideResolver('theirs')
      }));
    };

    MergeConflictsView.prototype.navigate = function(event, element) {
      var fullPath, repoPath;
      repoPath = element.find(".path").text();
      fullPath = this.state.join(repoPath);
      return atom.workspace.open(fullPath);
    };

    MergeConflictsView.prototype.minimize = function() {
      this.addClass('minimized');
      return this.body.hide('fast');
    };

    MergeConflictsView.prototype.restore = function() {
      this.removeClass('minimized');
      return this.body.show('fast');
    };

    MergeConflictsView.prototype.quit = function() {
      this.pkg.didQuitConflictResolution();
      this.finish();
      return this.state.context.quit(this.state.isRebase);
    };

    MergeConflictsView.prototype.refresh = function() {
      return this.state.reread()["catch"](handleErr).then((function(_this) {
        return function() {
          var icon, item, p, _i, _len, _ref1;
          _ref1 = _this.pathList.find('li');
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            item = _ref1[_i];
            p = $(item).data('path');
            icon = $(item).find('.staged');
            icon.removeClass('icon-dash icon-check text-success');
            if (_.contains(_this.state.conflictPaths(), p)) {
              icon.addClass('icon-dash');
            } else {
              icon.addClass('icon-check text-success');
              _this.pathList.find("li[data-path='" + p + "'] .stage-ready").hide();
            }
          }
          if (!_this.state.isEmpty()) {
            return;
          }
          _this.pkg.didCompleteConflictResolution();
          _this.finish();
          return _this.state.context.complete(_this.state.isRebase);
        };
      })(this));
    };

    MergeConflictsView.prototype.finish = function() {
      this.subs.dispose();
      return this.hide('fast', (function(_this) {
        return function() {
          MergeConflictsView.instance = null;
          return _this.remove();
        };
      })(this));
    };

    MergeConflictsView.prototype.sideResolver = function(side) {
      return (function(_this) {
        return function(event) {
          var p;
          p = $(event.target).closest('li').data('path');
          return _this.state.context.checkoutSide(side, p).then(function() {
            var full;
            full = _this.state.join(p);
            _this.pkg.didResolveConflict({
              file: full,
              total: 1,
              resolved: 1
            });
            return atom.workspace.open(p);
          })["catch"](function(err) {
            return handleErr(err);
          });
        };
      })(this);
    };

    MergeConflictsView.prototype.resolveFile = function(event, element) {
      var e, filePath, repoPath, _i, _len, _ref1;
      repoPath = element.closest('li').data('path');
      filePath = this.state.join(repoPath);
      _ref1 = atom.workspace.getTextEditors();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        e = _ref1[_i];
        if (e.getPath() === filePath) {
          e.save();
        }
      }
      return this.state.context.resolveFile(repoPath).then((function(_this) {
        return function() {
          return _this.pkg.didResolveFile({
            file: filePath
          });
        };
      })(this))["catch"](function(err) {
        return handleErr(err);
      });
    };

    MergeConflictsView.registerContextApi = function(contextApi) {
      return this.contextApis.push(contextApi);
    };

    MergeConflictsView.showForContext = function(context, pkg) {
      if (this.instance) {
        this.instance.finish();
      }
      return MergeState.read(context).then((function(_this) {
        return function(state) {
          if (state.isEmpty()) {
            return;
          }
          return _this.openForState(state, pkg);
        };
      })(this))["catch"](handleErr);
    };

    MergeConflictsView.hideForContext = function(context) {
      if (!this.instance) {
        return;
      }
      if (this.instance.state.context !== context) {
        return;
      }
      return this.instance.finish();
    };

    MergeConflictsView.detect = function(pkg) {
      if (this.instance != null) {
        return;
      }
      return Promise.all(this.contextApis.map((function(_this) {
        return function(contextApi) {
          return contextApi.getContext();
        };
      })(this))).then((function(_this) {
        return function(contexts) {
          return Promise.all(_.filter(contexts, Boolean).sort(function(context1, context2) {
            return context2.priority - context1.priority;
          }).map(function(context) {
            return MergeState.read(context);
          }));
        };
      })(this)).then((function(_this) {
        return function(states) {
          var state;
          state = states.find(function(state) {
            return !state.isEmpty();
          });
          if (state == null) {
            atom.notifications.addInfo("Nothing to Merge", {
              detail: "No conflicts here!",
              dismissable: true
            });
            return;
          }
          return _this.openForState(state, pkg);
        };
      })(this))["catch"](handleErr);
    };

    MergeConflictsView.openForState = function(state, pkg) {
      var view;
      view = new MergeConflictsView(state, pkg);
      this.instance = view;
      atom.workspace.addBottomPanel({
        item: view
      });
      return this.instance.subs.add(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          return _this.markConflictsIn(state, editor, pkg);
        };
      })(this)));
    };

    MergeConflictsView.markConflictsIn = function(state, editor, pkg) {
      var e, fullPath, repoPath;
      if (state.isEmpty()) {
        return;
      }
      fullPath = editor.getPath();
      repoPath = state.relativize(fullPath);
      if (repoPath == null) {
        return;
      }
      if (!_.contains(state.conflictPaths(), repoPath)) {
        return;
      }
      e = new ConflictedEditor(state, pkg, editor);
      return e.mark();
    };

    return MergeConflictsView;

  })(View);

  module.exports = {
    MergeConflictsView: MergeConflictsView
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9tZXJnZS1jb25mbGljdHMvbGliL3ZpZXcvbWVyZ2UtY29uZmxpY3RzLXZpZXcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGdIQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxPQUFZLE9BQUEsQ0FBUSxXQUFSLENBQVosRUFBQyxTQUFBLENBQUQsRUFBSSxZQUFBLElBQUosQ0FBQTs7QUFBQSxFQUNDLHNCQUF1QixPQUFBLENBQVEsTUFBUixFQUF2QixtQkFERCxDQUFBOztBQUFBLEVBRUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUZKLENBQUE7O0FBQUEsRUFJQyxhQUFjLE9BQUEsQ0FBUSxnQkFBUixFQUFkLFVBSkQsQ0FBQTs7QUFBQSxFQUtDLG1CQUFvQixPQUFBLENBQVEsc0JBQVIsRUFBcEIsZ0JBTEQsQ0FBQTs7QUFBQSxFQU9DLGVBQWdCLE9BQUEsQ0FBUSxpQkFBUixFQUFoQixZQVBELENBQUE7O0FBQUEsRUFRQyxZQUFhLE9BQUEsQ0FBUSxjQUFSLEVBQWIsU0FSRCxDQUFBOztBQUFBLEVBVU07QUFFSix5Q0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxrQkFBQyxDQUFBLFFBQUQsR0FBVyxJQUFYLENBQUE7O0FBQUEsSUFDQSxrQkFBQyxDQUFBLFdBQUQsR0FBYyxFQURkLENBQUE7O0FBQUEsSUFHQSxrQkFBQyxDQUFBLE9BQUQsR0FBVSxTQUFDLEtBQUQsRUFBUSxHQUFSLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxPQUFBLEVBQU8seURBQVA7T0FBTCxFQUF1RSxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQ3JFLFVBQUEsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsT0FB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

//# sourceURL=/home/takaaki/.atom/packages/merge-conflicts/lib/view/merge-conflicts-view.coffee
