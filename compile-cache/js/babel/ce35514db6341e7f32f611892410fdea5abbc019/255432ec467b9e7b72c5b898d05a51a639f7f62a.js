Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atomSpacePenViews = require('atom-space-pen-views');

'use babel';

var StatusBarView = (function (_View) {
  _inherits(StatusBarView, _View);

  function StatusBarView(statusBar) {
    var _this = this;

    _classCallCheck(this, StatusBarView);

    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    _get(Object.getPrototypeOf(StatusBarView.prototype), 'constructor', this).apply(this, args);
    this.statusBar = statusBar;
    atom.config.observe('build.statusBar', function () {
      return _this.attach();
    });
    atom.config.observe('build.statusBarPriority', function () {
      return _this.attach();
    });
  }

  _createClass(StatusBarView, [{
    key: 'attach',
    value: function attach() {
      var _this2 = this;

      this.destroy();

      var orientation = atom.config.get('build.statusBar');
      if ('Disable' === orientation) {
        return;
      }

      this.statusBarTile = this.statusBar['add' + orientation + 'Tile']({
        item: this,
        priority: atom.config.get('build.statusBarPriority')
      });

      this.tooltip = atom.tooltips.add(this, {
        title: function title() {
          return _this2.tooltipMessage();
        }
      });
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      if (this.statusBarTile) {
        this.statusBarTile.destroy();
        this.statusBarTile = null;
      }

      if (this.tooltip) {
        this.tooltip.dispose();
        this.tooltip = null;
      }
    }
  }, {
    key: 'tooltipMessage',
    value: function tooltipMessage() {
      return 'Current build target is \'' + this.element.textContent + '\'';
    }
  }, {
    key: 'setClasses',
    value: function setClasses(classes) {
      this.removeClass('status-unknown status-success status-error');
      this.addClass(classes);
    }
  }, {
    key: 'setTarget',
    value: function setTarget(t) {
      if (this.target === t) {
        return;
      }

      this.target = t;
      this.message.text(t || '');
      this.setClasses();
    }
  }, {
    key: 'buildAborted',
    value: function buildAborted() {
      this.setBuildSuccess(false);
    }
  }, {
    key: 'setBuildSuccess',
    value: function setBuildSuccess(success) {
      this.setClasses(success ? 'status-success' : 'status-error');
    }
  }, {
    key: 'buildStarted',
    value: function buildStarted() {
      this.setClasses();
    }
  }, {
    key: 'onClick',
    value: function onClick(cb) {
      this.onClick = cb;
    }
  }, {
    key: 'clicked',
    value: function clicked() {
      this.onClick && this.onClick();
    }
  }], [{
    key: 'content',
    value: function content() {
      var _this3 = this;

      this.div({ id: 'build-status-bar', 'class': 'inline-block' }, function () {
        _this3.a({ click: 'clicked', outlet: 'message' });
      });
    }
  }]);

  return StatusBarView;
})(_atomSpacePenViews.View);

