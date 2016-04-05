Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _minimapLinterBinding = require('./minimap-linter-binding');

var _minimapLinterBinding2 = _interopRequireDefault(_minimapLinterBinding);

var _minimapLinterConfig = require('./minimap-linter-config');

var _minimapLinterConfig2 = _interopRequireDefault(_minimapLinterConfig);

'use babel';

var MinimapLinter = (function () {
  function MinimapLinter() {
    _classCallCheck(this, MinimapLinter);

    this.config = _minimapLinterConfig2['default'];
    this.bindings = [];
  }

  // Atom package lifecycle events start

  _createClass(MinimapLinter, [{
    key: 'activate',
    value: function activate() {
      this.subscriptions = new _atom.CompositeDisposable();
    }
  }, {
    key: 'deactivate',
    value: function deactivate() {
      this.minimapProvider.unregisterPlugin('linter');
      this.minimapProvider = null;
    }

    // Atom package lifecycle events end

    // Package dependencies provisioning start
  }, {
    key: 'consumeMinimapServiceV1',
    value: function consumeMinimapServiceV1(minimapProvider) {
      this.minimapProvider = minimapProvider;
      this.minimapProvider.registerPlugin('linter', this);
    }

    // Package dependencies provisioning end

    // Minimap plugin lifecycle events start
  }, {
    key: 'isActive',
    value: function isActive() {
      return this.minimapsSubscription !== undefined && !this.minimapsSubscription.disposed;
    }
  }, {
    key: 'activatePlugin',
    value: function activatePlugin() {
      var _this = this;

      if (this.isActive()) return;

      // Handle each minimap
      this.minimapsSubscription = this.minimapProvider.observeMinimaps(function (editorMinimap) {
        var subscription = undefined,
            binding = undefined;
        _this.bindings.push(binding = new _minimapLinterBinding2['default'](editorMinimap));

        // minimap destroyed
        return _this.subscriptions.add(subscription = editorMinimap.onDidDestroy(function () {
          binding.destroy();
          _this.subscriptions.remove(subscription);
          return subscription.dispose();
        }));
      });
    }
  }, {
    key: 'deactivatePlugin',
    value: function deactivatePlugin() {
      this.bindings.forEach(function (binding) {
        return binding.destroy();
      });
      this.bindings = [];
      this.minimapsSubscription.dispose();
      return this.subscriptions.dispose();
    }

    // Minimap plugin lifecycle events end
  }]);

  return MinimapLinter;
})();

