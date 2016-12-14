(function() {
  var BufferedProcess, Os, RepoListView, getRepoForCurrentFile, git, gitUntrackedFiles, notifier, _prettify, _prettifyDiff, _prettifyUntracked;

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
    cmd: function(args, options, _arg) {
      var color;
      if (options == null) {
        options = {
          env: process.env
        };
      }
      color = (_arg != null ? _arg : {}).color;
      return new Promise(function(resolve, reject) {
        var output, process, _ref;
        output = '';
        if (color) {
          args = ['-c', 'color.ui=always'].concat(args);
        }
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
        workingDirectory = Os.homedir();
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvZ2l0LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx3SUFBQTs7QUFBQSxFQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQUFMLENBQUE7O0FBQUEsRUFDQyxrQkFBbUIsT0FBQSxDQUFRLE1BQVIsRUFBbkIsZUFERCxDQUFBOztBQUFBLEVBR0EsWUFBQSxHQUFlLE9BQUEsQ0FBUSx3QkFBUixDQUhmLENBQUE7O0FBQUEsRUFJQSxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVIsQ0FKWCxDQUFBOztBQUFBLEVBTUEsaUJBQUEsR0FBb0IsU0FBQyxJQUFELEVBQU8sWUFBUCxHQUFBO0FBQ2xCLFFBQUEsSUFBQTs7TUFEeUIsZUFBYTtLQUN0QztBQUFBLElBQUEsSUFBQSxHQUFPLENBQUMsVUFBRCxFQUFhLElBQWIsRUFBbUIsb0JBQW5CLENBQVAsQ0FBQTtXQUNBLEdBQUcsQ0FBQyxHQUFKLENBQVEsSUFBUixFQUFjO0FBQUEsTUFBQSxHQUFBLEVBQUssSUFBSSxDQUFDLG1CQUFMLENBQUEsQ0FBTDtLQUFkLENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxJQUFELEdBQUE7YUFDSixZQUFZLENBQUMsTUFBYixDQUFvQixrQkFBQSxDQUFtQixJQUFuQixDQUFwQixFQURJO0lBQUEsQ0FETixFQUZrQjtFQUFBLENBTnBCLENBQUE7O0FBQUEsRUFZQSxTQUFBLEdBQVksU0FBQyxJQUFELEdBQUE7QUFDVixRQUFBLE9BQUE7QUFBQSxJQUFBLElBQWEsSUFBQSxLQUFRLEVBQXJCO0FBQUEsYUFBTyxFQUFQLENBQUE7S0FBQTtBQUFBLElBQ0EsSUFBQSxHQUFPLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBWCxDQUFpQixhQUR4QixDQUFBOzs7QUFFSztX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

//# sourceURL=/home/takaaki/.atom/packages/git-plus/lib/git.coffee
