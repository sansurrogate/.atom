(function() {
  var filesFromData, git;

  git = require('../git');

  filesFromData = function(statusData) {
    var files, line, lineMatch, _i, _len;
    files = [];
    for (_i = 0, _len = statusData.length; _i < _len; _i++) {
      line = statusData[_i];
      lineMatch = line.match(/^([ MARCU?!]{2})\s{1}(.*)/);
      if (lineMatch) {
        files.push(lineMatch[2]);
      }
    }
    return files;
  };

  module.exports = function(repo) {
    return git.status(repo).then(function(statusData) {
      var file, _i, _len, _ref, _results;
      _ref = filesFromData(statusData);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        file = _ref[_i];
        _results.push(atom.workspace.open(file));
      }
      return _results;
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvbW9kZWxzL2dpdC1vcGVuLWNoYW5nZWQtZmlsZXMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtCQUFBOztBQUFBLEVBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSLENBQU4sQ0FBQTs7QUFBQSxFQUVBLGFBQUEsR0FBZ0IsU0FBQyxVQUFELEdBQUE7QUFDZCxRQUFBLGdDQUFBO0FBQUEsSUFBQSxLQUFBLEdBQVEsRUFBUixDQUFBO0FBQ0EsU0FBQSxpREFBQTs0QkFBQTtBQUNFLE1BQUEsU0FBQSxHQUFZLElBQUksQ0FBQyxLQUFMLENBQVcsMkJBQVgsQ0FBWixDQUFBO0FBQ0EsTUFBQSxJQUEyQixTQUEzQjtBQUFBLFFBQUEsS0FBSyxDQUFDLElBQU4sQ0FBVyxTQUFVLENBQUEsQ0FBQSxDQUFyQixDQUFBLENBQUE7T0FGRjtBQUFBLEtBREE7V0FJQSxNQUxjO0VBQUEsQ0FGaEIsQ0FBQTs7QUFBQSxFQVNBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsSUFBRCxHQUFBO1dBQ2YsR0FBRyxDQUFDLE1BQUosQ0FBVyxJQUFYLENBQWdCLENBQUMsSUFBakIsQ0FBc0IsU0FBQyxVQUFELEdBQUE7QUFDcEIsVUFBQSw4QkFBQTtBQUFBO0FBQUE7V0FBQSwyQ0FBQTt3QkFBQTtBQUNFLHNCQUFBLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFvQixJQUFwQixFQUFBLENBREY7QUFBQTtzQkFEb0I7SUFBQSxDQUF0QixFQURlO0VBQUEsQ0FUakIsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/takaaki/.atom/packages/git-plus/lib/models/git-open-changed-files.coffee
