Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

exports.consumeTouchEvents = consumeTouchEvents;
exports.enableTouchEvents = enableTouchEvents;
exports.disableTouchEvents = disableTouchEvents;
exports.isTouchEventsEnabled = isTouchEventsEnabled;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

require('array.from');

var _atom = require('atom');

var _mainJs = require('./main.js');

var _autohideTreeViewJs = require('./autohide-tree-view.js');

var _configJs = require('./config.js');

var _configJs2 = _interopRequireDefault(_configJs);

var _utilsJs = require('./utils.js');

'use babel';

var touchEvents;

function consumeTouchEvents(touchEventsService) {
  touchEvents = touchEventsService;
  if (_configJs2['default'].showOn.match('touch')) enableTouchEvents();
}

var disposables;

function enableTouchEvents() {
  if (!touchEvents) return atom.notifications.addWarning('autohide-tree-view: atom-touch-events is not loaded, but it is required for touch events to work');

  if (disposables) return;
  disposables = new _atom.CompositeDisposable(touchEvents.onDidTouchSwipeLeft(swipeChange, function () {
    return swipeEnd(false);
  }), touchEvents.onDidTouchSwipeRight(swipeChange, function () {
    return swipeEnd(true);
  }));
}

function disableTouchEvents() {
  if (!disposables) return;
  disposables.dispose();
  disposables = null;
}

function isTouchEventsEnabled() {
  return !!disposables;
}

var isSwiping = false;

function shouldInitSwipe(touches, source) {
  // no swipe if either autohide or touch events is disabled
  if (!isTouchEventsEnabled()) return false;

  var _Array$from = Array.from(touches);

  var _Array$from2 = _slicedToArray(_Array$from, 1);

  var pageX = _Array$from2[0].pageX;

  // if swipe target isn't the tree view, check if
  // swipe is in touchArea
  if (!(0, _utilsJs.isChildOf)(source, _mainJs.treeViewEl.parentNode)) {
    // no swipe if not in touch area
    var showOnRightSide = atom.config.get('tree-view.showOnRightSide');
    if (showOnRightSide && pageX < window.innerWidth - _configJs2['default'].touchAreaSize || !showOnRightSide && pageX > _configJs2['default'].touchAreaSize) return false;
  }
  return isSwiping = true;
}

// triggered while swiping the tree view
function swipeChange(_ref) {
  var touches = _ref.args.touches;
  var source = _ref.source;
  var deltaX = _ref.deltaX;

  // check if swipe should show the tree view
  if (!isSwiping && !shouldInitSwipe(touches, source)) return;
  if (atom.config.get('tree-view.showOnRightSide')) deltaX *= -1;
  requestAnimationFrame(function frame() {
    var newWidth = _mainJs.treeViewEl.clientWidth + deltaX;
    newWidth = Math.min((0, _utilsJs.getContentWidth)(), Math.max(_configJs2['default'].minWidth, newWidth));
    _mainJs.treeViewEl.style.width = newWidth + 'px';
  });
}

