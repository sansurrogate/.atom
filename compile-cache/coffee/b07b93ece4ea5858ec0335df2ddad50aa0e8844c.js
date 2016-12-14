(function() {
  var CreateTagDialog, Dialog,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Dialog = require('./dialog');

  module.exports = CreateTagDialog = (function(_super) {
    __extends(CreateTagDialog, _super);

    function CreateTagDialog() {
      return CreateTagDialog.__super__.constructor.apply(this, arguments);
    }

    CreateTagDialog.content = function() {
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
            return _this.strong('Tag');
          });
          _this.div({
            "class": 'body'
          }, function() {
            _this.label('Tag name');
            _this.input({
              "class": 'native-key-bindings',
              type: 'text',
              outlet: 'name'
            });
            _this.label('commit ref');
            _this.input({
              "class": 'native-key-bindings',
              type: 'text',
              outlet: 'href'
            });
            _this.label('Tag Message');
            return _this.textarea({
              "class": 'native-key-bindings',
              outlet: 'msg'
            });
          });
          return _this.div({
            "class": 'buttons'
          }, function() {
            _this.button({
              "class": 'active',
              click: 'tag'
            }, function() {
              _this.i({
                "class": 'icon tag'
              });
              return _this.span('Create Tag');
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

    CreateTagDialog.prototype.tag = function() {
      this.deactivate();
      this.parentView.tag(this.Name(), this.Href(), this.Msg());
    };

    CreateTagDialog.prototype.Name = function() {
      return this.name.val();
    };

    CreateTagDialog.prototype.Href = function() {
      return this.href.val();
    };

    CreateTagDialog.prototype.Msg = function() {
      return this.msg.val();
    };

    return CreateTagDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtY29udHJvbC9saWIvZGlhbG9ncy9jcmVhdGUtdGFnLWRpYWxvZy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsdUJBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFBLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUixDQUFULENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osc0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsZUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxPQUFBLEVBQU8sUUFBUDtPQUFMLEVBQXNCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDcEIsVUFBQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsWUFBQSxPQUFBLEVBQU8sU0FBUDtXQUFMLEVBQXVCLFNBQUEsR0FBQTtBQUNyQixZQUFBLEtBQUMsQ0FBQSxDQUFELENBQUc7QUFBQSxjQUFBLE9BQUEsRUFBTyxrQkFBUDtBQUFBLGNBQTJCLEtBQUEsRUFBTyxRQUFsQzthQUFILENBQUEsQ0FBQTttQkFDQSxLQUFDLENBQUEsTUFBRCxDQUFRLEtBQVIsRUFGcUI7VUFBQSxDQUF2QixDQUFBLENBQUE7QUFBQSxVQUdBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxZQUFBLE9BQUEsRUFBTyxNQUFQO1dBQUwsRUFBb0IsU0FBQSxHQUFBO0FBQ2xCLFlBQUEsS0FBQyxDQUFBLEtBQUQsQ0FBTyxVQUFQLENBQUEsQ0FBQTtBQUFBLFlBQ0EsS0FBQyxDQUFBLEtBQUQsQ0FBTztBQUFBLGNBQUEsT0FBQSxFQUFPLHFCQUFQO0FBQUEsY0FBOEIsSUFBQSxFQUFNLE1BQXBDO0FBQUEs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

//# sourceURL=/home/takaaki/.atom/packages/git-control/lib/dialogs/create-tag-dialog.coffee
