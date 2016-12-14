Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _underscorePlus = require('underscore-plus');

var _underscorePlus2 = _interopRequireDefault(_underscorePlus);

var _fsPlus = require('fs-plus');

var _fsPlus2 = _interopRequireDefault(_fsPlus);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _atom = require('atom');

var _decoratorsElement = require('./decorators/element');

var _decoratorsElement2 = _interopRequireDefault(_decoratorsElement);

/**
 * @access private
 */
'use babel';

var MinimapPluginGeneratorElement = (function () {
  function MinimapPluginGeneratorElement() {
    _classCallCheck(this, _MinimapPluginGeneratorElement);
  }

  _createClass(MinimapPluginGeneratorElement, [{
    key: 'createdCallback',
    value: function createdCallback() {
      this.previouslyFocusedElement = null;
      this.mode = null;

      this.modal = document.createElement('atom-panel');

      this.modal.classList.add('minimap-plugin-generator');
      this.modal.classList.add('modal');
      this.modal.classList.add('overlay');
      this.modal.classList.add('from-top');

      this.editor = atom.workspace.buildTextEditor({ mini: true });
      this.editorElement = atom.views.getView(this.editor);

      this.error = document.createElement('div');
      this.error.classList.add('error');

      this.message = document.createElement('div');
      this.message.classList.add('message');

      this.modal.appendChild(this.editorElement);
      this.modal.appendChild(this.error);
      this.modal.appendChild(this.message);

      this.appendChild(this.modal);
    }
  }, {
    key: 'attachedCallback',
    value: function attachedCallback() {
      this.previouslyFocusedElement = document.activeElement;
      this.message.textContent = 'Enter plugin path';
      this.setPathText('my-minimap-plugin');
      this.editorElement.focus();
    }
  }, {
    key: 'attach',
    value: function attach() {
      atom.views.getView(atom.workspace).appendChild(this);
    }
  }, {
    key: 'setPathText',
    value: function setPathText(placeholderName, rangeToSelect) {
      if (!rangeToSelect) {
        rangeToSelect = [0, placeholderName.length];
      }

      var packagesDirectory = this.getPackagesDirectory();

      this.editor.setText(_path2['default'].join(packagesDirectory, placeholderName));

      var pathLength = this.editor.getText().length;
      var endOfDirectoryIndex = pathLength - placeholderName.length;

      this.editor.setSelectedBufferRange([[0, endOfDirectoryIndex + rangeToSelect[0]], [0, endOfDirectoryIndex + rangeToSelect[1]]]);
    }
  }, {
    key: 'detach',
    value: function detach() {
      if (!this.parentNode) {
        return;
      }

      if (this.previouslyFocusedElement) {
        this.previouslyFocusedElement.focus();
      }

      this.parentNode.removeChild(this);
    }
  }, {
    key: 'confirm',
    value: function confirm() {
      var _this = this;

      if (this.validPackagePath()) {
        this.removeChild(this.modal);
        this.message.innerHTML = '\n        <span class=\'loading loading-spinner-tiny inline-block\'></span>\n        Generate plugin at <span class="text-primary">' + this.getPackagePath() + '</span>\n      ';

        this.createPackageFiles(function () {
          var packagePath = _this.getPackagePath();
          atom.open({ pathsToOpen: [packagePath], devMode: atom.config.get('minimap.createPluginInDevMode') });

          _this.message.innerHTML = '<span class="text-success">Plugin successfully generated, opening it now...</span>';

          setTimeout(function () {
            _this.detach();
          }, 2000);
        });
      }
    }
  }, {
    key: 'getPackagePath',
    value: function getPackagePath() {
      var packagePath = this.editor.getText();
      var packageName = _underscorePlus2['default'].dasherize(_path2['default'].basename(packagePath));

      return _path2['default'].join(_path2['default'].dirname(packagePath), packageName);
    }
  }, {
    key: 'getPackagesDirectory',
    value: function getPackagesDirectory() {
      return atom.config.get('core.projectHome') || process.env.ATOM_REPOS_HOME || _path2['default'].join(_fsPlus2['default'].getHomeDirectory(), 'github');
    }
  }, {
    key: 'validPackagePath',
    value: function validPackagePath() {
      if (_fsPlus2['default'].existsSync(this.getPackagePath())) {
        this.error.textContent = 'Path already exists at \'' + this.getPackagePath() + '\'';
        this.error.style.display = 'block';
        return false;
      } else {
        return true;
      }
    }
  }, {
    key: 'initPackage',
    value: function initPackage(packagePath, callback) {
      var templatePath = _path2['default'].resolve(__dirname, _path2['default'].join('..', 'templates', 'plugin-' + this.template));
      this.runCommand(atom.packages.getApmPath(), ['init', '-p', '' + packagePath, '--template', templatePath], callback);
    }
  }, {
    key: 'linkPackage',
    value: function linkPackage(packagePath, callback) {
      var args = ['link'];
      if (atom.config.get('minimap.createPluginInDevMode')) {
        args.push('--dev');
      }
      args.push(packagePath.toString());

      this.runCommand(atom.packages.getApmPath(), args, callback);
    }
  }, {
    key: 'installPackage',
    value: function installPackage(packagePath, callback) {
      var args = ['install'];

      this.runCommand(atom.packages.getApmPath(), args, callback, { cwd: packagePath });
    }
  }, {
    key: 'isStoredInDotAtom',
    value: function isStoredInDotAtom(packagePath) {
      var packagesPath = _path2['default'].join(atom.getConfigDirPath(), 'packages', _path2['default'].sep);
      if (packagePath.indexOf(packagesPath) === 0) {
        return true;
      }

      var devPackagesPath = _path2['default'].join(atom.getConfigDirPath(), 'dev', 'packages', _path2['default'].sep);

      return packagePath.indexOf(devPackagesPath) === 0;
    }
  }, {
    key: 'createPackageFiles',
    value: function createPackageFiles(callback) {
      var _this2 = this;

      var packagePath = this.getPackagePath();

      if (this.isStoredInDotAtom(packagePath)) {
        this.initPackage(packagePath, function () {
          _this2.installPackage(packagePath, callback);
        });
      } else {
        this.initPackage(packagePath, function () {
          _this2.linkPackage(packagePath, function () {
            _this2.installPackage(packagePath, callback);
          });
        });
      }
    }
  }, {
    key: 'runCommand',
    value: function runCommand(command, args, exit) {
      var options = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

      return new _atom.BufferedProcess({ command: command, args: args, exit: exit, options: options });
    }
  }]);

  var _MinimapPluginGeneratorElement = MinimapPluginGeneratorElement;
  MinimapPluginGeneratorElement = (0, _decoratorsElement2['default'])('minimap-plugin-generator')(MinimapPluginGeneratorElement) || MinimapPluginGeneratorElement;
  return MinimapPluginGeneratorElement;
})();

