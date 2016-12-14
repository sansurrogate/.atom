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
      id: 'tag',
      menu: 'Tag',
      icon: 'tag',
      type: 'active'
    }, {
      id: 'ptag',
      menu: 'Push Tags',
      icon: 'versions',
      type: 'active'
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
      id: 'rebase',
      menu: 'Rebase',
      icon: 'circuit-board',
      type: 'active'
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtY29udHJvbC9saWIvdmlld3MvbWVudS12aWV3LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSx3Q0FBQTtJQUFBO21TQUFBOztBQUFBLEVBQUEsT0FBWSxPQUFBLENBQVEsc0JBQVIsQ0FBWixFQUFDLFlBQUEsSUFBRCxFQUFPLFNBQUEsQ0FBUCxDQUFBOztBQUFBLEVBRUEsS0FBQSxHQUFRO0lBQ047QUFBQSxNQUFFLEVBQUEsRUFBSSxTQUFOO0FBQUEsTUFBaUIsSUFBQSxFQUFNLFNBQXZCO0FBQUEsTUFBa0MsSUFBQSxFQUFNLFdBQXhDO0FBQUEsTUFBcUQsSUFBQSxFQUFNLFFBQTNEO0tBRE0sRUFFTjtBQUFBLE1BQUUsRUFBQSxFQUFJLFNBQU47QUFBQSxNQUFpQixJQUFBLEVBQU0sU0FBdkI7QUFBQSxNQUFrQyxJQUFBLEVBQU0sU0FBeEM7QUFBQSxNQUFtRCxJQUFBLEVBQU0sUUFBekQ7S0FGTSxFQUdOO0FBQUEsTUFBRSxFQUFBLEVBQUksUUFBTjtBQUFBLE1BQWdCLElBQUEsRUFBTSxRQUF0QjtBQUFBLE1BQWdDLElBQUEsRUFBTSxRQUF0QztBQUFBLE1BQWdELElBQUEsRUFBTSxjQUF0RDtLQUhNLEVBSU47QUFBQSxNQUFFLEVBQUEsRUFBSSxLQUFOO0FBQUEsTUFBYSxJQUFBLEVBQU0sS0FBbkI7QUFBQSxNQUEwQixJQUFBLEVBQU0sS0FBaEM7QUFBQSxNQUF1QyxJQUFBLEVBQU0sUUFBN0M7S0FKTSxFQUtOO0FBQUEsTUFBRSxFQUFBLEVBQUksTUFBTjtBQUFBLE1BQWMsSUFBQSxFQUFNLFdBQXBCO0FBQUEsTUFBaUMsSUFBQSxFQUFNLFVBQXZDO0FBQUEsTUFBbUQsSUFBQSxFQUFNLFFBQXpEO0tBTE0sRUFNTjtBQUFBLE1BQUUsRUFBQSxF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

//# sourceURL=/home/takaaki/.atom/packages/git-control/lib/views/menu-view.coffee
