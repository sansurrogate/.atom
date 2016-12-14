(function() {
  var Dialog, MergeDialog, git,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Dialog = require('./dialog');

  git = require('../git');

  module.exports = MergeDialog = (function(_super) {
    __extends(MergeDialog, _super);

    function MergeDialog() {
      return MergeDialog.__super__.constructor.apply(this, arguments);
    }

    MergeDialog.content = function() {
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
            return _this.strong('Merge');
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
            _this.label('Merge From Branch');
            _this.select({
              "class": 'native-key-bindings',
              outlet: 'fromBranch'
            });
            return _this.div(function() {
              _this.input({
                type: 'checkbox',
                "class": 'checkbox',
                outlet: 'noff'
              });
              return _this.label('No Fast-Forward');
            });
          });
          return _this.div({
            "class": 'buttons'
          }, function() {
            _this.button({
              "class": 'active',
              click: 'merge'
            }, function() {
              _this.i({
                "class": 'icon merge'
              });
              return _this.span('Merge');
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

    MergeDialog.prototype.activate = function(branches) {
      var branch, current, _i, _len;
      current = git.getLocalBranch();
      if (atom.config.get("git-control.noFastForward")) {
        this.noff.prop("checked", true);
      }
      this.toBranch.val(current);
      this.fromBranch.find('option').remove();
      for (_i = 0, _len = branches.length; _i < _len; _i++) {
        branch = branches[_i];
        if (branch !== current) {
          this.fromBranch.append("<option value='" + branch + "'>" + branch + "</option>");
        }
      }
      return MergeDialog.__super__.activate.call(this);
    };

    MergeDialog.prototype.merge = function() {
      this.deactivate();
      this.parentView.merge(this.fromBranch.val(), this.noFF());
    };

    MergeDialog.prototype.noFF = function() {
      return this.noff.is(':checked');
    };

    return MergeDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtY29udHJvbC9saWIvZGlhbG9ncy9tZXJnZS1kaWFsb2cuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHdCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVIsQ0FBVCxDQUFBOztBQUFBLEVBRUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSLENBRk4sQ0FBQTs7QUFBQSxFQUlBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixrQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxXQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTyxRQUFQO09BQUwsRUFBc0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUNwQixVQUFBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxZQUFBLE9BQUEsRUFBTyxTQUFQO1dBQUwsRUFBdUIsU0FBQSxHQUFBO0FBQ3JCLFlBQUEsS0FBQyxDQUFBLENBQUQsQ0FBRztBQUFBLGNBQUEsT0FBQSxFQUFPLGtCQUFQO0FBQUEsY0FBMkIsS0FBQSxFQUFPLFFBQWxDO2FBQUgsQ0FBQSxDQUFBO21CQUNBLEtBQUMsQ0FBQSxNQUFELENBQVEsT0FBUixFQUZxQjtVQUFBLENBQXZCLENBQUEsQ0FBQTtBQUFBLFVBR0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsT0FBQSxFQUFPLE1BQVA7V0FBTCxFQUFvQixTQUFBLEdBQUE7QUFDbEIsWUFBQSxLQUFDLENBQUEsS0FBRCxDQUFPLGdCQUFQLENBQUEsQ0FBQTtBQUFBLFlBQ0EsS0FBQyxDQUFBLEtBQUQsQ0FBTztBQUFBLGNBQUEsT0FBQSxFQUFPLHFCQUFQO0FBQUEsY0FBOEIsSUFBQSxFQUFNLE1BQXBDO0FBQUEsY0FBNEMsUUFBQSxFQUFVLElBQXREO0FBQUEsY0FBNEQsTUFBQSxFQUFRLFVBQXBFO2FBQVAsQ0FEQSxDQUFBO0FBQUEsWUFFQSxLQUFDLENBQUEsS0FBRCxDQUFPLG1CQUFQLENBRkEsQ0FBQTtBQUFBLFlBR0EsS0FBQyxDQUFBLE1BQUQsQ0FBUTtBQUFBLGNBQUEsT0FBQSxFQUFPLHFCQUFQO0FBQUEsY0FBOEIsTUFBQSxFQUFRLFlBQXRDO2FBQVIsQ0FIQSxDQUFBO21CQUlBLEtBQUMsQ0FBQSxHQUFELENBQUssU0FBQSxHQUFBO0FBQ0gsY0FBQSxLQUFDLENBQUEsS0FBRCxDQUFPO0FBQUEsZ0JBQUEsSUFBQSxFQUFNLFVBQU47QUFBQSxnQkFBaUIsT0FBQSxFQUFPLFVBQXhCO0FBQUEsZ0JBQW1DLE1BQUEsRUFBUSxNQUEzQztlQUFQLENBQUEsQ0FBQTtxQkFDQSxLQUFDLENBQUEsS0FBRCxDQUFPLGlCQUFQLEVBRkc7WUFBQSxDQUFMLEVBTGtCO1VBQUEsQ0FBcEIsQ0FIQSxDQUFBO2lCQVdBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxZQUFBLE9BQUEsRUFBTyxTQUFQO1dBQUwsRUFBdUIsU0FBQSxHQUFBO0FBQ3JCLFlBQUEsS0FBQyxDQUFBLE1BQUQsQ0FBUTtBQUFBLGNBQUEsT0FBQSxFQUFPLFFBQVA7QUFBQSxjQUFpQixLQUFBLEVBQU8sT0FBeEI7YUFBUixFQUF5QyxTQUFBLEdBQUE7QUFDdkMsY0FBQSxLQUFDLENBQUEsQ0FBRCxDQUFHO0FBQUEsZ0JBQUEsT0FBQSxFQUFPLFlBQVA7ZUFBSCxDQUFBLENBQUE7cUJBQ0EsS0FBQyxDQUFBLElBQUQsQ0FBTSxPQUFOLEVBRnVDO1lBQUEsQ0FBekMsQ0FBQSxDQUFBO21CQUdBLEtBQUMsQ0FBQSxNQUFELENBQVE7QUFBQSxjQUFBLEtBQUEsRUFBTyxRQUFQO2FBQVIsRUFBeUIsU0FBQSxHQUFBO0FBQ3ZCLGNBQUEsS0FBQyxDQUFBLENBQUQsQ0FBRztBQUFBLGdCQUFBLE9BQUEsRUFBTyxRQUFQO2VBQUgsQ0FBQSxDQUFBO3FCQUNBLEtBQUMsQ0FBQSxJQUFELENBQU0sUUFBTixFQUZ1QjtZQUFBLENBQXpCLEVBSnFCO1VBQUEsQ0FBdkIsRUFab0I7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0QixFQURRO0lBQUEsQ0FBVixDQUFBOztBQUFBLDBCQXFCQSxRQUFBLEdBQVUsU0FBQyxRQUFELEdBQUE7QUFDUixVQUFBLHlCQUFBO0FBQUEsTUFBQSxPQUFBLEdBQVUsR0FBRyxDQUFDLGNBQUosQ0FBQSxDQUFWLENBQUE7QUFFQSxNQUFBLElBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDJCQUFoQixDQUFIO0FBQ0UsUUFBQSxJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sQ0FBVyxTQUFYLEVBQXNCLElBQXRCLENBQUEsQ0FERjtPQUZBO0FBQUEsTUFLQSxJQUFDLENBQUEsUUFBUSxDQUFDLEdBQVYsQ0FBYyxPQUFkLENBTEEsQ0FBQTtBQUFBLE1BTUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxJQUFaLENBQWlCLFFBQWpCLENBQTBCLENBQUMsTUFBM0IsQ0FBQSxDQU5BLENBQUE7QUFRQSxXQUFBLCtDQUFBOzhCQUFBO1lBQTRCLE1BQUEsS0FBWTtBQUN0QyxVQUFBLElBQUMsQ0FBQSxVQUFVLENBQUMsTUFBWixDQUFvQixpQkFBQSxHQUFpQixNQUFqQixHQUF3QixJQUF4QixHQUE0QixNQUE1QixHQUFtQyxXQUF2RCxDQUFBO1NBREY7QUFBQSxPQVJBO0FBV0EsYUFBTyx3Q0FBQSxDQUFQLENBWlE7SUFBQSxDQXJCVixDQUFBOztBQUFBLDBCQW1DQSxLQUFBLEdBQU8sU0FBQSxHQUFBO0FBQ0wsTUFBQSxJQUFDLENBQUEsVUFBRCxDQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFVBQVUsQ0FBQyxLQUFaLENBQWtCLElBQUMsQ0FBQSxVQUFVLENBQUMsR0FBWixDQUFBLENBQWxCLEVBQW9DLElBQUMsQ0FBQSxJQUFELENBQUEsQ0FBcEMsQ0FEQSxDQURLO0lBQUEsQ0FuQ1AsQ0FBQTs7QUFBQSwwQkF3Q0EsSUFBQSxHQUFNLFNBQUEsR0FBQTtBQUNILGFBQU8sSUFBQyxDQUFBLElBQUksQ0FBQyxFQUFOLENBQVMsVUFBVCxDQUFQLENBREc7SUFBQSxDQXhDTixDQUFBOzt1QkFBQTs7S0FEd0IsT0FMMUIsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/takaaki/.atom/packages/git-control/lib/dialogs/merge-dialog.coffee
