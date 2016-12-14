(function() {
  var OutputViewManager, git, notifier;

  git = require('../git');

  notifier = require('../notifier');

  OutputViewManager = require('../output-view-manager');

  module.exports = function(repo, arg) {
    var branch, extraArgs, remote;
    remote = arg.remote, branch = arg.branch, extraArgs = arg.extraArgs;
    return new Promise(function(resolve, reject) {
      var args, startMessage, view;
      view = OutputViewManager.create();
      startMessage = notifier.addInfo("Pulling...", {
        dismissable: true
      });
      args = ['pull'].concat(extraArgs).concat([remote, branch]).filter(function(c) {
        return c !== '' && c !== void 0;
      });
      return git.cmd(args, {
        cwd: repo.getWorkingDirectory()
      }, {
        color: true
      }).then((function(_this) {
        return function(data) {
          resolve();
          view.setContent(data).finish();
          return startMessage.dismiss();
        };
      })(this))["catch"]((function(_this) {
        return function(error) {
          reject();
          view.setContent(error).finish();
          return startMessage.dismiss();
        };
      })(this));
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvbW9kZWxzL19wdWxsLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUNOLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUjs7RUFDWCxpQkFBQSxHQUFvQixPQUFBLENBQVEsd0JBQVI7O0VBRXBCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsSUFBRCxFQUFPLEdBQVA7QUFDZixRQUFBO0lBRHVCLHFCQUFRLHFCQUFRO1dBQ25DLElBQUEsT0FBQSxDQUFRLFNBQUMsT0FBRCxFQUFVLE1BQVY7QUFDVixVQUFBO01BQUEsSUFBQSxHQUFPLGlCQUFpQixDQUFDLE1BQWxCLENBQUE7TUFDUCxZQUFBLEdBQWUsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsWUFBakIsRUFBK0I7UUFBQSxXQUFBLEVBQWEsSUFBYjtPQUEvQjtNQUNmLElBQUEsR0FBTyxDQUFDLE1BQUQsQ0FBUSxDQUFDLE1BQVQsQ0FBZ0IsU0FBaEIsQ0FBMEIsQ0FBQyxNQUEzQixDQUFrQyxDQUFDLE1BQUQsRUFBUyxNQUFULENBQWxDLENBQW1ELENBQUMsTUFBcEQsQ0FBMkQsU0FBQyxDQUFEO2VBQU8sQ0FBQSxLQUFPLEVBQVAsSUFBYyxDQUFBLEtBQU87TUFBNUIsQ0FBM0Q7YUFDUCxHQUFHLENBQUMsR0FBSixDQUFRLElBQVIsRUFBYztRQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFMO09BQWQsRUFBK0M7UUFBQyxLQUFBLEVBQU8sSUFBUjtPQUEvQyxDQUNBLENBQUMsSUFERCxDQUNNLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxJQUFEO1VBQ0osT0FBQSxDQUFBO1VBQ0EsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsSUFBaEIsQ0FBcUIsQ0FBQyxNQUF0QixDQUFBO2lCQUNBLFlBQVksQ0FBQyxPQUFiLENBQUE7UUFISTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FETixDQUtBLEVBQUMsS0FBRCxFQUxBLENBS08sQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEtBQUQ7VUFDTCxNQUFBLENBQUE7VUFDQSxJQUFJLENBQUMsVUFBTCxDQUFnQixLQUFoQixDQUFzQixDQUFDLE1BQXZCLENBQUE7aUJBQ0EsWUFBWSxDQUFDLE9BQWIsQ0FBQTtRQUhLO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUxQO0lBSlUsQ0FBUjtFQURXO0FBSmpCIiwic291cmNlc0NvbnRlbnQiOlsiZ2l0ID0gcmVxdWlyZSAnLi4vZ2l0J1xubm90aWZpZXIgPSByZXF1aXJlICcuLi9ub3RpZmllcidcbk91dHB1dFZpZXdNYW5hZ2VyID0gcmVxdWlyZSAnLi4vb3V0cHV0LXZpZXctbWFuYWdlcidcblxubW9kdWxlLmV4cG9ydHMgPSAocmVwbywge3JlbW90ZSwgYnJhbmNoLCBleHRyYUFyZ3N9KSAtPlxuICBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSAtPlxuICAgIHZpZXcgPSBPdXRwdXRWaWV3TWFuYWdlci5jcmVhdGUoKVxuICAgIHN0YXJ0TWVzc2FnZSA9IG5vdGlmaWVyLmFkZEluZm8gXCJQdWxsaW5nLi4uXCIsIGRpc21pc3NhYmxlOiB0cnVlXG4gICAgYXJncyA9IFsncHVsbCddLmNvbmNhdChleHRyYUFyZ3MpLmNvbmNhdChbcmVtb3RlLCBicmFuY2hdKS5maWx0ZXIgKGMpIC0+IGMgaXNudCAnJyBhbmQgYyBpc250IHVuZGVmaW5lZFxuICAgIGdpdC5jbWQoYXJncywgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSwge2NvbG9yOiB0cnVlfSlcbiAgICAudGhlbiAoZGF0YSkgPT5cbiAgICAgIHJlc29sdmUoKVxuICAgICAgdmlldy5zZXRDb250ZW50KGRhdGEpLmZpbmlzaCgpXG4gICAgICBzdGFydE1lc3NhZ2UuZGlzbWlzcygpXG4gICAgLmNhdGNoIChlcnJvcikgPT5cbiAgICAgIHJlamVjdCgpXG4gICAgICB2aWV3LnNldENvbnRlbnQoZXJyb3IpLmZpbmlzaCgpXG4gICAgICBzdGFydE1lc3NhZ2UuZGlzbWlzcygpXG4iXX0=
