(function() {
  var DiffLine, DiffView, View, fmtNum,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom-space-pen-views').View;

  DiffLine = (function(_super) {
    __extends(DiffLine, _super);

    function DiffLine() {
      return DiffLine.__super__.constructor.apply(this, arguments);
    }

    DiffLine.content = function(line) {
      return this.div({
        "class": "line " + line.type
      }, (function(_this) {
        return function() {
          _this.pre({
            "class": "lineno " + (!line.lineno ? 'invisible' : '')
          }, line.lineno);
          return _this.pre({
            outlet: 'linetext'
          }, line.text);
        };
      })(this));
    };

    DiffLine.prototype.initialize = function(params) {
      if (params.type === 'heading') {
        return this.linetext.click(function() {
          return atom.workspace.open(params.text);
        });
      }
    };

    return DiffLine;

  })(View);

  fmtNum = function(num) {
    return ("     " + (num || '') + " ").slice(-6);
  };

  module.exports = DiffView = (function(_super) {
    __extends(DiffView, _super);

    function DiffView() {
      return DiffView.__super__.constructor.apply(this, arguments);
    }

    DiffView.content = function() {
      return this.div({
        "class": 'diff'
      });
    };

    DiffView.prototype.clearAll = function() {
      this.find('>.line').remove();
    };

    DiffView.prototype.addAll = function(diffs) {
      this.clearAll();
      diffs.forEach((function(_this) {
        return function(diff) {
          var file, noa, nob;
          if ((file = diff['+++']) === '+++ /dev/null') {
            file = diff['---'];
          }
          _this.append(new DiffLine({
            type: 'heading',
            text: file
          }));
          noa = 0;
          nob = 0;
          diff.lines.forEach(function(line) {
            var atend, atstart, klass, linea, lineb, lineno, _ref;
            klass = '';
            lineno = void 0;
            if (/^@@ /.test(line)) {
              _ref = line.replace(/-|\+/g, '').split(' '), atstart = _ref[0], linea = _ref[1], lineb = _ref[2], atend = _ref[3];
              noa = parseInt(linea, 10);
              nob = parseInt(lineb, 10);
              klass = 'subtle';
            } else {
              lineno = "" + (fmtNum(noa)) + (fmtNum(nob));
              if (/^-/.test(line)) {
                klass = 'red';
                lineno = "" + (fmtNum(noa)) + (fmtNum(0));
                noa++;
              } else if (/^\+/.test(line)) {
                klass = 'green';
                lineno = "" + (fmtNum(0)) + (fmtNum(nob));
                nob++;
              } else {
                noa++;
                nob++;
              }
            }
            _this.append(new DiffLine({
              type: klass,
              text: line,
              lineno: lineno
            }));
          });
        };
      })(this));
    };

    return DiffView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtY29udHJvbC9saWIvdmlld3MvZGlmZi12aWV3LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxnQ0FBQTtJQUFBO21TQUFBOztBQUFBLEVBQUMsT0FBUSxPQUFBLENBQVEsc0JBQVIsRUFBUixJQUFELENBQUE7O0FBQUEsRUFFTTtBQUNKLCtCQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFFBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQyxJQUFELEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxPQUFBLEVBQVEsT0FBQSxHQUFPLElBQUksQ0FBQyxJQUFwQjtPQUFMLEVBQWlDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDL0IsVUFBQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsWUFBQSxPQUFBLEVBQVEsU0FBQSxHQUFRLENBQUMsQ0FBQSxJQUFXLENBQUMsTUFBWixHQUF3QixXQUF4QixHQUF5QyxFQUExQyxDQUFoQjtXQUFMLEVBQXFFLElBQUksQ0FBQyxNQUExRSxDQUFBLENBQUE7aUJBQ0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsTUFBQSxFQUFRLFVBQVI7V0FBTCxFQUF5QixJQUFJLENBQUMsSUFBOUIsRUFGK0I7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqQyxFQURRO0lBQUEsQ0FBVixDQUFBOztBQUFBLHVCQUtBLFVBQUEsR0FBWSxTQUFDLE1BQUQsR0FBQTtBQUNWLE1BQUEsSUFBRyxNQUFNLENBQUMsSUFBUCxLQUFlLFNBQWxCO2VBQWlDLElBQUMsQ0FBQSxRQUFRLENBQUMsS0FBVixDQUFnQixTQUFBLEdBQUE7aUJBQUcsSUFBSSxDQUFDLFNBQVMsQ0FB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

//# sourceURL=/home/takaaki/.atom/packages/git-control/lib/views/diff-view.coffee
