'use babel';

//
// Utility functions for parsing errors
//

Object.defineProperty(exports, '__esModule', {
  value: true
});
var notificationCfg = { dismissable: true };
var abortRegex = /aborting due to (\d+ )?previous error[s]?/;

var level2severity = function level2severity(level) {
  switch (level) {
    case 'warning':
      return 'warning';
    case 'error':
      return 'error';
    case 'note':
      return 'info';
    case 'help':
      return 'info';
    default:
      return 'error';
  }
};

var level2type = function level2type(level) {
  return level.charAt(0).toUpperCase() + level.slice(1);
};

// Set location for special cases when the compiler doesn't provide it
function preprocessMessage(msg, buildWorkDir) {
  if (msg.file) {
    return true;
  }
  if (!abortRegex.test(msg.message)) {
    // This meta error is ignored
    // Location is not provided for the message, so it cannot be added to Linter.
    // Display it as a notification.
    switch (msg.level) {
      case 'info':
      case 'note':
        atom.notifications.addInfo(msg.message, notificationCfg);
        break;
      case 'warning':
        atom.notifications.addWarning(msg.message, notificationCfg);
        break;
      default:
        atom.notifications.addError(msg.message, notificationCfg);
    }
  }
  return false;
}

exports.level2severity = level2severity;
exports.level2type = level2type;
exports.preprocessMessage = preprocessMessage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvYnVpbGQtY2FyZ28vbGliL2Vycm9ycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUM7Ozs7Ozs7OztBQU1aLElBQU0sZUFBZSxHQUFHLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxDQUFDO0FBQzlDLElBQU0sVUFBVSxHQUFHLDJDQUEyQyxDQUFDOztBQUUvRCxJQUFNLGNBQWMsR0FBRyxTQUFqQixjQUFjLENBQUksS0FBSyxFQUFLO0FBQ2hDLFVBQVEsS0FBSztBQUNYLFNBQUssU0FBUztBQUFFLGFBQU8sU0FBUyxDQUFDO0FBQUEsQUFDakMsU0FBSyxPQUFPO0FBQUUsYUFBTyxPQUFPLENBQUM7QUFBQSxBQUM3QixTQUFLLE1BQU07QUFBRSxhQUFPLE1BQU0sQ0FBQztBQUFBLEFBQzNCLFNBQUssTUFBTTtBQUFFLGFBQU8sTUFBTSxDQUFDO0FBQUEsQUFDM0I7QUFBUyxhQUFPLE9BQU8sQ0FBQztBQUFBLEdBQ3pCO0NBQ0YsQ0FBQzs7QUFFRixJQUFNLFVBQVUsR0FBRyxTQUFiLFVBQVUsQ0FBSSxLQUFLLEVBQUs7QUFDNUIsU0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDdkQsQ0FBQzs7O0FBR0YsU0FBUyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsWUFBWSxFQUFFO0FBQzVDLE1BQUksR0FBRyxDQUFDLElBQUksRUFBRTtBQUNaLFdBQU8sSUFBSSxDQUFDO0dBQ2I7QUFDRCxNQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUU7Ozs7QUFHakMsWUFBUSxHQUFHLENBQUMsS0FBSztBQUNmLFdBQUssTUFBTSxDQUFDO0FBQ1osV0FBSyxNQUFNO0FBQ1QsWUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxlQUFlLENBQUMsQ0FBQztBQUN6RCxjQUFNO0FBQUEsQUFDUixXQUFLLFNBQVM7QUFDWixZQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLGVBQWUsQ0FBQyxDQUFDO0FBQzVELGNBQU07QUFBQSxBQUNSO0FBQ0UsWUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxlQUFlLENBQUMsQ0FBQztBQUFBLEtBQzdEO0dBQ0Y7QUFDRCxTQUFPLEtBQUssQ0FBQztDQUNkOztRQUVRLGNBQWMsR0FBZCxjQUFjO1FBQUUsVUFBVSxHQUFWLFVBQVU7UUFBRSxpQkFBaUIsR0FBakIsaUJBQWlCIiwiZmlsZSI6Ii9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvYnVpbGQtY2FyZ28vbGliL2Vycm9ycy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG4vL1xuLy8gVXRpbGl0eSBmdW5jdGlvbnMgZm9yIHBhcnNpbmcgZXJyb3JzXG4vL1xuXG5jb25zdCBub3RpZmljYXRpb25DZmcgPSB7IGRpc21pc3NhYmxlOiB0cnVlIH07XG5jb25zdCBhYm9ydFJlZ2V4ID0gL2Fib3J0aW5nIGR1ZSB0byAoXFxkKyApP3ByZXZpb3VzIGVycm9yW3NdPy87XG5cbmNvbnN0IGxldmVsMnNldmVyaXR5ID0gKGxldmVsKSA9PiB7XG4gIHN3aXRjaCAobGV2ZWwpIHtcbiAgICBjYXNlICd3YXJuaW5nJzogcmV0dXJuICd3YXJuaW5nJztcbiAgICBjYXNlICdlcnJvcic6IHJldHVybiAnZXJyb3InO1xuICAgIGNhc2UgJ25vdGUnOiByZXR1cm4gJ2luZm8nO1xuICAgIGNhc2UgJ2hlbHAnOiByZXR1cm4gJ2luZm8nO1xuICAgIGRlZmF1bHQ6IHJldHVybiAnZXJyb3InO1xuICB9XG59O1xuXG5jb25zdCBsZXZlbDJ0eXBlID0gKGxldmVsKSA9PiB7XG4gIHJldHVybiBsZXZlbC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGxldmVsLnNsaWNlKDEpO1xufTtcblxuLy8gU2V0IGxvY2F0aW9uIGZvciBzcGVjaWFsIGNhc2VzIHdoZW4gdGhlIGNvbXBpbGVyIGRvZXNuJ3QgcHJvdmlkZSBpdFxuZnVuY3Rpb24gcHJlcHJvY2Vzc01lc3NhZ2UobXNnLCBidWlsZFdvcmtEaXIpIHtcbiAgaWYgKG1zZy5maWxlKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgaWYgKCFhYm9ydFJlZ2V4LnRlc3QobXNnLm1lc3NhZ2UpKSB7IC8vIFRoaXMgbWV0YSBlcnJvciBpcyBpZ25vcmVkXG4gICAgLy8gTG9jYXRpb24gaXMgbm90IHByb3ZpZGVkIGZvciB0aGUgbWVzc2FnZSwgc28gaXQgY2Fubm90IGJlIGFkZGVkIHRvIExpbnRlci5cbiAgICAvLyBEaXNwbGF5IGl0IGFzIGEgbm90aWZpY2F0aW9uLlxuICAgIHN3aXRjaCAobXNnLmxldmVsKSB7XG4gICAgICBjYXNlICdpbmZvJzpcbiAgICAgIGNhc2UgJ25vdGUnOlxuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhtc2cubWVzc2FnZSwgbm90aWZpY2F0aW9uQ2ZnKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICd3YXJuaW5nJzpcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcobXNnLm1lc3NhZ2UsIG5vdGlmaWNhdGlvbkNmZyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKG1zZy5tZXNzYWdlLCBub3RpZmljYXRpb25DZmcpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCB7IGxldmVsMnNldmVyaXR5LCBsZXZlbDJ0eXBlLCBwcmVwcm9jZXNzTWVzc2FnZSB9O1xuIl19
//# sourceURL=/home/takaaki/.atom/packages/build-cargo/lib/errors.js
