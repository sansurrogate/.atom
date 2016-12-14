(function() {
  var OutputViewManager, Path, fs, git, notifier;

  Path = require('flavored-path');

  git = require('../git');

  notifier = require('../notifier');

  OutputViewManager = require('../output-view-manager');

  fs = require('fs-plus');

  module.exports = function(repo, _arg) {
    var file, isFolder, packageObj, sublimeTabs, treeView, _ref;
    file = (_arg != null ? _arg : {}).file;
    if (atom.packages.isPackageLoaded('tree-view')) {
      treeView = atom.packages.getLoadedPackage('tree-view');
      treeView = require(treeView.mainModulePath);
      packageObj = treeView.serialize();
    } else if (atom.packages.isPackageLoaded('sublime-tabs')) {
      sublimeTabs = atom.packages.getLoadedPackage('sublime-tabs');
      sublimeTabs = require(sublimeTabs.mainModulePath);
      packageObj = sublimeTabs.serialize();
    } else {
      console.warn("Git-plus: no tree-view or sublime-tabs package loaded");
    }
    isFolder = false;
    if (!file) {
      if (packageObj != null ? packageObj.selectedPath : void 0) {
        isFolder = fs.isDirectorySync(packageObj.selectedPath);
        if (file == null) {
          file = repo.relativize(packageObj.selectedPath);
        }
      }
    } else {
      isFolder = fs.isDirectorySync(file);
    }
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
          if (isFolder) {
            args = ['difftool', '-d', '--no-prompt'];
            if (includeStagedDiff) {
              args.push('HEAD');
            }
            args.push(file);
            git.cmd(args, {
              cwd: repo.getWorkingDirectory()
            })["catch"](function(msg) {
              return OutputViewManager.create().addLine(msg).finish();
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
              return OutputViewManager.create().addLine(msg).finish();
            });
          } else {
            return notifier.addInfo('Nothing to show.');
          }
        });
      }
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvbW9kZWxzL2dpdC1kaWZmdG9vbC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsMENBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLGVBQVIsQ0FBUCxDQUFBOztBQUFBLEVBQ0EsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSLENBRE4sQ0FBQTs7QUFBQSxFQUVBLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUixDQUZYLENBQUE7O0FBQUEsRUFHQSxpQkFBQSxHQUFvQixPQUFBLENBQVEsd0JBQVIsQ0FIcEIsQ0FBQTs7QUFBQSxFQUlBLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUixDQUpMLENBQUE7O0FBQUEsRUFNQSxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLElBQUQsRUFBTyxJQUFQLEdBQUE7QUFFZixRQUFBLHVEQUFBO0FBQUEsSUFGdUIsdUJBQUQsT0FBTyxJQUFOLElBRXZCLENBQUE7QUFBQSxJQUFBLElBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLFdBQTlCLENBQUg7QUFDRSxNQUFBLFFBQUEsR0FBVyxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFkLENBQStCLFdBQS9CLENBQVgsQ0FBQTtBQUFBLE1BQ0EsUUFBQSxHQUFXLE9BQUEsQ0FBUSxRQUFRLENBQUMsY0FBakIsQ0FEWCxDQUFBO0FBQUEsTUFFQSxVQUFBLEdBQWEsUUFBUSxDQUFDLFNBQVQsQ0FBQSxDQUZiLENBREY7S0FBQSxNQUlLLElBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLGNBQTlCLENBQUg7QUFDSCxNQUFBLFdBQUEsR0FBYyxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFkLENBQStCLGNBQS9CLENBQWQsQ0FBQTtB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

//# sourceURL=/home/takaaki/.atom/packages/git-plus/lib/models/git-difftool.coffee
