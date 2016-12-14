(function() {
  var $, AnsiToHtml, OutputView, ScrollView, ansiToHtml, defaultMessage, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  AnsiToHtml = require('ansi-to-html');

  ansiToHtml = new AnsiToHtml();

  _ref = require('atom-space-pen-views'), $ = _ref.$, ScrollView = _ref.ScrollView;

  defaultMessage = 'Nothing new to show';

  OutputView = (function(_super) {
    __extends(OutputView, _super);

    function OutputView() {
      return OutputView.__super__.constructor.apply(this, arguments);
    }

    OutputView.content = function() {
      return this.div({
        "class": 'git-plus info-view'
      }, (function(_this) {
        return function() {
          return _this.pre({
            "class": 'output'
          }, defaultMessage);
        };
      })(this));
    };

    OutputView.prototype.html = defaultMessage;

    OutputView.prototype.initialize = function() {
      return OutputView.__super__.initialize.apply(this, arguments);
    };

    OutputView.prototype.reset = function() {
      return this.html = defaultMessage;
    };

    OutputView.prototype.setContent = function(content) {
      this.html = ansiToHtml.toHtml(content);
      return this;
    };

    OutputView.prototype.finish = function() {
      this.find(".output").html(this.html);
      this.show();
      return this.timeout = setTimeout((function(_this) {
        return function() {
          return _this.hide();
        };
      })(this), atom.config.get('git-plus.messageTimeout') * 1000);
    };

    OutputView.prototype.toggle = function() {
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
      return $.fn.toggle.call(this);
    };

    return OutputView;

  })(ScrollView);

  module.exports = OutputView;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvdmlld3Mvb3V0cHV0LXZpZXcuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVFQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVIsQ0FBYixDQUFBOztBQUFBLEVBQ0EsVUFBQSxHQUFpQixJQUFBLFVBQUEsQ0FBQSxDQURqQixDQUFBOztBQUFBLEVBRUEsT0FBa0IsT0FBQSxDQUFRLHNCQUFSLENBQWxCLEVBQUMsU0FBQSxDQUFELEVBQUksa0JBQUEsVUFGSixDQUFBOztBQUFBLEVBSUEsY0FBQSxHQUFpQixxQkFKakIsQ0FBQTs7QUFBQSxFQU1NO0FBQ0osaUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsVUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxPQUFBLEVBQU8sb0JBQVA7T0FBTCxFQUFrQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUNoQyxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsWUFBQSxPQUFBLEVBQU8sUUFBUDtXQUFMLEVBQXNCLGNBQXRCLEVBRGdDO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEMsRUFEUTtJQUFBLENBQVYsQ0FBQTs7QUFBQSx5QkFJQSxJQUFBLEdBQU0sY0FKTixDQUFBOztBQUFBLHlCQU1BLFVBQUEsR0FBWSxTQUFBLEdBQUE7YUFBRyw0Q0FBQSxTQUFBLEVBQUg7SUFBQSxDQU5aLENBQUE7O0FBQUEseUJBUUEsS0FBQSxHQUFPLFNBQUEsR0FBQTthQUFHLElBQUMsQ0FBQSxJQUFELEdBQVEsZUFBWDtJQUFBLENBUlAsQ0FBQTs7QUFBQSx5QkFVQSxVQUFBLEdBQVksU0FBQyxPQUFELEdBQUE7QUFDVixNQUFBLElBQUMsQ0FBQSxJQUFELEdBQVEsVUFBVSxDQUFDLE1BQVgsQ0FBa0IsT0FBbEIsQ0FBUixDQUFBO2FBQ0EsS0FGVTtJQUFBLENBVlosQ0FBQTs7QUFBQSx5QkFjQSxNQUFBLEdBQVEsU0FBQSxHQUFBO0FBQ04sTUFBQSxJQUFDLENBQUEsSUFBRCxDQUFNLFNBQU4sQ0FBZ0IsQ0FBQyxJQUFqQixDQUFzQixJQUFDLENBQUEsSUFBdkIsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsSUFBRCxDQUFBLENBREEsQ0FBQTthQUVBLElBQUMsQ0FBQSxPQUFELEdBQVcsVUFBQSxDQUFXLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQ3BCLEtBQUMsQ0FBQSxJQUFELENBQUEsRUFEb0I7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFYLEVBRVQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHlCQUFoQixDQUFBLEdBQTZDLElBRnBDLEVBSEw7SUFBQSxDQWRSLENBQUE7O0FBQUEseUJBcUJBLE1BQUEsR0FBUSxTQUFBLEdBQUE7QUFDTixNQUFBLElBQXlCLElBQUMsQ0FBQSxPQUExQjtBQUFBLFFBQUEsWUFBQSxDQUFhLElBQUMsQ0FBQSxPQUFkLENBQUEsQ0FBQTtPQUFBO2FBQ0EsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBWixDQUFpQixJQUFqQixFQUZNO0lBQUEsQ0FyQlIsQ0FBQTs7c0JBQUE7O0tBRHVCLFdBTnpCLENBQUE7O0FBQUEsRUFnQ0EsTUFBTSxDQUFDLE9BQVAsR0FBaUIsVUFoQ2pCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/takaaki/.atom/packages/git-plus/lib/views/output-view.coffee
