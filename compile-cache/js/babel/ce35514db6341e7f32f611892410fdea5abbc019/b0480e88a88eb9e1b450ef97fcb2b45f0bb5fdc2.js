'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var StatusBarView = (function () {
  function StatusBarView(statusBar) {
    _classCallCheck(this, StatusBarView);

    this.statusBar = statusBar;
    this.elements = {};
    this.tasks = [];

    this.setupView();
    this.tile = this.statusBar.addRightTile({ item: this.elements.root, priority: -1000 });
  }

  _createClass(StatusBarView, [{
    key: 'setupView',
    value: function setupView() {
      this.elements.root = document.createElement('div');
      this.elements.gear = document.createElement('span');

      this.elements.root.classList.add('inline-block', 'busy');
      this.elements.gear.classList.add('icon-gear');

      this.elements.root.appendChild(this.elements.gear);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.tile.destroy();
      this.tooltip && this.tooltip.dispose();
    }
  }, {
    key: 'beginTask',
    value: function beginTask(task) {
      this.tasks.push(_extends({}, task, {
        finished: false
      }));

      this.tasks = this.tasks.slice(-atom.config.get('busy.taskBacklog'));

      this.elements.gear.classList.add('is-busy');

      this.setTooltip();
    }
  }, {
    key: 'endTask',
    value: function endTask(endedTask) {
      var index = this.tasks.findIndex(function (t) {
        return t.uniqueId === endedTask.uniqueId;
      });
      this.tasks[index] = _extends({}, endedTask, { finished: true });

      if (!this.tasks.find(function (t) {
        return !t.finished;
      })) {
        this.elements.gear.classList.remove('is-busy');
      }

      this.setTooltip();
    }
  }, {
    key: 'buildTooltipRow',
    value: function buildTooltipRow(task) {
      var classes = ['icon-gear', 'spin'];
      if (task.finished && task.success) {
        classes = ['icon-check'];
      } else if (task.finished && !task.success) {
        classes = ['icon-x', 'text-error'];
      }

      var durationText = task.finished ? '(' + ((task.time.end - task.time.start) / 1000).toFixed(1) + ' s)' : '';

      return '<span class="' + classes.join(' ') + '"></span> ' + task.description + ' ' + durationText;
    }
  }, {
    key: 'setTooltip',
    value: function setTooltip() {
      this.tooltip && this.tooltip.dispose();
      var title = this.tasks.map(this.buildTooltipRow.bind(this)).join('<br />');
      this.tooltip = atom.tooltips.add(this.elements.root, { title: title });
    }
  }]);

  return StatusBarView;
})();

