'use babel';

//
// Utility functions for parsing errors
//

Object.defineProperty(exports, '__esModule', {
  value: true
});
var notificationCfg = { dismissable: true };

// Meta errors are ignored
var metaErrors = [/aborting due to (\d+ )?previous error[s]?/, /Could not compile `.+`./];

// Collection of span labels that must be ignored (not added to the main message)
// because the main message already contains the same information
var redundantLabels = [{
  // E0001
  label: /this is an unreachable pattern/,
  message: /unreachable pattern/
}, {
  // E0004
  label: /pattern `.+` not covered/,
  message: /non-exhaustive patterns: `.+` not covered/
}, {
  // E00023
  label: /expected \d+ field[s]?, found \d+/,
  message: /this pattern has \d+ field[s]?, but the corresponding variant has \d+ field[s]?/
}, {
  // E0026
  label: /struct `.+` does not have field `.+`/,
  message: /struct `.+` does not have a field named `.+`/
}, {
  // E0027
  label: /missing field `.+`/,
  message: /pattern does not mention field `.+`/
}, {
  // E0029
  label: /ranges require char or numeric types/,
  message: /only char and numeric types are allowed in range patterns/
}, {
  // E0040
  label: /call to destructor method/,
  message: /explicit use of destructor method/
}, {
  // E0046
  label: /missing `.+` in implementation/,
  message: /not all trait items implemented, missing: `.+`/
}, {
  // E0057
  label: /expected \d+ parameter[s]?/,
  message: /this function takes \d+ parameter[s]? but \d+ parameter[s]? (was|were) supplied/
}, {
  // E0062
  label: /used more than once/,
  message: /field `.+` specified more than once/
}, {
  // E0067
  label: /invalid expression for left-hand side/,
  message: /invalid left-hand side expression/
}, {
  // E0068
  label: /return type is not \(\)/,
  message: /`return;` in a function whose return type is not `\(\)`/
}, {
  // E0071
  label: /not a struct/,
  message: /`.+` does not name a struct or a struct variant/
}, {
  // E0072
  label: /recursive type has infinite size/,
  message: /recursive type `.+` has infinite size/
}, {
  // E0087
  label: /expected \d+ parameter[s]?/,
  message: /too many type parameters provided: expected at most \d+ parameter[s]?, found \d+ parameter[s]?/
}, {
  // E0091
  label: /unused type parameter/,
  message: /type parameter `.+` is unused/
}, {
  // E0101
  label: /cannot resolve type of expression/,
  message: /cannot determine a type for this expression: unconstrained type/
}, {
  // E0102
  label: /cannot resolve type of variable/,
  message: /cannot determine a type for this local variable: unconstrained type/
}, {
  // E0106
  label: /expected lifetime parameter/,
  message: /missing lifetime specifier/
}, {
  // E0107
  label: /(un)?expected (\d+ )?lifetime parameter[s]?/,
  message: /wrong number of lifetime parameters: expected \d+, found \d+/
}, {
  // E0109
  label: /type parameter not allowed/,
  message: /type parameters are not allowed on this type/
}, {
  // E0110
  label: /lifetime parameter not allowed/,
  message: /lifetime parameters are not allowed on this type/
}, {
  // E0116
  label: /impl for type defined outside of crate/,
  message: /cannot define inherent `.+` for a type outside of the crate where the type is defined/
}, {
  // E0117
  label: /impl doesn't use types inside crate/,
  message: /only traits defined in the current crate can be implemented for arbitrary types/
}, {
  // E0119
  label: /conflicting implementation for `.+`/,
  message: /conflicting implementations of trait `.+` for type `.+`/
}, {
  // E0120
  label: /implementing Drop requires a struct/,
  message: /the Drop trait may only be implemented on structures/
}, {
  // E0121
  label: /not allowed in type signatures/,
  message: /the type placeholder `_` is not allowed within types on item signatures/
}, {
  // E0124
  label: /field already declared/,
  message: /field `.+` is already declared/
}, {
  // E0368
  label: /cannot use `[<>+&|^\-]?=` on type `.+`/,
  message: /binary assignment operation `[<>+&|^\-]?=` cannot be applied to type `.+`/
}, {
  // E0387
  label: /cannot borrow mutably/,
  message: /cannot borrow immutable local variable `.+` as mutable/
}];

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

