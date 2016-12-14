'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Linter = (function () {
  function Linter(registry) {
    _classCallCheck(this, Linter);

    this.linter = registry.register({ name: 'Build' });
  }

  _createClass(Linter, [{
    key: 'destroy',
    value: function destroy() {
      this.linter.dispose();
    }
  }, {
    key: 'clear',
    value: function clear() {
      this.linter.deleteMessages();
    }
  }, {
    key: 'processMessages',
    value: function processMessages(messages, cwd) {
      function extractRange(json) {
        return [[(json.line || 1) - 1, (json.col || 1) - 1], [(json.line_end || json.line || 1) - 1, (json.col_end || json.col || 1) - 1]];
      }
      function normalizePath(p) {
        return require('path').isAbsolute(p) ? p : require('path').join(cwd, p);
      }
      function typeToSeverity(type) {
        switch (type && type.toLowerCase()) {
          case 'err':
          case 'error':
            return 'error';
          case 'warn':
          case 'warning':
            return 'warning';
          default:
            return null;
        }
      }
      this.linter.setMessages(messages.map(function (match) {
        return {
          type: match.type || 'Error',
          text: match.message || 'Error from build',
          filePath: normalizePath(match.file),
          severity: typeToSeverity(match.type),
          range: extractRange(match),
          trace: match.trace && match.trace.map(function (trace) {
            return {
              type: trace.type || 'Trace',
              text: trace.message || 'Trace in build',
              filePath: trace.file && normalizePath(trace.file),
              severity: typeToSeverity(trace.type) || 'info',
              range: extractRange(trace)
            };
          })
        };
      }));
    }
  }]);

  return Linter;
})();

