(function() {
  var RemoteListView, git, pull;

  git = require('../git');

  pull = require('./_pull');

  RemoteListView = require('../views/remote-list-view');

  module.exports = function(repo, arg) {
    var extraArgs, rebase;
    rebase = (arg != null ? arg : {}).rebase;
    extraArgs = rebase ? ['--rebase'] : [];
    if (atom.config.get('git-plus.alwaysPullFromUpstream')) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvbW9kZWxzL2dpdC1wdWxsLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUNOLElBQUEsR0FBTyxPQUFBLENBQVEsU0FBUjs7RUFDUCxjQUFBLEdBQWlCLE9BQUEsQ0FBUSwyQkFBUjs7RUFFakIsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxJQUFELEVBQU8sR0FBUDtBQUNmLFFBQUE7SUFEdUIsd0JBQUQsTUFBUztJQUMvQixTQUFBLEdBQWUsTUFBSCxHQUFlLENBQUMsVUFBRCxDQUFmLEdBQWlDO0lBQzdDLElBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGlDQUFoQixDQUFIO2FBQ0UsSUFBQSxDQUFLLElBQUwsRUFBVztRQUFDLFdBQUEsU0FBRDtPQUFYLEVBREY7S0FBQSxNQUFBO2FBR0UsR0FBRyxDQUFDLEdBQUosQ0FBUSxDQUFDLFFBQUQsQ0FBUixFQUFvQjtRQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFMO09BQXBCLENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxJQUFEO2VBQVUsSUFBSSxjQUFBLENBQWUsSUFBZixFQUFxQixJQUFyQixFQUEyQjtVQUFBLElBQUEsRUFBTSxNQUFOO1VBQWMsU0FBQSxFQUFXLFNBQXpCO1NBQTNCLENBQThELENBQUM7TUFBN0UsQ0FETixFQUhGOztFQUZlO0FBSmpCIiwic291cmNlc0NvbnRlbnQiOlsiZ2l0ID0gcmVxdWlyZSAnLi4vZ2l0J1xucHVsbCA9IHJlcXVpcmUgJy4vX3B1bGwnXG5SZW1vdGVMaXN0VmlldyA9IHJlcXVpcmUgJy4uL3ZpZXdzL3JlbW90ZS1saXN0LXZpZXcnXG5cbm1vZHVsZS5leHBvcnRzID0gKHJlcG8sIHtyZWJhc2V9PXt9KSAtPlxuICBleHRyYUFyZ3MgPSBpZiByZWJhc2UgdGhlbiBbJy0tcmViYXNlJ10gZWxzZSBbXVxuICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2dpdC1wbHVzLmFsd2F5c1B1bGxGcm9tVXBzdHJlYW0nKVxuICAgIHB1bGwgcmVwbywge2V4dHJhQXJnc31cbiAgZWxzZVxuICAgIGdpdC5jbWQoWydyZW1vdGUnXSwgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSlcbiAgICAudGhlbiAoZGF0YSkgLT4gbmV3IFJlbW90ZUxpc3RWaWV3KHJlcG8sIGRhdGEsIG1vZGU6ICdwdWxsJywgZXh0cmFBcmdzOiBleHRyYUFyZ3MpLnJlc3VsdFxuIl19
