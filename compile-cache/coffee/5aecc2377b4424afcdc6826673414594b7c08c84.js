(function() {
  var GitCheckoutFile, contextPackageFinder, notifier;

  contextPackageFinder = require('../../context-package-finder');

  notifier = require('../../notifier');

  GitCheckoutFile = require('../git-checkout-file');

  module.exports = function(repo) {
    var path, ref;
    if (path = (ref = contextPackageFinder.get()) != null ? ref.selectedPath : void 0) {
      return GitCheckoutFile(repo, {
        file: repo.relativize(path)
      });
    } else {
      return notifier.addInfo("No file selected to checkout");
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvbW9kZWxzL2NvbnRleHQvZ2l0LWNoZWNrb3V0LWZpbGUtY29udGV4dC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLG9CQUFBLEdBQXVCLE9BQUEsQ0FBUSw4QkFBUjs7RUFDdkIsUUFBQSxHQUFXLE9BQUEsQ0FBUSxnQkFBUjs7RUFDWCxlQUFBLEdBQWtCLE9BQUEsQ0FBUSxzQkFBUjs7RUFFbEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxJQUFEO0FBQ2YsUUFBQTtJQUFBLElBQUcsSUFBQSxtREFBaUMsQ0FBRSxxQkFBdEM7YUFDRSxlQUFBLENBQWdCLElBQWhCLEVBQXNCO1FBQUEsSUFBQSxFQUFNLElBQUksQ0FBQyxVQUFMLENBQWdCLElBQWhCLENBQU47T0FBdEIsRUFERjtLQUFBLE1BQUE7YUFHRSxRQUFRLENBQUMsT0FBVCxDQUFpQiw4QkFBakIsRUFIRjs7RUFEZTtBQUpqQiIsInNvdXJjZXNDb250ZW50IjpbImNvbnRleHRQYWNrYWdlRmluZGVyID0gcmVxdWlyZSAnLi4vLi4vY29udGV4dC1wYWNrYWdlLWZpbmRlcidcbm5vdGlmaWVyID0gcmVxdWlyZSAnLi4vLi4vbm90aWZpZXInXG5HaXRDaGVja291dEZpbGUgPSByZXF1aXJlICcuLi9naXQtY2hlY2tvdXQtZmlsZSdcblxubW9kdWxlLmV4cG9ydHMgPSAocmVwbykgLT5cbiAgaWYgcGF0aCA9IGNvbnRleHRQYWNrYWdlRmluZGVyLmdldCgpPy5zZWxlY3RlZFBhdGhcbiAgICBHaXRDaGVja291dEZpbGUgcmVwbywgZmlsZTogcmVwby5yZWxhdGl2aXplKHBhdGgpXG4gIGVsc2VcbiAgICBub3RpZmllci5hZGRJbmZvIFwiTm8gZmlsZSBzZWxlY3RlZCB0byBjaGVja291dFwiXG4iXX0=
