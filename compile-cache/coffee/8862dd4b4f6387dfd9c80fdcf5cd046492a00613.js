(function() {
  var $$, ListView, SelectListView, fs, git, notifier, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  fs = require('fs-plus');

  _ref = require('atom-space-pen-views'), $$ = _ref.$$, SelectListView = _ref.SelectListView;

  git = require('../git');

  notifier = require('../notifier');

  module.exports = ListView = (function(_super) {
    __extends(ListView, _super);

    function ListView() {
      return ListView.__super__.constructor.apply(this, arguments);
    }

    ListView.prototype.args = ['checkout'];

    ListView.prototype.initialize = function(repo, data) {
      this.repo = repo;
      this.data = data;
      ListView.__super__.initialize.apply(this, arguments);
      this.addClass('git-branch');
      this.show();
      this.parseData();
      return this.currentPane = atom.workspace.getActivePane();
    };

    ListView.prototype.parseData = function() {
      var branches, item, items, _i, _len;
      items = this.data.split("\n");
      branches = [];
      for (_i = 0, _len = items.length; _i < _len; _i++) {
        item = items[_i];
        item = item.replace(/\s/g, '');
        if (item !== '') {
          branches.push({
            name: item
          });
        }
      }
      this.setItems(branches);
      return this.focusFilterEditor();
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
      var _ref1;
      return (_ref1 = this.panel) != null ? _ref1.destroy() : void 0;
    };

    ListView.prototype.viewForItem = function(_arg) {
      var current, name;
      name = _arg.name;
      current = false;
      if (name.startsWith("*")) {
        name = name.slice(1);
        current = true;
      }
      return $$(function() {
        return this.li(name, (function(_this) {
          return function() {
            return _this.div({
              "class": 'pull-right'
            }, function() {
              if (current) {
                return _this.span('HEAD');
              }
            });
          };
        })(this));
      });
    };

    ListView.prototype.confirmed = function(_arg) {
      var name;
      name = _arg.name;
      this.checkout(name.match(/\*?(.*)/)[1]);
      return this.cancel();
    };

    ListView.prototype.checkout = function(branch) {
      return git.cmd(this.args.concat(branch), {
        cwd: this.repo.getWorkingDirectory()
      }).then((function(_this) {
        return function(message) {
          notifier.addSuccess(message);
          atom.workspace.observeTextEditors(function(editor) {
            var filepath, _ref1;
            if (filepath = (_ref1 = editor.getPath()) != null ? _ref1.toString() : void 0) {
              return fs.exists(filepath, function(exists) {
                if (!exists) {
                  return editor.destroy();
                }
              });
            }
          });
          git.refresh();
          return _this.currentPane.activate();
        };
      })(this))["catch"](function(err) {
        return notifier.addError(err);
      });
    };

    return ListView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvdmlld3MvYnJhbmNoLWxpc3Qtdmlldy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEscURBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUixDQUFMLENBQUE7O0FBQUEsRUFDQSxPQUF1QixPQUFBLENBQVEsc0JBQVIsQ0FBdkIsRUFBQyxVQUFBLEVBQUQsRUFBSyxzQkFBQSxjQURMLENBQUE7O0FBQUEsRUFFQSxHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVIsQ0FGTixDQUFBOztBQUFBLEVBR0EsUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSLENBSFgsQ0FBQTs7QUFBQSxFQUtBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSiwrQkFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsdUJBQUEsSUFBQSxHQUFNLENBQUMsVUFBRCxDQUFOLENBQUE7O0FBQUEsdUJBRUEsVUFBQSxHQUFZLFNBQUUsSUFBRixFQUFTLElBQVQsR0FBQTtBQUNWLE1BRFcsSUFBQyxDQUFBLE9BQUEsSUFDWixDQUFBO0FBQUEsTUFEa0IsSUFBQyxDQUFBLE9BQUEsSUFDbkIsQ0FBQTtBQUFBLE1BQUEsMENBQUEsU0FBQSxDQUFBLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxRQUFELENBQVUsWUFBVixDQURBLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxJQUFELENBQUEsQ0FGQSxDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsU0FBRCxDQUFBLENBSEEsQ0FBQTthQUlBLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQUEsRUFMTDtJQUFBLENBRlosQ0FBQTs7QUFBQSx1QkFTQSxTQUFBLEdBQVcsU0FBQSxH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

//# sourceURL=/home/takaaki/.atom/packages/git-plus/lib/views/branch-list-view.coffee
