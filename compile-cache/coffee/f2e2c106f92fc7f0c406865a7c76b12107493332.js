(function() {
  var CompositeDisposable, GitPull, GitPush, Path, cleanup, commit, destroyCommitEditor, dir, disposables, fs, getStagedFiles, getTemplate, git, notifier, prepFile, showFile, trimFile, verboseCommitsEnabled;

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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvbW9kZWxzL2dpdC1jb21taXQuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHdNQUFBOztBQUFBLEVBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBQVAsQ0FBQTs7QUFBQSxFQUNDLHNCQUF1QixPQUFBLENBQVEsTUFBUixFQUF2QixtQkFERCxDQUFBOztBQUFBLEVBRUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSLENBRkwsQ0FBQTs7QUFBQSxFQUdBLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUixDQUhOLENBQUE7O0FBQUEsRUFJQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVIsQ0FKWCxDQUFBOztBQUFBLEVBS0EsT0FBQSxHQUFVLE9BQUEsQ0FBUSxZQUFSLENBTFYsQ0FBQTs7QUFBQSxFQU1BLE9BQUEsR0FBVSxPQUFBLENBQVEsWUFBUixDQU5WLENBQUE7O0FBQUEsRUFRQSxXQUFBLEdBQWMsR0FBQSxDQUFBLG1CQVJkLENBQUE7O0FBQUEsRUFVQSxxQkFBQSxHQUF3QixTQUFBLEdBQUE7V0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsdUJBQWhCLENBQUEsSUFBNkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHlCQUFoQixFQUFoRDtFQUFBLENBVnhCLENBQUE7O0FBQUEsRUFZQSxHQUFBLEdBQU0sU0FBQyxJQUFELEdBQUE7V0FDSixDQUFDLEdBQUcsQ0FBQyxZQUFKLENBQUEsQ0FBQSxJQUFzQixJQUF2QixDQUE0QixDQUFDLG1CQUE3QixDQUFBLEVBREk7RUFBQSxDQVpOLENBQUE7O0FBQUEsRUFlQSxjQUFBLEdBQWlCLFNBQUMsSUFBRCxHQUFBO1dBQ2YsR0FBRyxDQUFDLFdBQUosQ0FBZ0Is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

//# sourceURL=/home/takaaki/.atom/packages/git-plus/lib/models/git-commit.coffee
