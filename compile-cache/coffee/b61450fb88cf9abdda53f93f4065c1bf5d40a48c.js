(function() {
  var RemoteListView, experimentalFeaturesEnabled, git, pull;

  git = require('../git');

  pull = require('./_pull');

  RemoteListView = require('../views/remote-list-view');

  experimentalFeaturesEnabled = function() {
    var gitPlus;
    gitPlus = atom.config.get('git-plus');
    return gitPlus.alwaysPullFromUpstream && gitPlus.experimental;
  };

  module.exports = function(repo, arg) {
    var extraArgs, rebase;
    rebase = (arg != null ? arg : {}).rebase;
    extraArgs = rebase ? ['--rebase'] : [];
    if (experimentalFeaturesEnabled()) {
      return pull(repo, {
        extraArgs: extraArgs
      });
    } else {
      return git.cmd(['remote'], {
        cwd: repo.getWorkingDirectory()
      }).then(function(data) {
        return new RemoteListView(repo, data, {
          mode: 'pull',
          extraArgs: extraArgs
        }).result;
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvbW9kZWxzL2dpdC1wdWxsLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUNOLElBQUEsR0FBTyxPQUFBLENBQVEsU0FBUjs7RUFDUCxjQUFBLEdBQWlCLE9BQUEsQ0FBUSwyQkFBUjs7RUFFakIsMkJBQUEsR0FBOEIsU0FBQTtBQUM1QixRQUFBO0lBQUEsT0FBQSxHQUFVLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixVQUFoQjtXQUNWLE9BQU8sQ0FBQyxzQkFBUixJQUFtQyxPQUFPLENBQUM7RUFGZjs7RUFJOUIsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxJQUFELEVBQU8sR0FBUDtBQUNmLFFBQUE7SUFEdUIsd0JBQUQsTUFBUztJQUMvQixTQUFBLEdBQWUsTUFBSCxHQUFlLENBQUMsVUFBRCxDQUFmLEdBQWlDO0lBQzdDLElBQUcsMkJBQUEsQ0FBQSxDQUFIO2FBQ0UsSUFBQSxDQUFLLElBQUwsRUFBVztRQUFDLFdBQUEsU0FBRDtPQUFYLEVBREY7S0FBQSxNQUFBO2FBR0UsR0FBRyxDQUFDLEdBQUosQ0FBUSxDQUFDLFFBQUQsQ0FBUixFQUFvQjtRQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFMO09BQXBCLENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxJQUFEO2VBQVUsSUFBSSxjQUFBLENBQWUsSUFBZixFQUFxQixJQUFyQixFQUEyQjtVQUFBLElBQUEsRUFBTSxNQUFOO1VBQWMsU0FBQSxFQUFXLFNBQXpCO1NBQTNCLENBQThELENBQUM7TUFBN0UsQ0FETixFQUhGOztFQUZlO0FBUmpCIiwic291cmNlc0NvbnRlbnQiOlsiZ2l0ID0gcmVxdWlyZSAnLi4vZ2l0J1xucHVsbCA9IHJlcXVpcmUgJy4vX3B1bGwnXG5SZW1vdGVMaXN0VmlldyA9IHJlcXVpcmUgJy4uL3ZpZXdzL3JlbW90ZS1saXN0LXZpZXcnXG5cbmV4cGVyaW1lbnRhbEZlYXR1cmVzRW5hYmxlZCA9ICgpIC0+XG4gIGdpdFBsdXMgPSBhdG9tLmNvbmZpZy5nZXQoJ2dpdC1wbHVzJylcbiAgZ2l0UGx1cy5hbHdheXNQdWxsRnJvbVVwc3RyZWFtIGFuZCBnaXRQbHVzLmV4cGVyaW1lbnRhbFxuXG5tb2R1bGUuZXhwb3J0cyA9IChyZXBvLCB7cmViYXNlfT17fSkgLT5cbiAgZXh0cmFBcmdzID0gaWYgcmViYXNlIHRoZW4gWyctLXJlYmFzZSddIGVsc2UgW11cbiAgaWYgZXhwZXJpbWVudGFsRmVhdHVyZXNFbmFibGVkKClcbiAgICBwdWxsIHJlcG8sIHtleHRyYUFyZ3N9XG4gIGVsc2VcbiAgICBnaXQuY21kKFsncmVtb3RlJ10sIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCkpXG4gICAgLnRoZW4gKGRhdGEpIC0+IG5ldyBSZW1vdGVMaXN0VmlldyhyZXBvLCBkYXRhLCBtb2RlOiAncHVsbCcsIGV4dHJhQXJnczogZXh0cmFBcmdzKS5yZXN1bHRcbiJdfQ==