exports['default'] = MinimapPluginGeneratorElement;

atom.commands.add('minimap-plugin-generator', {
  'core:confirm': function coreConfirm() {
    this.confirm();
  },
  'core:cancel': function coreCancel() {
    this.detach();
  }
});
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvbWluaW1hcC9saWIvbWluaW1hcC1wbHVnaW4tZ2VuZXJhdG9yLWVsZW1lbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs4QkFFYyxpQkFBaUI7Ozs7c0JBQ2hCLFNBQVM7Ozs7b0JBQ1AsTUFBTTs7OztvQkFDTyxNQUFNOztpQ0FDaEIsc0JBQXNCOzs7Ozs7O0FBTjFDLFdBQVcsQ0FBQTs7SUFZVSw2QkFBNkI7V0FBN0IsNkJBQTZCOzs7O2VBQTdCLDZCQUE2Qjs7V0FFaEMsMkJBQUc7QUFDakIsVUFBSSxDQUFDLHdCQUF3QixHQUFHLElBQUksQ0FBQTtBQUNwQyxVQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTs7QUFFaEIsVUFBSSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxDQUFBOztBQUVqRCxVQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsQ0FBQTtBQUNwRCxVQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDakMsVUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFBO0FBQ25DLFVBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQTs7QUFFcEMsVUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxFQUFDLElBQUksRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFBO0FBQzFELFVBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBOztBQUVwRCxVQUFJLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENB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NkJBQTZCOzs7cUJBQTdCLDZCQUE2Qjs7QUE2SmxELElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLDBCQUEwQixFQUFFO0FBQzVDLGdCQUFjLEVBQUMsdUJBQUc7QUFBRSxRQUFJLENBQUMsT0FBTyxFQUFFLENBQUE7R0FBRTtBQUNwQyxlQUFhLEVBQUMsc0JBQUc7QUFBRSxRQUFJLENBQUMsTUFBTSxFQUFFLENBQUE7R0FBRTtDQUNuQyxDQUFDLENBQUEiLCJmaWxlIjoiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9taW5pbWFwL2xpYi9taW5pbWFwLXBsdWdpbi1nZW5lcmF0b3ItZWxlbWVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUtcGx1cydcbmltcG9ydCBmcyBmcm9tICdmcy1wbHVzJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCB7QnVmZmVyZWRQcm9jZXNzfSBmcm9tICdhdG9tJ1xuaW1wb3J0IGVsZW1lbnQgZnJvbSAnLi9kZWNvcmF0b3JzL2VsZW1lbnQnXG5cbi8qKlxuICogQGFjY2VzcyBwcml2YXRlXG4gKi9cbkBlbGVtZW50KCdtaW5pbWFwLXBsdWdpbi1nZW5lcmF0b3InKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWluaW1hcFBsdWdpbkdlbmVyYXRvckVsZW1lbnQge1xuXG4gIGNyZWF0ZWRDYWxsYmFjayAoKSB7XG4gICAgdGhpcy5wcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQgPSBudWxsXG4gICAgdGhpcy5tb2RlID0gbnVsbFxuXG4gICAgdGhpcy5tb2RhbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2F0b20tcGFuZWwnKVxuXG4gICAgdGhpcy5tb2RhbC5jbGFzc0xpc3QuYWRkKCdtaW5pbWFwLXBsdWdpbi1nZW5lcmF0b3InKVxuICAgIHRoaXMubW9kYWwuY2xhc3NMaXN0LmFkZCgnbW9kYWwnKVxuICAgIHRoaXMubW9kYWwuY2xhc3NMaXN0LmFkZCgnb3ZlcmxheScpXG4gICAgdGhpcy5tb2RhbC5jbGFzc0xpc3QuYWRkKCdmcm9tLXRvcCcpXG5cbiAgICB0aGlzLmVkaXRvciA9IGF0b20ud29ya3NwYWNlLmJ1aWxkVGV4dEVkaXRvcih7bWluaTogdHJ1ZX0pXG4gICAgdGhpcy5lZGl0b3JFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KHRoaXMuZWRpdG9yKVxuXG4gICAgdGhpcy5lcnJvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgdGhpcy5lcnJvci5jbGFzc0xpc3QuYWRkKCdlcnJvcicpXG5cbiAgICB0aGlzLm1lc3NhZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIHRoaXMubWVzc2FnZS5jbGFzc0xpc3QuYWRkKCdtZXNzYWdlJylcblxuICAgIHRoaXMubW9kYWwuYXBwZW5kQ2hpbGQodGhpcy5lZGl0b3JFbGVtZW50KVxuICAgIHRoaXMubW9kYWwuYXBwZW5kQ2hpbGQodGhpcy5lcnJvcilcbiAgICB0aGlzLm1vZGFsLmFwcGVuZENoaWxkKHRoaXMubWVzc2FnZSlcblxuICAgIHRoaXMuYXBwZW5kQ2hpbGQodGhpcy5tb2RhbClcbiAgfVxuXG4gIGF0dGFjaGVkQ2FsbGJhY2sgKCkge1xuICAgIHRoaXMucHJldmlvdXNseUZvY3VzZWRFbGVtZW50ID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudFxuICAgIHRoaXMubWVzc2FnZS50ZXh0Q29udGVudCA9ICdFbnRlciBwbHVnaW4gcGF0aCdcbiAgICB0aGlzLnNldFBhdGhUZXh0KCdteS1taW5pbWFwLXBsdWdpbicpXG4gICAgdGhpcy5lZGl0b3JFbGVtZW50LmZvY3VzKClcbiAgfVxuXG4gIGF0dGFjaCAoKSB7XG4gICAgYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKS5hcHBlbmRDaGlsZCh0aGlzKVxuICB9XG5cbiAgc2V0UGF0aFRleHQgKHBsYWNlaG9sZGVyTmFtZSwgcmFuZ2VUb1NlbGVjdCkge1xuICAgIGlmICghcmFuZ2VUb1NlbGVjdCkgeyByYW5nZVRvU2VsZWN0ID0gWzAsIHBsYWNlaG9sZGVyTmFtZS5sZW5ndGhdIH1cblxuICAgIGxldCBwYWNrYWdlc0RpcmVjdG9yeSA9IHRoaXMuZ2V0UGFja2FnZXNEaXJlY3RvcnkoKVxuXG4gICAgdGhpcy5lZGl0b3Iuc2V0VGV4dChwYXRoLmpvaW4ocGFja2FnZXNEaXJlY3RvcnksIHBsYWNlaG9sZGVyTmFtZSkpXG5cbiAgICBsZXQgcGF0aExlbmd0aCA9IHRoaXMuZWRpdG9yLmdldFRleHQoKS5sZW5ndGhcbiAgICBsZXQgZW5kT2ZEaXJlY3RvcnlJbmRleCA9IHBhdGhMZW5ndGggLSBwbGFjZWhvbGRlck5hbWUubGVuZ3RoXG5cbiAgICB0aGlzLmVkaXRvci5zZXRTZWxlY3RlZEJ1ZmZlclJhbmdlKFtcbiAgICAgIFswLCBlbmRPZkRpcmVjdG9yeUluZGV4ICsgcmFuZ2VUb1NlbGVjdFswXV0sXG4gICAgICBbMCwgZW5kT2ZEaXJlY3RvcnlJbmRleCArIHJhbmdlVG9TZWxlY3RbMV1dXG4gICAgXSlcbiAgfVxuXG4gIGRldGFjaCAoKSB7XG4gICAgaWYgKCF0aGlzLnBhcmVudE5vZGUpIHsgcmV0dXJuIH1cblxuICAgIGlmICh0aGlzLnByZXZpb3VzbHlGb2N1c2VkRWxlbWVudCkge1xuICAgICAgdGhpcy5wcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQuZm9jdXMoKVxuICAgIH1cblxuICAgIHRoaXMucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzKVxuICB9XG5cbiAgY29uZmlybSAoKSB7XG4gICAgaWYgKHRoaXMudmFsaWRQYWNrYWdlUGF0aCgpKSB7XG4gICAgICB0aGlzLnJlbW92ZUNoaWxkKHRoaXMubW9kYWwpXG4gICAgICB0aGlzLm1lc3NhZ2UuaW5uZXJIVE1MID0gYFxuICAgICAgICA8c3BhbiBjbGFzcz0nbG9hZGluZyBsb2FkaW5nLXNwaW5uZXItdGlueSBpbmxpbmUtYmxvY2snPjwvc3Bhbj5cbiAgICAgICAgR2VuZXJhdGUgcGx1Z2luIGF0IDxzcGFuIGNsYXNzPVwidGV4dC1wcmltYXJ5XCI+JHt0aGlzLmdldFBhY2thZ2VQYXRoKCl9PC9zcGFuPlxuICAgICAgYFxuXG4gICAgICB0aGlzLmNyZWF0ZVBhY2thZ2VGaWxlcygoKSA9PiB7XG4gICAgICAgIGxldCBwYWNrYWdlUGF0aCA9IHRoaXMuZ2V0UGFja2FnZVBhdGgoKVxuICAgICAgICBhdG9tLm9wZW4oe3BhdGhzVG9PcGVuOiBbcGFja2FnZVBhdGhdLCBkZXZNb2RlOiBhdG9tLmNvbmZpZy5nZXQoJ21pbmltYXAuY3JlYXRlUGx1Z2luSW5EZXZNb2RlJyl9KVxuXG4gICAgICAgIHRoaXMubWVzc2FnZS5pbm5lckhUTUwgPSAnPHNwYW4gY2xhc3M9XCJ0ZXh0LXN1Y2Nlc3NcIj5QbHVnaW4gc3VjY2Vzc2Z1bGx5IGdlbmVyYXRlZCwgb3BlbmluZyBpdCBub3cuLi48L3NwYW4+J1xuXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4geyB0aGlzLmRldGFjaCgpIH0sIDIwMDApXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIGdldFBhY2thZ2VQYXRoICgpIHtcbiAgICBsZXQgcGFja2FnZVBhdGggPSB0aGlzLmVkaXRvci5nZXRUZXh0KClcbiAgICBsZXQgcGFja2FnZU5hbWUgPSBfLmRhc2hlcml6ZShwYXRoLmJhc2VuYW1lKHBhY2thZ2VQYXRoKSlcblxuICAgIHJldHVybiBwYXRoLmpvaW4ocGF0aC5kaXJuYW1lKHBhY2thZ2VQYXRoKSwgcGFja2FnZU5hbWUpXG4gIH1cblxuICBnZXRQYWNrYWdlc0RpcmVjdG9yeSAoKSB7XG4gICAgcmV0dXJuIGF0b20uY29uZmlnLmdldCgnY29yZS5wcm9qZWN0SG9tZScpIHx8XG4gICAgICAgICAgIHByb2Nlc3MuZW52LkFUT01fUkVQT1NfSE9NRSB8fFxuICAgICAgICAgICBwYXRoLmpvaW4oZnMuZ2V0SG9tZURpcmVjdG9yeSgpLCAnZ2l0aHViJylcbiAgfVxuXG4gIHZhbGlkUGFja2FnZVBhdGggKCkge1xuICAgIGlmIChmcy5leGlzdHNTeW5jKHRoaXMuZ2V0UGFja2FnZVBhdGgoKSkpIHtcbiAgICAgIHRoaXMuZXJyb3IudGV4dENvbnRlbnQgPSBgUGF0aCBhbHJlYWR5IGV4aXN0cyBhdCAnJHt0aGlzLmdldFBhY2thZ2VQYXRoKCl9J2BcbiAgICAgIHRoaXMuZXJyb3Iuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgfVxuXG4gIGluaXRQYWNrYWdlIChwYWNrYWdlUGF0aCwgY2FsbGJhY2spIHtcbiAgICBsZXQgdGVtcGxhdGVQYXRoID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgcGF0aC5qb2luKCcuLicsICd0ZW1wbGF0ZXMnLCBgcGx1Z2luLSR7dGhpcy50ZW1wbGF0ZX1gKSlcbiAgICB0aGlzLnJ1bkNvbW1hbmQoYXRvbS5wYWNrYWdlcy5nZXRBcG1QYXRoKCksIFsnaW5pdCcsICctcCcsIGAke3BhY2thZ2VQYXRofWAsICctLXRlbXBsYXRlJywgdGVtcGxhdGVQYXRoXSwgY2FsbGJhY2spXG4gIH1cblxuICBsaW5rUGFja2FnZSAocGFja2FnZVBhdGgsIGNhbGxiYWNrKSB7XG4gICAgbGV0IGFyZ3MgPSBbJ2xpbmsnXVxuICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ21pbmltYXAuY3JlYXRlUGx1Z2luSW5EZXZNb2RlJykpIHsgYXJncy5wdXNoKCctLWRldicpIH1cbiAgICBhcmdzLnB1c2gocGFja2FnZVBhdGgudG9TdHJpbmcoKSlcblxuICAgIHRoaXMucnVuQ29tbWFuZChhdG9tLnBhY2thZ2VzLmdldEFwbVBhdGgoKSwgYXJncywgY2FsbGJhY2spXG4gIH1cblxuICBpbnN0YWxsUGFja2FnZSAocGFja2FnZVBhdGgsIGNhbGxiYWNrKSB7XG4gICAgbGV0IGFyZ3MgPSBbJ2luc3RhbGwnXVxuXG4gICAgdGhpcy5ydW5Db21tYW5kKGF0b20ucGFja2FnZXMuZ2V0QXBtUGF0aCgpLCBhcmdzLCBjYWxsYmFjaywge2N3ZDogcGFja2FnZVBhdGh9KVxuICB9XG5cbiAgaXNTdG9yZWRJbkRvdEF0b20gKHBhY2thZ2VQYXRoKSB7XG4gICAgbGV0IHBhY2thZ2VzUGF0aCA9IHBhdGguam9pbihhdG9tLmdldENvbmZpZ0RpclBhdGgoKSwgJ3BhY2thZ2VzJywgcGF0aC5zZXApXG4gICAgaWYgKHBhY2thZ2VQYXRoLmluZGV4T2YocGFja2FnZXNQYXRoKSA9PT0gMCkgeyByZXR1cm4gdHJ1ZSB9XG5cbiAgICBsZXQgZGV2UGFja2FnZXNQYXRoID0gcGF0aC5qb2luKGF0b20uZ2V0Q29uZmlnRGlyUGF0aCgpLCAnZGV2JywgJ3BhY2thZ2VzJywgcGF0aC5zZXApXG5cbiAgICByZXR1cm4gcGFja2FnZVBhdGguaW5kZXhPZihkZXZQYWNrYWdlc1BhdGgpID09PSAwXG4gIH1cblxuICBjcmVhdGVQYWNrYWdlRmlsZXMgKGNhbGxiYWNrKSB7XG4gICAgbGV0IHBhY2thZ2VQYXRoID0gdGhpcy5nZXRQYWNrYWdlUGF0aCgpXG5cbiAgICBpZiAodGhpcy5pc1N0b3JlZEluRG90QXRvbShwYWNrYWdlUGF0aCkpIHtcbiAgICAgIHRoaXMuaW5pdFBhY2thZ2UocGFja2FnZVBhdGgsICgpID0+IHtcbiAgICAgICAgdGhpcy5pbnN0YWxsUGFja2FnZShwYWNrYWdlUGF0aCwgY2FsbGJhY2spXG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmluaXRQYWNrYWdlKHBhY2thZ2VQYXRoLCAoKSA9PiB7XG4gICAgICAgIHRoaXMubGlua1BhY2thZ2UocGFja2FnZVBhdGgsICgpID0+IHtcbiAgICAgICAgICB0aGlzLmluc3RhbGxQYWNrYWdlKHBhY2thZ2VQYXRoLCBjYWxsYmFjaylcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgcnVuQ29tbWFuZCAoY29tbWFuZCwgYXJncywgZXhpdCwgb3B0aW9ucyA9IHt9KSB7XG4gICAgcmV0dXJuIG5ldyBCdWZmZXJlZFByb2Nlc3Moe2NvbW1hbmQsIGFyZ3MsIGV4aXQsIG9wdGlvbnN9KVxuICB9XG59XG5cbmF0b20uY29tbWFuZHMuYWRkKCdtaW5pbWFwLXBsdWdpbi1nZW5lcmF0b3InLCB7XG4gICdjb3JlOmNvbmZpcm0nICgpIHsgdGhpcy5jb25maXJtKCkgfSxcbiAgJ2NvcmU6Y2FuY2VsJyAoKSB7IHRoaXMuZGV0YWNoKCkgfVxufSlcbiJdfQ==
//# sourceURL=/home/takaaki/.atom/packages/minimap/lib/minimap-plugin-generator-element.js
