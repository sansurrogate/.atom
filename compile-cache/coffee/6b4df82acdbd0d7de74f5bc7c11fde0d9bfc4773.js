(function() {
  var RemoteListView, git, options, pullBeforePush, remotes, repo;

  git = require('../../lib/git');

  RemoteListView = require('../../lib/views/remote-list-view');

  repo = require('../fixtures').repo;

  options = {
    cwd: repo.getWorkingDirectory()
  };

  remotes = "remote1\nremote2";

  pullBeforePush = 'git-plus.pullBeforePush';

  describe("RemoteListView", function() {
    it("displays a list of remotes", function() {
      var view;
      view = new RemoteListView(repo, remotes, {
        mode: 'pull'
      });
      return expect(view.items.length).toBe(2);
    });
    describe("when mode is pull", function() {
      return it("it calls git.cmd to get the remote branches", function() {
        var view;
        view = new RemoteListView(repo, remotes, {
          mode: 'pull'
        });
        spyOn(git, 'cmd').andCallFake(function() {
          return Promise.resolve('branch1\nbranch2');
        });
        view.confirmSelection();
        waitsFor(function() {
          return git.cmd.callCount > 0;
        });
        return runs(function() {
          return expect(git.cmd).toHaveBeenCalledWith(['branch', '-r'], options);
        });
      });
    });
    describe("when mode is fetch", function() {
      return it("it calls git.cmd to with ['fetch'] and the remote name", function() {
        var view;
        spyOn(git, 'cmd').andCallFake(function() {
          return Promise.resolve('fetched stuff');
        });
        view = new RemoteListView(repo, remotes, {
          mode: 'fetch'
        });
        view.confirmSelection();
        waitsFor(function() {
          return git.cmd.callCount > 0;
        });
        return runs(function() {
          return expect(git.cmd).toHaveBeenCalledWith(['fetch', 'remote1'], options);
        });
      });
    });
    describe("when mode is fetch-prune", function() {
      return it("it calls git.cmd to with ['fetch', '--prune'] and the remote name", function() {
        var view;
        spyOn(git, 'cmd').andCallFake(function() {
          return Promise.resolve('fetched stuff');
        });
        view = new RemoteListView(repo, remotes, {
          mode: 'fetch-prune'
        });
        view.confirmSelection();
        waitsFor(function() {
          return git.cmd.callCount > 0;
        });
        return runs(function() {
          return expect(git.cmd).toHaveBeenCalledWith(['fetch', '--prune', 'remote1'], options);
        });
      });
    });
    describe("when mode is push", function() {
      return it("calls git.cmd with ['push']", function() {
        var view;
        spyOn(git, 'cmd').andReturn(Promise.resolve('pushing text'));
        view = new RemoteListView(repo, remotes, {
          mode: 'push'
        });
        view.confirmSelection();
        waitsFor(function() {
          return git.cmd.callCount > 1;
        });
        return runs(function() {
          return expect(git.cmd).toHaveBeenCalledWith(['push', 'remote1'], options);
        });
      });
    });
    return describe("when mode is push and there is no upstream set", function() {
      it("calls git.cmd with ['push', '-u'] and remote name", function() {
        var view;
        atom.config.set(pullBeforePush, 'no');
        spyOn(git, 'cmd').andCallFake(function() {
          if (git.cmd.callCount === 1) {
            return Promise.reject('no upstream');
          } else {
            return Promise.resolve('pushing text');
          }
        });
        view = new RemoteListView(repo, remotes, {
          mode: 'push'
        });
        view.confirmSelection();
        waitsFor(function() {
          return git.cmd.callCount > 1;
        });
        return runs(function() {
          return expect(git.cmd).toHaveBeenCalledWith(['push', '-u', 'remote1', 'HEAD'], options);
        });
      });
      describe("when the the config for pull before push is set to true", function() {
        return it("calls git.cmd with ['pull'], remote name, and branch name and then with ['push']", function() {
          var view;
          spyOn(git, 'cmd').andReturn(Promise.resolve('branch1'));
          atom.config.set(pullBeforePush, 'pull');
          view = new RemoteListView(repo, remotes, {
            mode: 'push'
          });
          view.confirmSelection();
          waitsFor(function() {
            return git.cmd.callCount > 2;
          });
          return runs(function() {
            expect(git.cmd).toHaveBeenCalledWith(['pull', 'remote1', 'branch1'], options);
            return expect(git.cmd).toHaveBeenCalledWith(['push', 'remote1'], options);
          });
        });
      });
      return describe("when the the config for pull before push is set to 'Pull --rebase'", function() {
        return it("calls git.cmd with ['pull', '--rebase'], remote name, and branch name and then with ['push']", function() {
          var view;
          spyOn(git, 'cmd').andReturn(Promise.resolve('branch1'));
          atom.config.set(pullBeforePush, 'pull --rebase');
          view = new RemoteListView(repo, remotes, {
            mode: 'push'
          });
          view.confirmSelection();
          waitsFor(function() {
            return git.cmd.callCount > 2;
          });
          return runs(function() {
            expect(git.cmd).toHaveBeenCalledWith(['pull', '--rebase', 'remote1', 'branch1'], options);
            return expect(git.cmd).toHaveBeenCalledWith(['push', 'remote1'], options);
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9zcGVjL3ZpZXdzL3JlbW90ZS1saXN0LXZpZXctc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsMkRBQUE7O0FBQUEsRUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLGVBQVIsQ0FBTixDQUFBOztBQUFBLEVBQ0EsY0FBQSxHQUFpQixPQUFBLENBQVEsa0NBQVIsQ0FEakIsQ0FBQTs7QUFBQSxFQUVDLE9BQVEsT0FBQSxDQUFRLGFBQVIsRUFBUixJQUZELENBQUE7O0FBQUEsRUFHQSxPQUFBLEdBQVU7QUFBQSxJQUFDLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFOO0dBSFYsQ0FBQTs7QUFBQSxFQUlBLE9BQUEsR0FBVSxrQkFKVixDQUFBOztBQUFBLEVBS0EsY0FBQSxHQUFpQix5QkFMakIsQ0FBQTs7QUFBQSxFQU9BLFFBQUEsQ0FBUyxnQkFBVCxFQUEyQixTQUFBLEdBQUE7QUFDekIsSUFBQSxFQUFBLENBQUcsNEJBQUgsRUFBaUMsU0FBQSxHQUFBO0FBQy9CLFVBQUEsSUFBQTtBQUFBLE1BQUEsSUFBQSxHQUFXLElBQUEsY0FBQSxDQUFlLElBQWYsRUFBcUIsT0FBckIsRUFBOEI7QUFBQSxRQUFBLElBQUEsRUFBTSxNQUFOO09BQTlCLENBQVgsQ0FBQTthQUNBLE1BQUEsQ0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQWxCLENBQXlCLENBQUMsSUFBMUIsQ0FBK0IsQ0FBL0IsRUFGK0I7SUFBQSxDQUFqQyxDQUFBLENBQUE7QUFBQSxJQUlBLFFBQUEsQ0FBUyxtQkFBVCxFQUE4QixTQUFBLEdBQUE7YUFDNUIsRUFBQSxDQUFHLDZDQUFILEVBQWtELFNBQUEsR0FBQTtBQUNoRCxZQUFBLElBQUE7QUFBQSxRQUFBLElBQUEs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

//# sourceURL=/home/takaaki/.atom/packages/git-plus/spec/views/remote-list-view-spec.coffee
