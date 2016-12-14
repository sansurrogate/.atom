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
atom.config.unset('build-cargo.jsonErrors');

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
  jsonErrorFormat: {
    title: 'Use JSON error format',
    description: 'Use JSON error format instead of human readable output.',
    type: 'boolean',
    'default': true,
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
        var err = require('./errors');
        var stdParser = require('./std-parser');
        var jsonParser = require('./json-parser');
        var panicParser = require('./panic-parser');

        var buildWorkDir = undefined; // The last build workding directory (might differ from the project root for multi-crate projects)
        var panicsLimit = 10; // Max number of panics to show at once

        // Split output and remove ANSI escape codes if needed
        function extractLines(output, removeEscape) {
          var lines = output.split(/\n/);
          if (removeEscape) {
            for (var i = 0; i < lines.length; i++) {
              lines[i] = lines[i].replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
            }
          }
          return lines;
        }

        function matchFunction(output) {
          var useJson = atom.config.get('build-cargo.jsonErrorFormat');
          var messages = []; // resulting collection of high-level messages
          var panicsN = 0; // quantity of panics in this output
          var lines = extractLines(output, !useJson);
          for (var i = 0; i < lines.length; i++) {
            var parsedQty = 0;

            // Try parse a JSON message
            if (useJson && lines[i].startsWith('{')) {
              jsonParser.parseMessage(lines[i], messages);
              parsedQty = 1;
            }

            // Try parse a standard output message
            if (parsedQty === 0 && !useJson) {
              parsedQty = stdParser.tryParseMessage(lines, i, messages);
            }

            // Try parse a panic
            if (parsedQty === 0) {
              parsedQty = panicParser.tryParsePanic(lines, i, panicsN < panicsLimit, buildWorkDir);
              if (parsedQty > 0) {
                panicsN += 1;
              }
            }

            if (parsedQty > 1) {
              i += parsedQty - 1; // Subtract one because the current line is already counted
            }
          }
          var hiddenPanicsN = panicsN - panicsLimit;
          if (hiddenPanicsN === 1) {
            atom.notifications.addError('One more panic is hidden', { dismissable: true });
          } else if (hiddenPanicsN > 1) {
            atom.notifications.addError(hiddenPanicsN + ' more panics are hidden', { dismissable: true });
          }
          return messages.filter(function (m) {
            return err.preprocessMessage(m, buildWorkDir);
          });
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
          if (atom.config.get('build-cargo.jsonErrorFormat')) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvYnVpbGQtY2FyZ28vbGliL2NhcmdvLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztrQkFFZSxJQUFJOzs7OztBQUZuQixXQUFXLENBQUM7O0FBS1osSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsQ0FBQyxFQUFFO0FBQ2hELE1BQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLDJCQUEyQixFQUFFLFNBQVMsQ0FBQyxDQUFDO0NBQ3pEO0FBQ0QsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxFQUFFO0FBQzdDLE1BQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLG9DQUFvQyxFQUFFLElBQUksQ0FBQyxDQUFDO0NBQzdEO0FBQ0QsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxFQUFFO0FBQzlDLE1BQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHFDQUFxQyxFQUFFLElBQUksQ0FBQyxDQUFDO0NBQzlEOztBQUVELElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLDJCQUEyQixDQUFDLENBQUM7QUFDL0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQUM1QyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0FBQzdDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLHdCQUF3QixDQUFDLENBQUM7O0FBRXJDLElBQU0sTUFBTSxHQUFHO0FBQ3BCLFdBQVMsRUFBRTtBQUNULFNBQUssRUFBRSw4QkFBOEI7QUFDckMsUUFBSSxFQUFFLFFBQVE7QUFDZCxlQUFTLE9BQU87QUFDaEIsU0FBSyxFQUFFLENBQUM7R0FDVDtBQUNELG9CQUFrQixFQUFFO0FBQ2xCLFNBQUssRUFBRSxxQ0FBcUM7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LENBQUMsdUJBQXVCLENBQUMsQ0FBQztBQUNwRCxhQUFHLENBQUMsRUFBRSxHQUFHLEtBQUssQ0FBQztBQUNmLGFBQUcsQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO0FBQ2xDLGFBQUcsQ0FBQyxRQUFRLEdBQUcsWUFBWTtBQUN6QixnQkFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsQyxnQkFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO0FBQ2xCLGtCQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7YUFDbEI7QUFDRCx3QkFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1dBQ3BCLENBQUM7U0FDSCxDQUFDLENBQUM7O0FBRUgsZUFBTyxRQUFRLENBQUM7T0FDakI7OztXQXpQVSxrQkFBa0I7T0EwUDdCO0NBQ0giLCJmaWxlIjoiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9idWlsZC1jYXJnby9saWIvY2FyZ28uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IGZzIGZyb20gJ2ZzJztcblxuLy8gVHJhbnNmZXIgZXhpc3Rpbmcgc2V0dGluZ3MgZnJvbSBwcmV2aW91cyB2ZXJzaW9ucyBvZiB0aGUgcGFja2FnZVxuaWYgKGF0b20uY29uZmlnLmdldCgnYnVpbGQtY2FyZ28uc2hvd0JhY2t0cmFjZScpKSB7XG4gIGF0b20uY29uZmlnLnNldCgnYnVpbGQtY2FyZ28uYmFja3RyYWNlVHlwZScsICdDb21wYWN0Jyk7XG59XG5pZiAoYXRvbS5jb25maWcuZ2V0KCdidWlsZC1jYXJnby5jYXJnb0NoZWNrJykpIHtcbiAgYXRvbS5jb25maWcuc2V0KCdidWlsZC1jYXJnby5leHRDb21tYW5kcy5jYXJnb0NoZWNrJywgdHJ1ZSk7XG59XG5pZiAoYXRvbS5jb25maWcuZ2V0KCdidWlsZC1jYXJnby5jYXJnb0NsaXBweScpKSB7XG4gIGF0b20uY29uZmlnLnNldCgnYnVpbGQtY2FyZ28uZXh0Q29tbWFuZHMuY2FyZ29DbGlwcHknLCB0cnVlKTtcbn1cbi8vIFJlbW92ZSBvbGQgc2V0dGluZ3NcbmF0b20uY29uZmlnLnVuc2V0KCdidWlsZC1jYXJnby5zaG93QmFja3RyYWNlJyk7XG5hdG9tLmNvbmZpZy51bnNldCgnYnVpbGQtY2FyZ28uY2FyZ29DaGVjaycpO1xuYXRvbS5jb25maWcudW5zZXQoJ2J1aWxkLWNhcmdvLmNhcmdvQ2xpcHB5Jyk7XG5hdG9tLmNvbmZpZy51bnNldCgnYnVpbGQtY2FyZ28uanNvbkVycm9ycycpO1xuXG5leHBvcnQgY29uc3QgY29uZmlnID0ge1xuICBjYXJnb1BhdGg6IHtcbiAgICB0aXRsZTogJ1BhdGggdG8gdGhlIENhcmdvIGV4ZWN1dGFibGUnLFxuICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIGRlZmF1bHQ6ICdjYXJnbycsXG4gICAgb3JkZXI6IDFcbiAgfSxcbiAgbXVsdGlDcmF0ZVByb2plY3RzOiB7XG4gICAgdGl0bGU6ICdFbmFibGUgbXVsdGktY3JhdGUgcHJvamVjdHMgc3VwcG9ydCcsXG4gICAgZGVzY3JpcHRpb246ICdCdWlsZCBpbnRlcm5hbCBjcmF0ZXMgc2VwYXJhdGVseSBiYXNlZCBvbiB0aGUgY3VycmVudCBvcGVuIGZpbGUuJyxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgb3JkZXI6IDJcbiAgfSxcbiAgdmVyYm9zZToge1xuICAgIHRpdGxlOiAnVmVyYm9zZSBDYXJnbyBvdXRwdXQnLFxuICAgIGRlc2NyaXB0aW9uOiAnUGFzcyB0aGUgLS12ZXJib3NlIGZsYWcgdG8gQ2FyZ28uJyxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgb3JkZXI6IDNcbiAgfSxcbiAgYmFja3RyYWNlVHlwZToge1xuICAgIHRpdGxlOiAnQmFja3RyYWNlJyxcbiAgICBkZXNjcmlwdGlvbjogJ1N0YWNrIGJhY2t0cmFjZSB2ZXJib3NpdHkgbGV2ZWwuIFVzZXMgdGhlIGVudmlyb25tZW50IHZhcmlhYmxlIFJVU1RfQkFDS1RSQUNFPTEgaWYgbm90IGBPZmZgLicsXG4gICAgdHlwZTogJ3N0cmluZycsXG4gICAgZGVmYXVsdDogJ09mZicsXG4gICAgZW51bTogWyAnT2ZmJywgJ0NvbXBhY3QnLCAnRnVsbCcgXSxcbiAgICBvcmRlcjogNFxuICB9LFxuICBqc29uRXJyb3JGb3JtYXQ6IHtcbiAgICB0aXRsZTogJ1VzZSBKU09OIGVycm9yIGZvcm1hdCcsXG4gICAgZGVzY3JpcHRpb246ICdVc2UgSlNPTiBlcnJvciBmb3JtYXQgaW5zdGVhZCBvZiBodW1hbiByZWFkYWJsZSBvdXRwdXQuJyxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICBvcmRlcjogNVxuICB9LFxuICBvcGVuRG9jczoge1xuICAgIHRpdGxlOiAnT3BlbiBkb2N1bWVudGF0aW9uIGluIGJyb3dzZXIgYWZ0ZXIgXFwnZG9jXFwnIHRhcmdldCBpcyBidWlsdCcsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIG9yZGVyOiA2XG4gIH0sXG4gIGV4dENvbW1hbmRzOiB7XG4gICAgdGl0bGU6ICdFeHRlbmRlZCBDb21tYW5kcycsXG4gICAgdHlwZTogJ29iamVjdCcsXG4gICAgb3JkZXI6IDcsXG4gICAgcHJvcGVydGllczoge1xuICAgICAgY2FyZ29DaGVjazoge1xuICAgICAgICB0aXRsZTogJ0VuYWJsZSBjYXJnbyBjaGVjaycsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnRW5hYmxlIHRoZSBgY2FyZ28gY2hlY2tgIENhcmdvIGNvbW1hbmQuIE9ubHkgdXNlIHRoaXMgaWYgeW91IGhhdmUgYGNhcmdvIGNoZWNrYCBpbnN0YWxsZWQuJyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgb3JkZXI6IDFcbiAgICAgIH0sXG4gICAgICBjYXJnb0NsaXBweToge1xuICAgICAgICB0aXRsZTogJ0VuYWJsZSBjYXJnbyBjbGlwcHknLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0VuYWJsZSB0aGUgYGNhcmdvIGNsaXBweWAgQ2FyZ28gY29tbWFuZCB0byBydW4gQ2xpcHB5XFwncyBsaW50cy4gT25seSB1c2UgdGhpcyBpZiB5b3UgaGF2ZSB0aGUgYGNhcmdvIGNsaXBweWAgcGFja2FnZSBpbnN0YWxsZWQuJyxcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgb3JkZXI6IDJcbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm92aWRlQnVpbGRlcigpIHtcbiAgcmV0dXJuIGNsYXNzIENhcmdvQnVpbGRQcm92aWRlciB7XG4gICAgY29uc3RydWN0b3IoY3dkKSB7XG4gICAgICB0aGlzLmN3ZCA9IGN3ZDtcbiAgICB9XG5cbiAgICBnZXROaWNlTmFtZSgpIHtcbiAgICAgIHJldHVybiAnQ2FyZ28nO1xuICAgIH1cblxuICAgIGlzRWxpZ2libGUoKSB7XG4gICAgICByZXR1cm4gZnMuZXhpc3RzU3luYyhgJHt0aGlzLmN3ZH0vQ2FyZ28udG9tbGApO1xuICAgIH1cblxuICAgIHNldHRpbmdzKCkge1xuICAgICAgY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbiAgICAgIGNvbnN0IGVyciA9IHJlcXVpcmUoJy4vZXJyb3JzJyk7XG4gICAgICBjb25zdCBzdGRQYXJzZXIgPSByZXF1aXJlKCcuL3N0ZC1wYXJzZXInKTtcbiAgICAgIGNvbnN0IGpzb25QYXJzZXIgPSByZXF1aXJlKCcuL2pzb24tcGFyc2VyJyk7XG4gICAgICBjb25zdCBwYW5pY1BhcnNlciA9IHJlcXVpcmUoJy4vcGFuaWMtcGFyc2VyJyk7XG5cbiAgICAgIGxldCBidWlsZFdvcmtEaXI7ICAgICAgICAvLyBUaGUgbGFzdCBidWlsZCB3b3JrZGluZyBkaXJlY3RvcnkgKG1pZ2h0IGRpZmZlciBmcm9tIHRoZSBwcm9qZWN0IHJvb3QgZm9yIG11bHRpLWNyYXRlIHByb2plY3RzKVxuICAgICAgY29uc3QgcGFuaWNzTGltaXQgPSAxMDsgIC8vIE1heCBudW1iZXIgb2YgcGFuaWNzIHRvIHNob3cgYXQgb25jZVxuXG4gICAgICAvLyBTcGxpdCBvdXRwdXQgYW5kIHJlbW92ZSBBTlNJIGVzY2FwZSBjb2RlcyBpZiBuZWVkZWRcbiAgICAgIGZ1bmN0aW9uIGV4dHJhY3RMaW5lcyhvdXRwdXQsIHJlbW92ZUVzY2FwZSkge1xuICAgICAgICBjb25zdCBsaW5lcyA9IG91dHB1dC5zcGxpdCgvXFxuLyk7XG4gICAgICAgIGlmIChyZW1vdmVFc2NhcGUpIHtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBsaW5lc1tpXSA9IGxpbmVzW2ldLnJlcGxhY2UoL1tcXHUwMDFiXFx1MDA5Yl1bWygpIzs/XSooPzpbMC05XXsxLDR9KD86O1swLTldezAsNH0pKik/WzAtOUEtT1JaY2YtbnFyeT0+PF0vZywgJycpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbGluZXM7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIG1hdGNoRnVuY3Rpb24ob3V0cHV0KSB7XG4gICAgICAgIGNvbnN0IHVzZUpzb24gPSBhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLWNhcmdvLmpzb25FcnJvckZvcm1hdCcpO1xuICAgICAgICBjb25zdCBtZXNzYWdlcyA9IFtdOyAgICAvLyByZXN1bHRpbmcgY29sbGVjdGlvbiBvZiBoaWdoLWxldmVsIG1lc3NhZ2VzXG4gICAgICAgIGxldCBwYW5pY3NOID0gMDsgICAgICAgIC8vIHF1YW50aXR5IG9mIHBhbmljcyBpbiB0aGlzIG91dHB1dFxuICAgICAgICBjb25zdCBsaW5lcyA9IGV4dHJhY3RMaW5lcyhvdXRwdXQsICF1c2VKc29uKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGxldCBwYXJzZWRRdHkgPSAwO1xuXG4gICAgICAgICAgLy8gVHJ5IHBhcnNlIGEgSlNPTiBtZXNzYWdlXG4gICAgICAgICAgaWYgKHVzZUpzb24gJiYgbGluZXNbaV0uc3RhcnRzV2l0aCgneycpKSB7XG4gICAgICAgICAgICBqc29uUGFyc2VyLnBhcnNlTWVzc2FnZShsaW5lc1tpXSwgbWVzc2FnZXMpO1xuICAgICAgICAgICAgcGFyc2VkUXR5ID0gMTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBUcnkgcGFyc2UgYSBzdGFuZGFyZCBvdXRwdXQgbWVzc2FnZVxuICAgICAgICAgIGlmIChwYXJzZWRRdHkgPT09IDAgJiYgIXVzZUpzb24pIHtcbiAgICAgICAgICAgIHBhcnNlZFF0eSA9IHN0ZFBhcnNlci50cnlQYXJzZU1lc3NhZ2UobGluZXMsIGksIG1lc3NhZ2VzKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBUcnkgcGFyc2UgYSBwYW5pY1xuICAgICAgICAgIGlmIChwYXJzZWRRdHkgPT09IDApIHtcbiAgICAgICAgICAgIHBhcnNlZFF0eSA9IHBhbmljUGFyc2VyLnRyeVBhcnNlUGFuaWMobGluZXMsIGksIHBhbmljc04gPCBwYW5pY3NMaW1pdCwgYnVpbGRXb3JrRGlyKTtcbiAgICAgICAgICAgIGlmIChwYXJzZWRRdHkgPiAwKSB7XG4gICAgICAgICAgICAgIHBhbmljc04gKz0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAocGFyc2VkUXR5ID4gMSkge1xuICAgICAgICAgICAgaSArPSBwYXJzZWRRdHkgLSAxOyAvLyBTdWJ0cmFjdCBvbmUgYmVjYXVzZSB0aGUgY3VycmVudCBsaW5lIGlzIGFscmVhZHkgY291bnRlZFxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBoaWRkZW5QYW5pY3NOID0gcGFuaWNzTiAtIHBhbmljc0xpbWl0O1xuICAgICAgICBpZiAoaGlkZGVuUGFuaWNzTiA9PT0gMSkge1xuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignT25lIG1vcmUgcGFuaWMgaXMgaGlkZGVuJywgeyBkaXNtaXNzYWJsZTogdHJ1ZSB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChoaWRkZW5QYW5pY3NOID4gMSkge1xuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihoaWRkZW5QYW5pY3NOICsgJyBtb3JlIHBhbmljcyBhcmUgaGlkZGVuJywgeyBkaXNtaXNzYWJsZTogdHJ1ZSB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWVzc2FnZXMuZmlsdGVyKGZ1bmN0aW9uIChtKSB7XG4gICAgICAgICAgcmV0dXJuIGVyci5wcmVwcm9jZXNzTWVzc2FnZShtLCBidWlsZFdvcmtEaXIpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gQ2hlY2tzIGlmIHRoZSBnaXZlbiBvYmplY3QgcmVwcmVzZW50cyB0aGUgcm9vdCBvZiB0aGUgcHJvamVjdCBvciBmaWxlIHN5c3RlbVxuICAgICAgZnVuY3Rpb24gaXNSb290KHBhcnRzKSB7XG4gICAgICAgIGlmIChwYXJ0cy5kaXIgPT09IHBhcnRzLnJvb3QpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTsgICAgLy8gVGhlIGZpbGUgc3lzdGVtIHJvb3RcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYXRvbS5wcm9qZWN0LmdldFBhdGhzKCkuc29tZShwID0+IHtcbiAgICAgICAgICByZXR1cm4gcGFydHMuZGlyID09PSBwO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gUmV0dXJucyB0aGUgY2xvc2VzdCBkaXJlY3Rvcnkgd2l0aCBDYXJnby50b21sIGluIGl0LlxuICAgICAgLy8gSWYgdGhlcmUncyBubyBzdWNoIGRpcmVjdG9yeSwgcmV0dXJucyB1bmRlZmluZWQuXG4gICAgICBmdW5jdGlvbiBmaW5kQ2FyZ29Qcm9qZWN0RGlyKHApIHtcbiAgICAgICAgY29uc3QgcGFydHMgPSBwYXRoLnBhcnNlKHApO1xuICAgICAgICBjb25zdCByb290ID0gaXNSb290KHBhcnRzKTtcbiAgICAgICAgY29uc3QgY2FyZ29Ub21sID0gcGF0aC5mb3JtYXQoe1xuICAgICAgICAgIGRpcjogcGFydHMuZGlyLFxuICAgICAgICAgIGJhc2U6ICdDYXJnby50b21sJ1xuICAgICAgICB9KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoZnMuc3RhdFN5bmMoY2FyZ29Ub21sKS5pc0ZpbGUoKSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgZGlyOiBwYXJ0cy5kaXIsXG4gICAgICAgICAgICAgIHJvb3Q6IHJvb3RcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgaWYgKGUuY29kZSAhPT0gJ0VOT0VOVCcpIHsgIC8vIE5vIHN1Y2ggZmlsZSAoQ2FyZ28udG9tbClcbiAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChyb290KSB7XG4gICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmluZENhcmdvUHJvamVjdERpcihwYXJ0cy5kaXIpO1xuICAgICAgfVxuXG4gICAgICAvLyBUaGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCBiZWZvcmUgZXZlcnkgYnVpbGQuIEl0IGZpbmRzIHRoZSBjbG9zZXN0XG4gICAgICAvLyBDYXJnby50b21sIGZpbGUgaW4gdGhlIHBhdGggYW5kIHVzZXMgaXRzIGRpcmVjdG9yeSBhcyB3b3JraW5nLlxuICAgICAgZnVuY3Rpb24gcHJlcGFyZUJ1aWxkKGJ1aWxkQ2ZnKSB7XG4gICAgICAgIC8vIENvbW1vbiBidWlsZCBjb21tYW5kIHBhcmFtZXRlcnNcbiAgICAgICAgYnVpbGRDZmcuZXhlYyA9IGF0b20uY29uZmlnLmdldCgnYnVpbGQtY2FyZ28uY2FyZ29QYXRoJyk7XG4gICAgICAgIGJ1aWxkQ2ZnLmVudiA9IHt9O1xuICAgICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdidWlsZC1jYXJnby5qc29uRXJyb3JGb3JtYXQnKSkge1xuICAgICAgICAgIGJ1aWxkQ2ZnLmVudi5SVVNURkxBR1MgPSAnLVogdW5zdGFibGUtb3B0aW9ucyAtLWVycm9yLWZvcm1hdD1qc29uJztcbiAgICAgICAgfSBlbHNlIGlmIChwcm9jZXNzLnBsYXRmb3JtICE9PSAnd2luMzInKSB7XG4gICAgICAgICAgYnVpbGRDZmcuZW52LlRFUk0gPSAneHRlcm0nO1xuICAgICAgICAgIGJ1aWxkQ2ZnLmVudi5SVVNURkxBR1MgPSAnLS1jb2xvcj1hbHdheXMnO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLWNhcmdvLmJhY2t0cmFjZVR5cGUnKSAhPT0gJ09mZicpIHtcbiAgICAgICAgICBidWlsZENmZy5lbnYuUlVTVF9CQUNLVFJBQ0UgPSAnMSc7XG4gICAgICAgIH1cbiAgICAgICAgYnVpbGRDZmcuYXJncyA9IGJ1aWxkQ2ZnLmFyZ3MgfHwgW107XG4gICAgICAgIGF0b20uY29uZmlnLmdldCgnYnVpbGQtY2FyZ28udmVyYm9zZScpICYmIGJ1aWxkQ2ZnLmFyZ3MucHVzaCgnLS12ZXJib3NlJyk7XG5cbiAgICAgICAgLy8gU3Vic3RpdHV0ZSB3b3JraW5nIGRpcmVjdG9yeSBpZiB3ZSBhcmUgaW4gYSBtdWx0aS1jcmF0ZSBlbnZpcm9ubWVudFxuICAgICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdidWlsZC1jYXJnby5tdWx0aUNyYXRlUHJvamVjdHMnKSkge1xuICAgICAgICAgIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICAgICAgICBidWlsZENmZy5jd2QgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgaWYgKGVkaXRvciAmJiBlZGl0b3IuZ2V0UGF0aCgpKSB7XG4gICAgICAgICAgICBjb25zdCB3ZEluZm8gPSBmaW5kQ2FyZ29Qcm9qZWN0RGlyKGVkaXRvci5nZXRQYXRoKCkpO1xuICAgICAgICAgICAgaWYgKHdkSW5mbykge1xuICAgICAgICAgICAgICBpZiAoIXdkSW5mby5yb290KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcCA9IHBhdGgucGFyc2Uod2RJbmZvLmRpcik7XG4gICAgICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oJ0J1aWxkaW5nICcgKyBwLmJhc2UgKyAnLi4uJyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgYnVpbGRDZmcuY3dkID0gd2RJbmZvLmRpcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFidWlsZENmZy5jd2QgJiYgYXRvbS5wcm9qZWN0LmdldFBhdGhzKCkubGVuZ3RoID4gMCkge1xuICAgICAgICAgIC8vIEJ1aWxkIGluIHRoZSByb290IG9mIHRoZSBmaXJzdCBwYXRoIGJ5IGRlZmF1bHRcbiAgICAgICAgICBidWlsZENmZy5jd2QgPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVswXTtcbiAgICAgICAgfVxuICAgICAgICBidWlsZFdvcmtEaXIgPSBidWlsZENmZy5jd2Q7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGNvbW1hbmRzID0gW1xuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogJ0NhcmdvOiBidWlsZCAoZGVidWcpJyxcbiAgICAgICAgICBhdG9tQ29tbWFuZE5hbWU6ICdjYXJnbzpidWlsZC1kZWJ1ZycsXG4gICAgICAgICAgYXJnc0NmZzogWyAnYnVpbGQnIF1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICdDYXJnbzogYnVpbGQgKHJlbGVhc2UpJyxcbiAgICAgICAgICBhdG9tQ29tbWFuZE5hbWU6ICdjYXJnbzpidWlsZC1yZWxlYXNlJyxcbiAgICAgICAgICBhcmdzQ2ZnOiBbICdidWlsZCcsICctLXJlbGVhc2UnIF1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICdDYXJnbzogYmVuY2gnLFxuICAgICAgICAgIGF0b21Db21tYW5kTmFtZTogJ2NhcmdvOmJlbmNoJyxcbiAgICAgICAgICBhcmdzQ2ZnOiBbICdiZW5jaCcgXVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogJ0NhcmdvOiBjbGVhbicsXG4gICAgICAgICAgYXRvbUNvbW1hbmROYW1lOiAnY2FyZ286Y2xlYW4nLFxuICAgICAgICAgIGFyZ3NDZmc6IFsgJ2NsZWFuJyBdXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnQ2FyZ286IGRvYycsXG4gICAgICAgICAgYXRvbUNvbW1hbmROYW1lOiAnY2FyZ286ZG9jJyxcbiAgICAgICAgICBhcmdzQ2ZnOiBbICdkb2MnIF0sXG4gICAgICAgICAgcHJlQ29uZmlnOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLWNhcmdvLm9wZW5Eb2NzJykgJiYgdGhpcy5hcmdzLnB1c2goJy0tb3BlbicpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICdDYXJnbzogcnVuIChkZWJ1ZyknLFxuICAgICAgICAgIGF0b21Db21tYW5kTmFtZTogJ2NhcmdvOnJ1bi1kZWJ1ZycsXG4gICAgICAgICAgYXJnc0NmZzogWyAncnVuJyBdXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnQ2FyZ286IHJ1biAocmVsZWFzZSknLFxuICAgICAgICAgIGF0b21Db21tYW5kTmFtZTogJ2NhcmdvOnJ1bi1yZWxlYXNlJyxcbiAgICAgICAgICBhcmdzQ2ZnOiBbICdydW4nLCAnLS1yZWxlYXNlJyBdXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnQ2FyZ286IHRlc3QnLFxuICAgICAgICAgIGF0b21Db21tYW5kTmFtZTogJ2NhcmdvOnJ1bi10ZXN0JyxcbiAgICAgICAgICBhcmdzQ2ZnOiBbICd0ZXN0JyBdXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnQ2FyZ286IHVwZGF0ZScsXG4gICAgICAgICAgYXRvbUNvbW1hbmROYW1lOiAnY2FyZ286dXBkYXRlJyxcbiAgICAgICAgICBhcmdzQ2ZnOiBbICd1cGRhdGUnIF1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICdDYXJnbzogYnVpbGQgZXhhbXBsZScsXG4gICAgICAgICAgYXRvbUNvbW1hbmROYW1lOiAnY2FyZ286YnVpbGQtZXhhbXBsZScsXG4gICAgICAgICAgYXJnc0NmZzogWyAnYnVpbGQnLCAnLS1leGFtcGxlJywgJ3tGSUxFX0FDVElWRV9OQU1FX0JBU0V9JyBdXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnQ2FyZ286IHJ1biBleGFtcGxlJyxcbiAgICAgICAgICBhdG9tQ29tbWFuZE5hbWU6ICdjYXJnbzpydW4tZXhhbXBsZScsXG4gICAgICAgICAgYXJnc0NmZzogWyAncnVuJywgJy0tZXhhbXBsZScsICd7RklMRV9BQ1RJVkVfTkFNRV9CQVNFfScgXVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogJ0NhcmdvOiBydW4gYmluJyxcbiAgICAgICAgICBhdG9tQ29tbWFuZE5hbWU6ICdjYXJnbzpydW4tYmluJyxcbiAgICAgICAgICBhcmdzQ2ZnOiBbICdydW4nLCAnLS1iaW4nLCAne0ZJTEVfQUNUSVZFX05BTUVfQkFTRX0nIF1cbiAgICAgICAgfVxuICAgICAgXTtcblxuICAgICAgaWYgKGF0b20uY29uZmlnLmdldCgnYnVpbGQtY2FyZ28uZXh0Q29tbWFuZHMuY2FyZ29DbGlwcHknKSkge1xuICAgICAgICBjb21tYW5kcy5wdXNoKHtcbiAgICAgICAgICBuYW1lOiAnQ2FyZ286IENsaXBweScsXG4gICAgICAgICAgYXRvbUNvbW1hbmROYW1lOiAnY2FyZ286Y2xpcHB5JyxcbiAgICAgICAgICBhcmdzQ2ZnOiBbICdjbGlwcHknIF1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLWNhcmdvLmV4dENvbW1hbmRzLmNhcmdvQ2hlY2snKSkge1xuICAgICAgICBjb21tYW5kcy5wdXNoKHtcbiAgICAgICAgICBuYW1lOiAnQ2FyZ286IGNoZWNrJyxcbiAgICAgICAgICBhdG9tQ29tbWFuZE5hbWU6ICdjYXJnbzpjaGVjaycsXG4gICAgICAgICAgYXJnc0NmZzogWyAnY2hlY2snIF1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGNvbW1hbmRzLmZvckVhY2goY21kID0+IHtcbiAgICAgICAgY21kLmV4ZWMgPSBhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLWNhcmdvLmNhcmdvUGF0aCcpO1xuICAgICAgICBjbWQuc2ggPSBmYWxzZTtcbiAgICAgICAgY21kLmZ1bmN0aW9uTWF0Y2ggPSBtYXRjaEZ1bmN0aW9uO1xuICAgICAgICBjbWQucHJlQnVpbGQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdGhpcy5hcmdzID0gdGhpcy5hcmdzQ2ZnLnNsaWNlKDApOyAgICAvLyBDbG9uZSBpbml0aWFsIGFyZ3VtZW50c1xuICAgICAgICAgIGlmICh0aGlzLnByZUNvbmZpZykge1xuICAgICAgICAgICAgdGhpcy5wcmVDb25maWcoKTsgICAgICAgICAgICAgICAgICAgLy8gQWxsb3cgdGhlIGNvbW1hbmQgdG8gY29uZmlndXJlIGl0cyBhcmd1bWVudHNcbiAgICAgICAgICB9XG4gICAgICAgICAgcHJlcGFyZUJ1aWxkKHRoaXMpO1xuICAgICAgICB9O1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBjb21tYW5kcztcbiAgICB9XG4gIH07XG59XG4iXX0=
//# sourceURL=/home/takaaki/.atom/packages/build-cargo/lib/cargo.js
