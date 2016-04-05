(function() {
  var Path, commitPane, currentPane, fs, git, mockRepo, mockRepoWithSubmodule, mockSubmodule, notifier, pathToRepoFile, pathToSubmoduleFile, repo, textEditor, _ref;

  fs = require('fs-plus');

  Path = require('flavored-path');

  git = require('../lib/git');

  notifier = require('../lib/notifier');

  _ref = require('./fixtures'), repo = _ref.repo, pathToRepoFile = _ref.pathToRepoFile, textEditor = _ref.textEditor, commitPane = _ref.commitPane, currentPane = _ref.currentPane;

  pathToSubmoduleFile = Path.get("~/some/submodule/file");

  mockRepo = {
    getWorkingDirectory: function() {
      return Path.get("~/some/repository");
    },
    refreshStatus: function() {
      return void 0;
    },
    relativize: function(path) {
      if (path === pathToRepoFile) {
        return "directory/file";
      }
    },
    repo: {
      submoduleForPath: function(path) {
        return void 0;
      }
    }
  };

  mockSubmodule = {
    getWorkingDirectory: function() {
      return Path.get("~/some/submodule");
    },
    relativize: function(path) {
      if (path === pathToSubmoduleFile) {
        return "file";
      }
    }
  };

  mockRepoWithSubmodule = Object.create(mockRepo);

  mockRepoWithSubmodule.repo = {
    submoduleForPath: function(path) {
      if (path === pathToSubmoduleFile) {
        return mockSubmodule;
      }
    }
  };

  describe("Git-Plus git module", function() {
    describe("git.getConfig", function() {
      var args;
      args = ['config', '--get', 'user.name'];
      describe("when a repo file path isn't specified", function() {
        return it("spawns a command querying git for the given global setting", function() {
          spyOn(git, 'cmd').andReturn(Promise.resolve('akonwi'));
          waitsForPromise(function() {
            return git.getConfig('user.name');
          });
          return runs(function() {
            return expect(git.cmd).toHaveBeenCalledWith(args, {
              cwd: Path.get('~')
            });
          });
        });
      });
      describe("when a repo file path is specified", function() {
        return it("checks for settings in that repo", function() {
          spyOn(git, 'cmd').andReturn(Promise.resolve('akonwi'));
          waitsForPromise(function() {
            return git.getConfig('user.name', repo.getWorkingDirectory());
          });
          return runs(function() {
            return expect(git.cmd).toHaveBeenCalledWith(args, {
              cwd: repo.getWorkingDirectory()
            });
          });
        });
      });
      describe("when the command fails without an error message", function() {
        return it("resolves to ''", function() {
          spyOn(git, 'cmd').andReturn(Promise.reject(''));
          waitsForPromise(function() {
            return git.getConfig('user.name', repo.getWorkingDirectory()).then(function(result) {
              return expect(result).toEqual('');
            });
          });
          return runs(function() {
            return expect(git.cmd).toHaveBeenCalledWith(args, {
              cwd: repo.getWorkingDirectory()
            });
          });
        });
      });
      return describe("when the command fails with an error message", function() {
        return it("rejects with the error message", function() {
          spyOn(git, 'cmd').andReturn(Promise.reject('getConfig error'));
          spyOn(notifier, 'addError');
          return waitsForPromise(function() {
            return git.getConfig('user.name', 'bad working dir').then(function(result) {
              return fail("should have been rejected");
            })["catch"](function(error) {
              return expect(notifier.addError).toHaveBeenCalledWith('getConfig error');
            });
          });
        });
      });
    });
    describe("git.getRepo", function() {
      return it("returns a promise resolving to repository", function() {
        spyOn(atom.project, 'getRepositories').andReturn([repo]);
        return waitsForPromise(function() {
          return git.getRepo().then(function(actual) {
            return expect(actual.getWorkingDirectory()).toEqual(repo.getWorkingDirectory());
          });
        });
      });
    });
    describe("git.dir", function() {
      return it("returns a promise resolving to absolute path of repo", function() {
        spyOn(atom.workspace, 'getActiveTextEditor').andReturn(textEditor);
        spyOn(atom.project, 'getRepositories').andReturn([repo]);
        return git.dir().then(function(dir) {
          return expect(dir).toEqual(repo.getWorkingDirectory());
        });
      });
    });
    describe("git.getSubmodule", function() {
      it("returns undefined when there is no submodule", function() {
        return expect(git.getSubmodule(pathToRepoFile)).toBe(void 0);
      });
      return it("returns a submodule when given file is in a submodule of a project repo", function() {
        spyOn(atom.project, 'getRepositories').andCallFake(function() {
          return [mockRepoWithSubmodule];
        });
        return expect(git.getSubmodule(pathToSubmoduleFile).getWorkingDirectory()).toEqual(Path.get("~/some/submodule"));
      });
    });
    describe("git.relativize", function() {
      return it("returns relativized filepath for files in repo", function() {
        spyOn(atom.project, 'getRepositories').andCallFake(function() {
          return [mockRepo, mockRepoWithSubmodule];
        });
        expect(git.relativize(pathToRepoFile)).toBe('directory/file');
        return expect(git.relativize(pathToSubmoduleFile)).toBe("file");
      });
    });
    describe("git.cmd", function() {
      it("returns a promise", function() {
        return waitsForPromise(function() {
          var promise;
          promise = git.cmd();
          expect(promise["catch"]).toBeDefined();
          expect(promise.then).toBeDefined();
          return promise["catch"](function(output) {
            return expect(output).toContain('usage');
          });
        });
      });
      it("returns a promise that is fulfilled with stdout on success", function() {
        return waitsForPromise(function() {
          return git.cmd(['--version']).then(function(output) {
            return expect(output).toContain('git version');
          });
        });
      });
      it("returns a promise that is rejected with stderr on failure", function() {
        return waitsForPromise(function() {
          return git.cmd(['help', '--bogus-option'])["catch"](function(output) {
            return expect(output).toContain('unknown option');
          });
        });
      });
      return it("returns a promise that is fulfilled with stderr on success", function() {
        var cloneDir, initDir;
        initDir = 'git-plus-test-dir' + Math.random();
        cloneDir = initDir + '-clone';
        return waitsForPromise(function() {
          return git.cmd(['init', initDir]).then(function() {
            return git.cmd(['clone', '--progress', initDir, cloneDir]);
          }).then(function(output) {
            fs.removeSync(initDir);
            fs.removeSync(cloneDir);
            return expect(output).toContain('Cloning');
          });
        });
      });
    });
    describe("git.add", function() {
      it("calls git.cmd with ['add', '--all', {fileName}]", function() {
        spyOn(git, 'cmd').andCallFake(function() {
          return Promise.resolve(true);
        });
        return waitsForPromise(function() {
          return git.add(mockRepo, {
            file: pathToSubmoduleFile
          }).then(function(success) {
            return expect(git.cmd).toHaveBeenCalledWith(['add', '--all', pathToSubmoduleFile], {
              cwd: mockRepo.getWorkingDirectory()
            });
          });
        });
      });
      it("calls git.cmd with ['add', '--all', '.'] when no file is specified", function() {
        spyOn(git, 'cmd').andCallFake(function() {
          return Promise.resolve(true);
        });
        return waitsForPromise(function() {
          return git.add(mockRepo).then(function(success) {
            return expect(git.cmd).toHaveBeenCalledWith(['add', '--all', '.'], {
              cwd: mockRepo.getWorkingDirectory()
            });
          });
        });
      });
      it("calls git.cmd with ['add', '--update'...] when update option is true", function() {
        spyOn(git, 'cmd').andCallFake(function() {
          return Promise.resolve(true);
        });
        return waitsForPromise(function() {
          return git.add(mockRepo, {
            update: true
          }).then(function(success) {
            return expect(git.cmd).toHaveBeenCalledWith(['add', '--update', '.'], {
              cwd: mockRepo.getWorkingDirectory()
            });
          });
        });
      });
      return describe("when it fails", function() {
        return it("notifies of failure", function() {
          spyOn(git, 'cmd').andReturn(Promise.reject('git.add error'));
          spyOn(notifier, 'addError');
          return waitsForPromise(function() {
            return git.add(mockRepo).then(function(result) {
              return fail("should have been rejected");
            })["catch"](function(error) {
              return expect(notifier.addError).toHaveBeenCalledWith('git.add error');
            });
          });
        });
      });
    });
    describe("git.reset", function() {
      return it("resets and unstages all files", function() {
        spyOn(git, 'cmd').andCallFake(function() {
          return Promise.resolve(true);
        });
        return waitsForPromise(function() {
          return git.reset(mockRepo).then(function() {
            return expect(git.cmd).toHaveBeenCalledWith(['reset', 'HEAD'], {
              cwd: mockRepo.getWorkingDirectory()
            });
          });
        });
      });
    });
    describe("git.stagedFiles", function() {
      return it("returns an empty array when there are no staged files", function() {
        spyOn(git, 'cmd').andCallFake(function() {
          return Promise.resolve('');
        });
        return waitsForPromise(function() {
          return git.stagedFiles(mockRepo).then(function(files) {
            return expect(files.length).toEqual(0);
          });
        });
      });
    });
    describe("git.unstagedFiles", function() {
      return it("returns an empty array when there are no unstaged files", function() {
        spyOn(git, 'cmd').andCallFake(function() {
          return Promise.resolve('');
        });
        return waitsForPromise(function() {
          return git.unstagedFiles(mockRepo).then(function(files) {
            return expect(files.length).toEqual(0);
          });
        });
      });
    });
    describe("git.status", function() {
      return it("calls git.cmd with 'status' as the first argument", function() {
        spyOn(git, 'cmd').andCallFake(function() {
          var args;
          args = git.cmd.mostRecentCall.args;
          if (args[0][0] === 'status') {
            return Promise.resolve(true);
          }
        });
        return git.status(mockRepo).then(function() {
          return expect(true).toBeTruthy();
        });
      });
    });
    describe("git.refresh", function() {
      it("calls git.cmd with 'add' and '--refresh' arguments for each repo in project", function() {
        spyOn(git, 'cmd').andCallFake(function() {
          var args;
          args = git.cmd.mostRecentCall.args[0];
          expect(args[0]).toBe('add');
          return expect(args[1]).toBe('--refresh');
        });
        spyOn(mockRepo, 'getWorkingDirectory').andCallFake(function() {
          return expect(mockRepo.getWorkingDirectory.callCount).toBe(1);
        });
        return git.refresh();
      });
      return it("calls repo.refreshStatus for each repo in project", function() {
        spyOn(atom.project, 'getRepositories').andCallFake(function() {
          return [mockRepo];
        });
        spyOn(mockRepo, 'refreshStatus');
        spyOn(git, 'cmd').andCallFake(function() {
          return void 0;
        });
        git.refresh();
        return expect(mockRepo.refreshStatus.callCount).toBe(1);
      });
    });
    return describe("git.diff", function() {
      return it("calls git.cmd with ['diff', '-p', '-U1'] and the file path", function() {
        spyOn(git, 'cmd').andCallFake(function() {
          return Promise.resolve("string");
        });
        git.diff(mockRepo, pathToRepoFile);
        return expect(git.cmd).toHaveBeenCalledWith(['diff', '-p', '-U1', pathToRepoFile], {
          cwd: mockRepo.getWorkingDirectory()
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9zcGVjL2dpdC1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw2SkFBQTs7QUFBQSxFQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUixDQUFMLENBQUE7O0FBQUEsRUFDQSxJQUFBLEdBQU8sT0FBQSxDQUFRLGVBQVIsQ0FEUCxDQUFBOztBQUFBLEVBRUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxZQUFSLENBRk4sQ0FBQTs7QUFBQSxFQUdBLFFBQUEsR0FBVyxPQUFBLENBQVEsaUJBQVIsQ0FIWCxDQUFBOztBQUFBLEVBSUEsT0FNSSxPQUFBLENBQVEsWUFBUixDQU5KLEVBQ0UsWUFBQSxJQURGLEVBRUUsc0JBQUEsY0FGRixFQUdFLGtCQUFBLFVBSEYsRUFJRSxrQkFBQSxVQUpGLEVBS0UsbUJBQUEsV0FURixDQUFBOztBQUFBLEVBV0EsbUJBQUEsR0FBc0IsSUFBSSxDQUFDLEdBQUwsQ0FBUyx1QkFBVCxDQVh0QixDQUFBOztBQUFBLEVBYUEsUUFBQSxHQUNFO0FBQUEsSUFBQSxtQkFBQSxFQUFxQixTQUFBLEdBQUE7YUFBRyxJQUFJLENBQUMsR0FBTCxDQUFTLG1CQUFULEVBQUg7SUFBQSxDQUFyQjtBQUFBLElBQ0EsYUFBQSxFQUFlLFNBQUEsR0FBQTthQUFHLE9BQUg7SUFBQSxDQURmO0FBQUEsSUFFQSxVQUFBLEVBQVksU0FBQyxJQUFELEdBQUE7QUFBVSxNQUFBLElBQW9CLElBQUEsS0FBUSxjQUE1QjtlQUFBLGlCQUFBO09BQVY7SUFBQSxDQUZaO0FBQUEsSUFHQSxJQUFBLEVBQ0U7QUFBQSxNQUFBLGdCQUFBLEVBQWtCLFNBQUMsSUFBRCxHQUFBO2VBQVUsT0FBVjtNQUFBLENBQWxCO0tBSkY7R0FkRixDQUFBOztBQUFBLEVBb0JB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

//# sourceURL=/home/takaaki/.atom/packages/git-plus/spec/git-spec.coffee
