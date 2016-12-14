Object.defineProperty(exports, '__esModule', {
  value: true
});

var _mainJs = require('./main.js');

var _autohideTreeViewJs = require('./autohide-tree-view.js');

var _utilsJs = require('./utils.js');

'use babel';

var pinView = document.createElement('div');
pinView.classList.add('tree-view-pin-button', 'icon', 'icon-pin');
(0, _utilsJs.domListener)(pinView, 'mousedown', function () {
  return (0, _autohideTreeViewJs.toggleAutohide)();
});

exports['default'] = {
  attach: function attach() {
    _mainJs.treeViewEl.querySelector('.tree-view-scroller').appendChild(pinView);
    this.deactivate();
  },

  detach: function detach() {
    pinView.remove();
    if (tooltip) tooltip.dispose();
  },

  show: function show() {
    pinView.style.display = '';
  },

  hide: function hide() {
    pinView.style.display = 'none';
  },

  activate: function activate() {
    pinView.classList.add('active');
    setTooltip('Pin tree-view');
  },

  deactivate: function deactivate() {
    pinView.classList.remove('active');
    setTooltip('Unpin tree-view');
  },

  isActive: function isActive() {
    return !!pinView.parentNode && pinView.classList.contains('active');
  }
};

var tooltip;

function setTooltip(title) {
  if (tooltip) tooltip.dispose();
  tooltip = atom.tooltips.add(pinView, { title: title });
}
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvYXV0b2hpZGUtdHJlZS12aWV3L2xpYi9waW4tdmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O3NCQUN5QixXQUFXOztrQ0FDUCx5QkFBeUI7O3VCQUM1QixZQUFZOztBQUh0QyxXQUFXLENBQUM7O0FBS1osSUFBSSxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM1QyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsRUFBRSxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDbEUsMEJBQVksT0FBTyxFQUFFLFdBQVcsRUFBRTtTQUFNLHlDQUFnQjtDQUFBLENBQUMsQ0FBQzs7cUJBRTNDO0FBQ2IsUUFBTSxFQUFBLGtCQUFHO0FBQ1AsdUJBQVcsYUFBYSxDQUFDLHFCQUFxQixDQUFDLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3JFLFFBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztHQUNuQjs7QUFFRCxRQUFNLEVBQUEsa0JBQUc7QUFDUCxXQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDakIsUUFBRyxPQUFPLEVBQUUsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO0dBQy9COztBQUVELE1BQUksRUFBQSxnQkFBRztBQUNMLFdBQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztHQUM1Qjs7QUFFRCxNQUFJLEVBQUEsZ0JBQUc7QUFDTCxXQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7R0FDaEM7O0FBRUQsVUFBUSxFQUFBLG9CQUFHO0FBQ1QsV0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDaEMsY0FBVSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0dBQzdCOztBQUVELFlBQVUsRUFBQSxzQkFBRztBQUNYLFdBQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ25DLGNBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0dBQy9COztBQUVELFVBQVEsRUFBQSxvQkFBRztBQUNULFdBQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7R0FDckU7Q0FDRjs7QUFFRCxJQUFJLE9BQU8sQ0FBQzs7QUFFWixTQUFTLFVBQVUsQ0FBQyxLQUFLLEVBQUU7QUFDekIsTUFBRyxPQUFPLEVBQUUsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzlCLFNBQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsRUFBQyxLQUFLLEVBQUwsS0FBSyxFQUFDLENBQUMsQ0FBQztDQUMvQyIsImZpbGUiOiIvaG9tZS90YWthYWtpLy5hdG9tL3BhY2thZ2VzL2F1dG9oaWRlLXRyZWUtdmlldy9saWIvcGluLXZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbmltcG9ydCB7dHJlZVZpZXdFbH0gZnJvbSAnLi9tYWluLmpzJztcbmltcG9ydCB7dG9nZ2xlQXV0b2hpZGV9IGZyb20gJy4vYXV0b2hpZGUtdHJlZS12aWV3LmpzJztcbmltcG9ydCB7ZG9tTGlzdGVuZXJ9IGZyb20gJy4vdXRpbHMuanMnO1xuXG52YXIgcGluVmlldyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xucGluVmlldy5jbGFzc0xpc3QuYWRkKCd0cmVlLXZpZXctcGluLWJ1dHRvbicsICdpY29uJywgJ2ljb24tcGluJyk7XG5kb21MaXN0ZW5lcihwaW5WaWV3LCAnbW91c2Vkb3duJywgKCkgPT4gdG9nZ2xlQXV0b2hpZGUoKSk7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgYXR0YWNoKCkge1xuICAgIHRyZWVWaWV3RWwucXVlcnlTZWxlY3RvcignLnRyZWUtdmlldy1zY3JvbGxlcicpLmFwcGVuZENoaWxkKHBpblZpZXcpO1xuICAgIHRoaXMuZGVhY3RpdmF0ZSgpO1xuICB9LFxuXG4gIGRldGFjaCgpIHtcbiAgICBwaW5WaWV3LnJlbW92ZSgpO1xuICAgIGlmKHRvb2x0aXApIHRvb2x0aXAuZGlzcG9zZSgpO1xuICB9LFxuXG4gIHNob3coKSB7XG4gICAgcGluVmlldy5zdHlsZS5kaXNwbGF5ID0gJyc7XG4gIH0sXG5cbiAgaGlkZSgpIHtcbiAgICBwaW5WaWV3LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gIH0sXG5cbiAgYWN0aXZhdGUoKSB7XG4gICAgcGluVmlldy5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICBzZXRUb29sdGlwKCdQaW4gdHJlZS12aWV3Jyk7XG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICBwaW5WaWV3LmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICAgIHNldFRvb2x0aXAoJ1VucGluIHRyZWUtdmlldycpO1xuICB9LFxuXG4gIGlzQWN0aXZlKCkge1xuICAgIHJldHVybiAhIXBpblZpZXcucGFyZW50Tm9kZSAmJiBwaW5WaWV3LmNsYXNzTGlzdC5jb250YWlucygnYWN0aXZlJyk7XG4gIH0sXG59O1xuXG52YXIgdG9vbHRpcDtcblxuZnVuY3Rpb24gc2V0VG9vbHRpcCh0aXRsZSkge1xuICBpZih0b29sdGlwKSB0b29sdGlwLmRpc3Bvc2UoKTtcbiAgdG9vbHRpcCA9IGF0b20udG9vbHRpcHMuYWRkKHBpblZpZXcsIHt0aXRsZX0pO1xufVxuIl19
//# sourceURL=/home/takaaki/.atom/packages/autohide-tree-view/lib/pin-view.js
