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
          })(this))["catch"](function() {});
        } else {
          this.execute(name);
        }
      } else {
        this.execute(name);
      }
      return this.cancel();
    };

    ListView.prototype.execute = function(remote, extraArgs) {
      var args, command, message, startMessage, view, _ref1;
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
      command = (_ref1 = atom.config.get('git-plus.gitPath')) != null ? _ref1 : 'git';
      message = "" + (this.mode[0].toUpperCase() + this.mode.substring(1)) + "ing...";
      startMessage = notifier.addInfo(message, {
        dismissable: true
      });
      return git.cmd(args, {
        cwd: this.repo.getWorkingDirectory()
      }).then(function(data) {
        if (data !== '') {
          view.addLine(data).finish();
        }
        return startMessage.dismiss();
      })["catch"]((function(_this) {
        return function(data) {
          return git.cmd([_this.mode, '-u', remote, 'HEAD'], {
            cwd: _this.repo.getWorkingDirectory()
          }).then(function(message) {
            view.addLine(message).finish();
            return startMessage.dismiss();
          })["catch"](function(error) {
            view.addLine(error).finish();
            return startMessage.dismiss();
          });
        };
      })(this));
    };

    return ListView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvdmlld3MvcmVtb3RlLWxpc3Qtdmlldy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsd0ZBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFBLE9BQXVCLE9BQUEsQ0FBUSxzQkFBUixDQUF2QixFQUFDLFVBQUEsRUFBRCxFQUFLLHNCQUFBLGNBQUwsQ0FBQTs7QUFBQSxFQUVBLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUixDQUZOLENBQUE7O0FBQUEsRUFHQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVIsQ0FIWCxDQUFBOztBQUFBLEVBSUEsaUJBQUEsR0FBb0IsT0FBQSxDQUFRLHdCQUFSLENBSnBCLENBQUE7O0FBQUEsRUFLQSxrQkFBQSxHQUFxQixPQUFBLENBQVEseUJBQVIsQ0FMckIsQ0FBQTs7QUFBQSxFQU9BLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSiwrQkFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsdUJBQUEsVUFBQSxHQUFZLFNBQUUsSUFBRixFQUFTLElBQVQsRUFBZSxJQUFmLEdBQUE7QUFDVixVQUFBLEtBQUE7QUFBQSxNQURXLElBQUMsQ0FBQSxPQUFBLElBQ1osQ0FBQTtBQUFBLE1BRGtCLElBQUMsQ0FBQSxPQUFBLElBQ25CLENBQUE7QUFBQSw2QkFEeUIsT0FBMEIsSUFBekIsSUFBQyxDQUFBLGFBQUEsTUFBTSxJQUFDLENBQUEsWUFBQSxLQUFLLElBQUMsQ0FBQSxrQkFBQSxTQUN4QyxDQUFBO0FBQUEsTUFBQSwwQ0FBQSxTQUFBLENBQUEsQ0FBQTs7UUFDQSxJQUFDLENBQUEsTUFBTztPQURSOztRQUVBLElBQUMsQ0FBQSxZQUFhO09BRmQ7QUFBQSxNQUdBLElBQUMsQ0FBQSxJQUFELENBQUEsQ0FIQSxDQUFBO0FBQUEsTUFJ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

//# sourceURL=/home/takaaki/.atom/packages/git-plus/lib/views/remote-list-view.coffee
