Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

'use babel';

var Registry = (function (_EventEmitter) {
  _inherits(Registry, _EventEmitter);

  function Registry() {
    _classCallCheck(this, Registry);

    _get(Object.getPrototypeOf(Registry.prototype), 'constructor', this).call(this);
    this.uniqueId = 0;
    this.tasks = [];
  }

  _createClass(Registry, [{
    key: 'begin',
    value: function begin(id, description) {
      var task = {
        id: id,
        description: description,
        uniqueId: this.uniqueId++,
        time: {
          start: new Date(),
          end: null
        }
      };
      this.tasks.push(task);
      this.emit('begin', task);
    }
  }, {
    key: 'end',
    value: function end(id) {
      var success = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

      var index = this.tasks.findIndex(function (task) {
        return task.id === id;
      });
      if (-1 === index) {
        return;
      }

      var task = this.tasks.splice(index, 1)[0];
      task.success = success;
      task.time.end = new Date();
      this.emit('end', task);
    }
  }, {
    key: '_getTasks',
    value: function _getTasks() {
      return this.tasks;
    }
  }]);

  return Registry;
})(_events2['default']);

exports['default'] = Registry;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvYnVzeS9saWIvcmVnaXN0cnkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7c0JBRXlCLFFBQVE7Ozs7QUFGakMsV0FBVyxDQUFDOztJQUlTLFFBQVE7WUFBUixRQUFROztBQUNoQixXQURRLFFBQVEsR0FDYjswQkFESyxRQUFROztBQUV6QiwrQkFGaUIsUUFBUSw2Q0FFakI7QUFDUixRQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztBQUNsQixRQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztHQUNqQjs7ZUFMa0IsUUFBUTs7V0FPdEIsZUFBQyxFQUFFLEVBQUUsV0FBVyxFQUFFO0FBQ3JCLFVBQU0sSUFBSSxHQUFHO0FBQ1gsVUFBRSxFQUFGLEVBQUU7QUFDRixtQkFBVyxFQUFYLFdBQVc7QUFDWCxnQkFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDekIsWUFBSSxFQUFFO0FBQ0osZUFBSyxFQUFFLElBQUksSUFBSSxFQUFFO0FBQ2pCLGFBQUcsRUFBRSxJQUFJO1NBQ1Y7T0FDRixDQUFDO0FBQ0YsVUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdEIsVUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7S0FDMUI7OztXQUVFLGFBQUMsRUFBRSxFQUFrQjtVQUFoQixPQUFPLHlEQUFHLElBQUk7O0FBQ3BCLFVBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFVBQUEsSUFBSTtlQUFJLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRTtPQUFBLENBQUMsQ0FBQztBQUMzRCxVQUFJLENBQUMsQ0FBQyxLQUFLLEtBQUssRUFBRTtBQUNoQixlQUFPO09BQ1I7O0FBRUQsVUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVDLFVBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQ3ZCLFVBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7QUFDM0IsVUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7S0FDeEI7OztXQUVRLHFCQUFHO0FBQ1YsYUFBTyxJQUFJLENBQUMsS0FBSyxDQUFDO0tBQ25COzs7U0FuQ2tCLFFBQVE7OztxQkFBUixRQUFRIiwiZmlsZSI6Ii9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvYnVzeS9saWIvcmVnaXN0cnkuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tICdldmVudHMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZWdpc3RyeSBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy51bmlxdWVJZCA9IDA7XG4gICAgdGhpcy50YXNrcyA9IFtdO1xuICB9XG5cbiAgYmVnaW4oaWQsIGRlc2NyaXB0aW9uKSB7XG4gICAgY29uc3QgdGFzayA9IHtcbiAgICAgIGlkLFxuICAgICAgZGVzY3JpcHRpb24sXG4gICAgICB1bmlxdWVJZDogdGhpcy51bmlxdWVJZCsrLFxuICAgICAgdGltZToge1xuICAgICAgICBzdGFydDogbmV3IERhdGUoKSxcbiAgICAgICAgZW5kOiBudWxsXG4gICAgICB9XG4gICAgfTtcbiAgICB0aGlzLnRhc2tzLnB1c2godGFzayk7XG4gICAgdGhpcy5lbWl0KCdiZWdpbicsIHRhc2spO1xuICB9XG5cbiAgZW5kKGlkLCBzdWNjZXNzID0gdHJ1ZSkge1xuICAgIGNvbnN0IGluZGV4ID0gdGhpcy50YXNrcy5maW5kSW5kZXgodGFzayA9PiB0YXNrLmlkID09PSBpZCk7XG4gICAgaWYgKC0xID09PSBpbmRleCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHRhc2sgPSB0aGlzLnRhc2tzLnNwbGljZShpbmRleCwgMSlbMF07XG4gICAgdGFzay5zdWNjZXNzID0gc3VjY2VzcztcbiAgICB0YXNrLnRpbWUuZW5kID0gbmV3IERhdGUoKTtcbiAgICB0aGlzLmVtaXQoJ2VuZCcsIHRhc2spO1xuICB9XG5cbiAgX2dldFRhc2tzKCkge1xuICAgIHJldHVybiB0aGlzLnRhc2tzO1xuICB9XG59XG4iXX0=
//# sourceURL=/home/takaaki/.atom/packages/busy/lib/registry.js
