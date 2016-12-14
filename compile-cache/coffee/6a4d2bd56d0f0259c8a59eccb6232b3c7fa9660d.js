(function() {
  var Dialog, PushTagsDialog, git,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Dialog = require('./dialog');

  git = require('../git');

  module.exports = PushTagsDialog = (function(_super) {
    __extends(PushTagsDialog, _super);

    function PushTagsDialog() {
      return PushTagsDialog.__super__.constructor.apply(this, arguments);
    }

    PushTagsDialog.content = function() {
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
            return _this.strong('Push Tags');
          });
          return _this.div({
            "class": 'body'
          }, function() {
            _this.button({
              "class": 'active',
              click: 'ptago'
            }, function() {
              _this.i({
                "class": 'icon versions'
              });
              return _this.span('Push tags to origin');
            });
            _this.button({
              "class": 'active',
              click: 'ptagup'
            }, function() {
              _this.i({
                "class": 'icon versions'
              });
              return _this.span('Push tags to upstream');
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

    PushTagsDialog.prototype.ptago = function() {
      var remote;
      this.deactivate();
      remote = 'origin';
      return this.parentView.ptag(remote);
    };

    PushTagsDialog.prototype.ptagup = function() {
      var remote;
      this.deactivate();
      remote = 'upstream';
      return this.parentView.ptag(remote);
    };

    return PushTagsDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtY29udHJvbC9saWIvZGlhbG9ncy9wdXNoLXRhZ3MtZGlhbG9nLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwyQkFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSLENBQVQsQ0FBQTs7QUFBQSxFQUNBLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUixDQUROLENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0oscUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsY0FBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxPQUFBLEVBQU8sUUFBUDtPQUFMLEVBQXNCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDcEIsVUFBQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsWUFBQSxPQUFBLEVBQU8sU0FBUDtXQUFMLEVBQXVCLFNBQUEsR0FBQTtBQUNyQixZQUFBLEtBQUMsQ0FBQSxDQUFELENBQUc7QUFBQSxjQUFBLE9BQUEsRUFBTyxrQkFBUDtBQUFBLGNBQTBCLEtBQUEsRUFBTyxRQUFqQzthQUFILENBQUEsQ0FBQTttQkFDQSxLQUFDLENBQUEsTUFBRCxDQUFRLFdBQVIsRUFGcUI7VUFBQSxDQUF2QixDQUFBLENBQUE7aUJBR0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsT0FBQSxFQUFPLE1BQVA7V0FBTCxFQUFvQixTQUFBLEdBQUE7QUFDbEIsWUFBQSxLQUFDLENBQUEsTUFBRCxDQUFRO0FBQUEsY0FBQSxPQUFBLEVBQU8sUUFBUDtBQUFBLGNBQWlCLEtBQUEsRUFBTyxPQUF4QjthQUFSLEVBQXdDLFNBQUEsR0FBQTtBQUN0QyxjQUFBLEtBQUMsQ0FBQSxDQUFELENBQUc7QUFBQSxnQkFBQSxPQUFBLEVBQU8sZUFBUDtlQUFILENBQUEsQ0FBQTtxQkFDQSxLQUFDLENBQUEsSUFBRCxDQUFNLHFCQUFOLEVBRnNDO1lBQUEsQ0FBeEMsQ0FBQSxDQUFBO0FBQUEsWUFHQSxLQUFDLENBQUEsTUFBRCxDQUFRO0FBQUEsY0FBQSxPQUFBLEVBQU8sUUFBUDtBQUFBLGNBQWlCLEtBQUEsRUFBTyxRQUF4QjthQUFSLEVBQXlDLFNBQUEsR0FBQTtBQUN2QyxjQUFBLEtBQUMsQ0FBQSxDQUFELENBQUc7QUFBQSxnQkFBQSxPQUFBLEVBQU8sZUFBUDtlQUFILENBQUEsQ0FBQTtxQkFDQSxLQUFDLENBQUEsSUFBRCxDQUFNLHVCQUFOLEVBRnVDO1lBQUEsQ0FBekMsQ0FIQSxDQUFBO21CQU1BLEtBQUMsQ0FBQSxNQUFELENBQVE7QUFBQSxjQUFBLEtBQUEsRUFBTyxRQUFQO2FBQVIsRUFBeUIsU0FBQSxHQUFBO0FBQ3ZCLGNBQUEsS0FBQyxDQUFBLENBQUQsQ0FBRztBQUFBLGdCQUFBLE9BQUEsRUFBTyxRQUFQO2VBQUgsQ0FBQSxDQUFBO3FCQUNBLEtBQUMsQ0FBQSxJQUFELENBQU0sUUFBTixFQUZ1QjtZQUFBLENBQXpCLEVBUGtCO1VBQUEsQ0FBcEIsRUFKb0I7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0QixFQURRO0lBQUEsQ0FBVixDQUFBOztBQUFBLDZCQWlCQSxLQUFBLEdBQU8sU0FBQSxHQUFBO0FBQ0wsVUFBQSxNQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsVUFBRCxDQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsTUFBQSxHQUFTLFFBRFQsQ0FBQTthQUVBLElBQUMsQ0FBQSxVQUFVLENBQUMsSUFBWixDQUFpQixNQUFqQixFQUhLO0lBQUEsQ0FqQlAsQ0FBQTs7QUFBQSw2QkFzQkEsTUFBQSxHQUFRLFNBQUEsR0FBQTtBQUNOLFVBQUEsTUFBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLFVBQUQsQ0FBQSxDQUFBLENBQUE7QUFBQSxNQUNBLE1BQUEsR0FBUyxVQURULENBQUE7YUFFQSxJQUFDLENBQUEsVUFBVSxDQUFDLElBQVosQ0FBaUIsTUFBakIsRUFITTtJQUFBLENBdEJSLENBQUE7OzBCQUFBOztLQUQyQixPQUo3QixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/takaaki/.atom/packages/git-control/lib/dialogs/push-tags-dialog.coffee
