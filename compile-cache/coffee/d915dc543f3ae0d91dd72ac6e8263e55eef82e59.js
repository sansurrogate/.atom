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
    var filePath, message, prevChangedFiles, status;
    message = arg.message, prevChangedFiles = arg.prevChangedFiles, status = arg.status, filePath = arg.filePath;
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
          return commentchar + "   " + f;
        }).join("\n"));
        status = status.replace(textToReplace, replacementText);
      }
      return fs.writeFileSync(filePath, message + "\n" + commentchar + " Please enter the commit message for your changes. Lines starting\n" + commentchar + " with '" + commentchar + "' will be ignored, and an empty message aborts the commit.\n" + commentchar + "\n" + commentchar + " " + status);
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
    var currentPane, cwd, filePath;
    currentPane = atom.workspace.getActivePane();
    filePath = Path.join(repo.getPath(), 'COMMIT_EDITMSG');
    cwd = repo.getWorkingDirectory();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvbW9kZWxzL2dpdC1jb21taXQtYW1lbmQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSwwUEFBQTtJQUFBOztFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDTixzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBQ3hCLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUjs7RUFDTCxHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVI7O0VBQ04sUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSOztFQUVYLFdBQUEsR0FBYyxJQUFJOztFQUVsQixtQkFBQSxHQUFzQixTQUFDLElBQUQ7QUFDcEIsUUFBQTtJQUFBLElBQWEsSUFBQSxLQUFRLEVBQXJCO0FBQUEsYUFBTyxHQUFQOztJQUNBLElBQUEsR0FBTyxJQUFJLENBQUMsS0FBTCxDQUFXLElBQVgsQ0FBaUI7OztBQUNuQjtXQUFBLGlEQUFBOztxQkFDSDtVQUFDLE1BQUEsSUFBRDtVQUFPLElBQUEsRUFBTSxJQUFLLENBQUEsQ0FBQSxHQUFFLENBQUYsQ0FBbEI7O0FBREc7OztFQUhlOztFQU10QixxQkFBQSxHQUF3QixTQUFDLElBQUQ7V0FDdEI7TUFBQSxJQUFBLEVBQU0sSUFBSyxDQUFBLENBQUEsQ0FBWDtNQUNBLElBQUEsRUFBTSxJQUFJLENBQUMsU0FBTCxDQUFlLENBQWYsQ0FBaUIsQ0FBQyxJQUFsQixDQUFBLENBRE47O0VBRHNCOztFQUl4QixvQkFBQSxHQUF1QixTQUFDLEtBQUQ7V0FDckIsS0FBSyxDQUFDLEdBQU4sQ0FBVSxTQUFDLEdBQUQ7QUFDUixVQUFBO01BRFUsaUJBQU07QUFDaEIsY0FBTyxJQUFQO0FBQUEsYUFDTyxHQURQO2lCQUVJLGNBQUEsR0FBZTtBQUZuQixhQUdPLEdBSFA7aUJBSUksY0FBQSxHQUFlO0FBSm5CLGFBS08sR0FM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QUFEO1FBQ0osZ0JBQUEsR0FBbUIsb0JBQUEsQ0FBcUIsU0FBQSxDQUFVLGdCQUFWLEVBQTRCLEtBQTVCLENBQXJCO2VBQ25CO1VBQUMsU0FBQSxPQUFEO1VBQVUsa0JBQUEsZ0JBQVY7O01BRkksQ0FETjtJQURJLENBRk4sQ0FPQSxDQUFDLElBUEQsQ0FPTSxTQUFDLEdBQUQ7QUFDSixVQUFBO01BRE0sdUJBQVM7YUFDZixZQUFBLENBQWEsSUFBYixDQUNBLENBQUMsSUFERCxDQUNNLFNBQUMsTUFBRDtlQUFZLFFBQUEsQ0FBUztVQUFDLFNBQUEsT0FBRDtVQUFVLGtCQUFBLGdCQUFWO1VBQTRCLFFBQUEsTUFBNUI7VUFBb0MsVUFBQSxRQUFwQztTQUFUO01BQVosQ0FETixDQUVBLENBQUMsSUFGRCxDQUVNLFNBQUE7ZUFBRyxRQUFBLENBQVMsUUFBVDtNQUFILENBRk47SUFESSxDQVBOLENBV0EsQ0FBQyxJQVhELENBV00sU0FBQyxVQUFEO01BQ0osV0FBVyxDQUFDLEdBQVosQ0FBZ0IsVUFBVSxDQUFDLFNBQVgsQ0FBcUIsU0FBQTtlQUFHLE1BQUEsQ0FBTyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFQLEVBQW1DLFFBQW5DO01BQUgsQ0FBckIsQ0FBaEI7YUFDQSxXQUFXLENBQUMsR0FBWixDQUFnQixVQUFVLENBQUMsWUFBWCxDQUF3QixTQUFBO2VBQUcsT0FBQSxDQUFRLFdBQVIsRUFBcUIsUUFBckI7TUFBSCxDQUF4QixDQUFoQjtJQUZJLENBWE4sQ0FjQSxFQUFDLEtBQUQsRUFkQSxDQWNPLFNBQUMsR0FBRDthQUFTLFFBQVEsQ0FBQyxPQUFULENBQWlCLEdBQWpCO0lBQVQsQ0FkUDtFQUplO0FBM0hqQiIsInNvdXJjZXNDb250ZW50IjpbIlBhdGggPSByZXF1aXJlICdwYXRoJ1xue0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbmZzID0gcmVxdWlyZSAnZnMtcGx1cydcbmdpdCA9IHJlcXVpcmUgJy4uL2dpdCdcbm5vdGlmaWVyID0gcmVxdWlyZSAnLi4vbm90aWZpZXInXG5cbmRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcblxucHJldHRpZnlTdGFnZWRGaWxlcyA9IChkYXRhKSAtPlxuICByZXR1cm4gW10gaWYgZGF0YSBpcyAnJ1xuICBkYXRhID0gZGF0YS5zcGxpdCgvXFwwLylbLi4uLTFdXG4gIFtdID0gZm9yIG1vZGUsIGkgaW4gZGF0YSBieSAyXG4gICAge21vZGUsIHBhdGg6IGRhdGFbaSsxXSB9XG5cbnByZXR0eWlmeVByZXZpb3VzRmlsZSA9IChkYXRhKSAtPlxuICBtb2RlOiBkYXRhWzBdXG4gIHBhdGg6IGRhdGEuc3Vic3RyaW5nKDEpLnRyaW0oKVxuXG5wcmV0dGlmeUZpbGVTdGF0dXNlcyA9IChmaWxlcykgLT5cbiAgZmlsZXMubWFwICh7bW9kZSwgcGF0aH0pIC0+XG4gICAgc3dpdGNoIG1vZGVcbiAgICAgIHdoZW4gJ00nXG4gICAgICAgIFwibW9kaWZpZWQ6ICAgI3twYXRofVwiXG4gICAgICB3aGVuICdBJ1xuICAgICAgICBcIm5ldyBmaWxlOiAgICN7cGF0aH1cIlxuICAgICAgd2hlbiAnRCdcbiAgICAgICAgXCJkZWxldGVkOiAgICN7cGF0aH1cIlxuICAgICAgd2hlbiAnUidcbiAgICAgICAgXCJyZW5hbWVkOiAgICN7cGF0aH1cIlxuXG5nZXRTdGFnZWRGaWxlcyA9IChyZXBvKSAtPlxuICBnaXQuc3RhZ2VkRmlsZXMocmVwbykudGhlbiAoZmlsZXMpIC0+XG4gICAgaWYgZmlsZXMubGVuZ3RoID49IDFcbiAgICAgIGFyZ3MgPSBbJ2RpZmYtaW5kZXgnLCAnLS1jYWNoZWQnLCAnSEVBRCcsICctLW5hbWUtc3RhdHVzJywgJy16J11cbiAgICAgIGdpdC5jbWQoYXJncywgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSlcbiAgICAgIC50aGVuIChkYXRhKSAtPiBwcmV0dGlmeVN0YWdlZEZpbGVzIGRhdGFcbiAgICBlbHNlXG4gICAgICBQcm9taXNlLnJlc29sdmUgW11cblxuZ2V0R2l0U3RhdHVzID0gKHJlcG8pIC0+XG4gIGdpdC5jbWQgWydzdGF0dXMnXSwgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKVxuXG5kaWZmRmlsZXMgPSAocHJldmlvdXNGaWxlcywgY3VycmVudEZpbGVzKSAtPlxuICBwcmV2aW91c0ZpbGVzID0gcHJldmlvdXNGaWxlcy5tYXAgKHApIC0+IHByZXR0eWlmeVByZXZpb3VzRmlsZSBwXG4gIGN1cnJlbnRQYXRocyA9IGN1cnJlbnRGaWxlcy5tYXAgKHtwYXRofSkgLT4gcGF0aFxuICBwcmV2aW91c0ZpbGVzLmZpbHRlciAocCkgLT4gcC5wYXRoIGluIGN1cnJlbnRQYXRocyBpcyBmYWxzZVxuXG5wYXJzZSA9IChwcmV2Q29tbWl0KSAtPlxuICBsaW5lcyA9IHByZXZDb21taXQuc3BsaXQoL1xcbi8pLmZpbHRlciAobGluZSkgLT4gbGluZSBpc250ICcvbidcbiAgc3RhdHVzUmVnZXggPSAvKChbIE1BRFJDVT8hXSlcXHMoLiopKS9cbiAgaW5kZXhPZlN0YXR1cyA9IGxpbmVzLmZpbmRJbmRleCAobGluZSkgLT4gc3RhdHVzUmVnZXgudGVzdCBsaW5lXG5cbiAgcHJldk1lc3NhZ2UgPSBsaW5lcy5zcGxpY2UgMCwgaW5kZXhPZlN0YXR1cyAtIDFcbiAgcHJldk1lc3NhZ2UucmV2ZXJzZSgpXG4gIHByZXZNZXNzYWdlLnNoaWZ0KCkgaWYgcHJldk1lc3NhZ2VbMF0gaXMgJydcbiAgcHJldk1lc3NhZ2UucmV2ZXJzZSgpXG4gIHByZXZDaGFuZ2VkRmlsZXMgPSBsaW5lcy5maWx0ZXIgKGxpbmUpIC0+IGxpbmUgaXNudCAnJ1xuICBtZXNzYWdlID0gcHJldk1lc3NhZ2Uuam9pbignXFxuJylcbiAge21lc3NhZ2UsIHByZXZDaGFuZ2VkRmlsZXN9XG5cbmNsZWFudXBVbnN0YWdlZFRleHQgPSAoc3RhdHVzKSAtPlxuICB1bnN0YWdlZEZpbGVzID0gc3RhdHVzLmluZGV4T2YgXCJDaGFuZ2VzIG5vdCBzdGFnZWQgZm9yIGNvbW1pdDpcIlxuICBpZiB1bnN0YWdlZEZpbGVzID49IDBcbiAgICB0ZXh0ID0gc3RhdHVzLnN1YnN0cmluZyB1bnN0YWdlZEZpbGVzXG4gICAgc3RhdHVzID0gXCIje3N0YXR1cy5zdWJzdHJpbmcoMCwgdW5zdGFnZWRGaWxlcyAtIDEpfVxcbiN7dGV4dC5yZXBsYWNlIC9cXHMqXFwoLipcXClcXG4vZywgXCJcIn1cIlxuICBlbHNlXG4gICAgc3RhdHVzXG5cbnByZXBGaWxlID0gKHttZXNzYWdlLCBwcmV2Q2hhbmdlZEZpbGVzLCBzdGF0dXMsIGZpbGVQYXRofSkgLT5cbiAgZ2l0LmdldENvbmZpZygnY29yZS5jb21tZW50Y2hhcicsIFBhdGguZGlybmFtZShmaWxlUGF0aCkpLnRoZW4gKGNvbW1lbnRjaGFyKSAtPlxuICAgIGNvbW1lbnRjaGFyID0gaWYgY29tbWVudGNoYXIubGVuZ3RoID4gMCB0aGVuIGNvbW1lbnRjaGFyLnRyaW0oKSBlbHNlICcjJ1xuICAgIHN0YXR1cyA9IGNsZWFudXBVbnN0YWdlZFRleHQgc3RhdHVzXG4gICAgc3RhdHVzID0gc3RhdHVzLnJlcGxhY2UoL1xccypcXCguKlxcKVxcbi9nLCBcIlxcblwiKS5yZXBsYWNlKC9cXG4vZywgXCJcXG4je2NvbW1lbnRjaGFyfSBcIilcbiAgICBpZiBwcmV2Q2hhbmdlZEZpbGVzLmxlbmd0aCA+IDBcbiAgICAgIG5vdGhpbmdUb0NvbW1pdCA9IFwibm90aGluZyB0byBjb21taXQsIHdvcmtpbmcgZGlyZWN0b3J5IGNsZWFuXCJcbiAgICAgIGN1cnJlbnRDaGFuZ2VzID0gXCJjb21taXR0ZWQ6XFxuI3tjb21tZW50Y2hhcn1cIlxuICAgICAgdGV4dFRvUmVwbGFjZSA9IG51bGxcbiAgICAgIGlmIHN0YXR1cy5pbmRleE9mKG5vdGhpbmdUb0NvbW1pdCkgPiAtMVxuICAgICAgICB0ZXh0VG9SZXBsYWNlID0gbm90aGluZ1RvQ29tbWl0XG4gICAgICBlbHNlIGlmIHN0YXR1cy5pbmRleE9mKGN1cnJlbnRDaGFuZ2VzKSA+IC0xXG4gICAgICAgIHRleHRUb1JlcGxhY2UgPSBjdXJyZW50Q2hhbmdlc1xuICAgICAgcmVwbGFjZW1lbnRUZXh0ID1cbiAgICAgICAgXCJcIlwiY29tbWl0dGVkOlxuICAgICAgICAje1xuICAgICAgICAgIHByZXZDaGFuZ2VkRmlsZXMubWFwKChmKSAtPiBcIiN7Y29tbWVudGNoYXJ9ICAgI3tmfVwiKS5qb2luKFwiXFxuXCIpXG4gICAgICAgIH1cIlwiXCJcbiAgICAgIHN0YXR1cyA9IHN0YXR1cy5yZXBsYWNlIHRleHRUb1JlcGxhY2UsIHJlcGxhY2VtZW50VGV4dFxuICAgIGZzLndyaXRlRmlsZVN5bmMgZmlsZVBhdGgsXG4gICAgICBcIlwiXCIje21lc3NhZ2V9XG4gICAgICAje2NvbW1lbnRjaGFyfSBQbGVhc2UgZW50ZXIgdGhlIGNvbW1pdCBtZXNzYWdlIGZvciB5b3VyIGNoYW5nZXMuIExpbmVzIHN0YXJ0aW5nXG4gICAgICAje2NvbW1lbnRjaGFyfSB3aXRoICcje2NvbW1lbnRjaGFyfScgd2lsbCBiZSBpZ25vcmVkLCBhbmQgYW4gZW1wdHkgbWVzc2FnZSBhYm9ydHMgdGhlIGNvbW1pdC5cbiAgICAgICN7Y29tbWVudGNoYXJ9XG4gICAgICAje2NvbW1lbnRjaGFyfSAje3N0YXR1c31cIlwiXCJcblxuc2hvd0ZpbGUgPSAoZmlsZVBhdGgpIC0+XG4gIGlmIGF0b20uY29uZmlnLmdldCgnZ2l0LXBsdXMub3BlbkluUGFuZScpXG4gICAgc3BsaXREaXJlY3Rpb24gPSBhdG9tLmNvbmZpZy5nZXQoJ2dpdC1wbHVzLnNwbGl0UGFuZScpXG4gICAgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpW1wic3BsaXQje3NwbGl0RGlyZWN0aW9ufVwiXSgpXG4gIGF0b20ud29ya3NwYWNlLm9wZW4gZmlsZVBhdGhcblxuZGVzdHJveUNvbW1pdEVkaXRvciA9IC0+XG4gIGF0b20ud29ya3NwYWNlPy5nZXRQYW5lcygpLnNvbWUgKHBhbmUpIC0+XG4gICAgcGFuZS5nZXRJdGVtcygpLnNvbWUgKHBhbmVJdGVtKSAtPlxuICAgICAgaWYgcGFuZUl0ZW0/LmdldFVSST8oKT8uaW5jbHVkZXMgJ0NPTU1JVF9FRElUTVNHJ1xuICAgICAgICBpZiBwYW5lLmdldEl0ZW1zKCkubGVuZ3RoIGlzIDFcbiAgICAgICAgICBwYW5lLmRlc3Ryb3koKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgcGFuZUl0ZW0uZGVzdHJveSgpXG4gICAgICAgIHJldHVybiB0cnVlXG5cbmNvbW1pdCA9IChkaXJlY3RvcnksIGZpbGVQYXRoKSAtPlxuICBhcmdzID0gWydjb21taXQnLCAnLS1hbWVuZCcsICctLWNsZWFudXA9c3RyaXAnLCBcIi0tZmlsZT0je2ZpbGVQYXRofVwiXVxuICBnaXQuY21kKGFyZ3MsIGN3ZDogZGlyZWN0b3J5KVxuICAudGhlbiAoZGF0YSkgLT5cbiAgICBub3RpZmllci5hZGRTdWNjZXNzIGRhdGFcbiAgICBkZXN0cm95Q29tbWl0RWRpdG9yKClcbiAgICBnaXQucmVmcmVzaCgpXG5cbmNsZWFudXAgPSAoY3VycmVudFBhbmUsIGZpbGVQYXRoKSAtPlxuICBjdXJyZW50UGFuZS5hY3RpdmF0ZSgpIGlmIGN1cnJlbnRQYW5lLmlzQWxpdmUoKVxuICBkaXNwb3NhYmxlcy5kaXNwb3NlKClcbiAgZnMudW5saW5rIGZpbGVQYXRoXG5cbm1vZHVsZS5leHBvcnRzID0gKHJlcG8pIC0+XG4gIGN1cnJlbnRQYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gIGZpbGVQYXRoID0gUGF0aC5qb2luKHJlcG8uZ2V0UGF0aCgpLCAnQ09NTUlUX0VESVRNU0cnKVxuICBjd2QgPSByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKVxuICBnaXQuY21kKFsnd2hhdGNoYW5nZWQnLCAnLTEnLCAnLS1uYW1lLXN0YXR1cycsICctLWZvcm1hdD0lQiddLCB7Y3dkfSlcbiAgLnRoZW4gKGFtZW5kKSAtPiBwYXJzZSBhbWVuZFxuICAudGhlbiAoe21lc3NhZ2UsIHByZXZDaGFuZ2VkRmlsZXN9KSAtPlxuICAgIGdldFN0YWdlZEZpbGVzKHJlcG8pXG4gICAgLnRoZW4gKGZpbGVzKSAtPlxuICAgICAgcHJldkNoYW5nZWRGaWxlcyA9IHByZXR0aWZ5RmlsZVN0YXR1c2VzKGRpZmZGaWxlcyBwcmV2Q2hhbmdlZEZpbGVzLCBmaWxlcylcbiAgICAgIHttZXNzYWdlLCBwcmV2Q2hhbmdlZEZpbGVzfVxuICAudGhlbiAoe21lc3NhZ2UsIHByZXZDaGFuZ2VkRmlsZXN9KSAtPlxuICAgIGdldEdpdFN0YXR1cyhyZXBvKVxuICAgIC50aGVuIChzdGF0dXMpIC0+IHByZXBGaWxlIHttZXNzYWdlLCBwcmV2Q2hhbmdlZEZpbGVzLCBzdGF0dXMsIGZpbGVQYXRofVxuICAgIC50aGVuIC0+IHNob3dGaWxlIGZpbGVQYXRoXG4gIC50aGVuICh0ZXh0RWRpdG9yKSAtPlxuICAgIGRpc3Bvc2FibGVzLmFkZCB0ZXh0RWRpdG9yLm9uRGlkU2F2ZSAtPiBjb21taXQocmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCksIGZpbGVQYXRoKVxuICAgIGRpc3Bvc2FibGVzLmFkZCB0ZXh0RWRpdG9yLm9uRGlkRGVzdHJveSAtPiBjbGVhbnVwIGN1cnJlbnRQYW5lLCBmaWxlUGF0aFxuICAuY2F0Y2ggKG1zZykgLT4gbm90aWZpZXIuYWRkSW5mbyBtc2dcbiJdfQ==
