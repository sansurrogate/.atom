(function() {
  var BranchItem, BranchView, View, git,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom-space-pen-views').View;

  git = require('../git');

  BranchItem = (function(_super) {
    __extends(BranchItem, _super);

    function BranchItem() {
      return BranchItem.__super__.constructor.apply(this, arguments);
    }

    BranchItem.content = function(branch) {
      var bklass, cklass, dclass;
      bklass = branch.current ? 'active' : '';
      cklass = branch.count.total ? '' : 'invisible';
      dclass = branch.current || !branch.local ? 'invisible' : '';
      return this.div({
        "class": "branch " + bklass,
        'data-name': branch.name
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'info'
          }, function() {
            _this.i({
              "class": 'icon chevron-right'
            });
            return _this.span({
              "class": 'clickable',
              click: 'checkout'
            }, branch.name);
          });
          _this.div({
            "class": "right-info " + dclass
          }, function() {
            return _this.i({
              "class": 'icon trash clickable',
              click: 'deleteThis'
            });
          });
          return _this.div({
            "class": "right-info count " + cklass
          }, function() {
            _this.span(branch.count.ahead);
            _this.i({
              "class": 'icon cloud-upload'
            });
            _this.span(branch.count.behind);
            return _this.i({
              "class": 'icon cloud-download'
            });
          });
        };
      })(this));
    };

    BranchItem.prototype.initialize = function(branch) {
      return this.branch = branch;
    };

    BranchItem.prototype.checkout = function() {
      return this.branch.checkout(this.branch.name);
    };

    BranchItem.prototype.deleteThis = function() {
      return this.branch["delete"](this.branch.name);
    };

    return BranchItem;

  })(View);

  module.exports = BranchView = (function(_super) {
    __extends(BranchView, _super);

    function BranchView() {
      return BranchView.__super__.constructor.apply(this, arguments);
    }

    BranchView.content = function(params) {
      return this.div({
        "class": 'branches'
      }, (function(_this) {
        return function() {
          return _this.div({
            click: 'toggleBranch',
            "class": 'heading clickable'
          }, function() {
            _this.i({
              "class": 'icon branch'
            });
            return _this.span(params.name);
          });
        };
      })(this));
    };

    BranchView.prototype.initialize = function(params) {
      this.params = params;
      this.branches = [];
      return this.hidden = false;
    };

    BranchView.prototype.toggleBranch = function() {
      if (this.hidden) {
        this.addAll(this.branches);
      } else {
        this.clearAll();
      }
      return this.hidden = !this.hidden;
    };

    BranchView.prototype.clearAll = function() {
      this.find('>.branch').remove();
    };

    BranchView.prototype.addAll = function(branches) {
      var checkout, remove;
      this.branches = branches;
      this.selectedBranch = git["get" + (this.params.local ? 'Local' : 'Remote') + "Branch"]();
      this.clearAll();
      remove = (function(_this) {
        return function(name) {
          return _this.deleteBranch(name);
        };
      })(this);
      checkout = (function(_this) {
        return function(name) {
          return _this.checkoutBranch(name);
        };
      })(this);
      branches.forEach((function(_this) {
        return function(branch) {
          var count, current;
          current = _this.params.local && branch === _this.selectedBranch;
          count = {
            total: 0
          };
          if (current) {
            count = git.count(branch);
            count.total = count.ahead + count.behind;
            _this.parentView.branchCount(count);
          }
          _this.append(new BranchItem({
            name: branch,
            count: count,
            current: current,
            local: _this.params.local,
            "delete": remove,
            checkout: checkout
          }));
        };
      })(this));
    };

    BranchView.prototype.checkoutBranch = function(name) {
      this.parentView.checkoutBranch(name, !this.params.local);
    };

    BranchView.prototype.deleteBranch = function(name) {
      this.parentView.deleteBranch(name);
    };

    return BranchView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtY29udHJvbC9saWIvdmlld3MvYnJhbmNoLXZpZXcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxPQUFRLE9BQUEsQ0FBUSxzQkFBUixFQUFSLElBQUQsQ0FBQTs7QUFBQSxFQUVBLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUixDQUZOLENBQUE7O0FBQUEsRUFJTTtBQUNKLGlDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFVBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQyxNQUFELEdBQUE7QUFDUixVQUFBLHNCQUFBO0FBQUEsTUFBQSxNQUFBLEdBQVksTUFBTSxDQUFDLE9BQVYsR0FBdUIsUUFBdkIsR0FBcUMsRUFBOUMsQ0FBQTtBQUFBLE1BQ0EsTUFBQSxHQUFZLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBaEIsR0FBMkIsRUFBM0IsR0FBbUMsV0FENUMsQ0FBQTtBQUFBLE1BRUEsTUFBQSxHQUFZLE1BQU0sQ0FBQyxPQUFQLElBQWtCLENBQUEsTUFBTyxDQUFDLEtBQTdCLEdBQXdDLFdBQXhDLEdBQXlELEVBRmxFLENBQUE7YUFJQSxJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxPQUFBLEVBQVEsU0FBQSxHQUFTLE1BQWpCO0FBQUEsUUFBMkIsV0FBQSxFQUFhLE1BQU0sQ0FBQyxJQUEvQztPQUFMLEVBQTBELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDeEQsVUFBQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsWUFBQSxPQUFBLEVBQU8sTUFBUDtXQUFMLEVBQW9CLFNBQUEsR0FBQTtBQUNsQixZQUFBLEtBQUMsQ0FBQSxDQUFELENBQUc7QUFBQSxjQUFBLE9BQUEsRUFB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

//# sourceURL=/home/takaaki/.atom/packages/git-control/lib/views/branch-view.coffee
