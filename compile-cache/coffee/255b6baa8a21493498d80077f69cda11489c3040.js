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
      path: data.substring(1)
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
    var lines, message, prevChangedFiles, prevMessage;
    lines = prevCommit.split(/\n/).filter(function(line) {
      return line !== '';
    });
    prevMessage = [];
    prevChangedFiles = [];
    lines.forEach(function(line) {
      if (!/(([ MADRCU?!])\s(.*))/.test(line)) {
        return prevMessage.push(line);
      } else {
        return prevChangedFiles.push(line.replace(/[ MADRCU?!](\s)(\s)*/, line[0]));
      }
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
        replacementText = "Changes to be committed:\n" + (prevChangedFiles.map(function(f) {
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
