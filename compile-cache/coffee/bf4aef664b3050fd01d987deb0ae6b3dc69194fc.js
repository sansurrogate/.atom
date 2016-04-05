(function() {
  var PullBranchListView, git, options, repo;

  git = require('../../lib/git');

  PullBranchListView = require('../../lib/views/pull-branch-list-view');

  repo = require('../fixtures').repo;

  options = {
    cwd: repo.getWorkingDirectory()
  };

  describe("PullBranchListView", function() {
    beforeEach(function() {
      this.view = new PullBranchListView(repo, "branch1\nbranch2", "remote", '');
      return spyOn(git, 'cmd').andReturn(Promise.resolve('pulled'));
    });
    it("displays a list of branches and the first option is a special one for the current branch", function() {
      expect(this.view.items.length).toBe(3);
      return expect(this.view.items[0].name).toEqual('== Current ==');
    });
    it("has a property called result which is a promise", function() {
      expect(this.view.result).toBeDefined();
      expect(this.view.result.then).toBeDefined();
      return expect(this.view.result["catch"]).toBeDefined();
    });
    describe("when the special option is selected", function() {
      return it("calls git.cmd with ['pull'] and remote name", function() {
        this.view.confirmSelection();
        waitsFor(function() {
          return git.cmd.callCount > 0;
        });
        return runs(function() {
          return expect(git.cmd).toHaveBeenCalledWith(['pull', 'remote'], options);
        });
      });
    });
    describe("when a branch option is selected", function() {
      return it("calls git.cmd with ['pull'], the remote name, and branch name", function() {
        this.view.selectNextItemView();
        this.view.confirmSelection();
        waitsFor(function() {
          return git.cmd.callCount > 0;
        });
        return runs(function() {
          return expect(git.cmd).toHaveBeenCalledWith(['pull', 'remote', 'branch1'], options);
        });
      });
    });
    return describe("when '--rebase' is passed as extraArgs", function() {
      return it("calls git.cmd with ['pull', '--rebase'], the remote name", function() {
        var view;
        view = new PullBranchListView(repo, "branch1\nbranch2", "remote", '--rebase');
        view.confirmSelection();
        waitsFor(function() {
          return git.cmd.callCount > 0;
        });
        return runs(function() {
          return expect(git.cmd).toHaveBeenCalledWith(['pull', '--rebase', 'remote'], options);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9zcGVjL3ZpZXdzL3B1bGwtYnJhbmNoLWxpc3Qtdmlldy1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxzQ0FBQTs7QUFBQSxFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsZUFBUixDQUFOLENBQUE7O0FBQUEsRUFDQSxrQkFBQSxHQUFxQixPQUFBLENBQVEsdUNBQVIsQ0FEckIsQ0FBQTs7QUFBQSxFQUVDLE9BQVEsT0FBQSxDQUFRLGFBQVIsRUFBUixJQUZELENBQUE7O0FBQUEsRUFHQSxPQUFBLEdBQVU7QUFBQSxJQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFMO0dBSFYsQ0FBQTs7QUFBQSxFQUtBLFFBQUEsQ0FBUyxvQkFBVCxFQUErQixTQUFBLEdBQUE7QUFDN0IsSUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsTUFBQSxJQUFDLENBQUEsSUFBRCxHQUFZLElBQUEsa0JBQUEsQ0FBbUIsSUFBbkIsRUFBeUIsa0JBQXpCLEVBQTZDLFFBQTdDLEVBQXVELEVBQXZELENBQVosQ0FBQTthQUNBLEtBQUEsQ0FBTSxHQUFOLEVBQVcsS0FBWCxDQUFpQixDQUFDLFNBQWxCLENBQTRCLE9BQU8sQ0FBQyxPQUFSLENBQWdCLFFBQWhCLENBQTVCLEVBRlM7SUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLElBSUEsRUFBQSxDQUFHLDBGQUFILEVBQStGLFNBQUEsR0FBQTtBQUM3RixNQUFBLE1BQUEsQ0FBTyxJQUFDLENBQUEsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFuQixDQUEwQixDQUFDLElBQTNCLENBQWdDLENBQWhDLENBQUEsQ0FBQTthQUNBLE1BQUEsQ0FBTyxJQUFDLENBQUEsSUFBSSxDQUFDLEtBQU0sQ0FBQSxD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

//# sourceURL=/home/takaaki/.atom/packages/git-plus/spec/views/pull-branch-list-view-spec.coffee
