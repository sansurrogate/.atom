(function() {
  var contextPackageFinder, notifier;

  contextPackageFinder = require('../context-package-finder');

  notifier = require('../notifier');

  module.exports = function(repo, contextCommandMap) {
    var file, path, _ref;
    if (path = (_ref = contextPackageFinder.get()) != null ? _ref.selectedPath : void 0) {
      file = repo.relativize(path);
      if (file === '') {
        file = void 0;
      }
      return contextCommandMap('add', {
        repo: repo,
        file: file
      });
    } else {
      return notifier.addInfo("No file selected to add");
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvbW9kZWxzL2dpdC1hZGQtY29udGV4dC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsOEJBQUE7O0FBQUEsRUFBQSxvQkFBQSxHQUF1QixPQUFBLENBQVEsMkJBQVIsQ0FBdkIsQ0FBQTs7QUFBQSxFQUNBLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUixDQURYLENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLElBQUQsRUFBTyxpQkFBUCxHQUFBO0FBQ2YsUUFBQSxnQkFBQTtBQUFBLElBQUEsSUFBRyxJQUFBLHFEQUFpQyxDQUFFLHFCQUF0QztBQUNFLE1BQUEsSUFBQSxHQUFPLElBQUksQ0FBQyxVQUFMLENBQWdCLElBQWhCLENBQVAsQ0FBQTtBQUNBLE1BQUEsSUFBb0IsSUFBQSxLQUFRLEVBQTVCO0FBQUEsUUFBQSxJQUFBLEdBQU8sTUFBUCxDQUFBO09BREE7YUFFQSxpQkFBQSxDQUFrQixLQUFsQixFQUF5QjtBQUFBLFFBQUMsSUFBQSxFQUFNLElBQVA7QUFBQSxRQUFhLE1BQUEsSUFBYjtPQUF6QixFQUhGO0tBQUEsTUFBQTthQUtFLFFBQVEsQ0FBQyxPQUFULENBQWlCLHlCQUFqQixFQUxGO0tBRGU7RUFBQSxDQUhqQixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/takaaki/.atom/packages/git-plus/lib/models/git-add-context.coffee
