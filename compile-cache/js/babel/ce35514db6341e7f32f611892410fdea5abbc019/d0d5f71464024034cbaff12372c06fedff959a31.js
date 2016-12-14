Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = initCommands;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _atom = require('atom');

var _mainJs = require('./main.js');

var _autohideTreeViewJs = require('./autohide-tree-view.js');

'use babel';

function initCommands() {
  var _atom$commands$add;

  var disposables = new _atom.CompositeDisposable(
  // resize the tree view when project.paths changes
  atom.project.onDidChangePaths(function () {
    return (0, _autohideTreeViewJs.resizeTreeView)();
  }),

  // add command listeners
  atom.commands.add('atom-workspace', (_atom$commands$add = {}, _defineProperty(_atom$commands$add, 'tree-view:show', function treeViewShow(event) {
    event.stopImmediatePropagation();
    (0, _autohideTreeViewJs.showTreeView)();
  }), _defineProperty(_atom$commands$add, 'tree-view:hide', function treeViewHide(event) {
    event.stopImmediatePropagation();
    (0, _autohideTreeViewJs.hideTreeView)();
  }), _defineProperty(_atom$commands$add, 'tree-view:toggle', function treeViewToggle(event) {
    event.stopImmediatePropagation();
    (0, _autohideTreeViewJs.toggleTreeView)();
  }), _defineProperty(_atom$commands$add, 'tree-view:reveal-active-file', function treeViewRevealActiveFile() {
    (0, _autohideTreeViewJs.showTreeView)(0).then(function () {
      return _mainJs.treeView.scrollToEntry(_mainJs.treeView.getSelectedEntries()[0]);
    });
  }), _defineProperty(_atom$commands$add, 'tree-view:toggle-focus', function treeViewToggleFocus() {
    (0, _autohideTreeViewJs.toggleTreeView)();
  }), _defineProperty(_atom$commands$add, 'tree-view:remove', function treeViewRemove() {
    (0, _autohideTreeViewJs.resizeTreeView)();
  }), _defineProperty(_atom$commands$add, 'tree-view:paste', function treeViewPaste() {
    (0, _autohideTreeViewJs.resizeTreeView)();
  }), _atom$commands$add)),

  // hide the tree view when `esc` key is pressed
  atom.commands.add(_mainJs.treeViewEl, 'tool-panel:unfocus', function () {
    return (0, _autohideTreeViewJs.hideTreeView)();
  }));

  for (var action of ['expand', 'collapse']) {
    var _atom$commands$add2;

    disposables.add(atom.commands.add('atom-workspace', (_atom$commands$add2 = {}, _defineProperty(_atom$commands$add2, 'tree-view:' + action + '-directory', _autohideTreeViewJs.resizeTreeView), _defineProperty(_atom$commands$add2, 'tree-view:recursive-' + action + '-directory', _autohideTreeViewJs.resizeTreeView), _atom$commands$add2)));
  }

  // hide the tree view when a file is opened by a command
  for (var direction of ['', '-right', '-left', '-up', '-down']) {
    disposables.add(atom.commands.add('atom-workspace', 'tree-view:open-selected-entry' + direction, didOpenFile));
  }

  for (var i of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
    disposables.add(atom.commands.add('atom-workspace', 'tree-view:open-selected-entry-in-pane-' + i, didOpenFile));
  }

  return disposables;
}

function didOpenFile() {
  process.nextTick(function () {
    (0, _autohideTreeViewJs.storeFocusedElement)(atom.views.getView(atom.workspace.getActiveTextEditor()));
    (0, _autohideTreeViewJs.hideTreeView)();
  });
}
module.exports = exports['default'];

// tree-view commands

// this one isn't actually in the tree-view package
// but have it here for the sake of symmetry :)

