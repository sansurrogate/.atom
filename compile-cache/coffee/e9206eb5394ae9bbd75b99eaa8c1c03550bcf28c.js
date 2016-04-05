(function() {
  var atomRefresh, callGit, cwd, fs, getBranches, git, logcb, noop, parseDefault, parseDiff, parseStatus, path, projectIndex, q, repo, setProjectIndex;

  fs = require('fs');

  path = require('path');

  git = require('git-promise');

  q = require('q');

  logcb = function(log, error) {
    return console[error ? 'error' : 'log'](log);
  };

  repo = void 0;

  cwd = void 0;

  projectIndex = 0;

  noop = function() {
    return q.fcall(function() {
      return true;
    });
  };

  atomRefresh = function() {
    repo.refreshStatus();
  };

  getBranches = function() {
    return q.fcall(function() {
      var branches, h, refs, _i, _j, _len, _len1, _ref, _ref1;
      branches = {
        local: [],
        remote: [],
        tags: []
      };
      refs = repo.getReferences();
      _ref = refs.heads;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        h = _ref[_i];
        branches.local.push(h.replace('refs/heads/', ''));
      }
      _ref1 = refs.remotes;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        h = _ref1[_j];
        branches.remote.push(h.replace('refs/remotes/', ''));
      }
      return branches;
    });
  };

  setProjectIndex = function(index) {
    repo = void 0;
    cwd = void 0;
    projectIndex = index;
    if (atom.project) {
      repo = atom.project.getRepositories()[index];
      cwd = repo ? repo.getWorkingDirectory() : void 0;
    }
  };

  setProjectIndex(projectIndex);

  parseDiff = function(data) {
    return q.fcall(function() {
      var diff, diffs, line, _i, _len, _ref;
      diffs = [];
      diff = {};
      _ref = data.split('\n');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        if (line.length) {
          switch (false) {
            case !/^diff --git /.test(line):
              diff = {
                lines: [],
                added: 0,
                removed: 0
              };
              diff['diff'] = line.replace(/^diff --git /, '');
              diffs.push(diff);
              break;
            case !/^index /.test(line):
              diff['index'] = line.replace(/^index /, '');
              break;
            case !/^--- /.test(line):
              diff['---'] = line.replace(/^--- [a|b]\//, '');
              break;
            case !/^\+\+\+ /.test(line):
              diff['+++'] = line.replace(/^\+\+\+ [a|b]\//, '');
              break;
            default:
              diff['lines'].push(line);
              if (/^\+/.test(line)) {
                diff['added']++;
              }
              if (/^-/.test(line)) {
                diff['removed']++;
              }
          }
        }
      }
      return diffs;
    });
  };

  parseStatus = function(data) {
    return q.fcall(function() {
      var files, line, name, type, _i, _len, _ref, _ref1;
      files = [];
      _ref = data.split('\n');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        if (!line.length) {
          continue;
        }
        _ref1 = line.replace(/\ \ /g, ' ').trim().split(' '), type = _ref1[0], name = _ref1[1];
        files.push({
          name: name,
          selected: (function() {
            switch (type[type.length - 1]) {
              case 'C':
              case 'M':
              case 'R':
              case 'D':
              case 'A':
                return true;
              default:
                return false;
            }
          })(),
          type: (function() {
            switch (type[type.length - 1]) {
              case 'A':
                return 'added';
              case 'C':
                return 'modified';
              case 'D':
                return 'deleted';
              case 'M':
                return 'modified';
              case 'R':
                return 'modified';
              case 'U':
                return 'conflict';
              case '?':
                return 'new';
              default:
                return 'unknown';
            }
          })()
        });
      }
      return files;
    });
  };

  parseDefault = function(data) {
    return q.fcall(function() {
      return true;
    });
  };

  callGit = function(cmd, parser, nodatalog) {
    logcb("> git " + cmd);
    return git(cmd, {
      cwd: cwd
    }).then(function(data) {
      if (!nodatalog) {
        logcb(data);
      }
      return parser(data);
    }).fail(function(e) {
      logcb(e.stdout, true);
      logcb(e.message, true);
    });
  };

  module.exports = {
    isInitialised: function() {
      return cwd;
    },
    alert: function(text) {
      logcb(text);
    },
    setLogger: function(cb) {
      logcb = cb;
    },
    setProjectIndex: setProjectIndex,
    getProjectIndex: function() {
      return projectIndex;
    },
    getRepository: function() {
      return repo;
    },
    count: function(branch) {
      return repo.getAheadBehindCount(branch);
    },
    getLocalBranch: function() {
      return repo.getShortHead();
    },
    getRemoteBranch: function() {
      return repo.getUpstreamBranch();
    },
    isMerging: function() {
      return fs.existsSync(path.join(repo.path, 'MERGE_HEAD'));
    },
    getBranches: getBranches,
    hasRemotes: function() {
      var refs;
      refs = repo.getReferences();
      return refs && refs.remotes && refs.remotes.length;
    },
    hasOrigin: function() {
      return repo.getOriginURL() !== null;
    },
    add: function(files) {
      if (!files.length) {
        return noop();
      }
      return callGit("add -- " + (files.join(' ')), function(data) {
        atomRefresh();
        return parseDefault(data);
      });
    },
    commit: function(message) {
      message = message || Date.now();
      message = message.replace(/"/g, '\\"');
      return callGit("commit -m \"" + message + "\"", function(data) {
        atomRefresh();
        return parseDefault(data);
      });
    },
    checkout: function(branch, remote) {
      return callGit("checkout " + (remote ? '--track ' : '') + branch, function(data) {
        atomRefresh();
        return parseDefault(data);
      });
    },
    createBranch: function(branch) {
      return callGit("branch " + branch, function(data) {
        return callGit("checkout " + branch, function(data) {
          atomRefresh();
          return parseDefault(data);
        });
      });
    },
    deleteBranch: function(branch) {
      return callGit("branch -d " + branch, function(data) {
        atomRefresh();
        return parseDefault;
      });
    },
    forceDeleteBranch: function(branch) {
      return callGit("branch -D " + branch, function(data) {
        atomRefresh();
        return parseDefault;
      });
    },
    diff: function(file) {
      return callGit("--no-pager diff " + (file || ''), parseDiff, true);
    },
    fetch: function() {
      return callGit("fetch --prune", parseDefault);
    },
    merge: function(branch, noff) {
      var noffOutput;
      noffOutput = noff ? "--no-ff" : "";
      return callGit("merge " + noffOutput + " " + branch, function(data) {
        atomRefresh();
        return parseDefault(data);
      });
    },
    pullup: function() {
      return callGit("pull upstream $(git branch | grep '^\*' | sed -n 's/\*[ ]*//p')", function(data) {
        atomRefresh();
        return parseDefault(data);
      });
    },
    pull: function() {
      return callGit("pull", function(data) {
        atomRefresh();
        return parseDefault(data);
      });
    },
    flow: function(type, action, branch) {
      return callGit("flow " + type + " " + action + " " + branch, function(data) {
        atomRefresh();
        return parseDefault(data);
      });
    },
    push: function(remote, branch) {
      var cmd;
      cmd = "-c push.default=simple push " + remote + " " + branch + " --porcelain";
      return callGit(cmd, function(data) {
        atomRefresh();
        return parseDefault(data);
      });
    },
    log: function(branch) {
      return callGit("log origin/" + (repo.getUpstreamBranch() || 'master') + ".." + branch, parseDefault);
    },
    reset: function(files) {
      return callGit("checkout -- " + (files.join(' ')), function(data) {
        atomRefresh();
        return parseDefault(data);
      });
    },
    remove: function(files) {
      if (!files.length) {
        return noop();
      }
      return callGit("rm -- " + (files.join(' ')), function(data) {
        atomRefresh();
        return parseDefault(true);
      });
    },
    status: function() {
      return callGit('status --porcelain --untracked-files=all', parseStatus);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtY29udHJvbC9saWIvZ2l0LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxnSkFBQTs7QUFBQSxFQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQUFMLENBQUE7O0FBQUEsRUFDQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FEUCxDQUFBOztBQUFBLEVBR0EsR0FBQSxHQUFNLE9BQUEsQ0FBUSxhQUFSLENBSE4sQ0FBQTs7QUFBQSxFQUlBLENBQUEsR0FBSSxPQUFBLENBQVEsR0FBUixDQUpKLENBQUE7O0FBQUEsRUFNQSxLQUFBLEdBQVEsU0FBQyxHQUFELEVBQU0sS0FBTixHQUFBO1dBQ04sT0FBUSxDQUFHLEtBQUgsR0FBYyxPQUFkLEdBQTJCLEtBQTNCLENBQVIsQ0FBMEMsR0FBMUMsRUFETTtFQUFBLENBTlIsQ0FBQTs7QUFBQSxFQVNBLElBQUEsR0FBTyxNQVRQLENBQUE7O0FBQUEsRUFVQSxHQUFBLEdBQU0sTUFWTixDQUFBOztBQUFBLEVBV0EsWUFBQSxHQUFlLENBWGYsQ0FBQTs7QUFBQSxFQWFBLElBQUEsR0FBTyxTQUFBLEdBQUE7V0FBRyxDQUFDLENBQUMsS0FBRixDQUFRLFNBQUEsR0FBQTthQUFHLEtBQUg7SUFBQSxDQUFSLEVBQUg7RUFBQSxDQWJQLENBQUE7O0FBQUEsRUFlQSxXQUFBLEdBQWMsU0FBQSxHQUFBO0FBQ1osSUFBQSxJQUFJLENBQUMsYUFBTCxDQUFBLENBQUEsQ0FEWTtFQUFBLENBZmQsQ0FBQTs7QUFBQSxFQW1CQSxXQUFBLEdBQWMsU0FBQSxHQUFBO1dBQUcsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxTQUFBLEdBQUE7QUFDdkIsVUFBQSxtREFBQTtBQUFBLE1BQUEsUUFBQSxHQUFXO0FBQUEsUUFBQSxLQUFBLEVB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

//# sourceURL=/home/takaaki/.atom/packages/git-control/lib/git.coffee
