(function() {
  var git, notifier;

  git = require('../git');

  notifier = require('../notifier');

  module.exports = function(repo, arg) {
    var file;
    file = arg.file;
    return git.cmd(['checkout', '--', file], {
      cwd: repo.getWorkingDirectory()
    }).then(function(data) {
      notifier.addSuccess('File changes checked out successfully');
      return git.refresh(repo);
    })["catch"](function(error) {
      return notifier.addError(error);
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvbW9kZWxzL2dpdC1jaGVja291dC1maWxlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUNOLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUjs7RUFFWCxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLElBQUQsRUFBTyxHQUFQO0FBQ2YsUUFBQTtJQUR1QixPQUFEO1dBQ3RCLEdBQUcsQ0FBQyxHQUFKLENBQVEsQ0FBQyxVQUFELEVBQWEsSUFBYixFQUFtQixJQUFuQixDQUFSLEVBQWtDO01BQUEsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQUw7S0FBbEMsQ0FDQSxDQUFDLElBREQsQ0FDTSxTQUFDLElBQUQ7TUFDSixRQUFRLENBQUMsVUFBVCxDQUFvQix1Q0FBcEI7YUFDQSxHQUFHLENBQUMsT0FBSixDQUFZLElBQVo7SUFGSSxDQUROLENBSUEsRUFBQyxLQUFELEVBSkEsQ0FJTyxTQUFDLEtBQUQ7YUFDTCxRQUFRLENBQUMsUUFBVCxDQUFrQixLQUFsQjtJQURLLENBSlA7RUFEZTtBQUhqQiIsInNvdXJjZXNDb250ZW50IjpbImdpdCA9IHJlcXVpcmUgJy4uL2dpdCdcbm5vdGlmaWVyID0gcmVxdWlyZSAnLi4vbm90aWZpZXInXG5cbm1vZHVsZS5leHBvcnRzID0gKHJlcG8sIHtmaWxlfSkgLT5cbiAgZ2l0LmNtZChbJ2NoZWNrb3V0JywgJy0tJywgZmlsZV0sIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCkpXG4gIC50aGVuIChkYXRhKSAtPlxuICAgIG5vdGlmaWVyLmFkZFN1Y2Nlc3MgJ0ZpbGUgY2hhbmdlcyBjaGVja2VkIG91dCBzdWNjZXNzZnVsbHknXG4gICAgZ2l0LnJlZnJlc2ggcmVwb1xuICAuY2F0Y2ggKGVycm9yKSAtPlxuICAgIG5vdGlmaWVyLmFkZEVycm9yIGVycm9yXG4iXX0=
