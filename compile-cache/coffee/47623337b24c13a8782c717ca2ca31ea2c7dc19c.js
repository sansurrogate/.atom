(function() {
  var OutputViewManager, fs, git, notifier;

  git = require('../git');

  notifier = require('../notifier');

  OutputViewManager = require('../output-view-manager');

  fs = require('fs-plus');

  module.exports = function(repo, arg) {
    var file, isFolder, ref, tool;
    file = (arg != null ? arg : {}).file;
    if (file == null) {
      file = repo.relativize((ref = atom.workspace.getActiveTextEditor()) != null ? ref.getPath() : void 0);
    }
    isFolder = fs.isDirectorySync(file);
    if (!file) {
      return notifier.addInfo("No open file. Select 'Diff All'.");
    }
    if (!(tool = git.getConfig(repo, 'diff.tool'))) {
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
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvbW9kZWxzL2dpdC1kaWZmdG9vbC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUjs7RUFDTixRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVI7O0VBQ1gsaUJBQUEsR0FBb0IsT0FBQSxDQUFRLHdCQUFSOztFQUNwQixFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBRUwsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxJQUFELEVBQU8sR0FBUDtBQUNmLFFBQUE7SUFEdUIsc0JBQUQsTUFBTzs7TUFDN0IsT0FBUSxJQUFJLENBQUMsVUFBTCwyREFBb0QsQ0FBRSxPQUF0QyxDQUFBLFVBQWhCOztJQUNSLFFBQUEsR0FBVyxFQUFFLENBQUMsZUFBSCxDQUFtQixJQUFuQjtJQUVYLElBQUcsQ0FBSSxJQUFQO0FBQ0UsYUFBTyxRQUFRLENBQUMsT0FBVCxDQUFpQixrQ0FBakIsRUFEVDs7SUFLQSxJQUFBLENBQU8sQ0FBQSxJQUFBLEdBQU8sR0FBRyxDQUFDLFNBQUosQ0FBYyxJQUFkLEVBQW9CLFdBQXBCLENBQVAsQ0FBUDthQUNFLFFBQVEsQ0FBQyxPQUFULENBQWlCLHVDQUFqQixFQURGO0tBQUEsTUFBQTthQUdFLEdBQUcsQ0FBQyxHQUFKLENBQVEsQ0FBQyxZQUFELEVBQWUsTUFBZixFQUF1QixJQUF2QixDQUFSLEVBQXNDO1FBQUEsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQUw7T0FBdEMsQ0FDQSxDQUFDLElBREQsQ0FDTSxTQUFDLElBQUQ7QUFDSixZQUFBO1FBQUEsU0FBQSxHQUFZLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBWDtRQUNaLGlCQUFBLEdBQW9CLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw0QkFBaEI7UUFFcEIsSUFBRyxRQUFIO1VBQ0UsSUFBQSxHQUFPLENBQUMsVUFBRCxFQUFhLElBQWIsRUFBbUIsYUFBbkI7VUFDUCxJQUFvQixpQkFBcEI7WUFBQSxJQUFJLENBQUMsSUFBTCxDQUFVLE1BQVYsRUFBQTs7VUFDQSxJQUFJLENBQUMsSUFBTCxDQUFVLElBQVY7VUFDQSxHQUFHLENBQUMsR0FBSixDQUFRLElBQVIsRUFBYztZQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFMO1dBQWQsQ0FDQSxFQUFDLEtBQUQsRUFEQSxDQUNPLFNBQUMsR0FBRDttQkFBUyxpQkFBaUIsQ0FBQyxNQUFsQixDQUFBLENBQTBCLENBQUMsVUFBM0IsQ0FBc0MsR0FBdEMsQ0FBMEMsQ0FBQyxNQUEzQyxDQUFBO1VBQVQsQ0FEUDtBQUVBLGlCQU5GOztRQVFBLG1CQUFBLEdBQXNCLFNBQVMsQ0FBQyxHQUFWLENBQWMsU0FBQyxJQUFELEVBQU8sQ0FBUDtBQUNsQyxjQUFBO1VBQUEsSUFBRyxDQUFBLEdBQUksQ0FBSixLQUFTLENBQVo7WUFDRSxNQUFBLEdBQVMsQ0FBSSxTQUFTLENBQUMsSUFBVixDQUFlLFNBQVUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFiLENBQW1CLEdBQW5CLENBQXdCLENBQUEsQ0FBQSxDQUF2QztZQUNiLElBQUEsR0FBTyxTQUFVLENBQUEsQ0FBQSxHQUFFLENBQUY7WUFDakIsSUFBUSxJQUFBLEtBQVEsSUFBUixJQUFpQixDQUFDLENBQUMsTUFBRCxJQUFXLGlCQUFaLENBQXpCO3FCQUFBLEtBQUE7YUFIRjtXQUFBLE1BQUE7bUJBS0UsT0FMRjs7UUFEa0MsQ0FBZDtRQVF0QixJQUFHOztxQkFBSDtVQUNFLElBQUEsR0FBTyxDQUFDLFVBQUQsRUFBYSxhQUFiO1VBQ1AsSUFBb0IsaUJBQXBCO1lBQUEsSUFBSSxDQUFDLElBQUwsQ0FBVSxNQUFWLEVBQUE7O1VBQ0EsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFWO2lCQUNBLEdBQUcsQ0FBQyxHQUFKLENBQVEsSUFBUixFQUFjO1lBQUEsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQUw7V0FBZCxDQUNBLEVBQUMsS0FBRCxFQURBLENBQ08sU0FBQyxHQUFEO21CQUFTLGlCQUFpQixDQUFDLE1BQWxCLENBQUEsQ0FBMEIsQ0FBQyxVQUEzQixDQUFzQyxHQUF0QyxDQUEwQyxDQUFDLE1BQTNDLENBQUE7VUFBVCxDQURQLEVBSkY7U0FBQSxNQUFBO2lCQU9FLFFBQVEsQ0FBQyxPQUFULENBQWlCLGtCQUFqQixFQVBGOztNQXBCSSxDQUROLEVBSEY7O0VBVGU7QUFMakIiLCJzb3VyY2VzQ29udGVudCI6WyJnaXQgPSByZXF1aXJlICcuLi9naXQnXG5ub3RpZmllciA9IHJlcXVpcmUgJy4uL25vdGlmaWVyJ1xuT3V0cHV0Vmlld01hbmFnZXIgPSByZXF1aXJlICcuLi9vdXRwdXQtdmlldy1tYW5hZ2VyJ1xuZnMgPSByZXF1aXJlICdmcy1wbHVzJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IChyZXBvLCB7ZmlsZX09e30pIC0+XG4gIGZpbGUgPz0gcmVwby5yZWxhdGl2aXplKGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKT8uZ2V0UGF0aCgpKVxuICBpc0ZvbGRlciA9IGZzLmlzRGlyZWN0b3J5U3luYyBmaWxlXG5cbiAgaWYgbm90IGZpbGVcbiAgICByZXR1cm4gbm90aWZpZXIuYWRkSW5mbyBcIk5vIG9wZW4gZmlsZS4gU2VsZWN0ICdEaWZmIEFsbCcuXCJcblxuICAjIFdlIHBhcnNlIHRoZSBvdXRwdXQgb2YgZ2l0IGRpZmYtaW5kZXggdG8gaGFuZGxlIHRoZSBjYXNlIG9mIGEgc3RhZ2VkIGZpbGVcbiAgIyB3aGVuIGdpdC1wbHVzLmluY2x1ZGVTdGFnZWREaWZmIGlzIHNldCB0byBmYWxzZS5cbiAgdW5sZXNzIHRvb2wgPSBnaXQuZ2V0Q29uZmlnKHJlcG8sICdkaWZmLnRvb2wnKVxuICAgIG5vdGlmaWVyLmFkZEluZm8gXCJZb3UgZG9uJ3QgaGF2ZSBhIGRpZmZ0b29sIGNvbmZpZ3VyZWQuXCJcbiAgZWxzZVxuICAgIGdpdC5jbWQoWydkaWZmLWluZGV4JywgJ0hFQUQnLCAnLXonXSwgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSlcbiAgICAudGhlbiAoZGF0YSkgLT5cbiAgICAgIGRpZmZJbmRleCA9IGRhdGEuc3BsaXQoJ1xcMCcpXG4gICAgICBpbmNsdWRlU3RhZ2VkRGlmZiA9IGF0b20uY29uZmlnLmdldCAnZ2l0LXBsdXMuaW5jbHVkZVN0YWdlZERpZmYnXG5cbiAgICAgIGlmIGlzRm9sZGVyXG4gICAgICAgIGFyZ3MgPSBbJ2RpZmZ0b29sJywgJy1kJywgJy0tbm8tcHJvbXB0J11cbiAgICAgICAgYXJncy5wdXNoICdIRUFEJyBpZiBpbmNsdWRlU3RhZ2VkRGlmZlxuICAgICAgICBhcmdzLnB1c2ggZmlsZVxuICAgICAgICBnaXQuY21kKGFyZ3MsIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCkpXG4gICAgICAgIC5jYXRjaCAobXNnKSAtPiBPdXRwdXRWaWV3TWFuYWdlci5jcmVhdGUoKS5zZXRDb250ZW50KG1zZykuZmluaXNoKClcbiAgICAgICAgcmV0dXJuXG5cbiAgICAgIGRpZmZzRm9yQ3VycmVudEZpbGUgPSBkaWZmSW5kZXgubWFwIChsaW5lLCBpKSAtPlxuICAgICAgICBpZiBpICUgMiBpcyAwXG4gICAgICAgICAgc3RhZ2VkID0gbm90IC9eMHs0MH0kLy50ZXN0KGRpZmZJbmRleFtpXS5zcGxpdCgnICcpWzNdKTtcbiAgICAgICAgICBwYXRoID0gZGlmZkluZGV4W2krMV1cbiAgICAgICAgICB0cnVlIGlmIHBhdGggaXMgZmlsZSBhbmQgKCFzdGFnZWQgb3IgaW5jbHVkZVN0YWdlZERpZmYpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICB1bmRlZmluZWRcblxuICAgICAgaWYgZGlmZnNGb3JDdXJyZW50RmlsZS5maWx0ZXIoKGRpZmYpIC0+IGRpZmY/KVswXT9cbiAgICAgICAgYXJncyA9IFsnZGlmZnRvb2wnLCAnLS1uby1wcm9tcHQnXVxuICAgICAgICBhcmdzLnB1c2ggJ0hFQUQnIGlmIGluY2x1ZGVTdGFnZWREaWZmXG4gICAgICAgIGFyZ3MucHVzaCBmaWxlXG4gICAgICAgIGdpdC5jbWQoYXJncywgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSlcbiAgICAgICAgLmNhdGNoIChtc2cpIC0+IE91dHB1dFZpZXdNYW5hZ2VyLmNyZWF0ZSgpLnNldENvbnRlbnQobXNnKS5maW5pc2goKVxuICAgICAgZWxzZVxuICAgICAgICBub3RpZmllci5hZGRJbmZvICdOb3RoaW5nIHRvIHNob3cuJ1xuIl19
