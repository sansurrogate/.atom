(function() {
  var OutputViewManager, Path, git, notifier;

  Path = require('flavored-path');

  git = require('../git');

  notifier = require('../notifier');

  OutputViewManager = require('../output-view-manager');

  module.exports = function(repo, _arg) {
    var file, _ref;
    file = (_arg != null ? _arg : {}).file;
    if (file == null) {
      file = repo.relativize((_ref = atom.workspace.getActiveTextEditor()) != null ? _ref.getPath() : void 0);
    }
    if (!file) {
      return notifier.addInfo("No open file. Select 'Diff All'.");
    }
    return git.getConfig('diff.tool', repo.getWorkingDirectory()).then(function(tool) {
      if (!tool) {
        return notifier.addInfo("You don't have a difftool configured.");
      } else {
        return git.cmd(['diff-index', 'HEAD', '-z'], {
          cwd: repo.getWorkingDirectory()
        }).then(function(data) {
          var args, diffIndex, diffsForCurrentFile, includeStagedDiff;
          diffIndex = data.split('\0');
          includeStagedDiff = atom.config.get('git-plus.includeStagedDiff');
          diffsForCurrentFile = diffIndex.map(function(line, i) {
            var path, staged;
            if (i % 2 === 0) {
              staged = !/^0{40}$/.test(diffIndex[i].split(' ')[3]);
              path = diffIndex[i + 1];
              if (path === file && (!staged || includeStagedDiff)) {
                return true;
              }
            } else {
              return void 0;
            }
          });
          if (diffsForCurrentFile.filter(function(diff) {
            return diff != null;
          })[0] != null) {
            args = ['difftool', '--no-prompt'];
            if (includeStagedDiff) {
              args.push('HEAD');
            }
            args.push(file);
            return git.cmd(args, {
              cwd: repo.getWorkingDirectory()
            })["catch"](function(msg) {
              return OutputViewManager["new"]().addLine(msg).finish();
            });
          } else {
            return notifier.addInfo('Nothing to show.');
          }
        });
      }
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvbW9kZWxzL2dpdC1kaWZmdG9vbC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsc0NBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLGVBQVIsQ0FBUCxDQUFBOztBQUFBLEVBQ0EsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSLENBRE4sQ0FBQTs7QUFBQSxFQUVBLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUixDQUZYLENBQUE7O0FBQUEsRUFHQSxpQkFBQSxHQUFvQixPQUFBLENBQVEsd0JBQVIsQ0FIcEIsQ0FBQTs7QUFBQSxFQUtBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsSUFBRCxFQUFPLElBQVAsR0FBQTtBQUNmLFFBQUEsVUFBQTtBQUFBLElBRHVCLHVCQUFELE9BQU8sSUFBTixJQUN2QixDQUFBOztNQUFBLE9BQVEsSUFBSSxDQUFDLFVBQUwsNkRBQW9ELENBQUUsT0FBdEMsQ0FBQSxVQUFoQjtLQUFSO0FBQ0EsSUFBQSxJQUFHLENBQUEsSUFBSDtBQUNFLGFBQU8sUUFBUSxDQUFDLE9BQVQsQ0FBaUIsa0NBQWpCLENBQVAsQ0FERjtLQURBO1dBS0EsR0FBRyxDQUFDLFNBQUosQ0FBYyxXQUFkLEVBQTJCLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQTNCLENBQXNELENBQUMsSUFBdkQsQ0FBNEQsU0FBQyxJQUFELEdBQUE7QUFDMUQsTUFBQSxJQUFBLENBQUEsSUFBQTtlQUNFLFFBQVEsQ0FBQyxPQUFULENBQWlCLHVDQUFqQixFQURGO09BQUEsTUFBQTtlQUdFLEdBQUcsQ0FBQyxHQUFKLENBQVEsQ0FBQyxZQUFELEVBQWUsTUFBZixFQUF1QixJQUF2QixDQUFSLEVBQXNDO0FBQUEsVUFBQSxHQUFBLEVBQUssSUFBSSxDQUFDLG1CQUFMLENBQUEsQ0FBTDtTQUF0QyxDQUNBLENBQUMsSUFERCxDQUNNLFNBQUMsSUFBRCxHQUFBO0FBQ0osY0FBQSx1REFBQTtBQUFBLFVBQUEsU0FBQSxHQUFZLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBWCxDQUFaLENBQUE7QUFBQSxVQUNBLGlCQUFBLEdBQW9CLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw0QkFBaEIsQ0FEcEIsQ0FBQTtBQUFBLFVBRUEsbUJBQUEsR0FBc0IsU0FBUyxDQUFDLEdBQVYsQ0FBYyxTQUFDLElBQUQsRUFBTyxDQUFQLEdBQUE7QUFDbEMsZ0JBQUEsWUFBQTtBQUFBLFlBQUEsSUFBRyxDQUFBLEdBQUksQ0FBSixLQUFTLENBQVo7QUFDRSxjQUFBLE1BQUEsR0FBUyxDQUFBLFNBQWEsQ0FBQyxJQUFWLENBQWUsU0FBVSxDQUFBLENBQUEsQ0FBRSxDQUFDLEtBQWIsQ0FBbUIsR0FBbkIsQ0FBd0IsQ0FBQSxDQUFBLENBQXZDLENBQWIsQ0FBQTtBQUFBLGNBQ0EsSUFBQSxHQUFPLFNBQVUsQ0FBQSxDQUFBLEdBQUUsQ0FBRixDQURqQixDQUFBO0FBRUEsY0FBQSxJQUFRLElBQUEsS0FBUSxJQUFSLElBQWlCLENBQUMsQ0FBQSxNQUFBLElBQVcsaUJBQVosQ0FBekI7dUJBQUEsS0FBQTtlQUhGO2FBQUEsTUFBQTtxQkFLRSxPQUxGO2FBRGtDO1VBQUEsQ0FBZCxDQUZ0QixDQUFBO0FBVUEsVUFBQSxJQUFHOzt1QkFBSDtBQUNFLFlBQUEsSUFBQSxHQUFPLENBQUMsVUFBRCxFQUFhLGFBQWIsQ0FBUCxDQUFBO0FBQ0EsWUFBQSxJQUFvQixpQkFBcEI7QUFBQSxjQUFBLElBQUksQ0FBQyxJQUFMLENBQVUsTUFBVixDQUFBLENBQUE7YUFEQTtBQUFBLFlBRUEsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFWLENBRkEsQ0FBQTttQkFHQSxHQUFHLENBQUMsR0FBSixDQUFRLElBQVIsRUFBYztBQUFBLGNBQUEsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQUw7YUFBZCxDQUNBLENBQUMsT0FBRCxDQURBLENBQ08sU0FBQyxHQUFELEdBQUE7cUJBQVMsaUJBQWlCLENBQUMsS0FBRCxDQUFqQixDQUFBLENBQXVCLENBQUMsT0FBeEIsQ0FBZ0MsR0FBaEMsQ0FBb0MsQ0FBQyxNQUFyQyxDQUFBLEVBQVQ7WUFBQSxDQURQLEVBSkY7V0FBQSxNQUFBO21CQU9FLFFBQVEsQ0FBQyxPQUFULENBQWlCLGtCQUFqQixFQVBGO1dBWEk7UUFBQSxDQUROLEVBSEY7T0FEMEQ7SUFBQSxDQUE1RCxFQU5lO0VBQUEsQ0FMakIsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/takaaki/.atom/packages/git-plus/lib/models/git-difftool.coffee
