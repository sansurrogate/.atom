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
      var files, line, name, type, _i, _len, _ref;
      files = [];
      _ref = data.split('\n');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        if (!line.length) {
          continue;
        }
        type = line.substring(0, 2);
        name = line.substring(2).trim().replace(new RegExp('\"', 'g'), '');
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
      return callGit("commit --allow-empty-message -m \"" + message + "\"", function(data) {
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
    ptag: function(remote) {
      return callGit("push " + remote + " --tags", function(data) {
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
    push: function(remote, branch, force) {
      var cmd, forced;
      forced = force ? "-f" : "";
      cmd = "-c push.default=simple push " + remote + " " + branch + " " + forced + " --porcelain";
      return callGit(cmd, function(data) {
        atomRefresh();
        return parseDefault(data);
      });
    },
    log: function(branch) {
      return callGit("log origin/" + (repo.getUpstreamBranch() || 'master') + ".." + branch, parseDefault);
    },
    rebase: function(branch) {
      return callGit("rebase " + branch, function(data) {
        atomRefresh();
        return parseDefault(data);
      });
    },
    midrebase: function(contin, abort, skip) {
      if (contin) {
        return callGit("rebase --continue", function(data) {
          atomRefresh();
          return parseDefault(data);
        });
      } else if (abort) {
        return callGit("rebase --abort", function(data) {
          atomRefresh();
          return parseDefault(data);
        });
      } else if (skip) {
        return callGit("rebase --skip", function(data) {
          atomRefresh();
          return parseDefault(data);
        });
      }
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
    },
    tag: function(name, href, msg) {
      return callGit("tag -a " + name + " -m '" + msg + "' " + href, function(data) {
        atomRefresh();
        return parseDefault(data);
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtY29udHJvbC9saWIvZ2l0LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxnSkFBQTs7QUFBQSxFQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQUFMLENBQUE7O0FBQUEsRUFDQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FEUCxDQUFBOztBQUFBLEVBR0EsR0FBQSxHQUFNLE9BQUEsQ0FBUSxhQUFSLENBSE4sQ0FBQTs7QUFBQSxFQUlBLENBQUEsR0FBSSxPQUFBLENBQVEsR0FBUixDQUpKLENBQUE7O0FBQUEsRUFNQSxLQUFBLEdBQVEsU0FBQyxHQUFELEVBQU0sS0FBTixHQUFBO1dBQ04sT0FBUSxDQUFHLEtBQUgsR0FBYyxPQUFkLEdBQTJCLEtBQTNCLENBQVIsQ0FBMEMsR0FBMUMsRUFETTtFQUFBLENBTlIsQ0FBQTs7QUFBQSxFQVNBLElBQUEsR0FBTyxNQVRQLENBQUE7O0FBQUEsRUFVQSxHQUFBLEdBQU0sTUFWTixDQUFBOztBQUFBLEVBV0EsWUFBQSxHQUFlLENBWGYsQ0FBQTs7QUFBQSxFQWFBLElBQUEsR0FBTyxTQUFBLEdBQUE7V0FBRyxDQUFDLENBQUMsS0FBRixDQUFRLFNBQUEsR0FBQTthQUFHLEtBQUg7SUFBQSxDQUFSLEVBQUg7RUFBQSxDQWJQLENBQUE7O0FBQUEsRUFlQSxXQUFBLEdBQWMsU0FBQSxHQUFBO0FBQ1osSUFBQSxJQUFJLENBQUMsYUFBTCxDQUFBLENBQUEsQ0FEWTtFQUFBLENBZmQsQ0FBQTs7QUFBQSxFQW1CQSxXQUFBLEdBQWMsU0FBQSxHQUFBO1dBQUcsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxTQUFBLEdBQUE7QUFDdkIsVUFBQSxtREFBQTtBQUFBLE1BQUEsUUFBQSxHQUFXO0FBQUEsUUFBQSxLQUFBLEVB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

//# sourceURL=/home/takaaki/.atom/packages/git-control/lib/git.coffee
