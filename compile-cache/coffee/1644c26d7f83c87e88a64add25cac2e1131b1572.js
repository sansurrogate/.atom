(function() {
  var Path, head, mocks, pathToRepoFile;

  Path = require('flavored-path');

  pathToRepoFile = Path.get("~/some/repository/directory/file");

  head = jasmine.createSpyObj('head', ['replace']);

  module.exports = mocks = {
    pathToRepoFile: pathToRepoFile,
    repo: {
      getPath: function() {
        return Path.join(this.getWorkingDirectory(), ".git");
      },
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
      getReferences: function() {
        return {
          heads: [head]
        };
      },
      getShortHead: function() {
        return 'short head';
      },
      isPathModified: function() {
        return false;
      },
      repo: {
        submoduleForPath: function(path) {
          return void 0;
        }
      }
    },
    currentPane: {
      isAlive: function() {
        return true;
      },
      activate: function() {
        return void 0;
      },
      destroy: function() {
        return void 0;
      },
      getItems: function() {
        return [
          {
            getURI: function() {
              return pathToRepoFile;
            }
          }
        ];
      }
    },
    commitPane: {
      isAlive: function() {
        return true;
      },
      destroy: function() {
        return mocks.textEditor.destroy();
      },
      splitRight: function() {
        return void 0;
      },
      getItems: function() {
        return [
          {
            getURI: function() {
              return Path.join(mocks.repo.getPath(), 'COMMIT_EDITMSG');
            }
          }
        ];
      }
    },
    textEditor: {
      getPath: function() {
        return pathToRepoFile;
      },
      getURI: function() {
        return pathToRepoFile;
      },
      onDidDestroy: function(destroy) {
        this.destroy = destroy;
        return {
          dispose: function() {}
        };
      },
      onDidSave: function(save) {
        this.save = save;
        return {
          dispose: function() {
            return void 0;
          }
        };
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9zcGVjL2ZpeHR1cmVzLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxpQ0FBQTs7QUFBQSxFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsZUFBUixDQUFQLENBQUE7O0FBQUEsRUFFQSxjQUFBLEdBQWlCLElBQUksQ0FBQyxHQUFMLENBQVMsa0NBQVQsQ0FGakIsQ0FBQTs7QUFBQSxFQUlBLElBQUEsR0FBTyxPQUFPLENBQUMsWUFBUixDQUFxQixNQUFyQixFQUE2QixDQUFDLFNBQUQsQ0FBN0IsQ0FKUCxDQUFBOztBQUFBLEVBTUEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsS0FBQSxHQUNmO0FBQUEsSUFBQSxjQUFBLEVBQWdCLGNBQWhCO0FBQUEsSUFFQSxJQUFBLEVBQ0U7QUFBQSxNQUFBLE9BQUEsRUFBUyxTQUFBLEdBQUE7ZUFBRyxJQUFJLENBQUMsSUFBTCxDQUFVLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQVYsRUFBc0MsTUFBdEMsRUFBSDtNQUFBLENBQVQ7QUFBQSxNQUNBLG1CQUFBLEVBQXFCLFNBQUEsR0FBQTtlQUFHLElBQUksQ0FBQyxHQUFMLENBQVMsbUJBQVQsRUFBSDtNQUFBLENBRHJCO0FBQUEsTUFFQSxhQUFBLEVBQWUsU0FBQSxHQUFBO2VBQUcsT0FBSDtNQUFBLENBRmY7QUFBQSxNQUdBLFVBQUEsRUFBWSxTQUFDLElBQUQsR0FBQTtBQUFVLFFBQUEsSUFBb0IsSUFBQSxLQUFRLGNBQTVCO2lCQUFBLGlCQUFBO1NBQVY7TUFBQSxDQUhaO0FBQUEsTUFJQSxhQUFBLEVBQWUsU0FBQSxHQUFBO2VBQ2I7QUFBQSxVQUFBLEtBQUEsRUFBTyxDQUFDLElBQUQsQ0FBUDtVQURhO01BQUEsQ0FKZjtBQUFBLE1BTUEsWUFBQSxFQUFjLFNBQUEsR0FBQTtlQUFHLGFBQUg7TUFBQSxDQU5kO0FBQUEsTUFPQSxjQUFBLEVBQWdCLFNBQUEsR0FBQTtlQUFHLE1BQUg7TUFBQSxDQVBoQjtBQUFBLE1BUUEsSUFBQSxFQUNFO0FBQUEsUUFBQSxnQkFBQSxFQUFrQixTQUFDLElBQUQsR0FBQTtpQkFBVSxPQUFWO1FBQUEsQ0FBbEI7T0FURjtLQUhGO0FBQUEsSUFjQSxXQUFBLEVBQ0U7QUFBQSxNQUFBLE9BQUEsRUFBUyxTQUFBLEdBQUE7ZUFBRyxLQUFIO01BQUEsQ0FBVDtBQUFBLE1BQ0EsUUFBQSxFQUFVLFNBQUEsR0FBQTtlQUFHLE9BQUg7TUFBQSxDQURWO0FBQUEsTUFFQSxPQUFBLEVBQVMsU0FBQSxHQUFBO2VBQUcsT0FBSDtNQUFBLENBRlQ7QUFBQSxNQUdBLFFBQUEsRUFBVSxTQUFBLEdBQUE7ZUFBRztVQUNYO0FBQUEsWUFBQSxNQUFBLEVBQVEsU0FBQSxHQUFBO3FCQUFHLGVBQUg7WUFBQSxDQUFSO1dBRFc7VUFBSDtNQUFBLENBSFY7S0FmRjtBQUFBLElBc0JBLFVBQUEsRUFDRTtBQUFBLE1BQUEsT0FBQSxFQUFTLFNBQUEsR0FBQTtlQUFHLEtBQUg7TUFBQSxDQUFUO0FBQUEsTUFDQSxPQUFBLEVBQVMsU0FBQSxHQUFBO2VBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxPQUFqQixDQUFBLEVBQUg7TUFBQSxDQURUO0FBQUEsTUFFQSxVQUFBLEVBQVksU0FBQSxHQUFBO2VBQUcsT0FBSDtNQUFBLENBRlo7QUFBQSxNQUdBLFFBQUEsRUFBVSxTQUFBLEdBQUE7ZUFBRztVQUNYO0FBQUEsWUFBQSxNQUFBLEVBQVEsU0FBQSxHQUFBO3FCQUFHLElBQUksQ0FBQyxJQUFMLENBQVUsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFYLENBQUEsQ0FBVixFQUFnQyxnQkFBaEMsRUFBSDtZQUFBLENBQVI7V0FEVztVQUFIO01BQUEsQ0FIVjtLQXZCRjtBQUFBLElBOEJBLFVBQUEsRUFDRTtBQUFBLE1BQUEsT0FBQSxFQUFTLFNBQUEsR0FBQTtlQUFHLGVBQUg7TUFBQSxDQUFUO0FBQUEsTUFDQSxNQUFBLEVBQVEsU0FBQSxHQUFBO2VBQUcsZUFBSDtNQUFBLENBRFI7QUFBQSxNQUVBLFlBQUEsRUFBYyxTQUFFLE9BQUYsR0FBQTtBQUNaLFFBRGEsSUFBQyxDQUFBLFVBQUEsT0FDZCxDQUFBO2VBQUE7QUFBQSxVQUFBLE9BQUEsRUFBUyxTQUFBLEdBQUEsQ0FBVDtVQURZO01BQUEsQ0FGZDtBQUFBLE1BSUEsU0FBQSxFQUFXLFNBQUUsSUFBRixHQUFBO0FBQ1QsUUFEVSxJQUFDLENBQUEsT0FBQSxJQUNYLENBQUE7ZUFBQTtBQUFBLFVBQUEsT0FBQSxFQUFTLFNBQUEsR0FBQTttQkFBRyxPQUFIO1VBQUEsQ0FBVDtVQURTO01BQUEsQ0FKWDtLQS9CRjtHQVBGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/takaaki/.atom/packages/git-plus/spec/fixtures.coffee
