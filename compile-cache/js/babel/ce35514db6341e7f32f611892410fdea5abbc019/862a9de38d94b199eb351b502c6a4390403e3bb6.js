Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.enableAutohide = enableAutohide;
exports.disableAutohide = disableAutohide;
exports.isAutohideEnabled = isAutohideEnabled;
exports.toggleAutohide = toggleAutohide;
exports.updateTreeView = updateTreeView;
exports.updateTriggerArea = updateTriggerArea;
exports.showTreeView = showTreeView;
exports.hideTreeView = hideTreeView;
exports.isTreeViewVisible = isTreeViewVisible;
exports.toggleTreeView = toggleTreeView;
exports.resizeTreeView = resizeTreeView;
exports.storeFocusedElement = storeFocusedElement;
exports.clearFocusedElement = clearFocusedElement;
exports.restoreFocus = restoreFocus;
exports.focusTreeView = focusTreeView;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

require('object-assign-shim');

var _atom = require('atom');

var _mainJs = require('./main.js');

var _commandsJs = require('./commands.js');

var _commandsJs2 = _interopRequireDefault(_commandsJs);

var _hoverEventsJs = require('./hover-events.js');

var _clickEventsJs = require('./click-events.js');

var _touchEventsJs = require('./touch-events.js');

var _pinViewJs = require('./pin-view.js');

var _pinViewJs2 = _interopRequireDefault(_pinViewJs);

var _configJs = require('./config.js');

var _configJs2 = _interopRequireDefault(_configJs);

var _utilsJs = require('./utils.js');

'use babel';

function logError(error) {
  atom.notifications.addError('autohide-tree-view: ' + error.message);
  console.error(error); // eslint-disable-line no-console
}

var disposables;

function enableAutohide() {
  if (disposables) return Promise.resolve();
  _mainJs.treeViewEl.setAttribute('data-autohide', '');
  _mainJs.treeViewEl.appendChild(eventTriggerArea);
  _pinViewJs2['default'].deactivate();
  // start with pushEditor = true for a nicer animation
  updateTreeView(true);
  hideTreeView().then(function () {
    updateTreeView();
    handleEvents();
  }, logError);
}

function disableAutohide() {
  if (!disposables) return Promise.resolve();
  disposables.dispose();
  disposables = null;
  // the stylesheet will be removed before the animation is finished
  // which will reset the minWidth to 100px
  _mainJs.treeViewEl.style.minWidth = '0px';
  var isVisible = isTreeViewVisible();
  var panel = atom.views.getView(_mainJs.treeView.panel);
  updateTreeView(_configJs2['default'].pushEditor || !isVisible);
  return (isVisible ? animate(_mainJs.treeViewEl.clientWidth, 0, panel) : showTreeView()).then(function () {
    _mainJs.treeViewEl.removeAttribute('data-autohide');
    Object.assign(_mainJs.treeViewEl.style, { position: '', height: '', minWidth: '' });
    panel.style.width = '';
  }, logError);
}

function isAutohideEnabled() {
  return !!disposables;
}

function toggleAutohide() {
  return !!disposables ? disableAutohide() : enableAutohide();
}

function handleEvents() {
  disposables = new _atom.CompositeDisposable((0, _commandsJs2['default'])(), (0, _configJs.observeConfig)(), (0, _utilsJs.domListener)(_mainJs.treeViewEl, 'click', function (event) {
    if (event.button == 0) resizeTreeView();
  }, { delegationTarget: '.entry.directory' }), (0, _utilsJs.domListener)(_mainJs.treeViewEl, 'click', function (event) {
    if (event.button == 0) var disposable = atom.workspace.onDidChangeActivePaneItem(function (paneItem) {
      storeFocusedElement(atom.views.getView(paneItem));
      disposable.dispose();
    });
  }, { useCapture: true, delegationTarget: '.entry.file' }), (0, _utilsJs.domListener)(document.body, 'focus', function () {
    if (isTreeViewVisible()) hideTreeView();
  }, { delegationTarget: 'atom-text-editor' }), new _atom.Disposable(function () {
    (0, _hoverEventsJs.disableHoverEvents)();
    (0, _clickEventsJs.disableClickEvents)();
    (0, _touchEventsJs.disableTouchEvents)();
    _pinViewJs2['default'].activate();
  }));
}

