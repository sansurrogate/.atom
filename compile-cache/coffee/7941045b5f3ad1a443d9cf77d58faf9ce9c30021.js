(function() {
  var BranchListView, OutputViewManager, PullBranchListView, git, notifier,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  git = require('../git');

  OutputViewManager = require('../output-view-manager');

  notifier = require('../notifier');

  BranchListView = require('./branch-list-view');

  module.exports = PullBranchListView = (function(_super) {
    __extends(PullBranchListView, _super);

    function PullBranchListView() {
      return PullBranchListView.__super__.constructor.apply(this, arguments);
    }

    PullBranchListView.prototype.initialize = function(repo, data, remote, extraArgs) {
      this.repo = repo;
      this.data = data;
      this.remote = remote;
      this.extraArgs = extraArgs;
      PullBranchListView.__super__.initialize.apply(this, arguments);
      return this.result = new Promise((function(_this) {
        return function(resolve, reject) {
          _this.resolve = resolve;
          return _this.reject = reject;
        };
      })(this));
    };

    PullBranchListView.prototype.parseData = function() {
      var branches, currentBranch, items;
      this.currentBranchString = '== Current ==';
      currentBranch = {
        name: this.currentBranchString
      };
      items = this.data.split("\n");
      branches = items.filter(function(item) {
        return item !== '';
      }).map(function(item) {
        return {
          name: item.replace(/\s/g, '')
        };
      });
      if (branches.length === 1) {
        this.confirmed(branches[0]);
      } else {
        this.setItems([currentBranch].concat(branches));
      }
      return this.focusFilterEditor();
    };

    PullBranchListView.prototype.confirmed = function(_arg) {
      var name;
      name = _arg.name;
      if (name === this.currentBranchString) {
        this.pull();
      } else {
        this.pull(name.substring(name.indexOf('/') + 1));
      }
      return this.cancel();
    };

    PullBranchListView.prototype.pull = function(remoteBranch) {
      var args, startMessage, view;
      if (remoteBranch == null) {
        remoteBranch = '';
      }
      view = OutputViewManager.create();
      startMessage = notifier.addInfo("Pulling...", {
        dismissable: true
      });
      args = ['pull'].concat(this.extraArgs, this.remote, remoteBranch).filter(function(arg) {
        return arg !== '';
      });
      return git.cmd(args, {
        cwd: this.repo.getWorkingDirectory()
      }, {
        color: true
      }).then((function(_this) {
        return function(data) {
          _this.resolve();
          view.setContent(data).finish();
          return startMessage.dismiss();
        };
      })(this))["catch"]((function(_this) {
        return function(error) {
          view.setContent(error).finish();
          return startMessage.dismiss();
        };
      })(this));
    };

    return PullBranchListView;

  })(BranchListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvdmlld3MvcHVsbC1icmFuY2gtbGlzdC12aWV3LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxvRUFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSLENBQU4sQ0FBQTs7QUFBQSxFQUNBLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSx3QkFBUixDQURwQixDQUFBOztBQUFBLEVBRUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSLENBRlgsQ0FBQTs7QUFBQSxFQUdBLGNBQUEsR0FBaUIsT0FBQSxDQUFRLG9CQUFSLENBSGpCLENBQUE7O0FBQUEsRUFLQSxNQUFNLENBQUMsT0FBUCxHQUdRO0FBQ0oseUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLGlDQUFBLFVBQUEsR0FBWSxTQUFFLElBQUYsRUFBUyxJQUFULEVBQWdCLE1BQWhCLEVBQXlCLFNBQXpCLEdBQUE7QUFDVixNQURXLElBQUMsQ0FBQSxPQUFBLElBQ1osQ0FBQTtBQUFBLE1BRGtCLElBQUMsQ0FBQSxPQUFBLElBQ25CLENBQUE7QUFBQSxNQUR5QixJQUFDLENBQUEsU0FBQSxNQUMxQixDQUFBO0FBQUEsTUFEa0MsSUFBQyxDQUFBLFlBQUEsU0FDbkMsQ0FBQTtBQUFBLE1BQUEsb0RBQUEsU0FBQSxDQUFBLENBQUE7YUFDQSxJQUFDLENBQUEsTUFBRCxHQUFjLElBQUEsT0FBQSxDQUFRLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLE9BQUQsRUFBVSxNQUFWLEdBQUE7QUFDcEIsVUFBQSxLQUFDLENBQUEsT0FBRCxHQUFXLE9BQVgsQ0FBQTtpQkFDQSxLQUFDLENBQUEsTUFBRCxHQUFVLE9BRlU7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENB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

//# sourceURL=/home/takaaki/.atom/packages/git-plus/lib/views/pull-branch-list-view.coffee
