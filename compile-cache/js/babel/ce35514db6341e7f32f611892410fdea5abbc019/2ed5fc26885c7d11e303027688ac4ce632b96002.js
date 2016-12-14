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

if (atom.config.get('build-cargo.showBacktrace')) {
  atom.config.set('build-cargo.backtraceType', 'Compact');
}
if (atom.config.get('build-cargo.cargoCheck')) {
  atom.config.set('build-cargo.extCommands.cargoCheck', true);
}
if (atom.config.get('build-cargo.cargoClippy')) {
  atom.config.set('build-cargo.extCommands.cargoClippy', true);
}
// Remove old settings
atom.config.unset('build-cargo.showBacktrace');
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
  backtraceType: {
    title: 'Backtrace',
    description: 'Stack backtrace verbosity level. Uses the environment variable RUST_BACKTRACE=1 if not `Off`.',
    type: 'string',
    'default': 'Off',
    'enum': ['Off', 'Compact', 'Full'],
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
          return filePath.startsWith(unixRustSrcPrefix) || filePath.startsWith(windowsRustSrcPrefix);
        }

        function parseJsonSpan(_x, _x2) {
          var _again = true;

          _function: while (_again) {
            var span = _x,
                msg = _x2;
            _again = false;

            if (span && span.file_name && !span.file_name.startsWith('<')) {
              msg.file = span.file_name;
              msg.line = span.line_start;
              msg.line_end = span.line_end;
              msg.col = span.column_start;
              msg.col_end = span.column_end;
              return true;
            } else if (span.expansion) {
              _x = span.expansion.span;
              _x2 = msg;
              _again = true;
              continue _function;
            }
            return false;
          }
        }

        function parseJsonSpans(jsonObj, msg) {
          if (jsonObj.spans) {
            jsonObj.spans.forEach(function (span) {
              if (parseJsonSpan(span, msg)) {
                return;
              }
            });
          }
        }

        // Parses a compile message in json format
        function parseJsonMessage(line, messages) {
          var json = JSON.parse(line);
          var msg = {
            message: json.message,
            type: level2type(json.level),
            severity: level2severity(json.level),
            trace: []
          };
          parseJsonSpans(json, msg);
          json.children.forEach(function (child) {
            var tr = {
              message: child.message,
              type: level2type(child.level),
              severity: level2severity(child.level)
            };
            parseJsonSpans(child, tr);
            msg.trace.push(tr);
          });
          if (json.code && json.code.explanation) {
            msg.trace.push({
              message: json.code.explanation,
              type: 'Explanation',
              severity: 'info'
            });
          }
          if (msg.file) {
            // Root message without `file` is the summary, skip it
            messages.push(msg);
          }
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
              var matchFunc = /^(\s+\d+):\s+0x[a-f0-9]+ - (?:(.+)::h[0-9a-f]+|(.+))$/g.exec(line);
              if (matchFunc) {
                // A line with a function call
                if (atom.config.get('build-cargo.backtraceType') === 'Compact') {
                  line = matchFunc[1] + ':  ' + (matchFunc[2] || matchFunc[3]);
                }
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
            if (!useJson) {
              // Remove ANSI escape codes from output
              line = line.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
            }
            // Cargo final error messages start with 'error:', skip them
            if (line === null || line === '' || line.substring(0, 6) === 'error:') {
              msg = null;
              sub = null;
            } else if (useJson && line[0] === '{') {
              // Parse a JSON block
              parseJsonMessage(line, messages);
            } else {
              // Check for compilation messages
              var match = /^(.+):(\d+):(\d+):(?: (\d+):(\d+))? (error|warning|help|note): (.*)/g.exec(line);
              if (match) {
                var filePath = match[1];
                var startLine = match[2];
                var startCol = match[3];
                var endLine = match[4];
                var endCol = match[5];
                var level = match[6];
                var message = match[7];
                if (level === 'error' || level === 'warning' || msg === null) {
                  msg = {
                    message: message,
                    file: filePath,
                    line: startLine,
                    line_end: endLine,
                    col: startCol,
                    col_end: endCol,
                    type: level2type(level),
                    severity: level2severity(level),
                    trace: []
                  };
                  messages.push(msg);
                  sub = null;
                } else {
                  if (filePath.startsWith('<')) {
                    // The message has incorrect file link, omit it
                    filePath = undefined;
                    startLine = undefined;
                    startCol = undefined;
                    endLine = undefined;
                    endCol = undefined;
                  } else if (msg.file.startsWith('<')) {
                    // The root message has incorrect file link, use the one from the extended messsage
                    msg.file = filePath;
                    msg.line = startLine;
                    msg.line_end = endLine;
                    msg.col = startCol;
                    msg.col_end = endCol;
                  }
                  sub = {
                    message: message,
                    file: filePath,
                    line: startLine,
                    line_end: endLine,
                    col: startCol,
                    col_end: endCol,
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
        function findCargoProjectDir(_x3) {
          var _again2 = true;

          _function2: while (_again2) {
            var p = _x3;
            _again2 = false;

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
            _x3 = parts.dir;
            _again2 = true;
            parts = root = cargoToml = undefined;
            continue _function2;
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
          } else if (process.platform !== 'win32') {
            buildCfg.env.TERM = 'xterm';
            buildCfg.env.RUSTFLAGS = '--color=always';
          }
          if (atom.config.get('build-cargo.backtraceType') !== 'Off') {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvYnVpbGQtY2FyZ28vbGliL2NhcmdvLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztrQkFFZSxJQUFJOzs7OztBQUZuQixXQUFXLENBQUM7O0FBS1osSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsQ0FBQyxFQUFFO0FBQ2hELE1BQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLDJCQUEyQixFQUFFLFNBQVMsQ0FBQyxDQUFDO0NBQ3pEO0FBQ0QsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxFQUFFO0FBQzdDLE1BQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLG9DQUFvQyxFQUFFLElBQUksQ0FBQyxDQUFDO0NBQzdEO0FBQ0QsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxFQUFFO0FBQzlDLE1BQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHFDQUFxQyxFQUFFLElBQUksQ0FBQyxDQUFDO0NBQzlEOztBQUVELElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLDJCQUEyQixDQUFDLENBQUM7QUFDL0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQUM1QyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDOztBQUV0QyxJQUFNLE1BQU0sR0FBRztBQUNwQixXQUFTLEVBQUU7QUFDVCxTQUFLLEVBQUUsOEJBQThCO0FBQ3JDLFFBQUksRUFBRSxRQUFRO0FBQ2QsZUFBUyxPQUFPO0FBQ2hCLFNBQUssRUFBRSxDQUFDO0dBQ1Q7QUFDRCxvQkFBa0IsRUFBRTtBQUNsQixTQUFLLEVBQUUscUNBQXFDO0FBQzVDLGVBQVcsRUFBRSxrRUFBa0U7QUFDL0UsUUFBSSxFQUFFLFNBQVM7QUFDZixlQUFT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SSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsQ0FBQztBQUNwRCxhQUFHLENBQUMsRUFBRSxHQUFHLEtBQUssQ0FBQztBQUNmLGFBQUcsQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO0FBQ2xDLGFBQUcsQ0FBQyxRQUFRLEdBQUcsWUFBWTtBQUN6QixnQkFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsQyxnQkFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO0FBQ2xCLGtCQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7YUFDbEI7QUFDRCx3QkFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1dBQ3BCLENBQUM7U0FDSCxDQUFDLENBQUM7O0FBRUgsZUFBTyxRQUFRLENBQUM7T0FDakI7OztXQTdjVSxrQkFBa0I7T0E4YzdCO0NBQ0giLCJmaWxlIjoiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9idWlsZC1jYXJnby9saWIvY2FyZ28uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IGZzIGZyb20gJ2ZzJztcblxuLy8gVHJhbnNmZXIgZXhpc3Rpbmcgc2V0dGluZ3MgZnJvbSBwcmV2aW91cyB2ZXJzaW9ucyBvZiB0aGUgcGFja2FnZVxuaWYgKGF0b20uY29uZmlnLmdldCgnYnVpbGQtY2FyZ28uc2hvd0JhY2t0cmFjZScpKSB7XG4gIGF0b20uY29uZmlnLnNldCgnYnVpbGQtY2FyZ28uYmFja3RyYWNlVHlwZScsICdDb21wYWN0Jyk7XG59XG5pZiAoYXRvbS5jb25maWcuZ2V0KCdidWlsZC1jYXJnby5jYXJnb0NoZWNrJykpIHtcbiAgYXRvbS5jb25maWcuc2V0KCdidWlsZC1jYXJnby5leHRDb21tYW5kcy5jYXJnb0NoZWNrJywgdHJ1ZSk7XG59XG5pZiAoYXRvbS5jb25maWcuZ2V0KCdidWlsZC1jYXJnby5jYXJnb0NsaXBweScpKSB7XG4gIGF0b20uY29uZmlnLnNldCgnYnVpbGQtY2FyZ28uZXh0Q29tbWFuZHMuY2FyZ29DbGlwcHknLCB0cnVlKTtcbn1cbi8vIFJlbW92ZSBvbGQgc2V0dGluZ3NcbmF0b20uY29uZmlnLnVuc2V0KCdidWlsZC1jYXJnby5zaG93QmFja3RyYWNlJyk7XG5hdG9tLmNvbmZpZy51bnNldCgnYnVpbGQtY2FyZ28uY2FyZ29DaGVjaycpO1xuYXRvbS5jb25maWcudW5zZXQoJ2J1aWxkLWNhcmdvLmNhcmdvQ2xpcHB5Jyk7XG5cbmV4cG9ydCBjb25zdCBjb25maWcgPSB7XG4gIGNhcmdvUGF0aDoge1xuICAgIHRpdGxlOiAnUGF0aCB0byB0aGUgQ2FyZ28gZXhlY3V0YWJsZScsXG4gICAgdHlwZTogJ3N0cmluZycsXG4gICAgZGVmYXVsdDogJ2NhcmdvJyxcbiAgICBvcmRlcjogMVxuICB9LFxuICBtdWx0aUNyYXRlUHJvamVjdHM6IHtcbiAgICB0aXRsZTogJ0VuYWJsZSBtdWx0aS1jcmF0ZSBwcm9qZWN0cyBzdXBwb3J0JyxcbiAgICBkZXNjcmlwdGlvbjogJ0J1aWxkIGludGVybmFsIGNyYXRlcyBzZXBhcmF0ZWx5IGJhc2VkIG9uIHRoZSBjdXJyZW50IG9wZW4gZmlsZS4nLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICBvcmRlcjogMlxuICB9LFxuICB2ZXJib3NlOiB7XG4gICAgdGl0bGU6ICdWZXJib3NlIENhcmdvIG91dHB1dCcsXG4gICAgZGVzY3JpcHRpb246ICdQYXNzIHRoZSAtLXZlcmJvc2UgZmxhZyB0byBDYXJnby4nLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICBvcmRlcjogM1xuICB9LFxuICBiYWNrdHJhY2VUeXBlOiB7XG4gICAgdGl0bGU6ICdCYWNrdHJhY2UnLFxuICAgIGRlc2NyaXB0aW9uOiAnU3RhY2sgYmFja3RyYWNlIHZlcmJvc2l0eSBsZXZlbC4gVXNlcyB0aGUgZW52aXJvbm1lbnQgdmFyaWFibGUgUlVTVF9CQUNLVFJBQ0U9MSBpZiBub3QgYE9mZmAuJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICBkZWZhdWx0OiAnT2ZmJyxcbiAgICBlbnVtOiBbICdPZmYnLCAnQ29tcGFjdCcsICdGdWxsJyBdLFxuICAgIG9yZGVyOiA0XG4gIH0sXG4gIGpzb25FcnJvcnM6IHtcbiAgICB0aXRsZTogJ1VzZSBqc29uIGVycm9ycyBmb3JtYXQnLFxuICAgIGRlc2NyaXB0aW9uOiAnSW5zdGVhZCBvZiB1c2luZyByZWdleCB0byBwYXJzZSB0aGUgaHVtYW4gcmVhZGFibGUgb3V0cHV0IChyZXF1aXJlcyBydXN0YyB2ZXJzaW9uIDEuNylcXG5Ob3RlOiB0aGlzIGlzIGFuIHVuc3RhYmxlIGZlYXR1cmUgb2YgdGhlIFJ1c3QgY29tcGlsZXIgYW5kIHByb25lIHRvIGNoYW5nZSBhbmQgYnJlYWsgZnJlcXVlbnRseS4nLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICBvcmRlcjogNVxuICB9LFxuICBvcGVuRG9jczoge1xuICAgIHRpdGxlOiAnT3BlbiBkb2N1bWVudGF0aW9uIGluIGJyb3dzZXIgYWZ0ZXIgXFwnZG9jXFwnIHRhcmdldCBpcyBidWlsdCcsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIG9yZGVyOiA2XG4gIH0sXG4gIGV4dENvbW1hbmRzOiB7XG4gICAgdGl0bGU6ICdFeHRlbmRlZCBDb21tYW5kcycsXG4gICAgdHlwZTogJ29iamVjdCcsXG4gICAgb3JkZXI6IDcsXG4gICAgcHJvcGVydGllczoge1xuICAgICAgY2FyZ29DaGVjazoge1xuICAgICAgICB0aXRsZTogJ0VuYWJsZSBjYXJnbyBjaGVjaycsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnRW5hYmxlIHRoZSBgY2FyZ28gY2hlY2tgIENhcmdvIGNvbW1hbmQuIE9ubHkgdXNlIHRoaXMgaWYgeW91IGhhdmUgYGNhcmdvIGNoZWNrYCBpbnN0YWxsZWQuJyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgb3JkZXI6IDFcbiAgICAgIH0sXG4gICAgICBjYXJnb0NsaXBweToge1xuICAgICAgICB0aXRsZTogJ0VuYWJsZSBjYXJnbyBjbGlwcHknLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0VuYWJsZSB0aGUgYGNhcmdvIGNsaXBweWAgQ2FyZ28gY29tbWFuZCB0byBydW4gQ2xpcHB5XFwncyBsaW50cy4gT25seSB1c2UgdGhpcyBpZiB5b3UgaGF2ZSB0aGUgYGNhcmdvIGNsaXBweWAgcGFja2FnZSBpbnN0YWxsZWQuJyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgb3JkZXI6IDJcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm92aWRlQnVpbGRlcigpIHtcbiAgcmV0dXJuIGNsYXNzIENhcmdvQnVpbGRQcm92aWRlciB7XG4gICAgY29uc3RydWN0b3IoY3dkKSB7XG4gICAgICB0aGlzLmN3ZCA9IGN3ZDtcbiAgICB9XG5cbiAgICBnZXROaWNlTmFtZSgpIHtcbiAgICAgIHJldHVybiAnQ2FyZ28nO1xuICAgIH1cblxuICAgIGlzRWxpZ2libGUoKSB7XG4gICAgICByZXR1cm4gZnMuZXhpc3RzU3luYyhgJHt0aGlzLmN3ZH0vQ2FyZ28udG9tbGApO1xuICAgIH1cblxuICAgIHNldHRpbmdzKCkge1xuICAgICAgY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcblxuICAgICAgLy8gQ29uc3RhbnRzIHRvIGRldGVjdCBsaW5rcyB0byBSdXN0J3Mgc291cmNlIGNvZGUgYW5kIG1ha2UgdGhlbSBmb2xsb3dhYmxlXG4gICAgICBjb25zdCB1bml4UnVzdFNyY1ByZWZpeCA9ICcuLi9zcmMvJztcbiAgICAgIGNvbnN0IHdpbmRvd3NSdXN0U3JjUHJlZml4ID0gJy4uXFxcXHNyY1xcXFwnO1xuXG4gICAgICBsZXQgYnVpbGRXb3JrRGlyOyAgICAgICAgLy8gVGhlIGxhc3QgYnVpbGQgd29ya2RpbmcgZGlyZWN0b3J5IChtaWdodCBkaWZmZXIgZnJvbSB0aGUgcHJvamVjdCByb290IGZvciBtdWx0aS1jcmF0ZSBwcm9qZWN0cylcbiAgICAgIGxldCBwYW5pY3NDb3VudGVyID0gMDsgICAvLyBDb3VudHMgYWxsIHBhbmljc1xuICAgICAgY29uc3QgcGFuaWNzTGltaXQgPSAxMDsgIC8vIE1heCBudW1iZXIgb2YgcGFuaWNzIHRvIHNob3cgYXQgb25jZVxuXG4gICAgICBmdW5jdGlvbiBsZXZlbDJzZXZlcml0eShsZXZlbCkge1xuICAgICAgICBzd2l0Y2ggKGxldmVsKSB7XG4gICAgICAgICAgY2FzZSAnd2FybmluZyc6IHJldHVybiAnd2FybmluZyc7XG4gICAgICAgICAgY2FzZSAnZXJyb3InOiByZXR1cm4gJ2Vycm9yJztcbiAgICAgICAgICBjYXNlICdub3RlJzogcmV0dXJuICdpbmZvJztcbiAgICAgICAgICBjYXNlICdoZWxwJzogcmV0dXJuICdpbmZvJztcbiAgICAgICAgICBkZWZhdWx0OiByZXR1cm4gJ2Vycm9yJztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBsZXZlbDJ0eXBlKGxldmVsKSB7XG4gICAgICAgIHJldHVybiBsZXZlbC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGxldmVsLnNsaWNlKDEpO1xuICAgICAgfVxuXG4gICAgICAvLyBDaGVja3MgaWYgdGhlIGdpdmVuIGZpbGUgcGF0aCByZXR1cm5lZCBieSBydXN0YyBvciBjYXJnbyBwb2ludHMgdG8gdGhlIFJ1c3Qgc291cmNlIGNvZGVcbiAgICAgIGZ1bmN0aW9uIGlzUnVzdFNvdXJjZUxpbmsoZmlsZVBhdGgpIHtcbiAgICAgICAgcmV0dXJuIGZpbGVQYXRoLnN0YXJ0c1dpdGgodW5peFJ1c3RTcmNQcmVmaXgpIHx8IGZpbGVQYXRoLnN0YXJ0c1dpdGgod2luZG93c1J1c3RTcmNQcmVmaXgpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBwYXJzZUpzb25TcGFuKHNwYW4sIG1zZykge1xuICAgICAgICBpZiAoc3BhbiAmJiBzcGFuLmZpbGVfbmFtZSAmJiAhc3Bhbi5maWxlX25hbWUuc3RhcnRzV2l0aCgnPCcpKSB7XG4gICAgICAgICAgbXNnLmZpbGUgPSBzcGFuLmZpbGVfbmFtZTtcbiAgICAgICAgICBtc2cubGluZSA9IHNwYW4ubGluZV9zdGFydDtcbiAgICAgICAgICBtc2cubGluZV9lbmQgPSBzcGFuLmxpbmVfZW5kO1xuICAgICAgICAgIG1zZy5jb2wgPSBzcGFuLmNvbHVtbl9zdGFydDtcbiAgICAgICAgICBtc2cuY29sX2VuZCA9IHNwYW4uY29sdW1uX2VuZDtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChzcGFuLmV4cGFuc2lvbikge1xuICAgICAgICAgIHJldHVybiBwYXJzZUpzb25TcGFuKHNwYW4uZXhwYW5zaW9uLnNwYW4sIG1zZyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBwYXJzZUpzb25TcGFucyhqc29uT2JqLCBtc2cpIHtcbiAgICAgICAgaWYgKGpzb25PYmouc3BhbnMpIHtcbiAgICAgICAgICBqc29uT2JqLnNwYW5zLmZvckVhY2goc3BhbiA9PiB7XG4gICAgICAgICAgICBpZiAocGFyc2VKc29uU3BhbihzcGFuLCBtc2cpKSB7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBQYXJzZXMgYSBjb21waWxlIG1lc3NhZ2UgaW4ganNvbiBmb3JtYXRcbiAgICAgIGZ1bmN0aW9uIHBhcnNlSnNvbk1lc3NhZ2UobGluZSwgbWVzc2FnZXMpIHtcbiAgICAgICAgY29uc3QganNvbiA9IEpTT04ucGFyc2UobGluZSk7XG4gICAgICAgIGNvbnN0IG1zZyA9IHtcbiAgICAgICAgICBtZXNzYWdlOiBqc29uLm1lc3NhZ2UsXG4gICAgICAgICAgdHlwZTogbGV2ZWwydHlwZShqc29uLmxldmVsKSxcbiAgICAgICAgICBzZXZlcml0eTogbGV2ZWwyc2V2ZXJpdHkoanNvbi5sZXZlbCksXG4gICAgICAgICAgdHJhY2U6IFtdXG4gICAgICAgIH07XG4gICAgICAgIHBhcnNlSnNvblNwYW5zKGpzb24sIG1zZyk7XG4gICAgICAgIGpzb24uY2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiB7XG4gICAgICAgICAgY29uc3QgdHIgPSB7XG4gICAgICAgICAgICBtZXNzYWdlOiBjaGlsZC5tZXNzYWdlLFxuICAgICAgICAgICAgdHlwZTogbGV2ZWwydHlwZShjaGlsZC5sZXZlbCksXG4gICAgICAgICAgICBzZXZlcml0eTogbGV2ZWwyc2V2ZXJpdHkoY2hpbGQubGV2ZWwpXG4gICAgICAgICAgfTtcbiAgICAgICAgICBwYXJzZUpzb25TcGFucyhjaGlsZCwgdHIpO1xuICAgICAgICAgIG1zZy50cmFjZS5wdXNoKHRyKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChqc29uLmNvZGUgJiYganNvbi5jb2RlLmV4cGxhbmF0aW9uKSB7XG4gICAgICAgICAgbXNnLnRyYWNlLnB1c2goe1xuICAgICAgICAgICAgbWVzc2FnZToganNvbi5jb2RlLmV4cGxhbmF0aW9uLFxuICAgICAgICAgICAgdHlwZTogJ0V4cGxhbmF0aW9uJyxcbiAgICAgICAgICAgIHNldmVyaXR5OiAnaW5mbydcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobXNnLmZpbGUpIHsgLy8gUm9vdCBtZXNzYWdlIHdpdGhvdXQgYGZpbGVgIGlzIHRoZSBzdW1tYXJ5LCBza2lwIGl0XG4gICAgICAgICAgbWVzc2FnZXMucHVzaChtc2cpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFNob3dzIHBhbmljIGluZm9cbiAgICAgIGZ1bmN0aW9uIHNob3dQYW5pYyhwYW5pYykge1xuICAgICAgICAvLyBPbmx5IGFkZCBsaW5rIGlmIHdlIGhhdmUgcGFuaWMuZmlsZVBhdGgsIG90aGVyd2lzZSBpdCdzIGFuIGV4dGVybmFsIGxpbmtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKFxuICAgICAgICAgICdBIHRocmVhZCBwYW5pY2tlZCBhdCAnXG4gICAgICAgICAgICAgICsgKHBhbmljLmZpbGVQYXRoID8gJzxhIGlkPVwiJyArIHBhbmljLmlkICsgJ1wiIGhyZWY9XCIjXCI+JyA6ICcnKVxuICAgICAgICAgICAgICArICdsaW5lICcgKyBwYW5pYy5saW5lICsgJyBpbiAnICsgcGFuaWMuZmlsZVxuICAgICAgICAgICAgICArIChwYW5pYy5maWxlUGF0aCA/ICc8L2E+JyA6ICcnKSwge1xuICAgICAgICAgICAgICAgIGRldGFpbDogcGFuaWMubWVzc2FnZSxcbiAgICAgICAgICAgICAgICBzdGFjazogcGFuaWMuc3RhY2ssXG4gICAgICAgICAgICAgICAgZGlzbWlzc2FibGU6IHRydWVcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgIGlmIChwYW5pYy5maWxlUGF0aCkge1xuICAgICAgICAgIGNvbnN0IGxpbmsgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwYW5pYy5pZCk7XG4gICAgICAgICAgaWYgKGxpbmspIHtcbiAgICAgICAgICAgIGxpbmsucGFuaWMgPSBwYW5pYztcbiAgICAgICAgICAgIGxpbmsuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKGUudGFyZ2V0LnBhbmljLmZpbGVQYXRoLCB7XG4gICAgICAgICAgICAgICAgc2VhcmNoQWxsUGFuZXM6IHRydWUsXG4gICAgICAgICAgICAgICAgaW5pdGlhbExpbmU6IGUudGFyZ2V0LnBhbmljLmxpbmUgLSAxXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFRyaWVzIHRvIHBhcnNlIGEgc3RhY2sgdHJhY2UuIFJldHVybnMgdGhlIHF1YW50aXR5IG9mIGFjdHVhbGx5IHBhcnNlZCBsaW5lcy5cbiAgICAgIGZ1bmN0aW9uIHRyeVBhcnNlU3RhY2tUcmFjZShsaW5lcywgaSwgcGFuaWMpIHtcbiAgICAgICAgbGV0IHBhcnNlZFF0eSA9IDA7XG4gICAgICAgIGxldCBsaW5lID0gbGluZXNbaV07XG4gICAgICAgIGlmIChsaW5lLnN1YnN0cmluZygwLCAxNikgPT09ICdzdGFjayBiYWNrdHJhY2U6Jykge1xuICAgICAgICAgIHBhcnNlZFF0eSArPSAxO1xuICAgICAgICAgIGNvbnN0IHBhbmljTGluZXMgPSBbXTtcbiAgICAgICAgICBmb3IgKGxldCBqID0gaSArIDE7IGogPCBsaW5lcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgbGluZSA9IGxpbmVzW2pdO1xuICAgICAgICAgICAgY29uc3QgbWF0Y2hGdW5jID0gL14oXFxzK1xcZCspOlxccysweFthLWYwLTldKyAtICg/OiguKyk6OmhbMC05YS1mXSt8KC4rKSkkL2cuZXhlYyhsaW5lKTtcbiAgICAgICAgICAgIGlmIChtYXRjaEZ1bmMpIHtcbiAgICAgICAgICAgICAgLy8gQSBsaW5lIHdpdGggYSBmdW5jdGlvbiBjYWxsXG4gICAgICAgICAgICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLWNhcmdvLmJhY2t0cmFjZVR5cGUnKSA9PT0gJ0NvbXBhY3QnKSB7XG4gICAgICAgICAgICAgICAgbGluZSA9IG1hdGNoRnVuY1sxXSArICc6ICAnICsgKG1hdGNoRnVuY1syXSB8fCBtYXRjaEZ1bmNbM10pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHBhbmljTGluZXMucHVzaChsaW5lKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNvbnN0IG1hdGNoTGluayA9IC8oYXQgKC4rKTooXFxkKykpJC9nLmV4ZWMobGluZSk7XG4gICAgICAgICAgICAgIGlmIChtYXRjaExpbmspIHtcbiAgICAgICAgICAgICAgICAvLyBBIGxpbmUgd2l0aCBhIGZpbGUgbGlua1xuICAgICAgICAgICAgICAgIGlmICghcGFuaWMuZmlsZSAmJiAhaXNSdXN0U291cmNlTGluayhtYXRjaExpbmtbMl0pKSB7XG4gICAgICAgICAgICAgICAgICBwYW5pYy5maWxlID0gbWF0Y2hMaW5rWzJdOyAgICAvLyBGb3VuZCBhIGxpbmsgdG8gb3VyIHNvdXJjZSBjb2RlXG4gICAgICAgICAgICAgICAgICBwYW5pYy5saW5lID0gbWF0Y2hMaW5rWzNdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBwYW5pY0xpbmVzLnB1c2goJyAgJyArIG1hdGNoTGlua1sxXSk7IC8vIGxlc3MgbGVhZGluZyBzcGFjZXNcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBTdGFjayB0cmFjZSBoYXMgZW5kZWRcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGFyc2VkUXR5ICs9IDE7XG4gICAgICAgICAgfVxuICAgICAgICAgIHBhbmljLnN0YWNrID0gcGFuaWNMaW5lcy5qb2luKCdcXG4nKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGFyc2VkUXR5O1xuICAgICAgfVxuXG4gICAgICAvLyBUcmllcyB0byBwYXJzZSBhIHBhbmljIGFuZCBpdHMgc3RhY2sgdHJhY2UuIFJldHVybnMgdGhlIHF1YW50aXR5IG9mIGFjdHVhbGx5XG4gICAgICAvLyBwYXJzZWQgbGluZXMuXG4gICAgICBmdW5jdGlvbiB0cnlQYXJzZVBhbmljKGxpbmVzLCBpLCBzaG93KSB7XG4gICAgICAgIGNvbnN0IGxpbmUgPSBsaW5lc1tpXTtcbiAgICAgICAgY29uc3QgbWF0Y2ggPSAvKHRocmVhZCAnLisnIHBhbmlja2VkIGF0ICcuKycpLCAoW15cXC9dW15cXDpdKyk6KFxcZCspL2cuZXhlYyhsaW5lKTtcbiAgICAgICAgbGV0IHBhcnNlZFF0eSA9IDA7XG4gICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgIHBhcnNlZFF0eSA9IDE7XG4gICAgICAgICAgY29uc3QgcGFuaWMgPSB7XG4gICAgICAgICAgICBpZDogJ2J1aWxkLWNhcmdvLXBhbmljLScgKyAoKytwYW5pY3NDb3VudGVyKSwgLy8gVW5pcXVlIHBhbmljIElEXG4gICAgICAgICAgICBtZXNzYWdlOiBtYXRjaFsxXSxcbiAgICAgICAgICAgIGZpbGU6IGlzUnVzdFNvdXJjZUxpbmsobWF0Y2hbMl0pID8gdW5kZWZpbmVkIDogbWF0Y2hbMl0sXG4gICAgICAgICAgICBmaWxlUGF0aDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgbGluZTogcGFyc2VJbnQobWF0Y2hbM10sIDEwKSxcbiAgICAgICAgICAgIHN0YWNrOiB1bmRlZmluZWRcbiAgICAgICAgICB9O1xuICAgICAgICAgIHBhcnNlZFF0eSA9IDEgKyB0cnlQYXJzZVN0YWNrVHJhY2UobGluZXMsIGkgKyAxLCBwYW5pYyk7XG4gICAgICAgICAgaWYgKHBhbmljLmZpbGUpIHtcbiAgICAgICAgICAgIHBhbmljLmZpbGVQYXRoID0gcGF0aC5pc0Fic29sdXRlKHBhbmljLmZpbGUpID8gcGFuaWMuZmlsZSA6IHBhdGguam9pbihidWlsZFdvcmtEaXIsIHBhbmljLmZpbGUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYW5pYy5maWxlID0gbWF0Y2hbMl07ICAvLyBXZSBmYWlsZWQgdG8gZmluZCBhIGxpbmsgdG8gb3VyIHNvdXJjZSBjb2RlLCB1c2UgUnVzdCdzXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChzaG93KSB7XG4gICAgICAgICAgICBzaG93UGFuaWMocGFuaWMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGFyc2VkUXR5O1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBtYXRjaEZ1bmN0aW9uKG91dHB1dCkge1xuICAgICAgICBjb25zdCB1c2VKc29uID0gYXRvbS5jb25maWcuZ2V0KCdidWlsZC1jYXJnby5qc29uRXJyb3JzJyk7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2VzID0gW107ICAgIC8vIHJlc3VsdGluZyBjb2xsZWN0aW9uIG9mIGhpZ2gtbGV2ZWwgbWVzc2FnZXNcbiAgICAgICAgbGV0IG1zZyA9IG51bGw7ICAgICAgICAgLy8gY3VycmVudCBoaWdoLWxldmVsIG1lc3NhZ2UgKGVycm9yLCB3YXJuaW5nIG9yIHBhbmljKVxuICAgICAgICBsZXQgc3ViID0gbnVsbDsgICAgICAgICAvLyBjdXJyZW50IHN1Ym1lc3NhZ2UgKG5vdGUgb3IgaGVscClcbiAgICAgICAgbGV0IHBhbmljc04gPSAwOyAgICAgICAgLy8gcXVhbnRpdHkgb2YgcGFuaWNzIGluIHRoaXMgb3V0cHV0XG4gICAgICAgIGNvbnN0IGxpbmVzID0gb3V0cHV0LnNwbGl0KC9cXG4vKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGxldCBsaW5lID0gbGluZXNbaV07XG4gICAgICAgICAgaWYgKCF1c2VKc29uKSB7XG4gICAgICAgICAgICAvLyBSZW1vdmUgQU5TSSBlc2NhcGUgY29kZXMgZnJvbSBvdXRwdXRcbiAgICAgICAgICAgIGxpbmUgPSBsaW5lLnJlcGxhY2UoL1tcXHUwMDFiXFx1MDA5Yl1bWygpIzs/XSooPzpbMC05XXsxLDR9KD86O1swLTldezAsNH0pKik/WzAtOUEtT1JaY2YtbnFyeT0+PF0vZywgJycpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBDYXJnbyBmaW5hbCBlcnJvciBtZXNzYWdlcyBzdGFydCB3aXRoICdlcnJvcjonLCBza2lwIHRoZW1cbiAgICAgICAgICBpZiAobGluZSA9PT0gbnVsbCB8fCBsaW5lID09PSAnJyB8fCBsaW5lLnN1YnN0cmluZygwLCA2KSA9PT0gJ2Vycm9yOicpIHtcbiAgICAgICAgICAgIG1zZyA9IG51bGw7XG4gICAgICAgICAgICBzdWIgPSBudWxsO1xuICAgICAgICAgIH0gZWxzZSBpZiAodXNlSnNvbiAmJiBsaW5lWzBdID09PSAneycpIHtcbiAgICAgICAgICAgIC8vIFBhcnNlIGEgSlNPTiBibG9ja1xuICAgICAgICAgICAgcGFyc2VKc29uTWVzc2FnZShsaW5lLCBtZXNzYWdlcyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIENoZWNrIGZvciBjb21waWxhdGlvbiBtZXNzYWdlc1xuICAgICAgICAgICAgY29uc3QgbWF0Y2ggPSAvXiguKyk6KFxcZCspOihcXGQrKTooPzogKFxcZCspOihcXGQrKSk/IChlcnJvcnx3YXJuaW5nfGhlbHB8bm90ZSk6ICguKikvZy5leGVjKGxpbmUpO1xuICAgICAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgICAgIGxldCBmaWxlUGF0aCA9IG1hdGNoWzFdO1xuICAgICAgICAgICAgICBsZXQgc3RhcnRMaW5lID0gbWF0Y2hbMl07XG4gICAgICAgICAgICAgIGxldCBzdGFydENvbCA9IG1hdGNoWzNdO1xuICAgICAgICAgICAgICBsZXQgZW5kTGluZSA9IG1hdGNoWzRdO1xuICAgICAgICAgICAgICBsZXQgZW5kQ29sID0gbWF0Y2hbNV07XG4gICAgICAgICAgICAgIGNvbnN0IGxldmVsID0gbWF0Y2hbNl07XG4gICAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBtYXRjaFs3XTtcbiAgICAgICAgICAgICAgaWYgKGxldmVsID09PSAnZXJyb3InIHx8IGxldmVsID09PSAnd2FybmluZycgfHwgbXNnID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgbXNnID0ge1xuICAgICAgICAgICAgICAgICAgbWVzc2FnZTogbWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgIGZpbGU6IGZpbGVQYXRoLFxuICAgICAgICAgICAgICAgICAgbGluZTogc3RhcnRMaW5lLFxuICAgICAgICAgICAgICAgICAgbGluZV9lbmQ6IGVuZExpbmUsXG4gICAgICAgICAgICAgICAgICBjb2w6IHN0YXJ0Q29sLFxuICAgICAgICAgICAgICAgICAgY29sX2VuZDogZW5kQ29sLFxuICAgICAgICAgICAgICAgICAgdHlwZTogbGV2ZWwydHlwZShsZXZlbCksXG4gICAgICAgICAgICAgICAgICBzZXZlcml0eTogbGV2ZWwyc2V2ZXJpdHkobGV2ZWwpLFxuICAgICAgICAgICAgICAgICAgdHJhY2U6IFtdXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBtZXNzYWdlcy5wdXNoKG1zZyk7XG4gICAgICAgICAgICAgICAgc3ViID0gbnVsbDtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoZmlsZVBhdGguc3RhcnRzV2l0aCgnPCcpKSB7XG4gICAgICAgICAgICAgICAgICAvLyBUaGUgbWVzc2FnZSBoYXMgaW5jb3JyZWN0IGZpbGUgbGluaywgb21pdCBpdFxuICAgICAgICAgICAgICAgICAgZmlsZVBhdGggPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICBzdGFydExpbmUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICBzdGFydENvbCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgIGVuZExpbmUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICBlbmRDb2wgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChtc2cuZmlsZS5zdGFydHNXaXRoKCc8JykpIHtcbiAgICAgICAgICAgICAgICAgIC8vIFRoZSByb290IG1lc3NhZ2UgaGFzIGluY29ycmVjdCBmaWxlIGxpbmssIHVzZSB0aGUgb25lIGZyb20gdGhlIGV4dGVuZGVkIG1lc3NzYWdlXG4gICAgICAgICAgICAgICAgICBtc2cuZmlsZSA9IGZpbGVQYXRoO1xuICAgICAgICAgICAgICAgICAgbXNnLmxpbmUgPSBzdGFydExpbmU7XG4gICAgICAgICAgICAgICAgICBtc2cubGluZV9lbmQgPSBlbmRMaW5lO1xuICAgICAgICAgICAgICAgICAgbXNnLmNvbCA9IHN0YXJ0Q29sO1xuICAgICAgICAgICAgICAgICAgbXNnLmNvbF9lbmQgPSBlbmRDb2w7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHN1YiA9IHtcbiAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICBmaWxlOiBmaWxlUGF0aCxcbiAgICAgICAgICAgICAgICAgIGxpbmU6IHN0YXJ0TGluZSxcbiAgICAgICAgICAgICAgICAgIGxpbmVfZW5kOiBlbmRMaW5lLFxuICAgICAgICAgICAgICAgICAgY29sOiBzdGFydENvbCxcbiAgICAgICAgICAgICAgICAgIGNvbF9lbmQ6IGVuZENvbCxcbiAgICAgICAgICAgICAgICAgIHR5cGU6IGxldmVsMnR5cGUobGV2ZWwpLFxuICAgICAgICAgICAgICAgICAgc2V2ZXJpdHk6IGxldmVsMnNldmVyaXR5KGxldmVsKVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgbXNnLnRyYWNlLnB1c2goc3ViKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIHBhbmljXG4gICAgICAgICAgICAgIGNvbnN0IHBhcnNlZFF0eSA9IHRyeVBhcnNlUGFuaWMobGluZXMsIGksIHBhbmljc04gPCBwYW5pY3NMaW1pdCk7XG4gICAgICAgICAgICAgIGlmIChwYXJzZWRRdHkgPiAwKSB7XG4gICAgICAgICAgICAgICAgbXNnID0gbnVsbDtcbiAgICAgICAgICAgICAgICBzdWIgPSBudWxsO1xuICAgICAgICAgICAgICAgIGkgKz0gcGFyc2VkUXR5IC0gMTsgLy8gU3VidHJhY3Qgb25lIGJlY2F1c2UgdGhlIGN1cnJlbnQgbGluZSBpcyBhbHJlYWR5IGNvdW50ZWRcbiAgICAgICAgICAgICAgICBwYW5pY3NOICs9IDE7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoc3ViICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgLy8gSnVzdCBhIGRlc2NyaXB0aW9uIGluIHRoZSBjdXJyZW50IGJsb2NrLiBPbmx5IGFkZCBpdCB3aGVuIGluIHN1Ym1lc3NhZ2VcbiAgICAgICAgICAgICAgICAvLyBiZWNhdXNlIExpbnRlciBkb2VzIHRoZSBqb2IgZm9yIGhpZ2gtbGV2ZWwgbWVzc2FnZXMuXG4gICAgICAgICAgICAgICAgc3ViLm1lc3NhZ2UgKz0gJ1xcbicgKyBsaW5lO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGhpZGRlblBhbmljc04gPSBwYW5pY3NOIC0gcGFuaWNzTGltaXQ7XG4gICAgICAgIGlmIChoaWRkZW5QYW5pY3NOID09PSAxKSB7XG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdPbmUgbW9yZSBwYW5pYyBpcyBoaWRkZW4nLCB7IGRpc21pc3NhYmxlOiB0cnVlIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGhpZGRlblBhbmljc04gPiAxKSB7XG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKGhpZGRlblBhbmljc04gKyAnIG1vcmUgcGFuaWNzIGFyZSBoaWRkZW4nLCB7IGRpc21pc3NhYmxlOiB0cnVlIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtZXNzYWdlcztcbiAgICAgIH1cblxuICAgICAgLy8gQ2hlY2tzIGlmIHRoZSBnaXZlbiBvYmplY3QgcmVwcmVzZW50cyB0aGUgcm9vdCBvZiB0aGUgcHJvamVjdCBvciBmaWxlIHN5c3RlbVxuICAgICAgZnVuY3Rpb24gaXNSb290KHBhcnRzKSB7XG4gICAgICAgIGlmIChwYXJ0cy5kaXIgPT09IHBhcnRzLnJvb3QpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTsgICAgLy8gVGhlIGZpbGUgc3lzdGVtIHJvb3RcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYXRvbS5wcm9qZWN0LmdldFBhdGhzKCkuc29tZShwID0+IHtcbiAgICAgICAgICByZXR1cm4gcGFydHMuZGlyID09PSBwO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gUmV0dXJucyB0aGUgY2xvc2VzdCBkaXJlY3Rvcnkgd2l0aCBDYXJnby50b21sIGluIGl0LlxuICAgICAgLy8gSWYgdGhlcmUncyBubyBzdWNoIGRpcmVjdG9yeSwgcmV0dXJucyB1bmRlZmluZWQuXG4gICAgICBmdW5jdGlvbiBmaW5kQ2FyZ29Qcm9qZWN0RGlyKHApIHtcbiAgICAgICAgY29uc3QgcGFydHMgPSBwYXRoLnBhcnNlKHApO1xuICAgICAgICBjb25zdCByb290ID0gaXNSb290KHBhcnRzKTtcbiAgICAgICAgY29uc3QgY2FyZ29Ub21sID0gcGF0aC5mb3JtYXQoe1xuICAgICAgICAgIGRpcjogcGFydHMuZGlyLFxuICAgICAgICAgIGJhc2U6ICdDYXJnby50b21sJ1xuICAgICAgICB9KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoZnMuc3RhdFN5bmMoY2FyZ29Ub21sKS5pc0ZpbGUoKSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgZGlyOiBwYXJ0cy5kaXIsXG4gICAgICAgICAgICAgIHJvb3Q6IHJvb3RcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgaWYgKGUuY29kZSAhPT0gJ0VOT0VOVCcpIHsgIC8vIE5vIHN1Y2ggZmlsZSAoQ2FyZ28udG9tbClcbiAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChyb290KSB7XG4gICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmluZENhcmdvUHJvamVjdERpcihwYXJ0cy5kaXIpO1xuICAgICAgfVxuXG4gICAgICAvLyBUaGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCBiZWZvcmUgZXZlcnkgYnVpbGQuIEl0IGZpbmRzIHRoZSBjbG9zZXN0XG4gICAgICAvLyBDYXJnby50b21sIGZpbGUgaW4gdGhlIHBhdGggYW5kIHVzZXMgaXRzIGRpcmVjdG9yeSBhcyB3b3JraW5nLlxuICAgICAgZnVuY3Rpb24gcHJlcGFyZUJ1aWxkKGJ1aWxkQ2ZnKSB7XG4gICAgICAgIC8vIENvbW1vbiBidWlsZCBjb21tYW5kIHBhcmFtZXRlcnNcbiAgICAgICAgYnVpbGRDZmcuZXhlYyA9IGF0b20uY29uZmlnLmdldCgnYnVpbGQtY2FyZ28uY2FyZ29QYXRoJyk7XG4gICAgICAgIGJ1aWxkQ2ZnLmVudiA9IHt9O1xuICAgICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdidWlsZC1jYXJnby5qc29uRXJyb3JzJykpIHtcbiAgICAgICAgICBidWlsZENmZy5lbnYuUlVTVEZMQUdTID0gJy1aIHVuc3RhYmxlLW9wdGlvbnMgLS1lcnJvci1mb3JtYXQ9anNvbic7XG4gICAgICAgIH0gZWxzZSBpZiAocHJvY2Vzcy5wbGF0Zm9ybSAhPT0gJ3dpbjMyJykge1xuICAgICAgICAgIGJ1aWxkQ2ZnLmVudi5URVJNID0gJ3h0ZXJtJztcbiAgICAgICAgICBidWlsZENmZy5lbnYuUlVTVEZMQUdTID0gJy0tY29sb3I9YWx3YXlzJztcbiAgICAgICAgfVxuICAgICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdidWlsZC1jYXJnby5iYWNrdHJhY2VUeXBlJykgIT09ICdPZmYnKSB7XG4gICAgICAgICAgYnVpbGRDZmcuZW52LlJVU1RfQkFDS1RSQUNFID0gJzEnO1xuICAgICAgICB9XG4gICAgICAgIGJ1aWxkQ2ZnLmFyZ3MgPSBidWlsZENmZy5hcmdzIHx8IFtdO1xuICAgICAgICBhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLWNhcmdvLnZlcmJvc2UnKSAmJiBidWlsZENmZy5hcmdzLnB1c2goJy0tdmVyYm9zZScpO1xuXG4gICAgICAgIC8vIFN1YnN0aXR1dGUgd29ya2luZyBkaXJlY3RvcnkgaWYgd2UgYXJlIGluIGEgbXVsdGktY3JhdGUgZW52aXJvbm1lbnRcbiAgICAgICAgaWYgKGF0b20uY29uZmlnLmdldCgnYnVpbGQtY2FyZ28ubXVsdGlDcmF0ZVByb2plY3RzJykpIHtcbiAgICAgICAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgICAgICAgYnVpbGRDZmcuY3dkID0gdW5kZWZpbmVkO1xuICAgICAgICAgIGlmIChlZGl0b3IgJiYgZWRpdG9yLmdldFBhdGgoKSkge1xuICAgICAgICAgICAgY29uc3Qgd2RJbmZvID0gZmluZENhcmdvUHJvamVjdERpcihlZGl0b3IuZ2V0UGF0aCgpKTtcbiAgICAgICAgICAgIGlmICh3ZEluZm8pIHtcbiAgICAgICAgICAgICAgaWYgKCF3ZEluZm8ucm9vdCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHAgPSBwYXRoLnBhcnNlKHdkSW5mby5kaXIpO1xuICAgICAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKCdCdWlsZGluZyAnICsgcC5iYXNlICsgJy4uLicpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGJ1aWxkQ2ZnLmN3ZCA9IHdkSW5mby5kaXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghYnVpbGRDZmcuY3dkICYmIGF0b20ucHJvamVjdC5nZXRQYXRocygpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAvLyBCdWlsZCBpbiB0aGUgcm9vdCBvZiB0aGUgZmlyc3QgcGF0aCBieSBkZWZhdWx0XG4gICAgICAgICAgYnVpbGRDZmcuY3dkID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClbMF07XG4gICAgICAgIH1cbiAgICAgICAgYnVpbGRXb3JrRGlyID0gYnVpbGRDZmcuY3dkO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBjb21tYW5kcyA9IFtcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICdDYXJnbzogYnVpbGQgKGRlYnVnKScsXG4gICAgICAgICAgYXRvbUNvbW1hbmROYW1lOiAnY2FyZ286YnVpbGQtZGVidWcnLFxuICAgICAgICAgIGFyZ3NDZmc6IFsgJ2J1aWxkJyBdXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnQ2FyZ286IGJ1aWxkIChyZWxlYXNlKScsXG4gICAgICAgICAgYXRvbUNvbW1hbmROYW1lOiAnY2FyZ286YnVpbGQtcmVsZWFzZScsXG4gICAgICAgICAgYXJnc0NmZzogWyAnYnVpbGQnLCAnLS1yZWxlYXNlJyBdXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnQ2FyZ286IGJlbmNoJyxcbiAgICAgICAgICBhdG9tQ29tbWFuZE5hbWU6ICdjYXJnbzpiZW5jaCcsXG4gICAgICAgICAgYXJnc0NmZzogWyAnYmVuY2gnIF1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICdDYXJnbzogY2xlYW4nLFxuICAgICAgICAgIGF0b21Db21tYW5kTmFtZTogJ2NhcmdvOmNsZWFuJyxcbiAgICAgICAgICBhcmdzQ2ZnOiBbICdjbGVhbicgXVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogJ0NhcmdvOiBkb2MnLFxuICAgICAgICAgIGF0b21Db21tYW5kTmFtZTogJ2NhcmdvOmRvYycsXG4gICAgICAgICAgYXJnc0NmZzogWyAnZG9jJyBdLFxuICAgICAgICAgIHByZUNvbmZpZzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgYXRvbS5jb25maWcuZ2V0KCdidWlsZC1jYXJnby5vcGVuRG9jcycpICYmIHRoaXMuYXJncy5wdXNoKCctLW9wZW4nKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnQ2FyZ286IHJ1biAoZGVidWcpJyxcbiAgICAgICAgICBhdG9tQ29tbWFuZE5hbWU6ICdjYXJnbzpydW4tZGVidWcnLFxuICAgICAgICAgIGFyZ3NDZmc6IFsgJ3J1bicgXVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogJ0NhcmdvOiBydW4gKHJlbGVhc2UpJyxcbiAgICAgICAgICBhdG9tQ29tbWFuZE5hbWU6ICdjYXJnbzpydW4tcmVsZWFzZScsXG4gICAgICAgICAgYXJnc0NmZzogWyAncnVuJywgJy0tcmVsZWFzZScgXVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogJ0NhcmdvOiB0ZXN0JyxcbiAgICAgICAgICBhdG9tQ29tbWFuZE5hbWU6ICdjYXJnbzpydW4tdGVzdCcsXG4gICAgICAgICAgYXJnc0NmZzogWyAndGVzdCcgXVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogJ0NhcmdvOiB1cGRhdGUnLFxuICAgICAgICAgIGF0b21Db21tYW5kTmFtZTogJ2NhcmdvOnVwZGF0ZScsXG4gICAgICAgICAgYXJnc0NmZzogWyAndXBkYXRlJyBdXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnQ2FyZ286IGJ1aWxkIGV4YW1wbGUnLFxuICAgICAgICAgIGF0b21Db21tYW5kTmFtZTogJ2NhcmdvOmJ1aWxkLWV4YW1wbGUnLFxuICAgICAgICAgIGFyZ3NDZmc6IFsgJ2J1aWxkJywgJy0tZXhhbXBsZScsICd7RklMRV9BQ1RJVkVfTkFNRV9CQVNFfScgXVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogJ0NhcmdvOiBydW4gZXhhbXBsZScsXG4gICAgICAgICAgYXRvbUNvbW1hbmROYW1lOiAnY2FyZ286cnVuLWV4YW1wbGUnLFxuICAgICAgICAgIGFyZ3NDZmc6IFsgJ3J1bicsICctLWV4YW1wbGUnLCAne0ZJTEVfQUNUSVZFX05BTUVfQkFTRX0nIF1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICdDYXJnbzogcnVuIGJpbicsXG4gICAgICAgICAgYXRvbUNvbW1hbmROYW1lOiAnY2FyZ286cnVuLWJpbicsXG4gICAgICAgICAgYXJnc0NmZzogWyAncnVuJywgJy0tYmluJywgJ3tGSUxFX0FDVElWRV9OQU1FX0JBU0V9JyBdXG4gICAgICAgIH1cbiAgICAgIF07XG5cbiAgICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLWNhcmdvLmV4dENvbW1hbmRzLmNhcmdvQ2xpcHB5JykpIHtcbiAgICAgICAgY29tbWFuZHMucHVzaCh7XG4gICAgICAgICAgbmFtZTogJ0NhcmdvOiBDbGlwcHknLFxuICAgICAgICAgIGF0b21Db21tYW5kTmFtZTogJ2NhcmdvOmNsaXBweScsXG4gICAgICAgICAgYXJnc0NmZzogWyAnY2xpcHB5JyBdXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdidWlsZC1jYXJnby5leHRDb21tYW5kcy5jYXJnb0NoZWNrJykpIHtcbiAgICAgICAgY29tbWFuZHMucHVzaCh7XG4gICAgICAgICAgbmFtZTogJ0NhcmdvOiBjaGVjaycsXG4gICAgICAgICAgYXRvbUNvbW1hbmROYW1lOiAnY2FyZ286Y2hlY2snLFxuICAgICAgICAgIGFyZ3NDZmc6IFsgJ2NoZWNrJyBdXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBjb21tYW5kcy5mb3JFYWNoKGNtZCA9PiB7XG4gICAgICAgIGNtZC5leGVjID0gYXRvbS5jb25maWcuZ2V0KCdidWlsZC1jYXJnby5jYXJnb1BhdGgnKTtcbiAgICAgICAgY21kLnNoID0gZmFsc2U7XG4gICAgICAgIGNtZC5mdW5jdGlvbk1hdGNoID0gbWF0Y2hGdW5jdGlvbjtcbiAgICAgICAgY21kLnByZUJ1aWxkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHRoaXMuYXJncyA9IHRoaXMuYXJnc0NmZy5zbGljZSgwKTsgICAgLy8gQ2xvbmUgaW5pdGlhbCBhcmd1bWVudHNcbiAgICAgICAgICBpZiAodGhpcy5wcmVDb25maWcpIHtcbiAgICAgICAgICAgIHRoaXMucHJlQ29uZmlnKCk7ICAgICAgICAgICAgICAgICAgIC8vIEFsbG93IHRoZSBjb21tYW5kIHRvIGNvbmZpZ3VyZSBpdHMgYXJndW1lbnRzXG4gICAgICAgICAgfVxuICAgICAgICAgIHByZXBhcmVCdWlsZCh0aGlzKTtcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gY29tbWFuZHM7XG4gICAgfVxuICB9O1xufVxuIl19
//# sourceURL=/home/takaaki/.atom/packages/build-cargo/lib/cargo.js
