(function() {
  var GitDiffTool, contextPackageFinder, notifier;

  contextPackageFinder = require('../context-package-finder');

  notifier = require('../notifier');

  GitDiffTool = require('./git-difftool');

  module.exports = function(repo, contextCommandMap) {
    var path, _ref;
    if (path = (_ref = contextPackageFinder.get()) != null ? _ref.selectedPath : void 0) {
      return contextCommandMap('difftool', {
        repo: repo,
        file: repo.relativize(path)
      });
    } else {
      return notifier.addInfo("No file selected to diff");
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvbW9kZWxzL2dpdC1kaWZmdG9vbC1jb250ZXh0LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwyQ0FBQTs7QUFBQSxFQUFBLG9CQUFBLEdBQXVCLE9BQUEsQ0FBUSwyQkFBUixDQUF2QixDQUFBOztBQUFBLEVBQ0EsUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSLENBRFgsQ0FBQTs7QUFBQSxFQUVBLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVIsQ0FGZCxDQUFBOztBQUFBLEVBSUEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxJQUFELEVBQU8saUJBQVAsR0FBQTtBQUNmLFFBQUEsVUFBQTtBQUFBLElBQUEsSUFBRyxJQUFBLHFEQUFpQyxDQUFFLHFCQUF0QzthQUNFLGlCQUFBLENBQWtCLFVBQWxCLEVBQThCO0FBQUEsUUFBQSxJQUFBLEVBQU0sSUFBTjtBQUFBLFFBQVksSUFBQSxFQUFNLElBQUksQ0FBQyxVQUFMLENBQWdCLElBQWhCLENBQWxCO09BQTlCLEVBREY7S0FBQSxNQUFBO2FBR0UsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsMEJBQWpCLEVBSEY7S0FEZTtFQUFBLENBSmpCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/takaaki/.atom/packages/git-plus/lib/models/git-difftool-context.coffee
