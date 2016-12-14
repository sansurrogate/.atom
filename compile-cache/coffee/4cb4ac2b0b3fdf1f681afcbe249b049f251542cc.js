(function() {
  var CompositeDisposable, GitPull, GitPush, Path, cleanup, commit, destroyCommitEditor, dir, disposables, fs, getStagedFiles, getTemplate, git, notifier, prepFile, showFile, trimFile, verboseCommitsEnabled;

  CompositeDisposable = require('atom').CompositeDisposable;

  fs = require('fs-plus');

  Path = require('flavored-path');

  git = require('../git');

  notifier = require('../notifier');

  GitPush = require('./git-push');

  GitPull = require('./git-pull');

  disposables = new CompositeDisposable;

  verboseCommitsEnabled = function() {
    return atom.config.get('git-plus.experimental') && atom.config.get('git-plus.verboseCommits');
  };

  dir = function(repo) {
    return (git.getSubmodule() || repo).getWorkingDirectory();
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
        return fs.readFileSync(Path.get(filePath.trim())).toString().trim();
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
        content = "" + template + "\n" + commentchar + " Please enter the commit message for your changes. Lines starting\n" + commentchar + " with '" + commentchar + "' will be ignored, and an empty message aborts the commit.\n" + commentchar + "\n" + commentchar + " " + status;
        if (diff !== '') {
          content += "\n" + commentchar + "\n" + commentchar + " ------------------------ >8 ------------------------\n" + commentchar + " Do not touch the line above.\n" + commentchar + " Everything below will be removed.\n" + diff;
        }
        return fs.writeFileSync(filePath, content);
      });
    });
  };

  destroyCommitEditor = function() {
    var _ref;
    return (_ref = atom.workspace) != null ? _ref.getPanes().some(function(pane) {
      return pane.getItems().some(function(paneItem) {
        var _ref1;
        if (paneItem != null ? typeof paneItem.getURI === "function" ? (_ref1 = paneItem.getURI()) != null ? _ref1.includes('COMMIT_EDITMSG') : void 0 : void 0 : void 0) {
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
      content = fs.readFileSync(Path.get(filePath)).toString();
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
      return notifier.addError(data);
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

  module.exports = function(repo, _arg) {
    var andPush, currentPane, filePath, init, stageChanges, startCommit, _ref;
    _ref = _arg != null ? _arg : {}, stageChanges = _ref.stageChanges, andPush = _ref.andPush;
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
          return commit(dir(repo), filePath).then(function() {
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvbW9kZWxzL2dpdC1jb21taXQuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHdNQUFBOztBQUFBLEVBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQUFELENBQUE7O0FBQUEsRUFDQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVIsQ0FETCxDQUFBOztBQUFBLEVBRUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxlQUFSLENBRlAsQ0FBQTs7QUFBQSxFQUlBLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUixDQUpOLENBQUE7O0FBQUEsRUFLQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVIsQ0FMWCxDQUFBOztBQUFBLEVBTUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxZQUFSLENBTlYsQ0FBQTs7QUFBQSxFQU9BLE9BQUEsR0FBVSxPQUFBLENBQVEsWUFBUixDQVBWLENBQUE7O0FBQUEsRUFTQSxXQUFBLEdBQWMsR0FBQSxDQUFBLG1CQVRkLENBQUE7O0FBQUEsRUFXQSxxQkFBQSxHQUF3QixTQUFBLEdBQUE7V0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsdUJBQWhCLENBQUEsSUFBNkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHlCQUFoQixFQUFoRDtFQUFBLENBWHhCLENBQUE7O0FBQUEsRUFhQSxHQUFBLEdBQU0sU0FBQyxJQUFELEdBQUE7V0FDSixDQUFDLEdBQUcsQ0FBQyxZQUFKLENBQUEsQ0FBQSxJQUFzQixJQUF2QixDQUE0QixDQUFDLG1CQUE3QixDQUFBLEVBREk7RUFBQSxDQWJOLENBQUE7O0FBQUEsRUFnQkEsY0FBQSxHQUFpQixTQUFDLElBQUQsR0FBQTtXQUNmLEdBQUcsQ0FBQyxXQUFKLENBQWdCLElBQWhCLENBQXFCLENBQUMsSUFBdEIsQ0FBMkIsU0FBQyxLQUFELEdBQUE7QUFDekIsTUFBQSxJQUFHLEtBQUssQ0FBQyxNQUFOLElBQWdCLENBQW5CO2VBQ0UsR0FBRyxDQUFDLEdBQUosQ0FBUSxDQUFDLFFBQUQsQ0FBUixFQUFvQjtBQUFBLFVBQUEsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQUw7U0FBcEIsRUFERjtPQUFBLE1BQUE7ZUFHRSxPQUFPLENBQUMsTUFBUixDQUFlLG9CQUFmLEVBSEY7T0FEeUI7SUFBQSxDQUEzQixFQURlO0VBQUEsQ0FoQmpCLENBQUE7O0FBQUEsRUF1QkEsV0FBQSxHQUFjLFNBQUMsR0FBRCxHQUFBO1dBQ1osR0FBRyxDQUFDLFNBQUosQ0FBYyxpQkFBZCxFQUFpQyxHQUFqQyxDQUFxQyxDQUFDLElBQXRDLENBQTJDLFNBQUMsUUFBRCxHQUFBO0FBQ3pDLE1BQUEsSUFBRyxRQUFIO2VBQWlCLEVBQUUsQ0FBQyxZQUFILENBQWdCLElBQUksQ0FBQyxHQUFMLENBQVMsUUFBUSxDQUFDLElBQVQsQ0FBQSxDQUFULENBQWhCLENBQTBDLENBQUMsUUFBM0MsQ0FBQSxDQUFxRCxDQUFDLElBQXRELENBQUEsRUFBakI7T0FBQSxNQUFBO2VBQW1GLEdBQW5GO09BRHlDO0lBQUEsQ0FBM0MsRUFEWTtFQUFBLENBdkJkLENBQUE7O0FBQUEsRUEyQkEsUUFBQSxHQUFXLFNBQUMsTUFBRCxFQUFTLFFBQVQsRUFBbUIsSUFBbkIsR0FBQTtBQUNULFFBQUEsR0FBQTs7TUFENEIsT0FBSztLQUNqQztBQUFBLElBQUEsR0FBQSxHQUFNLElBQUksQ0FBQyxPQUFMLENBQWEsUUFBYixDQUFOLENBQUE7V0FDQSxHQUFHLENBQUMsU0FBSixDQUFjLGtCQUFkLEVBQWtDLEdBQWxDLENBQXNDLENBQUMsSUFBdkMsQ0FBNEMsU0FBQyxXQUFELEdBQUE7QUFDMUMsTUFBQSxXQUFBLEdBQWlCLFdBQUgsR0FBb0IsV0FBVyxDQUFDLElBQVosQ0FBQSxDQUFwQixHQUE0QyxHQUExRCxDQUFBO0FBQUEsTUFDQSxNQUFBLEdBQVMsTUFBTSxDQUFDLE9BQVAsQ0FBZSxjQUFmLEVBQStCLElBQS9CLENBRFQsQ0FBQTtBQUFBLE1BRUEsTUFBQSxHQUFTLE1BQU0sQ0FBQyxJQUFQLENBQUEsQ0FBYSxDQUFDLE9BQWQsQ0FBc0IsS0FBdEIsRUFBOEIsSUFBQSxHQUFJLFdBQUosR0FBZ0IsR0FBOUMsQ0FGVCxDQUFBO2FBR0EsV0FBQSxDQUFZLEdBQVosQ0FBZ0IsQ0FBQyxJQUFqQixDQUFzQixTQUFDLFFBQUQsR0FBQTtBQUNwQixZQUFBLE9BQUE7QUFBQSxRQUFBLE9BQUEsR0FDRSxFQUFBLEdBQUssUUFBTCxHQUFjLElBQWQsR0FDTixXQURNLEdBQ00scUVBRE4sR0FDMEUsV0FEMUUsR0FFRixTQUZFLEdBRU8sV0FGUCxHQUVtQiw4REFGbkIsR0FFZ0YsV0FGaEYsR0FFNEYsSUFGNUYsR0FHUCxXQUhPLEdBR0ssR0FITCxHQUdRLE1BSlYsQ0FBQTtBQU1BLFFBQUEsSUFBRyxJQUFBLEtBQVUsRUFBYjtBQUNFLFVBQUEsT0FBQSxJQUNLLElBQUEsR0FBSSxXQUFKLEdBQWdCLElBQWhCLEdBQ1gsV0FEVyxHQUNDLHlEQURELEdBQ3lELFdBRHpELEdBRVQsaUNBRlMsR0FFdUIsV0FGdkIsR0FFbUMsc0NBRm5DLEdBR2tCLElBSnZCLENBREY7U0FOQTtlQWFBLEVBQUUsQ0FBQyxhQUFILENBQWlCLFFBQWpCLEVBQTJCLE9BQTNCLEVBZG9CO01BQUEsQ0FBdEIsRUFKMEM7SUFBQSxDQUE1QyxFQUZTO0VBQUEsQ0EzQlgsQ0FBQTs7QUFBQSxFQWlEQSxtQkFBQSxHQUFzQixTQUFBLEdBQUE7QUFDcEIsUUFBQSxJQUFBO2lEQUFjLENBQUUsUUFBaEIsQ0FBQSxDQUEwQixDQUFDLElBQTNCLENBQWdDLFNBQUMsSUFBRCxHQUFBO2FBQzlCLElBQUksQ0FBQyxRQUFMLENBQUEsQ0FBZSxDQUFDLElBQWhCLENBQXFCLFNBQUMsUUFBRCxHQUFBO0FBQ25CLFlBQUEsS0FBQTtBQUFBLFFBQUEsMEdBQXNCLENBQUUsUUFBckIsQ0FBOEIsZ0JBQTlCLDRCQUFIO0FBQ0UsVUFBQSxJQUFHLElBQUksQ0FBQyxRQUFMLENBQUEsQ0FBZSxDQUFDLE1BQWhCLEtBQTBCLENBQTdCO0FBQ0UsWUFBQSxJQUFJLENBQUMsT0FBTCxDQUFBLENBQUEsQ0FERjtXQUFBLE1BQUE7QUFHRSxZQUFBLFFBQVEsQ0FBQyxPQUFULENBQUEsQ0FBQSxDQUhGO1dBQUE7QUFJQSxpQkFBTyxJQUFQLENBTEY7U0FEbUI7TUFBQSxDQUFyQixFQUQ4QjtJQUFBLENBQWhDLFdBRG9CO0VBQUEsQ0FqRHRCLENBQUE7O0FBQUEsRUEyREEsUUFBQSxHQUFXLFNBQUMsUUFBRCxHQUFBO0FBQ1QsUUFBQSxHQUFBO0FBQUEsSUFBQSxHQUFBLEdBQU0sSUFBSSxDQUFDLE9BQUwsQ0FBYSxRQUFiLENBQU4sQ0FBQTtXQUNBLEdBQUcsQ0FBQyxTQUFKLENBQWMsa0JBQWQsRUFBa0MsR0FBbEMsQ0FBc0MsQ0FBQyxJQUF2QyxDQUE0QyxTQUFDLFdBQUQsR0FBQTtBQUMxQyxVQUFBLHdCQUFBO0FBQUEsTUFBQSxXQUFBLEdBQWlCLFdBQUEsS0FBZSxFQUFsQixHQUEwQixHQUExQixHQUFBLE1BQWQsQ0FBQTtBQUFBLE1BQ0EsT0FBQSxHQUFVLEVBQUUsQ0FBQyxZQUFILENBQWdCLElBQUksQ0FBQyxHQUFMLENBQVMsUUFBVCxDQUFoQixDQUFtQyxDQUFDLFFBQXBDLENBQUEsQ0FEVixDQUFBO0FBQUEsTUFFQSxlQUFBLEdBQWtCLE9BQU8sQ0FBQyxPQUFSLENBQWdCLE9BQU8sQ0FBQyxLQUFSLENBQWMsSUFBZCxDQUFtQixDQUFDLElBQXBCLENBQXlCLFNBQUMsSUFBRCxHQUFBO2VBQVUsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsV0FBaEIsRUFBVjtNQUFBLENBQXpCLENBQWhCLENBRmxCLENBQUE7QUFBQSxNQUdBLE9BQUEsR0FBVSxPQUFPLENBQUMsU0FBUixDQUFrQixDQUFsQixFQUFxQixlQUFyQixDQUhWLENBQUE7YUFJQSxFQUFFLENBQUMsYUFBSCxDQUFpQixRQUFqQixFQUEyQixPQUEzQixFQUwwQztJQUFBLENBQTVDLEVBRlM7RUFBQSxDQTNEWCxDQUFBOztBQUFBLEVBb0VBLE1BQUEsR0FBUyxTQUFDLFNBQUQsRUFBWSxRQUFaLEdBQUE7QUFDUCxRQUFBLE9BQUE7QUFBQSxJQUFBLE9BQUEsR0FBVSxJQUFWLENBQUE7QUFDQSxJQUFBLElBQUcscUJBQUEsQ0FBQSxDQUFIO0FBQ0UsTUFBQSxPQUFBLEdBQVUsUUFBQSxDQUFTLFFBQVQsQ0FBa0IsQ0FBQyxJQUFuQixDQUF3QixTQUFBLEdBQUE7ZUFBRyxHQUFHLENBQUMsR0FBSixDQUFRLENBQUMsUUFBRCxFQUFZLFNBQUEsR0FBUyxRQUFyQixDQUFSLEVBQTBDO0FBQUEsVUFBQSxHQUFBLEVBQUssU0FBTDtTQUExQyxFQUFIO01BQUEsQ0FBeEIsQ0FBVixDQURGO0tBQUEsTUFBQTtBQUdFLE1BQUEsT0FBQSxHQUFVLEdBQUcsQ0FBQyxHQUFKLENBQVEsQ0FBQyxRQUFELEVBQVcsaUJBQVgsRUFBK0IsU0FBQSxHQUFTLFFBQXhDLENBQVIsRUFBNkQ7QUFBQSxRQUFBLEdBQUEsRUFBSyxTQUFMO09BQTdELENBQVYsQ0FIRjtLQURBO1dBS0EsT0FBTyxDQUFDLElBQVIsQ0FBYSxTQUFDLElBQUQsR0FBQTtBQUNYLE1BQUEsUUFBUSxDQUFDLFVBQVQsQ0FBb0IsSUFBcEIsQ0FBQSxDQUFBO0FBQUEsTUFDQSxtQkFBQSxDQUFBLENBREEsQ0FBQTthQUVBLEdBQUcsQ0FBQyxPQUFKLENBQUEsRUFIVztJQUFBLENBQWIsQ0FJQSxDQUFDLE9BQUQsQ0FKQSxDQUlPLFNBQUMsSUFBRCxHQUFBO2FBQ0wsUUFBUSxDQUFDLFFBQVQsQ0FBa0IsSUFBbEIsRUFESztJQUFBLENBSlAsRUFOTztFQUFBLENBcEVULENBQUE7O0FBQUEsRUFpRkEsT0FBQSxHQUFVLFNBQUMsV0FBRCxFQUFjLFFBQWQsR0FBQTtBQUNSLElBQUEsSUFBMEIsV0FBVyxDQUFDLE9BQVosQ0FBQSxDQUExQjtBQUFBLE1BQUEsV0FBVyxDQUFDLFFBQVosQ0FBQSxDQUFBLENBQUE7S0FBQTtBQUFBLElBQ0EsV0FBVyxDQUFDLE9BQVosQ0FBQSxDQURBLENBQUE7V0FFQSxFQUFFLENBQUMsTUFBSCxDQUFVLFFBQVYsRUFIUTtFQUFBLENBakZWLENBQUE7O0FBQUEsRUFzRkEsUUFBQSxHQUFXLFNBQUMsUUFBRCxHQUFBO0FBQ1QsUUFBQSxjQUFBO0FBQUEsSUFBQSxJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixxQkFBaEIsQ0FBSDtBQUNFLE1BQUEsY0FBQSxHQUFpQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isb0JBQWhCLENBQWpCLENBQUE7QUFBQSxNQUNBLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUFBLENBQStCLENBQUMsT0FBQSxHQUFPLGNBQVIsQ0FBL0IsQ0FBQSxDQURBLENBREY7S0FBQTtXQUdBLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFvQixRQUFwQixFQUpTO0VBQUEsQ0F0RlgsQ0FBQTs7QUFBQSxFQTRGQSxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLElBQUQsRUFBTyxJQUFQLEdBQUE7QUFDZixRQUFBLHFFQUFBO0FBQUEsMEJBRHNCLE9BQXdCLElBQXZCLG9CQUFBLGNBQWMsZUFBQSxPQUNyQyxDQUFBO0FBQUEsSUFBQSxRQUFBLEdBQVcsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFJLENBQUMsT0FBTCxDQUFBLENBQVYsRUFBMEIsZ0JBQTFCLENBQVgsQ0FBQTtBQUFBLElBQ0EsV0FBQSxHQUFjLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUFBLENBRGQsQ0FBQTtBQUFBLElBRUEsSUFBQSxHQUFPLFNBQUEsR0FBQTthQUFHLGNBQUEsQ0FBZSxJQUFmLENBQW9CLENBQUMsSUFBckIsQ0FBMEIsU0FBQyxNQUFELEdBQUE7QUFDbEMsWUFBQSxJQUFBO0FBQUEsUUFBQSxJQUFHLHFCQUFBLENBQUEsQ0FBSDtBQUNFLFVBQUEsSUFBQSxHQUFPLENBQUMsTUFBRCxFQUFTLGVBQVQsRUFBMEIsVUFBMUIsQ0FBUCxDQUFBO0FBQ0EsVUFBQSxJQUEyQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsbUJBQWhCLENBQTNCO0FBQUEsWUFBQSxJQUFJLENBQUMsSUFBTCxDQUFVLGFBQVYsQ0FBQSxDQUFBO1dBREE7aUJBRUEsR0FBRyxDQUFDLEdBQUosQ0FBUSxJQUFSLEVBQWM7QUFBQSxZQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFMO1dBQWQsQ0FDQSxDQUFDLElBREQsQ0FDTSxTQUFDLElBQUQsR0FBQTttQkFBVSxRQUFBLENBQVMsTUFBVCxFQUFpQixRQUFqQixFQUEyQixJQUEzQixFQUFWO1VBQUEsQ0FETixFQUhGO1NBQUEsTUFBQTtpQkFNRSxRQUFBLENBQVMsTUFBVCxFQUFpQixRQUFqQixFQU5GO1NBRGtDO01BQUEsQ0FBMUIsRUFBSDtJQUFBLENBRlAsQ0FBQTtBQUFBLElBVUEsV0FBQSxHQUFjLFNBQUEsR0FBQTthQUNaLFFBQUEsQ0FBUyxRQUFULENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxVQUFELEdBQUE7QUFDSixRQUFBLFdBQVcsQ0FBQyxHQUFaLENBQWdCLFVBQVUsQ0FBQyxTQUFYLENBQXFCLFNBQUEsR0FBQTtpQkFDbkMsTUFBQSxDQUFPLEdBQUEsQ0FBSSxJQUFKLENBQVAsRUFBa0IsUUFBbEIsQ0FDQSxDQUFDLElBREQsQ0FDTSxTQUFBLEdBQUE7QUFBRyxZQUFBLElBQWlCLE9BQWpCO3FCQUFBLE9BQUEsQ0FBUSxJQUFSLEVBQUE7YUFBSDtVQUFBLENBRE4sRUFEbUM7UUFBQSxDQUFyQixDQUFoQixDQUFBLENBQUE7ZUFHQSxXQUFXLENBQUMsR0FBWixDQUFnQixVQUFVLENBQUMsWUFBWCxDQUF3QixTQUFBLEdBQUE7aUJBQUcsT0FBQSxDQUFRLFdBQVIsRUFBcUIsUUFBckIsRUFBSDtRQUFBLENBQXhCLENBQWhCLEVBSkk7TUFBQSxDQUROLENBTUEsQ0FBQyxPQUFELENBTkEsQ0FNTyxTQUFDLEdBQUQsR0FBQTtlQUFTLFFBQVEsQ0FBQyxRQUFULENBQWtCLEdBQWxCLEVBQVQ7TUFBQSxDQU5QLEVBRFk7SUFBQSxDQVZkLENBQUE7QUFtQkEsSUFBQSxJQUFHLFlBQUg7YUFDRSxHQUFHLENBQUMsR0FBSixDQUFRLElBQVIsRUFBYztBQUFBLFFBQUEsTUFBQSxFQUFRLFlBQVI7T0FBZCxDQUFtQyxDQUFDLElBQXBDLENBQXlDLFNBQUEsR0FBQTtlQUFHLElBQUEsQ0FBQSxFQUFIO01BQUEsQ0FBekMsQ0FBbUQsQ0FBQyxJQUFwRCxDQUF5RCxTQUFBLEdBQUE7ZUFBRyxXQUFBLENBQUEsRUFBSDtNQUFBLENBQXpELEVBREY7S0FBQSxNQUFBO2FBR0UsSUFBQSxDQUFBLENBQU0sQ0FBQyxJQUFQLENBQVksU0FBQSxHQUFBO2VBQUcsV0FBQSxDQUFBLEVBQUg7TUFBQSxDQUFaLENBQ0EsQ0FBQyxPQUFELENBREEsQ0FDTyxTQUFDLE9BQUQsR0FBQTtBQUNMLFFBQUEsNkNBQUcsT0FBTyxDQUFDLFNBQVUsZ0JBQXJCO2lCQUNFLFdBQUEsQ0FBQSxFQURGO1NBQUEsTUFBQTtpQkFHRSxRQUFRLENBQUMsT0FBVCxDQUFpQixPQUFqQixFQUhGO1NBREs7TUFBQSxDQURQLEVBSEY7S0FwQmU7RUFBQSxDQTVGakIsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/takaaki/.atom/packages/git-plus/lib/models/git-commit.coffee
