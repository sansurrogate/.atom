(function() {
  var BranchListView, OutputViewManager, PullBranchListView, branchFilter, git, notifier,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  git = require('../git');

  OutputViewManager = require('../output-view-manager');

  notifier = require('../notifier');

  BranchListView = require('./branch-list-view');

  branchFilter = function(item) {
    return item !== '' && item.indexOf('origin/HEAD') < 0;
  };

  module.exports = PullBranchListView = (function(superClass) {
    extend(PullBranchListView, superClass);

    function PullBranchListView() {
      return PullBranchListView.__super__.constructor.apply(this, arguments);
    }

    PullBranchListView.prototype.initialize = function(repo, data1, remote, extraArgs) {
      this.repo = repo;
      this.data = data1;
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
      branches = items.filter(branchFilter).map(function(item) {
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

    PullBranchListView.prototype.confirmed = function(arg1) {
      var name;
      name = arg1.name;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvdmlld3MvcHVsbC1icmFuY2gtbGlzdC12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsa0ZBQUE7SUFBQTs7O0VBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUNOLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSx3QkFBUjs7RUFDcEIsUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSOztFQUNYLGNBQUEsR0FBaUIsT0FBQSxDQUFRLG9CQUFSOztFQUVqQixZQUFBLEdBQWUsU0FBQyxJQUFEO1dBQVUsSUFBQSxLQUFVLEVBQVYsSUFBaUIsSUFBSSxDQUFDLE9BQUwsQ0FBYSxhQUFiLENBQUEsR0FBOEI7RUFBekQ7O0VBRWYsTUFBTSxDQUFDLE9BQVAsR0FHUTs7Ozs7OztpQ0FDSixVQUFBLEdBQVksU0FBQyxJQUFELEVBQVEsS0FBUixFQUFlLE1BQWYsRUFBd0IsU0FBeEI7TUFBQyxJQUFDLENBQUEsT0FBRDtNQUFPLElBQUMsQ0FBQSxPQUFEO01BQU8sSUFBQyxDQUFBLFNBQUQ7TUFBUyxJQUFDLENBQUEsWUFBRDtNQUNsQyxvREFBQSxTQUFBO2FBQ0EsSUFBQyxDQUFBLE1BQUQsR0FBYyxJQUFBLE9BQUEsQ0FBUSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsT0FBRCxFQUFVLE1BQVY7VUFDcEIsS0FBQyxDQUFBLE9BQUQsR0FBVztpQkFDWCxLQUFDLENBQUEsTUFBRCxHQUFVO1FBRlU7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVI7SUFGSjs7aUNBTVosU0FBQSxHQUFXLFNBQUE7QUFDVCxVQUFBO01BQUEsSUFBQyxDQUFBLG1CQUFELEdBQXVCO01BQ3ZCLGFBQUEsR0FDRTtRQUFBLElBQUEsRUFBTSxJQUFDLENBQUEsbUJBQVA7O01BQ0YsS0FBQSxHQUFRLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixDQUFZLElBQVo7TUFDUixRQUFBLEdBQVcsS0FBSyxDQUFDLE1BQU4sQ0FBYSxZQUFiLENBQTBCLENBQUMsR0FBM0IsQ0FBK0IsU0FBQyxJQUFEO2VBQVU7VUFBQyxJQUFBLEVBQU0sSUFBSSxDQUFDLE9BQUwsQ0FBYSxLQUFiLEVBQW9CLEVBQXBCLENBQVA7O01BQVYsQ0FBL0I7TUFDWCxJQUFHLFFBQVEsQ0FBQyxNQUFULEtBQW1CLENBQXRCO1FBQ0UsSUFBQyxDQUFBLFNBQUQsQ0FBVyxRQUFTLENBQUEsQ0FBQSxDQUFwQixFQURGO09BQUEsTUFBQTtRQUdFLElBQUMsQ0FBQSxRQUFELENBQVUsQ0FBQyxhQUFELENBQWUsQ0FBQyxNQUFoQixDQUF1QixRQUF2QixDQUFWLEVBSEY7O2FBSUEsSUFBQyxDQUFBLGlCQUFELENBQUE7SUFWUzs7aUNBWVgsU0FBQSxHQUFXLFNBQUMsSUFBRDtBQUNULFVBQUE7TUFEVyxPQUFEO01BQ1YsSUFBRyxJQUFBLEtBQVEsSUFBQyxDQUFBLG1CQUFaO1FBQ0UsSUFBQyxDQUFBLElBQUQsQ0FBQSxFQURGO09BQUEsTUFBQTtRQUdFLElBQUMsQ0FBQSxJQUFELENBQU0sSUFBSSxDQUFDLFNBQUwsQ0FBZSxJQUFJLENBQUMsT0FBTCxDQUFhLEdBQWIsQ0FBQSxHQUFvQixDQUFuQyxDQUFOLEVBSEY7O2FBSUEsSUFBQyxDQUFBLE1BQUQsQ0FBQTtJQUxTOztpQ0FPWCxJQUFBLEdBQU0sU0FBQyxZQUFEO0FBQ0osVUFBQTs7UUFESyxlQUFhOztNQUNsQixJQUFBLEdBQU8saUJBQWlCLENBQUMsTUFBbEIsQ0FBQTtNQUNQLFlBQUEsR0FBZSxRQUFRLENBQUMsT0FBVCxDQUFpQixZQUFqQixFQUErQjtRQUFBLFdBQUEsRUFBYSxJQUFiO09BQS9CO01BQ2YsSUFBQSxHQUFPLENBQUMsTUFBRCxDQUFRLENBQUMsTUFBVCxDQUFnQixJQUFDLENBQUEsU0FBakIsRUFBNEIsSUFBQyxDQUFBLE1BQTdCLEVBQXFDLFlBQXJDLENBQWtELENBQUMsTUFBbkQsQ0FBMEQsU0FBQyxHQUFEO2VBQVMsR0FBQSxLQUFTO01BQWxCLENBQTFEO2FBQ1AsR0FBRyxDQUFDLEdBQUosQ0FBUSxJQUFSLEVBQWM7UUFBQSxHQUFBLEVBQUssSUFBQyxDQUFBLElBQUksQ0FBQyxtQkFBTixDQUFBLENBQUw7T0FBZCxFQUFnRDtRQUFDLEtBQUEsRUFBTyxJQUFSO09BQWhELENBQ0EsQ0FBQyxJQURELENBQ00sQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLElBQUQ7VUFDSixLQUFDLENBQUEsT0FBRCxDQUFBO1VBQ0EsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsSUFBaEIsQ0FBcUIsQ0FBQyxNQUF0QixDQUFBO2lCQUNBLFlBQVksQ0FBQyxPQUFiLENBQUE7UUFISTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FETixDQUtBLEVBQUMsS0FBRCxFQUxBLENBS08sQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEtBQUQ7VUFHTCxJQUFJLENBQUMsVUFBTCxDQUFnQixLQUFoQixDQUFzQixDQUFDLE1BQXZCLENBQUE7aUJBQ0EsWUFBWSxDQUFDLE9BQWIsQ0FBQTtRQUpLO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUxQO0lBSkk7Ozs7S0ExQnlCO0FBVm5DIiwic291cmNlc0NvbnRlbnQiOlsiZ2l0ID0gcmVxdWlyZSAnLi4vZ2l0J1xuT3V0cHV0Vmlld01hbmFnZXIgPSByZXF1aXJlICcuLi9vdXRwdXQtdmlldy1tYW5hZ2VyJ1xubm90aWZpZXIgPSByZXF1aXJlICcuLi9ub3RpZmllcidcbkJyYW5jaExpc3RWaWV3ID0gcmVxdWlyZSAnLi9icmFuY2gtbGlzdC12aWV3J1xuXG5icmFuY2hGaWx0ZXIgPSAoaXRlbSkgLT4gaXRlbSBpc250ICcnIGFuZCBpdGVtLmluZGV4T2YoJ29yaWdpbi9IRUFEJykgPCAwXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgIyBFeHRlbnNpb24gb2YgQnJhbmNoTGlzdFZpZXdcbiAgIyBUYWtlcyB0aGUgbmFtZSBvZiB0aGUgcmVtb3RlIHRvIHB1bGwgZnJvbVxuICBjbGFzcyBQdWxsQnJhbmNoTGlzdFZpZXcgZXh0ZW5kcyBCcmFuY2hMaXN0Vmlld1xuICAgIGluaXRpYWxpemU6IChAcmVwbywgQGRhdGEsIEByZW1vdGUsIEBleHRyYUFyZ3MpIC0+XG4gICAgICBzdXBlclxuICAgICAgQHJlc3VsdCA9IG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpID0+XG4gICAgICAgIEByZXNvbHZlID0gcmVzb2x2ZVxuICAgICAgICBAcmVqZWN0ID0gcmVqZWN0XG5cbiAgICBwYXJzZURhdGE6IC0+XG4gICAgICBAY3VycmVudEJyYW5jaFN0cmluZyA9ICc9PSBDdXJyZW50ID09J1xuICAgICAgY3VycmVudEJyYW5jaCA9XG4gICAgICAgIG5hbWU6IEBjdXJyZW50QnJhbmNoU3RyaW5nXG4gICAgICBpdGVtcyA9IEBkYXRhLnNwbGl0KFwiXFxuXCIpXG4gICAgICBicmFuY2hlcyA9IGl0ZW1zLmZpbHRlcihicmFuY2hGaWx0ZXIpLm1hcCAoaXRlbSkgLT4ge25hbWU6IGl0ZW0ucmVwbGFjZSgvXFxzL2csICcnKX1cbiAgICAgIGlmIGJyYW5jaGVzLmxlbmd0aCBpcyAxXG4gICAgICAgIEBjb25maXJtZWQgYnJhbmNoZXNbMF1cbiAgICAgIGVsc2VcbiAgICAgICAgQHNldEl0ZW1zIFtjdXJyZW50QnJhbmNoXS5jb25jYXQgYnJhbmNoZXNcbiAgICAgIEBmb2N1c0ZpbHRlckVkaXRvcigpXG5cbiAgICBjb25maXJtZWQ6ICh7bmFtZX0pIC0+XG4gICAgICBpZiBuYW1lIGlzIEBjdXJyZW50QnJhbmNoU3RyaW5nXG4gICAgICAgIEBwdWxsKClcbiAgICAgIGVsc2VcbiAgICAgICAgQHB1bGwgbmFtZS5zdWJzdHJpbmcobmFtZS5pbmRleE9mKCcvJykgKyAxKVxuICAgICAgQGNhbmNlbCgpXG5cbiAgICBwdWxsOiAocmVtb3RlQnJhbmNoPScnKSAtPlxuICAgICAgdmlldyA9IE91dHB1dFZpZXdNYW5hZ2VyLmNyZWF0ZSgpXG4gICAgICBzdGFydE1lc3NhZ2UgPSBub3RpZmllci5hZGRJbmZvIFwiUHVsbGluZy4uLlwiLCBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgYXJncyA9IFsncHVsbCddLmNvbmNhdChAZXh0cmFBcmdzLCBAcmVtb3RlLCByZW1vdGVCcmFuY2gpLmZpbHRlcigoYXJnKSAtPiBhcmcgaXNudCAnJylcbiAgICAgIGdpdC5jbWQoYXJncywgY3dkOiBAcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCksIHtjb2xvcjogdHJ1ZX0pXG4gICAgICAudGhlbiAoZGF0YSkgPT5cbiAgICAgICAgQHJlc29sdmUoKVxuICAgICAgICB2aWV3LnNldENvbnRlbnQoZGF0YSkuZmluaXNoKClcbiAgICAgICAgc3RhcnRNZXNzYWdlLmRpc21pc3MoKVxuICAgICAgLmNhdGNoIChlcnJvcikgPT5cbiAgICAgICAgIyMgU2hvdWxkIEByZXN1bHQgYmUgcmVqZWN0ZWQgZm9yIHRob3NlIGRlcGVuZGluZyBvbiB0aGlzIHZpZXc/XG4gICAgICAgICMgQHJlamVjdCgpXG4gICAgICAgIHZpZXcuc2V0Q29udGVudChlcnJvcikuZmluaXNoKClcbiAgICAgICAgc3RhcnRNZXNzYWdlLmRpc21pc3MoKVxuIl19
