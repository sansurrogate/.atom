Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.domListener = domListener;
exports.isChildOf = isChildOf;
exports.getContentWidth = getContentWidth;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

require('array.from');

var _atom = require('atom');

var _mainJs = require('./main.js');

var _configJs = require('./config.js');

var _configJs2 = _interopRequireDefault(_configJs);

'use babel';

function domListener(el, type, cb) {
  var _ref = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

  var useCapture = _ref.useCapture;
  var delegationTarget = _ref.delegationTarget;
  var once = _ref.once;

  if (!(el instanceof EventTarget)) throw new TypeError('Failed to create DOMEventListener: parameter 1 is not of type EventTarget');

  function wrapper(event) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    if (delegationTarget) {
      target = event.target.closest(delegationTarget);
      if (el.contains(target)) cb.apply(target, [event].concat(args));
    } else {
      cb.apply(el, [event].concat(args));
    }
  }

  function onceWrapper() {
    disposable.dispose();
    wrapper.apply(null, Array.from(arguments));
  }

  var actualWrapper = once ? onceWrapper : wrapper;

  el.addEventListener(type, actualWrapper, useCapture);
  var disposable = new _atom.Disposable(function () {
    return el.removeEventListener(type, actualWrapper, useCapture);
  });

  return disposable;
}

// check if parent contains child, parent can be Node or string

function isChildOf(child, parent) {
  if (parent instanceof HTMLElement) return parent.contains(child);

  while (child.parentNode != document && child.parentNode != null) {
    if (child.parentNode.matches(parent)) return true;
    child = child.parentNode;
  }
  return false;
}

// returns the width of the .list-tree

