(function() {
  var BufferedProcess, RacerClient, fs, path, temp, _;

  BufferedProcess = require('atom').BufferedProcess;

  _ = require('underscore-plus');

  fs = require('fs');

  temp = require('temp').track();

  path = require('path');

  module.exports = RacerClient = (function() {
    var check_generator;

    function RacerClient() {}

    RacerClient.prototype.racer_bin = null;

    RacerClient.prototype.rust_src = null;

    RacerClient.prototype.cargo_home = null;

    RacerClient.prototype.project_path = null;

    RacerClient.prototype.candidates = null;

    RacerClient.prototype.last_stderr = null;

    RacerClient.prototype.last_process = null;

    check_generator = function(racer_action) {
      return function(editor, row, col, cb) {
        var original_file_name, tempOptions, temp_folder_path;
        if (!this.process_env_vars()) {
          atom.notifications.addFatalError("Atom racer is not properly configured.");
          cb(null);
          return;
        }
        temp_folder_path = path.dirname(editor.getPath());
        original_file_name = path.basename(editor.getPath());
        if (temp_folder_path === ".") {
          temp_folder_path = this.project_path;
        }
        tempOptions = {
          prefix: "._" + original_file_name + ".racertmp",
          dir: temp_folder_path
        };
        temp.open(tempOptions, (function(_this) {
          return function(err, info) {
            var options, tempFilePath, text, this_process;
            if (err) {
              atom.notifications.addFatalError("Unable to create temp file: " + err);
              return cb(null);
            } else {
              tempFilePath = info.path;
              if (!tempFilePath) {
                cb(null);
              }
              text = editor.getText();
              fs.writeFileSync(tempFilePath, text);
              fs.close(info.fd);
              options = {
                command: _this.racer_bin,
                args: [racer_action, row + 1, col, tempFilePath],
                stdout: function(output) {
                  var parsed;
                  if (this_process !== _this.latest_process) {
                    return;
                  }
                  parsed = _this.parse_single(output);
                  if (parsed) {
                    _this.candidates.push(parsed);
                  }
                },
                stderr: function(output) {
                  if (this_process !== _this.latest_process) {
                    return;
                  }
                  _this.last_stderr = output;
                },
                exit: function(code) {
                  if (this_process !== _this.latest_process) {
                    return;
                  }
                  _this.candidates = _.uniq(_.compact(_.flatten(_this.candidates)), function(e) {
                    return e.word + e.file + e.type;
                  });
                  cb(_this.candidates);
                  temp.cleanup();
                  if (code === 3221225781) {
                    atom.notifications.addWarning("racer could not find a required DLL; copy racer to your Rust bin directory");
                  } else if (code !== 0) {
                    atom.notifications.addWarning("racer returned a non-zero exit code: " + code + "\n" + _this.last_stderr);
                  }
                }
              };
              _this.candidates = [];
              _this.latest_process = this_process = new BufferedProcess(options);
            }
          };
        })(this));
      };
    };

    RacerClient.prototype.check_completion = check_generator("complete");

    RacerClient.prototype.check_definition = check_generator("find-definition");

    RacerClient.prototype.process_env_vars = function() {
      var conf_bin, conf_src, config_is_valid, home, stats;
      config_is_valid = true;
      if (this.racer_bin == null) {
        conf_bin = atom.config.get("racer.racerBinPath");
        if (conf_bin) {
          try {
            stats = fs.statSync(conf_bin);
            if (stats != null ? stats.isFile() : void 0) {
              this.racer_bin = conf_bin;
            }
          } catch (_error) {}
        }
      }
      if (this.racer_bin == null) {
        config_is_valid = false;
        atom.notifications.addFatalError("racer.racerBinPath is not set in your config.");
      }
      if (this.rust_src == null) {
        conf_src = atom.config.get("racer.rustSrcPath");
        if (conf_src) {
          try {
            stats = fs.statSync(conf_src);
            if (stats != null ? stats.isDirectory() : void 0) {
              this.rust_src = conf_src;
            }
          } catch (_error) {}
        }
      }
      if (this.rust_src == null) {
        config_is_valid = false;
        atom.notifications.addFatalError("racer.rustSrcPath is not set in your config.");
      }
      if (this.cargo_home == null) {
        home = atom.config.get("racer.cargoHome");
        if (home) {
          try {
            stats = fs.statSync(home);
            if (stats != null ? stats.isDirectory() : void 0) {
              this.cargo_home = home;
            }
          } catch (_error) {}
        }
      }
      if (config_is_valid) {
        process.env.RUST_SRC_PATH = this.rust_src;
        if (this.cargo_home != null) {
          process.env.CARGO_HOME = this.cargo_home;
        }
      }
      return config_is_valid;
    };

    RacerClient.prototype.parse_single = function(line) {
      var candidate, file_name, match, matches, rcrgex;
      matches = [];
      rcrgex = /MATCH (\w*)\,(\d*)\,(\d*)\,([^\,]*)\,(\w*)\,(.*)\n/mg;
      while (match = rcrgex.exec(line)) {
        if ((typeof match !== "undefined" && match !== null ? match.length : void 0) > 4) {
          candidate = {
            word: match[1],
            line: parseInt(match[2], 10),
            column: parseInt(match[3], 10),
            filePath: match[4],
            file: "this",
            type: match[5],
            context: match[6]
          };
          file_name = path.basename(match[4]);
          if (path.extname(match[4]).indexOf(".racertmp") === 0) {
            candidate.filePath = path.dirname(match[4]) + path.sep + file_name.match(/\._(.*)\.racertmp.*?$/)[1];
          } else {
            candidate.file = file_name;
          }
          matches.push(candidate);
        }
      }
      return matches;
    };

    return RacerClient;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9yYWNlci9saWIvcmFjZXItY2xpZW50LmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSwrQ0FBQTs7QUFBQSxFQUFDLGtCQUFtQixPQUFBLENBQVEsTUFBUixFQUFuQixlQUFELENBQUE7O0FBQUEsRUFDQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBREosQ0FBQTs7QUFBQSxFQUVBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQUZMLENBQUE7O0FBQUEsRUFHQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBZSxDQUFDLEtBQWhCLENBQUEsQ0FIUCxDQUFBOztBQUFBLEVBSUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBSlAsQ0FBQTs7QUFBQSxFQU1BLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixRQUFBLGVBQUE7OzZCQUFBOztBQUFBLDBCQUFBLFNBQUEsR0FBVyxJQUFYLENBQUE7O0FBQUEsMEJBQ0EsUUFBQSxHQUFVLElBRFYsQ0FBQTs7QUFBQSwwQkFFQSxVQUFBLEdBQVksSUFGWixDQUFBOztBQUFBLDBCQUdBLFlBQUEsR0FBYyxJQUhkLENBQUE7O0FBQUEsMEJBSUEsVUFBQSxHQUFZLElBSlosQ0FBQTs7QUFBQSwwQkFLQSxXQUFBLEdBQWEsSUFMYixDQUFBOztBQUFBLDBCQU1BLFlBQUEsR0FBYyxJQU5kLENBQUE7O0FBQUEsSUFRQSxlQUFBLEdBQWtCLFNBQUMsWUFBRCxHQUFBO2FBQ2hCLFNBQUMsTUFBRCxFQUFTLEdBQVQsRUFBYyxHQUFkLEVBQW1CLEVBQW5CLEdBQUE7QUFDRSxZQUFBLGlEQUFBO0FBQUEsUUFBQSxJQUFHLENBQUEsSUFBRSxDQUFBLGdCQUFELENBQUEsQ0FBSjtBQUNFLFVBQUEsSUFBSSxDQUFDLGFBQWEsQ0FB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

//# sourceURL=/home/takaaki/.atom/packages/racer/lib/racer-client.coffee
