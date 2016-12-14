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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvZ2l0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNKLGtCQUFtQixPQUFBLENBQVEsTUFBUjs7RUFFcEIsWUFBQSxHQUFlLE9BQUEsQ0FBUSx3QkFBUjs7RUFDZixRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVI7O0VBRVgsaUJBQUEsR0FBb0IsU0FBQyxJQUFELEVBQU8sWUFBUDtBQUNsQixRQUFBOztNQUR5QixlQUFhOztJQUN0QyxJQUFBLEdBQU8sQ0FBQyxVQUFELEVBQWEsSUFBYixFQUFtQixvQkFBbkI7V0FDUCxHQUFHLENBQUMsR0FBSixDQUFRLElBQVIsRUFBYztNQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFMO0tBQWQsQ0FDQSxDQUFDLElBREQsQ0FDTSxTQUFDLElBQUQ7YUFDSixZQUFZLENBQUMsTUFBYixDQUFvQixrQkFBQSxDQUFtQixJQUFuQixDQUFwQjtJQURJLENBRE47RUFGa0I7O0VBTXBCLFNBQUEsR0FBWSxTQUFDLElBQUQ7QUFDVixRQUFBO0lBQUEsSUFBYSxJQUFBLEtBQVEsRUFBckI7QUFBQSxhQUFPLEdBQVA7O0lBQ0EsSUFBQSxHQUFPLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBWCxDQUFpQjs7O0FBQ25CO1dBQUEsaURBQUE7O3FCQUNIO1VBQUMsTUFBQSxJQUFEO1VBQU8sSUFBQSxFQUFNLElBQUssQ0FBQSxDQUFBLEdBQUUsQ0FBRixDQUFsQjs7QUFERzs7O0VBSEs7O0VBU1osa0JBQUEsR0FBcUIsU0FBQyxJQUFEO0lBQ25CLElBQWEsSUFBQSxLQUFRLEVBQXJCO0FBQUEsYUFBTyxHQUFQOztJQUNBLElBQUEsR0FBTyxJQUFJLENBQUMsS0FBTCxDQUFXLElBQVgsQ0FBZ0IsQ0FB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LFNBQUMsQ0FBRDttQkFBTztVQUFQLENBQXRDO1VBQ1IsSUFBRyxLQUFLLENBQUMsTUFBTixLQUFnQixDQUFuQjttQkFDRSxNQUFBLENBQU8sZ0JBQVAsRUFERjtXQUFBLE1BRUssSUFBRyxLQUFLLENBQUMsTUFBTixHQUFlLENBQWxCO21CQUNILE9BQUEsQ0FBUSxJQUFJLFlBQUEsQ0FBYSxLQUFiLENBQW1CLENBQUMsTUFBaEMsRUFERztXQUFBLE1BQUE7bUJBR0gsT0FBQSxDQUFRLEtBQU0sQ0FBQSxDQUFBLENBQWQsRUFIRzs7UUFKQSxDQURQO01BRFUsQ0FBUjtJQURHLENBMUVUO0lBc0ZBLFlBQUEsRUFBYyxTQUFDLElBQUQ7QUFDWixVQUFBOztRQUFBLGlFQUE0QyxDQUFFLE9BQXRDLENBQUE7Ozs7O3dEQUdFLENBQUUsZ0JBRlosQ0FFNkIsSUFGN0I7SUFGWSxDQXRGZDtJQTRGQSxHQUFBLEVBQUssU0FBQyxhQUFEOztRQUFDLGdCQUFjOzthQUNkLElBQUEsT0FBQSxDQUFRLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxPQUFELEVBQVUsTUFBVjtBQUNWLGNBQUE7VUFBQSxJQUFHLGFBQUEsSUFBa0IsQ0FBQSxTQUFBLEdBQVksR0FBRyxDQUFDLFlBQUosQ0FBQSxDQUFaLENBQXJCO21CQUNFLE9BQUEsQ0FBUSxTQUFTLENBQUMsbUJBQVYsQ0FBQSxDQUFSLEVBREY7V0FBQSxNQUFBO21CQUdFLEdBQUcsQ0FBQyxPQUFKLENBQUEsQ0FBYSxDQUFDLElBQWQsQ0FBbUIsU0FBQyxJQUFEO3FCQUFVLE9BQUEsQ0FBUSxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFSO1lBQVYsQ0FBbkIsRUFIRjs7UUFEVTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBUjtJQURELENBNUZMOztBQTlDRiIsInNvdXJjZXNDb250ZW50IjpbIk9zID0gcmVxdWlyZSAnb3MnXG57QnVmZmVyZWRQcm9jZXNzfSA9IHJlcXVpcmUgJ2F0b20nXG5cblJlcG9MaXN0VmlldyA9IHJlcXVpcmUgJy4vdmlld3MvcmVwby1saXN0LXZpZXcnXG5ub3RpZmllciA9IHJlcXVpcmUgJy4vbm90aWZpZXInXG5cbmdpdFVudHJhY2tlZEZpbGVzID0gKHJlcG8sIGRhdGFVbnN0YWdlZD1bXSkgLT5cbiAgYXJncyA9IFsnbHMtZmlsZXMnLCAnLW8nLCAnLS1leGNsdWRlLXN0YW5kYXJkJ11cbiAgZ2l0LmNtZChhcmdzLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpKVxuICAudGhlbiAoZGF0YSkgLT5cbiAgICBkYXRhVW5zdGFnZWQuY29uY2F0KF9wcmV0dGlmeVVudHJhY2tlZChkYXRhKSlcblxuX3ByZXR0aWZ5ID0gKGRhdGEpIC0+XG4gIHJldHVybiBbXSBpZiBkYXRhIGlzICcnXG4gIGRhdGEgPSBkYXRhLnNwbGl0KC9cXDAvKVsuLi4tMV1cbiAgW10gPSBmb3IgbW9kZSwgaSBpbiBkYXRhIGJ5IDJcbiAgICB7bW9kZSwgcGF0aDogZGF0YVtpKzFdIH1cbiAgIyBkYXRhID0gZGF0YS5zcGxpdCgvXFxuLylcbiAgIyBkYXRhLmZpbHRlcigoZmlsZSkgLT4gZmlsZSBpc250ICcnKS5tYXAgKGZpbGUpIC0+XG4gICMgICB7bW9kZTogZmlsZVswXSwgcGF0aDogZmlsZS5zdWJzdHJpbmcoMSkudHJpbSgpfVxuXG5fcHJldHRpZnlVbnRyYWNrZWQgPSAoZGF0YSkgLT5cbiAgcmV0dXJuIFtdIGlmIGRhdGEgaXMgJydcbiAgZGF0YSA9IGRhdGEuc3BsaXQoL1xcbi8pLmZpbHRlciAoZCkgLT4gZCBpc250ICcnXG4gIGRhdGEubWFwIChmaWxlKSAtPiB7bW9kZTogJz8nLCBwYXRoOiBmaWxlfVxuXG5fcHJldHRpZnlEaWZmID0gKGRhdGEpIC0+XG4gIGRhdGEgPSBkYXRhLnNwbGl0KC9eQEAoPz1bIFxcLVxcK1xcLDAtOV0qQEApL2dtKVxuICBkYXRhWzEuLmRhdGEubGVuZ3RoXSA9ICgnQEAnICsgbGluZSBmb3IgbGluZSBpbiBkYXRhWzEuLl0pXG4gIGRhdGFcblxuZ2V0UmVwb0ZvckN1cnJlbnRGaWxlID0gLT5cbiAgbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgLT5cbiAgICBwcm9qZWN0ID0gYXRvbS5wcm9qZWN0XG4gICAgcGF0aCA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKT8uZ2V0UGF0aCgpXG4gICAgZGlyZWN0b3J5ID0gcHJvamVjdC5nZXREaXJlY3RvcmllcygpLmZpbHRlcigoZCkgLT4gZC5jb250YWlucyhwYXRoKSlbMF1cbiAgICBpZiBkaXJlY3Rvcnk/XG4gICAgICBwcm9qZWN0LnJlcG9zaXRvcnlGb3JEaXJlY3RvcnkoZGlyZWN0b3J5KS50aGVuIChyZXBvKSAtPlxuICAgICAgICBzdWJtb2R1bGUgPSByZXBvLnJlcG8uc3VibW9kdWxlRm9yUGF0aChwYXRoKVxuICAgICAgICBpZiBzdWJtb2R1bGU/IHRoZW4gcmVzb2x2ZShzdWJtb2R1bGUpIGVsc2UgcmVzb2x2ZShyZXBvKVxuICAgICAgLmNhdGNoIChlKSAtPlxuICAgICAgICByZWplY3QoZSlcbiAgICBlbHNlXG4gICAgICByZWplY3QgXCJubyBjdXJyZW50IGZpbGVcIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGdpdCA9XG4gIGNtZDogKGFyZ3MsIG9wdGlvbnM9eyBlbnY6IHByb2Nlc3MuZW52fSwge2NvbG9yfT17fSkgLT5cbiAgICBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSAtPlxuICAgICAgb3V0cHV0ID0gJydcbiAgICAgIGFyZ3MgPSBbJy1jJywgJ2NvbG9yLnVpPWFsd2F5cyddLmNvbmNhdChhcmdzKSBpZiBjb2xvclxuICAgICAgcHJvY2VzcyA9IG5ldyBCdWZmZXJlZFByb2Nlc3NcbiAgICAgICAgY29tbWFuZDogYXRvbS5jb25maWcuZ2V0KCdnaXQtcGx1cy5naXRQYXRoJykgPyAnZ2l0J1xuICAgICAgICBhcmdzOiBhcmdzXG4gICAgICAgIG9wdGlvbnM6IG9wdGlvbnNcbiAgICAgICAgc3Rkb3V0OiAoZGF0YSkgLT4gb3V0cHV0ICs9IGRhdGEudG9TdHJpbmcoKVxuICAgICAgICBzdGRlcnI6IChkYXRhKSAtPlxuICAgICAgICAgIG91dHB1dCArPSBkYXRhLnRvU3RyaW5nKClcbiAgICAgICAgZXhpdDogKGNvZGUpIC0+XG4gICAgICAgICAgaWYgY29kZSBpcyAwXG4gICAgICAgICAgICByZXNvbHZlIG91dHB1dFxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJlamVjdCBvdXRwdXRcbiAgICAgIHByb2Nlc3Mub25XaWxsVGhyb3dFcnJvciAoZXJyb3JPYmplY3QpIC0+XG4gICAgICAgIG5vdGlmaWVyLmFkZEVycm9yICdHaXQgUGx1cyBpcyB1bmFibGUgdG8gbG9jYXRlIHRoZSBnaXQgY29tbWFuZC4gUGxlYXNlIGVuc3VyZSBwcm9jZXNzLmVudi5QQVRIIGNhbiBhY2Nlc3MgZ2l0LidcbiAgICAgICAgcmVqZWN0IFwiQ291bGRuJ3QgZmluZCBnaXRcIlxuXG4gIGdldENvbmZpZzogKHJlcG8sIHNldHRpbmcpIC0+IHJlcG8uZ2V0Q29uZmlnVmFsdWUgc2V0dGluZywgcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KClcblxuICByZXNldDogKHJlcG8pIC0+XG4gICAgZ2l0LmNtZChbJ3Jlc2V0JywgJ0hFQUQnXSwgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSkudGhlbiAoKSAtPiBub3RpZmllci5hZGRTdWNjZXNzICdBbGwgY2hhbmdlcyB1bnN0YWdlZCdcblxuICBzdGF0dXM6IChyZXBvKSAtPlxuICAgIGdpdC5jbWQoWydzdGF0dXMnLCAnLS1wb3JjZWxhaW4nLCAnLXonXSwgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSlcbiAgICAudGhlbiAoZGF0YSkgLT4gaWYgZGF0YS5sZW5ndGggPiAyIHRoZW4gZGF0YS5zcGxpdCgnXFwwJylbLi4uLTFdIGVsc2UgW11cblxuICByZWZyZXNoOiAocmVwbykgLT5cbiAgICBpZiByZXBvXG4gICAgICByZXBvLnJlZnJlc2hTdGF0dXM/KClcbiAgICAgIHJlcG8ucmVmcmVzaEluZGV4PygpXG4gICAgZWxzZVxuICAgICAgYXRvbS5wcm9qZWN0LmdldFJlcG9zaXRvcmllcygpLmZvckVhY2ggKHJlcG8pIC0+IHJlcG8ucmVmcmVzaFN0YXR1cygpIGlmIHJlcG8/XG5cbiAgcmVsYXRpdml6ZTogKHBhdGgpIC0+XG4gICAgZ2l0LmdldFN1Ym1vZHVsZShwYXRoKT8ucmVsYXRpdml6ZShwYXRoKSA/IGF0b20ucHJvamVjdC5nZXRSZXBvc2l0b3JpZXMoKVswXT8ucmVsYXRpdml6ZShwYXRoKSA/IHBhdGhcblxuICBkaWZmOiAocmVwbywgcGF0aCkgLT5cbiAgICBnaXQuY21kKFsnZGlmZicsICctcCcsICctVTEnLCBwYXRoXSwgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSlcbiAgICAudGhlbiAoZGF0YSkgLT4gX3ByZXR0aWZ5RGlmZihkYXRhKVxuXG4gIHN0YWdlZEZpbGVzOiAocmVwbywgc3Rkb3V0KSAtPlxuICAgIGFyZ3MgPSBbJ2RpZmYtaW5kZXgnLCAnLS1jYWNoZWQnLCAnSEVBRCcsICctLW5hbWUtc3RhdHVzJywgJy16J11cbiAgICBnaXQuY21kKGFyZ3MsIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCkpXG4gICAgLnRoZW4gKGRhdGEpIC0+XG4gICAgICBfcHJldHRpZnkgZGF0YVxuICAgIC5jYXRjaCAoZXJyb3IpIC0+XG4gICAgICBpZiBlcnJvci5pbmNsdWRlcyBcImFtYmlndW91cyBhcmd1bWVudCAnSEVBRCdcIlxuICAgICAgICBQcm9taXNlLnJlc29sdmUgWzFdXG4gICAgICBlbHNlXG4gICAgICAgIG5vdGlmaWVyLmFkZEVycm9yIGVycm9yXG4gICAgICAgIFByb21pc2UucmVzb2x2ZSBbXVxuXG4gIHVuc3RhZ2VkRmlsZXM6IChyZXBvLCB7c2hvd1VudHJhY2tlZH09e30pIC0+XG4gICAgYXJncyA9IFsnZGlmZi1maWxlcycsICctLW5hbWUtc3RhdHVzJywgJy16J11cbiAgICBnaXQuY21kKGFyZ3MsIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCkpXG4gICAgLnRoZW4gKGRhdGEpIC0+XG4gICAgICBpZiBzaG93VW50cmFja2VkXG4gICAgICAgIGdpdFVudHJhY2tlZEZpbGVzKHJlcG8sIF9wcmV0dGlmeShkYXRhKSlcbiAgICAgIGVsc2VcbiAgICAgICAgX3ByZXR0aWZ5KGRhdGEpXG5cbiAgYWRkOiAocmVwbywge2ZpbGUsIHVwZGF0ZX09e30pIC0+XG4gICAgYXJncyA9IFsnYWRkJ11cbiAgICBpZiB1cGRhdGUgdGhlbiBhcmdzLnB1c2ggJy0tdXBkYXRlJyBlbHNlIGFyZ3MucHVzaCAnLS1hbGwnXG4gICAgYXJncy5wdXNoKGlmIGZpbGUgdGhlbiBmaWxlIGVsc2UgJy4nKVxuICAgIGdpdC5jbWQoYXJncywgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSlcbiAgICAudGhlbiAob3V0cHV0KSAtPlxuICAgICAgaWYgb3V0cHV0IGlzbnQgZmFsc2VcbiAgICAgICAgbm90aWZpZXIuYWRkU3VjY2VzcyBcIkFkZGVkICN7ZmlsZSA/ICdhbGwgZmlsZXMnfVwiXG4gICAgLmNhdGNoIChtc2cpIC0+IG5vdGlmaWVyLmFkZEVycm9yIG1zZ1xuXG4gIGdldFJlcG86IC0+XG4gICAgbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgLT5cbiAgICAgIGdldFJlcG9Gb3JDdXJyZW50RmlsZSgpLnRoZW4gKHJlcG8pIC0+IHJlc29sdmUocmVwbylcbiAgICAgIC5jYXRjaCAoZSkgLT5cbiAgICAgICAgcmVwb3MgPSBhdG9tLnByb2plY3QuZ2V0UmVwb3NpdG9yaWVzKCkuZmlsdGVyIChyKSAtPiByP1xuICAgICAgICBpZiByZXBvcy5sZW5ndGggaXMgMFxuICAgICAgICAgIHJlamVjdChcIk5vIHJlcG9zIGZvdW5kXCIpXG4gICAgICAgIGVsc2UgaWYgcmVwb3MubGVuZ3RoID4gMVxuICAgICAgICAgIHJlc29sdmUobmV3IFJlcG9MaXN0VmlldyhyZXBvcykucmVzdWx0KVxuICAgICAgICBlbHNlXG4gICAgICAgICAgcmVzb2x2ZShyZXBvc1swXSlcblxuICBnZXRTdWJtb2R1bGU6IChwYXRoKSAtPlxuICAgIHBhdGggPz0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpPy5nZXRQYXRoKClcbiAgICBhdG9tLnByb2plY3QuZ2V0UmVwb3NpdG9yaWVzKCkuZmlsdGVyKChyKSAtPlxuICAgICAgcj8ucmVwbz8uc3VibW9kdWxlRm9yUGF0aCBwYXRoXG4gICAgKVswXT8ucmVwbz8uc3VibW9kdWxlRm9yUGF0aCBwYXRoXG5cbiAgZGlyOiAoYW5kU3VibW9kdWxlcz10cnVlKSAtPlxuICAgIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpID0+XG4gICAgICBpZiBhbmRTdWJtb2R1bGVzIGFuZCBzdWJtb2R1bGUgPSBnaXQuZ2V0U3VibW9kdWxlKClcbiAgICAgICAgcmVzb2x2ZShzdWJtb2R1bGUuZ2V0V29ya2luZ0RpcmVjdG9yeSgpKVxuICAgICAgZWxzZVxuICAgICAgICBnaXQuZ2V0UmVwbygpLnRoZW4gKHJlcG8pIC0+IHJlc29sdmUocmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCkpXG4iXX0=
