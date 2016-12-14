(function() {
  var getCommands, git;

  git = require('./git');

  getCommands = function() {
    var GitAdd, GitBranch, GitCheckoutAllFiles, GitCheckoutCurrentFile, GitCherryPick, GitCommit, GitCommitAmend, GitDeleteLocalBranch, GitDeleteRemoteBranch, GitDiff, GitDiffAll, GitDifftool, GitFetch, GitFetchPrune, GitInit, GitLog, GitMerge, GitPull, GitPush, GitRebase, GitRemove, GitRun, GitShow, GitStageFiles, GitStageHunk, GitStashApply, GitStashDrop, GitStashPop, GitStashSave, GitStashSaveMessage, GitStatus, GitTags, GitUnstageFiles;
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
    return git.getRepo().then(function(repo) {
      var commands, currentFile, _ref;
      currentFile = repo.relativize((_ref = atom.workspace.getActiveTextEditor()) != null ? _ref.getPath() : void 0);
      git.refresh();
      commands = [];
      commands.push([
        'git-plus:add', 'Add', function() {
          return GitAdd(repo);
        }
      ]);
      commands.push([
        'git-plus:add-all', 'Add All', function() {
          return GitAdd(repo, {
            addAll: true
          });
        }
      ]);
      commands.push([
        'git-plus:log', 'Log', function() {
          return GitLog(repo);
        }
      ]);
      commands.push([
        'git-plus:log-current-file', 'Log Current File', function() {
          return GitLog(repo, {
            onlyCurrentFile: true
          });
        }
      ]);
      commands.push([
        'git-plus:remove-current-file', 'Remove Current File', function() {
          return GitRemove(repo);
        }
      ]);
      commands.push([
        'git-plus:checkout-all-files', 'Checkout All Files', function() {
          return GitCheckoutAllFiles(repo);
        }
      ]);
      commands.push([
        'git-plus:checkout-current-file', 'Checkout Current File', function() {
          return GitCheckoutCurrentFile(repo);
        }
      ]);
      commands.push([
        'git-plus:commit', 'Commit', function() {
          return GitCommit(repo);
        }
      ]);
      commands.push([
        'git-plus:commit-all', 'Commit All', function() {
          return GitCommit(repo, {
            stageChanges: true
          });
        }
      ]);
      commands.push([
        'git-plus:commit-amend', 'Commit Amend', function() {
          return GitCommitAmend(repo);
        }
      ]);
      commands.push([
        'git-plus:add-and-commit', 'Add And Commit', function() {
          return git.add(repo, {
            file: currentFile
          }).then(function() {
            return GitCommit(repo);
          });
        }
      ]);
      commands.push([
        'git-plus:add-all-and-commit', 'Add All And Commit', function() {
          return git.add(repo).then(function() {
            return GitCommit(repo);
          });
        }
      ]);
      commands.push([
        'git-plus:add-all-commit-and-push', 'Add All, Commit And Push', function() {
          return git.add(repo).then(function() {
            return GitCommit(repo, {
              andPush: true
            });
          });
        }
      ]);
      commands.push([
        'git-plus:checkout', 'Checkout', function() {
          return GitBranch.gitBranches(repo);
        }
      ]);
      commands.push([
        'git-plus:checkout-remote', 'Checkout Remote', function() {
          return GitBranch.gitRemoteBranches(repo);
        }
      ]);
      commands.push([
        'git-plus:new-branch', 'Checkout New Branch', function() {
          return GitBranch.newBranch(repo);
        }
      ]);
      commands.push([
        'git-plus:delete-local-branch', 'Delete Local Branch', function() {
          return GitDeleteLocalBranch(repo);
        }
      ]);
      commands.push([
        'git-plus:delete-remote-branch', 'Delete Remote Branch', function() {
          return GitDeleteRemoteBranch(repo);
        }
      ]);
      commands.push([
        'git-plus:cherry-pick', 'Cherry-Pick', function() {
          return GitCherryPick(repo);
        }
      ]);
      commands.push([
        'git-plus:diff', 'Diff', function() {
          return GitDiff(repo, {
            file: currentFile
          });
        }
      ]);
      commands.push([
        'git-plus:difftool', 'Difftool', function() {
          return GitDifftool(repo);
        }
      ]);
      commands.push([
        'git-plus:diff-all', 'Diff All', function() {
          return GitDiffAll(repo);
        }
      ]);
      commands.push([
        'git-plus:fetch', 'Fetch', function() {
          return GitFetch(repo);
        }
      ]);
      commands.push([
        'git-plus:fetch-prune', 'Fetch Prune', function() {
          return GitFetchPrune(repo);
        }
      ]);
      commands.push([
        'git-plus:pull', 'Pull', function() {
          return GitPull(repo);
        }
      ]);
      commands.push([
        'git-plus:pull-using-rebase', 'Pull Using Rebase', function() {
          return GitPull(repo, {
            rebase: true
          });
        }
      ]);
      commands.push([
        'git-plus:push', 'Push', function() {
          return GitPush(repo);
        }
      ]);
      commands.push([
        'git-plus:remove', 'Remove', function() {
          return GitRemove(repo, {
            showSelector: true
          });
        }
      ]);
      commands.push([
        'git-plus:reset', 'Reset HEAD', function() {
          return git.reset(repo);
        }
      ]);
      commands.push([
        'git-plus:show', 'Show', function() {
          return GitShow(repo);
        }
      ]);
      commands.push([
        'git-plus:stage-files', 'Stage Files', function() {
          return GitStageFiles(repo);
        }
      ]);
      commands.push([
        'git-plus:unstage-files', 'Unstage Files', function() {
          return GitUnstageFiles(repo);
        }
      ]);
      commands.push([
        'git-plus:stage-hunk', 'Stage Hunk', function() {
          return GitStageHunk(repo);
        }
      ]);
      commands.push([
        'git-plus:stash-save', 'Stash: Save Changes', function() {
          return GitStashSave(repo);
        }
      ]);
      commands.push([
        'git-plus:stash-save-message', 'Stash: Save Changes With Message', function() {
          return GitStashSaveMessage(repo);
        }
      ]);
      commands.push([
        'git-plus:stash-pop', 'Stash: Apply (Pop)', function() {
          return GitStashPop(repo);
        }
      ]);
      commands.push([
        'git-plus:stash-apply', 'Stash: Apply (Keep)', function() {
          return GitStashApply(repo);
        }
      ]);
      commands.push([
        'git-plus:stash-delete', 'Stash: Delete (Drop)', function() {
          return GitStashDrop(repo);
        }
      ]);
      commands.push([
        'git-plus:status', 'Status', function() {
          return GitStatus(repo);
        }
      ]);
      commands.push([
        'git-plus:tags', 'Tags', function() {
          return GitTags(repo);
        }
      ]);
      commands.push([
        'git-plus:run', 'Run', function() {
          return new GitRun(repo);
        }
      ]);
      commands.push([
        'git-plus:merge', 'Merge', function() {
          return GitMerge(repo);
        }
      ]);
      commands.push([
        'git-plus:merge-remote', 'Merge Remote', function() {
          return GitMerge(repo, {
            remote: true
          });
        }
      ]);
      commands.push([
        'git-plus:rebase', 'Rebase', function() {
          return GitRebase(repo);
        }
      ]);
      return commands;
    });
  };

  module.exports = getCommands;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvZ2l0LXBsdXMtY29tbWFuZHMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGdCQUFBOztBQUFBLEVBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxPQUFSLENBQU4sQ0FBQTs7QUFBQSxFQUVBLFdBQUEsR0FBYyxTQUFBLEdBQUE7QUFDWixRQUFBLG1iQUFBO0FBQUEsSUFBQSxNQUFBLEdBQXlCLE9BQUEsQ0FBUSxrQkFBUixDQUF6QixDQUFBO0FBQUEsSUFDQSxTQUFBLEdBQXlCLE9BQUEsQ0FBUSxxQkFBUixDQUR6QixDQUFBO0FBQUEsSUFFQSxvQkFBQSxHQUF5QixPQUFBLENBQVEseUNBQVIsQ0FGekIsQ0FBQTtBQUFBLElBR0EscUJBQUEsR0FBeUIsT0FBQSxDQUFRLDBDQUFSLENBSHpCLENBQUE7QUFBQSxJQUlBLG1CQUFBLEdBQXlCLE9BQUEsQ0FBUSxpQ0FBUixDQUp6QixDQUFBO0FBQUEsSUFLQSxzQkFBQSxHQUF5QixPQUFBLENBQVEsb0NBQVIsQ0FMekIsQ0FBQTtBQUFBLElBTUEsYUFBQSxHQUF5QixPQUFBLENBQVEsMEJBQVIsQ0FOekIsQ0FBQTtBQUFBLElBT0EsU0FBQSxHQUF5QixPQUFBLENBQVEscUJBQVIsQ0FQekIsQ0FBQTtBQUFBLElBUUEsY0FBQSxHQUF5QixPQUFBLENBQVEsMkJBQVIsQ0FSekIsQ0FBQTtBQUFBLElBU0EsT0FBQSxHQUF5QixPQUFBLENBQVEsbUJBQVIsQ0FUekIsQ0FBQTtBQUFBLElBVUEsV0FBQSxHQUF5QixPQUFBLENBQVEsdUJBQVIsQ0FWekIsQ0FBQTtBQUFBLElBV0EsVUFBQSxHQUF5QixPQUFBLENBQVEsdUJBQVIsQ0FYekIsQ0FBQTtBQUFBLElBWUEsUUFBQSxHQUF5QixPQUFBLENBQVEs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

//# sourceURL=/home/takaaki/.atom/packages/git-plus/lib/git-plus-commands.coffee
