(function() {
  var OutputViewManager, fs, git, notifier;

  git = require('../git');

  notifier = require('../notifier');

  OutputViewManager = require('../output-view-manager');

  fs = require('fs-plus');

  module.exports = function(repo, _arg) {
    var file, isFolder, _ref;
    file = (_arg != null ? _arg : {}).file;
    if (file == null) {
      file = repo.relativize((_ref = atom.workspace.getActiveTextEditor()) != null ? _ref.getPath() : void 0);
    }
    isFolder = fs.isDirectorySync(file);
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
          if (isFolder) {
            args = ['difftool', '-d', '--no-prompt'];
            if (includeStagedDiff) {
              args.push('HEAD');
            }
            args.push(file);
            git.cmd(args, {
              cwd: repo.getWorkingDirectory()
            })["catch"](function(msg) {
              return OutputViewManager.create().setContent(msg).finish();
            });
            return;
          }
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
              return OutputViewManager.create().setContent(msg).finish();
            });
          } else {
            return notifier.addInfo('Nothing to show.');
          }
        });
      }
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvbW9kZWxzL2dpdC1kaWZmdG9vbC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsb0NBQUE7O0FBQUEsRUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVIsQ0FBTixDQUFBOztBQUFBLEVBQ0EsUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSLENBRFgsQ0FBQTs7QUFBQSxFQUVBLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSx3QkFBUixDQUZwQixDQUFBOztBQUFBLEVBR0EsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSLENBSEwsQ0FBQTs7QUFBQSxFQUtBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsSUFBRCxFQUFPLElBQVAsR0FBQTtBQUNmLFFBQUEsb0JBQUE7QUFBQSxJQUR1Qix1QkFBRCxPQUFPLElBQU4sSUFDdkIsQ0FBQTs7TUFBQSxPQUFRLElBQUksQ0FBQyxVQUFMLDZEQUFvRCxDQUFFLE9BQXRDLENBQUEsVUFBaEI7S0FBUjtBQUFBLElBQ0EsUUFBQSxHQUFXLEVBQUUsQ0FBQyxlQUFILENBQW1CLElBQW5CLENBRFgsQ0FBQTtBQUdBLElBQUEsSUFBRyxDQUFBLElBQUg7QUFDRSxhQUFPLFFBQVEsQ0FBQyxPQUFULENBQWlCLGtDQUFqQixDQUFQLENBREY7S0FIQTtXQVFBLEdBQUcsQ0FBQyxTQUFKLENBQWMsV0FBZCxFQUEyQixJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUEzQixDQUFzRCxDQUFDLElBQXZELENBQTRELFNBQUMsSUFBRCxHQUFBO0FBQzFELE1BQUEsSUFBQSxDQUFBLElBQUE7ZUFDRSxRQUFRLENBQUMsT0FBVCxDQUFpQix1Q0FBakIsRUFERjtPQUFBLE1BQUE7ZUFHRSxHQUFHLENBQUMsR0FBSixDQUFRLENBQUMsWUFB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

//# sourceURL=/home/takaaki/.atom/packages/git-plus/lib/models/git-difftool.coffee
