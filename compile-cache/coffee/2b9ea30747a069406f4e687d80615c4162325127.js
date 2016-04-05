(function() {
  var BufferedProcess, GitOps, path;

  GitOps = require('../lib/git/shellout');

  BufferedProcess = require('atom').BufferedProcess;

  path = require('path');

  describe('GitBridge', function() {
    var context, gitWorkDir;
    gitWorkDir = "/fake/gitroot/";
    context = [][0];
    beforeEach(function() {
      atom.config.set('merge-conflicts.gitPath', '/usr/bin/git');
      return waitsForPromise(function() {
        return GitOps.getGitContext().then(function(c) {
          context = c;
          return context.workingDirPath = gitWorkDir;
        });
      });
    });
    it('checks git status for merge conflicts', function() {
      var a, c, conflicts, o, _ref;
      _ref = [], c = _ref[0], a = _ref[1], o = _ref[2];
      context.mockProcess(function(_arg) {
        var args, command, exit, options, stderr, stdout, _ref1;
        command = _arg.command, args = _arg.args, options = _arg.options, stdout = _arg.stdout, stderr = _arg.stderr, exit = _arg.exit;
        _ref1 = [command, args, options], c = _ref1[0], a = _ref1[1], o = _ref1[2];
        stdout('UU lib/file0.rb');
        stdout('AA lib/file1.rb');
        stdout('M  lib/file2.rb');
        exit(0);
        return {
          process: {
            on: function(callback) {}
          }
        };
      });
      conflicts = [];
      waitsForPromise(function() {
        return context.readConflicts().then(function(cs) {
          return conflicts = cs;
        })["catch"](function(e) {
          throw e;
        });
      });
      return runs(function() {
        expect(conflicts).toEqual([
          {
            path: 'lib/file0.rb',
            message: 'both modified'
          }, {
            path: 'lib/file1.rb',
            message: 'both added'
          }
        ]);
        expect(c).toBe('/usr/bin/git');
        expect(a).toEqual(['status', '--porcelain']);
        return expect(o).toEqual({
          cwd: gitWorkDir
        });
      });
    });
    describe('isStaged', function() {
      var statusMeansStaged;
      statusMeansStaged = function(status, checkPath) {
        if (checkPath == null) {
          checkPath = 'lib/file2.txt';
        }
        context.mockProcess(function(_arg) {
          var exit, stdout;
          stdout = _arg.stdout, exit = _arg.exit;
          stdout("" + status + " lib/file2.txt");
          exit(0);
          return {
            process: {
              on: function(callback) {}
            }
          };
        });
        return context.isStaged(checkPath);
      };
      it('is true if already resolved', function() {
        return waitsForPromise(function() {
          return statusMeansStaged('M ').then(function(s) {
            return expect(s).toBe(true);
          });
        });
      });
      it('is true if resolved as ours', function() {
        return waitsForPromise(function() {
          return statusMeansStaged(' M', 'lib/file1.txt').then(function(s) {
            return expect(s).toBe(true);
          });
        });
      });
      it('is false if still in conflict', function() {
        return waitsForPromise(function() {
          return statusMeansStaged('UU').then(function(s) {
            return expect(s).toBe(false);
          });
        });
      });
      return it('is false if resolved, but then modified', function() {
        return waitsForPromise(function() {
          return statusMeansStaged('MM').then(function(s) {
            return expect(s).toBe(false);
          });
        });
      });
    });
    it('checks out "our" version of a file from the index', function() {
      var a, c, called, o, _ref;
      _ref = [], c = _ref[0], a = _ref[1], o = _ref[2];
      context.mockProcess(function(_arg) {
        var args, command, exit, options, _ref1;
        command = _arg.command, args = _arg.args, options = _arg.options, exit = _arg.exit;
        _ref1 = [command, args, options], c = _ref1[0], a = _ref1[1], o = _ref1[2];
        exit(0);
        return {
          process: {
            on: function(callback) {}
          }
        };
      });
      called = false;
      waitsForPromise(function() {
        return context.checkoutSide('ours', 'lib/file1.txt').then(function() {
          return called = true;
        });
      });
      return runs(function() {
        expect(called).toBe(true);
        expect(c).toBe('/usr/bin/git');
        expect(a).toEqual(['checkout', '--ours', 'lib/file1.txt']);
        return expect(o).toEqual({
          cwd: gitWorkDir
        });
      });
    });
    it('stages changes to a file', function() {
      var called, p;
      p = "";
      context.repository.repo.add = function(path) {
        return p = path;
      };
      called = false;
      waitsForPromise(function() {
        return context.add('lib/file1.txt').then(function() {
          return called = true;
        });
      });
      return runs(function() {
        expect(called).toBe(true);
        return expect(p).toBe('lib/file1.txt');
      });
    });
    return describe('rebase detection', function() {
      var withRoot;
      withRoot = function(gitDir, callback) {
        var fullDir, saved;
        fullDir = path.join(atom.project.getDirectories()[0].getPath(), gitDir);
        saved = context.repository.getPath;
        context.repository.getPath = function() {
          return fullDir;
        };
        callback();
        return context.repository.getPath = saved;
      };
      it('recognizes a non-interactive rebase', function() {
        return withRoot('rebasing.git', function() {
          return expect(context.isRebasing()).toBe(true);
        });
      });
      it('recognizes an interactive rebase', function() {
        return withRoot('irebasing.git', function() {
          return expect(context.isRebasing()).toBe(true);
        });
      });
      return it('returns false if not rebasing', function() {
        return withRoot('merging.git', function() {
          return expect(context.isRebasing()).toBe(false);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9tZXJnZS1jb25mbGljdHMvc3BlYy9naXQtc2hlbGxvdXQtc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsNkJBQUE7O0FBQUEsRUFBQSxNQUFBLEdBQVMsT0FBQSxDQUFRLHFCQUFSLENBQVQsQ0FBQTs7QUFBQSxFQUNDLGtCQUFtQixPQUFBLENBQVEsTUFBUixFQUFuQixlQURELENBQUE7O0FBQUEsRUFFQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FGUCxDQUFBOztBQUFBLEVBSUEsUUFBQSxDQUFTLFdBQVQsRUFBc0IsU0FBQSxHQUFBO0FBRXBCLFFBQUEsbUJBQUE7QUFBQSxJQUFBLFVBQUEsR0FBYSxnQkFBYixDQUFBO0FBQUEsSUFFQyxVQUFXLEtBRlosQ0FBQTtBQUFBLElBSUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHlCQUFoQixFQUEyQyxjQUEzQyxDQUFBLENBQUE7YUFFQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtlQUNkLE1BQU0sQ0FBQyxhQUFQLENBQUEsQ0FDQSxDQUFDLElBREQsQ0FDTSxTQUFDLENBQUQsR0FBQTtBQUNKLFVBQUEsT0FBQSxHQUFVLENBQVYsQ0FBQTtpQkFDQSxPQUFPLENBQUMsY0FBUixHQUF5QixXQUZyQjtRQUFBLENBRE4sRUFEYztNQUFBLENBQWhCLEVBSFM7SUFBQSxDQUFYLENBSkEsQ0FBQTtBQUFBLElBYUEsRUFBQSxDQUFHLHVDQUFILEVBQTRDLFNBQUEsR0FBQTtBQUMxQyxVQUFBLHdCQUFBO0FBQUEsTUFBQSxPQUFZLEVBQVosRUFBQyxXQUFELEVBQUksV0FBSixFQUFPLFdBQVAsQ0FBQTtBQUFBLE1BQ0EsT0FBTyxDQUFDLFdBQVIs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

//# sourceURL=/home/takaaki/.atom/packages/merge-conflicts/spec/git-shellout-spec.coffee
