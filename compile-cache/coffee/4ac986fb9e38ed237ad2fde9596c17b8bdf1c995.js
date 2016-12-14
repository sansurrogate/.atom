(function() {
  var BufferedProcess, CompositeDisposable, path, _ref;

  _ref = require('atom'), BufferedProcess = _ref.BufferedProcess, CompositeDisposable = _ref.CompositeDisposable;

  path = require('path');

  module.exports = {
    config: {
      mlintDir: {
        "default": "",
        type: 'string',
        title: 'Path to directory containing mlint'
      }
    },
    activate: function(state) {
      console.log('linter-matlab loaded.');
      this.subscriptions = new CompositeDisposable;
      return this.subscriptions.add(atom.config.observe('linter-matlab.mlintDir', (function(_this) {
        return function(mlintDir) {
          return _this.mlintDir = mlintDir;
        };
      })(this)));
    },
    deactivate: function() {
      return this.subscriptions.dispose();
    },
    provideLinter: function() {
      var provider;
      return provider = {
        grammarScopes: ['source.matlab'],
        scope: 'file',
        lintOnFly: false,
        lint: (function(_this) {
          return function(textEditor) {
            return new Promise(function(resolve, reject) {
              var filePath, process, results;
              filePath = textEditor.getPath();
              results = [];
              process = new BufferedProcess({
                command: _this.mlintDir != null ? path.join(_this.mlintDir, "mlint") : "mlint",
                args: [filePath],
                stderr: function(output) {
                  var columnend, columnstart, line, linenum, lines, message, regex, result, _, _i, _len, _ref1, _results;
                  lines = output.split('\n');
                  lines.pop();
                  _results = [];
                  for (_i = 0, _len = lines.length; _i < _len; _i++) {
                    line = lines[_i];
                    regex = /L (\d+) \(C (\d+)-?(\d+)?\): (.*)/;
                    _ref1 = line.match(regex), _ = _ref1[0], linenum = _ref1[1], columnstart = _ref1[2], columnend = _ref1[3], message = _ref1[4];
                    if (typeof columnend === 'undefined') {
                      columnend = columnstart;
                    }
                    result = {
                      range: [[linenum - 1, columnstart - 1], [linenum - 1, columnend - 1]],
                      type: "warning",
                      text: message,
                      filePath: filePath
                    };
                    _results.push(results.push(result));
                  }
                  return _results;
                },
                exit: function(code) {
                  if (code !== 0) {
                    return resolve([]);
                  }
                  if (results == null) {
                    return resolve([]);
                  }
                  return resolve(results);
                }
              });
              return process.onWillThrowError(function(_arg) {
                var error, handle;
                error = _arg.error, handle = _arg.handle;
                atom.notifications.addError("Failed to run MATLAB linter", {
                  detail: "Directory containing mlint is set to '" + (atom.config.get("linter-matlab.mlintDir")) + "'",
                  dismissable: true
                });
                handle();
                return resolve([]);
              });
            });
          };
        })(this)
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9saW50ZXItbWF0bGFiL2xpYi9saW50ZXItbWF0bGFiLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxnREFBQTs7QUFBQSxFQUFBLE9BQXlDLE9BQUEsQ0FBUSxNQUFSLENBQXpDLEVBQUMsdUJBQUEsZUFBRCxFQUFrQiwyQkFBQSxtQkFBbEIsQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQURQLENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNDO0FBQUEsSUFBQSxNQUFBLEVBQ0M7QUFBQSxNQUFBLFFBQUEsRUFDQztBQUFBLFFBQUEsU0FBQSxFQUFTLEVBQVQ7QUFBQSxRQUNBLElBQUEsRUFBTSxRQUROO0FBQUEsUUFFQSxLQUFBLEVBQU8sb0NBRlA7T0FERDtLQUREO0FBQUEsSUFNQSxRQUFBLEVBQVUsU0FBQyxLQUFELEdBQUE7QUFDVCxNQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksdUJBQVosQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsYUFBRCxHQUFpQixHQUFBLENBQUEsbUJBRGpCLENBQUE7YUFFQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLHdCQUFwQixFQUNsQixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxRQUFELEdBQUE7aUJBQ0MsS0FBQyxDQUFBLFFBQUQsR0FBWSxTQURiO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FEa0IsQ0FBbkIsRUFIUztJQUFBLENBTlY7QUFBQSxJQWFBLFVBQUEsRUFBWSxTQUFBLEdBQUE7YUFDWCxJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBQSxFQURXO0lBQUEs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

//# sourceURL=/home/takaaki/.atom/packages/linter-matlab/lib/linter-matlab.coffee
