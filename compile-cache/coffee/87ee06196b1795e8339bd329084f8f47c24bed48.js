(function() {
  var BranchListView, DeleteBranchListView, git, notifier,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  git = require('../git');

  notifier = require('../notifier');

  BranchListView = require('./branch-list-view');

  module.exports = DeleteBranchListView = (function(superClass) {
    extend(DeleteBranchListView, superClass);

    function DeleteBranchListView() {
      return DeleteBranchListView.__super__.constructor.apply(this, arguments);
    }

    DeleteBranchListView.prototype.initialize = function(repo, data, arg) {
      this.repo = repo;
      this.data = data;
      this.isRemote = (arg != null ? arg : {}).isRemote;
      return DeleteBranchListView.__super__.initialize.apply(this, arguments);
    };

    DeleteBranchListView.prototype.confirmed = function(arg) {
      var branch, name, remote;
      name = arg.name;
      if (name.startsWith("*")) {
        name = name.slice(1);
      }
      if (!this.isRemote) {
        this["delete"](name);
      } else {
        branch = name.substring(name.indexOf('/') + 1);
        remote = name.substring(0, name.indexOf('/'));
        this["delete"](branch, remote);
      }
      return this.cancel();
    };

    DeleteBranchListView.prototype["delete"] = function(branch, remote) {
      var args, notification;
      notification = notifier.addInfo("Deleting remote branch " + branch, {
        dismissable: true
      });
      args = remote ? ['push', remote, '--delete'] : ['branch', '-D'];
      return git.cmd(args.concat(branch), {
        cwd: this.repo.getWorkingDirectory()
      }).then(function(message) {
        notification.dismiss();
        return notifier.addSuccess(message);
      })["catch"](function(error) {
        notification.dismiss();
        return notifier.addError(error);
      });
    };

    return DeleteBranchListView;

  })(BranchListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvdmlld3MvZGVsZXRlLWJyYW5jaC12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsbURBQUE7SUFBQTs7O0VBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUNOLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUjs7RUFDWCxjQUFBLEdBQWlCLE9BQUEsQ0FBUSxvQkFBUjs7RUFFakIsTUFBTSxDQUFDLE9BQVAsR0FDUTs7Ozs7OzttQ0FDSixVQUFBLEdBQVksU0FBQyxJQUFELEVBQVEsSUFBUixFQUFlLEdBQWY7TUFBQyxJQUFDLENBQUEsT0FBRDtNQUFPLElBQUMsQ0FBQSxPQUFEO01BQVEsSUFBQyxDQUFBLDBCQUFGLE1BQVksSUFBVjthQUFpQixzREFBQSxTQUFBO0lBQWxDOzttQ0FFWixTQUFBLEdBQVcsU0FBQyxHQUFEO0FBQ1QsVUFBQTtNQURXLE9BQUQ7TUFDVixJQUF3QixJQUFJLENBQUMsVUFBTCxDQUFnQixHQUFoQixDQUF4QjtRQUFBLElBQUEsR0FBTyxJQUFJLENBQUMsS0FBTCxDQUFXLENBQVgsRUFBUDs7TUFDQSxJQUFBLENBQU8sSUFBQyxDQUFBLFFBQVI7UUFDRSxJQUFDLEVBQUEsTUFBQSxFQUFELENBQVEsSUFBUixFQURGO09BQUEsTUFBQTtRQUdFLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBTCxDQUFlLElBQUksQ0FBQyxPQUFMLENBQWEsR0FBYixDQUFBLEdBQW9CLENBQW5DO1FBQ1QsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFMLENBQWUsQ0FBZixFQUFrQixJQUFJLENBQUMsT0FBTCxDQUFhLEdBQWIsQ0FBbEI7UUFDVCxJQUFDLEVBQUEsTUFBQSxFQUFELENBQVEsTUFBUixFQUFnQixNQUFoQixFQUxGOzthQU1BLElBQUMsQ0FBQSxNQUFELENBQUE7SUFSUzs7b0NBVVgsUUFBQSxHQUFRLFNBQUMsTUFBRCxFQUFTLE1BQVQ7QUFDTixVQUFBO01BQUEsWUFBQSxHQUFlLFFBQVEsQ0FBQyxPQUFULENBQWlCLHlCQUFBLEdBQTBCLE1BQTNDLEVBQXFEO1FBQUEsV0FBQSxFQUFhLElBQWI7T0FBckQ7TUFDZixJQUFBLEdBQVUsTUFBSCxHQUFlLENBQUMsTUFBRCxFQUFTLE1BQVQsRUFBaUIsVUFBakIsQ0FBZixHQUFpRCxDQUFDLFFBQUQsRUFBVyxJQUFYO2FBQ3hELEdBQUcsQ0FBQyxHQUFKLENBQVEsSUFBSSxDQUFDLE1BQUwsQ0FBWSxNQUFaLENBQVIsRUFBNkI7UUFBQSxHQUFBLEVBQUssSUFBQyxDQUFBLElBQUksQ0FBQyxtQkFBTixDQUFBLENBQUw7T0FBN0IsQ0FDQSxDQUFDLElBREQsQ0FDTSxTQUFDLE9BQUQ7UUFDSixZQUFZLENBQUMsT0FBYixDQUFBO2VBQ0EsUUFBUSxDQUFDLFVBQVQsQ0FBb0IsT0FBcEI7TUFGSSxDQUROLENBSUEsRUFBQyxLQUFELEVBSkEsQ0FJTyxTQUFDLEtBQUQ7UUFDTCxZQUFZLENBQUMsT0FBYixDQUFBO2VBQ0EsUUFBUSxDQUFDLFFBQVQsQ0FBa0IsS0FBbEI7TUFGSyxDQUpQO0lBSE07Ozs7S0FieUI7QUFMckMiLCJzb3VyY2VzQ29udGVudCI6WyJnaXQgPSByZXF1aXJlICcuLi9naXQnXG5ub3RpZmllciA9IHJlcXVpcmUgJy4uL25vdGlmaWVyJ1xuQnJhbmNoTGlzdFZpZXcgPSByZXF1aXJlICcuL2JyYW5jaC1saXN0LXZpZXcnXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgY2xhc3MgRGVsZXRlQnJhbmNoTGlzdFZpZXcgZXh0ZW5kcyBCcmFuY2hMaXN0Vmlld1xuICAgIGluaXRpYWxpemU6IChAcmVwbywgQGRhdGEsIHtAaXNSZW1vdGV9PXt9KSAtPiBzdXBlclxuXG4gICAgY29uZmlybWVkOiAoe25hbWV9KSAtPlxuICAgICAgbmFtZSA9IG5hbWUuc2xpY2UoMSkgaWYgbmFtZS5zdGFydHNXaXRoIFwiKlwiXG4gICAgICB1bmxlc3MgQGlzUmVtb3RlXG4gICAgICAgIEBkZWxldGUgbmFtZVxuICAgICAgZWxzZVxuICAgICAgICBicmFuY2ggPSBuYW1lLnN1YnN0cmluZyhuYW1lLmluZGV4T2YoJy8nKSArIDEpXG4gICAgICAgIHJlbW90ZSA9IG5hbWUuc3Vic3RyaW5nKDAsIG5hbWUuaW5kZXhPZignLycpKVxuICAgICAgICBAZGVsZXRlIGJyYW5jaCwgcmVtb3RlXG4gICAgICBAY2FuY2VsKClcblxuICAgIGRlbGV0ZTogKGJyYW5jaCwgcmVtb3RlKSAtPlxuICAgICAgbm90aWZpY2F0aW9uID0gbm90aWZpZXIuYWRkSW5mbyBcIkRlbGV0aW5nIHJlbW90ZSBicmFuY2ggI3ticmFuY2h9XCIsIGRpc21pc3NhYmxlOiB0cnVlXG4gICAgICBhcmdzID0gaWYgcmVtb3RlIHRoZW4gWydwdXNoJywgcmVtb3RlLCAnLS1kZWxldGUnXSBlbHNlIFsnYnJhbmNoJywgJy1EJ11cbiAgICAgIGdpdC5jbWQoYXJncy5jb25jYXQoYnJhbmNoKSwgY3dkOiBAcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCkpXG4gICAgICAudGhlbiAobWVzc2FnZSkgLT5cbiAgICAgICAgbm90aWZpY2F0aW9uLmRpc21pc3MoKVxuICAgICAgICBub3RpZmllci5hZGRTdWNjZXNzIG1lc3NhZ2VcbiAgICAgIC5jYXRjaCAoZXJyb3IpIC0+XG4gICAgICAgIG5vdGlmaWNhdGlvbi5kaXNtaXNzKClcbiAgICAgICAgbm90aWZpZXIuYWRkRXJyb3IgZXJyb3JcbiJdfQ==
