Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.provideBuilder = provideBuilder;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

// Transfer existing settings from previous versions of the package
'use babel';

if (atom.config.get('build-cargo.cargoCheck')) {
  atom.config.set('build-cargo.extCommands.cargoCheck', true);
}
if (atom.config.get('build-cargo.cargoClippy')) {
  atom.config.set('build-cargo.extCommands.cargoClippy', true);
}
// Remove old settings
atom.config.unset('build-cargo.cargoCheck');
atom.config.unset('build-cargo.cargoClippy');

var config = {
  cargoPath: {
    title: 'Path to the Cargo executable',
    type: 'string',
    'default': 'cargo',
    order: 1
  },
  multiCrateProjects: {
    title: 'Enable multi-crate projects support',
    description: 'Build internal crates separately based on the current open file.',
    type: 'boolean',
    'default': false,
    order: 2
  },
  verbose: {
    title: 'Verbose Cargo output',
    description: 'Pass the --verbose flag to Cargo.',
    type: 'boolean',
    'default': false,
    order: 3
  },
  showBacktrace: {
    title: 'Show backtrace information',
    description: 'Set environment variable RUST_BACKTRACE=1.',
    type: 'boolean',
    'default': false,
    order: 4
  },
  jsonErrors: {
    title: 'Use json errors format',
    description: 'Instead of using regex to parse the human readable output (requires rustc version 1.7)\nNote: this is an unstable feature of the Rust compiler and prone to change and break frequently.',
    type: 'boolean',
    'default': false,
    order: 5
  },
  openDocs: {
    title: 'Open documentation in browser after \'doc\' target is built',
    type: 'boolean',
    'default': false,
    order: 6
  },
  extCommands: {
    title: 'Extended Commands',
    type: 'object',
    order: 7,
    properties: {
      cargoCheck: {
        title: 'Enable cargo check',
        description: 'Enable the `cargo check` Cargo command. Only use this if you have `cargo check` installed.',
        type: 'boolean',
        'default': false,
        order: 1
      },
      cargoClippy: {
        title: 'Enable cargo clippy',
        description: 'Enable the `cargo clippy` Cargo command to run Clippy\'s lints. Only use this if you have the `cargo clippy` package installed.',
        type: 'boolean',
        'default': false,
        order: 2
      }
    }
  }
};

exports.config = config;