// patch reveal-active-file because it doesn't work
// when the tree view isn't visible
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvYXV0b2hpZGUtdHJlZS12aWV3L2xpYi9jb21tYW5kcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7cUJBTXdCLFlBQVk7Ozs7b0JBTEYsTUFBTTs7c0JBQ0wsV0FBVzs7a0NBRUYseUJBQXlCOztBQUpyRSxXQUFXLENBQUM7O0FBTUcsU0FBUyxZQUFZLEdBQUc7OztBQUNyQyxNQUFJLFdBQVcsR0FBRzs7QUFFaEIsTUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQztXQUM1Qix5Q0FBZ0I7R0FBQSxDQUNqQjs7O0FBR0QsTUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLGdFQUUvQixnQkFBZ0IsRUFBQyxzQkFBQyxLQUFLLEVBQUU7QUFDeEIsU0FBSyxDQUFDLHdCQUF3QixFQUFFLENBQUM7QUFDakMsMkNBQWMsQ0FBQztHQUNoQix1Q0FHQSxnQkFBZ0IsRUFBQyxzQkFBQyxLQUFLLEVBQUU7QUFDeEIsU0FBSyxDQUFDLHdCQUF3QixFQUFFLENBQUM7QUFDakMsMkNBQWMsQ0FBQztHQUNoQix1Q0FDQSxrQkFBa0IsRUFBQyx3QkFBQyxLQUFLLEVBQUU7QUFDMUIsU0FBSyxDQUFDLHdCQUF3QixFQUFFLENBQUM7QUFDakMsNkNBQWdCLENBQUM7R0FDbEIsdUNBR0EsOEJBQThCLEVBQUMsb0NBQUc7QUFDakMsMENBQWEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO2FBQ25CLGlCQUFTLGFBQWEsQ0FBQyxpQkFBUyxrQkFBa0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQUEsQ0FDekQsQ0FBQztHQUNILHVDQUNBLHdCQUF3QixFQUFDLCtCQUFHO0FBQzNCLDZDQUFnQixDQUFDO0dBQ2xCLHVDQUNBLGtCQUFrQixFQUFDLDBCQUFHO0FBQ3JCLDZDQUFnQixDQUFDO0dBQ2xCLHVDQUNBLGlCQUFpQixFQUFDLHlCQUFHO0FBQ3BCLDZDQUFnQixDQUFDO0dBQ2xCLHVCQUNEOzs7QUFHRixNQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcscUJBQWEsb0JBQW9CLEVBQUU7V0FDbEQsdUNBQWM7R0FBQSxDQUNmLENBQ0YsQ0FBQzs7QUFFRixPQUFJLElBQUksTUFBTSxJQUFJLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxFQUFFOzs7QUFDeEMsZUFBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsaUZBQ2xDLE1BQU0sb0hBQ0ksTUFBTSwyRUFDOUIsQ0FBQyxDQUFDO0dBQ0w7OztBQUdELE9BQUksSUFBSSxTQUFTLElBQUksQ0FBQyxFQUFFLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLEVBQUU7QUFDNUQsZUFBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0Isb0NBQWtDLFNBQVMsRUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDO0dBQ2hIOztBQUVELE9BQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFO0FBQ3hDLGVBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLDZDQUEyQyxDQUFDLEVBQUksV0FBVyxDQUFDLENBQUMsQ0FBQztHQUNqSDs7QUFFRCxTQUFPLFdBQVcsQ0FBQztDQUNwQjs7QUFFRCxTQUFTLFdBQVcsR0FBRztBQUNyQixTQUFPLENBQUMsUUFBUSxDQUFDLFlBQU07QUFDckIsaURBQW9CLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDOUUsMkNBQWMsQ0FBQztHQUNoQixDQUFDLENBQUM7Q0FDSiIsImZpbGUiOiIvaG9tZS90YWthYWtpLy5hdG9tL3BhY2thZ2VzL2F1dG9oaWRlLXRyZWUtdmlldy9saWIvY29tbWFuZHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge3RyZWVWaWV3LCB0cmVlVmlld0VsfSBmcm9tICcuL21haW4uanMnO1xuaW1wb3J0IHtzaG93VHJlZVZpZXcsIGhpZGVUcmVlVmlldywgdG9nZ2xlVHJlZVZpZXcsXG4gIHN0b3JlRm9jdXNlZEVsZW1lbnQsIHJlc2l6ZVRyZWVWaWV3fSBmcm9tICcuL2F1dG9oaWRlLXRyZWUtdmlldy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGluaXRDb21tYW5kcygpIHtcbiAgdmFyIGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgLy8gcmVzaXplIHRoZSB0cmVlIHZpZXcgd2hlbiBwcm9qZWN0LnBhdGhzIGNoYW5nZXNcbiAgICBhdG9tLnByb2plY3Qub25EaWRDaGFuZ2VQYXRocygoKSA9PlxuICAgICAgcmVzaXplVHJlZVZpZXcoKVxuICAgICksXG5cbiAgICAvLyBhZGQgY29tbWFuZCBsaXN0ZW5lcnNcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAvLyB0cmVlLXZpZXcgY29tbWFuZHNcbiAgICAgIFsndHJlZS12aWV3OnNob3cnXShldmVudCkge1xuICAgICAgICBldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgc2hvd1RyZWVWaWV3KCk7XG4gICAgICB9LFxuICAgICAgLy8gdGhpcyBvbmUgaXNuJ3QgYWN0dWFsbHkgaW4gdGhlIHRyZWUtdmlldyBwYWNrYWdlXG4gICAgICAvLyBidXQgaGF2ZSBpdCBoZXJlIGZvciB0aGUgc2FrZSBvZiBzeW1tZXRyeSA6KVxuICAgICAgWyd0cmVlLXZpZXc6aGlkZSddKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICBoaWRlVHJlZVZpZXcoKTtcbiAgICAgIH0sXG4gICAgICBbJ3RyZWUtdmlldzp0b2dnbGUnXShldmVudCkge1xuICAgICAgICBldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgdG9nZ2xlVHJlZVZpZXcoKTtcbiAgICAgIH0sXG4gICAgICAvLyBwYXRjaCByZXZlYWwtYWN0aXZlLWZpbGUgYmVjYXVzZSBpdCBkb2Vzbid0IHdvcmtcbiAgICAgIC8vIHdoZW4gdGhlIHRyZWUgdmlldyBpc24ndCB2aXNpYmxlXG4gICAgICBbJ3RyZWUtdmlldzpyZXZlYWwtYWN0aXZlLWZpbGUnXSgpIHtcbiAgICAgICAgc2hvd1RyZWVWaWV3KDApLnRoZW4oKCkgPT5cbiAgICAgICAgICB0cmVlVmlldy5zY3JvbGxUb0VudHJ5KHRyZWVWaWV3LmdldFNlbGVjdGVkRW50cmllcygpWzBdKVxuICAgICAgICApO1xuICAgICAgfSxcbiAgICAgIFsndHJlZS12aWV3OnRvZ2dsZS1mb2N1cyddKCkge1xuICAgICAgICB0b2dnbGVUcmVlVmlldygpO1xuICAgICAgfSxcbiAgICAgIFsndHJlZS12aWV3OnJlbW92ZSddKCkge1xuICAgICAgICByZXNpemVUcmVlVmlldygpO1xuICAgICAgfSxcbiAgICAgIFsndHJlZS12aWV3OnBhc3RlJ10oKSB7XG4gICAgICAgIHJlc2l6ZVRyZWVWaWV3KCk7XG4gICAgICB9LFxuICAgIH0pLFxuXG4gICAgLy8gaGlkZSB0aGUgdHJlZSB2aWV3IHdoZW4gYGVzY2Aga2V5IGlzIHByZXNzZWRcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCh0cmVlVmlld0VsLCAndG9vbC1wYW5lbDp1bmZvY3VzJywgKCkgPT5cbiAgICAgIGhpZGVUcmVlVmlldygpXG4gICAgKSxcbiAgKTtcblxuICBmb3IobGV0IGFjdGlvbiBvZiBbJ2V4cGFuZCcsICdjb2xsYXBzZSddKSB7XG4gICAgZGlzcG9zYWJsZXMuYWRkKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgIFtgdHJlZS12aWV3OiR7YWN0aW9ufS1kaXJlY3RvcnlgXTogcmVzaXplVHJlZVZpZXcsXG4gICAgICBbYHRyZWUtdmlldzpyZWN1cnNpdmUtJHthY3Rpb259LWRpcmVjdG9yeWBdOiByZXNpemVUcmVlVmlldyxcbiAgICB9KSk7XG4gIH1cblxuICAvLyBoaWRlIHRoZSB0cmVlIHZpZXcgd2hlbiBhIGZpbGUgaXMgb3BlbmVkIGJ5IGEgY29tbWFuZFxuICBmb3IobGV0IGRpcmVjdGlvbiBvZiBbJycsICctcmlnaHQnLCAnLWxlZnQnLCAnLXVwJywgJy1kb3duJ10pIHtcbiAgICBkaXNwb3NhYmxlcy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywgYHRyZWUtdmlldzpvcGVuLXNlbGVjdGVkLWVudHJ5JHtkaXJlY3Rpb259YCwgZGlkT3BlbkZpbGUpKTtcbiAgfVxuXG4gIGZvcihsZXQgaSBvZiBbMSwgMiwgMywgNCwgNSwgNiwgNywgOCwgOV0pIHtcbiAgICBkaXNwb3NhYmxlcy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywgYHRyZWUtdmlldzpvcGVuLXNlbGVjdGVkLWVudHJ5LWluLXBhbmUtJHtpfWAsIGRpZE9wZW5GaWxlKSk7XG4gIH1cblxuICByZXR1cm4gZGlzcG9zYWJsZXM7XG59XG5cbmZ1bmN0aW9uIGRpZE9wZW5GaWxlKCkge1xuICBwcm9jZXNzLm5leHRUaWNrKCgpID0+IHtcbiAgICBzdG9yZUZvY3VzZWRFbGVtZW50KGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkpKTtcbiAgICBoaWRlVHJlZVZpZXcoKTtcbiAgfSk7XG59XG4iXX0=
//# sourceURL=/home/takaaki/.atom/packages/autohide-tree-view/lib/commands.js
