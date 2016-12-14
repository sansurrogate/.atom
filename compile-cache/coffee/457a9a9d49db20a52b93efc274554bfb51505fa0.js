(function() {
  var BufferedProcess, LinterRust, XRegExp, fs, path, spawn,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  fs = require('fs');

  path = require('path');

  BufferedProcess = require('atom').BufferedProcess;

  XRegExp = require('xregexp');

  spawn = require('child_process');

  LinterRust = (function() {
    function LinterRust() {
      this.usingMultirustForClippy = __bind(this.usingMultirustForClippy, this);
      this.buildCargoPath = __bind(this.buildCargoPath, this);
      this.locateCargo = __bind(this.locateCargo, this);
      this.initCmd = __bind(this.initCmd, this);
      this.parse = __bind(this.parse, this);
      this.lint = __bind(this.lint, this);
    }

    LinterRust.prototype.cargoDependencyDir = "target/debug/deps";

    LinterRust.prototype.lintProcess = null;

    LinterRust.prototype.pattern = XRegExp('(?<file>[^\n\r]+):(?<from_line>\\d+):(?<from_col>\\d+):\\s*(?<to_line>\\d+):(?<to_col>\\d+)\\s+((?<error>error|fatal error)|(?<warning>warning)|(?<info>note|help)):\\s+(?<message>.+?)[\n\r]+($|(?=[^\n\r]+:\\d+))', 's');

    LinterRust.prototype.lint = function(textEditor) {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var PATH, args, command, curDir, exit, file, options, results, stderr, stdout;
          results = [];
          file = _this.initCmd(textEditor.getPath());
          curDir = path.dirname(file);
          PATH = path.dirname(_this.cmd[0]);
          options = JSON.parse(JSON.stringify(process.env));
          options.PATH = PATH + path.delimiter + options.PATH;
          options.cwd = curDir;
          _this.cmd.push(file);
          command = _this.cmd[0];
          args = _this.cmd.slice(1);
          stdout = function(data) {
            if (atom.inDevMode()) {
              return console.log(data);
            }
          };
          stderr = function(err) {
            return results.push(err);
          };
          exit = function(code) {
            var messages;
            if (code === 101 || code === 0) {
              messages = _this.parse(results.join(''));
              messages.forEach(function(message) {
                if (!(path.isAbsolute(message.filePath))) {
                  return message.filePath = path.join(curDir, message.filePath);
                }
              });
              return resolve(messages);
            } else {
              return resolve([]);
            }
          };
          _this.lintProcess = new BufferedProcess({
            command: command,
            args: args,
            options: options,
            stdout: stdout,
            stderr: stderr,
            exit: exit
          });
          return _this.lintProcess.onWillThrowError(function(_arg) {
            var error, handle;
            error = _arg.error, handle = _arg.handle;
            atom.notifications.addError("Failed to run " + command, {
              detail: "" + error.message,
              dismissable: true
            });
            handle();
            return resolve([]);
          });
        };
      })(this));
    };

    LinterRust.prototype.parse = function(output) {
      var constructMessage, disabledWarnings, lastMessage, lastMessageDisabled, messages;
      messages = [];
      lastMessage = null;
      lastMessageDisabled = false;
      disabledWarnings = this.config('disabledWarnings');
      constructMessage = this.constructMessage;
      XRegExp.forEach(output, this.pattern, function(match) {
        var disabledWarning, range, _i, _len;
        if (match.from_col === match.to_col) {
          match.to_col = parseInt(match.to_col) + 1;
        }
        range = [[match.from_line - 1, match.from_col - 1], [match.to_line - 1, match.to_col - 1]];
        if (match.info && (lastMessage || lastMessageDisabled)) {
          if (!lastMessageDisabled) {
            lastMessage.trace || (lastMessage.trace = []);
            return lastMessage.trace.push({
              type: "Trace",
              text: match.message,
              filePath: match.file,
              range: range
            });
          }
        } else {
          if (match.warning && disabledWarnings) {
            for (_i = 0, _len = disabledWarnings.length; _i < _len; _i++) {
              disabledWarning = disabledWarnings[_i];
              if (match.message.indexOf(disabledWarning) > 0) {
                lastMessageDisabled = true;
                break;
              }
            }
            if (!lastMessageDisabled) {
              return messages.push(constructMessage(match, range));
            }
          } else {
            messages.push(constructMessage(match, range));
            return lastMessageDisabled = false;
          }
        }
      });
      return messages;
    };

    LinterRust.prototype.constructMessage = function(match, range) {
      var message;
      message = {
        type: match.error ? "Error" : "Warning",
        text: match.message,
        filePath: match.file,
        range: range
      };
      return message;
    };

    LinterRust.prototype.config = function(key) {
      return atom.config.get("linter-rust." + key);
    };

    LinterRust.prototype.initCmd = function(editingFile) {
      var cargoArgs, cargoManifestPath, cargoPath, rustcArgs, rustcPath;
      cargoManifestPath = this.locateCargo(path.dirname(editingFile));
      rustcPath = (this.config('rustcPath')).trim();
      rustcArgs = (function() {
        switch (this.config('rustcBuildTest')) {
          case true:
            return ['--cfg', 'test', '-Z', 'no-trans', '--color', 'never'];
          default:
            return ['-Z', 'no-trans', '--color', 'never'];
        }
      }).call(this);
      cargoPath = (this.config('cargoPath')).trim();
      cargoArgs = (function() {
        switch (this.config('cargoCommand')) {
          case 'check':
            return ['check'];
          case 'test':
            return ['test', '--no-run'];
          case 'rustc':
            return ['rustc', '-Zno-trans', '--color', 'never'];
          case 'clippy':
            return ['clippy'];
          default:
            return ['build'];
        }
      }).call(this);
      if (!this.config('useCargo') || !cargoManifestPath) {
        this.cmd = [rustcPath].concat(rustcArgs);
        if (cargoManifestPath) {
          this.cmd.push('-L');
          this.cmd.push(path.join(path.dirname(cargoManifestPath), this.cargoDependencyDir));
        }
        return editingFile;
      } else {
        this.cmd = this.buildCargoPath(cargoPath).concat(cargoArgs).concat(['-j', this.config('jobsNumber'), '--manifest-path']);
        return cargoManifestPath;
      }
    };

    LinterRust.prototype.locateCargo = function(curDir) {
      var cargoManifestFilename, directory, root_dir;
      root_dir = /^win/.test(process.platform) ? /^.:\\$/ : /^\/$/;
      cargoManifestFilename = this.config('cargoManifestFilename');
      directory = path.resolve(curDir);
      while (true) {
        if (fs.existsSync(path.join(directory, cargoManifestFilename))) {
          return path.join(directory, cargoManifestFilename);
        }
        if (root_dir.test(directory)) {
          break;
        }
        directory = path.resolve(path.join(directory, '..'));
      }
      return false;
    };

    LinterRust.prototype.buildCargoPath = function(cargoPath) {
      if ((this.config('cargoCommand')) === 'clippy' && this.usingMultirustForClippy()) {
        return ['multirust', 'run', 'nightly', 'cargo'];
      } else {
        return [cargoPath];
      }
    };

    LinterRust.prototype.usingMultirustForClippy = function() {
      var result;
      try {
        result = spawn.execSync('multirust --version');
        return result.status === 0;
      } catch (_error) {
        return false;
      }
    };

    return LinterRust;

  })();

  module.exports = LinterRust;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9saW50ZXItcnVzdC9saWIvbGludGVyLXJ1c3QuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFEQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FBTCxDQUFBOztBQUFBLEVBQ0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBRFAsQ0FBQTs7QUFBQSxFQUVDLGtCQUFtQixPQUFBLENBQVEsTUFBUixFQUFuQixlQUZELENBQUE7O0FBQUEsRUFHQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVIsQ0FIVixDQUFBOztBQUFBLEVBSUEsS0FBQSxHQUFRLE9BQUEsQ0FBUyxlQUFULENBSlIsQ0FBQTs7QUFBQSxFQU9NOzs7Ozs7OztLQUNKOztBQUFBLHlCQUFBLGtCQUFBLEdBQW9CLG1CQUFwQixDQUFBOztBQUFBLHlCQUNBLFdBQUEsR0FBYSxJQURiLENBQUE7O0FBQUEseUJBRUEsT0FBQSxHQUFTLE9BQUEsQ0FBUSxxTkFBUixFQUd1QyxHQUh2QyxDQUZULENBQUE7O0FBQUEseUJBT0EsSUFBQSxHQUFNLFNBQUMsVUFBRCxHQUFBO0FBQ0osYUFBVyxJQUFBLE9BQUEsQ0FBUSxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxPQUFELEVBQVUsTUFBVixHQUFBO0FBQ2pCLGNBQUEseUVBQUE7QUFBQSxVQUFBLE9BQUEsR0FBVSxFQUFWLENBQUE7QUFBQSxVQUNBLElBQUEsR0FBTyxLQUFDLENBQUEsT0FBRCxDQUFZLFVBQVUsQ0FBQyxPQUFkLENBQUEsQ0FBVCxDQURQLENBQUE7QUFBQSxVQUVBLE1BQUEsR0FBUyxJQUFJLENBQUMsT0FBTCxDQUFhLElBQWIsQ0FGVCxDQUFBO0FBQUEsVUFHQSxJQUFBLEdBQU8sSUFBSSxDQUFDLE9BQUwsQ0FBYSxLQUFDLENBQUEsR0FBSSxDQUFBLENBQUEsQ0FBbEIsQ0FIUCxDQUFBO0FBQUEsVUFJQSxPQUFBLEdBQVUsSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFJLENBQUMsU0FBTCxDQUFlLE9BQU8sQ0FBQyxHQUF2QixDQUFYLENBSlYsQ0FBQTtBQUFBLFVBS0EsT0FBTyxDQUFDLElBQVIsR0FBZSxJQUFBLEdBQU8sSUFBSSxDQUFDLFNBQVosR0FBd0IsT0FBTyxDQUFDLElBTC9DLENBQUE7QUFBQSxVQU1BLE9BQU8sQ0FBQyxHQUFSLEdBQWMsTUFOZCxDQUFBO0FBQUEsVUFPQSxLQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxJQUFWLENBUEEsQ0FBQTtBQUFBLFVBUUEsT0FBQSxHQUFVLEtBQUMsQ0FBQSxHQUFJLENBQUEsQ0FBQSxDQVJmLENBQUE7QUFBQSxVQVNBLElBQUEsR0FBTyxLQUFDLENBQUEsR0FBRyxDQUFDLEtBQUwsQ0FBVyxDQUFYLENBVFAsQ0FBQTtBQUFBLFVBV0EsTUFBQSxHQUFTLFNBQUMsSUFBRCxHQUFBO0FBQ1AsWUFBQSxJQUF1QixJQUFJLENBQUMsU0FBUixDQUFBLENBQXBCO3FCQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksSUFBWixFQUFBO2FBRE87VUFBQSxDQVhULENBQUE7QUFBQSxVQWFBLE1BQUEsR0FBUyxTQUFDLEdBQUQsR0FBQTttQkFDUCxPQUFPLENBQUMsSUFBUixDQUFhLEdBQWIsRUFETztVQUFBLENBYlQsQ0FBQTtBQUFBLFVBZ0JBLElBQUEsR0FBTyxTQUFDLElBQUQsR0FBQTtBQUNMLGdCQUFBLFFBQUE7QUFBQSxZQUFBLElBQUcsSUFBQSxLQUFRLEdBQVIsSUFBZSxJQUFBLEtBQVEsQ0FBMUI7QUFDRSxjQUFBLFFBQUEsR0FBVyxLQUFDLENBQUEsS0FBRCxDQUFPLE9BQU8sQ0FBQyxJQUFSLENBQWEsRUFBYixDQUFQLENBQVgsQ0FBQTtBQUFBLGNBQ0EsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsU0FBQyxPQUFELEdBQUE7QUFDZixnQkFBQSxJQUFHLENBQUEsQ0FBRSxJQUFJLENBQUMsVUFBTCxDQUFnQixPQUFPLENBQUMsUUFBeEIsQ0FBRCxDQUFKO3lCQUNFLE9BQU8sQ0FBQyxRQUFSLEdBQW1CLElBQUksQ0FBQyxJQUFMLENBQVUsTUFBVixFQUFrQixPQUFPLENBQUMsUUFBMUIsRUFEckI7aUJBRGU7Y0FBQSxDQUFqQixDQURBLENBQUE7cUJBSUEsT0FBQSxDQUFRLFFBQVIsRUFMRjthQUFBLE1BQUE7cUJBT0UsT0FBQSxDQUFRLEVBQVIsRUFQRjthQURLO1VBQUEsQ0FoQlAsQ0FBQTtBQUFBLFVBMEJBLEtBQUMsQ0FBQSxXQUFELEdBQW1CLElBQUEsZUFBQSxDQUFnQjtBQUFBLFlBQUMsU0FBQSxPQUFEO0FBQUEsWUFBVSxNQUFBLElBQVY7QUFBQSxZQUFnQixTQUFBLE9BQWhCO0FBQUEsWUFBeUIsUUFBQSxNQUF6QjtBQUFBLFlBQWlDLFFBQUEsTUFBakM7QUFBQSxZQUF5QyxNQUFBLElBQXpDO1dBQWhCLENBMUJuQixDQUFBO2lCQTJCQSxLQUFDLENBQUEsV0FBVyxDQUFDLGdCQUFiLENBQThCLFNBQUMsSUFBRCxHQUFBO0FBQzVCLGdCQUFBLGFBQUE7QUFBQSxZQUQ4QixhQUFBLE9BQU8sY0FBQSxNQUNyQyxDQUFBO0FBQUEsWUFBQSxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQW5CLENBQTZCLGdCQUFBLEdBQWdCLE9BQTdDLEVBQ0U7QUFBQSxjQUFBLE1BQUEsRUFBUSxFQUFBLEdBQUcsS0FBSyxDQUFDLE9BQWpCO0FBQUEsY0FDQSxXQUFBLEVBQWEsSUFEYjthQURGLENBQUEsQ0FBQTtBQUFBLFlBR0EsTUFBQSxDQUFBLENBSEEsQ0FBQTttQkFJQSxPQUFBLENBQVEsRUFBUixFQUw0QjtVQUFBLENBQTlCLEVBNUJpQjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVIsQ0FBWCxDQURJO0lBQUEsQ0FQTixDQUFBOztBQUFBLHlCQTJDQSxLQUFBLEdBQU8sU0FBQyxNQUFELEdBQUE7QUFDTCxVQUFBLDhFQUFBO0FBQUEsTUFBQSxRQUFBLEdBQVcsRUFBWCxDQUFBO0FBQUEsTUFDQSxXQUFBLEdBQWMsSUFEZCxDQUFBO0FBQUEsTUFHQSxtQkFBQSxHQUFzQixLQUh0QixDQUFBO0FBQUEsTUFJQSxnQkFBQSxHQUFtQixJQUFDLENBQUEsTUFBRCxDQUFRLGtCQUFSLENBSm5CLENBQUE7QUFBQSxNQU1BLGdCQUFBLEdBQW1CLElBQUMsQ0FBQSxnQkFOcEIsQ0FBQTtBQUFBLE1BT0EsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsTUFBaEIsRUFBd0IsSUFBQyxDQUFBLE9BQXpCLEVBQWtDLFNBQUMsS0FBRCxHQUFBO0FBQ2hDLFlBQUEsZ0NBQUE7QUFBQSxRQUFBLElBQUcsS0FBSyxDQUFDLFFBQU4sS0FBa0IsS0FBSyxDQUFDLE1BQTNCO0FBQ0UsVUFBQSxLQUFLLENBQUMsTUFBTixHQUFlLFFBQUEsQ0FBUyxLQUFLLENBQUMsTUFBZixDQUFBLEdBQXlCLENBQXhDLENBREY7U0FBQTtBQUFBLFFBRUEsS0FBQSxHQUFRLENBQ04sQ0FBQyxLQUFLLENBQUMsU0FBTixHQUFrQixDQUFuQixFQUFzQixLQUFLLENBQUMsUUFBTixHQUFpQixDQUF2QyxDQURNLEVBRU4sQ0FBQyxLQUFLLENBQUMsT0FBTixHQUFnQixDQUFqQixFQUFvQixLQUFLLENBQUMsTUFBTixHQUFlLENBQW5DLENBRk0sQ0FGUixDQUFBO0FBT0EsUUFBQSxJQUFHLEtBQUssQ0FBQyxJQUFOLElBQWUsQ0FBQyxXQUFBLElBQWUsbUJBQWhCLENBQWxCO0FBRUUsVUFBQSxJQUFHLENBQUEsbUJBQUg7QUFDRSxZQUFBLFdBQVcsQ0FBQyxVQUFaLFdBQVcsQ0FBQyxRQUFVLEdBQXRCLENBQUE7bUJBQ0EsV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFsQixDQUNFO0FBQUEsY0FBQSxJQUFBLEVBQU0sT0FBTjtBQUFBLGNBQ0EsSUFBQSxFQUFNLEtBQUssQ0FBQyxPQURaO0FBQUEsY0FFQSxRQUFBLEVBQVUsS0FBSyxDQUFDLElBRmhCO0FBQUEsY0FHQSxLQUFBLEVBQU8sS0FIUDthQURGLEVBRkY7V0FGRjtTQUFBLE1BQUE7QUFVRSxVQUFBLElBQUcsS0FBSyxDQUFDLE9BQU4sSUFBa0IsZ0JBQXJCO0FBQ0UsaUJBQUEsdURBQUE7cURBQUE7QUFFRSxjQUFBLElBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFkLENBQXNCLGVBQXRCLENBQUEsR0FBeUMsQ0FBNUM7QUFDRSxnQkFBQSxtQkFBQSxHQUFzQixJQUF0QixDQUFBO0FBQ0Esc0JBRkY7ZUFGRjtBQUFBLGFBQUE7QUFLQSxZQUFBLElBQUcsQ0FBQSxtQkFBSDtxQkFDRSxRQUFRLENBQUMsSUFBVCxDQUFjLGdCQUFBLENBQWlCLEtBQWpCLEVBQXdCLEtBQXhCLENBQWQsRUFERjthQU5GO1dBQUEsTUFBQTtBQVNFLFlBQUEsUUFBUSxDQUFDLElBQVQsQ0FBYyxnQkFBQSxDQUFpQixLQUFqQixFQUF3QixLQUF4QixDQUFkLENBQUEsQ0FBQTttQkFDQSxtQkFBQSxHQUFzQixNQVZ4QjtXQVZGO1NBUmdDO01BQUEsQ0FBbEMsQ0FQQSxDQUFBO0FBcUNBLGFBQU8sUUFBUCxDQXRDSztJQUFBLENBM0NQLENBQUE7O0FBQUEseUJBb0ZBLGdCQUFBLEdBQWtCLFNBQUMsS0FBRCxFQUFRLEtBQVIsR0FBQTtBQUNoQixVQUFBLE9BQUE7QUFBQSxNQUFBLE9BQUEsR0FDRTtBQUFBLFFBQUEsSUFBQSxFQUFTLEtBQUssQ0FBQyxLQUFULEdBQW9CLE9BQXBCLEdBQWlDLFNBQXZDO0FBQUEsUUFDQSxJQUFBLEVBQU0sS0FBSyxDQUFDLE9BRFo7QUFBQSxRQUVBLFFBQUEsRUFBVSxLQUFLLENBQUMsSUFGaEI7QUFBQSxRQUdBLEtBQUEsRUFBTyxLQUhQO09BREYsQ0FBQTthQUtBLFFBTmdCO0lBQUEsQ0FwRmxCLENBQUE7O0FBQUEseUJBNkZBLE1BQUEsR0FBUSxTQUFDLEdBQUQsR0FBQTthQUNOLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFpQixjQUFBLEdBQWMsR0FBL0IsRUFETTtJQUFBLENBN0ZSLENBQUE7O0FBQUEseUJBaUdBLE9BQUEsR0FBUyxTQUFDLFdBQUQsR0FBQTtBQUNQLFVBQUEsNkRBQUE7QUFBQSxNQUFBLGlCQUFBLEdBQW9CLElBQUMsQ0FBQSxXQUFELENBQWEsSUFBSSxDQUFDLE9BQUwsQ0FBYSxXQUFiLENBQWIsQ0FBcEIsQ0FBQTtBQUFBLE1BQ0EsU0FBQSxHQUFZLENBQUMsSUFBQyxDQUFBLE1BQUQsQ0FBUSxXQUFSLENBQUQsQ0FBcUIsQ0FBQyxJQUF0QixDQUFBLENBRFosQ0FBQTtBQUFBLE1BRUEsU0FBQTtBQUFZLGdCQUFPLElBQUMsQ0FBQSxNQUFELENBQVEsZ0JBQVIsQ0FBUDtBQUFBLGVBQ0wsSUFESzttQkFDSyxDQUFDLE9BQUQsRUFBVSxNQUFWLEVBQWtCLElBQWxCLEVBQXdCLFVBQXhCLEVBQW9DLFNBQXBDLEVBQStDLE9BQS9DLEVBREw7QUFBQTttQkFFTCxDQUFDLElBQUQsRUFBTyxVQUFQLEVBQW1CLFNBQW5CLEVBQThCLE9BQTlCLEVBRks7QUFBQTttQkFGWixDQUFBO0FBQUEsTUFLQSxTQUFBLEdBQVksQ0FBQyxJQUFDLENBQUEsTUFBRCxDQUFRLFdBQVIsQ0FBRCxDQUFxQixDQUFDLElBQXRCLENBQUEsQ0FMWixDQUFBO0FBQUEsTUFNQSxTQUFBO0FBQVksZ0JBQU8sSUFBQyxDQUFBLE1BQUQsQ0FBUSxjQUFSLENBQVA7QUFBQSxlQUNMLE9BREs7bUJBQ1EsQ0FBQyxPQUFELEVBRFI7QUFBQSxlQUVMLE1BRks7bUJBRU8sQ0FBQyxNQUFELEVBQVMsVUFBVCxFQUZQO0FBQUEsZUFHTCxPQUhLO21CQUdRLENBQUMsT0FBRCxFQUFVLFlBQVYsRUFBd0IsU0FBeEIsRUFBbUMsT0FBbkMsRUFIUjtBQUFBLGVBSUwsUUFKSzttQkFJUyxDQUFDLFFBQUQsRUFKVDtBQUFBO21CQUtMLENBQUMsT0FBRCxFQUxLO0FBQUE7bUJBTlosQ0FBQTtBQWFBLE1BQUEsSUFBRyxDQUFBLElBQUssQ0FBQSxNQUFELENBQVEsVUFBUixDQUFKLElBQTJCLENBQUEsaUJBQTlCO0FBQ0UsUUFBQSxJQUFDLENBQUEsR0FBRCxHQUFPLENBQUMsU0FBRCxDQUNMLENBQUMsTUFESSxDQUNHLFNBREgsQ0FBUCxDQUFBO0FBRUEsUUFBQSxJQUFHLGlCQUFIO0FBQ0UsVUFBQSxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxJQUFWLENBQUEsQ0FBQTtBQUFBLFVBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxJQUFMLENBQVUsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFJLENBQUMsT0FBTCxDQUFhLGlCQUFiLENBQVYsRUFBMkMsSUFBQyxDQUFBLGtCQUE1QyxDQUFWLENBREEsQ0FERjtTQUZBO0FBS0EsZUFBTyxXQUFQLENBTkY7T0FBQSxNQUFBO0FBUUUsUUFBQSxJQUFDLENBQUEsR0FBRCxHQUFPLElBQUMsQ0FBQSxjQUFELENBQWdCLFNBQWhCLENBQ0wsQ0FBQyxNQURJLENBQ0csU0FESCxDQUVMLENBQUMsTUFGSSxDQUVHLENBQUMsSUFBRCxFQUFPLElBQUMsQ0FBQSxNQUFELENBQVEsWUFBUixDQUFQLEVBQThCLGlCQUE5QixDQUZILENBQVAsQ0FBQTtBQUdBLGVBQU8saUJBQVAsQ0FYRjtPQWRPO0lBQUEsQ0FqR1QsQ0FBQTs7QUFBQSx5QkE2SEEsV0FBQSxHQUFhLFNBQUMsTUFBRCxHQUFBO0FBQ1gsVUFBQSwwQ0FBQTtBQUFBLE1BQUEsUUFBQSxHQUFjLE1BQU0sQ0FBQyxJQUFQLENBQVksT0FBTyxDQUFDLFFBQXBCLENBQUgsR0FBcUMsUUFBckMsR0FBbUQsTUFBOUQsQ0FBQTtBQUFBLE1BQ0EscUJBQUEsR0FBd0IsSUFBQyxDQUFBLE1BQUQsQ0FBUSx1QkFBUixDQUR4QixDQUFBO0FBQUEsTUFFQSxTQUFBLEdBQVksSUFBSSxDQUFDLE9BQUwsQ0FBYSxNQUFiLENBRlosQ0FBQTtBQUdBLGFBQUEsSUFBQSxHQUFBO0FBQ0UsUUFBQSxJQUFxRCxFQUFFLENBQUMsVUFBSCxDQUFjLElBQUksQ0FBQyxJQUFMLENBQVUsU0FBVixFQUFxQixxQkFBckIsQ0FBZCxDQUFyRDtBQUFBLGlCQUFPLElBQUksQ0FBQyxJQUFMLENBQVUsU0FBVixFQUFxQixxQkFBckIsQ0FBUCxDQUFBO1NBQUE7QUFDQSxRQUFBLElBQVMsUUFBUSxDQUFDLElBQVQsQ0FBYyxTQUFkLENBQVQ7QUFBQSxnQkFBQTtTQURBO0FBQUEsUUFFQSxTQUFBLEdBQVksSUFBSSxDQUFDLE9BQUwsQ0FBYSxJQUFJLENBQUMsSUFBTCxDQUFVLFNBQVYsRUFBcUIsSUFBckIsQ0FBYixDQUZaLENBREY7TUFBQSxDQUhBO0FBT0EsYUFBTyxLQUFQLENBUlc7SUFBQSxDQTdIYixDQUFBOztBQUFBLHlCQXdJQyxjQUFBLEdBQWdCLFNBQUMsU0FBRCxHQUFBO0FBQ2QsTUFBQSxJQUFHLENBQUMsSUFBQyxDQUFBLE1BQUQsQ0FBUSxjQUFSLENBQUQsQ0FBQSxLQUE0QixRQUE1QixJQUF5QyxJQUFDLENBQUEsdUJBQUQsQ0FBQSxDQUE1QztBQUNFLGVBQU8sQ0FBQyxXQUFELEVBQWEsS0FBYixFQUFvQixTQUFwQixFQUErQixPQUEvQixDQUFQLENBREY7T0FBQSxNQUFBO0FBR0UsZUFBTyxDQUFDLFNBQUQsQ0FBUCxDQUhGO09BRGM7SUFBQSxDQXhJakIsQ0FBQTs7QUFBQSx5QkE4SUMsdUJBQUEsR0FBeUIsU0FBQSxHQUFBO0FBQ3ZCLFVBQUEsTUFBQTtBQUFBO0FBQ0UsUUFBQSxNQUFBLEdBQVMsS0FBSyxDQUFDLFFBQU4sQ0FBZSxxQkFBZixDQUFULENBQUE7QUFDQSxlQUFPLE1BQU0sQ0FBQyxNQUFQLEtBQWlCLENBQXhCLENBRkY7T0FBQSxjQUFBO0FBSUUsZUFBTyxLQUFQLENBSkY7T0FEdUI7SUFBQSxDQTlJMUIsQ0FBQTs7c0JBQUE7O01BUkYsQ0FBQTs7QUFBQSxFQTZKQSxNQUFNLENBQUMsT0FBUCxHQUFpQixVQTdKakIsQ0FBQTtBQUFBIgp9

//# sourceURL=/home/takaaki/.atom/packages/linter-rust/lib/linter-rust.coffee