exports['default'] = StatusBarView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvYnVpbGQvbGliL3N0YXR1cy1iYXItdmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7aUNBRXFCLHNCQUFzQjs7QUFGM0MsV0FBVyxDQUFDOztJQUlTLGFBQWE7WUFBYixhQUFhOztBQUNyQixXQURRLGFBQWEsQ0FDcEIsU0FBUyxFQUFXOzs7MEJBRGIsYUFBYTs7c0NBQ04sSUFBSTtBQUFKLFVBQUk7OztBQUM1QiwrQkFGaUIsYUFBYSw4Q0FFckIsSUFBSSxFQUFFO0FBQ2YsUUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7QUFDM0IsUUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEVBQUU7YUFBTSxNQUFLLE1BQU0sRUFBRTtLQUFBLENBQUMsQ0FBQztBQUM1RCxRQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyx5QkFBeUIsRUFBRTthQUFNLE1BQUssTUFBTSxFQUFFO0tBQUEsQ0FBQyxDQUFDO0dBQ3JFOztlQU5rQixhQUFhOztXQVExQixrQkFBRzs7O0FBQ1AsVUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDOztBQUVmLFVBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDdkQsVUFBSSxTQUFTLEtBQUssV0FBVyxFQUFFO0FBQzdCLGVBQU87T0FDUjs7QUFFRCxVQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLFNBQU8sV0FBVyxVQUFPLENBQUM7QUFDM0QsWUFBSSxFQUFFLElBQUk7QUFDVixnQkFBUSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHlCQUF5QixDQUFDO09BQ3JELENBQUMsQ0FBQzs7QUFFSCxVQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRTtBQUNyQyxhQUFLLEVBQUU7aUJBQU0sT0FBSyxjQUFjLEVBQUU7U0FBQTtPQUNuQyxDQUFDLENBQUM7S0FDSjs7O1dBRU0sbUJBQUc7QUFDUixVQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7QUFDdEIsWUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUM3QixZQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztPQUMzQjs7QUFFRCxVQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7QUFDaEIsWUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUN2QixZQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztPQUNyQjtLQUNGOzs7V0FRYSwwQkFBRztBQUNmLDRDQUFtQyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsUUFBSTtLQUNoRTs7O1dBRVMsb0JBQUMsT0FBTyxFQUFFO0FBQ2xCLFVBQUksQ0FBQyxXQUFXLENBQUMsNENBQTRDLENBQUMsQ0FBQztBQUMvRCxVQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQ3hCOzs7V0FFUSxtQkFBQyxDQUFDLEVBQUU7QUFDWCxVQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQ3JCLGVBQU87T0FDUjs7QUFFRCxVQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUNoQixVQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7QUFDM0IsVUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0tBQ25COzs7V0FFVyx3QkFBRztBQUNiLFVBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDN0I7OztXQUVjLHlCQUFDLE9BQU8sRUFBRTtBQUN2QixVQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sR0FBRyxnQkFBZ0IsR0FBRyxjQUFjLENBQUMsQ0FBQztLQUM5RDs7O1dBRVcsd0JBQUc7QUFDYixVQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7S0FDbkI7OztXQUVNLGlCQUFDLEVBQUUsRUFBRTtBQUNWLFVBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0tBQ25COzs7V0FFTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ2hDOzs7V0EzQ2EsbUJBQUc7OztBQUNmLFVBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsa0JBQWtCLEVBQUUsU0FBTyxjQUFjLEVBQUUsRUFBRSxZQUFNO0FBQ2hFLGVBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFDLENBQUMsQ0FBQztPQUNoRCxDQUFDLENBQUM7S0FDSjs7O1NBMUNrQixhQUFhOzs7cUJBQWIsYUFBYSIsImZpbGUiOiIvaG9tZS90YWthYWtpLy5hdG9tL3BhY2thZ2VzL2J1aWxkL2xpYi9zdGF0dXMtYmFyLXZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IHsgVmlldyB9IGZyb20gJ2F0b20tc3BhY2UtcGVuLXZpZXdzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RhdHVzQmFyVmlldyBleHRlbmRzIFZpZXcge1xuICBjb25zdHJ1Y3RvcihzdGF0dXNCYXIsIC4uLmFyZ3MpIHtcbiAgICBzdXBlciguLi5hcmdzKTtcbiAgICB0aGlzLnN0YXR1c0JhciA9IHN0YXR1c0JhcjtcbiAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKCdidWlsZC5zdGF0dXNCYXInLCAoKSA9PiB0aGlzLmF0dGFjaCgpKTtcbiAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKCdidWlsZC5zdGF0dXNCYXJQcmlvcml0eScsICgpID0+IHRoaXMuYXR0YWNoKCkpO1xuICB9XG5cbiAgYXR0YWNoKCkge1xuICAgIHRoaXMuZGVzdHJveSgpO1xuXG4gICAgY29uc3Qgb3JpZW50YXRpb24gPSBhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLnN0YXR1c0JhcicpO1xuICAgIGlmICgnRGlzYWJsZScgPT09IG9yaWVudGF0aW9uKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5zdGF0dXNCYXJUaWxlID0gdGhpcy5zdGF0dXNCYXJbYGFkZCR7b3JpZW50YXRpb259VGlsZWBdKHtcbiAgICAgIGl0ZW06IHRoaXMsXG4gICAgICBwcmlvcml0eTogYXRvbS5jb25maWcuZ2V0KCdidWlsZC5zdGF0dXNCYXJQcmlvcml0eScpXG4gICAgfSk7XG5cbiAgICB0aGlzLnRvb2x0aXAgPSBhdG9tLnRvb2x0aXBzLmFkZCh0aGlzLCB7XG4gICAgICB0aXRsZTogKCkgPT4gdGhpcy50b29sdGlwTWVzc2FnZSgpXG4gICAgfSk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIGlmICh0aGlzLnN0YXR1c0JhclRpbGUpIHtcbiAgICAgIHRoaXMuc3RhdHVzQmFyVGlsZS5kZXN0cm95KCk7XG4gICAgICB0aGlzLnN0YXR1c0JhclRpbGUgPSBudWxsO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnRvb2x0aXApIHtcbiAgICAgIHRoaXMudG9vbHRpcC5kaXNwb3NlKCk7XG4gICAgICB0aGlzLnRvb2x0aXAgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBjb250ZW50KCkge1xuICAgIHRoaXMuZGl2KHsgaWQ6ICdidWlsZC1zdGF0dXMtYmFyJywgY2xhc3M6ICdpbmxpbmUtYmxvY2snIH0sICgpID0+IHtcbiAgICAgIHRoaXMuYSh7IGNsaWNrOiAnY2xpY2tlZCcsIG91dGxldDogJ21lc3NhZ2UnfSk7XG4gICAgfSk7XG4gIH1cblxuICB0b29sdGlwTWVzc2FnZSgpIHtcbiAgICByZXR1cm4gYEN1cnJlbnQgYnVpbGQgdGFyZ2V0IGlzICcke3RoaXMuZWxlbWVudC50ZXh0Q29udGVudH0nYDtcbiAgfVxuXG4gIHNldENsYXNzZXMoY2xhc3Nlcykge1xuICAgIHRoaXMucmVtb3ZlQ2xhc3MoJ3N0YXR1cy11bmtub3duIHN0YXR1cy1zdWNjZXNzIHN0YXR1cy1lcnJvcicpO1xuICAgIHRoaXMuYWRkQ2xhc3MoY2xhc3Nlcyk7XG4gIH1cblxuICBzZXRUYXJnZXQodCkge1xuICAgIGlmICh0aGlzLnRhcmdldCA9PT0gdCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMudGFyZ2V0ID0gdDtcbiAgICB0aGlzLm1lc3NhZ2UudGV4dCh0IHx8ICcnKTtcbiAgICB0aGlzLnNldENsYXNzZXMoKTtcbiAgfVxuXG4gIGJ1aWxkQWJvcnRlZCgpIHtcbiAgICB0aGlzLnNldEJ1aWxkU3VjY2VzcyhmYWxzZSk7XG4gIH1cblxuICBzZXRCdWlsZFN1Y2Nlc3Moc3VjY2Vzcykge1xuICAgIHRoaXMuc2V0Q2xhc3NlcyhzdWNjZXNzID8gJ3N0YXR1cy1zdWNjZXNzJyA6ICdzdGF0dXMtZXJyb3InKTtcbiAgfVxuXG4gIGJ1aWxkU3RhcnRlZCgpIHtcbiAgICB0aGlzLnNldENsYXNzZXMoKTtcbiAgfVxuXG4gIG9uQ2xpY2soY2IpIHtcbiAgICB0aGlzLm9uQ2xpY2sgPSBjYjtcbiAgfVxuXG4gIGNsaWNrZWQoKSB7XG4gICAgdGhpcy5vbkNsaWNrICYmIHRoaXMub25DbGljaygpO1xuICB9XG59XG4iXX0=
//# sourceURL=/home/takaaki/.atom/packages/build/lib/status-bar-view.js