// triggered after swipe, completely opens/closes the tree view
// depending on the side of the tree view and swipe direction
function swipeEnd(toRight) {
  if (!isSwiping) return;
  isSwiping = false;
  atom.config.get('tree-view.showOnRightSide') != toRight ? (0, _autohideTreeViewJs.showTreeView)() : (0, _autohideTreeViewJs.hideTreeView)();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvYXV0b2hpZGUtdHJlZS12aWV3L2xpYi90b3VjaC1ldmVudHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztRQUNPLFlBQVk7O29CQUNlLE1BQU07O3NCQUNmLFdBQVc7O2tDQUNLLHlCQUF5Qjs7d0JBQy9DLGFBQWE7Ozs7dUJBQ1MsWUFBWTs7QUFOckQsV0FBVyxDQUFDOztBQVFaLElBQUksV0FBVyxDQUFDOztBQUVULFNBQVMsa0JBQWtCLENBQUMsa0JBQWtCLEVBQUU7QUFDckQsYUFBVyxHQUFHLGtCQUFrQixDQUFDO0FBQ2pDLE1BQUcsc0JBQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxpQkFBaUIsRUFBRSxDQUFDO0NBQ3REOztBQUVELElBQUksV0FBVyxDQUFDOztBQUVULFNBQVMsaUJBQWlCLEdBQUc7QUFDbEMsTUFBRyxDQUFDLFdBQVcsRUFDYixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLGtHQUFrRyxDQUFDLENBQUM7O0FBRTNJLE1BQUcsV0FBVyxFQUFFLE9BQU87QUFDdkIsYUFBVyxHQUFHLDhCQUNaLFdBQVcsQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLEVBQUU7V0FBTSxRQUFRLENBQUMsS0FBSyxDQUFDO0dBQUEsQ0FBQyxFQUNuRSxXQUFXLENBQUMsb0JBQW9CLENBQUMsV0FBVyxFQUFFO1dBQU0sUUFBUSxDQUFDLElBQUksQ0FBQztHQUFBLENBQUMsQ0FDcEUsQ0FBQztDQUNIOztBQUVNLFNBQVMsa0JBQWtCLEdBQUc7QUFDbkMsTUFBRyxDQUFDLFdBQVcsRUFBRSxPQUFPO0FBQ3hCLGFBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUN0QixhQUFXLEdBQUcsSUFBSSxDQUFDO0NBQ3BCOztBQUVNLFNBQVMsb0JBQW9CLEdBQUc7QUFDckMsU0FBTyxDQUFDLENBQUMsV0FBVyxDQUFDO0NBQ3RCOztBQUVELElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQzs7QUFFdEIsU0FBUyxlQUFlLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRTs7QUFFeEMsTUFBRyxDQUFDLG9CQUFvQixFQUFFLEVBQUUsT0FBTyxLQUFLLENBQUM7O29CQUN6QixLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQzs7OztNQUE3QixLQUFLLG1CQUFMLEtBQUs7Ozs7QUFHWCxNQUFHLENBQUMsd0JBQVUsTUFBTSxFQUFFLG1CQUFXLFVBQVUsQ0FBQyxFQUFFOztBQUU1QyxRQUFJLGVBQWUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO0FBQ25FLFFBQUcsZUFBZSxJQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsVUFBVSxHQUFHLHNCQUFPLGFBQWEsSUFDcEUsQ0FBQyxlQUFlLElBQUksS0FBSyxHQUFHLHNCQUFPLGFBQWEsRUFDaEQsT0FBTyxLQUFLLENBQUM7R0FDaEI7QUFDRCxTQUFPLFNBQVMsR0FBRyxJQUFJLENBQUM7Q0FDekI7OztBQUdELFNBQVMsV0FBVyxDQUFDLElBQWlDLEVBQUU7TUFBM0IsT0FBTyxHQUFmLElBQWlDLENBQWhDLElBQUksQ0FBRyxPQUFPO01BQUcsTUFBTSxHQUF4QixJQUFpQyxDQUFmLE1BQU07TUFBRSxNQUFNLEdBQWhDLElBQWlDLENBQVAsTUFBTTs7O0FBRW5ELE1BQUcsQ0FBQyxTQUFTLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxFQUFFLE9BQU87QUFDM0QsTUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsQ0FBQyxFQUFFLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQztBQUM5RCx1QkFBcUIsQ0FBQyxTQUFTLEtBQUssR0FBRztBQUNyQyxRQUFJLFFBQVEsR0FBRyxtQkFBVyxXQUFXLEdBQUcsTUFBTSxDQUFDO0FBQy9DLFlBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLCtCQUFpQixFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsc0JBQU8sUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7QUFDNUUsdUJBQVcsS0FBSyxDQUFDLEtBQUssR0FBTSxRQUFRLE9BQUksQ0FBQztHQUMxQyxDQUFDLENBQUM7Q0FDSjs7OztBQUlELFNBQVMsUUFBUSxDQUFDLE9BQU8sRUFBRTtBQUN6QixNQUFHLENBQUMsU0FBUyxFQUFFLE9BQU87QUFDdEIsV0FBUyxHQUFHLEtBQUssQ0FBQztBQUNsQixNQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsQ0FBQyxJQUFJLE9BQU8sR0FBRyx1Q0FBYyxHQUFHLHVDQUFjLENBQUM7Q0FDM0YiLCJmaWxlIjoiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9hdXRvaGlkZS10cmVlLXZpZXcvbGliL3RvdWNoLWV2ZW50cy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuaW1wb3J0ICdhcnJheS5mcm9tJztcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge3RyZWVWaWV3RWx9IGZyb20gJy4vbWFpbi5qcyc7XG5pbXBvcnQge3Nob3dUcmVlVmlldywgaGlkZVRyZWVWaWV3fSBmcm9tICcuL2F1dG9oaWRlLXRyZWUtdmlldy5qcyc7XG5pbXBvcnQgY29uZmlnIGZyb20gJy4vY29uZmlnLmpzJztcbmltcG9ydCB7Z2V0Q29udGVudFdpZHRoLCBpc0NoaWxkT2Z9IGZyb20gJy4vdXRpbHMuanMnO1xuXG52YXIgdG91Y2hFdmVudHM7XG5cbmV4cG9ydCBmdW5jdGlvbiBjb25zdW1lVG91Y2hFdmVudHModG91Y2hFdmVudHNTZXJ2aWNlKSB7XG4gIHRvdWNoRXZlbnRzID0gdG91Y2hFdmVudHNTZXJ2aWNlO1xuICBpZihjb25maWcuc2hvd09uLm1hdGNoKCd0b3VjaCcpKSBlbmFibGVUb3VjaEV2ZW50cygpO1xufVxuXG52YXIgZGlzcG9zYWJsZXM7XG5cbmV4cG9ydCBmdW5jdGlvbiBlbmFibGVUb3VjaEV2ZW50cygpIHtcbiAgaWYoIXRvdWNoRXZlbnRzKVxuICAgIHJldHVybiBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZygnYXV0b2hpZGUtdHJlZS12aWV3OiBhdG9tLXRvdWNoLWV2ZW50cyBpcyBub3QgbG9hZGVkLCBidXQgaXQgaXMgcmVxdWlyZWQgZm9yIHRvdWNoIGV2ZW50cyB0byB3b3JrJyk7XG5cbiAgaWYoZGlzcG9zYWJsZXMpIHJldHVybjtcbiAgZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZShcbiAgICB0b3VjaEV2ZW50cy5vbkRpZFRvdWNoU3dpcGVMZWZ0KHN3aXBlQ2hhbmdlLCAoKSA9PiBzd2lwZUVuZChmYWxzZSkpLFxuICAgIHRvdWNoRXZlbnRzLm9uRGlkVG91Y2hTd2lwZVJpZ2h0KHN3aXBlQ2hhbmdlLCAoKSA9PiBzd2lwZUVuZCh0cnVlKSksXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXNhYmxlVG91Y2hFdmVudHMoKSB7XG4gIGlmKCFkaXNwb3NhYmxlcykgcmV0dXJuO1xuICBkaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIGRpc3Bvc2FibGVzID0gbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzVG91Y2hFdmVudHNFbmFibGVkKCkge1xuICByZXR1cm4gISFkaXNwb3NhYmxlcztcbn1cblxudmFyIGlzU3dpcGluZyA9IGZhbHNlO1xuXG5mdW5jdGlvbiBzaG91bGRJbml0U3dpcGUodG91Y2hlcywgc291cmNlKSB7XG4gIC8vIG5vIHN3aXBlIGlmIGVpdGhlciBhdXRvaGlkZSBvciB0b3VjaCBldmVudHMgaXMgZGlzYWJsZWRcbiAgaWYoIWlzVG91Y2hFdmVudHNFbmFibGVkKCkpIHJldHVybiBmYWxzZTtcbiAgdmFyIFt7cGFnZVh9XSA9IEFycmF5LmZyb20odG91Y2hlcyk7XG4gIC8vIGlmIHN3aXBlIHRhcmdldCBpc24ndCB0aGUgdHJlZSB2aWV3LCBjaGVjayBpZlxuICAvLyBzd2lwZSBpcyBpbiB0b3VjaEFyZWFcbiAgaWYoIWlzQ2hpbGRPZihzb3VyY2UsIHRyZWVWaWV3RWwucGFyZW50Tm9kZSkpIHtcbiAgICAvLyBubyBzd2lwZSBpZiBub3QgaW4gdG91Y2ggYXJlYVxuICAgIHZhciBzaG93T25SaWdodFNpZGUgPSBhdG9tLmNvbmZpZy5nZXQoJ3RyZWUtdmlldy5zaG93T25SaWdodFNpZGUnKTtcbiAgICBpZihzaG93T25SaWdodFNpZGUgJiYgcGFnZVggPCB3aW5kb3cuaW5uZXJXaWR0aCAtIGNvbmZpZy50b3VjaEFyZWFTaXplIHx8XG4gICAgICAhc2hvd09uUmlnaHRTaWRlICYmIHBhZ2VYID4gY29uZmlnLnRvdWNoQXJlYVNpemUpXG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIGlzU3dpcGluZyA9IHRydWU7XG59XG5cbi8vIHRyaWdnZXJlZCB3aGlsZSBzd2lwaW5nIHRoZSB0cmVlIHZpZXdcbmZ1bmN0aW9uIHN3aXBlQ2hhbmdlKHthcmdzOiB7dG91Y2hlc30sIHNvdXJjZSwgZGVsdGFYfSkge1xuICAvLyBjaGVjayBpZiBzd2lwZSBzaG91bGQgc2hvdyB0aGUgdHJlZSB2aWV3XG4gIGlmKCFpc1N3aXBpbmcgJiYgIXNob3VsZEluaXRTd2lwZSh0b3VjaGVzLCBzb3VyY2UpKSByZXR1cm47XG4gIGlmKGF0b20uY29uZmlnLmdldCgndHJlZS12aWV3LnNob3dPblJpZ2h0U2lkZScpKSBkZWx0YVggKj0gLTE7XG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbiBmcmFtZSgpIHtcbiAgICB2YXIgbmV3V2lkdGggPSB0cmVlVmlld0VsLmNsaWVudFdpZHRoICsgZGVsdGFYO1xuICAgIG5ld1dpZHRoID0gTWF0aC5taW4oZ2V0Q29udGVudFdpZHRoKCksIE1hdGgubWF4KGNvbmZpZy5taW5XaWR0aCwgbmV3V2lkdGgpKTtcbiAgICB0cmVlVmlld0VsLnN0eWxlLndpZHRoID0gYCR7bmV3V2lkdGh9cHhgO1xuICB9KTtcbn1cblxuLy8gdHJpZ2dlcmVkIGFmdGVyIHN3aXBlLCBjb21wbGV0ZWx5IG9wZW5zL2Nsb3NlcyB0aGUgdHJlZSB2aWV3XG4vLyBkZXBlbmRpbmcgb24gdGhlIHNpZGUgb2YgdGhlIHRyZWUgdmlldyBhbmQgc3dpcGUgZGlyZWN0aW9uXG5mdW5jdGlvbiBzd2lwZUVuZCh0b1JpZ2h0KSB7XG4gIGlmKCFpc1N3aXBpbmcpIHJldHVybjtcbiAgaXNTd2lwaW5nID0gZmFsc2U7XG4gIGF0b20uY29uZmlnLmdldCgndHJlZS12aWV3LnNob3dPblJpZ2h0U2lkZScpICE9IHRvUmlnaHQgPyBzaG93VHJlZVZpZXcoKSA6IGhpZGVUcmVlVmlldygpO1xufVxuIl19
//# sourceURL=/home/takaaki/.atom/packages/autohide-tree-view/lib/touch-events.js