exports['default'] = new MinimapLinter();
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvbWluaW1hcC1saW50ZXIvbGliL21pbmltYXAtbGludGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7b0JBQ29DLE1BQU07O29DQUNULDBCQUEwQjs7OzttQ0FDbEMseUJBQXlCOzs7O0FBSGxELFdBQVcsQ0FBQzs7SUFLTixhQUFhO0FBQ0osV0FEVCxhQUFhLEdBQ0Q7MEJBRFosYUFBYTs7QUFFYixRQUFJLENBQUMsTUFBTSxtQ0FBZSxDQUFDO0FBQzNCLFFBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO0dBQ3BCOzs7O2VBSkMsYUFBYTs7V0FPUCxvQkFBRztBQUNULFVBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUM7S0FDaEQ7OztXQUVTLHNCQUFHO0FBQ1gsVUFBSSxDQUFDLGVBQWUsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNoRCxVQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQztLQUM3Qjs7Ozs7OztXQUlzQixpQ0FBQyxlQUFlLEVBQUU7QUFDdkMsVUFBSSxDQUFDLGVBQWUsR0FBRyxlQUFlLENBQUM7QUFDdkMsVUFBSSxDQUFDLGVBQWUsQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQ3JEOzs7Ozs7O1dBSU8sb0JBQUc7QUFDVCxhQUFPLElBQUksQ0FBQyxvQkFBb0IsS0FBSyxTQUFTLElBQUksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFDO0tBQ3ZGOzs7V0FFYSwwQkFBRzs7O0FBQ2YsVUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUUsT0FBTzs7O0FBRzVCLFVBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQyxVQUFDLGFBQWEsRUFBSztBQUNsRixZQUFJLFlBQVksWUFBQTtZQUFFLE9BQU8sWUFBQSxDQUFDO0FBQzFCLGNBQUssUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsc0NBQXlCLGFBQWEsQ0FBQyxDQUFDLENBQUM7OztBQUd0RSxlQUFPLE1BQUssYUFBYSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEdBQUcsYUFBYSxDQUFDLFlBQVksQ0FBQyxZQUFNO0FBQzVFLGlCQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDbEIsZ0JBQUssYUFBYSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUN4QyxpQkFBTyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDL0IsQ0FBQyxDQUFDLENBQUM7T0FDTCxDQUFDLENBQUM7S0FDSjs7O1dBRWUsNEJBQUc7QUFDakIsVUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsVUFBQSxPQUFPO2VBQUksT0FBTyxDQUFDLE9BQU8sRUFBRTtPQUFBLENBQUMsQ0FBQztBQUNwRCxVQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztBQUNuQixVQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDcEMsYUFBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ3JDOzs7OztTQW5EQyxhQUFhOzs7cUJBdURKLElBQUksYUFBYSxFQUFFIiwiZmlsZSI6Ii9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvbWluaW1hcC1saW50ZXIvbGliL21pbmltYXAtbGludGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgTWluaW1hcExpbnRlckJpbmRpbmcgZnJvbSAnLi9taW5pbWFwLWxpbnRlci1iaW5kaW5nJztcbmltcG9ydCBjb25maWdTY2hlbWEgZnJvbSAnLi9taW5pbWFwLWxpbnRlci1jb25maWcnO1xuXG5jbGFzcyBNaW5pbWFwTGludGVyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgIHRoaXMuY29uZmlnID0gY29uZmlnU2NoZW1hO1xuICAgICAgdGhpcy5iaW5kaW5ncyA9IFtdO1xuICAgIH1cblxuICAgIC8vIEF0b20gcGFja2FnZSBsaWZlY3ljbGUgZXZlbnRzIHN0YXJ0XG4gICAgYWN0aXZhdGUoKSB7XG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIH1cblxuICAgIGRlYWN0aXZhdGUoKSB7XG4gICAgICB0aGlzLm1pbmltYXBQcm92aWRlci51bnJlZ2lzdGVyUGx1Z2luKCdsaW50ZXInKTtcbiAgICAgIHRoaXMubWluaW1hcFByb3ZpZGVyID0gbnVsbDtcbiAgICB9XG4gICAgLy8gQXRvbSBwYWNrYWdlIGxpZmVjeWNsZSBldmVudHMgZW5kXG5cbiAgICAvLyBQYWNrYWdlIGRlcGVuZGVuY2llcyBwcm92aXNpb25pbmcgc3RhcnRcbiAgICBjb25zdW1lTWluaW1hcFNlcnZpY2VWMShtaW5pbWFwUHJvdmlkZXIpIHtcbiAgICAgIHRoaXMubWluaW1hcFByb3ZpZGVyID0gbWluaW1hcFByb3ZpZGVyO1xuICAgICAgdGhpcy5taW5pbWFwUHJvdmlkZXIucmVnaXN0ZXJQbHVnaW4oJ2xpbnRlcicsIHRoaXMpO1xuICAgIH1cbiAgICAvLyBQYWNrYWdlIGRlcGVuZGVuY2llcyBwcm92aXNpb25pbmcgZW5kXG5cbiAgICAvLyBNaW5pbWFwIHBsdWdpbiBsaWZlY3ljbGUgZXZlbnRzIHN0YXJ0XG4gICAgaXNBY3RpdmUoKSB7XG4gICAgICByZXR1cm4gdGhpcy5taW5pbWFwc1N1YnNjcmlwdGlvbiAhPT0gdW5kZWZpbmVkICYmICF0aGlzLm1pbmltYXBzU3Vic2NyaXB0aW9uLmRpc3Bvc2VkO1xuICAgIH1cblxuICAgIGFjdGl2YXRlUGx1Z2luKCkge1xuICAgICAgaWYgKHRoaXMuaXNBY3RpdmUoKSkgcmV0dXJuO1xuXG4gICAgICAvLyBIYW5kbGUgZWFjaCBtaW5pbWFwXG4gICAgICB0aGlzLm1pbmltYXBzU3Vic2NyaXB0aW9uID0gdGhpcy5taW5pbWFwUHJvdmlkZXIub2JzZXJ2ZU1pbmltYXBzKChlZGl0b3JNaW5pbWFwKSA9PiB7XG4gICAgICAgIGxldCBzdWJzY3JpcHRpb24sIGJpbmRpbmc7XG4gICAgICAgIHRoaXMuYmluZGluZ3MucHVzaChiaW5kaW5nID0gbmV3IE1pbmltYXBMaW50ZXJCaW5kaW5nKGVkaXRvck1pbmltYXApKTtcblxuICAgICAgICAvLyBtaW5pbWFwIGRlc3Ryb3llZFxuICAgICAgICByZXR1cm4gdGhpcy5zdWJzY3JpcHRpb25zLmFkZChzdWJzY3JpcHRpb24gPSBlZGl0b3JNaW5pbWFwLm9uRGlkRGVzdHJveSgoKSA9PiB7XG4gICAgICAgICAgYmluZGluZy5kZXN0cm95KCk7XG4gICAgICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLnJlbW92ZShzdWJzY3JpcHRpb24pO1xuICAgICAgICAgIHJldHVybiBzdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgICB9KSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBkZWFjdGl2YXRlUGx1Z2luKCkge1xuICAgICAgdGhpcy5iaW5kaW5ncy5mb3JFYWNoKGJpbmRpbmcgPT4gYmluZGluZy5kZXN0cm95KCkpO1xuICAgICAgdGhpcy5iaW5kaW5ncyA9IFtdO1xuICAgICAgdGhpcy5taW5pbWFwc1N1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICByZXR1cm4gdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICB9XG4gICAgLy8gTWluaW1hcCBwbHVnaW4gbGlmZWN5Y2xlIGV2ZW50cyBlbmRcbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IE1pbmltYXBMaW50ZXIoKTtcbiJdfQ==
//# sourceURL=/home/takaaki/.atom/packages/minimap-linter/lib/minimap-linter.js
