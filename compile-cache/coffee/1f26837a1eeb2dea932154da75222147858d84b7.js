(function() {
  var GitDiffTool, contextPackageFinder, notifier;

  contextPackageFinder = require('../../context-package-finder');

  notifier = require('../../notifier');

  GitDiffTool = require('../git-difftool');

  module.exports = function(repo) {
    var path, ref;
    if (path = (ref = contextPackageFinder.get()) != null ? ref.selectedPath : void 0) {
      return GitDiffTool(repo, {
        file: repo.relativize(path)
      });
    } else {
      return notifier.addInfo("No file selected to diff");
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvbW9kZWxzL2NvbnRleHQvZ2l0LWRpZmZ0b29sLWNvbnRleHQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxvQkFBQSxHQUF1QixPQUFBLENBQVEsOEJBQVI7O0VBQ3ZCLFFBQUEsR0FBVyxPQUFBLENBQVEsZ0JBQVI7O0VBQ1gsV0FBQSxHQUFjLE9BQUEsQ0FBUSxpQkFBUjs7RUFFZCxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLElBQUQ7QUFDZixRQUFBO0lBQUEsSUFBRyxJQUFBLG1EQUFpQyxDQUFFLHFCQUF0QzthQUNFLFdBQUEsQ0FBWSxJQUFaLEVBQWtCO1FBQUEsSUFBQSxFQUFNLElBQUksQ0FBQyxVQUFMLENBQWdCLElBQWhCLENBQU47T0FBbEIsRUFERjtLQUFBLE1BQUE7YUFHRSxRQUFRLENBQUMsT0FBVCxDQUFpQiwwQkFBakIsRUFIRjs7RUFEZTtBQUpqQiIsInNvdXJjZXNDb250ZW50IjpbImNvbnRleHRQYWNrYWdlRmluZGVyID0gcmVxdWlyZSAnLi4vLi4vY29udGV4dC1wYWNrYWdlLWZpbmRlcidcbm5vdGlmaWVyID0gcmVxdWlyZSAnLi4vLi4vbm90aWZpZXInXG5HaXREaWZmVG9vbCA9IHJlcXVpcmUgJy4uL2dpdC1kaWZmdG9vbCdcblxubW9kdWxlLmV4cG9ydHMgPSAocmVwbykgLT5cbiAgaWYgcGF0aCA9IGNvbnRleHRQYWNrYWdlRmluZGVyLmdldCgpPy5zZWxlY3RlZFBhdGhcbiAgICBHaXREaWZmVG9vbCByZXBvLCBmaWxlOiByZXBvLnJlbGF0aXZpemUocGF0aClcbiAgZWxzZVxuICAgIG5vdGlmaWVyLmFkZEluZm8gXCJObyBmaWxlIHNlbGVjdGVkIHRvIGRpZmZcIlxuIl19
