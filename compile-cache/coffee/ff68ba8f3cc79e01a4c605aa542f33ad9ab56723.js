(function() {
  var CompositeDisposable, Path, cleanup, cleanupUnstagedText, commit, destroyCommitEditor, diffFiles, disposables, fs, getGitStatus, getStagedFiles, git, notifier, parse, prepFile, prettifyFileStatuses, prettifyStagedFiles, prettyifyPreviousFile, showFile,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Path = require('path');

  CompositeDisposable = require('atom').CompositeDisposable;

  fs = require('fs-plus');

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
      var j, len, results;
      results = [];
      for (i = j = 0, len = data.length; j < len; i = j += 2) {
        mode = data[i];
        results.push({
          mode: mode,
          path: data[i + 1]
        });
      }
      return results;
    })();
  };

  prettyifyPreviousFile = function(data) {
    return {
      mode: data[0],
      path: data.substring(1).trim()
    };
  };

  prettifyFileStatuses = function(files) {
    return files.map(function(arg) {
      var mode, path;
      mode = arg.mode, path = arg.path;
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
        args = ['diff-index', '--no-color', '--cached', 'HEAD', '--name-status', '-z'];
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
    return git.cmd(['-c', 'color.ui=false', 'status'], {
      cwd: repo.getWorkingDirectory()
    });
  };

  diffFiles = function(previousFiles, currentFiles) {
    var currentPaths;
    previousFiles = previousFiles.map(function(p) {
      return prettyifyPreviousFile(p);
    });
    currentPaths = currentFiles.map(function(arg) {
      var path;
      path = arg.path;
      return path;
    });
    return previousFiles.filter(function(p) {
      var ref;
      return (ref = p.path, indexOf.call(currentPaths, ref) >= 0) === false;
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
      return status = (status.substring(0, unstagedFiles - 1)) + "\n" + (text.replace(/\s*\(.*\)\n/g, ""));
    } else {
      return status;
    }
  };

  prepFile = function(arg) {
    var commentChar, currentChanges, filePath, message, nothingToCommit, prevChangedFiles, replacementText, status, textToReplace;
    commentChar = arg.commentChar, message = arg.message, prevChangedFiles = arg.prevChangedFiles, status = arg.status, filePath = arg.filePath;
    status = cleanupUnstagedText(status);
    status = status.replace(/\s*\(.*\)\n/g, "\n").replace(/\n/g, "\n" + commentChar + " ");
    if (prevChangedFiles.length > 0) {
      nothingToCommit = "nothing to commit, working directory clean";
      currentChanges = "committed:\n" + commentChar;
      textToReplace = null;
      if (status.indexOf(nothingToCommit) > -1) {
        textToReplace = nothingToCommit;
      } else if (status.indexOf(currentChanges) > -1) {
        textToReplace = currentChanges;
      }
      replacementText = "committed:\n" + (prevChangedFiles.map(function(f) {
        return commentChar + "   " + f;
      }).join("\n"));
      status = status.replace(textToReplace, replacementText);
    }
    return fs.writeFileSync(filePath, message + "\n" + commentChar + " Please enter the commit message for your changes. Lines starting\n" + commentChar + " with '" + commentChar + "' will be ignored, and an empty message aborts the commit.\n" + commentChar + "\n" + commentChar + " " + status);
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
    var commentChar, currentPane, cwd, filePath, ref;
    currentPane = atom.workspace.getActivePane();
    filePath = Path.join(repo.getPath(), 'COMMIT_EDITMSG');
    cwd = repo.getWorkingDirectory();
    commentChar = (ref = git.getConfig(repo, 'core.commentchar')) != null ? ref : '#';
    return git.cmd(['whatchanged', '-1', '--name-status', '--format=%B'], {
      cwd: cwd
    }).then(function(amend) {
      return parse(amend);
    }).then(function(arg) {
      var message, prevChangedFiles;
      message = arg.message, prevChangedFiles = arg.prevChangedFiles;
      return getStagedFiles(repo).then(function(files) {
        prevChangedFiles = prettifyFileStatuses(diffFiles(prevChangedFiles, files));
        return {
          message: message,
          prevChangedFiles: prevChangedFiles
        };
      });
    }).then(function(arg) {
      var message, prevChangedFiles;
      message = arg.message, prevChangedFiles = arg.prevChangedFiles;
      return getGitStatus(repo).then(function(status) {
        return prepFile({
          commentChar: commentChar,
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
        return commit(repo.getWorkingDirectory(), filePath);
      }));
      return disposables.add(textEditor.onDidDestroy(function() {
        return cleanup(currentPane, filePath);
      }));
    })["catch"](function(msg) {
      return notifier.addInfo(msg);
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvbW9kZWxzL2dpdC1jb21taXQtYW1lbmQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSwwUEFBQTtJQUFBOztFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDTixzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBQ3hCLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUjs7RUFDTCxHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVI7O0VBQ04sUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSOztFQUVYLFdBQUEsR0FBYyxJQUFJOztFQUVsQixtQkFBQSxHQUFzQixTQUFDLElBQUQ7QUFDcEIsUUFBQTtJQUFBLElBQWEsSUFBQSxLQUFRLEVBQXJCO0FBQUEsYUFBTyxHQUFQOztJQUNBLElBQUEsR0FBTyxJQUFJLENBQUMsS0FBTCxDQUFXLElBQVgsQ0FBaUI7OztBQUNuQjtXQUFBLGlEQUFBOztxQkFDSDtVQUFDLE1BQUEsSUFBRDtVQUFPLElBQUEsRUFBTSxJQUFLLENBQUEsQ0FBQSxHQUFFLENBQUYsQ0FBbEI7O0FBREc7OztFQUhlOztFQU10QixxQkFBQSxHQUF3QixTQUFDLElBQUQ7V0FDdEI7TUFBQSxJQUFBLEVBQU0sSUFBSyxDQUFBLENBQUEsQ0FBWDtNQUNBLElBQUEsRUFBTSxJQUFJLENBQUMsU0FBTCxDQUFlLENBQWYsQ0FBaUIsQ0FBQyxJQUFsQixDQUFBLENBRE47O0VBRHNCOztFQUl4QixvQkFBQSxHQUF1QixTQUFDLEtBQUQ7V0FDckIsS0FBSyxDQUFDLEdBQU4sQ0FBVSxTQUFDLEdBQUQ7QUFDUixVQUFBO01BRFUsaUJBQU07QUFDaEIsY0FBTyxJQUFQO0FBQUEsYUFDTyxHQURQO2lCQUVJLGNBQUEsR0FBZTtBQUZuQixhQUdPLEdBSFA7aUJBSUksY0FBQSxHQUFlO0FBSm5CLGFBS08sR0FM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QUMsR0FBRDtBQUNKLFVBQUE7TUFETSx1QkFBUzthQUNmLFlBQUEsQ0FBYSxJQUFiLENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxNQUFEO2VBQVksUUFBQSxDQUFTO1VBQUMsYUFBQSxXQUFEO1VBQWMsU0FBQSxPQUFkO1VBQXVCLGtCQUFBLGdCQUF2QjtVQUF5QyxRQUFBLE1BQXpDO1VBQWlELFVBQUEsUUFBakQ7U0FBVDtNQUFaLENBRE4sQ0FFQSxDQUFDLElBRkQsQ0FFTSxTQUFBO2VBQUcsUUFBQSxDQUFTLFFBQVQ7TUFBSCxDQUZOO0lBREksQ0FQTixDQVdBLENBQUMsSUFYRCxDQVdNLFNBQUMsVUFBRDtNQUNKLFdBQVcsQ0FBQyxHQUFaLENBQWdCLFVBQVUsQ0FBQyxTQUFYLENBQXFCLFNBQUE7ZUFBRyxNQUFBLENBQU8sSUFBSSxDQUFDLG1CQUFMLENBQUEsQ0FBUCxFQUFtQyxRQUFuQztNQUFILENBQXJCLENBQWhCO2FBQ0EsV0FBVyxDQUFDLEdBQVosQ0FBZ0IsVUFBVSxDQUFDLFlBQVgsQ0FBd0IsU0FBQTtlQUFHLE9BQUEsQ0FBUSxXQUFSLEVBQXFCLFFBQXJCO01BQUgsQ0FBeEIsQ0FBaEI7SUFGSSxDQVhOLENBY0EsRUFBQyxLQUFELEVBZEEsQ0FjTyxTQUFDLEdBQUQ7YUFBUyxRQUFRLENBQUMsT0FBVCxDQUFpQixHQUFqQjtJQUFULENBZFA7RUFMZTtBQXpIakIiLCJzb3VyY2VzQ29udGVudCI6WyJQYXRoID0gcmVxdWlyZSAncGF0aCdcbntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5mcyA9IHJlcXVpcmUgJ2ZzLXBsdXMnXG5naXQgPSByZXF1aXJlICcuLi9naXQnXG5ub3RpZmllciA9IHJlcXVpcmUgJy4uL25vdGlmaWVyJ1xuXG5kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbnByZXR0aWZ5U3RhZ2VkRmlsZXMgPSAoZGF0YSkgLT5cbiAgcmV0dXJuIFtdIGlmIGRhdGEgaXMgJydcbiAgZGF0YSA9IGRhdGEuc3BsaXQoL1xcMC8pWy4uLi0xXVxuICBbXSA9IGZvciBtb2RlLCBpIGluIGRhdGEgYnkgMlxuICAgIHttb2RlLCBwYXRoOiBkYXRhW2krMV0gfVxuXG5wcmV0dHlpZnlQcmV2aW91c0ZpbGUgPSAoZGF0YSkgLT5cbiAgbW9kZTogZGF0YVswXVxuICBwYXRoOiBkYXRhLnN1YnN0cmluZygxKS50cmltKClcblxucHJldHRpZnlGaWxlU3RhdHVzZXMgPSAoZmlsZXMpIC0+XG4gIGZpbGVzLm1hcCAoe21vZGUsIHBhdGh9KSAtPlxuICAgIHN3aXRjaCBtb2RlXG4gICAgICB3aGVuICdNJ1xuICAgICAgICBcIm1vZGlmaWVkOiAgICN7cGF0aH1cIlxuICAgICAgd2hlbiAnQSdcbiAgICAgICAgXCJuZXcgZmlsZTogICAje3BhdGh9XCJcbiAgICAgIHdoZW4gJ0QnXG4gICAgICAgIFwiZGVsZXRlZDogICAje3BhdGh9XCJcbiAgICAgIHdoZW4gJ1InXG4gICAgICAgIFwicmVuYW1lZDogICAje3BhdGh9XCJcblxuZ2V0U3RhZ2VkRmlsZXMgPSAocmVwbykgLT5cbiAgZ2l0LnN0YWdlZEZpbGVzKHJlcG8pLnRoZW4gKGZpbGVzKSAtPlxuICAgIGlmIGZpbGVzLmxlbmd0aCA+PSAxXG4gICAgICBhcmdzID0gWydkaWZmLWluZGV4JywgJy0tbm8tY29sb3InLCAnLS1jYWNoZWQnLCAnSEVBRCcsICctLW5hbWUtc3RhdHVzJywgJy16J11cbiAgICAgIGdpdC5jbWQoYXJncywgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSlcbiAgICAgIC50aGVuIChkYXRhKSAtPiBwcmV0dGlmeVN0YWdlZEZpbGVzIGRhdGFcbiAgICBlbHNlXG4gICAgICBQcm9taXNlLnJlc29sdmUgW11cblxuZ2V0R2l0U3RhdHVzID0gKHJlcG8pIC0+XG4gIGdpdC5jbWQgWyctYycsICdjb2xvci51aT1mYWxzZScsICdzdGF0dXMnXSwgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKVxuXG5kaWZmRmlsZXMgPSAocHJldmlvdXNGaWxlcywgY3VycmVudEZpbGVzKSAtPlxuICBwcmV2aW91c0ZpbGVzID0gcHJldmlvdXNGaWxlcy5tYXAgKHApIC0+IHByZXR0eWlmeVByZXZpb3VzRmlsZSBwXG4gIGN1cnJlbnRQYXRocyA9IGN1cnJlbnRGaWxlcy5tYXAgKHtwYXRofSkgLT4gcGF0aFxuICBwcmV2aW91c0ZpbGVzLmZpbHRlciAocCkgLT4gcC5wYXRoIGluIGN1cnJlbnRQYXRocyBpcyBmYWxzZVxuXG5wYXJzZSA9IChwcmV2Q29tbWl0KSAtPlxuICBsaW5lcyA9IHByZXZDb21taXQuc3BsaXQoL1xcbi8pLmZpbHRlciAobGluZSkgLT4gbGluZSBpc250ICcvbidcbiAgc3RhdHVzUmVnZXggPSAvKChbIE1BRFJDVT8hXSlcXHMoLiopKS9cbiAgaW5kZXhPZlN0YXR1cyA9IGxpbmVzLmZpbmRJbmRleCAobGluZSkgLT4gc3RhdHVzUmVnZXgudGVzdCBsaW5lXG5cbiAgcHJldk1lc3NhZ2UgPSBsaW5lcy5zcGxpY2UgMCwgaW5kZXhPZlN0YXR1cyAtIDFcbiAgcHJldk1lc3NhZ2UucmV2ZXJzZSgpXG4gIHByZXZNZXNzYWdlLnNoaWZ0KCkgaWYgcHJldk1lc3NhZ2VbMF0gaXMgJydcbiAgcHJldk1lc3NhZ2UucmV2ZXJzZSgpXG4gIHByZXZDaGFuZ2VkRmlsZXMgPSBsaW5lcy5maWx0ZXIgKGxpbmUpIC0+IGxpbmUgaXNudCAnJ1xuICBtZXNzYWdlID0gcHJldk1lc3NhZ2Uuam9pbignXFxuJylcbiAge21lc3NhZ2UsIHByZXZDaGFuZ2VkRmlsZXN9XG5cbmNsZWFudXBVbnN0YWdlZFRleHQgPSAoc3RhdHVzKSAtPlxuICB1bnN0YWdlZEZpbGVzID0gc3RhdHVzLmluZGV4T2YgXCJDaGFuZ2VzIG5vdCBzdGFnZWQgZm9yIGNvbW1pdDpcIlxuICBpZiB1bnN0YWdlZEZpbGVzID49IDBcbiAgICB0ZXh0ID0gc3RhdHVzLnN1YnN0cmluZyB1bnN0YWdlZEZpbGVzXG4gICAgc3RhdHVzID0gXCIje3N0YXR1cy5zdWJzdHJpbmcoMCwgdW5zdGFnZWRGaWxlcyAtIDEpfVxcbiN7dGV4dC5yZXBsYWNlIC9cXHMqXFwoLipcXClcXG4vZywgXCJcIn1cIlxuICBlbHNlXG4gICAgc3RhdHVzXG5cbnByZXBGaWxlID0gKHtjb21tZW50Q2hhciwgbWVzc2FnZSwgcHJldkNoYW5nZWRGaWxlcywgc3RhdHVzLCBmaWxlUGF0aH0pIC0+XG4gICAgc3RhdHVzID0gY2xlYW51cFVuc3RhZ2VkVGV4dCBzdGF0dXNcbiAgICBzdGF0dXMgPSBzdGF0dXMucmVwbGFjZSgvXFxzKlxcKC4qXFwpXFxuL2csIFwiXFxuXCIpLnJlcGxhY2UoL1xcbi9nLCBcIlxcbiN7Y29tbWVudENoYXJ9IFwiKVxuICAgIGlmIHByZXZDaGFuZ2VkRmlsZXMubGVuZ3RoID4gMFxuICAgICAgbm90aGluZ1RvQ29tbWl0ID0gXCJub3RoaW5nIHRvIGNvbW1pdCwgd29ya2luZyBkaXJlY3RvcnkgY2xlYW5cIlxuICAgICAgY3VycmVudENoYW5nZXMgPSBcImNvbW1pdHRlZDpcXG4je2NvbW1lbnRDaGFyfVwiXG4gICAgICB0ZXh0VG9SZXBsYWNlID0gbnVsbFxuICAgICAgaWYgc3RhdHVzLmluZGV4T2Yobm90aGluZ1RvQ29tbWl0KSA+IC0xXG4gICAgICAgIHRleHRUb1JlcGxhY2UgPSBub3RoaW5nVG9Db21taXRcbiAgICAgIGVsc2UgaWYgc3RhdHVzLmluZGV4T2YoY3VycmVudENoYW5nZXMpID4gLTFcbiAgICAgICAgdGV4dFRvUmVwbGFjZSA9IGN1cnJlbnRDaGFuZ2VzXG4gICAgICByZXBsYWNlbWVudFRleHQgPVxuICAgICAgICBcIlwiXCJjb21taXR0ZWQ6XG4gICAgICAgICN7XG4gICAgICAgICAgcHJldkNoYW5nZWRGaWxlcy5tYXAoKGYpIC0+IFwiI3tjb21tZW50Q2hhcn0gICAje2Z9XCIpLmpvaW4oXCJcXG5cIilcbiAgICAgICAgfVwiXCJcIlxuICAgICAgc3RhdHVzID0gc3RhdHVzLnJlcGxhY2UgdGV4dFRvUmVwbGFjZSwgcmVwbGFjZW1lbnRUZXh0XG4gICAgZnMud3JpdGVGaWxlU3luYyBmaWxlUGF0aCxcbiAgICAgIFwiXCJcIiN7bWVzc2FnZX1cbiAgICAgICN7Y29tbWVudENoYXJ9IFBsZWFzZSBlbnRlciB0aGUgY29tbWl0IG1lc3NhZ2UgZm9yIHlvdXIgY2hhbmdlcy4gTGluZXMgc3RhcnRpbmdcbiAgICAgICN7Y29tbWVudENoYXJ9IHdpdGggJyN7Y29tbWVudENoYXJ9JyB3aWxsIGJlIGlnbm9yZWQsIGFuZCBhbiBlbXB0eSBtZXNzYWdlIGFib3J0cyB0aGUgY29tbWl0LlxuICAgICAgI3tjb21tZW50Q2hhcn1cbiAgICAgICN7Y29tbWVudENoYXJ9ICN7c3RhdHVzfVwiXCJcIlxuXG5zaG93RmlsZSA9IChmaWxlUGF0aCkgLT5cbiAgaWYgYXRvbS5jb25maWcuZ2V0KCdnaXQtcGx1cy5vcGVuSW5QYW5lJylcbiAgICBzcGxpdERpcmVjdGlvbiA9IGF0b20uY29uZmlnLmdldCgnZ2l0LXBsdXMuc3BsaXRQYW5lJylcbiAgICBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClbXCJzcGxpdCN7c3BsaXREaXJlY3Rpb259XCJdKClcbiAgYXRvbS53b3Jrc3BhY2Uub3BlbiBmaWxlUGF0aFxuXG5kZXN0cm95Q29tbWl0RWRpdG9yID0gLT5cbiAgYXRvbS53b3Jrc3BhY2U/LmdldFBhbmVzKCkuc29tZSAocGFuZSkgLT5cbiAgICBwYW5lLmdldEl0ZW1zKCkuc29tZSAocGFuZUl0ZW0pIC0+XG4gICAgICBpZiBwYW5lSXRlbT8uZ2V0VVJJPygpPy5pbmNsdWRlcyAnQ09NTUlUX0VESVRNU0cnXG4gICAgICAgIGlmIHBhbmUuZ2V0SXRlbXMoKS5sZW5ndGggaXMgMVxuICAgICAgICAgIHBhbmUuZGVzdHJveSgpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBwYW5lSXRlbS5kZXN0cm95KClcbiAgICAgICAgcmV0dXJuIHRydWVcblxuY29tbWl0ID0gKGRpcmVjdG9yeSwgZmlsZVBhdGgpIC0+XG4gIGFyZ3MgPSBbJ2NvbW1pdCcsICctLWFtZW5kJywgJy0tY2xlYW51cD1zdHJpcCcsIFwiLS1maWxlPSN7ZmlsZVBhdGh9XCJdXG4gIGdpdC5jbWQoYXJncywgY3dkOiBkaXJlY3RvcnkpXG4gIC50aGVuIChkYXRhKSAtPlxuICAgIG5vdGlmaWVyLmFkZFN1Y2Nlc3MgZGF0YVxuICAgIGRlc3Ryb3lDb21taXRFZGl0b3IoKVxuICAgIGdpdC5yZWZyZXNoKClcblxuY2xlYW51cCA9IChjdXJyZW50UGFuZSwgZmlsZVBhdGgpIC0+XG4gIGN1cnJlbnRQYW5lLmFjdGl2YXRlKCkgaWYgY3VycmVudFBhbmUuaXNBbGl2ZSgpXG4gIGRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuICBmcy51bmxpbmsgZmlsZVBhdGhcblxubW9kdWxlLmV4cG9ydHMgPSAocmVwbykgLT5cbiAgY3VycmVudFBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcbiAgZmlsZVBhdGggPSBQYXRoLmpvaW4ocmVwby5nZXRQYXRoKCksICdDT01NSVRfRURJVE1TRycpXG4gIGN3ZCA9IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpXG4gIGNvbW1lbnRDaGFyID0gZ2l0LmdldENvbmZpZyhyZXBvLCAnY29yZS5jb21tZW50Y2hhcicpID8gJyMnXG4gIGdpdC5jbWQoWyd3aGF0Y2hhbmdlZCcsICctMScsICctLW5hbWUtc3RhdHVzJywgJy0tZm9ybWF0PSVCJ10sIHtjd2R9KVxuICAudGhlbiAoYW1lbmQpIC0+IHBhcnNlIGFtZW5kXG4gIC50aGVuICh7bWVzc2FnZSwgcHJldkNoYW5nZWRGaWxlc30pIC0+XG4gICAgZ2V0U3RhZ2VkRmlsZXMocmVwbylcbiAgICAudGhlbiAoZmlsZXMpIC0+XG4gICAgICBwcmV2Q2hhbmdlZEZpbGVzID0gcHJldHRpZnlGaWxlU3RhdHVzZXMoZGlmZkZpbGVzIHByZXZDaGFuZ2VkRmlsZXMsIGZpbGVzKVxuICAgICAge21lc3NhZ2UsIHByZXZDaGFuZ2VkRmlsZXN9XG4gIC50aGVuICh7bWVzc2FnZSwgcHJldkNoYW5nZWRGaWxlc30pIC0+XG4gICAgZ2V0R2l0U3RhdHVzKHJlcG8pXG4gICAgLnRoZW4gKHN0YXR1cykgLT4gcHJlcEZpbGUge2NvbW1lbnRDaGFyLCBtZXNzYWdlLCBwcmV2Q2hhbmdlZEZpbGVzLCBzdGF0dXMsIGZpbGVQYXRofVxuICAgIC50aGVuIC0+IHNob3dGaWxlIGZpbGVQYXRoXG4gIC50aGVuICh0ZXh0RWRpdG9yKSAtPlxuICAgIGRpc3Bvc2FibGVzLmFkZCB0ZXh0RWRpdG9yLm9uRGlkU2F2ZSAtPiBjb21taXQocmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCksIGZpbGVQYXRoKVxuICAgIGRpc3Bvc2FibGVzLmFkZCB0ZXh0RWRpdG9yLm9uRGlkRGVzdHJveSAtPiBjbGVhbnVwIGN1cnJlbnRQYW5lLCBmaWxlUGF0aFxuICAuY2F0Y2ggKG1zZykgLT4gbm90aWZpZXIuYWRkSW5mbyBtc2dcbiJdfQ==
