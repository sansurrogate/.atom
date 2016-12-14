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
        return GitOps.getContext().then(function(c) {
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
    describe('isResolvedFile', function() {
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
        return context.isResolvedFile(checkPath);
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
        return context.resolveFile('lib/file1.txt').then(function() {
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9tZXJnZS1jb25mbGljdHMvc3BlYy9naXQtc2hlbGxvdXQtc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsNkJBQUE7O0FBQUEsRUFBQSxNQUFBLEdBQVMsT0FBQSxDQUFRLHFCQUFSLENBQVQsQ0FBQTs7QUFBQSxFQUNDLGtCQUFtQixPQUFBLENBQVEsTUFBUixFQUFuQixlQURELENBQUE7O0FBQUEsRUFFQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FGUCxDQUFBOztBQUFBLEVBSUEsUUFBQSxDQUFTLFdBQVQsRUFBc0IsU0FBQSxHQUFBO0FBRXBCLFFBQUEsbUJBQUE7QUFBQSxJQUFBLFVBQUEsR0FBYSxnQkFBYixDQUFBO0FBQUEsSUFFQyxVQUFXLEtBRlosQ0FBQTtBQUFBLElBSUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHlCQUFoQixFQUEyQyxjQUEzQyxDQUFBLENBQUE7YUFFQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtlQUNkLE1BQU0sQ0FBQyxVQUFQLENBQUEsQ0FDQSxDQUFDLElBREQsQ0FDTSxTQUFDLENBQUQsR0FBQTtBQUNKLFVBQUEsT0FBQSxHQUFVLENBQVYsQ0FBQTtpQkFDQSxPQUFPLENBQUMsY0FBUixHQUF5QixXQUZyQjtRQUFBLENBRE4sRUFEYztNQUFBLENBQWhCLEVBSFM7SUFBQSxDQUFYLENBSkEsQ0FBQTtBQUFBLElBYUEsRUFBQSxDQUFHLHVDQUFILEVBQTRDLFNBQUEsR0FBQTtBQUMxQyxVQUFBLHdCQUFBO0FBQUEsTUFBQSxPQUFZLEVBQVosRUFBQyxXQUFELEVBQUksV0FBSixFQUFPLFdBQVAsQ0FBQTtBQUFBLE1BQ0EsT0FBTyxDQUFDLFdBQVIs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

//# sourceURL=/home/takaaki/.atom/packages/merge-conflicts/spec/git-shellout-spec.coffee
