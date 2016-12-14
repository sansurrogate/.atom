(function() {
  var GitOpenChangedFiles, git, repo;

  git = require('../../lib/git');

  repo = require('../fixtures').repo;

  GitOpenChangedFiles = require('../../lib/models/git-open-changed-files');

  describe("GitOpenChangedFiles", function() {
    beforeEach(function() {
      return spyOn(atom.workspace, 'open');
    });
    describe("when file is modified", function() {
      beforeEach(function() {
        spyOn(git, 'status').andReturn(Promise.resolve([' M file1.txt']));
        return waitsForPromise(function() {
          return GitOpenChangedFiles(repo);
        });
      });
      return it("opens changed file", function() {
        return expect(atom.workspace.open).toHaveBeenCalledWith("file1.txt");
      });
    });
    describe("when file is added", function() {
      beforeEach(function() {
        spyOn(git, 'status').andReturn(Promise.resolve(['?? file2.txt']));
        return waitsForPromise(function() {
          return GitOpenChangedFiles(repo);
        });
      });
      return it("opens added file", function() {
        return expect(atom.workspace.open).toHaveBeenCalledWith("file2.txt");
      });
    });
    return describe("when file is renamed", function() {
      beforeEach(function() {
        spyOn(git, 'status').andReturn(Promise.resolve(['R  file3.txt']));
        return waitsForPromise(function() {
          return GitOpenChangedFiles(repo);
        });
      });
      return it("opens renamed file", function() {
        return expect(atom.workspace.open).toHaveBeenCalledWith("file3.txt");
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9zcGVjL21vZGVscy9naXQtb3Blbi1jaGFuZ2VkLWZpbGVzLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDhCQUFBOztBQUFBLEVBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxlQUFSLENBQU4sQ0FBQTs7QUFBQSxFQUNDLE9BQVEsT0FBQSxDQUFRLGFBQVIsRUFBUixJQURELENBQUE7O0FBQUEsRUFFQSxtQkFBQSxHQUFzQixPQUFBLENBQVEseUNBQVIsQ0FGdEIsQ0FBQTs7QUFBQSxFQUlBLFFBQUEsQ0FBUyxxQkFBVCxFQUFnQyxTQUFBLEdBQUE7QUFDOUIsSUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO2FBQ1QsS0FBQSxDQUFNLElBQUksQ0FBQyxTQUFYLEVBQXNCLE1BQXRCLEVBRFM7SUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLElBR0EsUUFBQSxDQUFTLHVCQUFULEVBQWtDLFNBQUEsR0FBQTtBQUNoQyxNQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxRQUFBLEtBQUEsQ0FBTSxHQUFOLEVBQVcsUUFBWCxDQUFvQixDQUFDLFNBQXJCLENBQStCLE9BQU8sQ0FBQyxPQUFSLENBQWdCLENBQUMsY0FBRCxDQUFoQixDQUEvQixDQUFBLENBQUE7ZUFDQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtpQkFBRyxtQkFBQSxDQUFvQixJQUFwQixFQUFIO1FBQUEsQ0FBaEIsRUFGUztNQUFBLENBQVgsQ0FBQSxDQUFBO2FBSUEsRUFBQSxDQUFHLG9CQUFILEVBQXlCLFNBQUEsR0FBQTtlQUN2QixNQUFBLENBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUF0QixDQUEyQixDQUFDLG9CQUE1QixDQUFpRCxXQUFqRCxFQUR1QjtNQUFBLENBQXpCLEVBTGdDO0lBQUEsQ0FBbEMsQ0FIQSxDQUFBO0FBQUEsSUFXQSxRQUFBLENBQVMsb0JBQVQsRUFBK0IsU0FBQSxHQUFBO0FBQzdCLE1BQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFFBQUEsS0FBQSxDQUFNLEdBQU4sRUFBVyxRQUFYLENBQW9CLENBQUMsU0FBckIsQ0FBK0IsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsQ0FBQyxjQUFELENBQWhCLENBQS9CLENBQUEsQ0FBQTtlQUNBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2lCQUFHLG1CQUFBLENBQW9CLElBQXBCLEVBQUg7UUFBQSxDQUFoQixFQUZTO01BQUEsQ0FBWCxDQUFBLENBQUE7YUFJQSxFQUFBLENBQUcsa0JBQUgsRUFBdUIsU0FBQSxHQUFBO2VBQ3JCLE1BQUEsQ0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQXRCLENBQTJCLENBQUMsb0JBQTVCLENBQWlELFdBQWpELEVBRHFCO01BQUEsQ0FBdkIsRUFMNkI7SUFBQSxDQUEvQixDQVhBLENBQUE7V0FtQkEsUUFBQSxDQUFTLHNCQUFULEVBQWlDLFNBQUEsR0FBQTtBQUMvQixNQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxRQUFBLEtBQUEsQ0FBTSxHQUFOLEVBQVcsUUFBWCxDQUFvQixDQUFDLFNBQXJCLENBQStCLE9BQU8sQ0FBQyxPQUFSLENBQWdCLENBQUMsY0FBRCxDQUFoQixDQUEvQixDQUFBLENBQUE7ZUFDQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtpQkFBRyxtQkFBQSxDQUFvQixJQUFwQixFQUFIO1FBQUEsQ0FBaEIsRUFGUztNQUFBLENBQVgsQ0FBQSxDQUFBO2FBSUEsRUFBQSxDQUFHLG9CQUFILEVBQXlCLFNBQUEsR0FBQTtlQUN2QixNQUFBLENBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUF0QixDQUEyQixDQUFDLG9CQUE1QixDQUFpRCxXQUFqRCxFQUR1QjtNQUFBLENBQXpCLEVBTCtCO0lBQUEsQ0FBakMsRUFwQjhCO0VBQUEsQ0FBaEMsQ0FKQSxDQUFBO0FBQUEiCn0=

//# sourceURL=/home/takaaki/.atom/packages/git-plus/spec/models/git-open-changed-files-spec.coffee