exports['default'] = StatusBarView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvYnVzeS9saWIvc3RhdHVzLWJhci12aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQzs7Ozs7Ozs7Ozs7O0lBRVMsYUFBYTtBQUVyQixXQUZRLGFBQWEsQ0FFcEIsU0FBUyxFQUFFOzBCQUZKLGFBQWE7O0FBRzlCLFFBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0FBQzNCLFFBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO0FBQ25CLFFBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDOztBQUVoQixRQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDakIsUUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0dBQ3hGOztlQVRrQixhQUFhOztXQVd2QixxQkFBRztBQUNWLFVBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDbkQsVUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQzs7QUFFcEQsVUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDekQsVUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQzs7QUFFOUMsVUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDcEQ7OztXQUVNLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNwQixVQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDeEM7OztXQUVRLG1CQUFDLElBQUksRUFBRTtBQUNkLFVBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxjQUNWLElBQUk7QUFDUCxnQkFBUSxFQUFFLEtBQUs7U0FDZixDQUFDOztBQUVILFVBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7O0FBRXBFLFVBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7O0FBRTVDLFVBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztLQUNuQjs7O1dBRU0saUJBQUMsU0FBUyxFQUFFO0FBQ2pCLFVBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFVBQUEsQ0FBQztlQUFJLENBQUMsQ0FBQyxRQUFRLEtBQUssU0FBUyxDQUFDLFFBQVE7T0FBQSxDQUFDLENBQUM7QUFDM0UsVUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsZ0JBQVEsU0FBUyxJQUFFLFFBQVEsRUFBRSxJQUFJLEdBQUUsQ0FBQzs7QUFFckQsVUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQUEsQ0FBQztlQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVE7T0FBQSxDQUFDLEVBQUU7QUFDdEMsWUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztPQUNoRDs7QUFFRCxVQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7S0FDbkI7OztXQUVjLHlCQUFDLElBQUksRUFBRTtBQUNwQixVQUFJLE9BQU8sR0FBRyxDQUFFLFdBQVcsRUFBRSxNQUFNLENBQUUsQ0FBQztBQUN0QyxVQUFJLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRztBQUNsQyxlQUFPLEdBQUcsQ0FBRSxZQUFZLENBQUUsQ0FBQztPQUM1QixNQUFNLElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7QUFDekMsZUFBTyxHQUFHLENBQUUsUUFBUSxFQUFFLFlBQVksQ0FBRSxDQUFDO09BQ3RDOztBQUVELFVBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxRQUFRLFNBQzVCLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQSxHQUFJLElBQUksQ0FBQSxDQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsV0FBUSxFQUFFLENBQUM7O0FBRXRFLCtCQUF1QixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxrQkFBYSxJQUFJLENBQUMsV0FBVyxTQUFJLFlBQVksQ0FBRztLQUN6Rjs7O1dBRVMsc0JBQUc7QUFDWCxVQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDdkMsVUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUcsSUFBSSxDQUFDLGVBQWUsTUFBcEIsSUFBSSxFQUFpQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNwRSxVQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsS0FBSyxFQUFMLEtBQUssRUFBRSxDQUFDLENBQUM7S0FDakU7OztTQXBFa0IsYUFBYTs7O3FCQUFiLGFBQWEiLCJmaWxlIjoiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9idXN5L2xpYi9zdGF0dXMtYmFyLXZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RhdHVzQmFyVmlldyB7XG5cbiAgY29uc3RydWN0b3Ioc3RhdHVzQmFyKSB7XG4gICAgdGhpcy5zdGF0dXNCYXIgPSBzdGF0dXNCYXI7XG4gICAgdGhpcy5lbGVtZW50cyA9IHt9O1xuICAgIHRoaXMudGFza3MgPSBbXTtcblxuICAgIHRoaXMuc2V0dXBWaWV3KCk7XG4gICAgdGhpcy50aWxlID0gdGhpcy5zdGF0dXNCYXIuYWRkUmlnaHRUaWxlKHsgaXRlbTogdGhpcy5lbGVtZW50cy5yb290LCBwcmlvcml0eTogLTEwMDAgfSk7XG4gIH1cblxuICBzZXR1cFZpZXcoKSB7XG4gICAgdGhpcy5lbGVtZW50cy5yb290ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGhpcy5lbGVtZW50cy5nZWFyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuXG4gICAgdGhpcy5lbGVtZW50cy5yb290LmNsYXNzTGlzdC5hZGQoJ2lubGluZS1ibG9jaycsICdidXN5Jyk7XG4gICAgdGhpcy5lbGVtZW50cy5nZWFyLmNsYXNzTGlzdC5hZGQoJ2ljb24tZ2VhcicpO1xuXG4gICAgdGhpcy5lbGVtZW50cy5yb290LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudHMuZ2Vhcik7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMudGlsZS5kZXN0cm95KCk7XG4gICAgdGhpcy50b29sdGlwICYmIHRoaXMudG9vbHRpcC5kaXNwb3NlKCk7XG4gIH1cblxuICBiZWdpblRhc2sodGFzaykge1xuICAgIHRoaXMudGFza3MucHVzaCh7XG4gICAgICAuLi50YXNrLFxuICAgICAgZmluaXNoZWQ6IGZhbHNlXG4gICAgfSk7XG5cbiAgICB0aGlzLnRhc2tzID0gdGhpcy50YXNrcy5zbGljZSgtYXRvbS5jb25maWcuZ2V0KCdidXN5LnRhc2tCYWNrbG9nJykpO1xuXG4gICAgdGhpcy5lbGVtZW50cy5nZWFyLmNsYXNzTGlzdC5hZGQoJ2lzLWJ1c3knKTtcblxuICAgIHRoaXMuc2V0VG9vbHRpcCgpO1xuICB9XG5cbiAgZW5kVGFzayhlbmRlZFRhc2spIHtcbiAgICBjb25zdCBpbmRleCA9IHRoaXMudGFza3MuZmluZEluZGV4KHQgPT4gdC51bmlxdWVJZCA9PT0gZW5kZWRUYXNrLnVuaXF1ZUlkKTtcbiAgICB0aGlzLnRhc2tzW2luZGV4XSA9IHsgLi4uZW5kZWRUYXNrLCBmaW5pc2hlZDogdHJ1ZSB9O1xuXG4gICAgaWYgKCF0aGlzLnRhc2tzLmZpbmQodCA9PiAhdC5maW5pc2hlZCkpIHtcbiAgICAgIHRoaXMuZWxlbWVudHMuZ2Vhci5jbGFzc0xpc3QucmVtb3ZlKCdpcy1idXN5Jyk7XG4gICAgfVxuXG4gICAgdGhpcy5zZXRUb29sdGlwKCk7XG4gIH1cblxuICBidWlsZFRvb2x0aXBSb3codGFzaykge1xuICAgIGxldCBjbGFzc2VzID0gWyAnaWNvbi1nZWFyJywgJ3NwaW4nIF07XG4gICAgaWYgKHRhc2suZmluaXNoZWQgJiYgdGFzay5zdWNjZXNzICkge1xuICAgICAgY2xhc3NlcyA9IFsgJ2ljb24tY2hlY2snIF07XG4gICAgfSBlbHNlIGlmICh0YXNrLmZpbmlzaGVkICYmICF0YXNrLnN1Y2Nlc3MpIHtcbiAgICAgIGNsYXNzZXMgPSBbICdpY29uLXgnLCAndGV4dC1lcnJvcicgXTtcbiAgICB9XG5cbiAgICBjb25zdCBkdXJhdGlvblRleHQgPSB0YXNrLmZpbmlzaGVkID9cbiAgICAgIGAoJHsoKHRhc2sudGltZS5lbmQgLSB0YXNrLnRpbWUuc3RhcnQpIC8gMTAwMCkudG9GaXhlZCgxKX0gcylgIDogJyc7XG5cbiAgICByZXR1cm4gYDxzcGFuIGNsYXNzPVwiJHtjbGFzc2VzLmpvaW4oJyAnKX1cIj48L3NwYW4+ICR7dGFzay5kZXNjcmlwdGlvbn0gJHtkdXJhdGlvblRleHR9YDtcbiAgfVxuXG4gIHNldFRvb2x0aXAoKSB7XG4gICAgdGhpcy50b29sdGlwICYmIHRoaXMudG9vbHRpcC5kaXNwb3NlKCk7XG4gICAgY29uc3QgdGl0bGUgPSB0aGlzLnRhc2tzLm1hcCg6OnRoaXMuYnVpbGRUb29sdGlwUm93KS5qb2luKCc8YnIgLz4nKTtcbiAgICB0aGlzLnRvb2x0aXAgPSBhdG9tLnRvb2x0aXBzLmFkZCh0aGlzLmVsZW1lbnRzLnJvb3QsIHsgdGl0bGUgfSk7XG4gIH1cbn1cbiJdfQ==
//# sourceURL=/home/takaaki/.atom/packages/busy/lib/status-bar-view.js