exports['default'] = Linter;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvYnVpbGQvbGliL2xpbnRlci1pbnRlZ3JhdGlvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUM7Ozs7Ozs7Ozs7SUFFTixNQUFNO0FBQ0MsV0FEUCxNQUFNLENBQ0UsUUFBUSxFQUFFOzBCQURsQixNQUFNOztBQUVSLFFBQUksQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO0dBQ3BEOztlQUhHLE1BQU07O1dBSUgsbUJBQUc7QUFDUixVQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ3ZCOzs7V0FDSSxpQkFBRztBQUNOLFVBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLENBQUM7S0FDOUI7OztXQUNjLHlCQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUU7QUFDN0IsZUFBUyxZQUFZLENBQUMsSUFBSSxFQUFFO0FBQzFCLGVBQU8sQ0FDTCxDQUFFLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUEsR0FBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQSxHQUFJLENBQUMsQ0FBRSxFQUM3QyxDQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQSxHQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUEsR0FBSSxDQUFDLENBQUUsQ0FDL0UsQ0FBQztPQUNIO0FBQ0QsZUFBUyxhQUFhLENBQUMsQ0FBQyxFQUFFO0FBQ3hCLGVBQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7T0FDekU7QUFDRCxlQUFTLGNBQWMsQ0FBQyxJQUFJLEVBQUU7QUFDNUIsZ0JBQVEsSUFBSSxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7QUFDaEMsZUFBSyxLQUFLLENBQUM7QUFDWCxlQUFLLE9BQU87QUFBRSxtQkFBTyxPQUFPLENBQUM7QUFBQSxBQUM3QixlQUFLLE1BQU0sQ0FBQztBQUNaLGVBQUssU0FBUztBQUFFLG1CQUFPLFNBQVMsQ0FBQztBQUFBLEFBQ2pDO0FBQVMsbUJBQU8sSUFBSSxDQUFDO0FBQUEsU0FDdEI7T0FDRjtBQUNELFVBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBQSxLQUFLO2VBQUs7QUFDN0MsY0FBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLElBQUksT0FBTztBQUMzQixjQUFJLEVBQUUsS0FBSyxDQUFDLE9BQU8sSUFBSSxrQkFBa0I7QUFDekMsa0JBQVEsRUFBRSxhQUFhLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztBQUNuQyxrQkFBUSxFQUFFLGNBQWMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO0FBQ3BDLGVBQUssRUFBRSxZQUFZLENBQUMsS0FBSyxDQUFDO0FBQzFCLGVBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQUEsS0FBSzttQkFBSztBQUM5QyxrQkFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLElBQUksT0FBTztBQUMzQixrQkFBSSxFQUFFLEtBQUssQ0FBQyxPQUFPLElBQUksZ0JBQWdCO0FBQ3ZDLHNCQUFRLEVBQUUsS0FBSyxDQUFDLElBQUksSUFBSSxhQUFhLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztBQUNqRCxzQkFBUSxFQUFFLGNBQWMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksTUFBTTtBQUM5QyxtQkFBSyxFQUFFLFlBQVksQ0FBQyxLQUFLLENBQUM7YUFDM0I7V0FBQyxDQUFDO1NBQ0o7T0FBQyxDQUFDLENBQUMsQ0FBQztLQUNOOzs7U0EzQ0csTUFBTTs7O3FCQThDRyxNQUFNIiwiZmlsZSI6Ii9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvYnVpbGQvbGliL2xpbnRlci1pbnRlZ3JhdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5jbGFzcyBMaW50ZXIge1xuICBjb25zdHJ1Y3RvcihyZWdpc3RyeSkge1xuICAgIHRoaXMubGludGVyID0gcmVnaXN0cnkucmVnaXN0ZXIoeyBuYW1lOiAnQnVpbGQnIH0pO1xuICB9XG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5saW50ZXIuZGlzcG9zZSgpO1xuICB9XG4gIGNsZWFyKCkge1xuICAgIHRoaXMubGludGVyLmRlbGV0ZU1lc3NhZ2VzKCk7XG4gIH1cbiAgcHJvY2Vzc01lc3NhZ2VzKG1lc3NhZ2VzLCBjd2QpIHtcbiAgICBmdW5jdGlvbiBleHRyYWN0UmFuZ2UoanNvbikge1xuICAgICAgcmV0dXJuIFtcbiAgICAgICAgWyAoanNvbi5saW5lIHx8IDEpIC0gMSwgKGpzb24uY29sIHx8IDEpIC0gMSBdLFxuICAgICAgICBbIChqc29uLmxpbmVfZW5kIHx8IGpzb24ubGluZSB8fCAxKSAtIDEsIChqc29uLmNvbF9lbmQgfHwganNvbi5jb2wgfHwgMSkgLSAxIF1cbiAgICAgIF07XG4gICAgfVxuICAgIGZ1bmN0aW9uIG5vcm1hbGl6ZVBhdGgocCkge1xuICAgICAgcmV0dXJuIHJlcXVpcmUoJ3BhdGgnKS5pc0Fic29sdXRlKHApID8gcCA6IHJlcXVpcmUoJ3BhdGgnKS5qb2luKGN3ZCwgcCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHR5cGVUb1NldmVyaXR5KHR5cGUpIHtcbiAgICAgIHN3aXRjaCAodHlwZSAmJiB0eXBlLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgY2FzZSAnZXJyJzpcbiAgICAgICAgY2FzZSAnZXJyb3InOiByZXR1cm4gJ2Vycm9yJztcbiAgICAgICAgY2FzZSAnd2Fybic6XG4gICAgICAgIGNhc2UgJ3dhcm5pbmcnOiByZXR1cm4gJ3dhcm5pbmcnO1xuICAgICAgICBkZWZhdWx0OiByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5saW50ZXIuc2V0TWVzc2FnZXMobWVzc2FnZXMubWFwKG1hdGNoID0+ICh7XG4gICAgICB0eXBlOiBtYXRjaC50eXBlIHx8ICdFcnJvcicsXG4gICAgICB0ZXh0OiBtYXRjaC5tZXNzYWdlIHx8ICdFcnJvciBmcm9tIGJ1aWxkJyxcbiAgICAgIGZpbGVQYXRoOiBub3JtYWxpemVQYXRoKG1hdGNoLmZpbGUpLFxuICAgICAgc2V2ZXJpdHk6IHR5cGVUb1NldmVyaXR5KG1hdGNoLnR5cGUpLFxuICAgICAgcmFuZ2U6IGV4dHJhY3RSYW5nZShtYXRjaCksXG4gICAgICB0cmFjZTogbWF0Y2gudHJhY2UgJiYgbWF0Y2gudHJhY2UubWFwKHRyYWNlID0+ICh7XG4gICAgICAgIHR5cGU6IHRyYWNlLnR5cGUgfHwgJ1RyYWNlJyxcbiAgICAgICAgdGV4dDogdHJhY2UubWVzc2FnZSB8fCAnVHJhY2UgaW4gYnVpbGQnLFxuICAgICAgICBmaWxlUGF0aDogdHJhY2UuZmlsZSAmJiBub3JtYWxpemVQYXRoKHRyYWNlLmZpbGUpLFxuICAgICAgICBzZXZlcml0eTogdHlwZVRvU2V2ZXJpdHkodHJhY2UudHlwZSkgfHwgJ2luZm8nLFxuICAgICAgICByYW5nZTogZXh0cmFjdFJhbmdlKHRyYWNlKVxuICAgICAgfSkpXG4gICAgfSkpKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBMaW50ZXI7XG4iXX0=
//# sourceURL=/home/takaaki/.atom/packages/build/lib/linter-integration.js
