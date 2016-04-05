(function() {
  var GitRemove, currentPane, git, pathToRepoFile, repo, textEditor, _ref,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  git = require('../../lib/git');

  _ref = require('../fixtures'), repo = _ref.repo, pathToRepoFile = _ref.pathToRepoFile, textEditor = _ref.textEditor, currentPane = _ref.currentPane;

  GitRemove = require('../../lib/models/git-remove');

  describe("GitRemove", function() {
    beforeEach(function() {
      spyOn(atom.workspace, 'getActiveTextEditor').andReturn(textEditor);
      spyOn(atom.workspace, 'getActivePaneItem').andReturn(currentPane);
      return spyOn(git, 'cmd').andReturn(Promise.resolve(repo.relativize(pathToRepoFile)));
    });
    describe("when the file has been modified and user confirms", function() {
      beforeEach(function() {
        spyOn(window, 'confirm').andReturn(true);
        return spyOn(repo, 'isPathModified').andReturn(true);
      });
      describe("when there is a current file open", function() {
        return it("calls git.cmd with 'rm' and " + pathToRepoFile, function() {
          var args, _ref1;
          GitRemove(repo);
          args = git.cmd.mostRecentCall.args[0];
          expect(__indexOf.call(args, 'rm') >= 0).toBe(true);
          return expect((_ref1 = repo.relativize(pathToRepoFile), __indexOf.call(args, _ref1) >= 0)).toBe(true);
        });
      });
      return describe("when 'showSelector' is set to true", function() {
        return it("calls git.cmd with '*' instead of " + pathToRepoFile, function() {
          var args;
          GitRemove(repo, {
            showSelector: true
          });
          args = git.cmd.mostRecentCall.args[0];
          return expect(__indexOf.call(args, '*') >= 0).toBe(true);
        });
      });
    });
    return describe("when the file has not been modified and user doesn't need to confirm", function() {
      beforeEach(function() {
        spyOn(window, 'confirm').andReturn(false);
        return spyOn(repo, 'isPathModified').andReturn(false);
      });
      describe("when there is a current file open", function() {
        return it("calls git.cmd with 'rm' and " + pathToRepoFile, function() {
          var args, _ref1;
          GitRemove(repo);
          args = git.cmd.mostRecentCall.args[0];
          expect(__indexOf.call(args, 'rm') >= 0).toBe(true);
          expect((_ref1 = repo.relativize(pathToRepoFile), __indexOf.call(args, _ref1) >= 0)).toBe(true);
          return expect(window.confirm).not.toHaveBeenCalled();
        });
      });
      return describe("when 'showSelector' is set to true", function() {
        return it("calls git.cmd with '*' instead of " + pathToRepoFile, function() {
          var args;
          GitRemove(repo, {
            showSelector: true
          });
          args = git.cmd.mostRecentCall.args[0];
          return expect(__indexOf.call(args, '*') >= 0).toBe(true);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9zcGVjL21vZGVscy9naXQtcmVtb3ZlLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1FQUFBO0lBQUEscUpBQUE7O0FBQUEsRUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLGVBQVIsQ0FBTixDQUFBOztBQUFBLEVBQ0EsT0FBa0QsT0FBQSxDQUFRLGFBQVIsQ0FBbEQsRUFBQyxZQUFBLElBQUQsRUFBTyxzQkFBQSxjQUFQLEVBQXVCLGtCQUFBLFVBQXZCLEVBQW1DLG1CQUFBLFdBRG5DLENBQUE7O0FBQUEsRUFFQSxTQUFBLEdBQVksT0FBQSxDQUFRLDZCQUFSLENBRlosQ0FBQTs7QUFBQSxFQUlBLFFBQUEsQ0FBUyxXQUFULEVBQXNCLFNBQUEsR0FBQTtBQUNwQixJQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxNQUFBLEtBQUEsQ0FBTSxJQUFJLENBQUMsU0FBWCxFQUFzQixxQkFBdEIsQ0FBNEMsQ0FBQyxTQUE3QyxDQUF1RCxVQUF2RCxDQUFBLENBQUE7QUFBQSxNQUNBLEtBQUEsQ0FBTSxJQUFJLENBQUMsU0FBWCxFQUFzQixtQkFBdEIsQ0FBMEMsQ0FBQyxTQUEzQyxDQUFxRCxXQUFyRCxDQURBLENBQUE7YUFFQSxLQUFBLENBQU0sR0FBTixFQUFXLEtBQVgsQ0FBaUIsQ0FBQyxTQUFsQixDQUE0QixPQUFPLENBQUMsT0FBUixDQUFnQixJQUFJLENBQUMsVUFBTCxDQUFnQixjQUFoQixDQUFoQixDQUE1QixFQUhTO0lBQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxJQUtBLFFBQUEsQ0FBUyxtREFBVCxFQUE4RCxTQUFBLEdBQUE7QUFDNUQsTUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsUUFBQSxLQUFBLENBQU0sTUFBTixF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

//# sourceURL=/home/takaaki/.atom/packages/git-plus/spec/models/git-remove-spec.coffee