function updateTreeView() {
  var pushEditor = arguments.length <= 0 || arguments[0] === undefined ? _configJs2['default'].pushEditor : arguments[0];

  var panel = atom.views.getView(_mainJs.treeView.panel);
  _mainJs.treeViewEl.style.position = pushEditor ? '' : 'absolute';
  panel.style.width = pushEditor ? '' : _configJs2['default'].minWidth + 'px';
}

// area on which hover and click events trigger
var eventTriggerArea = document.createElement('div');
exports.eventTriggerArea = eventTriggerArea;
eventTriggerArea.classList.add('tree-view-autohide-trigger-area');

function updateTriggerArea() {
  var triggerWidth = Math.max(1, _configJs2['default'].minWidth, _configJs2['default'].triggerAreaSize);
  eventTriggerArea.style.minWidth = triggerWidth + 'px';
}

var visible = false;

// shows the tree view

function showTreeView() {
  var delay = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
  var shouldDisableHoverEvents = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

  visible = true;
  // disable hover events on the tree view when this
  // show is not triggered by a hover event
  if (shouldDisableHoverEvents && (0, _hoverEventsJs.isHoverEventsEnabled)()) disposables.add((0, _hoverEventsJs.disableHoverEventsUntilBlur)());
  // keep a reference to the currently focused element
  // so we can restore focus when the tree view will hide
  storeFocusedElement();
  return animate((0, _utilsJs.getContentWidth)(), delay).then(function (hasFinished) {
    // make sure the hover area doesn't block tree items
    eventTriggerArea.style.pointerEvents = 'none';
    // focus the tree view if the animation finished
    if (hasFinished) focusTreeView();
    return hasFinished;
  });
}

// hides the tree view

function hideTreeView() {
  var delay = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

  visible = false;
  eventTriggerArea.style.pointerEvents = '';
  return animate(_configJs2['default'].minWidth, delay).then(function (hasFinished) {
    if (hasFinished) {
      // focus the element that had focus when show() was triggered
      restoreFocus();
      // again because sometimes a show() ends after a hide() starts
      eventTriggerArea.style.pointerEvents = '';
    }
    return hasFinished;
  });
}

function isTreeViewVisible() {
  return visible;
}

// toggles the tree view

function toggleTreeView() {
  var delay = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

  return visible ? hideTreeView(delay) : showTreeView(delay);
}

// resizes the tree view to fit the content

function resizeTreeView() {
  return visible ? showTreeView(0, false) : hideTreeView();
}

var currentAnimation = null;

// the animation function returns a promise that resolves with 'true'
// if the animation finished, or with 'false' if it was cancelled
function animate(targetWidth, delay) {
  var element = arguments.length <= 2 || arguments[2] === undefined ? _mainJs.treeViewEl : arguments[2];

  var initialWidth = element.clientWidth;
  // duration = 0 if animationSpeed == 0
  var animationSpeed = _configJs2['default'].animationSpeed || Infinity;
  var duration = Math.abs(targetWidth - initialWidth) / animationSpeed;
  // cancel any current animation and
  // immediately trigger this animation
  if (currentAnimation && currentAnimation.playState != 'finished') {
    currentAnimation.cancel();
    delay = 0;
  }

  return new Promise(function (resolve) {
    // cache the current animationPlayer so we can
    // cancel it as soon as another animation begins
    var animation = currentAnimation = element.animate([{ width: initialWidth }, { width: targetWidth }], { duration: duration, delay: delay });

    animation.addEventListener('finish', function onfinish() {
      animation.removeEventListener('finish', onfinish);
      // if cancelled, resolve with false
      if (animation.playState != 'finished') return resolve(false);

      // prevent tree view from resetting its width to initialWidth
      element.style.width = targetWidth + 'px';
      currentAnimation = null;
      resolve(true);
    });
  })['catch'](logError);
}

// functions that deal with focusing the right
// element at the right time

var focusedElement;

// cache the element that currently has focus

function storeFocusedElement() {
  var el = arguments.length <= 0 || arguments[0] === undefined ? document.activeElement : arguments[0];

  if (!(0, _utilsJs.isChildOf)(el, _mainJs.treeViewEl.parentNode)) focusedElement = el;
}

