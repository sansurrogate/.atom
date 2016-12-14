(function() {
  var OutputViewManager, git, notifier;

  git = require('../git');

  notifier = require('../notifier');

  OutputViewManager = require('../output-view-manager');

  module.exports = function(repo) {
    var cwd;
    cwd = repo.getWorkingDirectory();
    return git.cmd(['stash', 'apply'], {
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvbW9kZWxzL2dpdC1zdGFzaC1hcHBseS5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsZ0NBQUE7O0FBQUEsRUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVIsQ0FBTixDQUFBOztBQUFBLEVBQ0EsUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSLENBRFgsQ0FBQTs7QUFBQSxFQUVBLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSx3QkFBUixDQUZwQixDQUFBOztBQUFBLEVBSUEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxJQUFELEdBQUE7QUFDZixRQUFBLEdBQUE7QUFBQSxJQUFBLEdBQUEsR0FBTSxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFOLENBQUE7V0FDQSxHQUFHLENBQUMsR0FBSixDQUFRLENBQUMsT0FBRCxFQUFVLE9BQVYsQ0FBUixFQUE0QjtBQUFBLE1BQUMsS0FBQSxHQUFEO0tBQTVCLENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxHQUFELEdBQUE7QUFDSixNQUFBLElBQW9ELEdBQUEsS0FBUyxFQUE3RDtlQUFBLGlCQUFpQixDQUFDLE1BQWxCLENBQUEsQ0FBMEIsQ0FBQyxPQUEzQixDQUFtQyxHQUFuQyxDQUF1QyxDQUFDLE1BQXhDLENBQUEsRUFBQTtPQURJO0lBQUEsQ0FETixDQUdBLENBQUMsT0FBRCxDQUhBLENBR08sU0FBQyxHQUFELEdBQUE7YUFDTCxRQUFRLENBQUMsT0FBVCxDQUFpQixHQUFqQixFQURLO0lBQUEsQ0FIUCxFQUZlO0VBQUEsQ0FKakIsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/takaaki/.atom/packages/git-plus/lib/models/git-stash-apply.coffee
