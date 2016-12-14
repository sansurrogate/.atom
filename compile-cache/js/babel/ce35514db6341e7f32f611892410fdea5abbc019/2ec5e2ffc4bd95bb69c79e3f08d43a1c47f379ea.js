Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

exports.activate = activate;
exports.deactivate = deactivate;

function _interopExportWildcard(obj, defaults) { var newObj = defaults({}, obj); delete newObj['default']; return newObj; }

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _justDebounce = require('just-debounce');

var _justDebounce2 = _interopRequireDefault(_justDebounce);

var _atom = require('atom');

var _autohideTreeViewJs = require('./autohide-tree-view.js');

var _pinViewJs = require('./pin-view.js');

var _pinViewJs2 = _interopRequireDefault(_pinViewJs);

var _configJs = require('./config.js');

var _configJs2 = _interopRequireDefault(_configJs);

var _utilsJs = require('./utils.js');

'use babel';
Object.defineProperty(exports, 'config', {
  enumerable: true,
  get: function get() {
    return _configJs.schema;
  }
});

var _serviceProviderJs = require('./service-provider.js');

_defaults(exports, _interopExportWildcard(_serviceProviderJs, _defaults));

var _touchEventsJs = require('./touch-events.js');

Object.defineProperty(exports, 'consumeTouchEvents', {
  enumerable: true,
  get: function get() {
    return _touchEventsJs.consumeTouchEvents;
  }
});
var treeView;
exports.treeView = treeView;
var treeViewEl;

exports.treeViewEl = treeViewEl;
var disposables;

function activate() {
  if (!atom.packages.isPackageLoaded('tree-view')) return atom.notifications.addError('autohide-tree-view: Could not activate because the tree-view package doesn\'t seem to be loaded');

  atom.packages.activatePackage('tree-view').then(function (pkg) {
    exports.treeView = treeView = pkg.mainModule.createView();
    exports.treeViewEl = treeViewEl = atom.views.getView(treeView);

    disposables = new _atom.CompositeDisposable(atom.workspace.onDidDestroyPaneItem(updateActivationState), atom.workspace.observePaneItems(updateActivationState), atom.config.observe('autohide-tree-view.maxWindowWidth', updateActivationState), (0, _utilsJs.domListener)(window, 'resize', (0, _justDebounce2['default'])(updateActivationState, 200)));
  });
}

function deactivate() {
  stop();
  disposables.dispose();
  var _ref = null;

  var _ref2 = _slicedToArray(_ref, 3);

  disposables = _ref2[0];
  exports.treeView = treeView = _ref2[1];
  exports.treeViewEl = treeViewEl = _ref2[2];
}

// determine if autohide should be enabled based on the window
// width, number of files open and whether the tree view is pinned
function updateActivationState() {
  if (_pinViewJs2['default'].isActive()) return;
  var isWindowSmall = window.innerWidth < (_configJs2['default'].maxWindowWidth || Infinity);
  var hasOpenFiles = atom.workspace.getPaneItems().length > 0;
  isWindowSmall && hasOpenFiles ? start() : stop();
}

var commandsDisposable;

function start() {
  var _atom$commands$add;

  if (commandsDisposable) return;
  _pinViewJs2['default'].attach();
  commandsDisposable = new _atom.CompositeDisposable(atom.commands.add('atom-workspace', (_atom$commands$add = {}, _defineProperty(_atom$commands$add, 'autohide-tree-view:pin', function autohideTreeViewPin() {
    (0, _autohideTreeViewJs.disableAutohide)();
  }), _defineProperty(_atom$commands$add, 'autohide-tree-view:unpin', function autohideTreeViewUnpin() {
    (0, _autohideTreeViewJs.enableAutohide)();
  }), _defineProperty(_atom$commands$add, 'autohide-tree-view:toggle-pinned', function autohideTreeViewTogglePinned() {
    (0, _autohideTreeViewJs.toggleAutohide)();
  }), _defineProperty(_atom$commands$add, 'autohide-tree-view:toggle-push-editor', function autohideTreeViewTogglePushEditor() {
    atom.config.set('autohide-tree-view.pushEditor', !_configJs2['default'].pushEditor);
  }), _atom$commands$add)));
  (0, _autohideTreeViewJs.enableAutohide)();
}

