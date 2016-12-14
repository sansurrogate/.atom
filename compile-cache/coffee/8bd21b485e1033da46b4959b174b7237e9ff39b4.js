(function() {
  var Dialog, PushDialog, git,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Dialog = require('./dialog');

  git = require('../git');

  module.exports = PushDialog = (function(_super) {
    __extends(PushDialog, _super);

    function PushDialog() {
      return PushDialog.__super__.constructor.apply(this, arguments);
    }

    PushDialog.content = function() {
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
            return _this.strong('Push');
          });
          _this.div({
            "class": 'body'
          }, function() {
            _this.div(function() {
              return _this.button({
                click: 'upstream'
              }, function() {
                return _this.p('Push upstream', function() {
                  return _this.i({
                    "class": 'icon push'
                  });
                });
              });
            });
            _this.label('Push from branch');
            _this.input({
              "class": 'native-key-bindings',
              readonly: true,
              outlet: 'fromBranch'
            });
            _this.label('To branch');
            _this.select({
              "class": 'native-key-bindings',
              outlet: 'toBranch'
            });
            return _this.div(function() {
              _this.label('Force Push');
              return _this.input({
                type: 'checkbox',
                "class": 'checkbox',
                outlet: 'force'
              });
            });
          });
          return _this.div({
            "class": 'buttons'
          }, function() {
            _this.button({
              "class": 'active',
              click: 'push'
            }, function() {
              _this.i({
                "class": 'icon push'
              });
              return _this.span('Push');
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

    PushDialog.prototype.activate = function(remotes) {
      var remote, _i, _len;
      this.fromBranch.val(git.getLocalBranch());
      this.toBranch.find('option').remove();
      this.toBranch.append("<option value='origin'>origin</option>");
      for (_i = 0, _len = remotes.length; _i < _len; _i++) {
        remote = remotes[_i];
        this.toBranch.append("<option value='" + remote + "'>" + remote + "</option>");
      }
      return PushDialog.__super__.activate.call(this);
    };

    PushDialog.prototype.push = function() {
      var branch, remote;
      this.deactivate();
      remote = this.toBranch.val().split('/')[0];
      branch = git.getLocalBranch();
      this.parentView.push(remote, branch, this.Force());
    };

    PushDialog.prototype.upstream = function() {
      this.deactivate();
      return this.parentView.push('', '');
    };

    PushDialog.prototype.Force = function() {
      return this.force.is(':checked');
    };

    return PushDialog;

  })(Dialog);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtY29udHJvbC9saWIvZGlhbG9ncy9wdXNoLWRpYWxvZy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsdUJBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFBLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUixDQUFULENBQUE7O0FBQUEsRUFDQSxHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVIsQ0FETixDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLGlDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFVBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsT0FBQSxFQUFPLFFBQVA7T0FBTCxFQUFzQixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQ3BCLFVBQUEsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsT0FBQSxFQUFPLFNBQVA7V0FBTCxFQUF1QixTQUFBLEdBQUE7QUFDckIsWUFBQSxLQUFDLENBQUEsQ0FBRCxDQUFHO0FBQUEsY0FBQSxPQUFBLEVBQU8sa0JBQVA7QUFBQSxjQUEwQixLQUFBLEVBQU8sUUFBakM7YUFBSCxDQUFBLENBQUE7bUJBQ0EsS0FBQyxDQUFBLE1BQUQsQ0FBUSxNQUFSLEVBRnFCO1VBQUEsQ0FBdkIsQ0FBQSxDQUFBO0FBQUEsVUFHQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsWUFBQSxPQUFBLEVBQU8sTUFBUDtXQUFMLEVBQW9CLFNBQUEsR0FBQTtBQUNsQixZQUFBLEtBQUMsQ0FBQSxHQUFELENBQUssU0FBQSxHQUFBO3FCQUNILEtBQUMsQ0FBQSxNQUFELENBQVE7QUFBQSxnQkFBQSxLQUFBLEVBQU8sVUFBUDtl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

//# sourceURL=/home/takaaki/.atom/packages/git-control/lib/dialogs/push-dialog.coffee
