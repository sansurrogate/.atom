(function() {
  var getCommands, git;

  git = require('./git');

  getCommands = function() {
    var GitBranch, GitCheckoutAllFiles, GitCheckoutCurrentFile, GitCherryPick, GitCommit, GitCommitAmend, GitDeleteLocalBranch, GitDeleteRemoteBranch, GitDiff, GitDiffAll, GitDifftool, GitFetch, GitFetchPrune, GitInit, GitLog, GitMerge, GitOpenChangedFiles, GitPull, GitPush, GitRebase, GitRemove, GitRun, GitShow, GitStageFiles, GitStageHunk, GitStashApply, GitStashDrop, GitStashPop, GitStashSave, GitStashSaveMessage, GitStatus, GitTags, GitUnstageFiles;
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
    return git.getRepo().then(function(repo) {
      var commands, currentFile, ref;
      currentFile = repo.relativize((ref = atom.workspace.getActiveTextEditor()) != null ? ref.getPath() : void 0);
      git.refresh(repo);
      commands = [];
      commands.push([
        'git-plus:add', 'Add', function() {
          return git.add(repo, {
            file: currentFile
          });
        }
      ]);
      commands.push([
        'git-plus:add-modified', 'Add Modified', function() {
          return git.add(repo, {
            update: true
          });
        }
      ]);
      commands.push([
        'git-plus:add-all', 'Add All', function() {
          return git.add(repo);
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
        'git-plus:add-and-commit-and-push', 'Add And Commit And Push', function() {
          return git.add(repo, {
            file: currentFile
          }).then(function() {
            return GitCommit(repo, {
              andPush: true
            });
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
        'git-plus:commit-all-and-push', 'Commit All And Push', function() {
          return GitCommit(repo, {
            stageChanges: true,
            andPush: true
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
        'git-plus:push-set-upstream', 'Push -u', function() {
          return GitPush(repo, {
            setUpstream: true
          });
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
        'git-plus:merge-no-fast-forward', 'Merge without fast-forward', function() {
          return GitMerge(repo, {
            no_fast_forward: true
          });
        }
      ]);
      commands.push([
        'git-plus:rebase', 'Rebase', function() {
          return GitRebase(repo);
        }
      ]);
      commands.push([
        'git-plus:git-open-changed-files', 'Open Changed Files', function() {
          return GitOpenChangedFiles(repo);
        }
      ]);
      return commands;
    });
  };

  module.exports = getCommands;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvZ2l0LXBsdXMtY29tbWFuZHMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLE9BQVI7O0VBRU4sV0FBQSxHQUFjLFNBQUE7QUFDWixRQUFBO0lBQUEsU0FBQSxHQUF5QixPQUFBLENBQVEscUJBQVI7SUFDekIsb0JBQUEsR0FBeUIsT0FBQSxDQUFRLHlDQUFSO0lBQ3pCLHFCQUFBLEdBQXlCLE9BQUEsQ0FBUSwwQ0FBUjtJQUN6QixtQkFBQSxHQUF5QixPQUFBLENBQVEsaUNBQVI7SUFDekIsc0JBQUEsR0FBeUIsT0FBQSxDQUFRLG9DQUFSO0lBQ3pCLGFBQUEsR0FBeUIsT0FBQSxDQUFRLDBCQUFSO0lBQ3pCLFNBQUEsR0FBeUIsT0FBQSxDQUFRLHFCQUFSO0lBQ3pCLGNBQUEsR0FBeUIsT0FBQSxDQUFRLDJCQUFSO0lBQ3pCLE9BQUEsR0FBeUIsT0FBQSxDQUFRLG1CQUFSO0lBQ3pCLFdBQUEsR0FBeUIsT0FBQSxDQUFRLHVCQUFSO0lBQ3pCLFVBQUEsR0FBeUIsT0FBQSxDQUFRLHVCQUFSO0lBQ3pCLFFBQUEsR0FBeUIsT0FBQSxDQUFRLG9CQUFSO0lBQ3pCLGFBQUEsR0FBeUIsT0FBQSxDQUFRLGlDQUFSO0lBQ3pCLE9BQUEsR0FBeUIsT0FBQSxDQUFRLG1CQUFSO0lBQ3pCLE1BQUEsR0FBeUIsT0FBQSxDQUFRLGtCQUFSO0lBQ3pCLE9BQUEsR0FBeUIsT0FBQSxDQUFRLG1CQUFSO0lBQ3pCLE9BQUEsR0FBeUIsT0FBQSxDQUFRLG1CQUFSO0lBQ3pCLFNBQUEsR0FBeUIsT0FBQSxDQUFRLHFCQUFSO0lBQ3pCLE9BQUEsR0FBeUIsT0FBQSxDQUFRLG1CQUFSO0lBQ3pCLGFBQUEsR0FBeUIsT0FBQSxDQUFRLDBCQUFSO0lBQ3pCLFlBQUEsR0FBeUIs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Q0FBQyxPQUFQLEdBQWlCO0FBL0ZqQiIsInNvdXJjZXNDb250ZW50IjpbImdpdCA9IHJlcXVpcmUgJy4vZ2l0J1xuXG5nZXRDb21tYW5kcyA9IC0+XG4gIEdpdEJyYW5jaCAgICAgICAgICAgICAgPSByZXF1aXJlICcuL21vZGVscy9naXQtYnJhbmNoJ1xuICBHaXREZWxldGVMb2NhbEJyYW5jaCAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LWRlbGV0ZS1sb2NhbC1icmFuY2guY29mZmVlJ1xuICBHaXREZWxldGVSZW1vdGVCcmFuY2ggID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LWRlbGV0ZS1yZW1vdGUtYnJhbmNoLmNvZmZlZSdcbiAgR2l0Q2hlY2tvdXRBbGxGaWxlcyAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL2dpdC1jaGVja291dC1hbGwtZmlsZXMnXG4gIEdpdENoZWNrb3V0Q3VycmVudEZpbGUgPSByZXF1aXJlICcuL21vZGVscy9naXQtY2hlY2tvdXQtY3VycmVudC1maWxlJ1xuICBHaXRDaGVycnlQaWNrICAgICAgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LWNoZXJyeS1waWNrJ1xuICBHaXRDb21taXQgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LWNvbW1pdCdcbiAgR2l0Q29tbWl0QW1lbmQgICAgICAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL2dpdC1jb21taXQtYW1lbmQnXG4gIEdpdERpZmYgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuL21vZGVscy9naXQtZGlmZidcbiAgR2l0RGlmZnRvb2wgICAgICAgICAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL2dpdC1kaWZmdG9vbCdcbiAgR2l0RGlmZkFsbCAgICAgICAgICAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL2dpdC1kaWZmLWFsbCdcbiAgR2l0RmV0Y2ggICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL2dpdC1mZXRjaCdcbiAgR2l0RmV0Y2hQcnVuZSAgICAgICAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL2dpdC1mZXRjaC1wcnVuZS5jb2ZmZWUnXG4gIEdpdEluaXQgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuL21vZGVscy9naXQtaW5pdCdcbiAgR2l0TG9nICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL2dpdC1sb2cnXG4gIEdpdFB1bGwgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuL21vZGVscy9naXQtcHVsbCdcbiAgR2l0UHVzaCAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL2dpdC1wdXNoJ1xuICBHaXRSZW1vdmUgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LXJlbW92ZSdcbiAgR2l0U2hvdyAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL2dpdC1zaG93J1xuICBHaXRTdGFnZUZpbGVzICAgICAgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LXN0YWdlLWZpbGVzJ1xuICBHaXRTdGFnZUh1bmsgICAgICAgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LXN0YWdlLWh1bmsnXG4gIEdpdFN0YXNoQXBwbHkgICAgICAgICAgPSByZXF1aXJlICcuL21vZGVscy9naXQtc3Rhc2gtYXBwbHknXG4gIEdpdFN0YXNoRHJvcCAgICAgICAgICAgPSByZXF1aXJlICcuL21vZGVscy9naXQtc3Rhc2gtZHJvcCdcbiAgR2l0U3Rhc2hQb3AgICAgICAgICAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL2dpdC1zdGFzaC1wb3AnXG4gIEdpdFN0YXNoU2F2ZSAgICAgICAgICAgPSByZXF1aXJlICcuL21vZGVscy9naXQtc3Rhc2gtc2F2ZSdcbiAgR2l0U3Rhc2hTYXZlTWVzc2FnZSAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL2dpdC1zdGFzaC1zYXZlLW1lc3NhZ2UnXG4gIEdpdFN0YXR1cyAgICAgICAgICAgICAgPSByZXF1aXJlICcuL21vZGVscy9naXQtc3RhdHVzJ1xuICBHaXRUYWdzICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LXRhZ3MnXG4gIEdpdFVuc3RhZ2VGaWxlcyAgICAgICAgPSByZXF1aXJlICcuL21vZGVscy9naXQtdW5zdGFnZS1maWxlcydcbiAgR2l0UnVuICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL2dpdC1ydW4nXG4gIEdpdE1lcmdlICAgICAgICAgICAgICAgPSByZXF1aXJlICcuL21vZGVscy9naXQtbWVyZ2UnXG4gIEdpdFJlYmFzZSAgICAgICAgICAgICAgPSByZXF1aXJlICcuL21vZGVscy9naXQtcmViYXNlJ1xuICBHaXRPcGVuQ2hhbmdlZEZpbGVzICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LW9wZW4tY2hhbmdlZC1maWxlcydcblxuICBnaXQuZ2V0UmVwbygpXG4gICAgLnRoZW4gKHJlcG8pIC0+XG4gICAgICBjdXJyZW50RmlsZSA9IHJlcG8ucmVsYXRpdml6ZShhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk/LmdldFBhdGgoKSlcbiAgICAgIGdpdC5yZWZyZXNoIHJlcG9cbiAgICAgIGNvbW1hbmRzID0gW11cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czphZGQnLCAnQWRkJywgLT4gZ2l0LmFkZChyZXBvLCBmaWxlOiBjdXJyZW50RmlsZSldXG4gICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6YWRkLW1vZGlmaWVkJywgJ0FkZCBNb2RpZmllZCcsIC0+IGdpdC5hZGQocmVwbywgdXBkYXRlOiB0cnVlKV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czphZGQtYWxsJywgJ0FkZCBBbGwnLCAtPiBnaXQuYWRkKHJlcG8pXVxuICAgICAgY29tbWFuZHMucHVzaCBbJ2dpdC1wbHVzOmxvZycsICdMb2cnLCAtPiBHaXRMb2cocmVwbyldXG4gICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6bG9nLWN1cnJlbnQtZmlsZScsICdMb2cgQ3VycmVudCBGaWxlJywgLT4gR2l0TG9nKHJlcG8sIG9ubHlDdXJyZW50RmlsZTogdHJ1ZSldXG4gICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6cmVtb3ZlLWN1cnJlbnQtZmlsZScsICdSZW1vdmUgQ3VycmVudCBGaWxlJywgLT4gR2l0UmVtb3ZlKHJlcG8pXVxuICAgICAgY29tbWFuZHMucHVzaCBbJ2dpdC1wbHVzOmNoZWNrb3V0LWFsbC1maWxlcycsICdDaGVja291dCBBbGwgRmlsZXMnLCAtPiBHaXRDaGVja291dEFsbEZpbGVzKHJlcG8pXVxuICAgICAgY29tbWFuZHMucHVzaCBbJ2dpdC1wbHVzOmNoZWNrb3V0LWN1cnJlbnQtZmlsZScsICdDaGVja291dCBDdXJyZW50IEZpbGUnLCAtPiBHaXRDaGVja291dEN1cnJlbnRGaWxlKHJlcG8pXVxuICAgICAgY29tbWFuZHMucHVzaCBbJ2dpdC1wbHVzOmNvbW1pdCcsICdDb21taXQnLCAtPiBHaXRDb21taXQocmVwbyldXG4gICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6Y29tbWl0LWFsbCcsICdDb21taXQgQWxsJywgLT4gR2l0Q29tbWl0KHJlcG8sIHN0YWdlQ2hhbmdlczogdHJ1ZSldXG4gICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6Y29tbWl0LWFtZW5kJywgJ0NvbW1pdCBBbWVuZCcsIC0+IEdpdENvbW1pdEFtZW5kKHJlcG8pXVxuICAgICAgY29tbWFuZHMucHVzaCBbJ2dpdC1wbHVzOmFkZC1hbmQtY29tbWl0JywgJ0FkZCBBbmQgQ29tbWl0JywgLT4gZ2l0LmFkZChyZXBvLCBmaWxlOiBjdXJyZW50RmlsZSkudGhlbiAtPiBHaXRDb21taXQocmVwbyldXG4gICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6YWRkLWFuZC1jb21taXQtYW5kLXB1c2gnLCAnQWRkIEFuZCBDb21taXQgQW5kIFB1c2gnLCAtPiBnaXQuYWRkKHJlcG8sIGZpbGU6IGN1cnJlbnRGaWxlKS50aGVuIC0+IEdpdENvbW1pdChyZXBvLCBhbmRQdXNoOiB0cnVlKV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czphZGQtYWxsLWFuZC1jb21taXQnLCAnQWRkIEFsbCBBbmQgQ29tbWl0JywgLT4gZ2l0LmFkZChyZXBvKS50aGVuIC0+IEdpdENvbW1pdChyZXBvKV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czphZGQtYWxsLWNvbW1pdC1hbmQtcHVzaCcsICdBZGQgQWxsLCBDb21taXQgQW5kIFB1c2gnLCAtPiBnaXQuYWRkKHJlcG8pLnRoZW4gLT4gR2l0Q29tbWl0KHJlcG8sIGFuZFB1c2g6IHRydWUpXVxuICAgICAgY29tbWFuZHMucHVzaCBbJ2dpdC1wbHVzOmNvbW1pdC1hbGwtYW5kLXB1c2gnLCAnQ29tbWl0IEFsbCBBbmQgUHVzaCcsIC0+IEdpdENvbW1pdChyZXBvLCBzdGFnZUNoYW5nZXM6IHRydWUsIGFuZFB1c2g6IHRydWUpXVxuICAgICAgY29tbWFuZHMucHVzaCBbJ2dpdC1wbHVzOmNoZWNrb3V0JywgJ0NoZWNrb3V0JywgLT4gR2l0QnJhbmNoLmdpdEJyYW5jaGVzKHJlcG8pXVxuICAgICAgY29tbWFuZHMucHVzaCBbJ2dpdC1wbHVzOmNoZWNrb3V0LXJlbW90ZScsICdDaGVja291dCBSZW1vdGUnLCAtPiBHaXRCcmFuY2guZ2l0UmVtb3RlQnJhbmNoZXMocmVwbyldXG4gICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6bmV3LWJyYW5jaCcsICdDaGVja291dCBOZXcgQnJhbmNoJywgLT4gR2l0QnJhbmNoLm5ld0JyYW5jaChyZXBvKV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czpkZWxldGUtbG9jYWwtYnJhbmNoJywgJ0RlbGV0ZSBMb2NhbCBCcmFuY2gnLCAtPiBHaXREZWxldGVMb2NhbEJyYW5jaChyZXBvKV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czpkZWxldGUtcmVtb3RlLWJyYW5jaCcsICdEZWxldGUgUmVtb3RlIEJyYW5jaCcsIC0+IEdpdERlbGV0ZVJlbW90ZUJyYW5jaChyZXBvKV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czpjaGVycnktcGljaycsICdDaGVycnktUGljaycsIC0+IEdpdENoZXJyeVBpY2socmVwbyldXG4gICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6ZGlmZicsICdEaWZmJywgLT4gR2l0RGlmZihyZXBvLCBmaWxlOiBjdXJyZW50RmlsZSldXG4gICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6ZGlmZnRvb2wnLCAnRGlmZnRvb2wnLCAtPiBHaXREaWZmdG9vbChyZXBvKV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czpkaWZmLWFsbCcsICdEaWZmIEFsbCcsIC0+IEdpdERpZmZBbGwocmVwbyldXG4gICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6ZmV0Y2gnLCAnRmV0Y2gnLCAtPiBHaXRGZXRjaChyZXBvKV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czpmZXRjaC1wcnVuZScsICdGZXRjaCBQcnVuZScsIC0+IEdpdEZldGNoUHJ1bmUocmVwbyldXG4gICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6cHVsbCcsICdQdWxsJywgLT4gR2l0UHVsbChyZXBvKV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czpwdWxsLXVzaW5nLXJlYmFzZScsICdQdWxsIFVzaW5nIFJlYmFzZScsIC0+IEdpdFB1bGwocmVwbywgcmViYXNlOiB0cnVlKV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czpwdXNoJywgJ1B1c2gnLCAtPiBHaXRQdXNoKHJlcG8pXVxuICAgICAgY29tbWFuZHMucHVzaCBbJ2dpdC1wbHVzOnB1c2gtc2V0LXVwc3RyZWFtJywgJ1B1c2ggLXUnLCAtPiBHaXRQdXNoKHJlcG8sIHNldFVwc3RyZWFtOiB0cnVlKV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czpyZW1vdmUnLCAnUmVtb3ZlJywgLT4gR2l0UmVtb3ZlKHJlcG8sIHNob3dTZWxlY3RvcjogdHJ1ZSldXG4gICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6cmVzZXQnLCAnUmVzZXQgSEVBRCcsIC0+IGdpdC5yZXNldChyZXBvKV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czpzaG93JywgJ1Nob3cnLCAtPiBHaXRTaG93KHJlcG8pXVxuICAgICAgY29tbWFuZHMucHVzaCBbJ2dpdC1wbHVzOnN0YWdlLWZpbGVzJywgJ1N0YWdlIEZpbGVzJywgLT4gR2l0U3RhZ2VGaWxlcyhyZXBvKV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czp1bnN0YWdlLWZpbGVzJywgJ1Vuc3RhZ2UgRmlsZXMnLCAtPiBHaXRVbnN0YWdlRmlsZXMocmVwbyldXG4gICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6c3RhZ2UtaHVuaycsICdTdGFnZSBIdW5rJywgLT4gR2l0U3RhZ2VIdW5rKHJlcG8pXVxuICAgICAgY29tbWFuZHMucHVzaCBbJ2dpdC1wbHVzOnN0YXNoLXNhdmUnLCAnU3Rhc2g6IFNhdmUgQ2hhbmdlcycsIC0+IEdpdFN0YXNoU2F2ZShyZXBvKV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czpzdGFzaC1zYXZlLW1lc3NhZ2UnLCAnU3Rhc2g6IFNhdmUgQ2hhbmdlcyBXaXRoIE1lc3NhZ2UnLCAtPiBHaXRTdGFzaFNhdmVNZXNzYWdlKHJlcG8pXVxuICAgICAgY29tbWFuZHMucHVzaCBbJ2dpdC1wbHVzOnN0YXNoLXBvcCcsICdTdGFzaDogQXBwbHkgKFBvcCknLCAtPiBHaXRTdGFzaFBvcChyZXBvKV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czpzdGFzaC1hcHBseScsICdTdGFzaDogQXBwbHkgKEtlZXApJywgLT4gR2l0U3Rhc2hBcHBseShyZXBvKV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czpzdGFzaC1kZWxldGUnLCAnU3Rhc2g6IERlbGV0ZSAoRHJvcCknLCAtPiBHaXRTdGFzaERyb3AocmVwbyldXG4gICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6c3RhdHVzJywgJ1N0YXR1cycsIC0+IEdpdFN0YXR1cyhyZXBvKV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czp0YWdzJywgJ1RhZ3MnLCAtPiBHaXRUYWdzKHJlcG8pXVxuICAgICAgY29tbWFuZHMucHVzaCBbJ2dpdC1wbHVzOnJ1bicsICdSdW4nLCAtPiBuZXcgR2l0UnVuKHJlcG8pXVxuICAgICAgY29tbWFuZHMucHVzaCBbJ2dpdC1wbHVzOm1lcmdlJywgJ01lcmdlJywgLT4gR2l0TWVyZ2UocmVwbyldXG4gICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6bWVyZ2UtcmVtb3RlJywgJ01lcmdlIFJlbW90ZScsIC0+IEdpdE1lcmdlKHJlcG8sIHJlbW90ZTogdHJ1ZSldXG4gICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6bWVyZ2Utbm8tZmFzdC1mb3J3YXJkJywgJ01lcmdlIHdpdGhvdXQgZmFzdC1mb3J3YXJkJywgLT4gR2l0TWVyZ2UocmVwbywgbm9fZmFzdF9mb3J3YXJkOiB0cnVlKV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czpyZWJhc2UnLCAnUmViYXNlJywgLT4gR2l0UmViYXNlKHJlcG8pXVxuICAgICAgY29tbWFuZHMucHVzaCBbJ2dpdC1wbHVzOmdpdC1vcGVuLWNoYW5nZWQtZmlsZXMnLCAnT3BlbiBDaGFuZ2VkIEZpbGVzJywgLT4gR2l0T3BlbkNoYW5nZWRGaWxlcyhyZXBvKV1cblxuICAgICAgcmV0dXJuIGNvbW1hbmRzXG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0Q29tbWFuZHNcbiJdfQ==
