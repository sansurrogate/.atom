(function() {
  var $, CompositeDisposable, ConflictedEditor, GitOps, MergeConflictsView, MergeState, ResolverView, View, handleErr, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('space-pen'), $ = _ref.$, View = _ref.View;

  CompositeDisposable = require('atom').CompositeDisposable;

  _ = require('underscore-plus');

  GitOps = require('../git').GitOps;

  MergeState = require('../merge-state').MergeState;

  ConflictedEditor = require('../conflicted-editor').ConflictedEditor;

  ResolverView = require('./resolver-view').ResolverView;

  handleErr = require('./error-view').handleErr;

  MergeConflictsView = (function(_super) {
    __extends(MergeConflictsView, _super);

    function MergeConflictsView() {
      return MergeConflictsView.__super__.constructor.apply(this, arguments);
    }

    MergeConflictsView.prototype.instance = null;

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
                        click: 'stageFile',
                        "class": 'btn btn-xs btn-success inline-block-tight stage-ready',
                        style: 'display: none'
                      }, 'Stage');
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
      this.subs.add(this.pkg.onDidStageFile((function(_this) {
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
              return atom.notifications.addSuccess("Merge Complete", {
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
            full = this.state.join(p);
            this.pkg.didResolveConflict({
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

    MergeConflictsView.prototype.stageFile = function(event, element) {
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
      return this.state.context.add(repoPath).then((function(_this) {
        return function() {
          return _this.pkg.didStageFile({
            file: filePath
          });
        };
      })(this))["catch"](function(err) {
        return handleErr(err);
      });
    };

    MergeConflictsView.detect = function(pkg) {
      if (this.instance != null) {
        return;
      }
      return GitOps.getGitContext().then((function(_this) {
        return function(context) {
          if (context == null) {
            atom.notifications.addWarning("No git repository found", {
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9tZXJnZS1jb25mbGljdHMvbGliL3ZpZXcvbWVyZ2UtY29uZmxpY3RzLXZpZXcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHdIQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxPQUFZLE9BQUEsQ0FBUSxXQUFSLENBQVosRUFBQyxTQUFBLENBQUQsRUFBSSxZQUFBLElBQUosQ0FBQTs7QUFBQSxFQUNDLHNCQUF1QixPQUFBLENBQVEsTUFBUixFQUF2QixtQkFERCxDQUFBOztBQUFBLEVBRUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUZKLENBQUE7O0FBQUEsRUFJQyxTQUFVLE9BQUEsQ0FBUSxRQUFSLEVBQVYsTUFKRCxDQUFBOztBQUFBLEVBS0MsYUFBYyxPQUFBLENBQVEsZ0JBQVIsRUFBZCxVQUxELENBQUE7O0FBQUEsRUFNQyxtQkFBb0IsT0FBQSxDQUFRLHNCQUFSLEVBQXBCLGdCQU5ELENBQUE7O0FBQUEsRUFRQyxlQUFnQixPQUFBLENBQVEsaUJBQVIsRUFBaEIsWUFSRCxDQUFBOztBQUFBLEVBU0MsWUFBYSxPQUFBLENBQVEsY0FBUixFQUFiLFNBVEQsQ0FBQTs7QUFBQSxFQVdNO0FBRUoseUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLGlDQUFBLFFBQUEsR0FBVSxJQUFWLENBQUE7O0FBQUEsSUFFQSxrQkFBQyxDQUFBLE9BQUQsR0FBVSxTQUFDLEtBQUQsRUFBUSxHQUFSLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxPQUFBLEVBQU8seURBQVA7T0FBTCxFQUF1RSxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQ3JFLFVBQUEsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsT0FBQSxFQUFP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

//# sourceURL=/home/takaaki/.atom/packages/merge-conflicts/lib/view/merge-conflicts-view.coffee
