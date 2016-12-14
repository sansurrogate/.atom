(function() {
  var GitDiffTool, git, map;

  git = require('./git');

  GitDiffTool = require('./models/git-difftool');

  map = {
    'difftool': function(_arg) {
      var file, repo;
      repo = _arg.repo, file = _arg.file;
      return GitDiffTool(repo, {
        file: file
      });
    },
    'add': function(_arg) {
      var file, repo;
      repo = _arg.repo, file = _arg.file;
      return git.add(repo, {
        file: file
      });
    }
  };

  module.exports = function(key, args) {
    return map[key](args);
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvY29udGV4dC1jb21tYW5kLW1hcC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEscUJBQUE7O0FBQUEsRUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLE9BQVIsQ0FBTixDQUFBOztBQUFBLEVBQ0EsV0FBQSxHQUFjLE9BQUEsQ0FBUSx1QkFBUixDQURkLENBQUE7O0FBQUEsRUFHQSxHQUFBLEdBQ0U7QUFBQSxJQUFBLFVBQUEsRUFBWSxTQUFDLElBQUQsR0FBQTtBQUFrQixVQUFBLFVBQUE7QUFBQSxNQUFoQixZQUFBLE1BQU0sWUFBQSxJQUFVLENBQUE7YUFBQSxXQUFBLENBQVksSUFBWixFQUFrQjtBQUFBLFFBQUMsTUFBQSxJQUFEO09BQWxCLEVBQWxCO0lBQUEsQ0FBWjtBQUFBLElBQ0EsS0FBQSxFQUFPLFNBQUMsSUFBRCxHQUFBO0FBQWtCLFVBQUEsVUFBQTtBQUFBLE1BQWhCLFlBQUEsTUFBTSxZQUFBLElBQVUsQ0FBQTthQUFBLEdBQUcsQ0FBQyxHQUFKLENBQVEsSUFBUixFQUFjO0FBQUEsUUFBQyxNQUFBLElBQUQ7T0FBZCxFQUFsQjtJQUFBLENBRFA7R0FKRixDQUFBOztBQUFBLEVBT0EsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxHQUFELEVBQU0sSUFBTixHQUFBO1dBQWUsR0FBSSxDQUFBLEdBQUEsQ0FBSixDQUFTLElBQVQsRUFBZjtFQUFBLENBUGpCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/takaaki/.atom/packages/git-plus/lib/context-command-map.coffee
