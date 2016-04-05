(function() {
  var CompositeDisposable, Path, cleanup, cleanupUnstagedText, commit, destroyCommitEditor, diffFiles, dir, disposables, fs, getGitStatus, getStagedFiles, git, notifier, parse, prepFile, prettifyFileStatuses, prettifyStagedFiles, prettyifyPreviousFile, showFile,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  CompositeDisposable = require('atom').CompositeDisposable;

  fs = require('fs-plus');

  Path = require('flavored-path');

  git = require('../git');

  notifier = require('../notifier');

  disposables = new CompositeDisposable;

  prettifyStagedFiles = function(data) {
    var i, mode;
    if (data === '') {
      return [];
    }
    data = data.split(/\0/).slice(0, -1);
    return (function() {
      var _i, _len, _results;
      _results = [];
      for (i = _i = 0, _len = data.length; _i < _len; i = _i += 2) {
        mode = data[i];
        _results.push({
          mode: mode,
          path: data[i + 1]
        });
      }
      return _results;
    })();
  };

  prettyifyPreviousFile = function(data) {
    return {
      mode: data[0],
      path: data.substring(1).trim()
    };
  };

  prettifyFileStatuses = function(files) {
    return files.map(function(_arg) {
      var mode, path;
      mode = _arg.mode, path = _arg.path;
      switch (mode) {
        case 'M':
          return "modified:   " + path;
        case 'A':
          return "new file:   " + path;
        case 'D':
          return "deleted:   " + path;
        case 'R':
          return "renamed:   " + path;
      }
    });
  };

  getStagedFiles = function(repo) {
    return git.stagedFiles(repo).then(function(files) {
      var args;
      if (files.length >= 1) {
        args = ['diff-index', '--cached', 'HEAD', '--name-status', '-z'];
        return git.cmd(args, {
          cwd: repo.getWorkingDirectory()
        }).then(function(data) {
          return prettifyStagedFiles(data);
        });
      } else {
        return Promise.resolve([]);
      }
    });
  };

  getGitStatus = function(repo) {
    return git.cmd(['status'], {
      cwd: repo.getWorkingDirectory()
    });
  };

  diffFiles = function(previousFiles, currentFiles) {
    var currentPaths;
    previousFiles = previousFiles.map(function(p) {
      return prettyifyPreviousFile(p);
    });
    currentPaths = currentFiles.map(function(_arg) {
      var path;
      path = _arg.path;
      return path;
    });
    return previousFiles.filter(function(p) {
      var _ref;
      return (_ref = p.path, __indexOf.call(currentPaths, _ref) >= 0) === false;
    });
  };

  parse = function(prevCommit) {
    var indexOfStatus, lines, message, prevChangedFiles, prevMessage, statusRegex;
    lines = prevCommit.split(/\n/).filter(function(line) {
      return line !== '/n';
    });
    statusRegex = /(([ MADRCU?!])\s(.*))/;
    indexOfStatus = lines.findIndex(function(line) {
      return statusRegex.test(line);
    });
    prevMessage = lines.splice(0, indexOfStatus - 1);
    prevMessage.reverse();
    if (prevMessage[0] === '') {
      prevMessage.shift();
    }
    prevMessage.reverse();
    prevChangedFiles = lines.filter(function(line) {
      return line !== '';
    });
    message = prevMessage.join('\n');
    return {
      message: message,
      prevChangedFiles: prevChangedFiles
    };
  };

  cleanupUnstagedText = function(status) {
    var text, unstagedFiles;
    unstagedFiles = status.indexOf("Changes not staged for commit:");
    if (unstagedFiles >= 0) {
      text = status.substring(unstagedFiles);
      return status = "" + (status.substring(0, unstagedFiles - 1)) + "\n" + (text.replace(/\s*\(.*\)\n/g, ""));
    } else {
      return status;
    }
  };

  prepFile = function(_arg) {
    var filePath, message, prevChangedFiles, status;
    message = _arg.message, prevChangedFiles = _arg.prevChangedFiles, status = _arg.status, filePath = _arg.filePath;
    return git.getConfig('core.commentchar', Path.dirname(filePath)).then(function(commentchar) {
      var currentChanges, nothingToCommit, replacementText, textToReplace;
      commentchar = commentchar.length > 0 ? commentchar.trim() : '#';
      status = cleanupUnstagedText(status);
      status = status.replace(/\s*\(.*\)\n/g, "\n").replace(/\n/g, "\n" + commentchar + " ");
      if (prevChangedFiles.length > 0) {
        nothingToCommit = "nothing to commit, working directory clean";
        currentChanges = "committed:\n" + commentchar;
        textToReplace = null;
        if (status.indexOf(nothingToCommit) > -1) {
          textToReplace = nothingToCommit;
        } else if (status.indexOf(currentChanges) > -1) {
          textToReplace = currentChanges;
        }
        replacementText = "committed:\n" + (prevChangedFiles.map(function(f) {
          return "" + commentchar + "   " + f;
        }).join("\n"));
        status = status.replace(textToReplace, replacementText);
      }
      return fs.writeFileSync(filePath, "" + message + "\n" + commentchar + " Please enter the commit message for your changes. Lines starting\n" + commentchar + " with '" + commentchar + "' will be ignored, and an empty message aborts the commit.\n" + commentchar + "\n" + commentchar + " " + status);
    });
  };

  showFile = function(filePath) {
    var splitDirection;
    if (atom.config.get('git-plus.openInPane')) {
      splitDirection = atom.config.get('git-plus.splitPane');
      atom.workspace.getActivePane()["split" + splitDirection]();
    }
    return atom.workspace.open(filePath);
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

  dir = function(repo) {
    return (git.getSubmodule() || repo).getWorkingDirectory();
  };

  commit = function(directory, filePath) {
    var args;
    args = ['commit', '--amend', '--cleanup=strip', "--file=" + filePath];
    return git.cmd(args, {
      cwd: directory
    }).then(function(data) {
      notifier.addSuccess(data);
      destroyCommitEditor();
      return git.refresh();
    });
  };

  cleanup = function(currentPane, filePath) {
    if (currentPane.isAlive()) {
      currentPane.activate();
    }
    disposables.dispose();
    return fs.unlink(filePath);
  };

  module.exports = function(repo) {
    var currentPane, cwd, filePath;
    currentPane = atom.workspace.getActivePane();
    filePath = Path.join(repo.getPath(), 'COMMIT_EDITMSG');
    cwd = repo.getWorkingDirectory();
    return git.cmd(['whatchanged', '-1', '--name-status', '--format=%B'], {
      cwd: cwd
    }).then(function(amend) {
      return parse(amend);
    }).then(function(_arg) {
      var message, prevChangedFiles;
      message = _arg.message, prevChangedFiles = _arg.prevChangedFiles;
      return getStagedFiles(repo).then(function(files) {
        prevChangedFiles = prettifyFileStatuses(diffFiles(prevChangedFiles, files));
        return {
          message: message,
          prevChangedFiles: prevChangedFiles
        };
      });
    }).then(function(_arg) {
      var message, prevChangedFiles;
      message = _arg.message, prevChangedFiles = _arg.prevChangedFiles;
      return getGitStatus(repo).then(function(status) {
        return prepFile({
          message: message,
          prevChangedFiles: prevChangedFiles,
          status: status,
          filePath: filePath
        });
      }).then(function() {
        return showFile(filePath);
      });
    }).then(function(textEditor) {
      disposables.add(textEditor.onDidSave(function() {
        return commit(dir(repo), filePath);
      }));
      return disposables.add(textEditor.onDidDestroy(function() {
        return cleanup(currentPane, filePath);
      }));
    })["catch"](function(msg) {
      return notifier.addInfo(msg);
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvbW9kZWxzL2dpdC1jb21taXQtYW1lbmQuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtQQUFBO0lBQUEscUpBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUNBLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUixDQURMLENBQUE7O0FBQUEsRUFFQSxJQUFBLEdBQU8sT0FBQSxDQUFRLGVBQVIsQ0FGUCxDQUFBOztBQUFBLEVBR0EsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSLENBSE4sQ0FBQTs7QUFBQSxFQUlBLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUixDQUpYLENBQUE7O0FBQUEsRUFNQSxXQUFBLEdBQWMsR0FBQSxDQUFBLG1CQU5kLENBQUE7O0FBQUEsRUFRQSxtQkFBQSxHQUFzQixTQUFDLElBQUQsR0FBQTtBQUNwQixRQUFBLE9BQUE7QUFBQSxJQUFBLElBQWEsSUFBQSxLQUFRLEVBQXJCO0FBQUEsYUFBTyxFQUFQLENBQUE7S0FBQTtBQUFBLElBQ0EsSUFBQSxHQUFPLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBWCxDQUFpQixhQUR4QixDQUFBOzs7QUFFSztXQUFBLHNEQUFBO3VCQUFBO0FBQ0gsc0JBQUE7QUFBQSxVQUFDLE1BQUEsSUFBRDtBQUFBLFVBQU8sSUFBQSxFQUFNLElBQUssQ0FBQSxDQUFBLEdBQUUsQ0FBRixDQUFsQjtVQUFBLENBREc7QUFBQTs7U0FIZTtFQUFBLENBUnRCLENBQUE7O0FBQUEsRUFjQSxxQkFBQSxHQUF3QixTQUFDLElBQUQsR0FBQTtXQUN0QjtBQUFBLE1BQUEsSUFBQSxFQUFNLElBQUssQ0FBQSxDQUFBLENBQVg7QUFBQSxNQUNBLElB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

//# sourceURL=/home/takaaki/.atom/packages/git-plus/lib/models/git-commit-amend.coffee