function getContentWidth() {
  var listTrees = Array.from(_mainJs.treeViewEl.querySelectorAll('.list-tree'));
  var maxListWidth = Math.max.apply(Math, _toConsumableArray(listTrees.map(function (listTree) {
    return listTree.clientWidth;
  })));
  // only apply maxWidth if it's greater than 0
  return Math.min(Math.max(maxListWidth, _configJs2['default'].minWidth), _configJs2['default'].maxWidth || Infinity);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvYXV0b2hpZGUtdHJlZS12aWV3L2xpYi91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztRQUNPLFlBQVk7O29CQUNNLE1BQU07O3NCQUNOLFdBQVc7O3dCQUNqQixhQUFhOzs7O0FBSmhDLFdBQVcsQ0FBQzs7QUFNTCxTQUFTLFdBQVcsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBNkM7bUVBQUosRUFBRTs7TUFBeEMsVUFBVSxRQUFWLFVBQVU7TUFBRSxnQkFBZ0IsUUFBaEIsZ0JBQWdCO01BQUUsSUFBSSxRQUFKLElBQUk7O0FBQzNFLE1BQUcsRUFBRSxFQUFFLFlBQVksV0FBVyxDQUFBLEFBQUMsRUFDN0IsTUFBTSxJQUFJLFNBQVMsQ0FBQywyRUFBMkUsQ0FBQyxDQUFDOztBQUVuRyxXQUFTLE9BQU8sQ0FBQyxLQUFLLEVBQVc7c0NBQU4sSUFBSTtBQUFKLFVBQUk7OztBQUM3QixRQUFHLGdCQUFnQixFQUFFO0FBQ25CLFlBQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQ2hELFVBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFDcEIsRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztLQUMxQyxNQUFNO0FBQ0wsUUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztLQUNwQztHQUNGOztBQUVELFdBQVMsV0FBVyxHQUFHO0FBQ3JCLGNBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNyQixXQUFPLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7R0FDNUM7O0FBRUQsTUFBSSxhQUFhLEdBQUcsSUFBSSxHQUFHLFdBQVcsR0FBRyxPQUFPLENBQUM7O0FBRWpELElBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ3JELE1BQUksVUFBVSxHQUFHLHFCQUFlO1dBQzlCLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLFVBQVUsQ0FBQztHQUFBLENBQ3hELENBQUM7O0FBRUYsU0FBTyxVQUFVLENBQUM7Q0FDbkI7Ozs7QUFHTSxTQUFTLFNBQVMsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFO0FBQ3ZDLE1BQUcsTUFBTSxZQUFZLFdBQVcsRUFDOUIsT0FBTyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUVoQyxTQUFNLEtBQUssQ0FBQyxVQUFVLElBQUksUUFBUSxJQUFJLEtBQUssQ0FBQyxVQUFVLElBQUksSUFBSSxFQUFFO0FBQzlELFFBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQ2pDLE9BQU8sSUFBSSxDQUFDO0FBQ2QsU0FBSyxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUM7R0FDMUI7QUFDRCxTQUFPLEtBQUssQ0FBQztDQUNkOzs7O0FBR00sU0FBUyxlQUFlLEdBQUc7QUFDaEMsTUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxtQkFBVyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO0FBQ3RFLE1BQUksWUFBWSxHQUFHLElBQUksQ0FBQyxHQUFHLE1BQUEsQ0FBUixJQUFJLHFCQUFRLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBQSxRQUFRO1dBQUksUUFBUSxDQUFDLFdBQVc7R0FBQSxDQUFDLEVBQUMsQ0FBQzs7QUFFaEYsU0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLHNCQUFPLFFBQVEsQ0FBQyxFQUFFLHNCQUFPLFFBQVEsSUFBSSxRQUFRLENBQUMsQ0FBQztDQUN2RiIsImZpbGUiOiIvaG9tZS90YWthYWtpLy5hdG9tL3BhY2thZ2VzL2F1dG9oaWRlLXRyZWUtdmlldy9saWIvdXRpbHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbmltcG9ydCAnYXJyYXkuZnJvbSc7XG5pbXBvcnQge0Rpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHt0cmVlVmlld0VsfSBmcm9tICcuL21haW4uanMnO1xuaW1wb3J0IGNvbmZpZyBmcm9tICcuL2NvbmZpZy5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBkb21MaXN0ZW5lcihlbCwgdHlwZSwgY2IsIHt1c2VDYXB0dXJlLCBkZWxlZ2F0aW9uVGFyZ2V0LCBvbmNlfSA9IHt9KSB7XG4gIGlmKCEoZWwgaW5zdGFuY2VvZiBFdmVudFRhcmdldCkpXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRmFpbGVkIHRvIGNyZWF0ZSBET01FdmVudExpc3RlbmVyOiBwYXJhbWV0ZXIgMSBpcyBub3Qgb2YgdHlwZSBFdmVudFRhcmdldCcpO1xuXG4gIGZ1bmN0aW9uIHdyYXBwZXIoZXZlbnQsIC4uLmFyZ3MpIHtcbiAgICBpZihkZWxlZ2F0aW9uVGFyZ2V0KSB7XG4gICAgICB0YXJnZXQgPSBldmVudC50YXJnZXQuY2xvc2VzdChkZWxlZ2F0aW9uVGFyZ2V0KTtcbiAgICAgIGlmKGVsLmNvbnRhaW5zKHRhcmdldCkpXG4gICAgICAgIGNiLmFwcGx5KHRhcmdldCwgW2V2ZW50XS5jb25jYXQoYXJncykpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjYi5hcHBseShlbCwgW2V2ZW50XS5jb25jYXQoYXJncykpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG9uY2VXcmFwcGVyKCkge1xuICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgIHdyYXBwZXIuYXBwbHkobnVsbCwgQXJyYXkuZnJvbShhcmd1bWVudHMpKTtcbiAgfVxuXG4gIHZhciBhY3R1YWxXcmFwcGVyID0gb25jZSA/IG9uY2VXcmFwcGVyIDogd3JhcHBlcjtcblxuICBlbC5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGFjdHVhbFdyYXBwZXIsIHVzZUNhcHR1cmUpO1xuICB2YXIgZGlzcG9zYWJsZSA9IG5ldyBEaXNwb3NhYmxlKCgpID0+XG4gICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBhY3R1YWxXcmFwcGVyLCB1c2VDYXB0dXJlKVxuICApO1xuXG4gIHJldHVybiBkaXNwb3NhYmxlO1xufVxuXG4vLyBjaGVjayBpZiBwYXJlbnQgY29udGFpbnMgY2hpbGQsIHBhcmVudCBjYW4gYmUgTm9kZSBvciBzdHJpbmdcbmV4cG9ydCBmdW5jdGlvbiBpc0NoaWxkT2YoY2hpbGQsIHBhcmVudCkge1xuICBpZihwYXJlbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudClcbiAgICByZXR1cm4gcGFyZW50LmNvbnRhaW5zKGNoaWxkKTtcblxuICB3aGlsZShjaGlsZC5wYXJlbnROb2RlICE9IGRvY3VtZW50ICYmIGNoaWxkLnBhcmVudE5vZGUgIT0gbnVsbCkge1xuICAgIGlmKGNoaWxkLnBhcmVudE5vZGUubWF0Y2hlcyhwYXJlbnQpKVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgY2hpbGQgPSBjaGlsZC5wYXJlbnROb2RlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLy8gcmV0dXJucyB0aGUgd2lkdGggb2YgdGhlIC5saXN0LXRyZWVcbmV4cG9ydCBmdW5jdGlvbiBnZXRDb250ZW50V2lkdGgoKSB7XG4gIHZhciBsaXN0VHJlZXMgPSBBcnJheS5mcm9tKHRyZWVWaWV3RWwucXVlcnlTZWxlY3RvckFsbCgnLmxpc3QtdHJlZScpKTtcbiAgdmFyIG1heExpc3RXaWR0aCA9IE1hdGgubWF4KC4uLmxpc3RUcmVlcy5tYXAobGlzdFRyZWUgPT4gbGlzdFRyZWUuY2xpZW50V2lkdGgpKTtcbiAgLy8gb25seSBhcHBseSBtYXhXaWR0aCBpZiBpdCdzIGdyZWF0ZXIgdGhhbiAwXG4gIHJldHVybiBNYXRoLm1pbihNYXRoLm1heChtYXhMaXN0V2lkdGgsIGNvbmZpZy5taW5XaWR0aCksIGNvbmZpZy5tYXhXaWR0aCB8fCBJbmZpbml0eSk7XG59XG4iXX0=
//# sourceURL=/home/takaaki/.atom/packages/autohide-tree-view/lib/utils.js
