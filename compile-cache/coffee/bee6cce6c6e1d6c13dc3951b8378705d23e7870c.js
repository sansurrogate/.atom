(function() {
  var OutputViewManager, emptyOrUndefined, getUpstream, git, notifier;

  git = require('../git');

  notifier = require('../notifier');

  OutputViewManager = require('../output-view-manager');

  emptyOrUndefined = function(thing) {
    return thing !== '' && thing !== void 0;
  };

  getUpstream = function(repo) {
    var ref;
    return (ref = repo.getUpstreamBranch()) != null ? ref.substring('refs/remotes/'.length).split('/') : void 0;
  };

  module.exports = function(repo, arg) {
    var args, extraArgs, startMessage, view;
    extraArgs = (arg != null ? arg : {}).extraArgs;
    if (extraArgs == null) {
      extraArgs = [];
    }
    view = OutputViewManager.create();
    startMessage = notifier.addInfo("Pulling...", {
      dismissable: true
    });
    args = ['pull'].concat(extraArgs).concat(getUpstream(repo)).filter(emptyOrUndefined);
    return git.cmd(args, {
      cwd: repo.getWorkingDirectory()
    }, {
      color: true
    }).then(function(data) {
      view.setContent(data).finish();
      return startMessage.dismiss();
    })["catch"](function(error) {
      view.setContent(error).finish();
      return startMessage.dismiss();
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvbW9kZWxzL19wdWxsLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUNOLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUjs7RUFDWCxpQkFBQSxHQUFvQixPQUFBLENBQVEsd0JBQVI7O0VBRXBCLGdCQUFBLEdBQW1CLFNBQUMsS0FBRDtXQUFXLEtBQUEsS0FBVyxFQUFYLElBQWtCLEtBQUEsS0FBVztFQUF4Qzs7RUFFbkIsV0FBQSxHQUFjLFNBQUMsSUFBRDtBQUNaLFFBQUE7eURBQXdCLENBQUUsU0FBMUIsQ0FBb0MsZUFBZSxDQUFDLE1BQXBELENBQTJELENBQUMsS0FBNUQsQ0FBa0UsR0FBbEU7RUFEWTs7RUFHZCxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLElBQUQsRUFBTyxHQUFQO0FBQ2YsUUFBQTtJQUR1QiwyQkFBRCxNQUFZOztNQUNsQyxZQUFhOztJQUNiLElBQUEsR0FBTyxpQkFBaUIsQ0FBQyxNQUFsQixDQUFBO0lBQ1AsWUFBQSxHQUFlLFFBQVEsQ0FBQyxPQUFULENBQWlCLFlBQWpCLEVBQStCO01BQUEsV0FBQSxFQUFhLElBQWI7S0FBL0I7SUFDZixJQUFBLEdBQU8sQ0FBQyxNQUFELENBQVEsQ0FBQyxNQUFULENBQWdCLFNBQWhCLENBQTBCLENBQUMsTUFBM0IsQ0FBa0MsV0FBQSxDQUFZLElBQVosQ0FBbEMsQ0FBb0QsQ0FBQyxNQUFyRCxDQUE0RCxnQkFBNUQ7V0FDUCxHQUFHLENBQUMsR0FBSixDQUFRLElBQVIsRUFBYztNQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFMO0tBQWQsRUFBK0M7TUFBQyxLQUFBLEVBQU8sSUFBUjtLQUEvQyxDQUNBLENBQUMsSUFERCxDQUNNLFNBQUMsSUFBRDtNQUNKLElBQUksQ0FBQyxVQUFMLENBQWdCLElBQWhCLENBQXFCLENBQUMsTUFBdEIsQ0FBQTthQUNBLFlBQVksQ0FBQyxPQUFiLENBQUE7SUFGSSxDQUROLENBSUEsRUFBQyxLQUFELEVBSkEsQ0FJTyxTQUFDLEtBQUQ7TUFDTCxJQUFJLENBQUMsVUFBTCxDQUFnQixLQUFoQixDQUFzQixDQUFDLE1BQXZCLENBQUE7YUFDQSxZQUFZLENBQUMsT0FBYixDQUFBO0lBRkssQ0FKUDtFQUxlO0FBVGpCIiwic291cmNlc0NvbnRlbnQiOlsiZ2l0ID0gcmVxdWlyZSAnLi4vZ2l0J1xubm90aWZpZXIgPSByZXF1aXJlICcuLi9ub3RpZmllcidcbk91dHB1dFZpZXdNYW5hZ2VyID0gcmVxdWlyZSAnLi4vb3V0cHV0LXZpZXctbWFuYWdlcidcblxuZW1wdHlPclVuZGVmaW5lZCA9ICh0aGluZykgLT4gdGhpbmcgaXNudCAnJyBhbmQgdGhpbmcgaXNudCB1bmRlZmluZWRcblxuZ2V0VXBzdHJlYW0gPSAocmVwbykgLT5cbiAgcmVwby5nZXRVcHN0cmVhbUJyYW5jaCgpPy5zdWJzdHJpbmcoJ3JlZnMvcmVtb3Rlcy8nLmxlbmd0aCkuc3BsaXQoJy8nKVxuXG5tb2R1bGUuZXhwb3J0cyA9IChyZXBvLCB7ZXh0cmFBcmdzfT17fSkgLT5cbiAgZXh0cmFBcmdzID89IFtdXG4gIHZpZXcgPSBPdXRwdXRWaWV3TWFuYWdlci5jcmVhdGUoKVxuICBzdGFydE1lc3NhZ2UgPSBub3RpZmllci5hZGRJbmZvIFwiUHVsbGluZy4uLlwiLCBkaXNtaXNzYWJsZTogdHJ1ZVxuICBhcmdzID0gWydwdWxsJ10uY29uY2F0KGV4dHJhQXJncykuY29uY2F0KGdldFVwc3RyZWFtKHJlcG8pKS5maWx0ZXIoZW1wdHlPclVuZGVmaW5lZClcbiAgZ2l0LmNtZChhcmdzLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpLCB7Y29sb3I6IHRydWV9KVxuICAudGhlbiAoZGF0YSkgLT5cbiAgICB2aWV3LnNldENvbnRlbnQoZGF0YSkuZmluaXNoKClcbiAgICBzdGFydE1lc3NhZ2UuZGlzbWlzcygpXG4gIC5jYXRjaCAoZXJyb3IpIC0+XG4gICAgdmlldy5zZXRDb250ZW50KGVycm9yKS5maW5pc2goKVxuICAgIHN0YXJ0TWVzc2FnZS5kaXNtaXNzKClcbiJdfQ==
