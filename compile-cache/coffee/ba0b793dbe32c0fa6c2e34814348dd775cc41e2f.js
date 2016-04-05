(function() {
  var CompositeDisposable, Os, Path, disposables, fs, git, nothingToShow, notifier, prepFile, showFile;

  CompositeDisposable = require('atom').CompositeDisposable;

  Os = require('os');

  Path = require('path');

  fs = require('fs-plus');

  git = require('../git');

  notifier = require('../notifier');

  nothingToShow = 'Nothing to show.';

  disposables = new CompositeDisposable;

  showFile = function(filePath) {
    var splitDirection;
    if (atom.config.get('git-plus.openInPane')) {
      splitDirection = atom.config.get('git-plus.splitPane');
      atom.workspace.getActivePane()["split" + splitDirection]();
    }
    return atom.workspace.open(filePath);
  };

  prepFile = function(text, filePath) {
    return new Promise(function(resolve, reject) {
      if ((text != null ? text.length : void 0) === 0) {
        return reject(nothingToShow);
      } else {
        return fs.writeFile(filePath, text, {
          flag: 'w+'
        }, function(err) {
          if (err) {
            return reject(err);
          } else {
            return resolve(true);
          }
        });
      }
    });
  };

  module.exports = function(repo, _arg) {
    var args, diffFilePath, diffStat, file, _ref, _ref1;
    _ref = _arg != null ? _arg : {}, diffStat = _ref.diffStat, file = _ref.file;
    diffFilePath = Path.join(repo.getPath(), "atom_git_plus.diff");
    if (file == null) {
      file = repo.relativize((_ref1 = atom.workspace.getActiveTextEditor()) != null ? _ref1.getPath() : void 0);
    }
    if (!file) {
      return notifier.addError("No open file. Select 'Diff All'.");
    }
    args = ['diff', '--color=never'];
    if (atom.config.get('git-plus.includeStagedDiff')) {
      args.push('HEAD');
    }
    if (atom.config.get('git-plus.wordDiff')) {
      args.push('--word-diff');
    }
    if (!diffStat) {
      args.push(file);
    }
    return git.cmd(args, {
      cwd: repo.getWorkingDirectory()
    }).then(function(data) {
      return prepFile((diffStat != null ? diffStat : '') + data, diffFilePath);
    }).then(function() {
      return showFile(diffFilePath);
    }).then(function(textEditor) {
      return disposables.add(textEditor.onDidDestroy(function() {
        return fs.unlink(diffFilePath);
      }));
    })["catch"](function(err) {
      if (err === nothingToShow) {
        return notifier.addInfo(err);
      } else {
        return notifier.addError(err);
      }
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvbW9kZWxzL2dpdC1kaWZmLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxnR0FBQTs7QUFBQSxFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUixFQUF2QixtQkFBRCxDQUFBOztBQUFBLEVBQ0EsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBREwsQ0FBQTs7QUFBQSxFQUVBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUZQLENBQUE7O0FBQUEsRUFHQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVIsQ0FITCxDQUFBOztBQUFBLEVBS0EsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSLENBTE4sQ0FBQTs7QUFBQSxFQU1BLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUixDQU5YLENBQUE7O0FBQUEsRUFRQSxhQUFBLEdBQWdCLGtCQVJoQixDQUFBOztBQUFBLEVBVUEsV0FBQSxHQUFjLEdBQUEsQ0FBQSxtQkFWZCxDQUFBOztBQUFBLEVBWUEsUUFBQSxHQUFXLFNBQUMsUUFBRCxHQUFBO0FBQ1QsUUFBQSxjQUFBO0FBQUEsSUFBQSxJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixxQkFBaEIsQ0FBSDtBQUNFLE1BQUEsY0FBQSxHQUFpQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isb0JBQWhCLENBQWpCLENBQUE7QUFBQSxNQUNBLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUFBLENBQStCLENBQUMsT0FBQSxHQUFPLGNBQVIsQ0FBL0IsQ0FBQSxDQURBLENBREY7S0FBQTtXQUdBLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFvQixRQUFwQixFQUpTO0VBQUEsQ0FaWCxDQUFBOztBQUFBLEVBa0JBLFFBQUEs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

//# sourceURL=/home/takaaki/.atom/packages/git-plus/lib/models/git-diff.coffee