function stop() {
  if (!commandsDisposable) return;
  _pinViewJs2['default'].detach();
  (0, _autohideTreeViewJs.disableAutohide)();
  commandsDisposable.dispose();
  commandsDisposable = null;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvYXV0b2hpZGUtdHJlZS12aWV3L2xpYi9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OzRCQUNxQixlQUFlOzs7O29CQUNGLE1BQU07O2tDQUNzQix5QkFBeUI7O3lCQUNuRSxlQUFlOzs7O3dCQUNoQixhQUFhOzs7O3VCQUNOLFlBQVk7O0FBTnRDLFdBQVcsQ0FBQzs7OztxQkFRSixNQUFNOzs7O2lDQUNBLHVCQUF1Qjs7Ozs2QkFDSixtQkFBbUI7Ozs7OzBCQUE1QyxrQkFBa0I7OztBQUVuQixJQUFJLFFBQVEsQ0FBQzs7QUFDYixJQUFJLFVBQVUsQ0FBQzs7O0FBRXRCLElBQUksV0FBVyxDQUFDOztBQUVULFNBQVMsUUFBUSxHQUFHO0FBQ3pCLE1BQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsRUFDNUMsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxpR0FBaUcsQ0FBQyxDQUFDOztBQUV4SSxNQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxHQUFHLEVBQUs7QUFDdkQsWUFWTyxRQUFRLEdBVWYsUUFBUSxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDdkMsWUFWTyxVQUFVLEdBVWpCLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQzs7QUFFMUMsZUFBVyxHQUFHLDhCQUNaLElBQUksQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQUMscUJBQXFCLENBQUMsRUFDMUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxxQkFBcUIsQ0FBQyxFQUN0RCxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxtQ0FBbUMsRUFBRSxxQkFBcUIsQ0FBQyxFQUMvRSwwQkFBWSxNQUFNLEVBQUUsUUFBUSxFQUFFLCtCQUFTLHFCQUFxQixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQ3BFLENBQUM7R0FDSCxDQUFDLENBQUM7Q0FDSjs7QUFFTSxTQUFTLFVBQVUsR0FBRztBQUMzQixNQUFJLEVBQUUsQ0FBQztBQUNQLGFBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQzthQUNnQixJQUFJOzs7O0FBQXpDLGFBQVc7VUF6QkgsUUFBUSxHQXlCSCxRQUFRO1VBeEJiLFVBQVUsR0F3QkssVUFBVTtDQUNuQzs7OztBQUlELFNBQVMscUJBQXFCLEdBQUc7QUFDL0IsTUFBRyx1QkFBUSxRQUFRLEVBQUUsRUFBRSxPQUFPO0FBQzlCLE1BQUksYUFBYSxHQUFHLE1BQU0sQ0FBQyxVQUFVLElBQUksc0JBQU8sY0FBYyxJQUFJLFFBQVEsQ0FBQSxBQUFDLENBQUM7QUFDNUUsTUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQzVELGVBQWEsSUFBSSxZQUFZLEdBQUcsS0FBSyxFQUFFLEdBQUcsSUFBSSxFQUFFLENBQUM7Q0FDbEQ7O0FBRUQsSUFBSSxrQkFBa0IsQ0FBQzs7QUFFdkIsU0FBUyxLQUFLLEdBQUc7OztBQUNmLE1BQUcsa0JBQWtCLEVBQUUsT0FBTztBQUM5Qix5QkFBUSxNQUFNLEVBQUUsQ0FBQztBQUNqQixvQkFBa0IsR0FBRyw4QkFDbkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLGdFQUMvQix3QkFBd0IsRUFBQywrQkFBRztBQUMzQiw4Q0FBaUIsQ0FBQztHQUNuQix1Q0FDQSwwQkFBMEIsRUFBQyxpQ0FBRztBQUM3Qiw2Q0FBZ0IsQ0FBQztHQUNsQix1Q0FDQSxrQ0FBa0MsRUFBQyx3Q0FBRztBQUNyQyw2Q0FBZ0IsQ0FBQztHQUNsQix1Q0FDQSx1Q0FBdUMsRUFBQyw0Q0FBRztBQUMxQyxRQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQywrQkFBK0IsRUFBRSxDQUFDLHNCQUFPLFVBQVUsQ0FBQyxDQUFDO0dBQ3RFLHVCQUNELENBQ0gsQ0FBQztBQUNGLDJDQUFnQixDQUFDO0NBQ2xCOztBQUVELFNBQVMsSUFBSSxHQUFHO0FBQ2QsTUFBRyxDQUFDLGtCQUFrQixFQUFFLE9BQU87QUFDL0IseUJBQVEsTUFBTSxFQUFFLENBQUM7QUFDakIsNENBQWlCLENBQUM7QUFDbEIsb0JBQWtCLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDN0Isb0JBQWtCLEdBQUcsSUFBSSxDQUFDO0NBQzNCIiwiZmlsZSI6Ii9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvYXV0b2hpZGUtdHJlZS12aWV3L2xpYi9tYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5pbXBvcnQgZGVib3VuY2UgZnJvbSAnanVzdC1kZWJvdW5jZSc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtlbmFibGVBdXRvaGlkZSwgZGlzYWJsZUF1dG9oaWRlLCB0b2dnbGVBdXRvaGlkZX0gZnJvbSAnLi9hdXRvaGlkZS10cmVlLXZpZXcuanMnO1xuaW1wb3J0IHBpblZpZXcgZnJvbSAnLi9waW4tdmlldy5qcyc7XG5pbXBvcnQgY29uZmlnIGZyb20gJy4vY29uZmlnLmpzJztcbmltcG9ydCB7ZG9tTGlzdGVuZXJ9IGZyb20gJy4vdXRpbHMuanMnO1xuXG5leHBvcnQge3NjaGVtYSBhcyBjb25maWd9IGZyb20gJy4vY29uZmlnLmpzJztcbmV4cG9ydCAqIGZyb20gJy4vc2VydmljZS1wcm92aWRlci5qcyc7XG5leHBvcnQge2NvbnN1bWVUb3VjaEV2ZW50c30gZnJvbSAnLi90b3VjaC1ldmVudHMuanMnO1xuXG5leHBvcnQgdmFyIHRyZWVWaWV3O1xuZXhwb3J0IHZhciB0cmVlVmlld0VsO1xuXG52YXIgZGlzcG9zYWJsZXM7XG5cbmV4cG9ydCBmdW5jdGlvbiBhY3RpdmF0ZSgpIHtcbiAgaWYoIWF0b20ucGFja2FnZXMuaXNQYWNrYWdlTG9hZGVkKCd0cmVlLXZpZXcnKSlcbiAgICByZXR1cm4gYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdhdXRvaGlkZS10cmVlLXZpZXc6IENvdWxkIG5vdCBhY3RpdmF0ZSBiZWNhdXNlIHRoZSB0cmVlLXZpZXcgcGFja2FnZSBkb2VzblxcJ3Qgc2VlbSB0byBiZSBsb2FkZWQnKTtcblxuICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgndHJlZS12aWV3JykudGhlbigocGtnKSA9PiB7XG4gICAgdHJlZVZpZXcgPSBwa2cubWFpbk1vZHVsZS5jcmVhdGVWaWV3KCk7XG4gICAgdHJlZVZpZXdFbCA9IGF0b20udmlld3MuZ2V0Vmlldyh0cmVlVmlldyk7XG5cbiAgICBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgICAgYXRvbS53b3Jrc3BhY2Uub25EaWREZXN0cm95UGFuZUl0ZW0odXBkYXRlQWN0aXZhdGlvblN0YXRlKSxcbiAgICAgIGF0b20ud29ya3NwYWNlLm9ic2VydmVQYW5lSXRlbXModXBkYXRlQWN0aXZhdGlvblN0YXRlKSxcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2F1dG9oaWRlLXRyZWUtdmlldy5tYXhXaW5kb3dXaWR0aCcsIHVwZGF0ZUFjdGl2YXRpb25TdGF0ZSksXG4gICAgICBkb21MaXN0ZW5lcih3aW5kb3csICdyZXNpemUnLCBkZWJvdW5jZSh1cGRhdGVBY3RpdmF0aW9uU3RhdGUsIDIwMCkpLFxuICAgICk7XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVhY3RpdmF0ZSgpIHtcbiAgc3RvcCgpO1xuICBkaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIFtkaXNwb3NhYmxlcywgdHJlZVZpZXcsIHRyZWVWaWV3RWxdID0gbnVsbDtcbn1cblxuLy8gZGV0ZXJtaW5lIGlmIGF1dG9oaWRlIHNob3VsZCBiZSBlbmFibGVkIGJhc2VkIG9uIHRoZSB3aW5kb3dcbi8vIHdpZHRoLCBudW1iZXIgb2YgZmlsZXMgb3BlbiBhbmQgd2hldGhlciB0aGUgdHJlZSB2aWV3IGlzIHBpbm5lZFxuZnVuY3Rpb24gdXBkYXRlQWN0aXZhdGlvblN0YXRlKCkge1xuICBpZihwaW5WaWV3LmlzQWN0aXZlKCkpIHJldHVybjtcbiAgdmFyIGlzV2luZG93U21hbGwgPSB3aW5kb3cuaW5uZXJXaWR0aCA8IChjb25maWcubWF4V2luZG93V2lkdGggfHwgSW5maW5pdHkpO1xuICB2YXIgaGFzT3BlbkZpbGVzID0gYXRvbS53b3Jrc3BhY2UuZ2V0UGFuZUl0ZW1zKCkubGVuZ3RoID4gMDtcbiAgaXNXaW5kb3dTbWFsbCAmJiBoYXNPcGVuRmlsZXMgPyBzdGFydCgpIDogc3RvcCgpO1xufVxuXG52YXIgY29tbWFuZHNEaXNwb3NhYmxlO1xuXG5mdW5jdGlvbiBzdGFydCgpIHtcbiAgaWYoY29tbWFuZHNEaXNwb3NhYmxlKSByZXR1cm47XG4gIHBpblZpZXcuYXR0YWNoKCk7XG4gIGNvbW1hbmRzRGlzcG9zYWJsZSA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgIFsnYXV0b2hpZGUtdHJlZS12aWV3OnBpbiddKCkge1xuICAgICAgICBkaXNhYmxlQXV0b2hpZGUoKTtcbiAgICAgIH0sXG4gICAgICBbJ2F1dG9oaWRlLXRyZWUtdmlldzp1bnBpbiddKCkge1xuICAgICAgICBlbmFibGVBdXRvaGlkZSgpO1xuICAgICAgfSxcbiAgICAgIFsnYXV0b2hpZGUtdHJlZS12aWV3OnRvZ2dsZS1waW5uZWQnXSgpIHtcbiAgICAgICAgdG9nZ2xlQXV0b2hpZGUoKTtcbiAgICAgIH0sXG4gICAgICBbJ2F1dG9oaWRlLXRyZWUtdmlldzp0b2dnbGUtcHVzaC1lZGl0b3InXSgpIHtcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdhdXRvaGlkZS10cmVlLXZpZXcucHVzaEVkaXRvcicsICFjb25maWcucHVzaEVkaXRvcik7XG4gICAgICB9LFxuICAgIH0pLFxuICApO1xuICBlbmFibGVBdXRvaGlkZSgpO1xufVxuXG5mdW5jdGlvbiBzdG9wKCkge1xuICBpZighY29tbWFuZHNEaXNwb3NhYmxlKSByZXR1cm47XG4gIHBpblZpZXcuZGV0YWNoKCk7XG4gIGRpc2FibGVBdXRvaGlkZSgpO1xuICBjb21tYW5kc0Rpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICBjb21tYW5kc0Rpc3Bvc2FibGUgPSBudWxsO1xufVxuIl19
//# sourceURL=/home/takaaki/.atom/packages/autohide-tree-view/lib/main.js
