(function() {
  var Dialog, MidrebaseDialog, git,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Dialog = require('./dialog');

  git = require('../git');

  module.exports = MidrebaseDialog = (function(_super) {
    __extends(MidrebaseDialog, _super);

    function MidrebaseDialog() {
      return MidrebaseDialog.__super__.constructor.apply(this, arguments);
    }

    MidrebaseDialog.content = function() {
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
            return _this.strong('It appears that you are in the middle of a rebase, would you like to:');
          });
          _this.div({
            "class": 'body'
          }, function() {
            _this.label('Continue the rebase');
            _this.input({
              type: 'checkbox',
              "class": 'checkbox',
              outlet: 'contin'
            });
            _this.div(function() {
              _this.label('Abort the rebase');
              return _this.input({
                type: 'checkbox',
                "class": 'checkbox',
                outlet: 'abort'
              });
            });
            return _this.div(function() {
              _this.label('Skip the patch');
              return _this.input({
                type: 'checkbox',
                "class": 'checkbox',
                outlet: 'skip'
              });
            });
          });
          return _this.div({
            "class": 'buttons'
          }, function() {
            _this.button({
              "class": 'active',
              click: 'midrebase'
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

    MidrebaseDialog.prototype.midrebase = function() {
      this.deactivate();
      this.parentView.midrebase(this.Contin(), this.Abort(), this.Skip());
    };

    MidrebaseDialog.prototype.Contin = function() {
      return this.contin.is(':checked');
    };

    MidrebaseDialog.prototype.Abort = function() {
      return this.abort.is(':checked');
    };

    MidrebaseDialog.prototype.Skip = function() {
      return this.skip.is(':checked');
    };

    return MidrebaseDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtY29udHJvbC9saWIvZGlhbG9ncy9taWRyZWJhc2UtZGlhbG9nLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw0QkFBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSLENBQVQsQ0FBQTs7QUFBQSxFQUVBLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUixDQUZOLENBQUE7O0FBQUEsRUFJQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osc0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsZUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxPQUFBLEVBQU8sUUFBUDtPQUFMLEVBQXNCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDcEIsVUFBQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsWUFBQSxPQUFBLEVBQU8sU0FBUDtXQUFMLEVBQXVCLFNBQUEsR0FBQTtBQUNyQixZQUFBLEtBQUMsQ0FBQSxDQUFELENBQUc7QUFBQSxjQUFBLE9BQUEsRUFBTyxrQkFBUDtBQUFBLGNBQTJCLEtBQUEsRUFBTyxRQUFsQzthQUFILENBQUEsQ0FBQTttQkFDQSxLQUFDLENBQUEsTUFBRCxDQUFRLHVFQUFSLEVBRnFCO1VBQUEsQ0FBdkIsQ0FBQSxDQUFBO0FBQUEsVUFHQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsWUFBQSxPQUFBLEVBQU8sTUFBUDtXQUFMLEVBQW9CLFNBQUEsR0FBQTtBQUNsQixZQUFBLEtBQUMsQ0FBQSxLQUFELENBQU8scUJBQVAsQ0FBQSxDQUFBO0FBQUEsWUFDQSxLQUFDLENBQUEsS0FBRCxDQUFPO0FBQUEsY0FBQSxJ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

//# sourceURL=/home/takaaki/.atom/packages/git-control/lib/dialogs/midrebase-dialog.coffee