function provideBuilder() {
  return (function () {
    function CargoBuildProvider(cwd) {
      _classCallCheck(this, CargoBuildProvider);

      this.cwd = cwd;
    }

    _createClass(CargoBuildProvider, [{
      key: 'getNiceName',
      value: function getNiceName() {
        return 'Cargo';
      }
    }, {
      key: 'isEligible',
      value: function isEligible() {
        return _fs2['default'].existsSync(this.cwd + '/Cargo.toml');
      }
    }, {
      key: 'settings',
      value: function settings() {
        var path = require('path');

        // Constants to detect links to Rust's source code and make them followable
        var unixRustSrcPrefix = '../src/';
        var windowsRustSrcPrefix = '..\\src\\';
        var rustSrcPrefixLen = unixRustSrcPrefix.length; // Equal for both unix and windows
        var rustSrcPath = process.env.RUST_SRC_PATH;

        var buildWorkDir = undefined; // The last build workding directory (might differ from the project root for multi-crate projects)
        var panicsCounter = 0; // Counts all panics
        var panicsLimit = 10; // Max number of panics to show at once

        function level2severity(level) {
          switch (level) {
            case 'warning':
              return 'warning';
            case 'error':
              return 'error';
            case 'note':
              return 'info';
            case 'help':
              return 'info';
            default:
              return 'error';
          }
        }

        function level2type(level) {
          return level.charAt(0).toUpperCase() + level.slice(1);
        }

        // Checks if the given file path returned by rustc or cargo points to the Rust source code
        function isRustSourceLink(filePath) {
          var prefix = filePath.substring(0, rustSrcPrefixLen);
          return prefix === unixRustSrcPrefix || prefix === windowsRustSrcPrefix;
        }

        // Checks if a file pointed by a message relates to the Rust source code
        // (has one of the predefined prefixes) and corrects it if needed and if possible
        function normalizePath(filePath) {
          if (rustSrcPath && isRustSourceLink(filePath)) {
            // Combine RUST_SRC_PATH with what follows after the prefix
            // Subtract 1 to preserve the original delimiter
            return rustSrcPath + filePath.substring(rustSrcPrefixLen - 1);
          }
          return filePath;
        }

        // Parses json output
        function parseJsonOutput(line, messages) {
          var json = JSON.parse(line);
          var trace = [];
          json.spans.forEach(function (span) {
            trace.push({
              message: span.label,
              file: span.file_name,
              line: span.line_start,
              line_end: span.line_end,
              col: span.column_start,
              col_end: span.column_end,
              type: level2type('note'),
              severity: level2severity('note')
            });
          });
          if (json.code) {
            trace.push({
              message: json.code.explanation,
              type: 'Explanation',
              severity: 'info'
            });
          }
          json.spans.forEach(function (span) {
            messages.push({
              message: json.message,
              file: span.file_name,
              line: span.line_start,
              line_end: span.line_end,
              col: span.column_start,
              col_end: span.column_end,
              type: level2type(json.level),
              severity: level2severity(json.level),
              trace: trace
            });
          });
        }

        // Shows panic info
        function showPanic(panic) {
          // Only add link if we have panic.filePath, otherwise it's an external link
          atom.notifications.addError('A thread panicked at ' + (panic.filePath ? '<a id="' + panic.id + '" href="#">' : '') + 'line ' + panic.line + ' in ' + panic.file + (panic.filePath ? '</a>' : ''), {
            detail: panic.message,
            stack: panic.stack,
            dismissable: true
          });
          if (panic.filePath) {
            var link = document.getElementById(panic.id);
            if (link) {
              link.panic = panic;
              link.addEventListener('click', function (e) {
                atom.workspace.open(e.target.panic.filePath, {
                  searchAllPanes: true,
                  initialLine: e.target.panic.line - 1
                });
              });
            }
          }
        }

        // Tries to parse a stack trace. Returns the quantity of actually parsed lines.
        function tryParseStackTrace(lines, i, panic) {
          var parsedQty = 0;
          var line = lines[i];
          if (line.substring(0, 16) === 'stack backtrace:') {
            parsedQty += 1;
            var panicLines = [];
            for (var j = i + 1; j < lines.length; j++) {
              line = lines[j];
              var matchFunc = /^\s+(\d+):\s+(0x[a-f0-9]+) - (.+)$/g.exec(line);
              if (matchFunc) {
                // A line with a function call
                panicLines.push(line);
              } else {
                var matchLink = /(at (.+):(\d+))$/g.exec(line);
                if (matchLink) {
                  // A line with a file link
                  if (!panic.file && !isRustSourceLink(matchLink[2])) {
                    panic.file = matchLink[2]; // Found a link to our source code
                    panic.line = matchLink[3];
                  }
                  panicLines.push('  ' + matchLink[1]); // less leading spaces
                } else {
                    // Stack trace has ended
                    break;
                  }
              }
              parsedQty += 1;
            }
            panic.stack = panicLines.join('\n');
          }
          return parsedQty;
        }

        // Tries to parse a panic and its stack trace. Returns the quantity of actually
        // parsed lines.
        function tryParsePanic(lines, i, show) {
          var line = lines[i];
          var match = /(thread '.+' panicked at '.+'), ([^\/][^\:]+):(\d+)/g.exec(line);
          var parsedQty = 0;
          if (match) {
            parsedQty = 1;
            var panic = {
              id: 'build-cargo-panic-' + ++panicsCounter, // Unique panic ID
              message: match[1],
              file: isRustSourceLink(match[2]) ? undefined : match[2],
              filePath: undefined,
              line: parseInt(match[3], 10),
              stack: undefined
            };
            parsedQty = 1 + tryParseStackTrace(lines, i + 1, panic);
            if (panic.file) {
              panic.filePath = path.isAbsolute(panic.file) ? panic.file : path.join(buildWorkDir, panic.file);
            } else {
              panic.file = match[2]; // We failed to find a link to our source code, use Rust's
            }
            if (show) {
              showPanic(panic);
            }
          }
          return parsedQty;
        }

        function matchFunction(output) {
          var useJson = atom.config.get('build-cargo.jsonErrors');
          var messages = []; // resulting collection of high-level messages
          var msg = null; // current high-level message (error, warning or panic)
          var sub = null; // current submessage (note or help)
          var panicsN = 0; // quantity of panics in this output
          var lines = output.split(/\n/);
          for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            // Cargo final error messages start with 'error:', skip them
            if (line === null || line === '' || line.substring(0, 6) === 'error:') {
              msg = null;
              sub = null;
            } else if (useJson && line[0] === '{') {
              // Parse a JSON block
              parseJsonOutput(line, messages);
            } else {
              // Check for compilation messages
              var match = /^(.+.rs):(\d+):(\d+):(?: (\d+):(\d+))? (error|warning|help|note): (.*)/g.exec(line);
              if (match) {
                var level = match[6];
                var message = match[7];
                if (level === 'error' || level === 'warning' || msg === null) {
                  msg = {
                    message: message,
                    file: normalizePath(match[1]),
                    line: match[2],
                    line_end: match[4],
                    col: match[3],
                    col_end: match[5],
                    type: level2type(level),
                    severity: level2severity(level),
                    trace: []
                  };
                  messages.push(msg);
                  sub = null;
                } else {
                  sub = {
                    message: message,
                    file: normalizePath(match[1]),
                    line: match[2],
                    line_end: match[4],
                    col: match[3],
                    col_end: match[5],
                    type: level2type(level),
                    severity: level2severity(level)
                  };
                  msg.trace.push(sub);
                }
              } else {
                // Check for panic
                var parsedQty = tryParsePanic(lines, i, panicsN < panicsLimit);
                if (parsedQty > 0) {
                  msg = null;
                  sub = null;
                  i += parsedQty - 1; // Subtract one because the current line is already counted
                  panicsN += 1;
                } else if (sub !== null) {
                  // Just a description in the current block. Only add it when in submessage
                  // because Linter does the job for high-level messages.
                  sub.message += '\n' + line;
                }
              }
            }
          }
          var hiddenPanicsN = panicsN - panicsLimit;
          if (hiddenPanicsN === 1) {
            atom.notifications.addError('One more panic is hidden', { dismissable: true });
          } else if (hiddenPanicsN > 1) {
            atom.notifications.addError(hiddenPanicsN + ' more panics are hidden', { dismissable: true });
          }
          return messages;
        }

        // Checks if the given object represents the root of the project or file system
        function isRoot(parts) {
          if (parts.dir === parts.root) {
            return true; // The file system root
          }
          return atom.project.getPaths().some(function (p) {
            return parts.dir === p;
          });
        }

        // Returns the closest directory with Cargo.toml in it.
        // If there's no such directory, returns undefined.
        function findCargoProjectDir(_x) {
          var _again = true;

          _function: while (_again) {
            var p = _x;
            _again = false;

            var parts = path.parse(p);
            var root = isRoot(parts);
            var cargoToml = path.format({
              dir: parts.dir,
              base: 'Cargo.toml'
            });
            try {
              if (_fs2['default'].statSync(cargoToml).isFile()) {
                return {
                  dir: parts.dir,
                  root: root
                };
              }
            } catch (e) {
              if (e.code !== 'ENOENT') {
                // No such file (Cargo.toml)
                throw e;
              }
            }
            if (root) {
              return undefined;
            }
            _x = parts.dir;
            _again = true;
            parts = root = cargoToml = undefined;
            continue _function;
          }
        }

        // This function is called before every build. It finds the closest
        // Cargo.toml file in the path and uses its directory as working.
        function prepareBuild(buildCfg) {
          // Common build command parameters
          buildCfg.exec = atom.config.get('build-cargo.cargoPath');
          buildCfg.env = {};
          if (atom.config.get('build-cargo.jsonErrors')) {
            buildCfg.env.RUSTFLAGS = '-Z unstable-options --error-format=json';
          }
          if (atom.config.get('build-cargo.showBacktrace')) {
            buildCfg.env.RUST_BACKTRACE = '1';
          }
          buildCfg.args = buildCfg.args || [];
          atom.config.get('build-cargo.verbose') && buildCfg.args.push('--verbose');

          // Substitute working directory if we are in a multi-crate environment
          if (atom.config.get('build-cargo.multiCrateProjects')) {
            var editor = atom.workspace.getActiveTextEditor();
            buildCfg.cwd = undefined;
            if (editor && editor.getPath()) {
              var wdInfo = findCargoProjectDir(editor.getPath());
              if (wdInfo) {
                if (!wdInfo.root) {
                  var p = path.parse(wdInfo.dir);
                  atom.notifications.addInfo('Building ' + p.base + '...');
                }
                buildCfg.cwd = wdInfo.dir;
              }
            }
          }
          if (!buildCfg.cwd && atom.project.getPaths().length > 0) {
            // Build in the root of the first path by default
            buildCfg.cwd = atom.project.getPaths()[0];
          }
          buildWorkDir = buildCfg.cwd;
        }

        var commands = [{
          name: 'Cargo: build (debug)',
          atomCommandName: 'cargo:build-debug',
          argsCfg: ['build']
        }, {
          name: 'Cargo: build (release)',
          atomCommandName: 'cargo:build-release',
          argsCfg: ['build', '--release']
        }, {
          name: 'Cargo: bench',
          atomCommandName: 'cargo:bench',
          argsCfg: ['bench']
        }, {
          name: 'Cargo: clean',
          atomCommandName: 'cargo:clean',
          argsCfg: ['clean']
        }, {
          name: 'Cargo: doc',
          atomCommandName: 'cargo:doc',
          argsCfg: ['doc'],
          preConfig: function preConfig() {
            atom.config.get('build-cargo.openDocs') && this.args.push('--open');
          }
        }, {
          name: 'Cargo: run (debug)',
          atomCommandName: 'cargo:run-debug',
          argsCfg: ['run']
        }, {
          name: 'Cargo: run (release)',
          atomCommandName: 'cargo:run-release',
          argsCfg: ['run', '--release']
        }, {
          name: 'Cargo: test',
          atomCommandName: 'cargo:run-test',
          argsCfg: ['test']
        }, {
          name: 'Cargo: update',
          atomCommandName: 'cargo:update',
          argsCfg: ['update']
        }, {
          name: 'Cargo: build example',
          atomCommandName: 'cargo:build-example',
          argsCfg: ['build', '--example', '{FILE_ACTIVE_NAME_BASE}']
        }, {
          name: 'Cargo: run example',
          atomCommandName: 'cargo:run-example',
          argsCfg: ['run', '--example', '{FILE_ACTIVE_NAME_BASE}']
        }, {
          name: 'Cargo: run bin',
          atomCommandName: 'cargo:run-bin',
          argsCfg: ['run', '--bin', '{FILE_ACTIVE_NAME_BASE}']
        }];

        if (atom.config.get('build-cargo.extCommands.cargoClippy')) {
          commands.push({
            name: 'Cargo: Clippy',
            atomCommandName: 'cargo:clippy',
            argsCfg: ['clippy']
          });
        }

        if (atom.config.get('build-cargo.extCommands.cargoCheck')) {
          commands.push({
            name: 'Cargo: check',
            atomCommandName: 'cargo:check',
            argsCfg: ['check']
          });
        }

        commands.forEach(function (cmd) {
          cmd.exec = atom.config.get('build-cargo.cargoPath');
          cmd.sh = false;
          cmd.functionMatch = matchFunction;
          cmd.preBuild = function () {
            this.args = this.argsCfg.slice(0); // Clone initial arguments
            if (this.preConfig) {
              this.preConfig(); // Allow the command to configure its arguments
            }
            prepareBuild(this);
          };
        });

        return commands;
      }
    }]);

    return CargoBuildProvider;
  })();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvYnVpbGQtY2FyZ28vbGliL2NhcmdvLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztrQkFFZSxJQUFJOzs7OztBQUZuQixXQUFXLENBQUM7O0FBS1osSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxFQUFFO0FBQzdDLE1BQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLG9DQUFvQyxFQUFFLElBQUksQ0FBQyxDQUFDO0NBQzdEO0FBQ0QsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxFQUFFO0FBQzlDLE1BQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHFDQUFxQyxFQUFFLElBQUksQ0FBQyxDQUFDO0NBQzlEOztBQUVELElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLHdCQUF3QixDQUFDLENBQUM7QUFDNUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQzs7QUFFdEMsSUFBTSxNQUFNLEdBQUc7QUFDcEIsV0FBUyxFQUFFO0FBQ1QsU0FBSyxFQUFFLDhCQUE4QjtBQUNyQyxRQUFJLEVBQUUsUUFBUTtBQUNkLGVBQVMsT0FBTztBQUNoQixTQUFLLEVBQUUsQ0FBQztHQUNUO0FBQ0Qsb0JBQWtCLEVBQUU7QUFDbEIsU0FBSyxFQUFFLHFDQUFxQztBQUM1QyxlQUFXLEVBQUUsa0VBQWtFO0FBQy9FLFFBQUksRUFBRSxTQUFTO0FBQ2YsZUFBUyxLQUFLO0FBQ2QsU0FBSyxFQUFFLENBQUM7R0FDVDtBQUNELFNBQU8sRUFBRTtBQUNQLFNBQUssRUFBRSxzQkFBc0I7QUFDN0IsZUFBVyxFQUFFLG1DQUFtQztBQUNoRCxRQUFJLEVBQUUsU0FBUztBQUNmLGVBQVMsS0FBSztBQUNkLFNBQUssRUFBRSxDQUFDO0dBQ1Q7QUFDRCxlQUFhLEVBQUU7QUFDYixTQUFLLEVB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LENBQUMsR0FBRyxDQUFDLHFDQUFxQyxDQUFDLEVBQUU7QUFDMUQsa0JBQVEsQ0FBQyxJQUFJLENBQUM7QUFDWixnQkFBSSxFQUFFLGVBQWU7QUFDckIsMkJBQWUsRUFBRSxjQUFjO0FBQy9CLG1CQUFPLEVBQUUsQ0FBRSxRQUFRLENBQUU7V0FDdEIsQ0FBQyxDQUFDO1NBQ0o7O0FBRUQsWUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxvQ0FBb0MsQ0FBQyxFQUFFO0FBQ3pELGtCQUFRLENBQUMsSUFBSSxDQUFDO0FBQ1osZ0JBQUksRUFBRSxjQUFjO0FBQ3BCLDJCQUFlLEVBQUUsYUFBYTtBQUM5QixtQkFBTyxFQUFFLENBQUUsT0FBTyxDQUFFO1dBQ3JCLENBQUMsQ0FBQztTQUNKOztBQUVELGdCQUFRLENBQUMsT0FBTyxDQUFDLFVBQUEsR0FBRyxFQUFJO0FBQ3RCLGFBQUcsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsQ0FBQztBQUNwRCxhQUFHLENBQUMsRUFBRSxHQUFHLEtBQUssQ0FBQztBQUNmLGFBQUcsQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO0FBQ2xDLGFBQUcsQ0FBQyxRQUFRLEdBQUcsWUFBWTtBQUN6QixnQkFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsQyxnQkFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO0FBQ2xCLGtCQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7YUFDbEI7QUFDRCx3QkFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1dBQ3BCLENBQUM7U0FDSCxDQUFDLENBQUM7O0FBRUgsZUFBTyxRQUFRLENBQUM7T0FDakI7OztXQTVhVSxrQkFBa0I7T0E2YTdCO0NBQ0giLCJmaWxlIjoiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9idWlsZC1jYXJnby9saWIvY2FyZ28uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IGZzIGZyb20gJ2ZzJztcblxuLy8gVHJhbnNmZXIgZXhpc3Rpbmcgc2V0dGluZ3MgZnJvbSBwcmV2aW91cyB2ZXJzaW9ucyBvZiB0aGUgcGFja2FnZVxuaWYgKGF0b20uY29uZmlnLmdldCgnYnVpbGQtY2FyZ28uY2FyZ29DaGVjaycpKSB7XG4gIGF0b20uY29uZmlnLnNldCgnYnVpbGQtY2FyZ28uZXh0Q29tbWFuZHMuY2FyZ29DaGVjaycsIHRydWUpO1xufVxuaWYgKGF0b20uY29uZmlnLmdldCgnYnVpbGQtY2FyZ28uY2FyZ29DbGlwcHknKSkge1xuICBhdG9tLmNvbmZpZy5zZXQoJ2J1aWxkLWNhcmdvLmV4dENvbW1hbmRzLmNhcmdvQ2xpcHB5JywgdHJ1ZSk7XG59XG4vLyBSZW1vdmUgb2xkIHNldHRpbmdzXG5hdG9tLmNvbmZpZy51bnNldCgnYnVpbGQtY2FyZ28uY2FyZ29DaGVjaycpO1xuYXRvbS5jb25maWcudW5zZXQoJ2J1aWxkLWNhcmdvLmNhcmdvQ2xpcHB5Jyk7XG5cbmV4cG9ydCBjb25zdCBjb25maWcgPSB7XG4gIGNhcmdvUGF0aDoge1xuICAgIHRpdGxlOiAnUGF0aCB0byB0aGUgQ2FyZ28gZXhlY3V0YWJsZScsXG4gICAgdHlwZTogJ3N0cmluZycsXG4gICAgZGVmYXVsdDogJ2NhcmdvJyxcbiAgICBvcmRlcjogMVxuICB9LFxuICBtdWx0aUNyYXRlUHJvamVjdHM6IHtcbiAgICB0aXRsZTogJ0VuYWJsZSBtdWx0aS1jcmF0ZSBwcm9qZWN0cyBzdXBwb3J0JyxcbiAgICBkZXNjcmlwdGlvbjogJ0J1aWxkIGludGVybmFsIGNyYXRlcyBzZXBhcmF0ZWx5IGJhc2VkIG9uIHRoZSBjdXJyZW50IG9wZW4gZmlsZS4nLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICBvcmRlcjogMlxuICB9LFxuICB2ZXJib3NlOiB7XG4gICAgdGl0bGU6ICdWZXJib3NlIENhcmdvIG91dHB1dCcsXG4gICAgZGVzY3JpcHRpb246ICdQYXNzIHRoZSAtLXZlcmJvc2UgZmxhZyB0byBDYXJnby4nLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICBvcmRlcjogM1xuICB9LFxuICBzaG93QmFja3RyYWNlOiB7XG4gICAgdGl0bGU6ICdTaG93IGJhY2t0cmFjZSBpbmZvcm1hdGlvbicsXG4gICAgZGVzY3JpcHRpb246ICdTZXQgZW52aXJvbm1lbnQgdmFyaWFibGUgUlVTVF9CQUNLVFJBQ0U9MS4nLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICBvcmRlcjogNFxuICB9LFxuICBqc29uRXJyb3JzOiB7XG4gICAgdGl0bGU6ICdVc2UganNvbiBlcnJvcnMgZm9ybWF0JyxcbiAgICBkZXNjcmlwdGlvbjogJ0luc3RlYWQgb2YgdXNpbmcgcmVnZXggdG8gcGFyc2UgdGhlIGh1bWFuIHJlYWRhYmxlIG91dHB1dCAocmVxdWlyZXMgcnVzdGMgdmVyc2lvbiAxLjcpXFxuTm90ZTogdGhpcyBpcyBhbiB1bnN0YWJsZSBmZWF0dXJlIG9mIHRoZSBSdXN0IGNvbXBpbGVyIGFuZCBwcm9uZSB0byBjaGFuZ2UgYW5kIGJyZWFrIGZyZXF1ZW50bHkuJyxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgb3JkZXI6IDVcbiAgfSxcbiAgb3BlbkRvY3M6IHtcbiAgICB0aXRsZTogJ09wZW4gZG9jdW1lbnRhdGlvbiBpbiBicm93c2VyIGFmdGVyIFxcJ2RvY1xcJyB0YXJnZXQgaXMgYnVpbHQnLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICBvcmRlcjogNlxuICB9LFxuICBleHRDb21tYW5kczoge1xuICAgIHRpdGxlOiAnRXh0ZW5kZWQgQ29tbWFuZHMnLFxuICAgIHR5cGU6ICdvYmplY3QnLFxuICAgIG9yZGVyOiA3LFxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgIGNhcmdvQ2hlY2s6IHtcbiAgICAgICAgdGl0bGU6ICdFbmFibGUgY2FyZ28gY2hlY2snLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0VuYWJsZSB0aGUgYGNhcmdvIGNoZWNrYCBDYXJnbyBjb21tYW5kLiBPbmx5IHVzZSB0aGlzIGlmIHlvdSBoYXZlIGBjYXJnbyBjaGVja2AgaW5zdGFsbGVkLicsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIG9yZGVyOiAxXG4gICAgICB9LFxuICAgICAgY2FyZ29DbGlwcHk6IHtcbiAgICAgICAgdGl0bGU6ICdFbmFibGUgY2FyZ28gY2xpcHB5JyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdFbmFibGUgdGhlIGBjYXJnbyBjbGlwcHlgIENhcmdvIGNvbW1hbmQgdG8gcnVuIENsaXBweVxcJ3MgbGludHMuIE9ubHkgdXNlIHRoaXMgaWYgeW91IGhhdmUgdGhlIGBjYXJnbyBjbGlwcHlgIHBhY2thZ2UgaW5zdGFsbGVkLicsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIG9yZGVyOiAyXG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZUJ1aWxkZXIoKSB7XG4gIHJldHVybiBjbGFzcyBDYXJnb0J1aWxkUHJvdmlkZXIge1xuICAgIGNvbnN0cnVjdG9yKGN3ZCkge1xuICAgICAgdGhpcy5jd2QgPSBjd2Q7XG4gICAgfVxuXG4gICAgZ2V0TmljZU5hbWUoKSB7XG4gICAgICByZXR1cm4gJ0NhcmdvJztcbiAgICB9XG5cbiAgICBpc0VsaWdpYmxlKCkge1xuICAgICAgcmV0dXJuIGZzLmV4aXN0c1N5bmMoYCR7dGhpcy5jd2R9L0NhcmdvLnRvbWxgKTtcbiAgICB9XG5cbiAgICBzZXR0aW5ncygpIHtcbiAgICAgIGNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5cbiAgICAgIC8vIENvbnN0YW50cyB0byBkZXRlY3QgbGlua3MgdG8gUnVzdCdzIHNvdXJjZSBjb2RlIGFuZCBtYWtlIHRoZW0gZm9sbG93YWJsZVxuICAgICAgY29uc3QgdW5peFJ1c3RTcmNQcmVmaXggPSAnLi4vc3JjLyc7XG4gICAgICBjb25zdCB3aW5kb3dzUnVzdFNyY1ByZWZpeCA9ICcuLlxcXFxzcmNcXFxcJztcbiAgICAgIGNvbnN0IHJ1c3RTcmNQcmVmaXhMZW4gPSB1bml4UnVzdFNyY1ByZWZpeC5sZW5ndGg7ICAvLyBFcXVhbCBmb3IgYm90aCB1bml4IGFuZCB3aW5kb3dzXG4gICAgICBjb25zdCBydXN0U3JjUGF0aCA9IHByb2Nlc3MuZW52LlJVU1RfU1JDX1BBVEg7XG5cbiAgICAgIGxldCBidWlsZFdvcmtEaXI7ICAgICAgICAvLyBUaGUgbGFzdCBidWlsZCB3b3JrZGluZyBkaXJlY3RvcnkgKG1pZ2h0IGRpZmZlciBmcm9tIHRoZSBwcm9qZWN0IHJvb3QgZm9yIG11bHRpLWNyYXRlIHByb2plY3RzKVxuICAgICAgbGV0IHBhbmljc0NvdW50ZXIgPSAwOyAgIC8vIENvdW50cyBhbGwgcGFuaWNzXG4gICAgICBjb25zdCBwYW5pY3NMaW1pdCA9IDEwOyAgLy8gTWF4IG51bWJlciBvZiBwYW5pY3MgdG8gc2hvdyBhdCBvbmNlXG5cbiAgICAgIGZ1bmN0aW9uIGxldmVsMnNldmVyaXR5KGxldmVsKSB7XG4gICAgICAgIHN3aXRjaCAobGV2ZWwpIHtcbiAgICAgICAgICBjYXNlICd3YXJuaW5nJzogcmV0dXJuICd3YXJuaW5nJztcbiAgICAgICAgICBjYXNlICdlcnJvcic6IHJldHVybiAnZXJyb3InO1xuICAgICAgICAgIGNhc2UgJ25vdGUnOiByZXR1cm4gJ2luZm8nO1xuICAgICAgICAgIGNhc2UgJ2hlbHAnOiByZXR1cm4gJ2luZm8nO1xuICAgICAgICAgIGRlZmF1bHQ6IHJldHVybiAnZXJyb3InO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGxldmVsMnR5cGUobGV2ZWwpIHtcbiAgICAgICAgcmV0dXJuIGxldmVsLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgbGV2ZWwuc2xpY2UoMSk7XG4gICAgICB9XG5cbiAgICAgIC8vIENoZWNrcyBpZiB0aGUgZ2l2ZW4gZmlsZSBwYXRoIHJldHVybmVkIGJ5IHJ1c3RjIG9yIGNhcmdvIHBvaW50cyB0byB0aGUgUnVzdCBzb3VyY2UgY29kZVxuICAgICAgZnVuY3Rpb24gaXNSdXN0U291cmNlTGluayhmaWxlUGF0aCkge1xuICAgICAgICBjb25zdCBwcmVmaXggPSBmaWxlUGF0aC5zdWJzdHJpbmcoMCwgcnVzdFNyY1ByZWZpeExlbik7XG4gICAgICAgIHJldHVybiBwcmVmaXggPT09IHVuaXhSdXN0U3JjUHJlZml4IHx8IHByZWZpeCA9PT0gd2luZG93c1J1c3RTcmNQcmVmaXg7XG4gICAgICB9XG5cbiAgICAgIC8vIENoZWNrcyBpZiBhIGZpbGUgcG9pbnRlZCBieSBhIG1lc3NhZ2UgcmVsYXRlcyB0byB0aGUgUnVzdCBzb3VyY2UgY29kZVxuICAgICAgLy8gKGhhcyBvbmUgb2YgdGhlIHByZWRlZmluZWQgcHJlZml4ZXMpIGFuZCBjb3JyZWN0cyBpdCBpZiBuZWVkZWQgYW5kIGlmIHBvc3NpYmxlXG4gICAgICBmdW5jdGlvbiBub3JtYWxpemVQYXRoKGZpbGVQYXRoKSB7XG4gICAgICAgIGlmIChydXN0U3JjUGF0aCAmJiBpc1J1c3RTb3VyY2VMaW5rKGZpbGVQYXRoKSkge1xuICAgICAgICAgIC8vIENvbWJpbmUgUlVTVF9TUkNfUEFUSCB3aXRoIHdoYXQgZm9sbG93cyBhZnRlciB0aGUgcHJlZml4XG4gICAgICAgICAgLy8gU3VidHJhY3QgMSB0byBwcmVzZXJ2ZSB0aGUgb3JpZ2luYWwgZGVsaW1pdGVyXG4gICAgICAgICAgcmV0dXJuIHJ1c3RTcmNQYXRoICsgZmlsZVBhdGguc3Vic3RyaW5nKHJ1c3RTcmNQcmVmaXhMZW4gLSAxKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmlsZVBhdGg7XG4gICAgICB9XG5cbiAgICAgIC8vIFBhcnNlcyBqc29uIG91dHB1dFxuICAgICAgZnVuY3Rpb24gcGFyc2VKc29uT3V0cHV0KGxpbmUsIG1lc3NhZ2VzKSB7XG4gICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnBhcnNlKGxpbmUpO1xuICAgICAgICBjb25zdCB0cmFjZSA9IFtdO1xuICAgICAgICBqc29uLnNwYW5zLmZvckVhY2goc3BhbiA9PiB7XG4gICAgICAgICAgdHJhY2UucHVzaCh7XG4gICAgICAgICAgICBtZXNzYWdlOiBzcGFuLmxhYmVsLFxuICAgICAgICAgICAgZmlsZTogc3Bhbi5maWxlX25hbWUsXG4gICAgICAgICAgICBsaW5lOiBzcGFuLmxpbmVfc3RhcnQsXG4gICAgICAgICAgICBsaW5lX2VuZDogc3Bhbi5saW5lX2VuZCxcbiAgICAgICAgICAgIGNvbDogc3Bhbi5jb2x1bW5fc3RhcnQsXG4gICAgICAgICAgICBjb2xfZW5kOiBzcGFuLmNvbHVtbl9lbmQsXG4gICAgICAgICAgICB0eXBlOiBsZXZlbDJ0eXBlKCdub3RlJyksXG4gICAgICAgICAgICBzZXZlcml0eTogbGV2ZWwyc2V2ZXJpdHkoJ25vdGUnKVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGpzb24uY29kZSkge1xuICAgICAgICAgIHRyYWNlLnB1c2goe1xuICAgICAgICAgICAgbWVzc2FnZToganNvbi5jb2RlLmV4cGxhbmF0aW9uLFxuICAgICAgICAgICAgdHlwZTogJ0V4cGxhbmF0aW9uJyxcbiAgICAgICAgICAgIHNldmVyaXR5OiAnaW5mbydcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBqc29uLnNwYW5zLmZvckVhY2goc3BhbiA9PiB7XG4gICAgICAgICAgbWVzc2FnZXMucHVzaCh7XG4gICAgICAgICAgICBtZXNzYWdlOiBqc29uLm1lc3NhZ2UsXG4gICAgICAgICAgICBmaWxlOiBzcGFuLmZpbGVfbmFtZSxcbiAgICAgICAgICAgIGxpbmU6IHNwYW4ubGluZV9zdGFydCxcbiAgICAgICAgICAgIGxpbmVfZW5kOiBzcGFuLmxpbmVfZW5kLFxuICAgICAgICAgICAgY29sOiBzcGFuLmNvbHVtbl9zdGFydCxcbiAgICAgICAgICAgIGNvbF9lbmQ6IHNwYW4uY29sdW1uX2VuZCxcbiAgICAgICAgICAgIHR5cGU6IGxldmVsMnR5cGUoanNvbi5sZXZlbCksXG4gICAgICAgICAgICBzZXZlcml0eTogbGV2ZWwyc2V2ZXJpdHkoanNvbi5sZXZlbCksXG4gICAgICAgICAgICB0cmFjZTogdHJhY2VcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIFNob3dzIHBhbmljIGluZm9cbiAgICAgIGZ1bmN0aW9uIHNob3dQYW5pYyhwYW5pYykge1xuICAgICAgICAvLyBPbmx5IGFkZCBsaW5rIGlmIHdlIGhhdmUgcGFuaWMuZmlsZVBhdGgsIG90aGVyd2lzZSBpdCdzIGFuIGV4dGVybmFsIGxpbmtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKFxuICAgICAgICAgICdBIHRocmVhZCBwYW5pY2tlZCBhdCAnXG4gICAgICAgICAgICAgICsgKHBhbmljLmZpbGVQYXRoID8gJzxhIGlkPVwiJyArIHBhbmljLmlkICsgJ1wiIGhyZWY9XCIjXCI+JyA6ICcnKVxuICAgICAgICAgICAgICArICdsaW5lICcgKyBwYW5pYy5saW5lICsgJyBpbiAnICsgcGFuaWMuZmlsZVxuICAgICAgICAgICAgICArIChwYW5pYy5maWxlUGF0aCA/ICc8L2E+JyA6ICcnKSwge1xuICAgICAgICAgICAgICAgIGRldGFpbDogcGFuaWMubWVzc2FnZSxcbiAgICAgICAgICAgICAgICBzdGFjazogcGFuaWMuc3RhY2ssXG4gICAgICAgICAgICAgICAgZGlzbWlzc2FibGU6IHRydWVcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgIGlmIChwYW5pYy5maWxlUGF0aCkge1xuICAgICAgICAgIGNvbnN0IGxpbmsgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwYW5pYy5pZCk7XG4gICAgICAgICAgaWYgKGxpbmspIHtcbiAgICAgICAgICAgIGxpbmsucGFuaWMgPSBwYW5pYztcbiAgICAgICAgICAgIGxpbmsuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKGUudGFyZ2V0LnBhbmljLmZpbGVQYXRoLCB7XG4gICAgICAgICAgICAgICAgc2VhcmNoQWxsUGFuZXM6IHRydWUsXG4gICAgICAgICAgICAgICAgaW5pdGlhbExpbmU6IGUudGFyZ2V0LnBhbmljLmxpbmUgLSAxXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFRyaWVzIHRvIHBhcnNlIGEgc3RhY2sgdHJhY2UuIFJldHVybnMgdGhlIHF1YW50aXR5IG9mIGFjdHVhbGx5IHBhcnNlZCBsaW5lcy5cbiAgICAgIGZ1bmN0aW9uIHRyeVBhcnNlU3RhY2tUcmFjZShsaW5lcywgaSwgcGFuaWMpIHtcbiAgICAgICAgbGV0IHBhcnNlZFF0eSA9IDA7XG4gICAgICAgIGxldCBsaW5lID0gbGluZXNbaV07XG4gICAgICAgIGlmIChsaW5lLnN1YnN0cmluZygwLCAxNikgPT09ICdzdGFjayBiYWNrdHJhY2U6Jykge1xuICAgICAgICAgIHBhcnNlZFF0eSArPSAxO1xuICAgICAgICAgIGNvbnN0IHBhbmljTGluZXMgPSBbXTtcbiAgICAgICAgICBmb3IgKGxldCBqID0gaSArIDE7IGogPCBsaW5lcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgbGluZSA9IGxpbmVzW2pdO1xuICAgICAgICAgICAgY29uc3QgbWF0Y2hGdW5jID0gL15cXHMrKFxcZCspOlxccysoMHhbYS1mMC05XSspIC0gKC4rKSQvZy5leGVjKGxpbmUpO1xuICAgICAgICAgICAgaWYgKG1hdGNoRnVuYykge1xuICAgICAgICAgICAgICAvLyBBIGxpbmUgd2l0aCBhIGZ1bmN0aW9uIGNhbGxcbiAgICAgICAgICAgICAgcGFuaWNMaW5lcy5wdXNoKGxpbmUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY29uc3QgbWF0Y2hMaW5rID0gLyhhdCAoLispOihcXGQrKSkkL2cuZXhlYyhsaW5lKTtcbiAgICAgICAgICAgICAgaWYgKG1hdGNoTGluaykge1xuICAgICAgICAgICAgICAgIC8vIEEgbGluZSB3aXRoIGEgZmlsZSBsaW5rXG4gICAgICAgICAgICAgICAgaWYgKCFwYW5pYy5maWxlICYmICFpc1J1c3RTb3VyY2VMaW5rKG1hdGNoTGlua1syXSkpIHtcbiAgICAgICAgICAgICAgICAgIHBhbmljLmZpbGUgPSBtYXRjaExpbmtbMl07ICAgIC8vIEZvdW5kIGEgbGluayB0byBvdXIgc291cmNlIGNvZGVcbiAgICAgICAgICAgICAgICAgIHBhbmljLmxpbmUgPSBtYXRjaExpbmtbM107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHBhbmljTGluZXMucHVzaCgnICAnICsgbWF0Y2hMaW5rWzFdKTsgLy8gbGVzcyBsZWFkaW5nIHNwYWNlc1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFN0YWNrIHRyYWNlIGhhcyBlbmRlZFxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXJzZWRRdHkgKz0gMTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcGFuaWMuc3RhY2sgPSBwYW5pY0xpbmVzLmpvaW4oJ1xcbicpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwYXJzZWRRdHk7XG4gICAgICB9XG5cbiAgICAgIC8vIFRyaWVzIHRvIHBhcnNlIGEgcGFuaWMgYW5kIGl0cyBzdGFjayB0cmFjZS4gUmV0dXJucyB0aGUgcXVhbnRpdHkgb2YgYWN0dWFsbHlcbiAgICAgIC8vIHBhcnNlZCBsaW5lcy5cbiAgICAgIGZ1bmN0aW9uIHRyeVBhcnNlUGFuaWMobGluZXMsIGksIHNob3cpIHtcbiAgICAgICAgY29uc3QgbGluZSA9IGxpbmVzW2ldO1xuICAgICAgICBjb25zdCBtYXRjaCA9IC8odGhyZWFkICcuKycgcGFuaWNrZWQgYXQgJy4rJyksIChbXlxcL11bXlxcOl0rKTooXFxkKykvZy5leGVjKGxpbmUpO1xuICAgICAgICBsZXQgcGFyc2VkUXR5ID0gMDtcbiAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgcGFyc2VkUXR5ID0gMTtcbiAgICAgICAgICBjb25zdCBwYW5pYyA9IHtcbiAgICAgICAgICAgIGlkOiAnYnVpbGQtY2FyZ28tcGFuaWMtJyArICgrK3Bhbmljc0NvdW50ZXIpLCAvLyBVbmlxdWUgcGFuaWMgSURcbiAgICAgICAgICAgIG1lc3NhZ2U6IG1hdGNoWzFdLFxuICAgICAgICAgICAgZmlsZTogaXNSdXN0U291cmNlTGluayhtYXRjaFsyXSkgPyB1bmRlZmluZWQgOiBtYXRjaFsyXSxcbiAgICAgICAgICAgIGZpbGVQYXRoOiB1bmRlZmluZWQsXG4gICAgICAgICAgICBsaW5lOiBwYXJzZUludChtYXRjaFszXSwgMTApLFxuICAgICAgICAgICAgc3RhY2s6IHVuZGVmaW5lZFxuICAgICAgICAgIH07XG4gICAgICAgICAgcGFyc2VkUXR5ID0gMSArIHRyeVBhcnNlU3RhY2tUcmFjZShsaW5lcywgaSArIDEsIHBhbmljKTtcbiAgICAgICAgICBpZiAocGFuaWMuZmlsZSkge1xuICAgICAgICAgICAgcGFuaWMuZmlsZVBhdGggPSBwYXRoLmlzQWJzb2x1dGUocGFuaWMuZmlsZSkgPyBwYW5pYy5maWxlIDogcGF0aC5qb2luKGJ1aWxkV29ya0RpciwgcGFuaWMuZmlsZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBhbmljLmZpbGUgPSBtYXRjaFsyXTsgIC8vIFdlIGZhaWxlZCB0byBmaW5kIGEgbGluayB0byBvdXIgc291cmNlIGNvZGUsIHVzZSBSdXN0J3NcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHNob3cpIHtcbiAgICAgICAgICAgIHNob3dQYW5pYyhwYW5pYyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwYXJzZWRRdHk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIG1hdGNoRnVuY3Rpb24ob3V0cHV0KSB7XG4gICAgICAgIGNvbnN0IHVzZUpzb24gPSBhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLWNhcmdvLmpzb25FcnJvcnMnKTtcbiAgICAgICAgY29uc3QgbWVzc2FnZXMgPSBbXTsgICAgLy8gcmVzdWx0aW5nIGNvbGxlY3Rpb24gb2YgaGlnaC1sZXZlbCBtZXNzYWdlc1xuICAgICAgICBsZXQgbXNnID0gbnVsbDsgICAgICAgICAvLyBjdXJyZW50IGhpZ2gtbGV2ZWwgbWVzc2FnZSAoZXJyb3IsIHdhcm5pbmcgb3IgcGFuaWMpXG4gICAgICAgIGxldCBzdWIgPSBudWxsOyAgICAgICAgIC8vIGN1cnJlbnQgc3VibWVzc2FnZSAobm90ZSBvciBoZWxwKVxuICAgICAgICBsZXQgcGFuaWNzTiA9IDA7ICAgICAgICAvLyBxdWFudGl0eSBvZiBwYW5pY3MgaW4gdGhpcyBvdXRwdXRcbiAgICAgICAgY29uc3QgbGluZXMgPSBvdXRwdXQuc3BsaXQoL1xcbi8pO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgY29uc3QgbGluZSA9IGxpbmVzW2ldO1xuICAgICAgICAgIC8vIENhcmdvIGZpbmFsIGVycm9yIG1lc3NhZ2VzIHN0YXJ0IHdpdGggJ2Vycm9yOicsIHNraXAgdGhlbVxuICAgICAgICAgIGlmIChsaW5lID09PSBudWxsIHx8IGxpbmUgPT09ICcnIHx8IGxpbmUuc3Vic3RyaW5nKDAsIDYpID09PSAnZXJyb3I6Jykge1xuICAgICAgICAgICAgbXNnID0gbnVsbDtcbiAgICAgICAgICAgIHN1YiA9IG51bGw7XG4gICAgICAgICAgfSBlbHNlIGlmICh1c2VKc29uICYmIGxpbmVbMF0gPT09ICd7Jykge1xuICAgICAgICAgICAgLy8gUGFyc2UgYSBKU09OIGJsb2NrXG4gICAgICAgICAgICBwYXJzZUpzb25PdXRwdXQobGluZSwgbWVzc2FnZXMpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBDaGVjayBmb3IgY29tcGlsYXRpb24gbWVzc2FnZXNcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoID0gL14oLisucnMpOihcXGQrKTooXFxkKyk6KD86IChcXGQrKTooXFxkKykpPyAoZXJyb3J8d2FybmluZ3xoZWxwfG5vdGUpOiAoLiopL2cuZXhlYyhsaW5lKTtcbiAgICAgICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgICAgICBjb25zdCBsZXZlbCA9IG1hdGNoWzZdO1xuICAgICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gbWF0Y2hbN107XG4gICAgICAgICAgICAgIGlmIChsZXZlbCA9PT0gJ2Vycm9yJyB8fCBsZXZlbCA9PT0gJ3dhcm5pbmcnIHx8IG1zZyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIG1zZyA9IHtcbiAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICBmaWxlOiBub3JtYWxpemVQYXRoKG1hdGNoWzFdKSxcbiAgICAgICAgICAgICAgICAgIGxpbmU6IG1hdGNoWzJdLFxuICAgICAgICAgICAgICAgICAgbGluZV9lbmQ6IG1hdGNoWzRdLFxuICAgICAgICAgICAgICAgICAgY29sOiBtYXRjaFszXSxcbiAgICAgICAgICAgICAgICAgIGNvbF9lbmQ6IG1hdGNoWzVdLFxuICAgICAgICAgICAgICAgICAgdHlwZTogbGV2ZWwydHlwZShsZXZlbCksXG4gICAgICAgICAgICAgICAgICBzZXZlcml0eTogbGV2ZWwyc2V2ZXJpdHkobGV2ZWwpLFxuICAgICAgICAgICAgICAgICAgdHJhY2U6IFtdXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBtZXNzYWdlcy5wdXNoKG1zZyk7XG4gICAgICAgICAgICAgICAgc3ViID0gbnVsbDtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzdWIgPSB7XG4gICAgICAgICAgICAgICAgICBtZXNzYWdlOiBtZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgZmlsZTogbm9ybWFsaXplUGF0aChtYXRjaFsxXSksXG4gICAgICAgICAgICAgICAgICBsaW5lOiBtYXRjaFsyXSxcbiAgICAgICAgICAgICAgICAgIGxpbmVfZW5kOiBtYXRjaFs0XSxcbiAgICAgICAgICAgICAgICAgIGNvbDogbWF0Y2hbM10sXG4gICAgICAgICAgICAgICAgICBjb2xfZW5kOiBtYXRjaFs1XSxcbiAgICAgICAgICAgICAgICAgIHR5cGU6IGxldmVsMnR5cGUobGV2ZWwpLFxuICAgICAgICAgICAgICAgICAgc2V2ZXJpdHk6IGxldmVsMnNldmVyaXR5KGxldmVsKVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgbXNnLnRyYWNlLnB1c2goc3ViKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIHBhbmljXG4gICAgICAgICAgICAgIGNvbnN0IHBhcnNlZFF0eSA9IHRyeVBhcnNlUGFuaWMobGluZXMsIGksIHBhbmljc04gPCBwYW5pY3NMaW1pdCk7XG4gICAgICAgICAgICAgIGlmIChwYXJzZWRRdHkgPiAwKSB7XG4gICAgICAgICAgICAgICAgbXNnID0gbnVsbDtcbiAgICAgICAgICAgICAgICBzdWIgPSBudWxsO1xuICAgICAgICAgICAgICAgIGkgKz0gcGFyc2VkUXR5IC0gMTsgLy8gU3VidHJhY3Qgb25lIGJlY2F1c2UgdGhlIGN1cnJlbnQgbGluZSBpcyBhbHJlYWR5IGNvdW50ZWRcbiAgICAgICAgICAgICAgICBwYW5pY3NOICs9IDE7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoc3ViICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgLy8gSnVzdCBhIGRlc2NyaXB0aW9uIGluIHRoZSBjdXJyZW50IGJsb2NrLiBPbmx5IGFkZCBpdCB3aGVuIGluIHN1Ym1lc3NhZ2VcbiAgICAgICAgICAgICAgICAvLyBiZWNhdXNlIExpbnRlciBkb2VzIHRoZSBqb2IgZm9yIGhpZ2gtbGV2ZWwgbWVzc2FnZXMuXG4gICAgICAgICAgICAgICAgc3ViLm1lc3NhZ2UgKz0gJ1xcbicgKyBsaW5lO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGhpZGRlblBhbmljc04gPSBwYW5pY3NOIC0gcGFuaWNzTGltaXQ7XG4gICAgICAgIGlmIChoaWRkZW5QYW5pY3NOID09PSAxKSB7XG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdPbmUgbW9yZSBwYW5pYyBpcyBoaWRkZW4nLCB7IGRpc21pc3NhYmxlOiB0cnVlIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGhpZGRlblBhbmljc04gPiAxKSB7XG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKGhpZGRlblBhbmljc04gKyAnIG1vcmUgcGFuaWNzIGFyZSBoaWRkZW4nLCB7IGRpc21pc3NhYmxlOiB0cnVlIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtZXNzYWdlcztcbiAgICAgIH1cblxuICAgICAgLy8gQ2hlY2tzIGlmIHRoZSBnaXZlbiBvYmplY3QgcmVwcmVzZW50cyB0aGUgcm9vdCBvZiB0aGUgcHJvamVjdCBvciBmaWxlIHN5c3RlbVxuICAgICAgZnVuY3Rpb24gaXNSb290KHBhcnRzKSB7XG4gICAgICAgIGlmIChwYXJ0cy5kaXIgPT09IHBhcnRzLnJvb3QpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTsgICAgLy8gVGhlIGZpbGUgc3lzdGVtIHJvb3RcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYXRvbS5wcm9qZWN0LmdldFBhdGhzKCkuc29tZShwID0+IHtcbiAgICAgICAgICByZXR1cm4gcGFydHMuZGlyID09PSBwO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gUmV0dXJucyB0aGUgY2xvc2VzdCBkaXJlY3Rvcnkgd2l0aCBDYXJnby50b21sIGluIGl0LlxuICAgICAgLy8gSWYgdGhlcmUncyBubyBzdWNoIGRpcmVjdG9yeSwgcmV0dXJucyB1bmRlZmluZWQuXG4gICAgICBmdW5jdGlvbiBmaW5kQ2FyZ29Qcm9qZWN0RGlyKHApIHtcbiAgICAgICAgY29uc3QgcGFydHMgPSBwYXRoLnBhcnNlKHApO1xuICAgICAgICBjb25zdCByb290ID0gaXNSb290KHBhcnRzKTtcbiAgICAgICAgY29uc3QgY2FyZ29Ub21sID0gcGF0aC5mb3JtYXQoe1xuICAgICAgICAgIGRpcjogcGFydHMuZGlyLFxuICAgICAgICAgIGJhc2U6ICdDYXJnby50b21sJ1xuICAgICAgICB9KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoZnMuc3RhdFN5bmMoY2FyZ29Ub21sKS5pc0ZpbGUoKSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgZGlyOiBwYXJ0cy5kaXIsXG4gICAgICAgICAgICAgIHJvb3Q6IHJvb3RcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgaWYgKGUuY29kZSAhPT0gJ0VOT0VOVCcpIHsgIC8vIE5vIHN1Y2ggZmlsZSAoQ2FyZ28udG9tbClcbiAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChyb290KSB7XG4gICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmluZENhcmdvUHJvamVjdERpcihwYXJ0cy5kaXIpO1xuICAgICAgfVxuXG4gICAgICAvLyBUaGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCBiZWZvcmUgZXZlcnkgYnVpbGQuIEl0IGZpbmRzIHRoZSBjbG9zZXN0XG4gICAgICAvLyBDYXJnby50b21sIGZpbGUgaW4gdGhlIHBhdGggYW5kIHVzZXMgaXRzIGRpcmVjdG9yeSBhcyB3b3JraW5nLlxuICAgICAgZnVuY3Rpb24gcHJlcGFyZUJ1aWxkKGJ1aWxkQ2ZnKSB7XG4gICAgICAgIC8vIENvbW1vbiBidWlsZCBjb21tYW5kIHBhcmFtZXRlcnNcbiAgICAgICAgYnVpbGRDZmcuZXhlYyA9IGF0b20uY29uZmlnLmdldCgnYnVpbGQtY2FyZ28uY2FyZ29QYXRoJyk7XG4gICAgICAgIGJ1aWxkQ2ZnLmVudiA9IHt9O1xuICAgICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdidWlsZC1jYXJnby5qc29uRXJyb3JzJykpIHtcbiAgICAgICAgICBidWlsZENmZy5lbnYuUlVTVEZMQUdTID0gJy1aIHVuc3RhYmxlLW9wdGlvbnMgLS1lcnJvci1mb3JtYXQ9anNvbic7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGF0b20uY29uZmlnLmdldCgnYnVpbGQtY2FyZ28uc2hvd0JhY2t0cmFjZScpKSB7XG4gICAgICAgICAgYnVpbGRDZmcuZW52LlJVU1RfQkFDS1RSQUNFID0gJzEnO1xuICAgICAgICB9XG4gICAgICAgIGJ1aWxkQ2ZnLmFyZ3MgPSBidWlsZENmZy5hcmdzIHx8IFtdO1xuICAgICAgICBhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLWNhcmdvLnZlcmJvc2UnKSAmJiBidWlsZENmZy5hcmdzLnB1c2goJy0tdmVyYm9zZScpO1xuXG4gICAgICAgIC8vIFN1YnN0aXR1dGUgd29ya2luZyBkaXJlY3RvcnkgaWYgd2UgYXJlIGluIGEgbXVsdGktY3JhdGUgZW52aXJvbm1lbnRcbiAgICAgICAgaWYgKGF0b20uY29uZmlnLmdldCgnYnVpbGQtY2FyZ28ubXVsdGlDcmF0ZVByb2plY3RzJykpIHtcbiAgICAgICAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgICAgICAgYnVpbGRDZmcuY3dkID0gdW5kZWZpbmVkO1xuICAgICAgICAgIGlmIChlZGl0b3IgJiYgZWRpdG9yLmdldFBhdGgoKSkge1xuICAgICAgICAgICAgY29uc3Qgd2RJbmZvID0gZmluZENhcmdvUHJvamVjdERpcihlZGl0b3IuZ2V0UGF0aCgpKTtcbiAgICAgICAgICAgIGlmICh3ZEluZm8pIHtcbiAgICAgICAgICAgICAgaWYgKCF3ZEluZm8ucm9vdCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHAgPSBwYXRoLnBhcnNlKHdkSW5mby5kaXIpO1xuICAgICAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKCdCdWlsZGluZyAnICsgcC5iYXNlICsgJy4uLicpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGJ1aWxkQ2ZnLmN3ZCA9IHdkSW5mby5kaXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghYnVpbGRDZmcuY3dkICYmIGF0b20ucHJvamVjdC5nZXRQYXRocygpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAvLyBCdWlsZCBpbiB0aGUgcm9vdCBvZiB0aGUgZmlyc3QgcGF0aCBieSBkZWZhdWx0XG4gICAgICAgICAgYnVpbGRDZmcuY3dkID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClbMF07XG4gICAgICAgIH1cbiAgICAgICAgYnVpbGRXb3JrRGlyID0gYnVpbGRDZmcuY3dkO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBjb21tYW5kcyA9IFtcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICdDYXJnbzogYnVpbGQgKGRlYnVnKScsXG4gICAgICAgICAgYXRvbUNvbW1hbmROYW1lOiAnY2FyZ286YnVpbGQtZGVidWcnLFxuICAgICAgICAgIGFyZ3NDZmc6IFsgJ2J1aWxkJyBdXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnQ2FyZ286IGJ1aWxkIChyZWxlYXNlKScsXG4gICAgICAgICAgYXRvbUNvbW1hbmROYW1lOiAnY2FyZ286YnVpbGQtcmVsZWFzZScsXG4gICAgICAgICAgYXJnc0NmZzogWyAnYnVpbGQnLCAnLS1yZWxlYXNlJyBdXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnQ2FyZ286IGJlbmNoJyxcbiAgICAgICAgICBhdG9tQ29tbWFuZE5hbWU6ICdjYXJnbzpiZW5jaCcsXG4gICAgICAgICAgYXJnc0NmZzogWyAnYmVuY2gnIF1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICdDYXJnbzogY2xlYW4nLFxuICAgICAgICAgIGF0b21Db21tYW5kTmFtZTogJ2NhcmdvOmNsZWFuJyxcbiAgICAgICAgICBhcmdzQ2ZnOiBbICdjbGVhbicgXVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogJ0NhcmdvOiBkb2MnLFxuICAgICAgICAgIGF0b21Db21tYW5kTmFtZTogJ2NhcmdvOmRvYycsXG4gICAgICAgICAgYXJnc0NmZzogWyAnZG9jJyBdLFxuICAgICAgICAgIHByZUNvbmZpZzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgYXRvbS5jb25maWcuZ2V0KCdidWlsZC1jYXJnby5vcGVuRG9jcycpICYmIHRoaXMuYXJncy5wdXNoKCctLW9wZW4nKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnQ2FyZ286IHJ1biAoZGVidWcpJyxcbiAgICAgICAgICBhdG9tQ29tbWFuZE5hbWU6ICdjYXJnbzpydW4tZGVidWcnLFxuICAgICAgICAgIGFyZ3NDZmc6IFsgJ3J1bicgXVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogJ0NhcmdvOiBydW4gKHJlbGVhc2UpJyxcbiAgICAgICAgICBhdG9tQ29tbWFuZE5hbWU6ICdjYXJnbzpydW4tcmVsZWFzZScsXG4gICAgICAgICAgYXJnc0NmZzogWyAncnVuJywgJy0tcmVsZWFzZScgXVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogJ0NhcmdvOiB0ZXN0JyxcbiAgICAgICAgICBhdG9tQ29tbWFuZE5hbWU6ICdjYXJnbzpydW4tdGVzdCcsXG4gICAgICAgICAgYXJnc0NmZzogWyAndGVzdCcgXVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogJ0NhcmdvOiB1cGRhdGUnLFxuICAgICAgICAgIGF0b21Db21tYW5kTmFtZTogJ2NhcmdvOnVwZGF0ZScsXG4gICAgICAgICAgYXJnc0NmZzogWyAndXBkYXRlJyBdXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnQ2FyZ286IGJ1aWxkIGV4YW1wbGUnLFxuICAgICAgICAgIGF0b21Db21tYW5kTmFtZTogJ2NhcmdvOmJ1aWxkLWV4YW1wbGUnLFxuICAgICAgICAgIGFyZ3NDZmc6IFsgJ2J1aWxkJywgJy0tZXhhbXBsZScsICd7RklMRV9BQ1RJVkVfTkFNRV9CQVNFfScgXVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogJ0NhcmdvOiBydW4gZXhhbXBsZScsXG4gICAgICAgICAgYXRvbUNvbW1hbmROYW1lOiAnY2FyZ286cnVuLWV4YW1wbGUnLFxuICAgICAgICAgIGFyZ3NDZmc6IFsgJ3J1bicsICctLWV4YW1wbGUnLCAne0ZJTEVfQUNUSVZFX05BTUVfQkFTRX0nIF1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICdDYXJnbzogcnVuIGJpbicsXG4gICAgICAgICAgYXRvbUNvbW1hbmROYW1lOiAnY2FyZ286cnVuLWJpbicsXG4gICAgICAgICAgYXJnc0NmZzogWyAncnVuJywgJy0tYmluJywgJ3tGSUxFX0FDVElWRV9OQU1FX0JBU0V9JyBdXG4gICAgICAgIH1cbiAgICAgIF07XG5cbiAgICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLWNhcmdvLmV4dENvbW1hbmRzLmNhcmdvQ2xpcHB5JykpIHtcbiAgICAgICAgY29tbWFuZHMucHVzaCh7XG4gICAgICAgICAgbmFtZTogJ0NhcmdvOiBDbGlwcHknLFxuICAgICAgICAgIGF0b21Db21tYW5kTmFtZTogJ2NhcmdvOmNsaXBweScsXG4gICAgICAgICAgYXJnc0NmZzogWyAnY2xpcHB5JyBdXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdidWlsZC1jYXJnby5leHRDb21tYW5kcy5jYXJnb0NoZWNrJykpIHtcbiAgICAgICAgY29tbWFuZHMucHVzaCh7XG4gICAgICAgICAgbmFtZTogJ0NhcmdvOiBjaGVjaycsXG4gICAgICAgICAgYXRvbUNvbW1hbmROYW1lOiAnY2FyZ286Y2hlY2snLFxuICAgICAgICAgIGFyZ3NDZmc6IFsgJ2NoZWNrJyBdXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBjb21tYW5kcy5mb3JFYWNoKGNtZCA9PiB7XG4gICAgICAgIGNtZC5leGVjID0gYXRvbS5jb25maWcuZ2V0KCdidWlsZC1jYXJnby5jYXJnb1BhdGgnKTtcbiAgICAgICAgY21kLnNoID0gZmFsc2U7XG4gICAgICAgIGNtZC5mdW5jdGlvbk1hdGNoID0gbWF0Y2hGdW5jdGlvbjtcbiAgICAgICAgY21kLnByZUJ1aWxkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHRoaXMuYXJncyA9IHRoaXMuYXJnc0NmZy5zbGljZSgwKTsgICAgLy8gQ2xvbmUgaW5pdGlhbCBhcmd1bWVudHNcbiAgICAgICAgICBpZiAodGhpcy5wcmVDb25maWcpIHtcbiAgICAgICAgICAgIHRoaXMucHJlQ29uZmlnKCk7ICAgICAgICAgICAgICAgICAgIC8vIEFsbG93IHRoZSBjb21tYW5kIHRvIGNvbmZpZ3VyZSBpdHMgYXJndW1lbnRzXG4gICAgICAgICAgfVxuICAgICAgICAgIHByZXBhcmVCdWlsZCh0aGlzKTtcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gY29tbWFuZHM7XG4gICAgfVxuICB9O1xufVxuIl19
//# sourceURL=/home/takaaki/.atom/packages/build-cargo/lib/cargo.js
