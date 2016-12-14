(function() {
  var CompositeDisposable, GitPull, GitPush, Path, cleanup, commit, destroyCommitEditor, dir, disposables, fs, getStagedFiles, getTemplate, git, notifier, prepFile, showFile, trimFile;

  CompositeDisposable = require('atom').CompositeDisposable;

  fs = require('fs-plus');

  Path = require('flavored-path');

  git = require('../git');

  notifier = require('../notifier');

  GitPush = require('./git-push');

  GitPull = require('./git-pull');

  disposables = new CompositeDisposable;

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
    return trimFile(filePath).then(function() {
      return git.cmd(['commit', "--file=" + filePath], {
        cwd: directory
      });
    }).then(function(data) {
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
        if (atom.config.get('git-plus.experimental') && atom.config.get('git-plus.verboseCommits')) {
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
          return prepFile(status, filePath, '');
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvbW9kZWxzL2dpdC1jb21taXQuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlMQUFBOztBQUFBLEVBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSLEVBQXZCLG1CQUFELENBQUE7O0FBQUEsRUFDQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVIsQ0FETCxDQUFBOztBQUFBLEVBRUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxlQUFSLENBRlAsQ0FBQTs7QUFBQSxFQUlBLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUixDQUpOLENBQUE7O0FBQUEsRUFLQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVIsQ0FMWCxDQUFBOztBQUFBLEVBTUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSxZQUFSLENBTlYsQ0FBQTs7QUFBQSxFQU9BLE9BQUEsR0FBVSxPQUFBLENBQVEsWUFBUixDQVBWLENBQUE7O0FBQUEsRUFTQSxXQUFBLEdBQWMsR0FBQSxDQUFBLG1CQVRkLENBQUE7O0FBQUEsRUFXQSxHQUFBLEdBQU0sU0FBQyxJQUFELEdBQUE7V0FDSixDQUFDLEdBQUcsQ0FBQyxZQUFKLENBQUEsQ0FBQSxJQUFzQixJQUF2QixDQUE0QixDQUFDLG1CQUE3QixDQUFBLEVBREk7RUFBQSxDQVhOLENBQUE7O0FBQUEsRUFjQSxjQUFBLEdBQWlCLFNBQUMsSUFBRCxHQUFBO1dBQ2YsR0FBRyxDQUFDLFdBQUosQ0FBZ0IsSUFBaEIsQ0FBcUIsQ0FBQyxJQUF0QixDQUEyQixTQUFDLEtBQUQsR0FBQTtBQUN6QixNQUFBLElBQUcsS0FBSyxDQUFDLE1BQU4sSUFBZ0IsQ0FBbkI7ZUFDRSxHQUFHLENBQUMsR0FBSixDQUFRLENBQUMsUUFBRCxDQUFSLEVBQW9CO0FBQUEsVUFBQSxHQUFB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

//# sourceURL=/home/takaaki/.atom/packages/git-plus/lib/models/git-commit.coffee
