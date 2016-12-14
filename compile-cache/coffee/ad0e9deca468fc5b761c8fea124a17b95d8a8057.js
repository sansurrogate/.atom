(function() {
  var BufferedProcess, Path, RepoListView, getRepoForCurrentFile, git, gitUntrackedFiles, notifier, _prettify, _prettifyDiff, _prettifyUntracked;

  BufferedProcess = require('atom').BufferedProcess;

  Path = require('flavored-path');

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
    var line, _ref;
    data = data.split(/^@@(?=[ \-\+\,0-9]*@@)/gm);
    [].splice.apply(data, [1, data.length - 1 + 1].concat(_ref = (function() {
      var _i, _len, _ref1, _results;
      _ref1 = data.slice(1);
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        line = _ref1[_i];
        _results.push('@@' + line);
      }
      return _results;
    })())), _ref;
    return data;
  };

  getRepoForCurrentFile = function() {
    return new Promise(function(resolve, reject) {
      var directory, path, project, _ref;
      project = atom.project;
      path = (_ref = atom.workspace.getActiveTextEditor()) != null ? _ref.getPath() : void 0;
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
    cmd: function(args, options) {
      if (options == null) {
        options = {
          env: process.env
        };
      }
      return new Promise(function(resolve, reject) {
        var output, process, _ref;
        output = '';
        process = new BufferedProcess({
          command: (_ref = atom.config.get('git-plus.gitPath')) != null ? _ref : 'git',
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
    getConfig: function(setting, workingDirectory) {
      if (workingDirectory == null) {
        workingDirectory = null;
      }
      if (workingDirectory == null) {
        workingDirectory = Path.get('~');
      }
      return git.cmd(['config', '--get', setting], {
        cwd: workingDirectory
      })["catch"](function(error) {
        if ((error != null) && error !== '') {
          return notifier.addError(error);
        } else {
          return '';
        }
      });
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
    refresh: function() {
      return atom.project.getRepositories().forEach(function(repo) {
        if (repo != null) {
          repo.refreshStatus();
          return git.cmd(['add', '--refresh', '--', '.'], {
            cwd: repo.getWorkingDirectory()
          });
        }
      });
    },
    relativize: function(path) {
      var _ref, _ref1, _ref2, _ref3;
      return (_ref = (_ref1 = (_ref2 = git.getSubmodule(path)) != null ? _ref2.relativize(path) : void 0) != null ? _ref1 : (_ref3 = atom.project.getRepositories()[0]) != null ? _ref3.relativize(path) : void 0) != null ? _ref : path;
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
    unstagedFiles: function(repo, _arg) {
      var args, showUntracked;
      showUntracked = (_arg != null ? _arg : {}).showUntracked;
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
    add: function(repo, _arg) {
      var args, file, update, _ref;
      _ref = _arg != null ? _arg : {}, file = _ref.file, update = _ref.update;
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
      var _ref, _ref1, _ref2;
      if (path == null) {
        path = (_ref = atom.workspace.getActiveTextEditor()) != null ? _ref.getPath() : void 0;
      }
      return (_ref1 = atom.project.getRepositories().filter(function(r) {
        var _ref2;
        return r != null ? (_ref2 = r.repo) != null ? _ref2.submoduleForPath(path) : void 0 : void 0;
      })[0]) != null ? (_ref2 = _ref1.repo) != null ? _ref2.submoduleForPath(path) : void 0 : void 0;
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvZ2l0LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwwSUFBQTs7QUFBQSxFQUFDLGtCQUFtQixPQUFBLENBQVEsTUFBUixFQUFuQixlQUFELENBQUE7O0FBQUEsRUFDQSxJQUFBLEdBQU8sT0FBQSxDQUFRLGVBQVIsQ0FEUCxDQUFBOztBQUFBLEVBR0EsWUFBQSxHQUFlLE9BQUEsQ0FBUSx3QkFBUixDQUhmLENBQUE7O0FBQUEsRUFJQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVIsQ0FKWCxDQUFBOztBQUFBLEVBTUEsaUJBQUEsR0FBb0IsU0FBQyxJQUFELEVBQU8sWUFBUCxHQUFBO0FBQ2xCLFFBQUEsSUFBQTs7TUFEeUIsZUFBYTtLQUN0QztBQUFBLElBQUEsSUFBQSxHQUFPLENBQUMsVUFBRCxFQUFhLElBQWIsRUFBbUIsb0JBQW5CLENBQVAsQ0FBQTtXQUNBLEdBQUcsQ0FBQyxHQUFKLENBQVEsSUFBUixFQUFjO0FBQUEsTUFBQSxHQUFBLEVBQUssSUFBSSxDQUFDLG1CQUFMLENBQUEsQ0FBTDtLQUFkLENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxJQUFELEdBQUE7YUFDSixZQUFZLENBQUMsTUFBYixDQUFvQixrQkFBQSxDQUFtQixJQUFuQixDQUFwQixFQURJO0lBQUEsQ0FETixFQUZrQjtFQUFBLENBTnBCLENBQUE7O0FBQUEsRUFZQSxTQUFBLEdBQVksU0FBQyxJQUFELEdBQUE7QUFDVixRQUFBLE9BQUE7QUFBQSxJQUFBLElBQWEsSUFBQSxLQUFRLEVBQXJCO0FBQUEsYUFBTyxFQUFQLENBQUE7S0FBQTtBQUFBLElBQ0EsSUFBQSxHQUFPLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBWCxDQUFpQixhQUR4QixDQUFBOzs7QUFFSztX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

//# sourceURL=/home/takaaki/.atom/packages/git-plus/lib/git.coffee
