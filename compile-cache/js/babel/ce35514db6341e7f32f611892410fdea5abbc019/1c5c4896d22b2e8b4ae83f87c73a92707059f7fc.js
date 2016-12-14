Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _statusBarView = require('./status-bar-view');

var _statusBarView2 = _interopRequireDefault(_statusBarView);

var _registry = require('./registry');

var _registry2 = _interopRequireDefault(_registry);

'use babel';

exports['default'] = {
  activate: function activate() {
    this.registry = new _registry2['default']();
    this.views = [];
    this.tasksBegun = [];
    this.tasksEnded = [];

    this.registry.on('begin', this.beginTask.bind(this));
    this.registry.on('end', this.endTask.bind(this));
  },

  deactivate: function deactivate() {
    this.views.forEach(function (view) {
      return view.dispose();
    });
  },

  provideRegistry: function provideRegistry() {
    return this.registry;
  },

  beginTask: function beginTask(task) {
    this.tasksBegun.push(task);
    this.views.forEach(function (view) {
      return view.beginTask(task);
    });
  },

  endTask: function endTask(task) {
    this.tasksEnded.push(task);
    this.views.forEach(function (view) {
      return view.endTask(task);
    });
  },

  consumeStatusBar: function consumeStatusBar(statusBar) {
    this.addView(new _statusBarView2['default'](statusBar));
  },

  addView: function addView(view) {
    this.views.push(view);
    this.tasksBegun.forEach(function (task) {
      return view.beginTask(task);
    });
    this.tasksEnded.forEach(function (task) {
      return view.endTask(task);
    });
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvYnVzeS9saWIvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OzZCQUUwQixtQkFBbUI7Ozs7d0JBQ3hCLFlBQVk7Ozs7QUFIakMsV0FBVyxDQUFDOztxQkFLRztBQUNiLFVBQVEsRUFBQSxvQkFBRztBQUNULFFBQUksQ0FBQyxRQUFRLEdBQUcsMkJBQWMsQ0FBQztBQUMvQixRQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztBQUNoQixRQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztBQUNyQixRQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQzs7QUFFckIsUUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFJLElBQUksQ0FBQyxTQUFTLE1BQWQsSUFBSSxFQUFXLENBQUM7QUFDNUMsUUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFJLElBQUksQ0FBQyxPQUFPLE1BQVosSUFBSSxFQUFTLENBQUM7R0FDekM7O0FBRUQsWUFBVSxFQUFBLHNCQUFHO0FBQ1gsUUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJO2FBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtLQUFBLENBQUMsQ0FBQztHQUM1Qzs7QUFFRCxpQkFBZSxFQUFBLDJCQUFHO0FBQ2hCLFdBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztHQUN0Qjs7QUFFRCxXQUFTLEVBQUEsbUJBQUMsSUFBSSxFQUFFO0FBQ2QsUUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDM0IsUUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJO2FBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUM7S0FBQSxDQUFDLENBQUM7R0FDbEQ7O0FBRUQsU0FBTyxFQUFBLGlCQUFDLElBQUksRUFBRTtBQUNaLFFBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzNCLFFBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQUEsSUFBSTthQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO0tBQUEsQ0FBQyxDQUFDO0dBQ2hEOztBQUVELGtCQUFnQixFQUFBLDBCQUFDLFNBQVMsRUFBRTtBQUMxQixRQUFJLENBQUMsT0FBTyxDQUFDLCtCQUFrQixTQUFTLENBQUMsQ0FBQyxDQUFDO0dBQzVDOztBQUVELFNBQU8sRUFBQSxpQkFBQyxJQUFJLEVBQUU7QUFDWixRQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN0QixRQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFBLElBQUk7YUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQztLQUFBLENBQUMsQ0FBQztBQUN0RCxRQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFBLElBQUk7YUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztLQUFBLENBQUMsQ0FBQztHQUNyRDtDQUNGIiwiZmlsZSI6Ii9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvYnVzeS9saWIvaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IFN0YXR1c0JhclZpZXcgZnJvbSAnLi9zdGF0dXMtYmFyLXZpZXcnO1xuaW1wb3J0IFJlZ2lzdHJ5IGZyb20gJy4vcmVnaXN0cnknO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIGFjdGl2YXRlKCkge1xuICAgIHRoaXMucmVnaXN0cnkgPSBuZXcgUmVnaXN0cnkoKTtcbiAgICB0aGlzLnZpZXdzID0gW107XG4gICAgdGhpcy50YXNrc0JlZ3VuID0gW107XG4gICAgdGhpcy50YXNrc0VuZGVkID0gW107XG5cbiAgICB0aGlzLnJlZ2lzdHJ5Lm9uKCdiZWdpbicsIDo6dGhpcy5iZWdpblRhc2spO1xuICAgIHRoaXMucmVnaXN0cnkub24oJ2VuZCcsIDo6dGhpcy5lbmRUYXNrKTtcbiAgfSxcblxuICBkZWFjdGl2YXRlKCkge1xuICAgIHRoaXMudmlld3MuZm9yRWFjaCh2aWV3ID0+IHZpZXcuZGlzcG9zZSgpKTtcbiAgfSxcblxuICBwcm92aWRlUmVnaXN0cnkoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVnaXN0cnk7XG4gIH0sXG5cbiAgYmVnaW5UYXNrKHRhc2spIHtcbiAgICB0aGlzLnRhc2tzQmVndW4ucHVzaCh0YXNrKTtcbiAgICB0aGlzLnZpZXdzLmZvckVhY2godmlldyA9PiB2aWV3LmJlZ2luVGFzayh0YXNrKSk7XG4gIH0sXG5cbiAgZW5kVGFzayh0YXNrKSB7XG4gICAgdGhpcy50YXNrc0VuZGVkLnB1c2godGFzayk7XG4gICAgdGhpcy52aWV3cy5mb3JFYWNoKHZpZXcgPT4gdmlldy5lbmRUYXNrKHRhc2spKTtcbiAgfSxcblxuICBjb25zdW1lU3RhdHVzQmFyKHN0YXR1c0Jhcikge1xuICAgIHRoaXMuYWRkVmlldyhuZXcgU3RhdHVzQmFyVmlldyhzdGF0dXNCYXIpKTtcbiAgfSxcblxuICBhZGRWaWV3KHZpZXcpIHtcbiAgICB0aGlzLnZpZXdzLnB1c2godmlldyk7XG4gICAgdGhpcy50YXNrc0JlZ3VuLmZvckVhY2godGFzayA9PiB2aWV3LmJlZ2luVGFzayh0YXNrKSk7XG4gICAgdGhpcy50YXNrc0VuZGVkLmZvckVhY2godGFzayA9PiB2aWV3LmVuZFRhc2sodGFzaykpO1xuICB9XG59O1xuIl19
//# sourceURL=/home/takaaki/.atom/packages/busy/lib/index.js