// Appends a span label to the main message if it's not redundant.
function appendSpanLabel(msg) {
  if (msg.extra.spanLabel && msg.extra.spanLabel.length > 0) {
    var label = msg.extra.spanLabel;
    if (msg.message.indexOf(label) >= 0) {
      return; // Label is contained within the main message
    }
    for (var i = 0; i < redundantLabels.length; i++) {
      var l = redundantLabels[i];
      if (l.label.test(label) && l.message.test(msg.message)) {
        return; // Submesage fits one of the deduplication patterns
      }
    }
    msg.message += ' (' + label + ')';
  }
}

// Adds the error code to the message
function appendErrorCode(msg) {
  if (msg.extra.errorCode && msg.extra.errorCode.length > 0) {
    msg.message += ' [' + msg.extra.errorCode + ']';
  }
}

// Adds an extra info (if provided) to the message.
// Deletes the extra info after extracting.
function appendExtraInfo(msg) {
  if (msg.extra) {
    appendSpanLabel(msg);
    appendErrorCode(msg);
    delete msg.extra;
  }
}

// Checks if the location of the given message is valid
function isValidLocation(msg) {
  return msg.file && !msg.file.startsWith('<');
}

// Removes location info from the given message
function removeLocation(msg) {
  delete msg.file;
  delete msg.line;
  delete msg.line_end;
  delete msg.col;
  delete msg.col_end;
}

// Copies location info from one message to another
function copyLocation(fromMsg, toMsg) {
  toMsg.file = fromMsg.file;
  toMsg.line = fromMsg.line;
  toMsg.line_end = fromMsg.line_end;
  toMsg.col = fromMsg.col;
  toMsg.col_end = fromMsg.col_end;
}

// Removes location info from the submessage if it's exactly the same as in
// the main message.
// Fixes locations that don't point to a valid source code.
// Example: <std macros>:1:33: 1:60
function normalizeLocations(msg) {
  for (var i = 0; i < msg.trace.length; i++) {
    var subMsg = msg.trace[i];
    // Deduplicate location
    if (!isValidLocation(subMsg) || subMsg.file === msg.file && subMsg.line === msg.line && subMsg.col === msg.col) {
      removeLocation(subMsg);
    }
    if (!isValidLocation(msg) && isValidLocation(subMsg)) {
      copyLocation(subMsg, msg);
      removeLocation(subMsg);
    }
  }
}

// Set location for special cases when the compiler doesn't provide it
function preprocessMessage(msg, buildWorkDir) {
  appendExtraInfo(msg);
  normalizeLocations(msg);
  // Check if the message can be added to Linter
  if (isValidLocation(msg)) {
    return true;
  }
  // Ignore meta errors
  for (var i = 0; i < metaErrors.length; i++) {
    if (metaErrors[i].test(msg.message)) {
      return false;
    }
  }
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
  return false;
}

