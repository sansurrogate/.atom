(function() {
  var $, CompositeDisposable, GitAdd, GitBranch, GitCheckoutAllFiles, GitCheckoutCurrentFile, GitCherryPick, GitCommit, GitCommitAmend, GitDeleteLocalBranch, GitDeleteRemoteBranch, GitDiff, GitDiffAll, GitDifftool, GitFetch, GitFetchPrune, GitInit, GitLog, GitMerge, GitOpenChangedFiles, GitPaletteView, GitPull, GitPush, GitRebase, GitRemove, GitRun, GitShow, GitStageFiles, GitStageHunk, GitStashApply, GitStashDrop, GitStashPop, GitStashSave, GitStashSaveMessage, GitStatus, GitTags, GitUnstageFiles, OutputViewManager, baseGrammar, currentFile, diffGrammar, git;

  CompositeDisposable = require('atom').CompositeDisposable;

  $ = require('atom-space-pen-views').$;

  git = require('./git');

  OutputViewManager = require('./output-view-manager');

  GitPaletteView = require('./views/git-palette-view');

  GitAdd = require('./models/git-add');

  GitBranch = require('./models/git-branch');

  GitDeleteLocalBranch = require('./models/git-delete-local-branch.coffee');

  GitDeleteRemoteBranch = require('./models/git-delete-remote-branch.coffee');

  GitCheckoutAllFiles = require('./models/git-checkout-all-files');

  GitCheckoutCurrentFile = require('./models/git-checkout-current-file');

  GitCherryPick = require('./models/git-cherry-pick');

  GitCommit = require('./models/git-commit');

  GitCommitAmend = require('./models/git-commit-amend');

  GitDiff = require('./models/git-diff');

  GitDifftool = require('./models/git-difftool');

  GitDiffAll = require('./models/git-diff-all');

  GitFetch = require('./models/git-fetch');

  GitFetchPrune = require('./models/git-fetch-prune.coffee');

  GitInit = require('./models/git-init');

  GitLog = require('./models/git-log');

  GitPull = require('./models/git-pull');

  GitPush = require('./models/git-push');

  GitRemove = require('./models/git-remove');

  GitShow = require('./models/git-show');

  GitStageFiles = require('./models/git-stage-files');

  GitStageHunk = require('./models/git-stage-hunk');

  GitStashApply = require('./models/git-stash-apply');

  GitStashDrop = require('./models/git-stash-drop');

  GitStashPop = require('./models/git-stash-pop');

  GitStashSave = require('./models/git-stash-save');

  GitStashSaveMessage = require('./models/git-stash-save-message');

  GitStatus = require('./models/git-status');

  GitTags = require('./models/git-tags');

  GitUnstageFiles = require('./models/git-unstage-files');

  GitRun = require('./models/git-run');

  GitMerge = require('./models/git-merge');

  GitRebase = require('./models/git-rebase');

  GitOpenChangedFiles = require('./models/git-open-changed-files');

  diffGrammar = require('./grammars/diff.js');

  baseGrammar = __dirname + '/grammars/diff.json';

  currentFile = function(repo) {
    var _ref;
    return repo.relativize((_ref = atom.workspace.getActiveTextEditor()) != null ? _ref.getPath() : void 0);
  };

  module.exports = {
    config: {
      includeStagedDiff: {
        title: 'Include staged diffs?',
        type: 'boolean',
        "default": true
      },
      openInPane: {
        type: 'boolean',
        "default": true,
        description: 'Allow commands to open new panes'
      },
      splitPane: {
        title: 'Split pane direction',
        type: 'string',
        "default": 'Down',
        description: 'Where should new panes go? (Defaults to Right)',
        "enum": ['Up', 'Right', 'Down', 'Left']
      },
      wordDiff: {
        type: 'boolean',
        "default": true,
        description: 'Should word diffs be highlighted in diffs?'
      },
      syntaxHighlighting: {
        title: 'Enable syntax highlighting in diffs?',
        type: 'boolean',
        "default": true
      },
      numberOfCommitsToShow: {
        type: 'integer',
        "default": 25,
        minimum: 1
      },
      gitPath: {
        type: 'string',
        "default": 'git',
        description: 'Where is your git?'
      },
      messageTimeout: {
        type: 'integer',
        "default": 5,
        description: 'How long should success/error messages be shown?'
      },
      pullBeforePush: {
        description: 'Pull from remote before pushing',
        type: 'string',
        "default": 'no',
        "enum": ['no', 'pull', 'pull --rebase']
      },
      experimental: {
        description: 'Enable beta features and behavior',
        type: 'boolean',
        "default": false
      },
      verboseCommits: {
        description: '(Experimental) Show diffs in commit pane?',
        type: 'boolean',
        "default": false
      }
    },
    subscriptions: null,
    activate: function(state) {
      var enableSyntaxHighlighting, repos;
      enableSyntaxHighlighting = atom.config.get('git-plus').syntaxHighlighting;
      if (enableSyntaxHighlighting) {
        atom.grammars.addGrammar(diffGrammar);
      } else {
        atom.grammars.loadGrammarSync(baseGrammar);
      }
      this.subscriptions = new CompositeDisposable;
      repos = atom.project.getRepositories().filter(function(r) {
        return r != null;
      });
      if (repos.length === 0) {
        this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:init', function() {
          return GitInit();
        }));
      }
      this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:menu', function() {
        return new GitPaletteView();
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:add', function() {
        return git.getRepo().then(function(repo) {
          return GitAdd(repo);
        });
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:add-all', function() {
        return git.getRepo().then(function(repo) {
          return GitAdd(repo, {
            addAll: true
          });
        });
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:commit', function() {
        return git.getRepo().then(function(repo) {
          return GitCommit(repo);
        });
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:commit-all', function() {
        return git.getRepo().then(function(repo) {
          return GitCommit(repo, {
            stageChanges: true
          });
        });
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:commit-amend', function() {
        return git.getRepo().then(function(repo) {
          return new GitCommitAmend(repo);
        });
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:add-and-commit', function() {
        return git.getRepo().then(function(repo) {
          return git.add(repo, {
            file: currentFile(repo)
          }).then(function() {
            return GitCommit(repo);
          });
        });
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:add-and-commit-and-push', function() {
        return git.getRepo().then(function(repo) {
          return git.add(repo, {
            file: currentFile(repo)
          }).then(function() {
            return GitCommit(repo, {
              andPush: true
            });
          });
        });
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:add-all-and-commit', function() {
        return git.getRepo().then(function(repo) {
          return git.add(repo).then(function() {
            return GitCommit(repo);
          });
        });
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:add-all-commit-and-push', function() {
        return git.getRepo().then(function(repo) {
          return git.add(repo).then(function() {
            return GitCommit(repo, {
              andPush: true
            });
          });
        });
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:checkout', function() {
        return git.getRepo().then(function(repo) {
          return GitBranch.gitBranches(repo);
        });
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:checkout-remote', function() {
        return git.getRepo().then(function(repo) {
          return GitBranch.gitRemoteBranches(repo);
        });
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:checkout-current-file', function() {
        return git.getRepo().then(function(repo) {
          return GitCheckoutCurrentFile(repo);
        });
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:checkout-all-files', function() {
        return git.getRepo().then(function(repo) {
          return GitCheckoutAllFiles(repo);
        });
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:new-branch', function() {
        return git.getRepo().then(function(repo) {
          return GitBranch.newBranch(repo);
        });
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:delete-local-branch', function() {
        return git.getRepo().then(function(repo) {
          return GitDeleteLocalBranch(repo);
        });
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:delete-remote-branch', function() {
        return git.getRepo().then(function(repo) {
          return GitDeleteRemoteBranch(repo);
        });
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:cherry-pick', function() {
        return git.getRepo().then(function(repo) {
          return GitCherryPick(repo);
        });
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:diff', function() {
        return git.getRepo().then(function(repo) {
          return GitDiff(repo, {
            file: currentFile(repo)
          });
        });
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:difftool', function() {
        return git.getRepo().then(function(repo) {
          return GitDifftool(repo);
        });
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:diff-all', function() {
        return git.getRepo().then(function(repo) {
          return GitDiffAll(repo);
        });
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:fetch', function() {
        return git.getRepo().then(function(repo) {
          return GitFetch(repo);
        });
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:fetch-prune', function() {
        return git.getRepo().then(function(repo) {
          return GitFetchPrune(repo);
        });
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:pull', function() {
        return git.getRepo().then(function(repo) {
          return GitPull(repo);
        });
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:pull-using-rebase', function() {
        return git.getRepo().then(function(repo) {
          return GitPull(repo, {
            rebase: true
          });
        });
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:push', function() {
        return git.getRepo().then(function(repo) {
          return GitPush(repo);
        });
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:remove', function() {
        return git.getRepo().then(function(repo) {
          return GitRemove(repo, {
            showSelector: true
          });
        });
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:remove-current-file', function() {
        return git.getRepo().then(function(repo) {
          return GitRemove(repo);
        });
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:reset', function() {
        return git.getRepo().then(function(repo) {
          return git.reset(repo);
        });
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:show', function() {
        return git.getRepo().then(function(repo) {
          return GitShow(repo);
        });
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:log', function() {
        return git.getRepo().then(function(repo) {
          return GitLog(repo);
        });
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:log-current-file', function() {
        return git.getRepo().then(function(repo) {
          return GitLog(repo, {
            onlyCurrentFile: true
          });
        });
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:stage-files', function() {
        return git.getRepo().then(function(repo) {
          return GitStageFiles(repo);
        });
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:unstage-files', function() {
        return git.getRepo().then(function(repo) {
          return GitUnstageFiles(repo);
        });
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:stage-hunk', function() {
        return git.getRepo().then(function(repo) {
          return GitStageHunk(repo);
        });
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:stash-save', function() {
        return git.getRepo().then(function(repo) {
          return GitStashSave(repo);
        });
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:stash-save-message', function() {
        return git.getRepo().then(function(repo) {
          return GitStashSaveMessage(repo);
        });
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:stash-pop', function() {
        return git.getRepo().then(function(repo) {
          return GitStashPop(repo);
        });
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:stash-apply', function() {
        return git.getRepo().then(function(repo) {
          return GitStashApply(repo);
        });
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:stash-delete', function() {
        return git.getRepo().then(function(repo) {
          return GitStashDrop(repo);
        });
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:status', function() {
        return git.getRepo().then(function(repo) {
          return GitStatus(repo);
        });
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:tags', function() {
        return git.getRepo().then(function(repo) {
          return GitTags(repo);
        });
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:run', function() {
        return git.getRepo().then(function(repo) {
          return new GitRun(repo);
        });
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:merge', function() {
        return git.getRepo().then(function(repo) {
          return GitMerge(repo);
        });
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:merge-remote', function() {
        return git.getRepo().then(function(repo) {
          return GitMerge(repo, {
            remote: true
          });
        });
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:rebase', function() {
        return git.getRepo().then(function(repo) {
          return GitRebase(repo);
        });
      }));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'git-plus:git-open-changed-files', function() {
        return git.getRepo().then(function(repo) {
          return GitOpenChangedFiles(repo);
        });
      }));
      return this.subscriptions.add(atom.config.observe('git-plus.syntaxHighlighting', function(value) {
        atom.grammars.removeGrammarForScopeName('diff');
        if (value) {
          return atom.grammars.addGrammar(diffGrammar);
        } else {
          return atom.grammars.loadGrammarSync(baseGrammar);
        }
      }));
    },
    deactivate: function() {
      var _ref;
      this.subscriptions.dispose();
      if ((_ref = this.statusBarTile) != null) {
        _ref.destroy();
      }
      return delete this.statusBarTile;
    },
    consumeStatusBar: function(statusBar) {
      this.setupBranchesMenuToggle(statusBar);
      return this.setupOutputViewToggle(statusBar);
    },
    setupOutputViewToggle: function(statusBar) {
      var div, icon, link;
      div = document.createElement('div');
      div.classList.add('inline-block');
      icon = document.createElement('span');
      icon.classList.add('icon', 'icon-pin');
      link = document.createElement('a');
      link.appendChild(icon);
      link.onclick = function(e) {
        return OutputViewManager.getView().toggle();
      };
      atom.tooltips.add(div, {
        title: "Toggle Git-Plus Output Console"
      });
      div.appendChild(link);
      return this.statusBarTile = statusBar.addRightTile({
        item: div,
        priority: 0
      });
    },
    setupBranchesMenuToggle: function(statusBar) {
      return statusBar.getRightTiles().some((function(_this) {
        return function(_arg) {
          var item, _ref;
          item = _arg.item;
          if (item != null ? (_ref = item.classList) != null ? typeof _ref.contains === "function" ? _ref.contains('git-view') : void 0 : void 0 : void 0) {
            $(item).find('.git-branch').on('click', function(e) {
              return atom.commands.dispatch(document.querySelector('atom-workspace'), 'git-plus:checkout');
            });
            return true;
          }
        };
      })(this));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvZ2l0LXBsdXMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtpQkFBQTs7QUFBQSxFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUixFQUF2QixtQkFBRCxDQUFBOztBQUFBLEVBQ0MsSUFBSyxPQUFBLENBQVEsc0JBQVIsRUFBTCxDQURELENBQUE7O0FBQUEsRUFFQSxHQUFBLEdBQU0sT0FBQSxDQUFRLE9BQVIsQ0FGTixDQUFBOztBQUFBLEVBR0EsaUJBQUEsR0FBeUIsT0FBQSxDQUFRLHVCQUFSLENBSHpCLENBQUE7O0FBQUEsRUFJQSxjQUFBLEdBQXlCLE9BQUEsQ0FBUSwwQkFBUixDQUp6QixDQUFBOztBQUFBLEVBS0EsTUFBQSxHQUF5QixPQUFBLENBQVEsa0JBQVIsQ0FMekIsQ0FBQTs7QUFBQSxFQU1BLFNBQUEsR0FBeUIsT0FBQSxDQUFRLHFCQUFSLENBTnpCLENBQUE7O0FBQUEsRUFPQSxvQkFBQSxHQUF5QixPQUFBLENBQVEseUNBQVIsQ0FQekIsQ0FBQTs7QUFBQSxFQVFBLHFCQUFBLEdBQXlCLE9BQUEsQ0FBUSwwQ0FBUixDQVJ6QixDQUFBOztBQUFBLEVBU0EsbUJBQUEsR0FBeUIsT0FBQSxDQUFRLGlDQUFSLENBVHpCLENBQUE7O0FBQUEsRUFVQSxzQkFBQSxHQUF5QixPQUFBLENBQVEsb0NBQVIsQ0FWekIsQ0FBQTs7QUFBQSxFQVdBLGFBQUEsR0FBeUIsT0FBQSxDQUFRLDBCQUFSLENBWHpCLENBQUE7O0FBQUEsRUFZQSxTQUFBLEdBQXlCLE9BQUEsQ0FBUSxxQkFBUixDQVp6QixDQUFBOztBQUFBLEVBYUEsY0FBQSxHQUF5QixPQUFBLENBQVEsMkJBQVIsQ0FiekIsQ0FBQTs7QUFBQSxFQWNBLE9BQUEsR0FBeUIsT0FB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

//# sourceURL=/home/takaaki/.atom/packages/git-plus/lib/git-plus.coffee
