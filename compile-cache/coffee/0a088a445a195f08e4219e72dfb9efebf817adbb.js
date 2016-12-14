(function() {
  var $$, ListView, OutputViewManager, PullBranchListView, SelectListView, git, notifier, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom-space-pen-views'), $$ = _ref.$$, SelectListView = _ref.SelectListView;

  git = require('../git');

  notifier = require('../notifier');

  OutputViewManager = require('../output-view-manager');

  PullBranchListView = require('./pull-branch-list-view');

  module.exports = ListView = (function(_super) {
    __extends(ListView, _super);

    function ListView() {
      return ListView.__super__.constructor.apply(this, arguments);
    }

    ListView.prototype.initialize = function(repo, data, _arg) {
      var _ref1;
      this.repo = repo;
      this.data = data;
      _ref1 = _arg != null ? _arg : {}, this.mode = _ref1.mode, this.tag = _ref1.tag, this.extraArgs = _ref1.extraArgs;
      ListView.__super__.initialize.apply(this, arguments);
      if (this.tag == null) {
        this.tag = '';
      }
      if (this.extraArgs == null) {
        this.extraArgs = [];
      }
      this.show();
      this.parseData();
      return this.result = new Promise((function(_this) {
        return function(resolve, reject) {
          _this.resolve = resolve;
          _this.reject = reject;
        };
      })(this));
    };

    ListView.prototype.parseData = function() {
      var items, remotes;
      items = this.data.split("\n");
      remotes = items.filter(function(item) {
        return item !== '';
      }).map(function(item) {
        return {
          name: item
        };
      });
      if (remotes.length === 1) {
        return this.confirmed(remotes[0]);
      } else {
        this.setItems(remotes);
        return this.focusFilterEditor();
      }
    };

    ListView.prototype.getFilterKey = function() {
      return 'name';
    };

    ListView.prototype.show = function() {
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      return this.storeFocusedElement();
    };

    ListView.prototype.cancelled = function() {
      return this.hide();
    };

    ListView.prototype.hide = function() {
      var _ref1;
      return (_ref1 = this.panel) != null ? _ref1.destroy() : void 0;
    };

    ListView.prototype.viewForItem = function(_arg) {
      var name;
      name = _arg.name;
      return $$(function() {
        return this.li(name);
      });
    };

    ListView.prototype.pull = function(remoteName) {
      return git.cmd(['branch', '-r'], {
        cwd: this.repo.getWorkingDirectory()
      }).then((function(_this) {
        return function(data) {
          return new PullBranchListView(_this.repo, data, remoteName, _this.extraArgs).result;
        };
      })(this));
    };

    ListView.prototype.confirmed = function(_arg) {
      var name, pullOption;
      name = _arg.name;
      if (this.mode === 'pull') {
        this.pull(name);
      } else if (this.mode === 'fetch-prune') {
        this.mode = 'fetch';
        this.execute(name, '--prune');
      } else if (this.mode === 'push') {
        pullOption = atom.config.get('git-plus.pullBeforePush');
        this.extraArgs = (pullOption != null ? pullOption.includes('--rebase') : void 0) ? '--rebase' : '';
        if (!((pullOption != null) && pullOption === 'no')) {
          this.pull(name).then((function(_this) {
            return function() {
              return _this.execute(name);
            };
          })(this));
        } else {
          this.execute(name);
        }
      } else if (this.mode === 'push -u') {
        this.pushAndSetUpstream(name);
      } else {
        this.execute(name);
      }
      return this.cancel();
    };

    ListView.prototype.execute = function(remote, extraArgs) {
      var args, message, startMessage, view;
      if (remote == null) {
        remote = '';
      }
      if (extraArgs == null) {
        extraArgs = '';
      }
      view = OutputViewManager.create();
      args = [this.mode];
      if (extraArgs.length > 0) {
        args.push(extraArgs);
      }
      args = args.concat([remote, this.tag]).filter(function(arg) {
        return arg !== '';
      });
      message = "" + (this.mode[0].toUpperCase() + this.mode.substring(1)) + "ing...";
      startMessage = notifier.addInfo(message, {
        dismissable: true
      });
      return git.cmd(args, {
        cwd: this.repo.getWorkingDirectory()
      }, {
        color: true
      }).then(function(data) {
        if (data !== '') {
          view.setContent(data).finish();
        }
        return startMessage.dismiss();
      })["catch"]((function(_this) {
        return function(data) {
          if (data !== '') {
            view.setContent(data).finish();
          }
          return startMessage.dismiss();
        };
      })(this));
    };

    ListView.prototype.pushAndSetUpstream = function(remote) {
      var args, message, startMessage, view;
      if (remote == null) {
        remote = '';
      }
      view = OutputViewManager.create();
      args = ['push', '-u', remote, 'HEAD'].filter(function(arg) {
        return arg !== '';
      });
      message = "Pushing...";
      startMessage = notifier.addInfo(message, {
        dismissable: true
      });
      return git.cmd(args, {
        cwd: this.repo.getWorkingDirectory()
      }, {
        color: true
      }).then(function(data) {
        if (data !== '') {
          view.setContent(data).finish();
        }
        return startMessage.dismiss();
      })["catch"]((function(_this) {
        return function(data) {
          if (data !== '') {
            view.setContent(data).finish();
          }
          return startMessage.dismiss();
        };
      })(this));
    };

    return ListView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvdmlld3MvcmVtb3RlLWxpc3Qtdmlldy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsd0ZBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFBLE9BQXVCLE9BQUEsQ0FBUSxzQkFBUixDQUF2QixFQUFDLFVBQUEsRUFBRCxFQUFLLHNCQUFBLGNBQUwsQ0FBQTs7QUFBQSxFQUVBLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUixDQUZOLENBQUE7O0FBQUEsRUFHQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVIsQ0FIWCxDQUFBOztBQUFBLEVBSUEsaUJBQUEsR0FBb0IsT0FBQSxDQUFRLHdCQUFSLENBSnBCLENBQUE7O0FBQUEsRUFLQSxrQkFBQSxHQUFxQixPQUFBLENBQVEseUJBQVIsQ0FMckIsQ0FBQTs7QUFBQSxFQU9BLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSiwrQkFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsdUJBQUEsVUFBQSxHQUFZLFNBQUUsSUFBRixFQUFTLElBQVQsRUFBZSxJQUFmLEdBQUE7QUFDVixVQUFBLEtBQUE7QUFBQSxNQURXLElBQUMsQ0FBQSxPQUFBLElBQ1osQ0FBQTtBQUFBLE1BRGtCLElBQUMsQ0FBQSxPQUFBLElBQ25CLENBQUE7QUFBQSw2QkFEeUIsT0FBMEIsSUFBekIsSUFBQyxDQUFBLGFBQUEsTUFBTSxJQUFDLENBQUEsWUFBQSxLQUFLLElBQUMsQ0FBQSxrQkFBQSxTQUN4QyxDQUFBO0FBQUEsTUFBQSwwQ0FBQSxTQUFBLENBQUEsQ0FBQTs7UUFDQSxJQUFDLENBQUEsTUFBTztPQURSOztRQUVBLElBQUMsQ0FBQSxZQUFhO09BRmQ7QUFBQSxNQUdBLElBQUMsQ0FBQSxJQUFELENBQUEsQ0FIQSxDQUFBO0FBQUEsTUFJ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

//# sourceURL=/home/takaaki/.atom/packages/git-plus/lib/views/remote-list-view.coffee
