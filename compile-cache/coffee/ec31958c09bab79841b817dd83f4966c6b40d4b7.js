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
        return git.cmd(['-c', 'color.ui=false', 'status'], {
          cwd: repo.getWorkingDirectory()
        });
      } else {
        return Promise.reject("Nothing to commit.");
      }
    });
  };

  getTemplate = function(filePath) {
    if (filePath) {
      return fs.readFileSync(fs.absolute(filePath.trim())).toString().trim();
    } else {
      return '';
    }
  };

  prepFile = function(arg) {
    var commentChar, content, cwd, diff, filePath, status, template;
    status = arg.status, filePath = arg.filePath, diff = arg.diff, commentChar = arg.commentChar, template = arg.template;
    cwd = Path.dirname(filePath);
    status = status.replace(/\s*\(.*\)\n/g, "\n");
    status = status.trim().replace(/\n/g, "\n" + commentChar + " ");
    content = template + "\n" + commentChar + " Please enter the commit message for your changes. Lines starting\n" + commentChar + " with '" + commentChar + "' will be ignored, and an empty message aborts the commit.\n" + commentChar + "\n" + commentChar + " " + status;
    if (diff) {
      content += "\n" + commentChar + "\n" + commentChar + " ------------------------ >8 ------------------------\n" + commentChar + " Do not touch the line above.\n" + commentChar + " Everything below will be removed.\n" + diff;
    }
    return fs.writeFileSync(filePath, content);
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

  trimFile = function(filePath, commentChar) {
    var content, cwd, startOfComments;
    cwd = Path.dirname(filePath);
    content = fs.readFileSync(fs.absolute(filePath)).toString();
    startOfComments = content.indexOf(content.split('\n').find(function(line) {
      return line.startsWith(commentChar);
    }));
    content = content.substring(0, startOfComments);
    return fs.writeFileSync(filePath, content);
  };

  commit = function(directory, filePath) {
    return git.cmd(['commit', "--cleanup=strip", "--file=" + filePath], {
      cwd: directory
    }).then(function(data) {
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
    var andPush, commentChar, currentPane, filePath, init, ref, ref1, stageChanges, startCommit, template;
    ref = arg != null ? arg : {}, stageChanges = ref.stageChanges, andPush = ref.andPush;
    filePath = Path.join(repo.getPath(), 'COMMIT_EDITMSG');
    currentPane = atom.workspace.getActivePane();
    commentChar = (ref1 = git.getConfig(repo, 'core.commentchar')) != null ? ref1 : '#';
    template = getTemplate(git.getConfig(repo, 'commit.template'));
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
            return prepFile({
              status: status,
              filePath: filePath,
              diff: diff,
              commentChar: commentChar,
              template: template
            });
          });
        } else {
          return prepFile({
            status: status,
            filePath: filePath,
            commentChar: commentChar,
            template: template
          });
        }
      });
    };
    startCommit = function() {
      return showFile(filePath).then(function(textEditor) {
        disposables.add(textEditor.onDidSave(function() {
          if (verboseCommitsEnabled()) {
            trimFile(filePath, commentChar);
          }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvbW9kZWxzL2dpdC1jb21taXQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ04sc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUN4QixFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBQ0wsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUNOLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUjs7RUFDWCxPQUFBLEdBQVUsT0FBQSxDQUFRLFlBQVI7O0VBQ1YsT0FBQSxHQUFVLE9BQUEsQ0FBUSxZQUFSOztFQUVWLFdBQUEsR0FBYyxJQUFJOztFQUVsQixxQkFBQSxHQUF3QixTQUFBO1dBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHVCQUFoQixDQUFBLElBQTZDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix5QkFBaEI7RUFBaEQ7O0VBRXhCLGNBQUEsR0FBaUIsU0FBQyxJQUFEO1dBQ2YsR0FBRyxDQUFDLFdBQUosQ0FBZ0IsSUFBaEIsQ0FBcUIsQ0FBQyxJQUF0QixDQUEyQixTQUFDLEtBQUQ7TUFDekIsSUFBRyxLQUFLLENBQUMsTUFBTixJQUFnQixDQUFuQjtlQUNFLEdBQUcsQ0FBQyxHQUFKLENBQVEsQ0FBQyxJQUFELEVBQU8sZ0JBQVAsRUFBeUIsUUFBekIsQ0FBUixFQUE0QztVQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFMO1NBQTVDLEVBREY7T0FBQSxNQUFBO2VBR0UsT0FBTyxDQUFDLE1BQVIsQ0FBZSxvQkFBZixFQUhGOztJQUR5QixDQUEzQjtFQURlOztFQU9qQixXQUFBLEdBQWMsU0FBQyxRQUFEO0lBQ1osSUFBRyxRQUFIO2FBQ0UsRUFBRSxDQUFDLFlBQUgsQ0FBZ0IsRUFBRSxDQUFDLFFBQUgsQ0FBWSxRQUFRLENBQUMsSUFBVCxDQUFBLENBQVosQ0FBaEIsQ0FBNkMsQ0FBQyxRQUE5QyxDQUFBLENBQXdELENBQUMsSUFBekQsQ0FBQSxFQURGO0tBQUEsTUFBQTthQUdFLEdBSEY7O0VBRFk7O0VBTWQsUUFBQSxHQUFXLFNBQUMsR0FBRDtBQUNULFFBQUE7SUFEVyxxQkFBUSx5QkFBVSxpQkFBTSwrQkFBYTtJQUNoRCxHQUFBLEdBQU0sSUFBSSxDQUFDLE9BQUwsQ0FBYSxRQUFiO0lBQ04sTUFBQSxHQUFTLE1BQU0sQ0FBQyxPQUFQLENBQWUsY0FBZixFQUErQixJQUEvQjtJQUNULE1BQUEsR0FBUyxNQUFNLENBQUMsSUFBUCxDQUFBLENBQWEsQ0FBQyxPQUFkLENBQXNCLEtBQXRCLEVBQTZCLElBQUEsR0FBSyxXQUFMLEdBQWlCLEdBQTlDO0lBQ1QsT0FBQSxHQUNPLFFBQUQsR0FBVSxJQUFWLEdBQ0YsV0FERSxHQUNVLHFFQURWLEdBRUYsV0FGRSxHQUVVLFNBRlYsR0FFbUIsV0FGbkIsR0FFK0IsOERBRi9CLEdBR0YsV0FIRSxHQUdVLElBSFYsR0FJRixXQUpFLEdBSVUsR0FKVixHQUlhO0lBQ25CLElBQUcsSUFBSDtNQUNFLE9BQUEsSUFDRSxJQUFBLEdBQU8sV0FBUCxHQUFtQixJQUFuQixHQUNFLFdBREYsR0FDYyx5REFEZCxHQUVFLFdBRkYsR0FFYyxpQ0FGZCxHQUdFLFdBSEYsR0FHYyxzQ0FIZCxHQUlFLEtBTk47O1dBT0EsRUFBRSxDQUFDLGFBQUgsQ0FBaUIsUUFBakIsRUFBMkIsT0FBM0I7RUFqQlM7O0VBbUJYLG1CQUFBLEdBQXNCLFNBQUE7QUFDcEIsUUFBQTsrQ0FBYyxDQUFFLFFBQWhCLENBQUEsQ0FBMEIsQ0FBQyxJQUEzQixDQUFnQyxTQUFDLElBQUQ7YUFDOUIsSUFBSSxDQUFDLFFBQUwsQ0FBQSxDQUFlLENBQUMsSUFBaEIsQ0FBcUIsU0FBQyxRQUFEO0FBQ25CLFlBQUE7UUFBQSx3R0FBc0IsQ0FBRSxRQUFyQixDQUE4QixnQkFBOUIsNEJBQUg7VUFDRSxJQUFHLElBQUksQ0FBQyxRQUFMLENBQUEsQ0FBZSxDQUFDLE1BQWhCLEtBQTBCLENBQTdCO1lBQ0UsSUFBSSxDQUFDLE9BQUwsQ0FBQSxFQURGO1dBQUEsTUFBQTtZQUdFLFFBQVEsQ0FBQyxPQUFULENBQUEsRUFIRjs7QUFJQSxpQkFBTyxLQUxUOztNQURtQixDQUFyQjtJQUQ4QixDQUFoQztFQURvQjs7RUFVdEIsUUFBQSxHQUFXLFNBQUMsUUFBRCxFQUFXLFdBQVg7QUFDVCxRQUFBO0lBQUEsR0FBQSxHQUFNLElBQUksQ0FBQyxPQUFMLENBQWEsUUFBYjtJQUNOLE9BQUEsR0FBVSxFQUFFLENBQUMsWUFBSCxDQUFnQixFQUFFLENBQUMsUUFBSCxDQUFZLFFBQVosQ0FBaEIsQ0FBc0MsQ0FBQyxRQUF2QyxDQUFBO0lBQ1YsZUFBQSxHQUFrQixPQUFPLENBQUMsT0FBUixDQUFnQixPQUFPLENBQUMsS0FBUixDQUFjLElBQWQsQ0FBbUIsQ0FBQyxJQUFwQixDQUF5QixTQUFDLElBQUQ7YUFBVSxJQUFJLENBQUMsVUFBTCxDQUFnQixXQUFoQjtJQUFWLENBQXpCLENBQWhCO0lBQ2xCLE9BQUEsR0FBVSxPQUFPLENBQUMsU0FBUixDQUFrQixDQUFsQixFQUFxQixlQUFyQjtXQUNWLEVBQUUsQ0FBQyxhQUFILENBQWlCLFFBQWpCLEVBQTJCLE9BQTNCO0VBTFM7O0VBT1gsTUFBQSxHQUFTLFNBQUMsU0FBRCxFQUFZLFFBQVo7V0FDUCxHQUFHLENBQUMsR0FBSixDQUFRLENBQUMsUUFBRCxFQUFXLGlCQUFYLEVBQThCLFNBQUEsR0FBVSxRQUF4QyxDQUFSLEVBQTZEO01BQUEsR0FBQSxFQUFLLFNBQUw7S0FBN0QsQ0FDQSxDQUFDLElBREQsQ0FDTSxTQUFDLElBQUQ7TUFDSixRQUFRLENBQUMsVUFBVCxDQUFvQixJQUFwQjtNQUNBLG1CQUFBLENBQUE7YUFDQSxHQUFHLENBQUMsT0FBSixDQUFBO0lBSEksQ0FETixDQUtBLEVBQUMsS0FBRCxFQUxBLENBS08sU0FBQyxJQUFEO01BQ0wsUUFBUSxDQUFDLFFBQVQsQ0FBa0IsSUFBbEI7YUFDQSxtQkFBQSxDQUFBO0lBRkssQ0FMUDtFQURPOztFQVVULE9BQUEsR0FBVSxTQUFDLFdBQUQsRUFBYyxRQUFkO0lBQ1IsSUFBMEIsV0FBVyxDQUFDLE9BQVosQ0FBQSxDQUExQjtNQUFBLFdBQVcsQ0FBQyxRQUFaLENBQUEsRUFBQTs7SUFDQSxXQUFXLENBQUMsT0FBWixDQUFBO1dBQ0EsRUFBRSxDQUFDLE1BQUgsQ0FBVSxRQUFWO0VBSFE7O0VBS1YsUUFBQSxHQUFXLFNBQUMsUUFBRDtBQUNULFFBQUE7SUFBQSxJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixxQkFBaEIsQ0FBSDtNQUNFLGNBQUEsR0FBaUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG9CQUFoQjtNQUNqQixJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBQSxDQUErQixDQUFBLE9BQUEsR0FBUSxjQUFSLENBQS9CLENBQUEsRUFGRjs7V0FHQSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsUUFBcEI7RUFKUzs7RUFNWCxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLElBQUQsRUFBTyxHQUFQO0FBQ2YsUUFBQTt3QkFEc0IsTUFBd0IsSUFBdkIsaUNBQWM7SUFDckMsUUFBQSxHQUFXLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBSSxDQUFDLE9BQUwsQ0FBQSxDQUFWLEVBQTBCLGdCQUExQjtJQUNYLFdBQUEsR0FBYyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBQTtJQUNkLFdBQUEscUVBQXdEO0lBQ3hELFFBQUEsR0FBVyxXQUFBLENBQVksR0FBRyxDQUFDLFNBQUosQ0FBYyxJQUFkLEVBQW9CLGlCQUFwQixDQUFaO0lBQ1gsSUFBQSxHQUFPLFNBQUE7YUFBRyxjQUFBLENBQWUsSUFBZixDQUFvQixDQUFDLElBQXJCLENBQTBCLFNBQUMsTUFBRDtBQUNsQyxZQUFBO1FBQUEsSUFBRyxxQkFBQSxDQUFBLENBQUg7VUFDRSxJQUFBLEdBQU8sQ0FBQyxNQUFELEVBQVMsZUFBVCxFQUEwQixVQUExQjtVQUNQLElBQTJCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixtQkFBaEIsQ0FBM0I7WUFBQSxJQUFJLENBQUMsSUFBTCxDQUFVLGFBQVYsRUFBQTs7aUJBQ0EsR0FBRyxDQUFDLEdBQUosQ0FBUSxJQUFSLEVBQWM7WUFBQSxHQUFBLEVBQUssSUFBSSxDQUFDLG1CQUFMLENBQUEsQ0FBTDtXQUFkLENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxJQUFEO21CQUFVLFFBQUEsQ0FBUztjQUFDLFFBQUEsTUFBRDtjQUFTLFVBQUEsUUFBVDtjQUFtQixNQUFBLElBQW5CO2NBQXlCLGFBQUEsV0FBekI7Y0FBc0MsVUFBQSxRQUF0QzthQUFUO1VBQVYsQ0FETixFQUhGO1NBQUEsTUFBQTtpQkFNRSxRQUFBLENBQVM7WUFBQyxRQUFBLE1BQUQ7WUFBUyxVQUFBLFFBQVQ7WUFBbUIsYUFBQSxXQUFuQjtZQUFnQyxVQUFBLFFBQWhDO1dBQVQsRUFORjs7TUFEa0MsQ0FBMUI7SUFBSDtJQVFQLFdBQUEsR0FBYyxTQUFBO2FBQ1osUUFBQSxDQUFTLFFBQVQsQ0FDQSxDQUFDLElBREQsQ0FDTSxTQUFDLFVBQUQ7UUFDSixXQUFXLENBQUMsR0FBWixDQUFnQixVQUFVLENBQUMsU0FBWCxDQUFxQixTQUFBO1VBQ25DLElBQW1DLHFCQUFBLENBQUEsQ0FBbkM7WUFBQSxRQUFBLENBQVMsUUFBVCxFQUFtQixXQUFuQixFQUFBOztpQkFDQSxNQUFBLENBQU8sSUFBSSxDQUFDLG1CQUFMLENBQUEsQ0FBUCxFQUFtQyxRQUFuQyxDQUNBLENBQUMsSUFERCxDQUNNLFNBQUE7WUFBRyxJQUFpQixPQUFqQjtxQkFBQSxPQUFBLENBQVEsSUFBUixFQUFBOztVQUFILENBRE47UUFGbUMsQ0FBckIsQ0FBaEI7ZUFJQSxXQUFXLENBQUMsR0FBWixDQUFnQixVQUFVLENBQUMsWUFBWCxDQUF3QixTQUFBO2lCQUFHLE9BQUEsQ0FBUSxXQUFSLEVBQXFCLFFBQXJCO1FBQUgsQ0FBeEIsQ0FBaEI7TUFMSSxDQUROLENBT0EsRUFBQyxLQUFELEVBUEEsQ0FPTyxTQUFDLEdBQUQ7ZUFBUyxRQUFRLENBQUMsUUFBVCxDQUFrQixHQUFsQjtNQUFULENBUFA7SUFEWTtJQVVkLElBQUcsWUFBSDthQUNFLEdBQUcsQ0FBQyxHQUFKLENBQVEsSUFBUixFQUFjO1FBQUEsTUFBQSxFQUFRLFlBQVI7T0FBZCxDQUFtQyxDQUFDLElBQXBDLENBQXlDLFNBQUE7ZUFBRyxJQUFBLENBQUE7TUFBSCxDQUF6QyxDQUFtRCxDQUFDLElBQXBELENBQXlELFNBQUE7ZUFBRyxXQUFBLENBQUE7TUFBSCxDQUF6RCxFQURGO0tBQUEsTUFBQTthQUdFLElBQUEsQ0FBQSxDQUFNLENBQUMsSUFBUCxDQUFZLFNBQUE7ZUFBRyxXQUFBLENBQUE7TUFBSCxDQUFaLENBQ0EsRUFBQyxLQUFELEVBREEsQ0FDTyxTQUFDLE9BQUQ7UUFDTCw2Q0FBRyxPQUFPLENBQUMsU0FBVSxnQkFBckI7aUJBQ0UsV0FBQSxDQUFBLEVBREY7U0FBQSxNQUFBO2lCQUdFLFFBQVEsQ0FBQyxPQUFULENBQWlCLE9BQWpCLEVBSEY7O01BREssQ0FEUCxFQUhGOztFQXZCZTtBQWxGakIiLCJzb3VyY2VzQ29udGVudCI6WyJQYXRoID0gcmVxdWlyZSAncGF0aCdcbntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5mcyA9IHJlcXVpcmUgJ2ZzLXBsdXMnXG5naXQgPSByZXF1aXJlICcuLi9naXQnXG5ub3RpZmllciA9IHJlcXVpcmUgJy4uL25vdGlmaWVyJ1xuR2l0UHVzaCA9IHJlcXVpcmUgJy4vZ2l0LXB1c2gnXG5HaXRQdWxsID0gcmVxdWlyZSAnLi9naXQtcHVsbCdcblxuZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuXG52ZXJib3NlQ29tbWl0c0VuYWJsZWQgPSAtPiBhdG9tLmNvbmZpZy5nZXQoJ2dpdC1wbHVzLmV4cGVyaW1lbnRhbCcpIGFuZCBhdG9tLmNvbmZpZy5nZXQoJ2dpdC1wbHVzLnZlcmJvc2VDb21taXRzJylcblxuZ2V0U3RhZ2VkRmlsZXMgPSAocmVwbykgLT5cbiAgZ2l0LnN0YWdlZEZpbGVzKHJlcG8pLnRoZW4gKGZpbGVzKSAtPlxuICAgIGlmIGZpbGVzLmxlbmd0aCA+PSAxXG4gICAgICBnaXQuY21kKFsnLWMnLCAnY29sb3IudWk9ZmFsc2UnLCAnc3RhdHVzJ10sIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCkpXG4gICAgZWxzZVxuICAgICAgUHJvbWlzZS5yZWplY3QgXCJOb3RoaW5nIHRvIGNvbW1pdC5cIlxuXG5nZXRUZW1wbGF0ZSA9IChmaWxlUGF0aCkgLT5cbiAgaWYgZmlsZVBhdGhcbiAgICBmcy5yZWFkRmlsZVN5bmMoZnMuYWJzb2x1dGUoZmlsZVBhdGgudHJpbSgpKSkudG9TdHJpbmcoKS50cmltKClcbiAgZWxzZVxuICAgICcnXG5cbnByZXBGaWxlID0gKHtzdGF0dXMsIGZpbGVQYXRoLCBkaWZmLCBjb21tZW50Q2hhciwgdGVtcGxhdGV9KSAtPlxuICBjd2QgPSBQYXRoLmRpcm5hbWUoZmlsZVBhdGgpXG4gIHN0YXR1cyA9IHN0YXR1cy5yZXBsYWNlKC9cXHMqXFwoLipcXClcXG4vZywgXCJcXG5cIilcbiAgc3RhdHVzID0gc3RhdHVzLnRyaW0oKS5yZXBsYWNlKC9cXG4vZywgXCJcXG4je2NvbW1lbnRDaGFyfSBcIilcbiAgY29udGVudCA9XG4gICAgXCJcIlwiI3t0ZW1wbGF0ZX1cbiAgICAje2NvbW1lbnRDaGFyfSBQbGVhc2UgZW50ZXIgdGhlIGNvbW1pdCBtZXNzYWdlIGZvciB5b3VyIGNoYW5nZXMuIExpbmVzIHN0YXJ0aW5nXG4gICAgI3tjb21tZW50Q2hhcn0gd2l0aCAnI3tjb21tZW50Q2hhcn0nIHdpbGwgYmUgaWdub3JlZCwgYW5kIGFuIGVtcHR5IG1lc3NhZ2UgYWJvcnRzIHRoZSBjb21taXQuXG4gICAgI3tjb21tZW50Q2hhcn1cbiAgICAje2NvbW1lbnRDaGFyfSAje3N0YXR1c31cIlwiXCJcbiAgaWYgZGlmZlxuICAgIGNvbnRlbnQgKz1cbiAgICAgIFwiXCJcIlxcbiN7Y29tbWVudENoYXJ9XG4gICAgICAje2NvbW1lbnRDaGFyfSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gPjggLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAje2NvbW1lbnRDaGFyfSBEbyBub3QgdG91Y2ggdGhlIGxpbmUgYWJvdmUuXG4gICAgICAje2NvbW1lbnRDaGFyfSBFdmVyeXRoaW5nIGJlbG93IHdpbGwgYmUgcmVtb3ZlZC5cbiAgICAgICN7ZGlmZn1cIlwiXCJcbiAgZnMud3JpdGVGaWxlU3luYyBmaWxlUGF0aCwgY29udGVudFxuXG5kZXN0cm95Q29tbWl0RWRpdG9yID0gLT5cbiAgYXRvbS53b3Jrc3BhY2U/LmdldFBhbmVzKCkuc29tZSAocGFuZSkgLT5cbiAgICBwYW5lLmdldEl0ZW1zKCkuc29tZSAocGFuZUl0ZW0pIC0+XG4gICAgICBpZiBwYW5lSXRlbT8uZ2V0VVJJPygpPy5pbmNsdWRlcyAnQ09NTUlUX0VESVRNU0cnXG4gICAgICAgIGlmIHBhbmUuZ2V0SXRlbXMoKS5sZW5ndGggaXMgMVxuICAgICAgICAgIHBhbmUuZGVzdHJveSgpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBwYW5lSXRlbS5kZXN0cm95KClcbiAgICAgICAgcmV0dXJuIHRydWVcblxudHJpbUZpbGUgPSAoZmlsZVBhdGgsIGNvbW1lbnRDaGFyKSAtPlxuICBjd2QgPSBQYXRoLmRpcm5hbWUoZmlsZVBhdGgpXG4gIGNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoZnMuYWJzb2x1dGUoZmlsZVBhdGgpKS50b1N0cmluZygpXG4gIHN0YXJ0T2ZDb21tZW50cyA9IGNvbnRlbnQuaW5kZXhPZihjb250ZW50LnNwbGl0KCdcXG4nKS5maW5kIChsaW5lKSAtPiBsaW5lLnN0YXJ0c1dpdGggY29tbWVudENoYXIpXG4gIGNvbnRlbnQgPSBjb250ZW50LnN1YnN0cmluZygwLCBzdGFydE9mQ29tbWVudHMpXG4gIGZzLndyaXRlRmlsZVN5bmMgZmlsZVBhdGgsIGNvbnRlbnRcblxuY29tbWl0ID0gKGRpcmVjdG9yeSwgZmlsZVBhdGgpIC0+XG4gIGdpdC5jbWQoWydjb21taXQnLCBcIi0tY2xlYW51cD1zdHJpcFwiLCBcIi0tZmlsZT0je2ZpbGVQYXRofVwiXSwgY3dkOiBkaXJlY3RvcnkpXG4gIC50aGVuIChkYXRhKSAtPlxuICAgIG5vdGlmaWVyLmFkZFN1Y2Nlc3MgZGF0YVxuICAgIGRlc3Ryb3lDb21taXRFZGl0b3IoKVxuICAgIGdpdC5yZWZyZXNoKClcbiAgLmNhdGNoIChkYXRhKSAtPlxuICAgIG5vdGlmaWVyLmFkZEVycm9yIGRhdGFcbiAgICBkZXN0cm95Q29tbWl0RWRpdG9yKClcblxuY2xlYW51cCA9IChjdXJyZW50UGFuZSwgZmlsZVBhdGgpIC0+XG4gIGN1cnJlbnRQYW5lLmFjdGl2YXRlKCkgaWYgY3VycmVudFBhbmUuaXNBbGl2ZSgpXG4gIGRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICBmcy51bmxpbmsgZmlsZVBhdGhcblxuc2hvd0ZpbGUgPSAoZmlsZVBhdGgpIC0+XG4gIGlmIGF0b20uY29uZmlnLmdldCgnZ2l0LXBsdXMub3BlbkluUGFuZScpXG4gICAgc3BsaXREaXJlY3Rpb24gPSBhdG9tLmNvbmZpZy5nZXQoJ2dpdC1wbHVzLnNwbGl0UGFuZScpXG4gICAgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpW1wic3BsaXQje3NwbGl0RGlyZWN0aW9ufVwiXSgpXG4gIGF0b20ud29ya3NwYWNlLm9wZW4gZmlsZVBhdGhcblxubW9kdWxlLmV4cG9ydHMgPSAocmVwbywge3N0YWdlQ2hhbmdlcywgYW5kUHVzaH09e30pIC0+XG4gIGZpbGVQYXRoID0gUGF0aC5qb2luKHJlcG8uZ2V0UGF0aCgpLCAnQ09NTUlUX0VESVRNU0cnKVxuICBjdXJyZW50UGFuZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKVxuICBjb21tZW50Q2hhciA9IGdpdC5nZXRDb25maWcocmVwbywgJ2NvcmUuY29tbWVudGNoYXInKSA/ICcjJ1xuICB0ZW1wbGF0ZSA9IGdldFRlbXBsYXRlKGdpdC5nZXRDb25maWcocmVwbywgJ2NvbW1pdC50ZW1wbGF0ZScpKVxuICBpbml0ID0gLT4gZ2V0U3RhZ2VkRmlsZXMocmVwbykudGhlbiAoc3RhdHVzKSAtPlxuICAgIGlmIHZlcmJvc2VDb21taXRzRW5hYmxlZCgpXG4gICAgICBhcmdzID0gWydkaWZmJywgJy0tY29sb3I9bmV2ZXInLCAnLS1zdGFnZWQnXVxuICAgICAgYXJncy5wdXNoICctLXdvcmQtZGlmZicgaWYgYXRvbS5jb25maWcuZ2V0KCdnaXQtcGx1cy53b3JkRGlmZicpXG4gICAgICBnaXQuY21kKGFyZ3MsIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCkpXG4gICAgICAudGhlbiAoZGlmZikgLT4gcHJlcEZpbGUge3N0YXR1cywgZmlsZVBhdGgsIGRpZmYsIGNvbW1lbnRDaGFyLCB0ZW1wbGF0ZX1cbiAgICBlbHNlXG4gICAgICBwcmVwRmlsZSB7c3RhdHVzLCBmaWxlUGF0aCwgY29tbWVudENoYXIsIHRlbXBsYXRlfVxuICBzdGFydENvbW1pdCA9IC0+XG4gICAgc2hvd0ZpbGUgZmlsZVBhdGhcbiAgICAudGhlbiAodGV4dEVkaXRvcikgLT5cbiAgICAgIGRpc3Bvc2FibGVzLmFkZCB0ZXh0RWRpdG9yLm9uRGlkU2F2ZSAtPlxuICAgICAgICB0cmltRmlsZShmaWxlUGF0aCwgY29tbWVudENoYXIpIGlmIHZlcmJvc2VDb21taXRzRW5hYmxlZCgpXG4gICAgICAgIGNvbW1pdChyZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSwgZmlsZVBhdGgpXG4gICAgICAgIC50aGVuIC0+IEdpdFB1c2gocmVwbykgaWYgYW5kUHVzaFxuICAgICAgZGlzcG9zYWJsZXMuYWRkIHRleHRFZGl0b3Iub25EaWREZXN0cm95IC0+IGNsZWFudXAgY3VycmVudFBhbmUsIGZpbGVQYXRoXG4gICAgLmNhdGNoIChtc2cpIC0+IG5vdGlmaWVyLmFkZEVycm9yIG1zZ1xuXG4gIGlmIHN0YWdlQ2hhbmdlc1xuICAgIGdpdC5hZGQocmVwbywgdXBkYXRlOiBzdGFnZUNoYW5nZXMpLnRoZW4oLT4gaW5pdCgpKS50aGVuIC0+IHN0YXJ0Q29tbWl0KClcbiAgZWxzZVxuICAgIGluaXQoKS50aGVuIC0+IHN0YXJ0Q29tbWl0KClcbiAgICAuY2F0Y2ggKG1lc3NhZ2UpIC0+XG4gICAgICBpZiBtZXNzYWdlLmluY2x1ZGVzPygnQ1JMRicpXG4gICAgICAgIHN0YXJ0Q29tbWl0KClcbiAgICAgIGVsc2VcbiAgICAgICAgbm90aWZpZXIuYWRkSW5mbyBtZXNzYWdlXG4iXX0=
