(function() {
  var CompositeDisposable, GitPull, GitPush, Path, cleanup, commit, destroyCommitEditor, disposables, fs, getStagedFiles, getTemplate, git, notifier, prepFile, showFile, trimFile, verboseCommitsEnabled;

  Path = require('path');

  CompositeDisposable = require('atom').CompositeDisposable;

  fs = require('fs-plus');

  git = require('../git');

  notifier = require('../notifier');

  GitPush = require('./git-push');

  GitPull = require('./git-pull');

  disposables = new CompositeDisposable;

  verboseCommitsEnabled = function() {
    return atom.config.get('git-plus.experimental') && atom.config.get('git-plus.verboseCommits');
  };

  getStagedFiles = function(repo) {
    return git.stagedFiles(repo).then(function(files) {
      if (files.length >= 1) {
        return git.cmd(['status'], {
          cwd: repo.getWorkingDirectory()
        });
      } else {
        return Promise.reject("Nothing to commit.");
      }
    });
  };

  getTemplate = function(cwd) {
    return git.getConfig('commit.template', cwd).then(function(filePath) {
      if (filePath) {
        return fs.readFileSync(fs.absolute(filePath.trim())).toString().trim();
      } else {
        return '';
      }
    });
  };

  prepFile = function(status, filePath, diff) {
    var cwd;
    if (diff == null) {
      diff = '';
    }
    cwd = Path.dirname(filePath);
    return git.getConfig('core.commentchar', cwd).then(function(commentchar) {
      commentchar = commentchar ? commentchar.trim() : '#';
      status = status.replace(/\s*\(.*\)\n/g, "\n");
      status = status.trim().replace(/\n/g, "\n" + commentchar + " ");
      return getTemplate(cwd).then(function(template) {
        var content;
        content = template + "\n" + commentchar + " Please enter the commit message for your changes. Lines starting\n" + commentchar + " with '" + commentchar + "' will be ignored, and an empty message aborts the commit.\n" + commentchar + "\n" + commentchar + " " + status;
        if (diff !== '') {
          content += "\n" + commentchar + "\n" + commentchar + " ------------------------ >8 ------------------------\n" + commentchar + " Do not touch the line above.\n" + commentchar + " Everything below will be removed.\n" + diff;
        }
        return fs.writeFileSync(filePath, content);
      });
    });
  };

  destroyCommitEditor = function() {
    var ref;
    return (ref = atom.workspace) != null ? ref.getPanes().some(function(pane) {
      return pane.getItems().some(function(paneItem) {
        var ref1;
        if (paneItem != null ? typeof paneItem.getURI === "function" ? (ref1 = paneItem.getURI()) != null ? ref1.includes('COMMIT_EDITMSG') : void 0 : void 0 : void 0) {
          if (pane.getItems().length === 1) {
            pane.destroy();
          } else {
            paneItem.destroy();
          }
          return true;
        }
      });
    }) : void 0;
  };

  trimFile = function(filePath) {
    var cwd;
    cwd = Path.dirname(filePath);
    return git.getConfig('core.commentchar', cwd).then(function(commentchar) {
      var content, startOfComments;
      commentchar = commentchar === '' ? '#' : void 0;
      content = fs.readFileSync(fs.absolute(filePath)).toString();
      startOfComments = content.indexOf(content.split('\n').find(function(line) {
        return line.startsWith(commentchar);
      }));
      content = content.substring(0, startOfComments);
      return fs.writeFileSync(filePath, content);
    });
  };

  commit = function(directory, filePath) {
    var promise;
    promise = null;
    if (verboseCommitsEnabled()) {
      promise = trimFile(filePath).then(function() {
        return git.cmd(['commit', "--file=" + filePath], {
          cwd: directory
        });
      });
    } else {
      promise = git.cmd(['commit', "--cleanup=strip", "--file=" + filePath], {
        cwd: directory
      });
    }
    return promise.then(function(data) {
      notifier.addSuccess(data);
      destroyCommitEditor();
      return git.refresh();
    })["catch"](function(data) {
      notifier.addError(data);
      return destroyCommitEditor();
    });
  };

  cleanup = function(currentPane, filePath) {
    if (currentPane.isAlive()) {
      currentPane.activate();
    }
    disposables.dispose();
    return fs.unlink(filePath);
  };

  showFile = function(filePath) {
    var splitDirection;
    if (atom.config.get('git-plus.openInPane')) {
      splitDirection = atom.config.get('git-plus.splitPane');
      atom.workspace.getActivePane()["split" + splitDirection]();
    }
    return atom.workspace.open(filePath);
  };

  module.exports = function(repo, arg) {
    var andPush, currentPane, filePath, init, ref, stageChanges, startCommit;
    ref = arg != null ? arg : {}, stageChanges = ref.stageChanges, andPush = ref.andPush;
    filePath = Path.join(repo.getPath(), 'COMMIT_EDITMSG');
    currentPane = atom.workspace.getActivePane();
    init = function() {
      return getStagedFiles(repo).then(function(status) {
        var args;
        if (verboseCommitsEnabled()) {
          args = ['diff', '--color=never', '--staged'];
          if (atom.config.get('git-plus.wordDiff')) {
            args.push('--word-diff');
          }
          return git.cmd(args, {
            cwd: repo.getWorkingDirectory()
          }).then(function(diff) {
            return prepFile(status, filePath, diff);
          });
        } else {
          return prepFile(status, filePath);
        }
      });
    };
    startCommit = function() {
      return showFile(filePath).then(function(textEditor) {
        disposables.add(textEditor.onDidSave(function() {
          return commit(repo.getWorkingDirectory(), filePath).then(function() {
            if (andPush) {
              return GitPush(repo);
            }
          });
        }));
        return disposables.add(textEditor.onDidDestroy(function() {
          return cleanup(currentPane, filePath);
        }));
      })["catch"](function(msg) {
        return notifier.addError(msg);
      });
    };
    if (stageChanges) {
      return git.add(repo, {
        update: stageChanges
      }).then(function() {
        return init();
      }).then(function() {
        return startCommit();
      });
    } else {
      return init().then(function() {
        return startCommit();
      })["catch"](function(message) {
        if (typeof message.includes === "function" ? message.includes('CRLF') : void 0) {
          return startCommit();
        } else {
          return notifier.addInfo(message);
        }
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvbW9kZWxzL2dpdC1jb21taXQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ04sc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUN4QixFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBQ0wsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUNOLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUjs7RUFDWCxPQUFBLEdBQVUsT0FBQSxDQUFRLFlBQVI7O0VBQ1YsT0FBQSxHQUFVLE9BQUEsQ0FBUSxZQUFSOztFQUVWLFdBQUEsR0FBYyxJQUFJOztFQUVsQixxQkFBQSxHQUF3QixTQUFBO1dBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHVCQUFoQixDQUFBLElBQTZDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix5QkFBaEI7RUFBaEQ7O0VBRXhCLGNBQUEsR0FBaUIsU0FBQyxJQUFEO1dBQ2YsR0FBRyxDQUFDLFdBQUosQ0FBZ0IsSUFBaEIsQ0FBcUIsQ0FBQyxJQUF0QixDQUEyQixTQUFDLEtBQUQ7TUFDekIsSUFBRyxLQUFLLENBQUMsTUFBTixJQUFnQixDQUFuQjtlQUNFLEdBQUcsQ0FBQyxHQUFKLENBQVEsQ0FBQyxRQUFELENBQVIsRUFBb0I7VUFBQSxHQUFBLEVBQUssSUFBSSxDQUFDLG1CQUFMLENBQUEsQ0FBTDtTQUFwQixFQURGO09BQUEsTUFBQTtlQUdFLE9BQU8sQ0FBQyxNQUFSLENBQWUsb0JBQWYsRUFIRjs7SUFEeUIsQ0FBM0I7RUFEZTs7RUFPakIsV0FBQSxHQUFjLFNBQUMsR0FBRDtXQUNaLEdBQUcsQ0FBQyxTQUFKLENBQWMsaUJBQWQsRUFBaUMsR0FBakMsQ0FBcUMsQ0FBQyxJQUF0QyxDQUEy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QTtpQkFHRSxRQUFRLENBQUMsT0FBVCxDQUFpQixPQUFqQixFQUhGOztNQURLLENBRFAsRUFIRjs7RUFwQmU7QUF6RmpCIiwic291cmNlc0NvbnRlbnQiOlsiUGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG57Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuZnMgPSByZXF1aXJlICdmcy1wbHVzJ1xuZ2l0ID0gcmVxdWlyZSAnLi4vZ2l0J1xubm90aWZpZXIgPSByZXF1aXJlICcuLi9ub3RpZmllcidcbkdpdFB1c2ggPSByZXF1aXJlICcuL2dpdC1wdXNoJ1xuR2l0UHVsbCA9IHJlcXVpcmUgJy4vZ2l0LXB1bGwnXG5cbmRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcblxudmVyYm9zZUNvbW1pdHNFbmFibGVkID0gLT4gYXRvbS5jb25maWcuZ2V0KCdnaXQtcGx1cy5leHBlcmltZW50YWwnKSBhbmQgYXRvbS5jb25maWcuZ2V0KCdnaXQtcGx1cy52ZXJib3NlQ29tbWl0cycpXG5cbmdldFN0YWdlZEZpbGVzID0gKHJlcG8pIC0+XG4gIGdpdC5zdGFnZWRGaWxlcyhyZXBvKS50aGVuIChmaWxlcykgLT5cbiAgICBpZiBmaWxlcy5sZW5ndGggPj0gMVxuICAgICAgZ2l0LmNtZChbJ3N0YXR1cyddLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpKVxuICAgIGVsc2VcbiAgICAgIFByb21pc2UucmVqZWN0IFwiTm90aGluZyB0byBjb21taXQuXCJcblxuZ2V0VGVtcGxhdGUgPSAoY3dkKSAtPlxuICBnaXQuZ2V0Q29uZmlnKCdjb21taXQudGVtcGxhdGUnLCBjd2QpLnRoZW4gKGZpbGVQYXRoKSAtPlxuICAgIGlmIGZpbGVQYXRoIHRoZW4gZnMucmVhZEZpbGVTeW5jKGZzLmFic29sdXRlKGZpbGVQYXRoLnRyaW0oKSkpLnRvU3RyaW5nKCkudHJpbSgpIGVsc2UgJydcblxucHJlcEZpbGUgPSAoc3RhdHVzLCBmaWxlUGF0aCwgZGlmZj0nJykgLT5cbiAgY3dkID0gUGF0aC5kaXJuYW1lKGZpbGVQYXRoKVxuICBnaXQuZ2V0Q29uZmlnKCdjb3JlLmNvbW1lbnRjaGFyJywgY3dkKS50aGVuIChjb21tZW50Y2hhcikgLT5cbiAgICBjb21tZW50Y2hhciA9IGlmIGNvbW1lbnRjaGFyIHRoZW4gY29tbWVudGNoYXIudHJpbSgpIGVsc2UgJyMnXG4gICAgc3RhdHVzID0gc3RhdHVzLnJlcGxhY2UoL1xccypcXCguKlxcKVxcbi9nLCBcIlxcblwiKVxuICAgIHN0YXR1cyA9IHN0YXR1cy50cmltKCkucmVwbGFjZSgvXFxuL2csIFwiXFxuI3tjb21tZW50Y2hhcn0gXCIpXG4gICAgZ2V0VGVtcGxhdGUoY3dkKS50aGVuICh0ZW1wbGF0ZSkgLT5cbiAgICAgIGNvbnRlbnQgPVxuICAgICAgICBcIlwiXCIje3RlbXBsYXRlfVxuICAgICAgICAje2NvbW1lbnRjaGFyfSBQbGVhc2UgZW50ZXIgdGhlIGNvbW1pdCBtZXNzYWdlIGZvciB5b3VyIGNoYW5nZXMuIExpbmVzIHN0YXJ0aW5nXG4gICAgICAgICN7Y29tbWVudGNoYXJ9IHdpdGggJyN7Y29tbWVudGNoYXJ9JyB3aWxsIGJlIGlnbm9yZWQsIGFuZCBhbiBlbXB0eSBtZXNzYWdlIGFib3J0cyB0aGUgY29tbWl0LlxuICAgICAgICAje2NvbW1lbnRjaGFyfVxuICAgICAgICAje2NvbW1lbnRjaGFyfSAje3N0YXR1c31cIlwiXCJcbiAgICAgIGlmIGRpZmYgaXNudCAnJ1xuICAgICAgICBjb250ZW50ICs9XG4gICAgICAgICAgXCJcIlwiXFxuI3tjb21tZW50Y2hhcn1cbiAgICAgICAgICAje2NvbW1lbnRjaGFyfSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gPjggLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICAgI3tjb21tZW50Y2hhcn0gRG8gbm90IHRvdWNoIHRoZSBsaW5lIGFib3ZlLlxuICAgICAgICAgICN7Y29tbWVudGNoYXJ9IEV2ZXJ5dGhpbmcgYmVsb3cgd2lsbCBiZSByZW1vdmVkLlxuICAgICAgICAgICN7ZGlmZn1cIlwiXCJcbiAgICAgIGZzLndyaXRlRmlsZVN5bmMgZmlsZVBhdGgsIGNvbnRlbnRcblxuZGVzdHJveUNvbW1pdEVkaXRvciA9IC0+XG4gIGF0b20ud29ya3NwYWNlPy5nZXRQYW5lcygpLnNvbWUgKHBhbmUpIC0+XG4gICAgcGFuZS5nZXRJdGVtcygpLnNvbWUgKHBhbmVJdGVtKSAtPlxuICAgICAgaWYgcGFuZUl0ZW0/LmdldFVSST8oKT8uaW5jbHVkZXMgJ0NPTU1JVF9FRElUTVNHJ1xuICAgICAgICBpZiBwYW5lLmdldEl0ZW1zKCkubGVuZ3RoIGlzIDFcbiAgICAgICAgICBwYW5lLmRlc3Ryb3koKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgcGFuZUl0ZW0uZGVzdHJveSgpXG4gICAgICAgIHJldHVybiB0cnVlXG5cbnRyaW1GaWxlID0gKGZpbGVQYXRoKSAtPlxuICBjd2QgPSBQYXRoLmRpcm5hbWUoZmlsZVBhdGgpXG4gIGdpdC5nZXRDb25maWcoJ2NvcmUuY29tbWVudGNoYXInLCBjd2QpLnRoZW4gKGNvbW1lbnRjaGFyKSAtPlxuICAgIGNvbW1lbnRjaGFyID0gaWYgY29tbWVudGNoYXIgaXMgJycgdGhlbiAnIydcbiAgICBjb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKGZzLmFic29sdXRlKGZpbGVQYXRoKSkudG9TdHJpbmcoKVxuICAgIHN0YXJ0T2ZDb21tZW50cyA9IGNvbnRlbnQuaW5kZXhPZihjb250ZW50LnNwbGl0KCdcXG4nKS5maW5kIChsaW5lKSAtPiBsaW5lLnN0YXJ0c1dpdGggY29tbWVudGNoYXIpXG4gICAgY29udGVudCA9IGNvbnRlbnQuc3Vic3RyaW5nKDAsIHN0YXJ0T2ZDb21tZW50cylcbiAgICBmcy53cml0ZUZpbGVTeW5jIGZpbGVQYXRoLCBjb250ZW50XG5cbmNvbW1pdCA9IChkaXJlY3RvcnksIGZpbGVQYXRoKSAtPlxuICBwcm9taXNlID0gbnVsbFxuICBpZiB2ZXJib3NlQ29tbWl0c0VuYWJsZWQoKVxuICAgIHByb21pc2UgPSB0cmltRmlsZShmaWxlUGF0aCkudGhlbiAtPiBnaXQuY21kKFsnY29tbWl0JywgXCItLWZpbGU9I3tmaWxlUGF0aH1cIl0sIGN3ZDogZGlyZWN0b3J5KVxuICBlbHNlXG4gICAgcHJvbWlzZSA9IGdpdC5jbWQoWydjb21taXQnLCBcIi0tY2xlYW51cD1zdHJpcFwiLCBcIi0tZmlsZT0je2ZpbGVQYXRofVwiXSwgY3dkOiBkaXJlY3RvcnkpXG4gIHByb21pc2UudGhlbiAoZGF0YSkgLT5cbiAgICBub3RpZmllci5hZGRTdWNjZXNzIGRhdGFcbiAgICBkZXN0cm95Q29tbWl0RWRpdG9yKClcbiAgICBnaXQucmVmcmVzaCgpXG4gIC5jYXRjaCAoZGF0YSkgLT5cbiAgICBub3RpZmllci5hZGRFcnJvciBkYXRhXG4gICAgZGVzdHJveUNvbW1pdEVkaXRvcigpXG5cbmNsZWFudXAgPSAoY3VycmVudFBhbmUsIGZpbGVQYXRoKSAtPlxuICBjdXJyZW50UGFuZS5hY3RpdmF0ZSgpIGlmIGN1cnJlbnRQYW5lLmlzQWxpdmUoKVxuICBkaXNwb3NhYmxlcy5kaXNwb3NlKClcbiAgZnMudW5saW5rIGZpbGVQYXRoXG5cbnNob3dGaWxlID0gKGZpbGVQYXRoKSAtPlxuICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2dpdC1wbHVzLm9wZW5JblBhbmUnKVxuICAgIHNwbGl0RGlyZWN0aW9uID0gYXRvbS5jb25maWcuZ2V0KCdnaXQtcGx1cy5zcGxpdFBhbmUnKVxuICAgIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKVtcInNwbGl0I3tzcGxpdERpcmVjdGlvbn1cIl0oKVxuICBhdG9tLndvcmtzcGFjZS5vcGVuIGZpbGVQYXRoXG5cbm1vZHVsZS5leHBvcnRzID0gKHJlcG8sIHtzdGFnZUNoYW5nZXMsIGFuZFB1c2h9PXt9KSAtPlxuICBmaWxlUGF0aCA9IFBhdGguam9pbihyZXBvLmdldFBhdGgoKSwgJ0NPTU1JVF9FRElUTVNHJylcbiAgY3VycmVudFBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcbiAgaW5pdCA9IC0+IGdldFN0YWdlZEZpbGVzKHJlcG8pLnRoZW4gKHN0YXR1cykgLT5cbiAgICBpZiB2ZXJib3NlQ29tbWl0c0VuYWJsZWQoKVxuICAgICAgYXJncyA9IFsnZGlmZicsICctLWNvbG9yPW5ldmVyJywgJy0tc3RhZ2VkJ11cbiAgICAgIGFyZ3MucHVzaCAnLS13b3JkLWRpZmYnIGlmIGF0b20uY29uZmlnLmdldCgnZ2l0LXBsdXMud29yZERpZmYnKVxuICAgICAgZ2l0LmNtZChhcmdzLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpKVxuICAgICAgLnRoZW4gKGRpZmYpIC0+IHByZXBGaWxlIHN0YXR1cywgZmlsZVBhdGgsIGRpZmZcbiAgICBlbHNlXG4gICAgICBwcmVwRmlsZSBzdGF0dXMsIGZpbGVQYXRoXG4gIHN0YXJ0Q29tbWl0ID0gLT5cbiAgICBzaG93RmlsZSBmaWxlUGF0aFxuICAgIC50aGVuICh0ZXh0RWRpdG9yKSAtPlxuICAgICAgZGlzcG9zYWJsZXMuYWRkIHRleHRFZGl0b3Iub25EaWRTYXZlIC0+XG4gICAgICAgIGNvbW1pdChyZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSwgZmlsZVBhdGgpXG4gICAgICAgIC50aGVuIC0+IEdpdFB1c2gocmVwbykgaWYgYW5kUHVzaFxuICAgICAgZGlzcG9zYWJsZXMuYWRkIHRleHRFZGl0b3Iub25EaWREZXN0cm95IC0+IGNsZWFudXAgY3VycmVudFBhbmUsIGZpbGVQYXRoXG4gICAgLmNhdGNoIChtc2cpIC0+IG5vdGlmaWVyLmFkZEVycm9yIG1zZ1xuXG4gIGlmIHN0YWdlQ2hhbmdlc1xuICAgIGdpdC5hZGQocmVwbywgdXBkYXRlOiBzdGFnZUNoYW5nZXMpLnRoZW4oLT4gaW5pdCgpKS50aGVuIC0+IHN0YXJ0Q29tbWl0KClcbiAgZWxzZVxuICAgIGluaXQoKS50aGVuIC0+IHN0YXJ0Q29tbWl0KClcbiAgICAuY2F0Y2ggKG1lc3NhZ2UpIC0+XG4gICAgICBpZiBtZXNzYWdlLmluY2x1ZGVzPygnQ1JMRicpXG4gICAgICAgIHN0YXJ0Q29tbWl0KClcbiAgICAgIGVsc2VcbiAgICAgICAgbm90aWZpZXIuYWRkSW5mbyBtZXNzYWdlXG4iXX0=
