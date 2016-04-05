(function() {
  var LogLine, LogView, View,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom-space-pen-views').View;

  LogLine = (function(_super) {
    __extends(LogLine, _super);

    function LogLine() {
      return LogLine.__super__.constructor.apply(this, arguments);
    }

    LogLine.content = function(line) {
      return this.pre({
        "class": "" + (line.iserror ? 'error' : '')
      }, line.log);
    };

    return LogLine;

  })(View);

  module.exports = LogView = (function(_super) {
    __extends(LogView, _super);

    function LogView() {
      return LogView.__super__.constructor.apply(this, arguments);
    }

    LogView.content = function() {
      return this.div({
        "class": 'logger'
      });
    };

    LogView.prototype.log = function(log, iserror) {
      this.append(new LogLine({
        iserror: iserror,
        log: log
      }));
      this.scrollToBottom();
    };

    return LogView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtY29udHJvbC9saWIvdmlld3MvbG9nLXZpZXcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHNCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxPQUFRLE9BQUEsQ0FBUSxzQkFBUixFQUFSLElBQUQsQ0FBQTs7QUFBQSxFQUVNO0FBQ0osOEJBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsT0FBQyxDQUFBLE9BQUQsR0FBVSxTQUFDLElBQUQsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTyxFQUFBLEdBQUUsQ0FBSSxJQUFJLENBQUMsT0FBUixHQUFxQixPQUFyQixHQUFrQyxFQUFuQyxDQUFUO09BQUwsRUFBdUQsSUFBSSxDQUFDLEdBQTVELEVBRFE7SUFBQSxDQUFWLENBQUE7O21CQUFBOztLQURvQixLQUZ0QixDQUFBOztBQUFBLEVBTUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLDhCQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLE9BQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsT0FBQSxFQUFPLFFBQVA7T0FBTCxFQURRO0lBQUEsQ0FBVixDQUFBOztBQUFBLHNCQUdBLEdBQUEsR0FBSyxTQUFDLEdBQUQsRUFBTSxPQUFOLEdBQUE7QUFDSCxNQUFBLElBQUMsQ0FBQSxNQUFELENBQVksSUFBQSxPQUFBLENBQVE7QUFBQSxRQUFBLE9BQUEsRUFBUyxPQUFUO0FBQUEsUUFBa0IsR0FBQSxFQUFLLEdBQXZCO09BQVIsQ0FBWixDQUFBLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxjQUFELENBQUEsQ0FEQSxDQURHO0lBQUEsQ0FITCxDQUFBOzttQkFBQTs7S0FEb0IsS0FQdEIsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/takaaki/.atom/packages/git-control/lib/views/log-view.coffee
