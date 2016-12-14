(function() {
  var Dialog, RebaseDialog, git,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Dialog = require('./dialog');

  git = require('../git');

  module.exports = RebaseDialog = (function(_super) {
    __extends(RebaseDialog, _super);

    function RebaseDialog() {
      return RebaseDialog.__super__.constructor.apply(this, arguments);
    }

    RebaseDialog.content = function() {
      return this.div({
        "class": 'dialog'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'heading'
          }, function() {
            _this.i({
              "class": 'icon x clickable',
              click: 'cancel'
            });
            return _this.strong('Rebase');
          });
          _this.div({
            "class": 'body'
          }, function() {
            _this.label('Current Branch');
            _this.input({
              "class": 'native-key-bindings',
              type: 'text',
              readonly: true,
              outlet: 'toBranch'
            });
            _this.label('Rebase On Branch');
            return _this.select({
              "class": 'native-key-bindings',
              outlet: 'fromBranch'
            });
          });
          return _this.div({
            "class": 'buttons'
          }, function() {
            _this.button({
              "class": 'active',
              click: 'rebase'
            }, function() {
              _this.i({
                "class": 'icon circuit-board'
              });
              return _this.span('Rebase');
            });
            return _this.button({
              click: 'cancel'
            }, function() {
              _this.i({
                "class": 'icon x'
              });
              return _this.span('Cancel');
            });
          });
        };
      })(this));
    };

    RebaseDialog.prototype.activate = function(branches) {
      var branch, current, _i, _len;
      current = git.getLocalBranch();
      this.toBranch.val(current);
      this.fromBranch.find('option').remove();
      for (_i = 0, _len = branches.length; _i < _len; _i++) {
        branch = branches[_i];
        if (branch !== current) {
          this.fromBranch.append("<option value='" + branch + "'>" + branch + "</option>");
        }
      }
      return RebaseDialog.__super__.activate.call(this);
    };

    RebaseDialog.prototype.rebase = function() {
      this.deactivate();
      this.parentView.rebase(this.fromBranch.val());
    };

    return RebaseDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtY29udHJvbC9saWIvZGlhbG9ncy9yZWJhc2UtZGlhbG9nLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx5QkFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSLENBQVQsQ0FBQTs7QUFBQSxFQUVBLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUixDQUZOLENBQUE7O0FBQUEsRUFJQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osbUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsWUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxPQUFBLEVBQU8sUUFBUDtPQUFMLEVBQXNCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDcEIsVUFBQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsWUFBQSxPQUFBLEVBQU8sU0FBUDtXQUFMLEVBQXVCLFNBQUEsR0FBQTtBQUNyQixZQUFBLEtBQUMsQ0FBQSxDQUFELENBQUc7QUFBQSxjQUFBLE9BQUEsRUFBTyxrQkFBUDtBQUFBLGNBQTJCLEtBQUEsRUFBTyxRQUFsQzthQUFILENBQUEsQ0FBQTttQkFDQSxLQUFDLENBQUEsTUFBRCxDQUFRLFFBQVIsRUFGcUI7VUFBQSxDQUF2QixDQUFBLENBQUE7QUFBQSxVQUdBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxZQUFBLE9BQUEsRUFBTyxNQUFQO1dBQUwsRUFBb0IsU0FBQSxHQUFBO0FBQ2xCLFlBQUEsS0FBQyxDQUFBLEtBQUQsQ0FBTyxnQkFBUCxDQUFBLENBQUE7QUFBQSxZQUNBLEtBQUMsQ0FBQSxLQUFELENBQU87QUFBQSxjQUFBLE9BQUEsRUFBTyxxQkFBUDtBQUFBLGNBQThCLElBQUEsRUFBTSxNQUFwQztBQUFBLGNBQTRDLFFBQUEsRUFBVSxJQUF0RDtBQUFBLGNBQTRELE1BQUEsRUFBUSxVQUFwRTthQUFQLENBREEsQ0FBQTtBQUFBLFlBRUEsS0FBQyxDQUFBLEtBQUQsQ0FBTyxrQkFBUCxDQUZBLENBQUE7bUJBR0EsS0FBQyxDQUFBLE1BQUQsQ0FBUTtBQUFBLGNBQUEsT0FBQSxFQUFPLHFCQUFQO0FBQUEsY0FBOEIsTUFBQSxFQUFRLFlBQXRDO2FBQVIsRUFKa0I7VUFBQSxDQUFwQixDQUhBLENBQUE7aUJBU0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsT0FBQSxFQUFPLFNBQVA7V0FBTCxFQUF1QixTQUFBLEdBQUE7QUFDckIsWUFBQSxLQUFDLENBQUEsTUFBRCxDQUFRO0FBQUEsY0FBQSxPQUFBLEVBQU8sUUFBUDtBQUFBLGNBQWlCLEtBQUEsRUFBTyxRQUF4QjthQUFSLEVBQTBDLFNBQUEsR0FBQTtBQUN4QyxjQUFBLEtBQUMsQ0FBQSxDQUFELENBQUc7QUFBQSxnQkFBQSxPQUFBLEVBQU8sb0JBQVA7ZUFBSCxDQUFBLENBQUE7cUJBQ0EsS0FBQyxDQUFBLElBQUQsQ0FBTSxRQUFOLEVBRndDO1lBQUEsQ0FBMUMsQ0FBQSxDQUFBO21CQUdBLEtBQUMsQ0FBQSxNQUFELENBQVE7QUFBQSxjQUFBLEtBQUEsRUFBTyxRQUFQO2FBQVIsRUFBeUIsU0FBQSxHQUFBO0FBQ3ZCLGNBQUEsS0FBQyxDQUFBLENBQUQsQ0FBRztBQUFBLGdCQUFBLE9BQUEsRUFBTyxRQUFQO2VBQUgsQ0FBQSxDQUFBO3FCQUNBLEtBQUMsQ0FBQSxJQUFELENBQU0sUUFBTixFQUZ1QjtZQUFBLENBQXpCLEVBSnFCO1VBQUEsQ0FBdkIsRUFWb0I7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0QixFQURRO0lBQUEsQ0FBVixDQUFBOztBQUFBLDJCQW1CQSxRQUFBLEdBQVUsU0FBQyxRQUFELEdBQUE7QUFDUixVQUFBLHlCQUFBO0FBQUEsTUFBQSxPQUFBLEdBQVUsR0FBRyxDQUFDLGNBQUosQ0FBQSxDQUFWLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLE9BQWQsQ0FGQSxDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsVUFBVSxDQUFDLElBQVosQ0FBaUIsUUFBakIsQ0FBMEIsQ0FBQyxNQUEzQixDQUFBLENBSEEsQ0FBQTtBQUtBLFdBQUEsK0NBQUE7OEJBQUE7WUFBNEIsTUFBQSxLQUFZO0FBQ3RDLFVBQUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxNQUFaLENBQW9CLGlCQUFBLEdBQWlCLE1BQWpCLEdBQXdCLElBQXhCLEdBQTRCLE1BQTVCLEdBQW1DLFdBQXZELENBQUE7U0FERjtBQUFBLE9BTEE7QUFRQSxhQUFPLHlDQUFBLENBQVAsQ0FUUTtJQUFBLENBbkJWLENBQUE7O0FBQUEsMkJBOEJBLE1BQUEsR0FBUSxTQUFBLEdBQUE7QUFDTixNQUFBLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsVUFBVSxDQUFDLE1BQVosQ0FBbUIsSUFBQyxDQUFBLFVBQVUsQ0FBQyxHQUFaLENBQUEsQ0FBbkIsQ0FEQSxDQURNO0lBQUEsQ0E5QlIsQ0FBQTs7d0JBQUE7O0tBRHlCLE9BTDNCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/takaaki/.atom/packages/git-control/lib/dialogs/rebase-dialog.coffee
