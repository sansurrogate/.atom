(function() {
  var RemoteListView, git;

  git = require('../git');

  RemoteListView = require('../views/remote-list-view');

  module.exports = function(repo, _arg) {
    var setUpstream;
    setUpstream = (_arg != null ? _arg : {}).setUpstream;
    return git.cmd(['remote'], {
      cwd: repo.getWorkingDirectory()
    }).then(function(data) {
      var mode;
      mode = setUpstream ? 'push -u' : 'push';
      return new RemoteListView(repo, data, {
        mode: mode
      });
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvbW9kZWxzL2dpdC1wdXNoLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxtQkFBQTs7QUFBQSxFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUixDQUFOLENBQUE7O0FBQUEsRUFDQSxjQUFBLEdBQWlCLE9BQUEsQ0FBUSwyQkFBUixDQURqQixDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxJQUFELEVBQU8sSUFBUCxHQUFBO0FBQ2YsUUFBQSxXQUFBO0FBQUEsSUFEdUIsOEJBQUQsT0FBYyxJQUFiLFdBQ3ZCLENBQUE7V0FBQSxHQUFHLENBQUMsR0FBSixDQUFRLENBQUMsUUFBRCxDQUFSLEVBQW9CO0FBQUEsTUFBQSxHQUFBLEVBQUssSUFBSSxDQUFDLG1CQUFMLENBQUEsQ0FBTDtLQUFwQixDQUFvRCxDQUFDLElBQXJELENBQTBELFNBQUMsSUFBRCxHQUFBO0FBQ3hELFVBQUEsSUFBQTtBQUFBLE1BQUEsSUFBQSxHQUFVLFdBQUgsR0FBb0IsU0FBcEIsR0FBbUMsTUFBMUMsQ0FBQTthQUNJLElBQUEsY0FBQSxDQUFlLElBQWYsRUFBcUIsSUFBckIsRUFBMkI7QUFBQSxRQUFDLE1BQUEsSUFBRDtPQUEzQixFQUZvRDtJQUFBLENBQTFELEVBRGU7RUFBQSxDQUhqQixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/takaaki/.atom/packages/git-plus/lib/models/git-push.coffee
