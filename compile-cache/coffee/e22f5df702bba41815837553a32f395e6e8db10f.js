(function() {
  var OutputViewManager, git, notifier;

  git = require('../git');

  notifier = require('../notifier');

  OutputViewManager = require('../output-view-manager');

  module.exports = function(repo, _arg) {
    var args, cwd, message;
    message = (_arg != null ? _arg : {}).message;
    cwd = repo.getWorkingDirectory();
    args = ['stash', 'save'];
    if (message) {
      args.push(message);
    }
    return git.cmd(args, {
      cwd: cwd
    }).then(function(msg) {
      if (msg !== '') {
        return OutputViewManager.create().addLine(msg).finish();
      }
    })["catch"](function(msg) {
      return notifier.addInfo(msg);
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvbW9kZWxzL2dpdC1zdGFzaC1zYXZlLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxnQ0FBQTs7QUFBQSxFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUixDQUFOLENBQUE7O0FBQUEsRUFDQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVIsQ0FEWCxDQUFBOztBQUFBLEVBRUEsaUJBQUEsR0FBb0IsT0FBQSxDQUFRLHdCQUFSLENBRnBCLENBQUE7O0FBQUEsRUFJQSxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLElBQUQsRUFBTyxJQUFQLEdBQUE7QUFDZixRQUFBLGtCQUFBO0FBQUEsSUFEdUIsMEJBQUQsT0FBVSxJQUFULE9BQ3ZCLENBQUE7QUFBQSxJQUFBLEdBQUEsR0FBTSxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFOLENBQUE7QUFBQSxJQUNBLElBQUEsR0FBTyxDQUFDLE9BQUQsRUFBVSxNQUFWLENBRFAsQ0FBQTtBQUVBLElBQUEsSUFBc0IsT0FBdEI7QUFBQSxNQUFBLElBQUksQ0FBQyxJQUFMLENBQVUsT0FBVixDQUFBLENBQUE7S0FGQTtXQUdBLEdBQUcsQ0FBQyxHQUFKLENBQVEsSUFBUixFQUFjO0FBQUEsTUFBQyxLQUFBLEdBQUQ7S0FBZCxDQUNBLENBQUMsSUFERCxDQUNNLFNBQUMsR0FBRCxHQUFBO0FBQ0osTUFBQSxJQUFvRCxHQUFBLEtBQVMsRUFBN0Q7ZUFBQSxpQkFBaUIsQ0FBQyxNQUFsQixDQUFBLENBQTBCLENBQUMsT0FBM0IsQ0FBbUMsR0FBbkMsQ0FBdUMsQ0FBQyxNQUF4QyxDQUFBLEVBQUE7T0FESTtJQUFBLENBRE4sQ0FHQSxDQUFDLE9BQUQsQ0FIQSxDQUdPLFNBQUMsR0FBRCxHQUFBO2FBQ0wsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsR0FBakIsRUFESztJQUFBLENBSFAsRUFKZTtFQUFBLENBSmpCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/takaaki/.atom/packages/git-plus/lib/models/git-stash-save.coffee