exports.level2severity = level2severity;
exports.level2type = level2type;
exports.preprocessMessage = preprocessMessage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvYnVpbGQtY2FyZ28vbGliL2Vycm9ycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUM7Ozs7Ozs7OztBQU1aLElBQU0sZUFBZSxHQUFHLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxDQUFDOzs7QUFHOUMsSUFBTSxVQUFVLEdBQUcsQ0FDakIsMkNBQTJDLEVBQzNDLHlCQUF5QixDQUMxQixDQUFDOzs7O0FBSUYsSUFBTSxlQUFlLEdBQUcsQ0FBQzs7QUFFdkIsT0FBSyxFQUFFLGdDQUFnQztBQUN2QyxTQUFPLEVBQUUscUJBQXFCO0NBQy9CLEVBQUU7O0FBRUQsT0FBSyxFQUFFLDBCQUEwQjtBQUNqQyxTQUFPLEVBQUUsMkNBQTJDO0NBQ3JELEVBQUU7O0FBRUQsT0FBSyxFQUFFLG1DQUFtQztBQUMxQyxTQUFPLEVBQUUsaUZBQWlGO0NBQzNGLEVBQUU7O0FBRUQsT0FBSyxFQUFFLHNDQUFzQztBQUM3QyxTQUFPLEVBQUUsOENBQThDO0NBQ3hELEVBQUU7O0FBRUQsT0FBSyxFQUFFLG9CQUFvQjtBQUMzQixTQUFPLEVBQUUscUNBQXFDO0NBQy9DLEVBQUU7O0FBRUQsT0FBSyxFQUFFLHNDQUFzQztBQUM3QyxTQUFPLEVBQUUsMkRBQTJEO0NBQ3JFLEVBQUU7O0FBRUQsT0FBSyxFQUFFLDJCQUEyQjtBQUNsQyxTQUFPLEVBQUUsbUNBQW1DO0NBQzdDLEVBQUU7O0FBRUQsT0FBSyxFQUFFLGdDQUFnQztBQUN2QyxTQUFPLEVBQUUsZ0RBQWdEO0NBQzFELEVBQUU7O0FBRUQsT0FBSyxFQUFFLDRCQUE0QjtBQUNuQyxTQUFPLEVBQUUsaUZBQWlGO0NBQzNGLEVBQUU7O0FBRUQsT0FBSyxFQUFFLHFCQUFxQjtBQUM1QixTQUFPLEVBQUUscUNBQXFDO0NBQy9DLEVBQUU7O0FBRUQsT0FBSyxFQUFFLHVDQUF1QztBQUM5QyxTQUFPLEVBQUUsbUNBQW1DO0NBQzdDLEVBQUU7O0FBRUQs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QUFHRCxTQUFTLGlCQUFpQixDQUFDLEdBQUcsRUFBRSxZQUFZLEVBQUU7QUFDNUMsaUJBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNyQixvQkFBa0IsQ0FBQyxHQUFHLENBQUMsQ0FBQzs7QUFFeEIsTUFBSSxlQUFlLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDeEIsV0FBTyxJQUFJLENBQUM7R0FDYjs7QUFFRCxPQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUMxQyxRQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ25DLGFBQU8sS0FBSyxDQUFDO0tBQ2Q7R0FDRjs7O0FBR0QsVUFBUSxHQUFHLENBQUMsS0FBSztBQUNmLFNBQUssTUFBTSxDQUFDO0FBQ1osU0FBSyxNQUFNO0FBQ1QsVUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxlQUFlLENBQUMsQ0FBQztBQUN6RCxZQUFNO0FBQUEsQUFDUixTQUFLLFNBQVM7QUFDWixVQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLGVBQWUsQ0FBQyxDQUFDO0FBQzVELFlBQU07QUFBQSxBQUNSO0FBQ0UsVUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxlQUFlLENBQUMsQ0FBQztBQUFBLEdBQzdEO0FBQ0QsU0FBTyxLQUFLLENBQUM7Q0FDZDs7UUFFUSxjQUFjLEdBQWQsY0FBYztRQUFFLFVBQVUsR0FBVixVQUFVO1FBQUUsaUJBQWlCLEdBQWpCLGlCQUFpQiIsImZpbGUiOiIvaG9tZS90YWthYWtpLy5hdG9tL3BhY2thZ2VzL2J1aWxkLWNhcmdvL2xpYi9lcnJvcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuLy9cbi8vIFV0aWxpdHkgZnVuY3Rpb25zIGZvciBwYXJzaW5nIGVycm9yc1xuLy9cblxuY29uc3Qgbm90aWZpY2F0aW9uQ2ZnID0geyBkaXNtaXNzYWJsZTogdHJ1ZSB9O1xuXG4vLyBNZXRhIGVycm9ycyBhcmUgaWdub3JlZFxuY29uc3QgbWV0YUVycm9ycyA9IFtcbiAgL2Fib3J0aW5nIGR1ZSB0byAoXFxkKyApP3ByZXZpb3VzIGVycm9yW3NdPy8sXG4gIC9Db3VsZCBub3QgY29tcGlsZSBgLitgLi9cbl07XG5cbi8vIENvbGxlY3Rpb24gb2Ygc3BhbiBsYWJlbHMgdGhhdCBtdXN0IGJlIGlnbm9yZWQgKG5vdCBhZGRlZCB0byB0aGUgbWFpbiBtZXNzYWdlKVxuLy8gYmVjYXVzZSB0aGUgbWFpbiBtZXNzYWdlIGFscmVhZHkgY29udGFpbnMgdGhlIHNhbWUgaW5mb3JtYXRpb25cbmNvbnN0IHJlZHVuZGFudExhYmVscyA9IFt7XG4gIC8vIEUwMDAxXG4gIGxhYmVsOiAvdGhpcyBpcyBhbiB1bnJlYWNoYWJsZSBwYXR0ZXJuLyxcbiAgbWVzc2FnZTogL3VucmVhY2hhYmxlIHBhdHRlcm4vXG59LCB7XG4gIC8vIEUwMDA0XG4gIGxhYmVsOiAvcGF0dGVybiBgLitgIG5vdCBjb3ZlcmVkLyxcbiAgbWVzc2FnZTogL25vbi1leGhhdXN0aXZlIHBhdHRlcm5zOiBgLitgIG5vdCBjb3ZlcmVkL1xufSwge1xuICAvLyBFMDAwMjNcbiAgbGFiZWw6IC9leHBlY3RlZCBcXGQrIGZpZWxkW3NdPywgZm91bmQgXFxkKy8sXG4gIG1lc3NhZ2U6IC90aGlzIHBhdHRlcm4gaGFzIFxcZCsgZmllbGRbc10/LCBidXQgdGhlIGNvcnJlc3BvbmRpbmcgdmFyaWFudCBoYXMgXFxkKyBmaWVsZFtzXT8vXG59LCB7XG4gIC8vIEUwMDI2XG4gIGxhYmVsOiAvc3RydWN0IGAuK2AgZG9lcyBub3QgaGF2ZSBmaWVsZCBgLitgLyxcbiAgbWVzc2FnZTogL3N0cnVjdCBgLitgIGRvZXMgbm90IGhhdmUgYSBmaWVsZCBuYW1lZCBgLitgL1xufSwge1xuICAvLyBFMDAyN1xuICBsYWJlbDogL21pc3NpbmcgZmllbGQgYC4rYC8sXG4gIG1lc3NhZ2U6IC9wYXR0ZXJuIGRvZXMgbm90IG1lbnRpb24gZmllbGQgYC4rYC9cbn0sIHtcbiAgLy8gRTAwMjlcbiAgbGFiZWw6IC9yYW5nZXMgcmVxdWlyZSBjaGFyIG9yIG51bWVyaWMgdHlwZXMvLFxuICBtZXNzYWdlOiAvb25seSBjaGFyIGFuZCBudW1lcmljIHR5cGVzIGFyZSBhbGxvd2VkIGluIHJhbmdlIHBhdHRlcm5zL1xufSwge1xuICAvLyBFMDA0MFxuICBsYWJlbDogL2NhbGwgdG8gZGVzdHJ1Y3RvciBtZXRob2QvLFxuICBtZXNzYWdlOiAvZXhwbGljaXQgdXNlIG9mIGRlc3RydWN0b3IgbWV0aG9kL1xufSwge1xuICAvLyBFMDA0NlxuICBsYWJlbDogL21pc3NpbmcgYC4rYCBpbiBpbXBsZW1lbnRhdGlvbi8sXG4gIG1lc3NhZ2U6IC9ub3QgYWxsIHRyYWl0IGl0ZW1zIGltcGxlbWVudGVkLCBtaXNzaW5nOiBgLitgL1xufSwge1xuICAvLyBFMDA1N1xuICBsYWJlbDogL2V4cGVjdGVkIFxcZCsgcGFyYW1ldGVyW3NdPy8sXG4gIG1lc3NhZ2U6IC90aGlzIGZ1bmN0aW9uIHRha2VzIFxcZCsgcGFyYW1ldGVyW3NdPyBidXQgXFxkKyBwYXJhbWV0ZXJbc10/ICh3YXN8d2VyZSkgc3VwcGxpZWQvXG59LCB7XG4gIC8vIEUwMDYyXG4gIGxhYmVsOiAvdXNlZCBtb3JlIHRoYW4gb25jZS8sXG4gIG1lc3NhZ2U6IC9maWVsZCBgLitgIHNwZWNpZmllZCBtb3JlIHRoYW4gb25jZS9cbn0sIHtcbiAgLy8gRTAwNjdcbiAgbGFiZWw6IC9pbnZhbGlkIGV4cHJlc3Npb24gZm9yIGxlZnQtaGFuZCBzaWRlLyxcbiAgbWVzc2FnZTogL2ludmFsaWQgbGVmdC1oYW5kIHNpZGUgZXhwcmVzc2lvbi9cbn0sIHtcbiAgLy8gRTAwNjhcbiAgbGFiZWw6IC9yZXR1cm4gdHlwZSBpcyBub3QgXFwoXFwpLyxcbiAgbWVzc2FnZTogL2ByZXR1cm47YCBpbiBhIGZ1bmN0aW9uIHdob3NlIHJldHVybiB0eXBlIGlzIG5vdCBgXFwoXFwpYC9cbn0sIHtcbiAgLy8gRTAwNzFcbiAgbGFiZWw6IC9ub3QgYSBzdHJ1Y3QvLFxuICBtZXNzYWdlOiAvYC4rYCBkb2VzIG5vdCBuYW1lIGEgc3RydWN0IG9yIGEgc3RydWN0IHZhcmlhbnQvXG59LCB7XG4gIC8vIEUwMDcyXG4gIGxhYmVsOiAvcmVjdXJzaXZlIHR5cGUgaGFzIGluZmluaXRlIHNpemUvLFxuICBtZXNzYWdlOiAvcmVjdXJzaXZlIHR5cGUgYC4rYCBoYXMgaW5maW5pdGUgc2l6ZS9cbn0sIHtcbiAgLy8gRTAwODdcbiAgbGFiZWw6IC9leHBlY3RlZCBcXGQrIHBhcmFtZXRlcltzXT8vLFxuICBtZXNzYWdlOiAvdG9vIG1hbnkgdHlwZSBwYXJhbWV0ZXJzIHByb3ZpZGVkOiBleHBlY3RlZCBhdCBtb3N0IFxcZCsgcGFyYW1ldGVyW3NdPywgZm91bmQgXFxkKyBwYXJhbWV0ZXJbc10/L1xufSwge1xuICAvLyBFMDA5MVxuICBsYWJlbDogL3VudXNlZCB0eXBlIHBhcmFtZXRlci8sXG4gIG1lc3NhZ2U6IC90eXBlIHBhcmFtZXRlciBgLitgIGlzIHVudXNlZC9cbn0sIHtcbiAgLy8gRTAxMDFcbiAgbGFiZWw6IC9jYW5ub3QgcmVzb2x2ZSB0eXBlIG9mIGV4cHJlc3Npb24vLFxuICBtZXNzYWdlOiAvY2Fubm90IGRldGVybWluZSBhIHR5cGUgZm9yIHRoaXMgZXhwcmVzc2lvbjogdW5jb25zdHJhaW5lZCB0eXBlL1xufSwge1xuICAvLyBFMDEwMlxuICBsYWJlbDogL2Nhbm5vdCByZXNvbHZlIHR5cGUgb2YgdmFyaWFibGUvLFxuICBtZXNzYWdlOiAvY2Fubm90IGRldGVybWluZSBhIHR5cGUgZm9yIHRoaXMgbG9jYWwgdmFyaWFibGU6IHVuY29uc3RyYWluZWQgdHlwZS9cbn0sIHtcbiAgLy8gRTAxMDZcbiAgbGFiZWw6IC9leHBlY3RlZCBsaWZldGltZSBwYXJhbWV0ZXIvLFxuICBtZXNzYWdlOiAvbWlzc2luZyBsaWZldGltZSBzcGVjaWZpZXIvXG59LCB7XG4gIC8vIEUwMTA3XG4gIGxhYmVsOiAvKHVuKT9leHBlY3RlZCAoXFxkKyApP2xpZmV0aW1lIHBhcmFtZXRlcltzXT8vLFxuICBtZXNzYWdlOiAvd3JvbmcgbnVtYmVyIG9mIGxpZmV0aW1lIHBhcmFtZXRlcnM6IGV4cGVjdGVkIFxcZCssIGZvdW5kIFxcZCsvXG59LCB7XG4gIC8vIEUwMTA5XG4gIGxhYmVsOiAvdHlwZSBwYXJhbWV0ZXIgbm90IGFsbG93ZWQvLFxuICBtZXNzYWdlOiAvdHlwZSBwYXJhbWV0ZXJzIGFyZSBub3QgYWxsb3dlZCBvbiB0aGlzIHR5cGUvXG59LCB7XG4gIC8vIEUwMTEwXG4gIGxhYmVsOiAvbGlmZXRpbWUgcGFyYW1ldGVyIG5vdCBhbGxvd2VkLyxcbiAgbWVzc2FnZTogL2xpZmV0aW1lIHBhcmFtZXRlcnMgYXJlIG5vdCBhbGxvd2VkIG9uIHRoaXMgdHlwZS9cbn0sIHtcbiAgLy8gRTAxMTZcbiAgbGFiZWw6IC9pbXBsIGZvciB0eXBlIGRlZmluZWQgb3V0c2lkZSBvZiBjcmF0ZS8sXG4gIG1lc3NhZ2U6IC9jYW5ub3QgZGVmaW5lIGluaGVyZW50IGAuK2AgZm9yIGEgdHlwZSBvdXRzaWRlIG9mIHRoZSBjcmF0ZSB3aGVyZSB0aGUgdHlwZSBpcyBkZWZpbmVkL1xufSwge1xuICAvLyBFMDExN1xuICBsYWJlbDogL2ltcGwgZG9lc24ndCB1c2UgdHlwZXMgaW5zaWRlIGNyYXRlLyxcbiAgbWVzc2FnZTogL29ubHkgdHJhaXRzIGRlZmluZWQgaW4gdGhlIGN1cnJlbnQgY3JhdGUgY2FuIGJlIGltcGxlbWVudGVkIGZvciBhcmJpdHJhcnkgdHlwZXMvXG59LCB7XG4gIC8vIEUwMTE5XG4gIGxhYmVsOiAvY29uZmxpY3RpbmcgaW1wbGVtZW50YXRpb24gZm9yIGAuK2AvLFxuICBtZXNzYWdlOiAvY29uZmxpY3RpbmcgaW1wbGVtZW50YXRpb25zIG9mIHRyYWl0IGAuK2AgZm9yIHR5cGUgYC4rYC9cbn0sIHtcbiAgLy8gRTAxMjBcbiAgbGFiZWw6IC9pbXBsZW1lbnRpbmcgRHJvcCByZXF1aXJlcyBhIHN0cnVjdC8sXG4gIG1lc3NhZ2U6IC90aGUgRHJvcCB0cmFpdCBtYXkgb25seSBiZSBpbXBsZW1lbnRlZCBvbiBzdHJ1Y3R1cmVzL1xufSwge1xuICAvLyBFMDEyMVxuICBsYWJlbDogL25vdCBhbGxvd2VkIGluIHR5cGUgc2lnbmF0dXJlcy8sXG4gIG1lc3NhZ2U6IC90aGUgdHlwZSBwbGFjZWhvbGRlciBgX2AgaXMgbm90IGFsbG93ZWQgd2l0aGluIHR5cGVzIG9uIGl0ZW0gc2lnbmF0dXJlcy9cbn0sIHtcbiAgLy8gRTAxMjRcbiAgbGFiZWw6IC9maWVsZCBhbHJlYWR5IGRlY2xhcmVkLyxcbiAgbWVzc2FnZTogL2ZpZWxkIGAuK2AgaXMgYWxyZWFkeSBkZWNsYXJlZC9cbn0sIHtcbiAgLy8gRTAzNjhcbiAgbGFiZWw6IC9jYW5ub3QgdXNlIGBbPD4rJnxeXFwtXT89YCBvbiB0eXBlIGAuK2AvLFxuICBtZXNzYWdlOiAvYmluYXJ5IGFzc2lnbm1lbnQgb3BlcmF0aW9uIGBbPD4rJnxeXFwtXT89YCBjYW5ub3QgYmUgYXBwbGllZCB0byB0eXBlIGAuK2AvXG59LCB7XG4gIC8vIEUwMzg3XG4gIGxhYmVsOiAvY2Fubm90IGJvcnJvdyBtdXRhYmx5LyxcbiAgbWVzc2FnZTogL2Nhbm5vdCBib3Jyb3cgaW1tdXRhYmxlIGxvY2FsIHZhcmlhYmxlIGAuK2AgYXMgbXV0YWJsZS9cbn1dO1xuXG5jb25zdCBsZXZlbDJzZXZlcml0eSA9IChsZXZlbCkgPT4ge1xuICBzd2l0Y2ggKGxldmVsKSB7XG4gICAgY2FzZSAnd2FybmluZyc6IHJldHVybiAnd2FybmluZyc7XG4gICAgY2FzZSAnZXJyb3InOiByZXR1cm4gJ2Vycm9yJztcbiAgICBjYXNlICdub3RlJzogcmV0dXJuICdpbmZvJztcbiAgICBjYXNlICdoZWxwJzogcmV0dXJuICdpbmZvJztcbiAgICBkZWZhdWx0OiByZXR1cm4gJ2Vycm9yJztcbiAgfVxufTtcblxuY29uc3QgbGV2ZWwydHlwZSA9IChsZXZlbCkgPT4ge1xuICByZXR1cm4gbGV2ZWwuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBsZXZlbC5zbGljZSgxKTtcbn07XG5cbi8vIEFwcGVuZHMgYSBzcGFuIGxhYmVsIHRvIHRoZSBtYWluIG1lc3NhZ2UgaWYgaXQncyBub3QgcmVkdW5kYW50LlxuZnVuY3Rpb24gYXBwZW5kU3BhbkxhYmVsKG1zZykge1xuICBpZiAobXNnLmV4dHJhLnNwYW5MYWJlbCAmJiBtc2cuZXh0cmEuc3BhbkxhYmVsLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBsYWJlbCA9IG1zZy5leHRyYS5zcGFuTGFiZWw7XG4gICAgaWYgKG1zZy5tZXNzYWdlLmluZGV4T2YobGFiZWwpID49IDApIHtcbiAgICAgIHJldHVybjsgICAgICAvLyBMYWJlbCBpcyBjb250YWluZWQgd2l0aGluIHRoZSBtYWluIG1lc3NhZ2VcbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZWR1bmRhbnRMYWJlbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGwgPSByZWR1bmRhbnRMYWJlbHNbaV07XG4gICAgICBpZiAobC5sYWJlbC50ZXN0KGxhYmVsKSAmJiBsLm1lc3NhZ2UudGVzdChtc2cubWVzc2FnZSkpIHtcbiAgICAgICAgcmV0dXJuOyAgICAvLyBTdWJtZXNhZ2UgZml0cyBvbmUgb2YgdGhlIGRlZHVwbGljYXRpb24gcGF0dGVybnNcbiAgICAgIH1cbiAgICB9XG4gICAgbXNnLm1lc3NhZ2UgKz0gJyAoJyArIGxhYmVsICsgJyknO1xuICB9XG59XG5cbi8vIEFkZHMgdGhlIGVycm9yIGNvZGUgdG8gdGhlIG1lc3NhZ2VcbmZ1bmN0aW9uIGFwcGVuZEVycm9yQ29kZShtc2cpIHtcbiAgaWYgKG1zZy5leHRyYS5lcnJvckNvZGUgJiYgbXNnLmV4dHJhLmVycm9yQ29kZS5sZW5ndGggPiAwKSB7XG4gICAgbXNnLm1lc3NhZ2UgKz0gJyBbJyArIG1zZy5leHRyYS5lcnJvckNvZGUgKyAnXSc7XG4gIH1cbn1cblxuLy8gQWRkcyBhbiBleHRyYSBpbmZvIChpZiBwcm92aWRlZCkgdG8gdGhlIG1lc3NhZ2UuXG4vLyBEZWxldGVzIHRoZSBleHRyYSBpbmZvIGFmdGVyIGV4dHJhY3RpbmcuXG5mdW5jdGlvbiBhcHBlbmRFeHRyYUluZm8obXNnKSB7XG4gIGlmIChtc2cuZXh0cmEpIHtcbiAgICBhcHBlbmRTcGFuTGFiZWwobXNnKTtcbiAgICBhcHBlbmRFcnJvckNvZGUobXNnKTtcbiAgICBkZWxldGUgbXNnLmV4dHJhO1xuICB9XG59XG5cbi8vIENoZWNrcyBpZiB0aGUgbG9jYXRpb24gb2YgdGhlIGdpdmVuIG1lc3NhZ2UgaXMgdmFsaWRcbmZ1bmN0aW9uIGlzVmFsaWRMb2NhdGlvbihtc2cpIHtcbiAgcmV0dXJuIG1zZy5maWxlICYmICFtc2cuZmlsZS5zdGFydHNXaXRoKCc8Jyk7XG59XG5cbi8vIFJlbW92ZXMgbG9jYXRpb24gaW5mbyBmcm9tIHRoZSBnaXZlbiBtZXNzYWdlXG5mdW5jdGlvbiByZW1vdmVMb2NhdGlvbihtc2cpIHtcbiAgZGVsZXRlIG1zZy5maWxlO1xuICBkZWxldGUgbXNnLmxpbmU7XG4gIGRlbGV0ZSBtc2cubGluZV9lbmQ7XG4gIGRlbGV0ZSBtc2cuY29sO1xuICBkZWxldGUgbXNnLmNvbF9lbmQ7XG59XG5cbi8vIENvcGllcyBsb2NhdGlvbiBpbmZvIGZyb20gb25lIG1lc3NhZ2UgdG8gYW5vdGhlclxuZnVuY3Rpb24gY29weUxvY2F0aW9uKGZyb21Nc2csIHRvTXNnKSB7XG4gIHRvTXNnLmZpbGUgPSBmcm9tTXNnLmZpbGU7XG4gIHRvTXNnLmxpbmUgPSBmcm9tTXNnLmxpbmU7XG4gIHRvTXNnLmxpbmVfZW5kID0gZnJvbU1zZy5saW5lX2VuZDtcbiAgdG9Nc2cuY29sID0gZnJvbU1zZy5jb2w7XG4gIHRvTXNnLmNvbF9lbmQgPSBmcm9tTXNnLmNvbF9lbmQ7XG59XG5cbi8vIFJlbW92ZXMgbG9jYXRpb24gaW5mbyBmcm9tIHRoZSBzdWJtZXNzYWdlIGlmIGl0J3MgZXhhY3RseSB0aGUgc2FtZSBhcyBpblxuLy8gdGhlIG1haW4gbWVzc2FnZS5cbi8vIEZpeGVzIGxvY2F0aW9ucyB0aGF0IGRvbid0IHBvaW50IHRvIGEgdmFsaWQgc291cmNlIGNvZGUuXG4vLyBFeGFtcGxlOiA8c3RkIG1hY3Jvcz46MTozMzogMTo2MFxuZnVuY3Rpb24gbm9ybWFsaXplTG9jYXRpb25zKG1zZykge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IG1zZy50cmFjZS5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHN1Yk1zZyA9IG1zZy50cmFjZVtpXTtcbiAgICAvLyBEZWR1cGxpY2F0ZSBsb2NhdGlvblxuICAgIGlmICghaXNWYWxpZExvY2F0aW9uKHN1Yk1zZykgfHwgKHN1Yk1zZy5maWxlID09PSBtc2cuZmlsZSAmJiBzdWJNc2cubGluZSA9PT0gbXNnLmxpbmUgJiYgc3ViTXNnLmNvbCA9PT0gbXNnLmNvbCkpIHtcbiAgICAgIHJlbW92ZUxvY2F0aW9uKHN1Yk1zZyk7XG4gICAgfVxuICAgIGlmICghaXNWYWxpZExvY2F0aW9uKG1zZykgJiYgaXNWYWxpZExvY2F0aW9uKHN1Yk1zZykpIHtcbiAgICAgIGNvcHlMb2NhdGlvbihzdWJNc2csIG1zZyk7XG4gICAgICByZW1vdmVMb2NhdGlvbihzdWJNc2cpO1xuICAgIH1cbiAgfVxufVxuXG4vLyBTZXQgbG9jYXRpb24gZm9yIHNwZWNpYWwgY2FzZXMgd2hlbiB0aGUgY29tcGlsZXIgZG9lc24ndCBwcm92aWRlIGl0XG5mdW5jdGlvbiBwcmVwcm9jZXNzTWVzc2FnZShtc2csIGJ1aWxkV29ya0Rpcikge1xuICBhcHBlbmRFeHRyYUluZm8obXNnKTtcbiAgbm9ybWFsaXplTG9jYXRpb25zKG1zZyk7XG4gIC8vIENoZWNrIGlmIHRoZSBtZXNzYWdlIGNhbiBiZSBhZGRlZCB0byBMaW50ZXJcbiAgaWYgKGlzVmFsaWRMb2NhdGlvbihtc2cpKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgLy8gSWdub3JlIG1ldGEgZXJyb3JzXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbWV0YUVycm9ycy5sZW5ndGg7IGkrKykge1xuICAgIGlmIChtZXRhRXJyb3JzW2ldLnRlc3QobXNnLm1lc3NhZ2UpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIC8vIExvY2F0aW9uIGlzIG5vdCBwcm92aWRlZCBmb3IgdGhlIG1lc3NhZ2UsIHNvIGl0IGNhbm5vdCBiZSBhZGRlZCB0byBMaW50ZXIuXG4gIC8vIERpc3BsYXkgaXQgYXMgYSBub3RpZmljYXRpb24uXG4gIHN3aXRjaCAobXNnLmxldmVsKSB7XG4gICAgY2FzZSAnaW5mbyc6XG4gICAgY2FzZSAnbm90ZSc6XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhtc2cubWVzc2FnZSwgbm90aWZpY2F0aW9uQ2ZnKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3dhcm5pbmcnOlxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcobXNnLm1lc3NhZ2UsIG5vdGlmaWNhdGlvbkNmZyk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKG1zZy5tZXNzYWdlLCBub3RpZmljYXRpb25DZmcpO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IHsgbGV2ZWwyc2V2ZXJpdHksIGxldmVsMnR5cGUsIHByZXByb2Nlc3NNZXNzYWdlIH07XG4iXX0=
//# sourceURL=/home/takaaki/.atom/packages/build-cargo/lib/errors.js