// clear the reference to the focusedElement. useful
// when we want to invalidate the next restoreFocus

function clearFocusedElement() {
  focusedElement = null;
}

// restores focus on focusedElement

function restoreFocus() {
  // only restore focus if tree view has focus
  if (!focusedElement || !(0, _utilsJs.isChildOf)(document.activeElement, _mainJs.treeViewEl)) return;
  if (typeof focusedElement.focus == 'function') focusedElement.focus();
  clearFocusedElement();
}

// focus the tree view with some logic around it to cancel

function focusTreeView() {
  // don't focus if a modal panel has focus
  // because they tend to close when they lose focus
  if ((0, _utilsJs.isChildOf)(document.activeElement, 'atom-panel.modal')) return;

  _mainJs.treeView.focus();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvYXV0b2hpZGUtdHJlZS12aWV3L2xpYi9hdXRvaGlkZS10cmVlLXZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1FBQ08sb0JBQW9COztvQkFDbUIsTUFBTTs7c0JBQ2pCLFdBQVc7OzBCQUNyQixlQUFlOzs7OzZCQUVKLG1CQUFtQjs7NkJBQ3RCLG1CQUFtQjs7NkJBQ25CLG1CQUFtQjs7eUJBQ2hDLGVBQWU7Ozs7d0JBQ0MsYUFBYTs7Ozt1QkFDSyxZQUFZOztBQVhsRSxXQUFXLENBQUM7O0FBYVosU0FBUyxRQUFRLENBQUMsS0FBSyxFQUFFO0FBQ3ZCLE1BQUksQ0FBQyxhQUFhLENBQUMsUUFBUSwwQkFBd0IsS0FBSyxDQUFDLE9BQU8sQ0FBRyxDQUFDO0FBQ3BFLFNBQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7Q0FDdEI7O0FBRUQsSUFBSSxXQUFXLENBQUM7O0FBRVQsU0FBUyxjQUFjLEdBQUc7QUFDL0IsTUFBRyxXQUFXLEVBQUUsT0FBTyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDekMscUJBQVcsWUFBWSxDQUFDLGVBQWUsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUM3QyxxQkFBVyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUN6Qyx5QkFBUSxVQUFVLEVBQUUsQ0FBQzs7QUFFckIsZ0JBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNyQixjQUFZLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBTTtBQUN4QixrQkFBYyxFQUFFLENBQUM7QUFDakIsZ0JBQVksRUFBRSxDQUFDO0dBQ2hCLEVBQUUsUUFBUSxDQUFDLENBQUM7Q0FDZDs7QUFFTSxTQUFTLGVBQWUsR0FBRztBQUNoQyxNQUFHLENBQUMsV0FBVyxFQUFFLE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzFDLGFBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztB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LGFBQWEsRUFBRSxrQkFBa0IsQ0FBQyxFQUN0RCxPQUFPOztBQUVULG1CQUFTLEtBQUssRUFBRSxDQUFDO0NBQ2xCIiwiZmlsZSI6Ii9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvYXV0b2hpZGUtdHJlZS12aWV3L2xpYi9hdXRvaGlkZS10cmVlLXZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbmltcG9ydCAnb2JqZWN0LWFzc2lnbi1zaGltJztcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge3RyZWVWaWV3LCB0cmVlVmlld0VsfSBmcm9tICcuL21haW4uanMnO1xuaW1wb3J0IGluaXRDb21tYW5kcyBmcm9tICcuL2NvbW1hbmRzLmpzJztcbmltcG9ydCB7ZGlzYWJsZUhvdmVyRXZlbnRzLCBpc0hvdmVyRXZlbnRzRW5hYmxlZCxcbiAgZGlzYWJsZUhvdmVyRXZlbnRzVW50aWxCbHVyfSBmcm9tICcuL2hvdmVyLWV2ZW50cy5qcyc7XG5pbXBvcnQge2Rpc2FibGVDbGlja0V2ZW50c30gZnJvbSAnLi9jbGljay1ldmVudHMuanMnO1xuaW1wb3J0IHtkaXNhYmxlVG91Y2hFdmVudHN9IGZyb20gJy4vdG91Y2gtZXZlbnRzLmpzJztcbmltcG9ydCBwaW5WaWV3IGZyb20gJy4vcGluLXZpZXcuanMnO1xuaW1wb3J0IGNvbmZpZywge29ic2VydmVDb25maWd9IGZyb20gJy4vY29uZmlnLmpzJztcbmltcG9ydCB7Z2V0Q29udGVudFdpZHRoLCBpc0NoaWxkT2YsIGRvbUxpc3RlbmVyfSBmcm9tICcuL3V0aWxzLmpzJztcblxuZnVuY3Rpb24gbG9nRXJyb3IoZXJyb3IpIHtcbiAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKGBhdXRvaGlkZS10cmVlLXZpZXc6ICR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgY29uc29sZS5lcnJvcihlcnJvcik7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxufVxuXG52YXIgZGlzcG9zYWJsZXM7XG5cbmV4cG9ydCBmdW5jdGlvbiBlbmFibGVBdXRvaGlkZSgpIHtcbiAgaWYoZGlzcG9zYWJsZXMpIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgdHJlZVZpZXdFbC5zZXRBdHRyaWJ1dGUoJ2RhdGEtYXV0b2hpZGUnLCAnJyk7XG4gIHRyZWVWaWV3RWwuYXBwZW5kQ2hpbGQoZXZlbnRUcmlnZ2VyQXJlYSk7XG4gIHBpblZpZXcuZGVhY3RpdmF0ZSgpO1xuICAvLyBzdGFydCB3aXRoIHB1c2hFZGl0b3IgPSB0cnVlIGZvciBhIG5pY2VyIGFuaW1hdGlvblxuICB1cGRhdGVUcmVlVmlldyh0cnVlKTtcbiAgaGlkZVRyZWVWaWV3KCkudGhlbigoKSA9PiB7XG4gICAgdXBkYXRlVHJlZVZpZXcoKTtcbiAgICBoYW5kbGVFdmVudHMoKTtcbiAgfSwgbG9nRXJyb3IpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGlzYWJsZUF1dG9oaWRlKCkge1xuICBpZighZGlzcG9zYWJsZXMpIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICBkaXNwb3NhYmxlcyA9IG51bGw7XG4gIC8vIHRoZSBzdHlsZXNoZWV0IHdpbGwgYmUgcmVtb3ZlZCBiZWZvcmUgdGhlIGFuaW1hdGlvbiBpcyBmaW5pc2hlZFxuICAvLyB3aGljaCB3aWxsIHJlc2V0IHRoZSBtaW5XaWR0aCB0byAxMDBweFxuICB0cmVlVmlld0VsLnN0eWxlLm1pbldpZHRoID0gJzBweCc7XG4gIHZhciBpc1Zpc2libGUgPSBpc1RyZWVWaWV3VmlzaWJsZSgpO1xuICB2YXIgcGFuZWwgPSBhdG9tLnZpZXdzLmdldFZpZXcodHJlZVZpZXcucGFuZWwpO1xuICB1cGRhdGVUcmVlVmlldyhjb25maWcucHVzaEVkaXRvciB8fCAhaXNWaXNpYmxlKTtcbiAgcmV0dXJuIChpc1Zpc2libGUgPyBhbmltYXRlKHRyZWVWaWV3RWwuY2xpZW50V2lkdGgsIDAsIHBhbmVsKSA6IHNob3dUcmVlVmlldygpKS50aGVuKCgpID0+IHtcbiAgICB0cmVlVmlld0VsLnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS1hdXRvaGlkZScpO1xuICAgIE9iamVjdC5hc3NpZ24odHJlZVZpZXdFbC5zdHlsZSwge3Bvc2l0aW9uOiAnJywgaGVpZ2h0OiAnJywgbWluV2lkdGg6ICcnfSk7XG4gICAgcGFuZWwuc3R5bGUud2lkdGggPSAnJztcbiAgfSwgbG9nRXJyb3IpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNBdXRvaGlkZUVuYWJsZWQoKSB7XG4gIHJldHVybiAhIWRpc3Bvc2FibGVzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdG9nZ2xlQXV0b2hpZGUoKSB7XG4gIHJldHVybiAhIWRpc3Bvc2FibGVzID8gZGlzYWJsZUF1dG9oaWRlKCkgOiBlbmFibGVBdXRvaGlkZSgpO1xufVxuXG5mdW5jdGlvbiBoYW5kbGVFdmVudHMoKSB7XG4gIGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgaW5pdENvbW1hbmRzKCksXG4gICAgb2JzZXJ2ZUNvbmZpZygpLFxuXG4gICAgZG9tTGlzdGVuZXIodHJlZVZpZXdFbCwgJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgaWYoZXZlbnQuYnV0dG9uID09IDApIHJlc2l6ZVRyZWVWaWV3KCk7XG4gICAgfSwge2RlbGVnYXRpb25UYXJnZXQ6ICcuZW50cnkuZGlyZWN0b3J5J30pLFxuXG4gICAgZG9tTGlzdGVuZXIodHJlZVZpZXdFbCwgJ2NsaWNrJywgZXZlbnQgPT4ge1xuICAgICAgaWYoZXZlbnQuYnV0dG9uID09IDApIHZhciBkaXNwb3NhYmxlID0gYXRvbS53b3Jrc3BhY2Uub25EaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbShwYW5lSXRlbSA9PiB7XG4gICAgICAgIHN0b3JlRm9jdXNlZEVsZW1lbnQoYXRvbS52aWV3cy5nZXRWaWV3KHBhbmVJdGVtKSk7XG4gICAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgICAgfSk7XG4gICAgfSwge3VzZUNhcHR1cmU6IHRydWUsIGRlbGVnYXRpb25UYXJnZXQ6ICcuZW50cnkuZmlsZSd9KSxcblxuICAgIGRvbUxpc3RlbmVyKGRvY3VtZW50LmJvZHksICdmb2N1cycsICgpID0+IHtcbiAgICAgIGlmKGlzVHJlZVZpZXdWaXNpYmxlKCkpIGhpZGVUcmVlVmlldygpO1xuICAgIH0sIHtkZWxlZ2F0aW9uVGFyZ2V0OiAnYXRvbS10ZXh0LWVkaXRvcid9KSxcblxuICAgIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIGRpc2FibGVIb3ZlckV2ZW50cygpO1xuICAgICAgZGlzYWJsZUNsaWNrRXZlbnRzKCk7XG4gICAgICBkaXNhYmxlVG91Y2hFdmVudHMoKTtcbiAgICAgIHBpblZpZXcuYWN0aXZhdGUoKTtcbiAgICB9KSxcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZVRyZWVWaWV3KHB1c2hFZGl0b3IgPSBjb25maWcucHVzaEVkaXRvcikge1xuICB2YXIgcGFuZWwgPSBhdG9tLnZpZXdzLmdldFZpZXcodHJlZVZpZXcucGFuZWwpO1xuICB0cmVlVmlld0VsLnN0eWxlLnBvc2l0aW9uID0gcHVzaEVkaXRvciA/ICcnIDogJ2Fic29sdXRlJztcbiAgcGFuZWwuc3R5bGUud2lkdGggPSBwdXNoRWRpdG9yID8gJycgOiBgJHtjb25maWcubWluV2lkdGh9cHhgO1xufVxuXG4vLyBhcmVhIG9uIHdoaWNoIGhvdmVyIGFuZCBjbGljayBldmVudHMgdHJpZ2dlclxuZXhwb3J0IHZhciBldmVudFRyaWdnZXJBcmVhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5ldmVudFRyaWdnZXJBcmVhLmNsYXNzTGlzdC5hZGQoJ3RyZWUtdmlldy1hdXRvaGlkZS10cmlnZ2VyLWFyZWEnKTtcblxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZVRyaWdnZXJBcmVhKCkge1xuICB2YXIgdHJpZ2dlcldpZHRoID0gTWF0aC5tYXgoMSwgY29uZmlnLm1pbldpZHRoLCBjb25maWcudHJpZ2dlckFyZWFTaXplKTtcbiAgZXZlbnRUcmlnZ2VyQXJlYS5zdHlsZS5taW5XaWR0aCA9IGAke3RyaWdnZXJXaWR0aH1weGA7XG59XG5cbnZhciB2aXNpYmxlID0gZmFsc2U7XG5cbi8vIHNob3dzIHRoZSB0cmVlIHZpZXdcbmV4cG9ydCBmdW5jdGlvbiBzaG93VHJlZVZpZXcoZGVsYXkgPSAwLCBzaG91bGREaXNhYmxlSG92ZXJFdmVudHMgPSB0cnVlKSB7XG4gIHZpc2libGUgPSB0cnVlO1xuICAvLyBkaXNhYmxlIGhvdmVyIGV2ZW50cyBvbiB0aGUgdHJlZSB2aWV3IHdoZW4gdGhpc1xuICAvLyBzaG93IGlzIG5vdCB0cmlnZ2VyZWQgYnkgYSBob3ZlciBldmVudFxuICBpZihzaG91bGREaXNhYmxlSG92ZXJFdmVudHMgJiYgaXNIb3ZlckV2ZW50c0VuYWJsZWQoKSlcbiAgICBkaXNwb3NhYmxlcy5hZGQoZGlzYWJsZUhvdmVyRXZlbnRzVW50aWxCbHVyKCkpO1xuICAvLyBrZWVwIGEgcmVmZXJlbmNlIHRvIHRoZSBjdXJyZW50bHkgZm9jdXNlZCBlbGVtZW50XG4gIC8vIHNvIHdlIGNhbiByZXN0b3JlIGZvY3VzIHdoZW4gdGhlIHRyZWUgdmlldyB3aWxsIGhpZGVcbiAgc3RvcmVGb2N1c2VkRWxlbWVudCgpO1xuICByZXR1cm4gYW5pbWF0ZShnZXRDb250ZW50V2lkdGgoKSwgZGVsYXkpLnRoZW4oaGFzRmluaXNoZWQgPT4ge1xuICAgIC8vIG1ha2Ugc3VyZSB0aGUgaG92ZXIgYXJlYSBkb2Vzbid0IGJsb2NrIHRyZWUgaXRlbXNcbiAgICBldmVudFRyaWdnZXJBcmVhLnN0eWxlLnBvaW50ZXJFdmVudHMgPSAnbm9uZSc7XG4gICAgLy8gZm9jdXMgdGhlIHRyZWUgdmlldyBpZiB0aGUgYW5pbWF0aW9uIGZpbmlzaGVkXG4gICAgaWYoaGFzRmluaXNoZWQpIGZvY3VzVHJlZVZpZXcoKTtcbiAgICByZXR1cm4gaGFzRmluaXNoZWQ7XG4gIH0pO1xufVxuXG4vLyBoaWRlcyB0aGUgdHJlZSB2aWV3XG5leHBvcnQgZnVuY3Rpb24gaGlkZVRyZWVWaWV3KGRlbGF5ID0gMCkge1xuICB2aXNpYmxlID0gZmFsc2U7XG4gIGV2ZW50VHJpZ2dlckFyZWEuc3R5bGUucG9pbnRlckV2ZW50cyA9ICcnO1xuICByZXR1cm4gYW5pbWF0ZShjb25maWcubWluV2lkdGgsIGRlbGF5KS50aGVuKGhhc0ZpbmlzaGVkID0+IHtcbiAgICBpZihoYXNGaW5pc2hlZCkge1xuICAgICAgLy8gZm9jdXMgdGhlIGVsZW1lbnQgdGhhdCBoYWQgZm9jdXMgd2hlbiBzaG93KCkgd2FzIHRyaWdnZXJlZFxuICAgICAgcmVzdG9yZUZvY3VzKCk7XG4gICAgICAvLyBhZ2FpbiBiZWNhdXNlIHNvbWV0aW1lcyBhIHNob3coKSBlbmRzIGFmdGVyIGEgaGlkZSgpIHN0YXJ0c1xuICAgICAgZXZlbnRUcmlnZ2VyQXJlYS5zdHlsZS5wb2ludGVyRXZlbnRzID0gJyc7XG4gICAgfVxuICAgIHJldHVybiBoYXNGaW5pc2hlZDtcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1RyZWVWaWV3VmlzaWJsZSgpIHtcbiAgcmV0dXJuIHZpc2libGU7XG59XG5cbi8vIHRvZ2dsZXMgdGhlIHRyZWUgdmlld1xuZXhwb3J0IGZ1bmN0aW9uIHRvZ2dsZVRyZWVWaWV3KGRlbGF5ID0gMCkge1xuICByZXR1cm4gdmlzaWJsZSA/IGhpZGVUcmVlVmlldyhkZWxheSkgOiBzaG93VHJlZVZpZXcoZGVsYXkpO1xufVxuXG4vLyByZXNpemVzIHRoZSB0cmVlIHZpZXcgdG8gZml0IHRoZSBjb250ZW50XG5leHBvcnQgZnVuY3Rpb24gcmVzaXplVHJlZVZpZXcoKSB7XG4gIHJldHVybiB2aXNpYmxlID8gc2hvd1RyZWVWaWV3KDAsIGZhbHNlKSA6IGhpZGVUcmVlVmlldygpO1xufVxuXG52YXIgY3VycmVudEFuaW1hdGlvbiA9IG51bGw7XG5cbi8vIHRoZSBhbmltYXRpb24gZnVuY3Rpb24gcmV0dXJucyBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aXRoICd0cnVlJ1xuLy8gaWYgdGhlIGFuaW1hdGlvbiBmaW5pc2hlZCwgb3Igd2l0aCAnZmFsc2UnIGlmIGl0IHdhcyBjYW5jZWxsZWRcbmZ1bmN0aW9uIGFuaW1hdGUodGFyZ2V0V2lkdGgsIGRlbGF5LCBlbGVtZW50ID0gdHJlZVZpZXdFbCkge1xuICB2YXIgaW5pdGlhbFdpZHRoID0gZWxlbWVudC5jbGllbnRXaWR0aDtcbiAgLy8gZHVyYXRpb24gPSAwIGlmIGFuaW1hdGlvblNwZWVkID09IDBcbiAgdmFyIGFuaW1hdGlvblNwZWVkID0gY29uZmlnLmFuaW1hdGlvblNwZWVkIHx8IEluZmluaXR5O1xuICB2YXIgZHVyYXRpb24gPSBNYXRoLmFicyh0YXJnZXRXaWR0aCAtIGluaXRpYWxXaWR0aCkgLyBhbmltYXRpb25TcGVlZDtcbiAgLy8gY2FuY2VsIGFueSBjdXJyZW50IGFuaW1hdGlvbiBhbmRcbiAgLy8gaW1tZWRpYXRlbHkgdHJpZ2dlciB0aGlzIGFuaW1hdGlvblxuICBpZihjdXJyZW50QW5pbWF0aW9uICYmIGN1cnJlbnRBbmltYXRpb24ucGxheVN0YXRlICE9ICdmaW5pc2hlZCcpIHtcbiAgICBjdXJyZW50QW5pbWF0aW9uLmNhbmNlbCgpO1xuICAgIGRlbGF5ID0gMDtcbiAgfVxuXG4gIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAvLyBjYWNoZSB0aGUgY3VycmVudCBhbmltYXRpb25QbGF5ZXIgc28gd2UgY2FuXG4gICAgLy8gY2FuY2VsIGl0IGFzIHNvb24gYXMgYW5vdGhlciBhbmltYXRpb24gYmVnaW5zXG4gICAgdmFyIGFuaW1hdGlvbiA9IGN1cnJlbnRBbmltYXRpb24gPSBlbGVtZW50LmFuaW1hdGUoW1xuICAgICAge3dpZHRoOiBpbml0aWFsV2lkdGh9LFxuICAgICAge3dpZHRoOiB0YXJnZXRXaWR0aH0sXG4gICAgXSwge2R1cmF0aW9uLCBkZWxheX0pO1xuXG4gICAgYW5pbWF0aW9uLmFkZEV2ZW50TGlzdGVuZXIoJ2ZpbmlzaCcsIGZ1bmN0aW9uIG9uZmluaXNoKCkge1xuICAgICAgYW5pbWF0aW9uLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2ZpbmlzaCcsIG9uZmluaXNoKTtcbiAgICAgIC8vIGlmIGNhbmNlbGxlZCwgcmVzb2x2ZSB3aXRoIGZhbHNlXG4gICAgICBpZihhbmltYXRpb24ucGxheVN0YXRlICE9ICdmaW5pc2hlZCcpXG4gICAgICAgIHJldHVybiByZXNvbHZlKGZhbHNlKTtcblxuICAgICAgLy8gcHJldmVudCB0cmVlIHZpZXcgZnJvbSByZXNldHRpbmcgaXRzIHdpZHRoIHRvIGluaXRpYWxXaWR0aFxuICAgICAgZWxlbWVudC5zdHlsZS53aWR0aCA9IGAke3RhcmdldFdpZHRofXB4YDtcbiAgICAgIGN1cnJlbnRBbmltYXRpb24gPSBudWxsO1xuICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICB9KTtcbiAgfSkuY2F0Y2gobG9nRXJyb3IpO1xufVxuXG4vLyBmdW5jdGlvbnMgdGhhdCBkZWFsIHdpdGggZm9jdXNpbmcgdGhlIHJpZ2h0XG4vLyBlbGVtZW50IGF0IHRoZSByaWdodCB0aW1lXG5cbnZhciBmb2N1c2VkRWxlbWVudDtcblxuLy8gY2FjaGUgdGhlIGVsZW1lbnQgdGhhdCBjdXJyZW50bHkgaGFzIGZvY3VzXG5leHBvcnQgZnVuY3Rpb24gc3RvcmVGb2N1c2VkRWxlbWVudChlbCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpIHtcbiAgaWYoIWlzQ2hpbGRPZihlbCwgdHJlZVZpZXdFbC5wYXJlbnROb2RlKSlcbiAgICBmb2N1c2VkRWxlbWVudCA9IGVsO1xufVxuXG4vLyBjbGVhciB0aGUgcmVmZXJlbmNlIHRvIHRoZSBmb2N1c2VkRWxlbWVudC4gdXNlZnVsXG4vLyB3aGVuIHdlIHdhbnQgdG8gaW52YWxpZGF0ZSB0aGUgbmV4dCByZXN0b3JlRm9jdXNcbmV4cG9ydCBmdW5jdGlvbiBjbGVhckZvY3VzZWRFbGVtZW50KCkge1xuICBmb2N1c2VkRWxlbWVudCA9IG51bGw7XG59XG5cbi8vIHJlc3RvcmVzIGZvY3VzIG9uIGZvY3VzZWRFbGVtZW50XG5leHBvcnQgZnVuY3Rpb24gcmVzdG9yZUZvY3VzKCkge1xuICAvLyBvbmx5IHJlc3RvcmUgZm9jdXMgaWYgdHJlZSB2aWV3IGhhcyBmb2N1c1xuICBpZighZm9jdXNlZEVsZW1lbnQgfHwgIWlzQ2hpbGRPZihkb2N1bWVudC5hY3RpdmVFbGVtZW50LCB0cmVlVmlld0VsKSlcbiAgICByZXR1cm47XG4gIGlmKHR5cGVvZiBmb2N1c2VkRWxlbWVudC5mb2N1cyA9PSAnZnVuY3Rpb24nKVxuICAgIGZvY3VzZWRFbGVtZW50LmZvY3VzKCk7XG4gIGNsZWFyRm9jdXNlZEVsZW1lbnQoKTtcbn1cblxuLy8gZm9jdXMgdGhlIHRyZWUgdmlldyB3aXRoIHNvbWUgbG9naWMgYXJvdW5kIGl0IHRvIGNhbmNlbFxuZXhwb3J0IGZ1bmN0aW9uIGZvY3VzVHJlZVZpZXcoKSB7XG4gIC8vIGRvbid0IGZvY3VzIGlmIGEgbW9kYWwgcGFuZWwgaGFzIGZvY3VzXG4gIC8vIGJlY2F1c2UgdGhleSB0ZW5kIHRvIGNsb3NlIHdoZW4gdGhleSBsb3NlIGZvY3VzXG4gIGlmKGlzQ2hpbGRPZihkb2N1bWVudC5hY3RpdmVFbGVtZW50LCAnYXRvbS1wYW5lbC5tb2RhbCcpKVxuICAgIHJldHVybjtcblxuICB0cmVlVmlldy5mb2N1cygpO1xufVxuIl19
//# sourceURL=/home/takaaki/.atom/packages/autohide-tree-view/lib/autohide-tree-view.js