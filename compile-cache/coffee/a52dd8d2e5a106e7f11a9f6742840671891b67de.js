(function() {
  var RemoteListView, experimentalFeaturesEnabled, getUpstreamBranch, git, pull;

  git = require('../git');

  pull = require('./_pull');

  RemoteListView = require('../views/remote-list-view');

  experimentalFeaturesEnabled = function() {
    var gitPlus;
    gitPlus = atom.config.get('git-plus');
    return gitPlus.alwaysPullFromUpstream && gitPlus.experimental;
  };

  getUpstreamBranch = function(repo) {
    var branch, ref, remote, upstream;
    upstream = repo.getUpstreamBranch();
    ref = upstream.substring('refs/remotes/'.length).split('/'), remote = ref[0], branch = ref[1];
    return {
      remote: remote,
      branch: branch
    };
  };

  module.exports = function(repo, arg) {
    var branch, extraArgs, rebase, ref, remote;
    rebase = (arg != null ? arg : {}).rebase;
    extraArgs = rebase ? ['--rebase'] : [];
    if (experimentalFeaturesEnabled()) {
      ref = getUpstreamBranch(repo), remote = ref.remote, branch = ref.branch;
      return pull(repo, {
        remote: remote,
        branch: branch,
        extraArgs: extraArgs
      });
    } else {
      return git.cmd(['remote'], {
        cwd: repo.getWorkingDirectory()
      }).then(function(data) {
        return new RemoteListView(repo, data, {
          mode: 'pull',
          extraArgs: extraArgs
        }).result;
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvbW9kZWxzL2dpdC1wdWxsLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUNOLElBQUEsR0FBTyxPQUFBLENBQVEsU0FBUjs7RUFDUCxjQUFBLEdBQWlCLE9BQUEsQ0FBUSwyQkFBUjs7RUFFakIsMkJBQUEsR0FBOEIsU0FBQTtBQUM1QixRQUFBO0lBQUEsT0FBQSxHQUFVLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixVQUFoQjtXQUNWLE9BQU8sQ0FBQyxzQkFBUixJQUFtQyxPQUFPLENBQUM7RUFGZjs7RUFJOUIsaUJBQUEsR0FBb0IsU0FBQyxJQUFEO0FBQ2xCLFFBQUE7SUFBQSxRQUFBLEdBQVcsSUFBSSxDQUFDLGlCQUFMLENBQUE7SUFDWCxNQUFtQixRQUFRLENBQUMsU0FBVCxDQUFtQixlQUFlLENBQUMsTUFBbkMsQ0FBMEMsQ0FBQyxLQUEzQyxDQUFpRCxHQUFqRCxDQUFuQixFQUFDLGVBQUQsRUFBUztXQUNUO01BQUUsUUFBQSxNQUFGO01BQVUsUUFBQSxNQUFWOztFQUhrQjs7RUFLcEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxJQUFELEVBQU8sR0FBUDtBQUNmLFFBQUE7SUFEdUIsd0JBQUQsTUFBUztJQUMvQixTQUFBLEdBQWUsTUFBSCxHQUFlLENBQUMsVUFBRCxDQUFmLEdBQWlDO0lBQzdDLElBQUcsMkJBQUEsQ0FBQSxDQUFIO01BQ0UsTUFBbUIsaUJBQUEsQ0FBa0IsSUFBbEIsQ0FBbkIsRUFBQyxtQkFBRCxFQUFTO2FBQ1QsSUFBQSxDQUFLLElBQUwsRUFBVztRQUFDLFFBQUEsTUFBRDtRQUFTLFFBQUEsTUFBVDtRQUFpQixXQUFBLFNBQWpCO09BQVgsRUFGRjtLQUFBLE1BQUE7YUFJRSxHQUFHLENBQUMsR0FBSixDQUFRLENBQUMsUUFBRCxDQUFSLEVBQW9CO1FBQUEsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQUw7T0FBcEIsQ0FDQSxDQUFDLElBREQsQ0FDTSxTQUFDLElBQUQ7ZUFBVSxJQUFJLGNBQUEsQ0FBZSxJQUFmLEVBQXFCLElBQXJCLEVBQTJCO1VBQUEsSUFBQSxFQUFNLE1BQU47VUFBYyxTQUFBLEVBQVcsU0FBekI7U0FBM0IsQ0FBOEQsQ0FBQztNQUE3RSxDQUROLEVBSkY7O0VBRmU7QUFiakIiLCJzb3VyY2VzQ29udGVudCI6WyJnaXQgPSByZXF1aXJlICcuLi9naXQnXG5wdWxsID0gcmVxdWlyZSAnLi9fcHVsbCdcblJlbW90ZUxpc3RWaWV3ID0gcmVxdWlyZSAnLi4vdmlld3MvcmVtb3RlLWxpc3QtdmlldydcblxuZXhwZXJpbWVudGFsRmVhdHVyZXNFbmFibGVkID0gKCkgLT5cbiAgZ2l0UGx1cyA9IGF0b20uY29uZmlnLmdldCgnZ2l0LXBsdXMnKVxuICBnaXRQbHVzLmFsd2F5c1B1bGxGcm9tVXBzdHJlYW0gYW5kIGdpdFBsdXMuZXhwZXJpbWVudGFsXG5cbmdldFVwc3RyZWFtQnJhbmNoID0gKHJlcG8pIC0+XG4gIHVwc3RyZWFtID0gcmVwby5nZXRVcHN0cmVhbUJyYW5jaCgpXG4gIFtyZW1vdGUsIGJyYW5jaF0gPSB1cHN0cmVhbS5zdWJzdHJpbmcoJ3JlZnMvcmVtb3Rlcy8nLmxlbmd0aCkuc3BsaXQoJy8nKVxuICB7IHJlbW90ZSwgYnJhbmNoIH1cblxubW9kdWxlLmV4cG9ydHMgPSAocmVwbywge3JlYmFzZX09e30pIC0+XG4gIGV4dHJhQXJncyA9IGlmIHJlYmFzZSB0aGVuIFsnLS1yZWJhc2UnXSBlbHNlIFtdXG4gIGlmIGV4cGVyaW1lbnRhbEZlYXR1cmVzRW5hYmxlZCgpXG4gICAge3JlbW90ZSwgYnJhbmNofSA9IGdldFVwc3RyZWFtQnJhbmNoIHJlcG9cbiAgICBwdWxsIHJlcG8sIHtyZW1vdGUsIGJyYW5jaCwgZXh0cmFBcmdzfVxuICBlbHNlXG4gICAgZ2l0LmNtZChbJ3JlbW90ZSddLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpKVxuICAgIC50aGVuIChkYXRhKSAtPiBuZXcgUmVtb3RlTGlzdFZpZXcocmVwbywgZGF0YSwgbW9kZTogJ3B1bGwnLCBleHRyYUFyZ3M6IGV4dHJhQXJncykucmVzdWx0XG4iXX0=
