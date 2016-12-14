(function() {
  var BufferedProcess, Os, RepoListView, _prettify, _prettifyDiff, _prettifyUntracked, getRepoForCurrentFile, git, gitUntrackedFiles, notifier;

  Os = require('os');

  BufferedProcess = require('atom').BufferedProcess;

  RepoListView = require('./views/repo-list-view');

  notifier = require('./notifier');

  gitUntrackedFiles = function(repo, dataUnstaged) {
    var args;
    if (dataUnstaged == null) {
      dataUnstaged = [];
    }
    args = ['ls-files', '-o', '--exclude-standard'];
    return git.cmd(args, {
      cwd: repo.getWorkingDirectory()
    }).then(function(data) {
      return dataUnstaged.concat(_prettifyUntracked(data));
    });
  };

  _prettify = function(data) {
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

  _prettifyUntracked = function(data) {
    if (data === '') {
      return [];
    }
    data = data.split(/\n/).filter(function(d) {
      return d !== '';
    });
    return data.map(function(file) {
      return {
        mode: '?',
        path: file
      };
    });
  };

  _prettifyDiff = function(data) {
    var line, ref;
    data = data.split(/^@@(?=[ \-\+\,0-9]*@@)/gm);
    [].splice.apply(data, [1, data.length - 1 + 1].concat(ref = (function() {
      var j, len, ref1, results;
      ref1 = data.slice(1);
      results = [];
      for (j = 0, len = ref1.length; j < len; j++) {
        line = ref1[j];
        results.push('@@' + line);
      }
      return results;
    })())), ref;
    return data;
  };

  getRepoForCurrentFile = function() {
    return new Promise(function(resolve, reject) {
      var directory, path, project, ref;
      project = atom.project;
      path = (ref = atom.workspace.getActiveTextEditor()) != null ? ref.getPath() : void 0;
      directory = project.getDirectories().filter(function(d) {
        return d.contains(path);
      })[0];
      if (directory != null) {
        return project.repositoryForDirectory(directory).then(function(repo) {
          var submodule;
          submodule = repo.repo.submoduleForPath(path);
          if (submodule != null) {
            return resolve(submodule);
          } else {
            return resolve(repo);
          }
        })["catch"](function(e) {
          return reject(e);
        });
      } else {
        return reject("no current file");
      }
    });
  };

  module.exports = git = {
    cmd: function(args, options, arg) {
      var color;
      if (options == null) {
        options = {
          env: process.env
        };
      }
      color = (arg != null ? arg : {}).color;
      return new Promise(function(resolve, reject) {
        var output, process, ref;
        output = '';
        if (color) {
          args = ['-c', 'color.ui=always'].concat(args);
        }
        process = new BufferedProcess({
          command: (ref = atom.config.get('git-plus.gitPath')) != null ? ref : 'git',
          args: args,
          options: options,
          stdout: function(data) {
            return output += data.toString();
          },
          stderr: function(data) {
            return output += data.toString();
          },
          exit: function(code) {
            if (code === 0) {
              return resolve(output);
            } else {
              return reject(output);
            }
          }
        });
        return process.onWillThrowError(function(errorObject) {
          notifier.addError('Git Plus is unable to locate the git command. Please ensure process.env.PATH can access git.');
          return reject("Couldn't find git");
        });
      });
    },
    getConfig: function(repo, setting) {
      return repo.getConfigValue(setting, repo.getWorkingDirectory());
    },
    reset: function(repo) {
      return git.cmd(['reset', 'HEAD'], {
        cwd: repo.getWorkingDirectory()
      }).then(function() {
        return notifier.addSuccess('All changes unstaged');
      });
    },
    status: function(repo) {
      return git.cmd(['status', '--porcelain', '-z'], {
        cwd: repo.getWorkingDirectory()
      }).then(function(data) {
        if (data.length > 2) {
          return data.split('\0').slice(0, -1);
        } else {
          return [];
        }
      });
    },
    refresh: function(repo) {
      if (repo) {
        if (typeof repo.refreshStatus === "function") {
          repo.refreshStatus();
        }
        return typeof repo.refreshIndex === "function" ? repo.refreshIndex() : void 0;
      } else {
        return atom.project.getRepositories().forEach(function(repo) {
          if (repo != null) {
            return repo.refreshStatus();
          }
        });
      }
    },
    relativize: function(path) {
      var ref, ref1, ref2, ref3;
      return (ref = (ref1 = (ref2 = git.getSubmodule(path)) != null ? ref2.relativize(path) : void 0) != null ? ref1 : (ref3 = atom.project.getRepositories()[0]) != null ? ref3.relativize(path) : void 0) != null ? ref : path;
    },
    diff: function(repo, path) {
      return git.cmd(['diff', '-p', '-U1', path], {
        cwd: repo.getWorkingDirectory()
      }).then(function(data) {
        return _prettifyDiff(data);
      });
    },
    stagedFiles: function(repo, stdout) {
      var args;
      args = ['diff-index', '--cached', 'HEAD', '--name-status', '-z'];
      return git.cmd(args, {
        cwd: repo.getWorkingDirectory()
      }).then(function(data) {
        return _prettify(data);
      })["catch"](function(error) {
        if (error.includes("ambiguous argument 'HEAD'")) {
          return Promise.resolve([1]);
        } else {
          notifier.addError(error);
          return Promise.resolve([]);
        }
      });
    },
    unstagedFiles: function(repo, arg) {
      var args, showUntracked;
      showUntracked = (arg != null ? arg : {}).showUntracked;
      args = ['diff-files', '--name-status', '-z'];
      return git.cmd(args, {
        cwd: repo.getWorkingDirectory()
      }).then(function(data) {
        if (showUntracked) {
          return gitUntrackedFiles(repo, _prettify(data));
        } else {
          return _prettify(data);
        }
      });
    },
    add: function(repo, arg) {
      var args, file, ref, update;
      ref = arg != null ? arg : {}, file = ref.file, update = ref.update;
      args = ['add'];
      if (update) {
        args.push('--update');
      } else {
        args.push('--all');
      }
      args.push(file ? file : '.');
      return git.cmd(args, {
        cwd: repo.getWorkingDirectory()
      }).then(function(output) {
        if (output !== false) {
          return notifier.addSuccess("Added " + (file != null ? file : 'all files'));
        }
      })["catch"](function(msg) {
        return notifier.addError(msg);
      });
    },
    getRepo: function() {
      return new Promise(function(resolve, reject) {
        return getRepoForCurrentFile().then(function(repo) {
          return resolve(repo);
        })["catch"](function(e) {
          var repos;
          repos = atom.project.getRepositories().filter(function(r) {
            return r != null;
          });
          if (repos.length === 0) {
            return reject("No repos found");
          } else if (repos.length > 1) {
            return resolve(new RepoListView(repos).result);
          } else {
            return resolve(repos[0]);
          }
        });
      });
    },
    getSubmodule: function(path) {
      var ref, ref1, ref2;
      if (path == null) {
        path = (ref = atom.workspace.getActiveTextEditor()) != null ? ref.getPath() : void 0;
      }
      return (ref1 = atom.project.getRepositories().filter(function(r) {
        var ref2;
        return r != null ? (ref2 = r.repo) != null ? ref2.submoduleForPath(path) : void 0 : void 0;
      })[0]) != null ? (ref2 = ref1.repo) != null ? ref2.submoduleForPath(path) : void 0 : void 0;
    },
    dir: function(andSubmodules) {
      if (andSubmodules == null) {
        andSubmodules = true;
      }
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var submodule;
          if (andSubmodules && (submodule = git.getSubmodule())) {
            return resolve(submodule.getWorkingDirectory());
          } else {
            return git.getRepo().then(function(repo) {
              return resolve(repo.getWorkingDirectory());
            });
          }
        };
      })(this));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvZ2l0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNKLGtCQUFtQixPQUFBLENBQVEsTUFBUjs7RUFFcEIsWUFBQSxHQUFlLE9BQUEsQ0FBUSx3QkFBUjs7RUFDZixRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVI7O0VBRVgsaUJBQUEsR0FBb0IsU0FBQyxJQUFELEVBQU8sWUFBUDtBQUNsQixRQUFBOztNQUR5QixlQUFhOztJQUN0QyxJQUFBLEdBQU8sQ0FBQyxVQUFELEVBQWEsSUFBYixFQUFtQixvQkFBbkI7V0FDUCxHQUFHLENBQUMsR0FBSixDQUFRLElBQVIsRUFBYztNQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFMO0tBQWQsQ0FDQSxDQUFDLElBREQsQ0FDTSxTQUFDLElBQUQ7YUFDSixZQUFZLENBQUMsTUFBYixDQUFvQixrQkFBQSxDQUFtQixJQUFuQixDQUFwQjtJQURJLENBRE47RUFGa0I7O0VBTXBCLFNBQUEsR0FBWSxTQUFDLElBQUQ7QUFDVixRQUFBO0lBQUEsSUFBYSxJQUFBLEtBQVEsRUFBckI7QUFBQSxhQUFPLEdBQVA7O0lBQ0EsSUFBQSxHQUFPLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBWCxDQUFpQjs7O0FBQ25CO1dBQUEsaURBQUE7O3FCQUNIO1VBQUMsTUFBQSxJQUFEO1VBQU8sSUFBQSxFQUFNLElBQUssQ0FBQSxDQUFBLEdBQUUsQ0FBRixDQUFsQjs7QUFERzs7O0VBSEs7O0VBTVosa0JBQUEsR0FBcUIsU0FBQyxJQUFEO0lBQ25CLElBQWEsSUFBQSxLQUFRLEVBQXJCO0FBQUEsYUFBTyxHQUFQOztJQUNBLElBQUEsR0FBTyxJQUFJLENBQUMsS0FBTCxDQUFXLElBQVgsQ0FBZ0IsQ0FB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LFNBQUMsQ0FBRDttQkFBTztVQUFQLENBQXRDO1VBQ1IsSUFBRyxLQUFLLENBQUMsTUFBTixLQUFnQixDQUFuQjttQkFDRSxNQUFBLENBQU8sZ0JBQVAsRUFERjtXQUFBLE1BRUssSUFBRyxLQUFLLENBQUMsTUFBTixHQUFlLENBQWxCO21CQUNILE9BQUEsQ0FBUSxJQUFJLFlBQUEsQ0FBYSxLQUFiLENBQW1CLENBQUMsTUFBaEMsRUFERztXQUFBLE1BQUE7bUJBR0gsT0FBQSxDQUFRLEtBQU0sQ0FBQSxDQUFBLENBQWQsRUFIRzs7UUFKQSxDQURQO01BRFUsQ0FBUjtJQURHLENBMUVUO0lBc0ZBLFlBQUEsRUFBYyxTQUFDLElBQUQ7QUFDWixVQUFBOztRQUFBLGlFQUE0QyxDQUFFLE9BQXRDLENBQUE7Ozs7O3dEQUdFLENBQUUsZ0JBRlosQ0FFNkIsSUFGN0I7SUFGWSxDQXRGZDtJQTRGQSxHQUFBLEVBQUssU0FBQyxhQUFEOztRQUFDLGdCQUFjOzthQUNkLElBQUEsT0FBQSxDQUFRLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxPQUFELEVBQVUsTUFBVjtBQUNWLGNBQUE7VUFBQSxJQUFHLGFBQUEsSUFBa0IsQ0FBQSxTQUFBLEdBQVksR0FBRyxDQUFDLFlBQUosQ0FBQSxDQUFaLENBQXJCO21CQUNFLE9BQUEsQ0FBUSxTQUFTLENBQUMsbUJBQVYsQ0FBQSxDQUFSLEVBREY7V0FBQSxNQUFBO21CQUdFLEdBQUcsQ0FBQyxPQUFKLENBQUEsQ0FBYSxDQUFDLElBQWQsQ0FBbUIsU0FBQyxJQUFEO3FCQUFVLE9BQUEsQ0FBUSxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFSO1lBQVYsQ0FBbkIsRUFIRjs7UUFEVTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBUjtJQURELENBNUZMOztBQTNDRiIsInNvdXJjZXNDb250ZW50IjpbIk9zID0gcmVxdWlyZSAnb3MnXG57QnVmZmVyZWRQcm9jZXNzfSA9IHJlcXVpcmUgJ2F0b20nXG5cblJlcG9MaXN0VmlldyA9IHJlcXVpcmUgJy4vdmlld3MvcmVwby1saXN0LXZpZXcnXG5ub3RpZmllciA9IHJlcXVpcmUgJy4vbm90aWZpZXInXG5cbmdpdFVudHJhY2tlZEZpbGVzID0gKHJlcG8sIGRhdGFVbnN0YWdlZD1bXSkgLT5cbiAgYXJncyA9IFsnbHMtZmlsZXMnLCAnLW8nLCAnLS1leGNsdWRlLXN0YW5kYXJkJ11cbiAgZ2l0LmNtZChhcmdzLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpKVxuICAudGhlbiAoZGF0YSkgLT5cbiAgICBkYXRhVW5zdGFnZWQuY29uY2F0KF9wcmV0dGlmeVVudHJhY2tlZChkYXRhKSlcblxuX3ByZXR0aWZ5ID0gKGRhdGEpIC0+XG4gIHJldHVybiBbXSBpZiBkYXRhIGlzICcnXG4gIGRhdGEgPSBkYXRhLnNwbGl0KC9cXDAvKVsuLi4tMV1cbiAgW10gPSBmb3IgbW9kZSwgaSBpbiBkYXRhIGJ5IDJcbiAgICB7bW9kZSwgcGF0aDogZGF0YVtpKzFdIH1cblxuX3ByZXR0aWZ5VW50cmFja2VkID0gKGRhdGEpIC0+XG4gIHJldHVybiBbXSBpZiBkYXRhIGlzICcnXG4gIGRhdGEgPSBkYXRhLnNwbGl0KC9cXG4vKS5maWx0ZXIgKGQpIC0+IGQgaXNudCAnJ1xuICBkYXRhLm1hcCAoZmlsZSkgLT4ge21vZGU6ICc/JywgcGF0aDogZmlsZX1cblxuX3ByZXR0aWZ5RGlmZiA9IChkYXRhKSAtPlxuICBkYXRhID0gZGF0YS5zcGxpdCgvXkBAKD89WyBcXC1cXCtcXCwwLTldKkBAKS9nbSlcbiAgZGF0YVsxLi5kYXRhLmxlbmd0aF0gPSAoJ0BAJyArIGxpbmUgZm9yIGxpbmUgaW4gZGF0YVsxLi5dKVxuICBkYXRhXG5cbmdldFJlcG9Gb3JDdXJyZW50RmlsZSA9IC0+XG4gIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpIC0+XG4gICAgcHJvamVjdCA9IGF0b20ucHJvamVjdFxuICAgIHBhdGggPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk/LmdldFBhdGgoKVxuICAgIGRpcmVjdG9yeSA9IHByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKS5maWx0ZXIoKGQpIC0+IGQuY29udGFpbnMocGF0aCkpWzBdXG4gICAgaWYgZGlyZWN0b3J5P1xuICAgICAgcHJvamVjdC5yZXBvc2l0b3J5Rm9yRGlyZWN0b3J5KGRpcmVjdG9yeSkudGhlbiAocmVwbykgLT5cbiAgICAgICAgc3VibW9kdWxlID0gcmVwby5yZXBvLnN1Ym1vZHVsZUZvclBhdGgocGF0aClcbiAgICAgICAgaWYgc3VibW9kdWxlPyB0aGVuIHJlc29sdmUoc3VibW9kdWxlKSBlbHNlIHJlc29sdmUocmVwbylcbiAgICAgIC5jYXRjaCAoZSkgLT5cbiAgICAgICAgcmVqZWN0KGUpXG4gICAgZWxzZVxuICAgICAgcmVqZWN0IFwibm8gY3VycmVudCBmaWxlXCJcblxubW9kdWxlLmV4cG9ydHMgPSBnaXQgPVxuICBjbWQ6IChhcmdzLCBvcHRpb25zPXsgZW52OiBwcm9jZXNzLmVudn0sIHtjb2xvcn09e30pIC0+XG4gICAgbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgLT5cbiAgICAgIG91dHB1dCA9ICcnXG4gICAgICBhcmdzID0gWyctYycsICdjb2xvci51aT1hbHdheXMnXS5jb25jYXQoYXJncykgaWYgY29sb3JcbiAgICAgIHByb2Nlc3MgPSBuZXcgQnVmZmVyZWRQcm9jZXNzXG4gICAgICAgIGNvbW1hbmQ6IGF0b20uY29uZmlnLmdldCgnZ2l0LXBsdXMuZ2l0UGF0aCcpID8gJ2dpdCdcbiAgICAgICAgYXJnczogYXJnc1xuICAgICAgICBvcHRpb25zOiBvcHRpb25zXG4gICAgICAgIHN0ZG91dDogKGRhdGEpIC0+IG91dHB1dCArPSBkYXRhLnRvU3RyaW5nKClcbiAgICAgICAgc3RkZXJyOiAoZGF0YSkgLT5cbiAgICAgICAgICBvdXRwdXQgKz0gZGF0YS50b1N0cmluZygpXG4gICAgICAgIGV4aXQ6IChjb2RlKSAtPlxuICAgICAgICAgIGlmIGNvZGUgaXMgMFxuICAgICAgICAgICAgcmVzb2x2ZSBvdXRwdXRcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICByZWplY3Qgb3V0cHV0XG4gICAgICBwcm9jZXNzLm9uV2lsbFRocm93RXJyb3IgKGVycm9yT2JqZWN0KSAtPlxuICAgICAgICBub3RpZmllci5hZGRFcnJvciAnR2l0IFBsdXMgaXMgdW5hYmxlIHRvIGxvY2F0ZSB0aGUgZ2l0IGNvbW1hbmQuIFBsZWFzZSBlbnN1cmUgcHJvY2Vzcy5lbnYuUEFUSCBjYW4gYWNjZXNzIGdpdC4nXG4gICAgICAgIHJlamVjdCBcIkNvdWxkbid0IGZpbmQgZ2l0XCJcblxuICBnZXRDb25maWc6IChyZXBvLCBzZXR0aW5nKSAtPiByZXBvLmdldENvbmZpZ1ZhbHVlIHNldHRpbmcsIHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpXG5cbiAgcmVzZXQ6IChyZXBvKSAtPlxuICAgIGdpdC5jbWQoWydyZXNldCcsICdIRUFEJ10sIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCkpLnRoZW4gKCkgLT4gbm90aWZpZXIuYWRkU3VjY2VzcyAnQWxsIGNoYW5nZXMgdW5zdGFnZWQnXG5cbiAgc3RhdHVzOiAocmVwbykgLT5cbiAgICBnaXQuY21kKFsnc3RhdHVzJywgJy0tcG9yY2VsYWluJywgJy16J10sIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCkpXG4gICAgLnRoZW4gKGRhdGEpIC0+IGlmIGRhdGEubGVuZ3RoID4gMiB0aGVuIGRhdGEuc3BsaXQoJ1xcMCcpWy4uLi0xXSBlbHNlIFtdXG5cbiAgcmVmcmVzaDogKHJlcG8pIC0+XG4gICAgaWYgcmVwb1xuICAgICAgcmVwby5yZWZyZXNoU3RhdHVzPygpXG4gICAgICByZXBvLnJlZnJlc2hJbmRleD8oKVxuICAgIGVsc2VcbiAgICAgIGF0b20ucHJvamVjdC5nZXRSZXBvc2l0b3JpZXMoKS5mb3JFYWNoIChyZXBvKSAtPiByZXBvLnJlZnJlc2hTdGF0dXMoKSBpZiByZXBvP1xuXG4gIHJlbGF0aXZpemU6IChwYXRoKSAtPlxuICAgIGdpdC5nZXRTdWJtb2R1bGUocGF0aCk/LnJlbGF0aXZpemUocGF0aCkgPyBhdG9tLnByb2plY3QuZ2V0UmVwb3NpdG9yaWVzKClbMF0/LnJlbGF0aXZpemUocGF0aCkgPyBwYXRoXG5cbiAgZGlmZjogKHJlcG8sIHBhdGgpIC0+XG4gICAgZ2l0LmNtZChbJ2RpZmYnLCAnLXAnLCAnLVUxJywgcGF0aF0sIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCkpXG4gICAgLnRoZW4gKGRhdGEpIC0+IF9wcmV0dGlmeURpZmYoZGF0YSlcblxuICBzdGFnZWRGaWxlczogKHJlcG8sIHN0ZG91dCkgLT5cbiAgICBhcmdzID0gWydkaWZmLWluZGV4JywgJy0tY2FjaGVkJywgJ0hFQUQnLCAnLS1uYW1lLXN0YXR1cycsICcteiddXG4gICAgZ2l0LmNtZChhcmdzLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpKVxuICAgIC50aGVuIChkYXRhKSAtPlxuICAgICAgX3ByZXR0aWZ5IGRhdGFcbiAgICAuY2F0Y2ggKGVycm9yKSAtPlxuICAgICAgaWYgZXJyb3IuaW5jbHVkZXMgXCJhbWJpZ3VvdXMgYXJndW1lbnQgJ0hFQUQnXCJcbiAgICAgICAgUHJvbWlzZS5yZXNvbHZlIFsxXVxuICAgICAgZWxzZVxuICAgICAgICBub3RpZmllci5hZGRFcnJvciBlcnJvclxuICAgICAgICBQcm9taXNlLnJlc29sdmUgW11cblxuICB1bnN0YWdlZEZpbGVzOiAocmVwbywge3Nob3dVbnRyYWNrZWR9PXt9KSAtPlxuICAgIGFyZ3MgPSBbJ2RpZmYtZmlsZXMnLCAnLS1uYW1lLXN0YXR1cycsICcteiddXG4gICAgZ2l0LmNtZChhcmdzLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpKVxuICAgIC50aGVuIChkYXRhKSAtPlxuICAgICAgaWYgc2hvd1VudHJhY2tlZFxuICAgICAgICBnaXRVbnRyYWNrZWRGaWxlcyhyZXBvLCBfcHJldHRpZnkoZGF0YSkpXG4gICAgICBlbHNlXG4gICAgICAgIF9wcmV0dGlmeShkYXRhKVxuXG4gIGFkZDogKHJlcG8sIHtmaWxlLCB1cGRhdGV9PXt9KSAtPlxuICAgIGFyZ3MgPSBbJ2FkZCddXG4gICAgaWYgdXBkYXRlIHRoZW4gYXJncy5wdXNoICctLXVwZGF0ZScgZWxzZSBhcmdzLnB1c2ggJy0tYWxsJ1xuICAgIGFyZ3MucHVzaChpZiBmaWxlIHRoZW4gZmlsZSBlbHNlICcuJylcbiAgICBnaXQuY21kKGFyZ3MsIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCkpXG4gICAgLnRoZW4gKG91dHB1dCkgLT5cbiAgICAgIGlmIG91dHB1dCBpc250IGZhbHNlXG4gICAgICAgIG5vdGlmaWVyLmFkZFN1Y2Nlc3MgXCJBZGRlZCAje2ZpbGUgPyAnYWxsIGZpbGVzJ31cIlxuICAgIC5jYXRjaCAobXNnKSAtPiBub3RpZmllci5hZGRFcnJvciBtc2dcblxuICBnZXRSZXBvOiAtPlxuICAgIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpIC0+XG4gICAgICBnZXRSZXBvRm9yQ3VycmVudEZpbGUoKS50aGVuIChyZXBvKSAtPiByZXNvbHZlKHJlcG8pXG4gICAgICAuY2F0Y2ggKGUpIC0+XG4gICAgICAgIHJlcG9zID0gYXRvbS5wcm9qZWN0LmdldFJlcG9zaXRvcmllcygpLmZpbHRlciAocikgLT4gcj9cbiAgICAgICAgaWYgcmVwb3MubGVuZ3RoIGlzIDBcbiAgICAgICAgICByZWplY3QoXCJObyByZXBvcyBmb3VuZFwiKVxuICAgICAgICBlbHNlIGlmIHJlcG9zLmxlbmd0aCA+IDFcbiAgICAgICAgICByZXNvbHZlKG5ldyBSZXBvTGlzdFZpZXcocmVwb3MpLnJlc3VsdClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJlc29sdmUocmVwb3NbMF0pXG5cbiAgZ2V0U3VibW9kdWxlOiAocGF0aCkgLT5cbiAgICBwYXRoID89IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKT8uZ2V0UGF0aCgpXG4gICAgYXRvbS5wcm9qZWN0LmdldFJlcG9zaXRvcmllcygpLmZpbHRlcigocikgLT5cbiAgICAgIHI/LnJlcG8/LnN1Ym1vZHVsZUZvclBhdGggcGF0aFxuICAgIClbMF0/LnJlcG8/LnN1Ym1vZHVsZUZvclBhdGggcGF0aFxuXG4gIGRpcjogKGFuZFN1Ym1vZHVsZXM9dHJ1ZSkgLT5cbiAgICBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSA9PlxuICAgICAgaWYgYW5kU3VibW9kdWxlcyBhbmQgc3VibW9kdWxlID0gZ2l0LmdldFN1Ym1vZHVsZSgpXG4gICAgICAgIHJlc29sdmUoc3VibW9kdWxlLmdldFdvcmtpbmdEaXJlY3RvcnkoKSlcbiAgICAgIGVsc2VcbiAgICAgICAgZ2l0LmdldFJlcG8oKS50aGVuIChyZXBvKSAtPiByZXNvbHZlKHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpKVxuIl19
