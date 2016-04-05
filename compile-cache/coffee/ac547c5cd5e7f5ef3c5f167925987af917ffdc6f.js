(function() {
  var $, $$, BranchDialog, BranchView, CommitDialog, ConfirmDialog, DeleteDialog, DiffView, FileView, FlowDialog, GitControlView, LogView, MenuView, MergeDialog, ProjectDialog, PushDialog, View, git, gitWorkspaceTitle, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom-space-pen-views'), View = _ref.View, $ = _ref.$, $$ = _ref.$$;

  git = require('./git');

  BranchView = require('./views/branch-view');

  DiffView = require('./views/diff-view');

  FileView = require('./views/file-view');

  LogView = require('./views/log-view');

  MenuView = require('./views/menu-view');

  ProjectDialog = require('./dialogs/project-dialog');

  BranchDialog = require('./dialogs/branch-dialog');

  CommitDialog = require('./dialogs/commit-dialog');

  ConfirmDialog = require('./dialogs/confirm-dialog');

  DeleteDialog = require('./dialogs/delete-dialog');

  MergeDialog = require('./dialogs/merge-dialog');

  FlowDialog = require('./dialogs/flow-dialog');

  PushDialog = require('./dialogs/push-dialog');

  gitWorkspaceTitle = '';

  module.exports = GitControlView = (function(_super) {
    __extends(GitControlView, _super);

    function GitControlView() {
      this.flow = __bind(this.flow, this);
      this.merge = __bind(this.merge, this);
      return GitControlView.__super__.constructor.apply(this, arguments);
    }

    GitControlView.content = function() {
      if (git.isInitialised()) {
        return this.div({
          "class": 'git-control'
        }, (function(_this) {
          return function() {
            _this.subview('menuView', new MenuView());
            _this.div({
              "class": 'content',
              outlet: 'contentView'
            }, function() {
              _this.div({
                "class": 'sidebar'
              }, function() {
                _this.subview('filesView', new FileView());
                _this.subview('localBranchView', new BranchView({
                  name: 'Local',
                  local: true
                }));
                return _this.subview('remoteBranchView', new BranchView({
                  name: 'Remote'
                }));
              });
              _this.div({
                "class": 'domain'
              }, function() {
                return _this.subview('diffView', new DiffView());
              });
              _this.subview('projectDialog', new ProjectDialog());
              _this.subview('branchDialog', new BranchDialog());
              _this.subview('commitDialog', new CommitDialog());
              _this.subview('mergeDialog', new MergeDialog());
              _this.subview('flowDialog', new FlowDialog());
              return _this.subview('pushDialog', new PushDialog());
            });
            return _this.subview('logView', new LogView());
          };
        })(this));
      } else {
        return this.div({
          "class": 'git-control'
        }, (function(_this) {
          return function() {
            return _this.subview('logView', new LogView());
          };
        })(this));
      }
    };

    GitControlView.prototype.serialize = function() {};

    GitControlView.prototype.initialize = function() {
      console.log('GitControlView: initialize');
      git.setLogger((function(_this) {
        return function(log, iserror) {
          return _this.logView.log(log, iserror);
        };
      })(this));
      this.active = true;
      this.branchSelected = null;
      if (!git.isInitialised()) {
        git.alert("> This project is not a git repository. Either open another project or create a repository.");
      } else {
        this.setWorkspaceTitle(git.getRepository().path.split('/').reverse()[1]);
      }
      this.update(true);
    };

    GitControlView.prototype.destroy = function() {
      console.log('GitControlView: destroy');
      this.active = false;
    };

    GitControlView.prototype.setWorkspaceTitle = function(title) {
      return gitWorkspaceTitle = title;
    };

    GitControlView.prototype.getTitle = function() {
      return 'git:control';
    };

    GitControlView.prototype.update = function(nofetch) {
      if (git.isInitialised()) {
        this.loadBranches();
        this.showStatus();
        this.filesView.setWorkspaceTitle(gitWorkspaceTitle);
        if (!nofetch) {
          this.fetchMenuClick();
          if (this.diffView) {
            this.diffView.clearAll();
          }
        }
      }
    };

    GitControlView.prototype.loadLog = function() {
      git.log(this.selectedBranch).then(function(logs) {
        console.log('git.log', logs);
      });
    };

    GitControlView.prototype.checkoutBranch = function(branch, remote) {
      git.checkout(branch, remote).then((function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
    };

    GitControlView.prototype.branchCount = function(count) {
      var remotes;
      if (git.isInitialised()) {
        remotes = git.hasOrigin();
        this.menuView.activate('upstream', remotes && count.behind);
        this.menuView.activate('downstream', remotes && (count.ahead || !git.getRemoteBranch()));
        this.menuView.activate('remote', remotes);
      }
    };

    GitControlView.prototype.loadBranches = function() {
      if (git.isInitialised()) {
        this.selectedBranch = git.getLocalBranch();
        git.getBranches().then((function(_this) {
          return function(branches) {
            _this.branches = branches;
            _this.remoteBranchView.addAll(branches.remote);
            _this.localBranchView.addAll(branches.local, true);
          };
        })(this));
      }
    };

    GitControlView.prototype.showSelectedFiles = function() {
      this.menuView.activate('file', this.filesView.hasSelected());
      this.menuView.activate('file.merging', this.filesView.hasSelected() || git.isMerging());
    };

    GitControlView.prototype.showStatus = function() {
      git.status().then((function(_this) {
        return function(files) {
          _this.filesView.addAll(files);
        };
      })(this));
    };

    GitControlView.prototype.projectMenuClick = function() {
      this.projectDialog.activate();
    };

    GitControlView.prototype.branchMenuClick = function() {
      this.branchDialog.activate();
    };

    GitControlView.prototype.compareMenuClick = function() {
      git.diff(this.filesView.getSelected().all.join(' ')).then((function(_this) {
        return function(diffs) {
          return _this.diffView.addAll(diffs);
        };
      })(this));
    };

    GitControlView.prototype.commitMenuClick = function() {
      if (!(this.filesView.hasSelected() || git.isMerging())) {
        return;
      }
      this.commitDialog.activate();
    };

    GitControlView.prototype.commit = function() {
      var files, msg;
      if (!this.filesView.hasSelected()) {
        return;
      }
      msg = this.commitDialog.getMessage();
      files = this.filesView.getSelected();
      this.filesView.unselectAll();
      git.add(files.add).then(function() {
        return git.remove(files.rem);
      }).then(function() {
        return git.commit(msg);
      }).then((function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
    };

    GitControlView.prototype.createBranch = function(branch) {
      git.createBranch(branch).then((function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
    };

    GitControlView.prototype.deleteBranch = function(branch) {
      var confirmCb, forceDeleteCallback;
      confirmCb = (function(_this) {
        return function(params) {
          git.deleteBranch(params.branch).then(function() {
            return _this.update();
          });
        };
      })(this);
      forceDeleteCallback = (function(_this) {
        return function(params) {
          return git.forceDeleteBranch(params.branch).then(function() {
            return _this.update();
          });
        };
      })(this);
      this.contentView.append(new DeleteDialog({
        hdr: 'Delete Branch',
        msg: "Are you sure you want to delete the local branch '" + branch + "'?",
        cb: confirmCb,
        fdCb: forceDeleteCallback,
        branch: branch
      }));
    };

    GitControlView.prototype.fetchMenuClick = function() {
      if (git.isInitialised()) {
        if (!git.hasOrigin()) {
          return;
        }
      }
      git.fetch().then((function(_this) {
        return function() {
          return _this.loadBranches();
        };
      })(this));
    };

    GitControlView.prototype.mergeMenuClick = function() {
      this.mergeDialog.activate(this.branches.local);
    };

    GitControlView.prototype.merge = function(branch, noff) {
      git.merge(branch, noff).then((function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
    };

    GitControlView.prototype.flowMenuClick = function() {
      this.flowDialog.activate(this.branches.local);
    };

    GitControlView.prototype.flow = function(type, action, branch) {
      git.flow(type, action, branch).then((function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
    };

    GitControlView.prototype.pullMenuClick = function() {
      git.pull().then((function(_this) {
        return function() {
          return _this.update(true);
        };
      })(this));
    };

    GitControlView.prototype.pullupMenuClick = function() {
      git.pullup().then((function(_this) {
        return function() {
          return _this.update(true);
        };
      })(this));
    };

    GitControlView.prototype.pushMenuClick = function() {
      git.getBranches().then((function(_this) {
        return function(branches) {
          return _this.pushDialog.activate(branches.remote);
        };
      })(this));
    };

    GitControlView.prototype.push = function(remote, branches) {
      return git.push(remote, branches).then((function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
    };

    GitControlView.prototype.resetMenuClick = function() {
      var files;
      if (!this.filesView.hasSelected()) {
        return;
      }
      files = this.filesView.getSelected();
      return atom.confirm({
        message: "Reset will erase changes since the last commit in the selected files. Are you sure?",
        buttons: {
          Cancel: (function(_this) {
            return function() {};
          })(this),
          Reset: (function(_this) {
            return function() {
              git.reset(files.all).then(function() {
                return _this.update();
              });
            };
          })(this)
        }
      });
    };

    return GitControlView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtY29udHJvbC9saWIvZ2l0LWNvbnRyb2wtdmlldy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEseU5BQUE7SUFBQTs7bVNBQUE7O0FBQUEsRUFBQSxPQUFnQixPQUFBLENBQVEsc0JBQVIsQ0FBaEIsRUFBQyxZQUFBLElBQUQsRUFBTyxTQUFBLENBQVAsRUFBVSxVQUFBLEVBQVYsQ0FBQTs7QUFBQSxFQUVBLEdBQUEsR0FBTSxPQUFBLENBQVEsT0FBUixDQUZOLENBQUE7O0FBQUEsRUFJQSxVQUFBLEdBQWEsT0FBQSxDQUFRLHFCQUFSLENBSmIsQ0FBQTs7QUFBQSxFQUtBLFFBQUEsR0FBVyxPQUFBLENBQVEsbUJBQVIsQ0FMWCxDQUFBOztBQUFBLEVBTUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxtQkFBUixDQU5YLENBQUE7O0FBQUEsRUFPQSxPQUFBLEdBQVUsT0FBQSxDQUFRLGtCQUFSLENBUFYsQ0FBQTs7QUFBQSxFQVFBLFFBQUEsR0FBVyxPQUFBLENBQVEsbUJBQVIsQ0FSWCxDQUFBOztBQUFBLEVBVUEsYUFBQSxHQUFnQixPQUFBLENBQVEsMEJBQVIsQ0FWaEIsQ0FBQTs7QUFBQSxFQVdBLFlBQUEsR0FBZSxPQUFBLENBQVEseUJBQVIsQ0FYZixDQUFBOztBQUFBLEVBWUEsWUFBQSxHQUFlLE9BQUEsQ0FBUSx5QkFBUixDQVpmLENBQUE7O0FBQUEsRUFhQSxhQUFBLEdBQWdCLE9BQUEsQ0FBUSwwQkFBUixDQWJoQixDQUFBOztBQUFBLEVBY0EsWUFBQSxHQUFlLE9BQUEsQ0FBUSx5QkFBUixDQWRmLENBQUE7O0FBQUEsRUFlQSxXQUFBLEdBQWMsT0FBQSxDQUFRLHdCQUFSLENBZmQsQ0FBQTs7QUFBQSxFQWdCQSxVQUFBLEdBQWEsT0FBQSxDQUFRLHVC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

//# sourceURL=/home/takaaki/.atom/packages/git-control/lib/git-control-view.coffee
