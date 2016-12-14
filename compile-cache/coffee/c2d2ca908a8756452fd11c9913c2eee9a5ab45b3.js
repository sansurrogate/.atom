(function() {
  var $$, ListView, OutputViewManager, PullBranchListView, SelectListView, _pull, git, notifier, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), $$ = ref.$$, SelectListView = ref.SelectListView;

  git = require('../git');

  _pull = require('../models/_pull');

  notifier = require('../notifier');

  OutputViewManager = require('../output-view-manager');

  PullBranchListView = require('./pull-branch-list-view');

  module.exports = ListView = (function(superClass) {
    extend(ListView, superClass);

    function ListView() {
      return ListView.__super__.constructor.apply(this, arguments);
    }

    ListView.prototype.initialize = function(repo, data1, arg1) {
      var ref1;
      this.repo = repo;
      this.data = data1;
      ref1 = arg1 != null ? arg1 : {}, this.mode = ref1.mode, this.tag = ref1.tag, this.extraArgs = ref1.extraArgs;
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
      var ref1;
      return (ref1 = this.panel) != null ? ref1.destroy() : void 0;
    };

    ListView.prototype.viewForItem = function(arg1) {
      var name;
      name = arg1.name;
      return $$(function() {
        return this.li(name);
      });
    };

    ListView.prototype.pull = function(remoteName) {
      if (atom.config.get('git-plus.alwaysPullFromUpstream')) {
        return _pull(this.repo, {
          extraArgs: [this.extraArgs]
        });
      } else {
        return git.cmd(['branch', '--no-color', '-r'], {
          cwd: this.repo.getWorkingDirectory()
        }).then((function(_this) {
          return function(data) {
            return new PullBranchListView(_this.repo, data, remoteName, _this.extraArgs).result;
          };
        })(this));
      }
    };

    ListView.prototype.confirmed = function(arg1) {
      var name, pullOption;
      name = arg1.name;
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
      message = (this.mode[0].toUpperCase() + this.mode.substring(1)) + "ing...";
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvdmlld3MvcmVtb3RlLWxpc3Qtdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDhGQUFBO0lBQUE7OztFQUFBLE1BQXVCLE9BQUEsQ0FBUSxzQkFBUixDQUF2QixFQUFDLFdBQUQsRUFBSzs7RUFFTCxHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVI7O0VBQ04sS0FBQSxHQUFRLE9BQUEsQ0FBUSxpQkFBUjs7RUFDUixRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVI7O0VBQ1gsaUJBQUEsR0FBb0IsT0FBQSxDQUFRLHdCQUFSOztFQUNwQixrQkFBQSxHQUFxQixPQUFBLENBQVEseUJBQVI7O0VBRXJCLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7dUJBQ0osVUFBQSxHQUFZLFNBQUMsSUFBRCxFQUFRLEtBQVIsRUFBZSxJQUFmO0FBQ1YsVUFBQTtNQURXLElBQUMsQ0FBQSxPQUFEO01BQU8sSUFBQyxDQUFBLE9BQUQ7NEJBQU8sT0FBMEIsSUFBekIsSUFBQyxDQUFBLFlBQUEsTUFBTSxJQUFDLENBQUEsV0FBQSxLQUFLLElBQUMsQ0FBQSxpQkFBQTtNQUN4QywwQ0FBQSxTQUFBOztRQUNBLElBQUMsQ0FBQSxNQUFPOzs7UUFDUixJQUFDLENBQUEsWUFBYTs7TUFDZCxJQUFDLENBQUEsSUFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLFNBQUQsQ0FBQTthQUNBLElBQUMsQ0FBQSxNQUFELEdBQWMsSUFBQSxPQUFBLENBQVEsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE9BQUQsRUFBVyxNQUFYO1VBQUMsS0FBQyxDQUFBLFVBQUQ7VUFBVSxLQUFDLENBQUEsU0FBRDtRQUFYO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFSO0lBTko7O3VCQVFaLFNBQUEsR0FBVyxTQUFBO0FBQ1QsVUFBQTtNQUFBLEtB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QUFnQixJQUFoQixDQUFxQixDQUFDLE1BQXRCLENBQUEsRUFERjs7ZUFFQSxZQUFZLENBQUMsT0FBYixDQUFBO01BSEksQ0FETixDQUtBLEVBQUMsS0FBRCxFQUxBLENBS08sQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLElBQUQ7VUFDTCxJQUFHLElBQUEsS0FBVSxFQUFiO1lBQ0UsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsSUFBaEIsQ0FBcUIsQ0FBQyxNQUF0QixDQUFBLEVBREY7O2lCQUVBLFlBQVksQ0FBQyxPQUFiLENBQUE7UUFISztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FMUDtJQUxrQjs7OztLQWhGQztBQVR2QiIsInNvdXJjZXNDb250ZW50IjpbInskJCwgU2VsZWN0TGlzdFZpZXd9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5cbmdpdCA9IHJlcXVpcmUgJy4uL2dpdCdcbl9wdWxsID0gcmVxdWlyZSAnLi4vbW9kZWxzL19wdWxsJ1xubm90aWZpZXIgPSByZXF1aXJlICcuLi9ub3RpZmllcidcbk91dHB1dFZpZXdNYW5hZ2VyID0gcmVxdWlyZSAnLi4vb3V0cHV0LXZpZXctbWFuYWdlcidcblB1bGxCcmFuY2hMaXN0VmlldyA9IHJlcXVpcmUgJy4vcHVsbC1icmFuY2gtbGlzdC12aWV3J1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBMaXN0VmlldyBleHRlbmRzIFNlbGVjdExpc3RWaWV3XG4gIGluaXRpYWxpemU6IChAcmVwbywgQGRhdGEsIHtAbW9kZSwgQHRhZywgQGV4dHJhQXJnc309e30pIC0+XG4gICAgc3VwZXJcbiAgICBAdGFnID89ICcnXG4gICAgQGV4dHJhQXJncyA/PSBbXVxuICAgIEBzaG93KClcbiAgICBAcGFyc2VEYXRhKClcbiAgICBAcmVzdWx0ID0gbmV3IFByb21pc2UgKEByZXNvbHZlLCBAcmVqZWN0KSA9PlxuXG4gIHBhcnNlRGF0YTogLT5cbiAgICBpdGVtcyA9IEBkYXRhLnNwbGl0KFwiXFxuXCIpXG4gICAgcmVtb3RlcyA9IGl0ZW1zLmZpbHRlcigoaXRlbSkgLT4gaXRlbSBpc250ICcnKS5tYXAgKGl0ZW0pIC0+IHsgbmFtZTogaXRlbSB9XG4gICAgaWYgcmVtb3Rlcy5sZW5ndGggaXMgMVxuICAgICAgQGNvbmZpcm1lZCByZW1vdGVzWzBdXG4gICAgZWxzZVxuICAgICAgQHNldEl0ZW1zIHJlbW90ZXNcbiAgICAgIEBmb2N1c0ZpbHRlckVkaXRvcigpXG5cbiAgZ2V0RmlsdGVyS2V5OiAtPiAnbmFtZSdcblxuICBzaG93OiAtPlxuICAgIEBwYW5lbCA/PSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKGl0ZW06IHRoaXMpXG4gICAgQHBhbmVsLnNob3coKVxuXG4gICAgQHN0b3JlRm9jdXNlZEVsZW1lbnQoKVxuXG4gIGNhbmNlbGxlZDogLT4gQGhpZGUoKVxuXG4gIGhpZGU6IC0+XG4gICAgQHBhbmVsPy5kZXN0cm95KClcblxuICB2aWV3Rm9ySXRlbTogKHtuYW1lfSkgLT5cbiAgICAkJCAtPlxuICAgICAgQGxpIG5hbWVcblxuICBwdWxsOiAocmVtb3RlTmFtZSkgLT5cbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2dpdC1wbHVzLmFsd2F5c1B1bGxGcm9tVXBzdHJlYW0nKVxuICAgICAgX3B1bGwgQHJlcG8sIGV4dHJhQXJnczogW0BleHRyYUFyZ3NdXG4gICAgZWxzZVxuICAgICAgZ2l0LmNtZChbJ2JyYW5jaCcsICctLW5vLWNvbG9yJywgJy1yJ10sIGN3ZDogQHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpKVxuICAgICAgLnRoZW4gKGRhdGEpID0+XG4gICAgICAgIG5ldyBQdWxsQnJhbmNoTGlzdFZpZXcoQHJlcG8sIGRhdGEsIHJlbW90ZU5hbWUsIEBleHRyYUFyZ3MpLnJlc3VsdFxuXG4gIGNvbmZpcm1lZDogKHtuYW1lfSkgLT5cbiAgICBpZiBAbW9kZSBpcyAncHVsbCdcbiAgICAgIEBwdWxsIG5hbWVcbiAgICBlbHNlIGlmIEBtb2RlIGlzICdmZXRjaC1wcnVuZSdcbiAgICAgIEBtb2RlID0gJ2ZldGNoJ1xuICAgICAgQGV4ZWN1dGUgbmFtZSwgJy0tcHJ1bmUnXG4gICAgZWxzZSBpZiBAbW9kZSBpcyAncHVzaCdcbiAgICAgIHB1bGxPcHRpb24gPSBhdG9tLmNvbmZpZy5nZXQgJ2dpdC1wbHVzLnB1bGxCZWZvcmVQdXNoJ1xuICAgICAgQGV4dHJhQXJncyA9IGlmIHB1bGxPcHRpb24/LmluY2x1ZGVzICctLXJlYmFzZScgdGhlbiAnLS1yZWJhc2UnIGVsc2UgJydcbiAgICAgIHVubGVzcyBwdWxsT3B0aW9uPyBhbmQgcHVsbE9wdGlvbiBpcyAnbm8nXG4gICAgICAgIEBwdWxsKG5hbWUpLnRoZW4gPT4gQGV4ZWN1dGUgbmFtZVxuICAgICAgZWxzZVxuICAgICAgICBAZXhlY3V0ZSBuYW1lXG4gICAgZWxzZSBpZiBAbW9kZSBpcyAncHVzaCAtdSdcbiAgICAgIEBwdXNoQW5kU2V0VXBzdHJlYW0gbmFtZVxuICAgIGVsc2VcbiAgICAgIEBleGVjdXRlIG5hbWVcbiAgICBAY2FuY2VsKClcblxuICBleGVjdXRlOiAocmVtb3RlPScnLCBleHRyYUFyZ3M9JycpIC0+XG4gICAgdmlldyA9IE91dHB1dFZpZXdNYW5hZ2VyLmNyZWF0ZSgpXG4gICAgYXJncyA9IFtAbW9kZV1cbiAgICBpZiBleHRyYUFyZ3MubGVuZ3RoID4gMFxuICAgICAgYXJncy5wdXNoIGV4dHJhQXJnc1xuICAgIGFyZ3MgPSBhcmdzLmNvbmNhdChbcmVtb3RlLCBAdGFnXSkuZmlsdGVyKChhcmcpIC0+IGFyZyBpc250ICcnKVxuICAgIG1lc3NhZ2UgPSBcIiN7QG1vZGVbMF0udG9VcHBlckNhc2UoKStAbW9kZS5zdWJzdHJpbmcoMSl9aW5nLi4uXCJcbiAgICBzdGFydE1lc3NhZ2UgPSBub3RpZmllci5hZGRJbmZvIG1lc3NhZ2UsIGRpc21pc3NhYmxlOiB0cnVlXG4gICAgZ2l0LmNtZChhcmdzLCBjd2Q6IEByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSwge2NvbG9yOiB0cnVlfSlcbiAgICAudGhlbiAoZGF0YSkgLT5cbiAgICAgIGlmIGRhdGEgaXNudCAnJ1xuICAgICAgICB2aWV3LnNldENvbnRlbnQoZGF0YSkuZmluaXNoKClcbiAgICAgIHN0YXJ0TWVzc2FnZS5kaXNtaXNzKClcbiAgICAuY2F0Y2ggKGRhdGEpID0+XG4gICAgICBpZiBkYXRhIGlzbnQgJydcbiAgICAgICAgdmlldy5zZXRDb250ZW50KGRhdGEpLmZpbmlzaCgpXG4gICAgICBzdGFydE1lc3NhZ2UuZGlzbWlzcygpXG5cbiAgcHVzaEFuZFNldFVwc3RyZWFtOiAocmVtb3RlPScnKSAtPlxuICAgIHZpZXcgPSBPdXRwdXRWaWV3TWFuYWdlci5jcmVhdGUoKVxuICAgIGFyZ3MgPSBbJ3B1c2gnLCAnLXUnLCByZW1vdGUsICdIRUFEJ10uZmlsdGVyKChhcmcpIC0+IGFyZyBpc250ICcnKVxuICAgIG1lc3NhZ2UgPSBcIlB1c2hpbmcuLi5cIlxuICAgIHN0YXJ0TWVzc2FnZSA9IG5vdGlmaWVyLmFkZEluZm8gbWVzc2FnZSwgZGlzbWlzc2FibGU6IHRydWVcbiAgICBnaXQuY21kKGFyZ3MsIGN3ZDogQHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpLCB7Y29sb3I6IHRydWV9KVxuICAgIC50aGVuIChkYXRhKSAtPlxuICAgICAgaWYgZGF0YSBpc250ICcnXG4gICAgICAgIHZpZXcuc2V0Q29udGVudChkYXRhKS5maW5pc2goKVxuICAgICAgc3RhcnRNZXNzYWdlLmRpc21pc3MoKVxuICAgIC5jYXRjaCAoZGF0YSkgPT5cbiAgICAgIGlmIGRhdGEgaXNudCAnJ1xuICAgICAgICB2aWV3LnNldENvbnRlbnQoZGF0YSkuZmluaXNoKClcbiAgICAgIHN0YXJ0TWVzc2FnZS5kaXNtaXNzKClcbiJdfQ==
