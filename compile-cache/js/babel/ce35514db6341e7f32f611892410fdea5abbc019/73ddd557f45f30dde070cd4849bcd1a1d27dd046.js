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
  // Reorder trace items if needed.
  // Not explicitly ordered items always go first in their original order.
  msg.trace.sort(function (a, b) {
    if (!a.order && b.order) {
      return -1;
    }
    return a.order && b.order ? a.order - b.order : 1;
  });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvYnVpbGQtY2FyZ28vbGliL2Vycm9ycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUM7Ozs7Ozs7OztBQU1aLElBQU0sZUFBZSxHQUFHLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxDQUFDOzs7QUFHOUMsSUFBTSxVQUFVLEdBQUcsQ0FDakIsMkNBQTJDLEVBQzNDLHlCQUF5QixDQUMxQixDQUFDOzs7O0FBSUYsSUFBTSxlQUFlLEdBQUcsQ0FBQzs7QUFFdkIsT0FBSyxFQUFFLGdDQUFnQztBQUN2QyxTQUFPLEVBQUUscUJBQXFCO0NBQy9CLEVBQUU7O0FBRUQsT0FBSyxFQUFFLDBCQUEwQjtBQUNqQyxTQUFPLEVBQUUsMkNBQTJDO0NBQ3JELEVBQUU7O0FBRUQsT0FBSyxFQUFFLG1DQUFtQztBQUMxQyxTQUFPLEVBQUUsaUZBQWlGO0NBQzNGLEVBQUU7O0FBRUQsT0FBSyxFQUFFLHNDQUFzQztBQUM3QyxTQUFPLEVBQUUsOENBQThDO0NBQ3hELEVBQUU7O0FBRUQsT0FBSyxFQUFFLG9CQUFvQjtBQUMzQixTQUFPLEVBQUUscUNBQXFDO0NBQy9DLEVBQUU7O0FBRUQsT0FBSyxFQUFFLHNDQUFzQztBQUM3QyxTQUFPLEVBQUUsMkRBQTJEO0NBQ3JFLEVBQUU7O0FBRUQsT0FBSyxFQUFFLDJCQUEyQjtBQUNsQyxTQUFPLEVBQUUsbUNBQW1DO0NBQzdDLEVBQUU7O0FBRUQsT0FBSyxFQUFFLGdDQUFnQztBQUN2QyxTQUFPLEVBQUUsZ0RBQWdEO0NBQzFELEVBQUU7O0FBRUQsT0FBSyxFQUFFLDRCQUE0QjtBQUNuQyxTQUFPLEVBQUUsaUZBQWlGO0NBQzNGLEVBQUU7O0FBRUQsT0FBSyxFQUFFLHFCQUFxQjtBQUM1QixTQUFPLEVBQUUscUNBQXFDO0NBQy9DLEVBQUU7O0FBRUQsT0FBSyxFQUFFLHVDQUF1QztBQUM5QyxTQUFPLEVBQUUsbUNBQW1DO0NBQzdDLEVBQUU7O0FBRUQsT0FBSyxFQUFFLHlCQUF5QjtBQUNoQyxTQUFPLEVBQUUseURBQXlEO0NBQ25FLEVBQUU7O0FBRUQsT0FBSyxFQUFFLGNBQWM7QUFDckIsU0FBTyxFQUFFLGlEQUFpRDtDQUMzRCxFQUFFOztBQUVELE9BQUssRUFBRSxrQ0FBa0M7QUFDekMsU0FBTyxFQUFFLHVDQUF1QztDQUNqRCxFQUFFOztBQUVELE9BQUssRUFBRSw0QkFBNEI7QUFDbkMsU0FBTyxFQUFFLGdHQUFnRztDQUMxRyxFQUFFOztBQUVELE9BQUssRUFBRSx1QkFBdUI7QUFDOUIsU0FBTyxFQUFFLCtCQUErQjtDQUN6QyxFQUFFOztBQUVELE9BQUssRUFBRSxtQ0FBbUM7QUFDMUMsU0FBTyxFQUFFLGlFQUFpRTtDQUMzRSxFQUFFOztBQUVELE9BQUssRUFBRSxpQ0FBaUM7QUFDeEMsU0FBTyxFQUFFLHFFQUFxRTtDQUMvRSxFQUFFOztBQUVELE9BQUssRUFBRSw2QkFBNkI7QUFDcEMsU0FBTyxFQUFFLDRCQUE0QjtDQUN0QyxFQUFFOztBQUVELE9BQUssRUFBRSw2Q0FBNkM7QUFDcEQsU0FBTyxFQUFFLDhEQUE4RDtDQUN4RSxFQUFFOztBQUVELE9BQUssRUFBRSw0QkFBNEI7QUFDbkMsU0FBTyxFQUFFLDhDQUE4QztDQUN4RCxFQUFFOztBQUVELE9BQUssRUFBRSxnQ0FBZ0M7QUFDdkMsU0FBTyxFQUFFLGtEQUFrRDtDQUM1RCxFQUFFOztBQUVELE9BQUssRUFBRSx3Q0FBd0M7QUFDL0MsU0FBTyxFQUFFLHVGQUF1RjtDQUNqRyxFQUFFOztBQUVELE9BQUssRUFBRSxxQ0FBcUM7QUFDNUMsU0FBTyxFQUFFLGlGQUFpRjtDQUMzRixFQUFFOztBQUVELE9BQUssRUFBRSxxQ0FBcUM7QUFDNUMsU0FBTyxFQUFFLHlEQUF5RDtDQUNuRSxFQUFFOztBQUVELE9BQUssRUFBRSxxQ0FBcUM7QUFDNUMsU0FBTyxFQUFFLHNEQUFzRDtDQUNoRSxFQUFFOztBQUVELE9BQUssRUFBRSxnQ0FBZ0M7QUFDdkMsU0FBTyxFQUFFLHlFQUF5RTtDQUNuRixFQUFFOztBQUVELE9BQUssRUFBRSx3QkFBd0I7QUFDL0IsU0FBTyxFQUFFLGdDQUFnQztDQUMxQyxFQUFFOztBQUVELE9BQUssRUFBRSx3Q0FBd0M7QUFDL0MsU0FBTyxFQUFFLDJFQUEyRTtDQUNyRixFQUFFOztBQUVELE9BQUssRUFBRSx1QkFBdUI7QUFDOUIsU0FBTyxFQUFFLHdEQUF3RDtDQUNsRSxDQUFDLENBQUM7O0FBRUgsSUFBTSxjQUFjLEdBQUcsU0FBakIsY0FBYyxDQUFJLEtBQUssRUFBSztBQUNoQyxVQUFRLEtBQUs7QUFDWCxTQUFLLFNBQVM7QUFBRSxhQUFPLFNBQVMsQ0FBQztBQUFBLEFBQ2pDLFNBQUssT0FBTztBQUFFLGFBQU8sT0FBTyxDQUFDO0FBQUEsQUFDN0IsU0FBSyxNQUFNO0FBQUUsYUFBTyxNQUFNLENBQUM7QUFBQSxBQUMzQixTQUFLLE1BQU07QUFBRSxhQUFPLE1BQU0sQ0FBQztBQUFBLEFBQzNCO0FBQVMsYUFBTyxPQUFPLENBQUM7QUFBQSxHQUN6QjtDQUNGLENBQUM7O0FBRUYsSUFBTSxVQUFVLEdBQUcsU0FBYixVQUFVLENBQUksS0FBSyxFQUFLO0FBQzVCLFNBQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ3ZELENBQUM7OztBQUdGLFNBQVMsZUFBZSxDQUFDLEdBQUcsRUFBRTtBQUM1QixNQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsU0FBUyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7QUFDekQsUUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUM7QUFDbEMsUUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDbkMsYUFBTztLQUNSO0FBQ0QsU0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGVBQWUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDL0MsVUFBTSxDQUFDLEdBQUcsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzdCLFVBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ3RELGVBQU87T0FDUjtLQUNGO0FBQ0QsT0FBRyxDQUFDLE9BQU8sSUFBSSxJQUFJLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQztHQUNuQztDQUNGOzs7QUFHRCxTQUFTLGVBQWUsQ0FBQyxHQUFHLEVBQUU7QUFDNUIsTUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO0FBQ3pELE9BQUcsQ0FBQyxPQUFPLElBQUksSUFBSSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQztHQUNqRDtDQUNGOzs7O0FBSUQsU0FBUyxlQUFlLENBQUMsR0FBRyxFQUFFO0FBQzVCLE1BQUksR0FBRyxDQUFDLEtBQUssRUFBRTtBQUNiLG1CQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDckIsbUJBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNyQixXQUFPLEdBQUcsQ0FBQyxLQUFLLENBQUM7R0FDbEI7Q0FDRjs7O0FBR0QsU0FBUyxlQUFlLENBQUMsR0FBRyxFQUFFO0FBQzVCLFNBQU8sR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQzlDOzs7QUFHRCxTQUFTLGNBQWMsQ0FBQyxHQUFHLEVBQUU7QUFDM0IsU0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDO0FBQ2hCLFNBQU8sR0FBRyxDQUFDLElBQUksQ0FBQztBQUNoQixTQUFPLEdBQUcsQ0FBQyxRQUFRLENBQUM7QUFDcEIsU0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDO0FBQ2YsU0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDO0NBQ3BCOzs7QUFHRCxTQUFTLFlBQVksQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFO0FBQ3BDLE9BQUssQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztBQUMxQixPQUFLLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUM7QUFDMUIsT0FBSyxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDO0FBQ2xDLE9BQUssQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQztBQUN4QixPQUFLLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUM7Q0FDakM7Ozs7OztBQU1ELFNBQVMsa0JBQWtCLENBQUMsR0FBRyxFQUFFO0FBQy9CLE9BQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUN6QyxRQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUU1QixRQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxJQUFLLE1BQU0sQ0FBQyxJQUFJLEtBQUssR0FBRyxDQUFDLElBQUksSUFBSSxNQUFNLENBQUMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxJQUFJLElBQUksTUFBTSxDQUFDLEdBQUcsS0FBSyxHQUFHLENBQUMsR0FBRyxBQUFDLEVBQUU7QUFDaEgsb0JBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUN4QjtBQUNELFFBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLElBQUksZUFBZSxDQUFDLE1BQU0sQ0FBQyxFQUFFO0FBQ3BELGtCQUFZLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQzFCLG9CQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDeEI7R0FDRjtDQUNGOzs7QUFHRCxTQUFTLGlCQUFpQixDQUFDLEdBQUcsRUFBRSxZQUFZLEVBQUU7QUFDNUMsaUJBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNyQixvQkFBa0IsQ0FBQyxHQUFHLENBQUMsQ0FBQzs7O0FBR3hCLEtBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUM3QixRQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsS0FBSyxFQUFFO0FBQ3ZCLGFBQU8sQ0FBQyxDQUFDLENBQUM7S0FDWDtBQUNELFdBQU8sQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7R0FDbkQsQ0FBQyxDQUFDOztBQUVILE1BQUksZUFBZSxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQ3hCLFdBQU8sSUFBSSxDQUFDO0dBQ2I7O0FBRUQsT0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDMUMsUUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNuQyxhQUFPLEtBQUssQ0FBQztLQUNkO0dBQ0Y7OztBQUdELFVBQVEsR0FBRyxDQUFDLEtBQUs7QUFDZixTQUFLLE1BQU0sQ0FBQztBQUNaLFNBQUssTUFBTTtBQUNULFVBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsZUFBZSxDQUFDLENBQUM7QUFDekQsWUFBTTtBQUFBLEFBQ1IsU0FBSyxTQUFTO0FBQ1osVUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxlQUFlLENBQUMsQ0FBQztBQUM1RCxZQUFNO0FBQUEsQUFDUjtBQUNFLFVBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsZUFBZSxDQUFDLENBQUM7QUFBQSxHQUM3RDtBQUNELFNBQU8sS0FBSyxDQUFDO0NBQ2Q7O1FBRVEsY0FBYyxHQUFkLGNBQWM7UUFBRSxVQUFVLEdBQVYsVUFBVTtRQUFFLGlCQUFpQixHQUFqQixpQkFBaUIiLCJmaWxlIjoiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9idWlsZC1jYXJnby9saWIvZXJyb3JzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbi8vXG4vLyBVdGlsaXR5IGZ1bmN0aW9ucyBmb3IgcGFyc2luZyBlcnJvcnNcbi8vXG5cbmNvbnN0IG5vdGlmaWNhdGlvbkNmZyA9IHsgZGlzbWlzc2FibGU6IHRydWUgfTtcblxuLy8gTWV0YSBlcnJvcnMgYXJlIGlnbm9yZWRcbmNvbnN0IG1ldGFFcnJvcnMgPSBbXG4gIC9hYm9ydGluZyBkdWUgdG8gKFxcZCsgKT9wcmV2aW91cyBlcnJvcltzXT8vLFxuICAvQ291bGQgbm90IGNvbXBpbGUgYC4rYC4vXG5dO1xuXG4vLyBDb2xsZWN0aW9uIG9mIHNwYW4gbGFiZWxzIHRoYXQgbXVzdCBiZSBpZ25vcmVkIChub3QgYWRkZWQgdG8gdGhlIG1haW4gbWVzc2FnZSlcbi8vIGJlY2F1c2UgdGhlIG1haW4gbWVzc2FnZSBhbHJlYWR5IGNvbnRhaW5zIHRoZSBzYW1lIGluZm9ybWF0aW9uXG5jb25zdCByZWR1bmRhbnRMYWJlbHMgPSBbe1xuICAvLyBFMDAwMVxuICBsYWJlbDogL3RoaXMgaXMgYW4gdW5yZWFjaGFibGUgcGF0dGVybi8sXG4gIG1lc3NhZ2U6IC91bnJlYWNoYWJsZSBwYXR0ZXJuL1xufSwge1xuICAvLyBFMDAwNFxuICBsYWJlbDogL3BhdHRlcm4gYC4rYCBub3QgY292ZXJlZC8sXG4gIG1lc3NhZ2U6IC9ub24tZXhoYXVzdGl2ZSBwYXR0ZXJuczogYC4rYCBub3QgY292ZXJlZC9cbn0sIHtcbiAgLy8gRTAwMDIzXG4gIGxhYmVsOiAvZXhwZWN0ZWQgXFxkKyBmaWVsZFtzXT8sIGZvdW5kIFxcZCsvLFxuICBtZXNzYWdlOiAvdGhpcyBwYXR0ZXJuIGhhcyBcXGQrIGZpZWxkW3NdPywgYnV0IHRoZSBjb3JyZXNwb25kaW5nIHZhcmlhbnQgaGFzIFxcZCsgZmllbGRbc10/L1xufSwge1xuICAvLyBFMDAyNlxuICBsYWJlbDogL3N0cnVjdCBgLitgIGRvZXMgbm90IGhhdmUgZmllbGQgYC4rYC8sXG4gIG1lc3NhZ2U6IC9zdHJ1Y3QgYC4rYCBkb2VzIG5vdCBoYXZlIGEgZmllbGQgbmFtZWQgYC4rYC9cbn0sIHtcbiAgLy8gRTAwMjdcbiAgbGFiZWw6IC9taXNzaW5nIGZpZWxkIGAuK2AvLFxuICBtZXNzYWdlOiAvcGF0dGVybiBkb2VzIG5vdCBtZW50aW9uIGZpZWxkIGAuK2AvXG59LCB7XG4gIC8vIEUwMDI5XG4gIGxhYmVsOiAvcmFuZ2VzIHJlcXVpcmUgY2hhciBvciBudW1lcmljIHR5cGVzLyxcbiAgbWVzc2FnZTogL29ubHkgY2hhciBhbmQgbnVtZXJpYyB0eXBlcyBhcmUgYWxsb3dlZCBpbiByYW5nZSBwYXR0ZXJucy9cbn0sIHtcbiAgLy8gRTAwNDBcbiAgbGFiZWw6IC9jYWxsIHRvIGRlc3RydWN0b3IgbWV0aG9kLyxcbiAgbWVzc2FnZTogL2V4cGxpY2l0IHVzZSBvZiBkZXN0cnVjdG9yIG1ldGhvZC9cbn0sIHtcbiAgLy8gRTAwNDZcbiAgbGFiZWw6IC9taXNzaW5nIGAuK2AgaW4gaW1wbGVtZW50YXRpb24vLFxuICBtZXNzYWdlOiAvbm90IGFsbCB0cmFpdCBpdGVtcyBpbXBsZW1lbnRlZCwgbWlzc2luZzogYC4rYC9cbn0sIHtcbiAgLy8gRTAwNTdcbiAgbGFiZWw6IC9leHBlY3RlZCBcXGQrIHBhcmFtZXRlcltzXT8vLFxuICBtZXNzYWdlOiAvdGhpcyBmdW5jdGlvbiB0YWtlcyBcXGQrIHBhcmFtZXRlcltzXT8gYnV0IFxcZCsgcGFyYW1ldGVyW3NdPyAod2FzfHdlcmUpIHN1cHBsaWVkL1xufSwge1xuICAvLyBFMDA2MlxuICBsYWJlbDogL3VzZWQgbW9yZSB0aGFuIG9uY2UvLFxuICBtZXNzYWdlOiAvZmllbGQgYC4rYCBzcGVjaWZpZWQgbW9yZSB0aGFuIG9uY2UvXG59LCB7XG4gIC8vIEUwMDY3XG4gIGxhYmVsOiAvaW52YWxpZCBleHByZXNzaW9uIGZvciBsZWZ0LWhhbmQgc2lkZS8sXG4gIG1lc3NhZ2U6IC9pbnZhbGlkIGxlZnQtaGFuZCBzaWRlIGV4cHJlc3Npb24vXG59LCB7XG4gIC8vIEUwMDY4XG4gIGxhYmVsOiAvcmV0dXJuIHR5cGUgaXMgbm90IFxcKFxcKS8sXG4gIG1lc3NhZ2U6IC9gcmV0dXJuO2AgaW4gYSBmdW5jdGlvbiB3aG9zZSByZXR1cm4gdHlwZSBpcyBub3QgYFxcKFxcKWAvXG59LCB7XG4gIC8vIEUwMDcxXG4gIGxhYmVsOiAvbm90IGEgc3RydWN0LyxcbiAgbWVzc2FnZTogL2AuK2AgZG9lcyBub3QgbmFtZSBhIHN0cnVjdCBvciBhIHN0cnVjdCB2YXJpYW50L1xufSwge1xuICAvLyBFMDA3MlxuICBsYWJlbDogL3JlY3Vyc2l2ZSB0eXBlIGhhcyBpbmZpbml0ZSBzaXplLyxcbiAgbWVzc2FnZTogL3JlY3Vyc2l2ZSB0eXBlIGAuK2AgaGFzIGluZmluaXRlIHNpemUvXG59LCB7XG4gIC8vIEUwMDg3XG4gIGxhYmVsOiAvZXhwZWN0ZWQgXFxkKyBwYXJhbWV0ZXJbc10/LyxcbiAgbWVzc2FnZTogL3RvbyBtYW55IHR5cGUgcGFyYW1ldGVycyBwcm92aWRlZDogZXhwZWN0ZWQgYXQgbW9zdCBcXGQrIHBhcmFtZXRlcltzXT8sIGZvdW5kIFxcZCsgcGFyYW1ldGVyW3NdPy9cbn0sIHtcbiAgLy8gRTAwOTFcbiAgbGFiZWw6IC91bnVzZWQgdHlwZSBwYXJhbWV0ZXIvLFxuICBtZXNzYWdlOiAvdHlwZSBwYXJhbWV0ZXIgYC4rYCBpcyB1bnVzZWQvXG59LCB7XG4gIC8vIEUwMTAxXG4gIGxhYmVsOiAvY2Fubm90IHJlc29sdmUgdHlwZSBvZiBleHByZXNzaW9uLyxcbiAgbWVzc2FnZTogL2Nhbm5vdCBkZXRlcm1pbmUgYSB0eXBlIGZvciB0aGlzIGV4cHJlc3Npb246IHVuY29uc3RyYWluZWQgdHlwZS9cbn0sIHtcbiAgLy8gRTAxMDJcbiAgbGFiZWw6IC9jYW5ub3QgcmVzb2x2ZSB0eXBlIG9mIHZhcmlhYmxlLyxcbiAgbWVzc2FnZTogL2Nhbm5vdCBkZXRlcm1pbmUgYSB0eXBlIGZvciB0aGlzIGxvY2FsIHZhcmlhYmxlOiB1bmNvbnN0cmFpbmVkIHR5cGUvXG59LCB7XG4gIC8vIEUwMTA2XG4gIGxhYmVsOiAvZXhwZWN0ZWQgbGlmZXRpbWUgcGFyYW1ldGVyLyxcbiAgbWVzc2FnZTogL21pc3NpbmcgbGlmZXRpbWUgc3BlY2lmaWVyL1xufSwge1xuICAvLyBFMDEwN1xuICBsYWJlbDogLyh1bik/ZXhwZWN0ZWQgKFxcZCsgKT9saWZldGltZSBwYXJhbWV0ZXJbc10/LyxcbiAgbWVzc2FnZTogL3dyb25nIG51bWJlciBvZiBsaWZldGltZSBwYXJhbWV0ZXJzOiBleHBlY3RlZCBcXGQrLCBmb3VuZCBcXGQrL1xufSwge1xuICAvLyBFMDEwOVxuICBsYWJlbDogL3R5cGUgcGFyYW1ldGVyIG5vdCBhbGxvd2VkLyxcbiAgbWVzc2FnZTogL3R5cGUgcGFyYW1ldGVycyBhcmUgbm90IGFsbG93ZWQgb24gdGhpcyB0eXBlL1xufSwge1xuICAvLyBFMDExMFxuICBsYWJlbDogL2xpZmV0aW1lIHBhcmFtZXRlciBub3QgYWxsb3dlZC8sXG4gIG1lc3NhZ2U6IC9saWZldGltZSBwYXJhbWV0ZXJzIGFyZSBub3QgYWxsb3dlZCBvbiB0aGlzIHR5cGUvXG59LCB7XG4gIC8vIEUwMTE2XG4gIGxhYmVsOiAvaW1wbCBmb3IgdHlwZSBkZWZpbmVkIG91dHNpZGUgb2YgY3JhdGUvLFxuICBtZXNzYWdlOiAvY2Fubm90IGRlZmluZSBpbmhlcmVudCBgLitgIGZvciBhIHR5cGUgb3V0c2lkZSBvZiB0aGUgY3JhdGUgd2hlcmUgdGhlIHR5cGUgaXMgZGVmaW5lZC9cbn0sIHtcbiAgLy8gRTAxMTdcbiAgbGFiZWw6IC9pbXBsIGRvZXNuJ3QgdXNlIHR5cGVzIGluc2lkZSBjcmF0ZS8sXG4gIG1lc3NhZ2U6IC9vbmx5IHRyYWl0cyBkZWZpbmVkIGluIHRoZSBjdXJyZW50IGNyYXRlIGNhbiBiZSBpbXBsZW1lbnRlZCBmb3IgYXJiaXRyYXJ5IHR5cGVzL1xufSwge1xuICAvLyBFMDExOVxuICBsYWJlbDogL2NvbmZsaWN0aW5nIGltcGxlbWVudGF0aW9uIGZvciBgLitgLyxcbiAgbWVzc2FnZTogL2NvbmZsaWN0aW5nIGltcGxlbWVudGF0aW9ucyBvZiB0cmFpdCBgLitgIGZvciB0eXBlIGAuK2AvXG59LCB7XG4gIC8vIEUwMTIwXG4gIGxhYmVsOiAvaW1wbGVtZW50aW5nIERyb3AgcmVxdWlyZXMgYSBzdHJ1Y3QvLFxuICBtZXNzYWdlOiAvdGhlIERyb3AgdHJhaXQgbWF5IG9ubHkgYmUgaW1wbGVtZW50ZWQgb24gc3RydWN0dXJlcy9cbn0sIHtcbiAgLy8gRTAxMjFcbiAgbGFiZWw6IC9ub3QgYWxsb3dlZCBpbiB0eXBlIHNpZ25hdHVyZXMvLFxuICBtZXNzYWdlOiAvdGhlIHR5cGUgcGxhY2Vob2xkZXIgYF9gIGlzIG5vdCBhbGxvd2VkIHdpdGhpbiB0eXBlcyBvbiBpdGVtIHNpZ25hdHVyZXMvXG59LCB7XG4gIC8vIEUwMTI0XG4gIGxhYmVsOiAvZmllbGQgYWxyZWFkeSBkZWNsYXJlZC8sXG4gIG1lc3NhZ2U6IC9maWVsZCBgLitgIGlzIGFscmVhZHkgZGVjbGFyZWQvXG59LCB7XG4gIC8vIEUwMzY4XG4gIGxhYmVsOiAvY2Fubm90IHVzZSBgWzw+KyZ8XlxcLV0/PWAgb24gdHlwZSBgLitgLyxcbiAgbWVzc2FnZTogL2JpbmFyeSBhc3NpZ25tZW50IG9wZXJhdGlvbiBgWzw+KyZ8XlxcLV0/PWAgY2Fubm90IGJlIGFwcGxpZWQgdG8gdHlwZSBgLitgL1xufSwge1xuICAvLyBFMDM4N1xuICBsYWJlbDogL2Nhbm5vdCBib3Jyb3cgbXV0YWJseS8sXG4gIG1lc3NhZ2U6IC9jYW5ub3QgYm9ycm93IGltbXV0YWJsZSBsb2NhbCB2YXJpYWJsZSBgLitgIGFzIG11dGFibGUvXG59XTtcblxuY29uc3QgbGV2ZWwyc2V2ZXJpdHkgPSAobGV2ZWwpID0+IHtcbiAgc3dpdGNoIChsZXZlbCkge1xuICAgIGNhc2UgJ3dhcm5pbmcnOiByZXR1cm4gJ3dhcm5pbmcnO1xuICAgIGNhc2UgJ2Vycm9yJzogcmV0dXJuICdlcnJvcic7XG4gICAgY2FzZSAnbm90ZSc6IHJldHVybiAnaW5mbyc7XG4gICAgY2FzZSAnaGVscCc6IHJldHVybiAnaW5mbyc7XG4gICAgZGVmYXVsdDogcmV0dXJuICdlcnJvcic7XG4gIH1cbn07XG5cbmNvbnN0IGxldmVsMnR5cGUgPSAobGV2ZWwpID0+IHtcbiAgcmV0dXJuIGxldmVsLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgbGV2ZWwuc2xpY2UoMSk7XG59O1xuXG4vLyBBcHBlbmRzIGEgc3BhbiBsYWJlbCB0byB0aGUgbWFpbiBtZXNzYWdlIGlmIGl0J3Mgbm90IHJlZHVuZGFudC5cbmZ1bmN0aW9uIGFwcGVuZFNwYW5MYWJlbChtc2cpIHtcbiAgaWYgKG1zZy5leHRyYS5zcGFuTGFiZWwgJiYgbXNnLmV4dHJhLnNwYW5MYWJlbC5sZW5ndGggPiAwKSB7XG4gICAgY29uc3QgbGFiZWwgPSBtc2cuZXh0cmEuc3BhbkxhYmVsO1xuICAgIGlmIChtc2cubWVzc2FnZS5pbmRleE9mKGxhYmVsKSA+PSAwKSB7XG4gICAgICByZXR1cm47ICAgICAgLy8gTGFiZWwgaXMgY29udGFpbmVkIHdpdGhpbiB0aGUgbWFpbiBtZXNzYWdlXG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVkdW5kYW50TGFiZWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBsID0gcmVkdW5kYW50TGFiZWxzW2ldO1xuICAgICAgaWYgKGwubGFiZWwudGVzdChsYWJlbCkgJiYgbC5tZXNzYWdlLnRlc3QobXNnLm1lc3NhZ2UpKSB7XG4gICAgICAgIHJldHVybjsgICAgLy8gU3VibWVzYWdlIGZpdHMgb25lIG9mIHRoZSBkZWR1cGxpY2F0aW9uIHBhdHRlcm5zXG4gICAgICB9XG4gICAgfVxuICAgIG1zZy5tZXNzYWdlICs9ICcgKCcgKyBsYWJlbCArICcpJztcbiAgfVxufVxuXG4vLyBBZGRzIHRoZSBlcnJvciBjb2RlIHRvIHRoZSBtZXNzYWdlXG5mdW5jdGlvbiBhcHBlbmRFcnJvckNvZGUobXNnKSB7XG4gIGlmIChtc2cuZXh0cmEuZXJyb3JDb2RlICYmIG1zZy5leHRyYS5lcnJvckNvZGUubGVuZ3RoID4gMCkge1xuICAgIG1zZy5tZXNzYWdlICs9ICcgWycgKyBtc2cuZXh0cmEuZXJyb3JDb2RlICsgJ10nO1xuICB9XG59XG5cbi8vIEFkZHMgYW4gZXh0cmEgaW5mbyAoaWYgcHJvdmlkZWQpIHRvIHRoZSBtZXNzYWdlLlxuLy8gRGVsZXRlcyB0aGUgZXh0cmEgaW5mbyBhZnRlciBleHRyYWN0aW5nLlxuZnVuY3Rpb24gYXBwZW5kRXh0cmFJbmZvKG1zZykge1xuICBpZiAobXNnLmV4dHJhKSB7XG4gICAgYXBwZW5kU3BhbkxhYmVsKG1zZyk7XG4gICAgYXBwZW5kRXJyb3JDb2RlKG1zZyk7XG4gICAgZGVsZXRlIG1zZy5leHRyYTtcbiAgfVxufVxuXG4vLyBDaGVja3MgaWYgdGhlIGxvY2F0aW9uIG9mIHRoZSBnaXZlbiBtZXNzYWdlIGlzIHZhbGlkXG5mdW5jdGlvbiBpc1ZhbGlkTG9jYXRpb24obXNnKSB7XG4gIHJldHVybiBtc2cuZmlsZSAmJiAhbXNnLmZpbGUuc3RhcnRzV2l0aCgnPCcpO1xufVxuXG4vLyBSZW1vdmVzIGxvY2F0aW9uIGluZm8gZnJvbSB0aGUgZ2l2ZW4gbWVzc2FnZVxuZnVuY3Rpb24gcmVtb3ZlTG9jYXRpb24obXNnKSB7XG4gIGRlbGV0ZSBtc2cuZmlsZTtcbiAgZGVsZXRlIG1zZy5saW5lO1xuICBkZWxldGUgbXNnLmxpbmVfZW5kO1xuICBkZWxldGUgbXNnLmNvbDtcbiAgZGVsZXRlIG1zZy5jb2xfZW5kO1xufVxuXG4vLyBDb3BpZXMgbG9jYXRpb24gaW5mbyBmcm9tIG9uZSBtZXNzYWdlIHRvIGFub3RoZXJcbmZ1bmN0aW9uIGNvcHlMb2NhdGlvbihmcm9tTXNnLCB0b01zZykge1xuICB0b01zZy5maWxlID0gZnJvbU1zZy5maWxlO1xuICB0b01zZy5saW5lID0gZnJvbU1zZy5saW5lO1xuICB0b01zZy5saW5lX2VuZCA9IGZyb21Nc2cubGluZV9lbmQ7XG4gIHRvTXNnLmNvbCA9IGZyb21Nc2cuY29sO1xuICB0b01zZy5jb2xfZW5kID0gZnJvbU1zZy5jb2xfZW5kO1xufVxuXG4vLyBSZW1vdmVzIGxvY2F0aW9uIGluZm8gZnJvbSB0aGUgc3VibWVzc2FnZSBpZiBpdCdzIGV4YWN0bHkgdGhlIHNhbWUgYXMgaW5cbi8vIHRoZSBtYWluIG1lc3NhZ2UuXG4vLyBGaXhlcyBsb2NhdGlvbnMgdGhhdCBkb24ndCBwb2ludCB0byBhIHZhbGlkIHNvdXJjZSBjb2RlLlxuLy8gRXhhbXBsZTogPHN0ZCBtYWNyb3M+OjE6MzM6IDE6NjBcbmZ1bmN0aW9uIG5vcm1hbGl6ZUxvY2F0aW9ucyhtc2cpIHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBtc2cudHJhY2UubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBzdWJNc2cgPSBtc2cudHJhY2VbaV07XG4gICAgLy8gRGVkdXBsaWNhdGUgbG9jYXRpb25cbiAgICBpZiAoIWlzVmFsaWRMb2NhdGlvbihzdWJNc2cpIHx8IChzdWJNc2cuZmlsZSA9PT0gbXNnLmZpbGUgJiYgc3ViTXNnLmxpbmUgPT09IG1zZy5saW5lICYmIHN1Yk1zZy5jb2wgPT09IG1zZy5jb2wpKSB7XG4gICAgICByZW1vdmVMb2NhdGlvbihzdWJNc2cpO1xuICAgIH1cbiAgICBpZiAoIWlzVmFsaWRMb2NhdGlvbihtc2cpICYmIGlzVmFsaWRMb2NhdGlvbihzdWJNc2cpKSB7XG4gICAgICBjb3B5TG9jYXRpb24oc3ViTXNnLCBtc2cpO1xuICAgICAgcmVtb3ZlTG9jYXRpb24oc3ViTXNnKTtcbiAgICB9XG4gIH1cbn1cblxuLy8gU2V0IGxvY2F0aW9uIGZvciBzcGVjaWFsIGNhc2VzIHdoZW4gdGhlIGNvbXBpbGVyIGRvZXNuJ3QgcHJvdmlkZSBpdFxuZnVuY3Rpb24gcHJlcHJvY2Vzc01lc3NhZ2UobXNnLCBidWlsZFdvcmtEaXIpIHtcbiAgYXBwZW5kRXh0cmFJbmZvKG1zZyk7XG4gIG5vcm1hbGl6ZUxvY2F0aW9ucyhtc2cpO1xuICAvLyBSZW9yZGVyIHRyYWNlIGl0ZW1zIGlmIG5lZWRlZC5cbiAgLy8gTm90IGV4cGxpY2l0bHkgb3JkZXJlZCBpdGVtcyBhbHdheXMgZ28gZmlyc3QgaW4gdGhlaXIgb3JpZ2luYWwgb3JkZXIuXG4gIG1zZy50cmFjZS5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgaWYgKCFhLm9yZGVyICYmIGIub3JkZXIpIHtcbiAgICAgIHJldHVybiAtMTtcbiAgICB9XG4gICAgcmV0dXJuIGEub3JkZXIgJiYgYi5vcmRlciA/IGEub3JkZXIgLSBiLm9yZGVyIDogMTtcbiAgfSk7XG4gIC8vIENoZWNrIGlmIHRoZSBtZXNzYWdlIGNhbiBiZSBhZGRlZCB0byBMaW50ZXJcbiAgaWYgKGlzVmFsaWRMb2NhdGlvbihtc2cpKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgLy8gSWdub3JlIG1ldGEgZXJyb3JzXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbWV0YUVycm9ycy5sZW5ndGg7IGkrKykge1xuICAgIGlmIChtZXRhRXJyb3JzW2ldLnRlc3QobXNnLm1lc3NhZ2UpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIC8vIExvY2F0aW9uIGlzIG5vdCBwcm92aWRlZCBmb3IgdGhlIG1lc3NhZ2UsIHNvIGl0IGNhbm5vdCBiZSBhZGRlZCB0byBMaW50ZXIuXG4gIC8vIERpc3BsYXkgaXQgYXMgYSBub3RpZmljYXRpb24uXG4gIHN3aXRjaCAobXNnLmxldmVsKSB7XG4gICAgY2FzZSAnaW5mbyc6XG4gICAgY2FzZSAnbm90ZSc6XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhtc2cubWVzc2FnZSwgbm90aWZpY2F0aW9uQ2ZnKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3dhcm5pbmcnOlxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcobXNnLm1lc3NhZ2UsIG5vdGlmaWNhdGlvbkNmZyk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKG1zZy5tZXNzYWdlLCBub3RpZmljYXRpb25DZmcpO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IHsgbGV2ZWwyc2V2ZXJpdHksIGxldmVsMnR5cGUsIHByZXByb2Nlc3NNZXNzYWdlIH07XG4iXX0=