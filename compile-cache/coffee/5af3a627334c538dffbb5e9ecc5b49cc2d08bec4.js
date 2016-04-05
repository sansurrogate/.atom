(function() {
  var $, MenuItem, MenuView, View, items, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom-space-pen-views'), View = _ref.View, $ = _ref.$;

  items = [
    {
      id: 'project',
      menu: 'Project',
      icon: 'icon-repo',
      type: 'active'
    }, {
      id: 'compare',
      menu: 'Compare',
      icon: 'compare',
      type: 'active'
    }, {
      id: 'commit',
      menu: 'Commit',
      icon: 'commit',
      type: 'file merging'
    }, {
      id: 'reset',
      menu: 'Reset',
      icon: 'sync',
      type: 'file'
    }, {
      id: 'fetch',
      menu: 'Fetch',
      icon: 'cloud-download',
      type: 'remote'
    }, {
      id: 'pull',
      menu: 'Pull',
      icon: 'pull',
      type: 'upstream'
    }, {
      id: 'pullup',
      menu: 'Pull Upstream',
      icon: 'desktop-download',
      type: 'active'
    }, {
      id: 'push',
      menu: 'Push',
      icon: 'push',
      type: 'downstream'
    }, {
      id: 'merge',
      menu: 'Merge',
      icon: 'merge',
      type: 'active'
    }, {
      id: 'branch',
      menu: 'Branch',
      icon: 'branch',
      type: 'active'
    }, {
      id: 'flow',
      menu: 'GitFlow',
      icon: 'flow',
      type: 'active',
      showConfig: 'git-control.showGitFlowButton'
    }
  ];

  MenuItem = (function(_super) {
    __extends(MenuItem, _super);

    function MenuItem() {
      return MenuItem.__super__.constructor.apply(this, arguments);
    }

    MenuItem.content = function(item) {
      var klass;
      klass = item.type === 'active' ? '' : 'inactive';
      klass += (item.showConfig != null) && !atom.config.get(item.showConfig) ? ' hide' : '';
      return this.div({
        "class": "item " + klass + " " + item.type,
        id: "menu" + item.id,
        click: 'click'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": "icon large " + item.icon
          });
          return _this.div(item.menu);
        };
      })(this));
    };

    MenuItem.prototype.initialize = function(item) {
      this.item = item;
      if (item.showConfig != null) {
        return atom.config.observe(item.showConfig, function(show) {
          if (show) {
            return $("#menu" + item.id).removeClass('hide');
          } else {
            return $("#menu" + item.id).addClass('hide');
          }
        });
      }
    };

    MenuItem.prototype.click = function() {
      return this.parentView.click(this.item.id);
    };

    return MenuItem;

  })(View);

  module.exports = MenuView = (function(_super) {
    __extends(MenuView, _super);

    function MenuView() {
      return MenuView.__super__.constructor.apply(this, arguments);
    }

    MenuView.content = function(item) {
      return this.div({
        "class": 'menu'
      }, (function(_this) {
        return function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = items.length; _i < _len; _i++) {
            item = items[_i];
            _results.push(_this.subview(item.id, new MenuItem(item)));
          }
          return _results;
        };
      })(this));
    };

    MenuView.prototype.click = function(id) {
      if (!(this.find("#menu" + id).hasClass('inactive'))) {
        return this.parentView["" + id + "MenuClick"]();
      }
    };

    MenuView.prototype.activate = function(type, active) {
      var menuItems;
      menuItems = this.find(".item." + type);
      if (active) {
        menuItems.removeClass('inactive');
      } else {
        menuItems.addClass('inactive');
      }
    };

    return MenuView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtY29udHJvbC9saWIvdmlld3MvbWVudS12aWV3LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx3Q0FBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsT0FBWSxPQUFBLENBQVEsc0JBQVIsQ0FBWixFQUFDLFlBQUEsSUFBRCxFQUFPLFNBQUEsQ0FBUCxDQUFBOztBQUFBLEVBRUEsS0FBQSxHQUFRO0lBQ047QUFBQSxNQUFFLEVBQUEsRUFBSSxTQUFOO0FBQUEsTUFBaUIsSUFBQSxFQUFNLFNBQXZCO0FBQUEsTUFBa0MsSUFBQSxFQUFNLFdBQXhDO0FBQUEsTUFBcUQsSUFBQSxFQUFNLFFBQTNEO0tBRE0sRUFFTjtBQUFBLE1BQUUsRUFBQSxFQUFJLFNBQU47QUFBQSxNQUFpQixJQUFBLEVBQU0sU0FBdkI7QUFBQSxNQUFrQyxJQUFBLEVBQU0sU0FBeEM7QUFBQSxNQUFtRCxJQUFBLEVBQU0sUUFBekQ7S0FGTSxFQUdOO0FBQUEsTUFBRSxFQUFBLEVBQUksUUFBTjtBQUFBLE1BQWdCLElBQUEsRUFBTSxRQUF0QjtBQUFBLE1BQWdDLElBQUEsRUFBTSxRQUF0QztBQUFBLE1BQWdELElBQUEsRUFBTSxjQUF0RDtLQUhNLEVBSU47QUFBQSxNQUFFLEVBQUEsRUFBSSxPQUFOO0FBQUEsTUFBZSxJQUFBLEVBQU0sT0FBckI7QUFBQSxNQUE4QixJQUFBLEVBQU0sTUFBcEM7QUFBQSxNQUE0QyxJQUFBLEVBQU0sTUFBbEQ7S0FKTSxFQU1OO0FBQUEsTUFBRSxFQUFBLEVBQUksT0FBTjtBQUFBLE1BQWUsSUFBQSxFQUFNLE9BQXJCO0FBQUEsTUFBOEIsSUFBQSxFQUFNLGdCQUFwQztBQUFBLE1BQXNELElBQUEsRUFBTSxRQUE1RDtLQU5NLEVBT047QUFBQSxNQUFFLEVBQUEs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

//# sourceURL=/home/takaaki/.atom/packages/git-control/lib/views/menu-view.coffee
