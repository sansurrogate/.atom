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
          text: !match.message && !match.html_message ? 'Error from build' : match.message,
          html: match.message ? undefined : match.html_message,
          filePath: normalizePath(match.file),
          severity: typeToSeverity(match.type),
          range: extractRange(match),
          trace: match.trace && match.trace.map(function (trace) {
            return {
              type: trace.type || 'Trace',
              text: !trace.message && !trace.html_message ? 'Trace in build' : trace.message,
              html: trace.message ? undefined : trace.html_message,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvYnVpbGQvbGliL2xpbnRlci1pbnRlZ3JhdGlvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUM7Ozs7Ozs7Ozs7SUFFTixNQUFNO0FBQ0MsV0FEUCxNQUFNLENBQ0UsUUFBUSxFQUFFOzBCQURsQixNQUFNOztBQUVSLFFBQUksQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO0dBQ3BEOztlQUhHLE1BQU07O1dBSUgsbUJBQUc7QUFDUixVQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ3ZCOzs7V0FDSSxpQkFBRztBQUNOLFVBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLENBQUM7S0FDOUI7OztXQUNjLHlCQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUU7QUFDN0IsZUFBUyxZQUFZLENBQUMsSUFBSSxFQUFFO0FBQzFCLGVBQU8sQ0FDTCxDQUFFLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUEsR0FBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQSxHQUFJLENBQUMsQ0FBRSxFQUM3QyxDQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQSxHQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUEsR0FBSSxDQUFDLENBQUUsQ0FDL0UsQ0FBQztPQUNIO0FBQ0QsZUFBUyxhQUFhLENBQUMsQ0FBQyxFQUFFO0FBQ3hCLGVBQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7T0FDekU7QUFDRCxlQUFTLGNBQWMsQ0FBQyxJQUFJLEVBQUU7QUFDNUIsZ0JBQVEsSUFBSSxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7QUFDaEMsZUFBSyxLQUFLLENBQUM7QUFDWCxlQUFLLE9BQU87QUFBRSxtQkFBTyxPQUFPLENBQUM7QUFBQSxBQUM3QixlQUFLLE1BQU0sQ0FBQztBQUNaLGVBQUssU0FBUztBQUFFLG1CQUFPLFNBQVMsQ0FBQztBQUFBLEFBQ2pDO0FBQVMsbUJBQU8sSUFBSSxDQUFDO0FBQUEsU0FDdEI7T0FDRjtBQUNELFVBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBQSxLQUFLO2VBQUs7QUFDN0MsY0FBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLElBQUksT0FBTztBQUMzQixjQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksR0FBRyxrQkFBa0IsR0FBRyxLQUFLLENBQUMsT0FBTztBQUNoRixjQUFJLEVBQUUsS0FBSyxDQUFDLE9BQU8sR0FBRyxTQUFTLEdBQUcsS0FBSyxDQUFDLFlBQVk7QUFDcEQsa0JBQVEsRUFBRSxhQUFhLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztBQUNuQyxrQkFBUSxFQUFFLGNBQWMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO0FBQ3BDLGVBQUssRUFBRSxZQUFZLENBQUMsS0FBSyxDQUFDO0FBQzFCLGVBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQUEsS0FBSzttQkFBSztBQUM5QyxrQkFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLElBQUksT0FBTztBQUMzQixrQkFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEdBQUcsZ0JBQWdCLEdBQUcsS0FBSyxDQUFDLE9BQU87QUFDOUUsa0JBQUksRUFBRSxLQUFLLENBQUMsT0FBTyxHQUFHLFNBQVMsR0FBRyxLQUFLLENBQUMsWUFBWTtBQUNwRCxzQkFBUSxFQUFFLEtBQUssQ0FBQyxJQUFJLElBQUksYUFBYSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7QUFDakQsc0JBQVEsRUFBRSxjQUFjLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLE1BQU07QUFDOUMsbUJBQUssRUFBRSxZQUFZLENBQUMsS0FBSyxDQUFDO2FBQzNCO1dBQUMsQ0FBQztTQUNKO09BQUMsQ0FBQyxDQUFDLENBQUM7S0FDTjs7O1NBN0NHLE1BQU07OztxQkFnREcsTUFBTSIsImZpbGUiOiIvaG9tZS90YWthYWtpLy5hdG9tL3BhY2thZ2VzL2J1aWxkL2xpYi9saW50ZXItaW50ZWdyYXRpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuY2xhc3MgTGludGVyIHtcbiAgY29uc3RydWN0b3IocmVnaXN0cnkpIHtcbiAgICB0aGlzLmxpbnRlciA9IHJlZ2lzdHJ5LnJlZ2lzdGVyKHsgbmFtZTogJ0J1aWxkJyB9KTtcbiAgfVxuICBkZXN0cm95KCkge1xuICAgIHRoaXMubGludGVyLmRpc3Bvc2UoKTtcbiAgfVxuICBjbGVhcigpIHtcbiAgICB0aGlzLmxpbnRlci5kZWxldGVNZXNzYWdlcygpO1xuICB9XG4gIHByb2Nlc3NNZXNzYWdlcyhtZXNzYWdlcywgY3dkKSB7XG4gICAgZnVuY3Rpb24gZXh0cmFjdFJhbmdlKGpzb24pIHtcbiAgICAgIHJldHVybiBbXG4gICAgICAgIFsgKGpzb24ubGluZSB8fCAxKSAtIDEsIChqc29uLmNvbCB8fCAxKSAtIDEgXSxcbiAgICAgICAgWyAoanNvbi5saW5lX2VuZCB8fCBqc29uLmxpbmUgfHwgMSkgLSAxLCAoanNvbi5jb2xfZW5kIHx8IGpzb24uY29sIHx8IDEpIC0gMSBdXG4gICAgICBdO1xuICAgIH1cbiAgICBmdW5jdGlvbiBub3JtYWxpemVQYXRoKHApIHtcbiAgICAgIHJldHVybiByZXF1aXJlKCdwYXRoJykuaXNBYnNvbHV0ZShwKSA/IHAgOiByZXF1aXJlKCdwYXRoJykuam9pbihjd2QsIHApO1xuICAgIH1cbiAgICBmdW5jdGlvbiB0eXBlVG9TZXZlcml0eSh0eXBlKSB7XG4gICAgICBzd2l0Y2ggKHR5cGUgJiYgdHlwZS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICAgIGNhc2UgJ2Vycic6XG4gICAgICAgIGNhc2UgJ2Vycm9yJzogcmV0dXJuICdlcnJvcic7XG4gICAgICAgIGNhc2UgJ3dhcm4nOlxuICAgICAgICBjYXNlICd3YXJuaW5nJzogcmV0dXJuICd3YXJuaW5nJztcbiAgICAgICAgZGVmYXVsdDogcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMubGludGVyLnNldE1lc3NhZ2VzKG1lc3NhZ2VzLm1hcChtYXRjaCA9PiAoe1xuICAgICAgdHlwZTogbWF0Y2gudHlwZSB8fCAnRXJyb3InLFxuICAgICAgdGV4dDogIW1hdGNoLm1lc3NhZ2UgJiYgIW1hdGNoLmh0bWxfbWVzc2FnZSA/ICdFcnJvciBmcm9tIGJ1aWxkJyA6IG1hdGNoLm1lc3NhZ2UsXG4gICAgICBodG1sOiBtYXRjaC5tZXNzYWdlID8gdW5kZWZpbmVkIDogbWF0Y2guaHRtbF9tZXNzYWdlLFxuICAgICAgZmlsZVBhdGg6IG5vcm1hbGl6ZVBhdGgobWF0Y2guZmlsZSksXG4gICAgICBzZXZlcml0eTogdHlwZVRvU2V2ZXJpdHkobWF0Y2gudHlwZSksXG4gICAgICByYW5nZTogZXh0cmFjdFJhbmdlKG1hdGNoKSxcbiAgICAgIHRyYWNlOiBtYXRjaC50cmFjZSAmJiBtYXRjaC50cmFjZS5tYXAodHJhY2UgPT4gKHtcbiAgICAgICAgdHlwZTogdHJhY2UudHlwZSB8fCAnVHJhY2UnLFxuICAgICAgICB0ZXh0OiAhdHJhY2UubWVzc2FnZSAmJiAhdHJhY2UuaHRtbF9tZXNzYWdlID8gJ1RyYWNlIGluIGJ1aWxkJyA6IHRyYWNlLm1lc3NhZ2UsXG4gICAgICAgIGh0bWw6IHRyYWNlLm1lc3NhZ2UgPyB1bmRlZmluZWQgOiB0cmFjZS5odG1sX21lc3NhZ2UsXG4gICAgICAgIGZpbGVQYXRoOiB0cmFjZS5maWxlICYmIG5vcm1hbGl6ZVBhdGgodHJhY2UuZmlsZSksXG4gICAgICAgIHNldmVyaXR5OiB0eXBlVG9TZXZlcml0eSh0cmFjZS50eXBlKSB8fCAnaW5mbycsXG4gICAgICAgIHJhbmdlOiBleHRyYWN0UmFuZ2UodHJhY2UpXG4gICAgICB9KSlcbiAgICB9KSkpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IExpbnRlcjtcbiJdfQ==
//# sourceURL=/home/takaaki/.atom/packages/build/lib/linter-integration.js
