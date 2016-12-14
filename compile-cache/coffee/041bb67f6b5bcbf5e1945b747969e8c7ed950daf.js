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
      var detail;
      this.pkg.didQuitConflictResolution();
      detail = "Careful, you've still got conflict markers left!\n";
      if (this.state.isRebase) {
        detail += '"git rebase --abort"';
      } else {
        detail += '"git merge --abort"';
      }
      detail += " if you just want to give up on this one.";
      return this.finish(function() {
        return atom.notifications.addWarning("Maybe Later", {
          detail: detail,
          dismissable: true
        });
      });
    };

    MergeConflictsView.prototype.refresh = function() {
      return this.state.reread((function(_this) {
        return function(err, state) {
          var detail, icon, item, p, _i, _len, _ref1;
          if (handleErr(err)) {
            return;
          }
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
          if (_this.state.isEmpty()) {
            _this.pkg.didCompleteConflictResolution();
            detail = "That's everything. ";
            if (_this.state.isRebase) {
              detail += '"git rebase --continue" at will to resume rebasing.';
            } else {
              detail += '"git commit" at will to finish the merge.';
            }
            return _this.finish(function() {
              return atom.notifications.addSuccess("All Conflicts Resolved", {
                detail: detail,
                dismissable: true
              });
            });
          }
        };
      })(this));
    };

    MergeConflictsView.prototype.finish = function(andThen) {
      this.subs.dispose();
      this.hide('fast', (function(_this) {
        return function() {
          MergeConflictsView.instance = null;
          return _this.remove();
        };
      })(this));
      return andThen();
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
          var context;
          context = (_.filter(contexts, Boolean).sort(function(context1, context2) {
            return context2.priority - context1.priority;
          }))[0];
          if (context == null) {
            atom.notifications.addWarning("No repository context found", {
              detail: "Tip: if you have multiple projects open, open an editor in the one containing conflicts."
            });
            return;
          }
          return MergeState.read(context, function(err, state) {
            var view;
            if (handleErr(err)) {
              return;
            }
            if (!state.isEmpty()) {
              view = new MergeConflictsView(state, pkg);
              _this.instance = view;
              atom.workspace.addBottomPanel({
                item: view
              });
              return _this.instance.subs.add(atom.workspace.observeTextEditors(function(editor) {
                return _this.markConflictsIn(state, editor, pkg);
              }));
            } else {
              return atom.notifications.addInfo("Nothing to Merge", {
                detail: "No conflicts here!",
                dismissable: true
              });
            }
          });
        };
      })(this));
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
