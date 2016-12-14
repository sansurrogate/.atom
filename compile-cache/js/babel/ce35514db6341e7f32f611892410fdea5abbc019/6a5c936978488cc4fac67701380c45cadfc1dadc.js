'use babel';

//
// JSON error format parser.
//

Object.defineProperty(exports, '__esModule', {
  value: true
});
var err = require('./errors');

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
  label: /expected \d+ fields, found \d+/,
  message: /this pattern has \d+ field, but the corresponding variant has \d+ fields/
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

// Copies a location from the given span to a linter message
function copySpanLocation(span, msg) {
  msg.file = span.file_name;
  msg.line = span.line_start;
  msg.line_end = span.line_end;
  msg.col = span.column_start;
  msg.col_end = span.column_end;
}

// Checks if the location of the given span is the same as the location
// of the given message
function compareLocations(span, msg) {
  return span.file_name === msg.file && span.line_start === msg.line && span.line_end === msg.line_end && span.column_start === msg.col && span.column_end === msg.col_end;
}

// Appends spans's label to the main message. It only adds the label if:
// - the main message doesn't contain exactly the same phrase
// - the main message doesn't contain the same information but uses different wording
function appendSpanLabel(span, msg) {
  if (!span.label || msg.message.indexOf(span.label) >= 0) {
    return;
  }
  for (var idx = 0; idx < redundantLabels.length; idx++) {
    var l = redundantLabels[idx];
    if (l.label.test(span.label) && l.message.test(msg.message)) {
      return;
    }
  }
  msg.message += ' (' + span.label + ')';
}

function parseSpan(_x, _x2, _x3) {
  var _again = true;

  _function: while (_again) {
    var span = _x,
        msg = _x2,
        mainMsg = _x3;
    _again = false;

    if (span.is_primary) {
      appendSpanLabel(span, msg);
      // If the error is within a macro, add the macro text to the message
      if (span.file_name && span.file_name.startsWith('<') && span.text && span.text.length > 0) {
        msg.trace.push({
          message: span.text[0].text,
          type: 'Macro',
          severity: 'info'
        });
      }
    }
    if (span.file_name && !span.file_name.startsWith('<')) {
      if (!span.is_primary && span.label) {
        // A secondary span
        var trace = {
          message: span.label,
          type: 'Note',
          severity: 'info'
        };
        // Add location only if it's not the same as in the primary span
        // or if the primary span is unknown at this point
        if (!compareLocations(span, mainMsg)) {
          copySpanLocation(span, trace);
        }
        msg.trace.push(trace);
      }
      // Copy the main error location from the primary span or from any other
      // span if it hasn't been defined yet
      if (span.is_primary || !msg.file) {
        if (!compareLocations(span, mainMsg)) {
          copySpanLocation(span, msg);
        }
      }
      return true;
    } else if (span.expansion) {
      _x = span.expansion.span;
      _x2 = msg;
      _x3 = mainMsg;
      _again = true;
      trace = undefined;
      continue _function;
    }
    return false;
  }
}

// Parses spans of the given message
function parseSpans(jsonObj, msg, mainMsg) {
  if (jsonObj.spans) {
    jsonObj.spans.forEach(function (span) {
      return parseSpan(span, msg, mainMsg);
    });
  }
}

// Parses a compile message in the JSON format
var parseMessage = function parseMessage(line, messages) {
  var json = JSON.parse(line);
  var msg = {
    message: json.message,
    type: err.level2type(json.level),
    severity: err.level2severity(json.level),
    trace: []
  };
  parseSpans(json, msg, msg);
  json.children.forEach(function (child) {
    var tr = {
      message: child.message,
      type: err.level2type(child.level),
      severity: err.level2severity(child.level)
    };
    parseSpans(child, tr, msg);
    msg.trace.push(tr);
  });
  if (json.code) {
    if (json.code.code) {
      msg.message += ' [' + json.code.code + ']';
    }
    if (json.code.explanation) {
      msg.trace.push({
        message: json.code.explanation,
        type: 'Explanation',
        severity: 'info'
      });
    }
  }
  messages.push(msg);
};

exports.parseMessage = parseMessage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvYnVpbGQtY2FyZ28vbGliL2pzb24tcGFyc2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQzs7Ozs7Ozs7O0FBTVosSUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDOzs7O0FBSWhDLElBQU0sZUFBZSxHQUFHLENBQUM7O0FBRXZCLE9BQUssRUFBRSxnQ0FBZ0M7QUFDdkMsU0FBTyxFQUFFLHFCQUFxQjtDQUMvQixFQUFFOztBQUVELE9BQUssRUFBRSwwQkFBMEI7QUFDakMsU0FBTyxFQUFFLDJDQUEyQztDQUNyRCxFQUFFOztBQUVELE9BQUssRUFBRSxnQ0FBZ0M7QUFDdkMsU0FBTyxFQUFFLDBFQUEwRTtDQUNwRixFQUFFOztBQUVELE9BQUssRUFBRSxzQ0FBc0M7QUFDN0MsU0FBTyxFQUFFLDhDQUE4QztDQUN4RCxFQUFFOztBQUVELE9BQUssRUFBRSxvQkFBb0I7QUFDM0IsU0FBTyxFQUFFLHFDQUFxQztDQUMvQyxFQUFFOztBQUVELE9BQUssRUFBRSxzQ0FBc0M7QUFDN0MsU0FBTyxFQUFFLDJEQUEyRDtDQUNyRSxFQUFFOztBQUVELE9BQUssRUFBRSwyQkFBMkI7QUFDbEMsU0FBTyxFQUFFLG1DQUFtQztDQUM3QyxFQUFFOztBQUVELE9BQUssRUFBRSxnQ0FBZ0M7QUFDdkMsU0FBTyxFQUFFLGdEQUFnRDtDQUMxRCxFQUFFOztBQUVELE9BQUssRUFBRSw0QkFBNEI7QUFDbkMsU0FBTyxFQUFFLGlGQUFpRjtDQUMzRixFQUFFOztBQUVELE9BQUssRUFBRSxxQkFBcUI7QUFDNUIsU0FBTyxFQUFFLHFDQUFxQztDQUMvQyxFQUFFOztBQUVELE9BQUssRUFBRSx1Q0FBdUM7QUFDOUMsU0FBTyxFQUFFLG1DQUFtQztDQUM3QyxFQUFFOztBQUVELE9BQUssRUFBRSx5QkFBeUI7QUFDaEMsU0FBTyxFQUFFLHlEQUF5RDtDQUNuRSxFQUFFOztBQUVELE9B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Qzs7UUFFTyxZQUFZLEdBQVosWUFBWSIsImZpbGUiOiIvaG9tZS90YWthYWtpLy5hdG9tL3BhY2thZ2VzL2J1aWxkLWNhcmdvL2xpYi9qc29uLXBhcnNlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG4vL1xuLy8gSlNPTiBlcnJvciBmb3JtYXQgcGFyc2VyLlxuLy9cblxuY29uc3QgZXJyID0gcmVxdWlyZSgnLi9lcnJvcnMnKTtcblxuLy8gQ29sbGVjdGlvbiBvZiBzcGFuIGxhYmVscyB0aGF0IG11c3QgYmUgaWdub3JlZCAobm90IGFkZGVkIHRvIHRoZSBtYWluIG1lc3NhZ2UpXG4vLyBiZWNhdXNlIHRoZSBtYWluIG1lc3NhZ2UgYWxyZWFkeSBjb250YWlucyB0aGUgc2FtZSBpbmZvcm1hdGlvblxuY29uc3QgcmVkdW5kYW50TGFiZWxzID0gW3tcbiAgLy8gRTAwMDFcbiAgbGFiZWw6IC90aGlzIGlzIGFuIHVucmVhY2hhYmxlIHBhdHRlcm4vLFxuICBtZXNzYWdlOiAvdW5yZWFjaGFibGUgcGF0dGVybi9cbn0sIHtcbiAgLy8gRTAwMDRcbiAgbGFiZWw6IC9wYXR0ZXJuIGAuK2Agbm90IGNvdmVyZWQvLFxuICBtZXNzYWdlOiAvbm9uLWV4aGF1c3RpdmUgcGF0dGVybnM6IGAuK2Agbm90IGNvdmVyZWQvXG59LCB7XG4gIC8vIEUwMDAyM1xuICBsYWJlbDogL2V4cGVjdGVkIFxcZCsgZmllbGRzLCBmb3VuZCBcXGQrLyxcbiAgbWVzc2FnZTogL3RoaXMgcGF0dGVybiBoYXMgXFxkKyBmaWVsZCwgYnV0IHRoZSBjb3JyZXNwb25kaW5nIHZhcmlhbnQgaGFzIFxcZCsgZmllbGRzL1xufSwge1xuICAvLyBFMDAyNlxuICBsYWJlbDogL3N0cnVjdCBgLitgIGRvZXMgbm90IGhhdmUgZmllbGQgYC4rYC8sXG4gIG1lc3NhZ2U6IC9zdHJ1Y3QgYC4rYCBkb2VzIG5vdCBoYXZlIGEgZmllbGQgbmFtZWQgYC4rYC9cbn0sIHtcbiAgLy8gRTAwMjdcbiAgbGFiZWw6IC9taXNzaW5nIGZpZWxkIGAuK2AvLFxuICBtZXNzYWdlOiAvcGF0dGVybiBkb2VzIG5vdCBtZW50aW9uIGZpZWxkIGAuK2AvXG59LCB7XG4gIC8vIEUwMDI5XG4gIGxhYmVsOiAvcmFuZ2VzIHJlcXVpcmUgY2hhciBvciBudW1lcmljIHR5cGVzLyxcbiAgbWVzc2FnZTogL29ubHkgY2hhciBhbmQgbnVtZXJpYyB0eXBlcyBhcmUgYWxsb3dlZCBpbiByYW5nZSBwYXR0ZXJucy9cbn0sIHtcbiAgLy8gRTAwNDBcbiAgbGFiZWw6IC9jYWxsIHRvIGRlc3RydWN0b3IgbWV0aG9kLyxcbiAgbWVzc2FnZTogL2V4cGxpY2l0IHVzZSBvZiBkZXN0cnVjdG9yIG1ldGhvZC9cbn0sIHtcbiAgLy8gRTAwNDZcbiAgbGFiZWw6IC9taXNzaW5nIGAuK2AgaW4gaW1wbGVtZW50YXRpb24vLFxuICBtZXNzYWdlOiAvbm90IGFsbCB0cmFpdCBpdGVtcyBpbXBsZW1lbnRlZCwgbWlzc2luZzogYC4rYC9cbn0sIHtcbiAgLy8gRTAwNTdcbiAgbGFiZWw6IC9leHBlY3RlZCBcXGQrIHBhcmFtZXRlcltzXT8vLFxuICBtZXNzYWdlOiAvdGhpcyBmdW5jdGlvbiB0YWtlcyBcXGQrIHBhcmFtZXRlcltzXT8gYnV0IFxcZCsgcGFyYW1ldGVyW3NdPyAod2FzfHdlcmUpIHN1cHBsaWVkL1xufSwge1xuICAvLyBFMDA2MlxuICBsYWJlbDogL3VzZWQgbW9yZSB0aGFuIG9uY2UvLFxuICBtZXNzYWdlOiAvZmllbGQgYC4rYCBzcGVjaWZpZWQgbW9yZSB0aGFuIG9uY2UvXG59LCB7XG4gIC8vIEUwMDY3XG4gIGxhYmVsOiAvaW52YWxpZCBleHByZXNzaW9uIGZvciBsZWZ0LWhhbmQgc2lkZS8sXG4gIG1lc3NhZ2U6IC9pbnZhbGlkIGxlZnQtaGFuZCBzaWRlIGV4cHJlc3Npb24vXG59LCB7XG4gIC8vIEUwMDY4XG4gIGxhYmVsOiAvcmV0dXJuIHR5cGUgaXMgbm90IFxcKFxcKS8sXG4gIG1lc3NhZ2U6IC9gcmV0dXJuO2AgaW4gYSBmdW5jdGlvbiB3aG9zZSByZXR1cm4gdHlwZSBpcyBub3QgYFxcKFxcKWAvXG59LCB7XG4gIC8vIEUwMDcxXG4gIGxhYmVsOiAvbm90IGEgc3RydWN0LyxcbiAgbWVzc2FnZTogL2AuK2AgZG9lcyBub3QgbmFtZSBhIHN0cnVjdCBvciBhIHN0cnVjdCB2YXJpYW50L1xufSwge1xuICAvLyBFMDA3MlxuICBsYWJlbDogL3JlY3Vyc2l2ZSB0eXBlIGhhcyBpbmZpbml0ZSBzaXplLyxcbiAgbWVzc2FnZTogL3JlY3Vyc2l2ZSB0eXBlIGAuK2AgaGFzIGluZmluaXRlIHNpemUvXG59LCB7XG4gIC8vIEUwMDg3XG4gIGxhYmVsOiAvZXhwZWN0ZWQgXFxkKyBwYXJhbWV0ZXJbc10/LyxcbiAgbWVzc2FnZTogL3RvbyBtYW55IHR5cGUgcGFyYW1ldGVycyBwcm92aWRlZDogZXhwZWN0ZWQgYXQgbW9zdCBcXGQrIHBhcmFtZXRlcltzXT8sIGZvdW5kIFxcZCsgcGFyYW1ldGVyW3NdPy9cbn0sIHtcbiAgLy8gRTAwOTFcbiAgbGFiZWw6IC91bnVzZWQgdHlwZSBwYXJhbWV0ZXIvLFxuICBtZXNzYWdlOiAvdHlwZSBwYXJhbWV0ZXIgYC4rYCBpcyB1bnVzZWQvXG59LCB7XG4gIC8vIEUwMTAxXG4gIGxhYmVsOiAvY2Fubm90IHJlc29sdmUgdHlwZSBvZiBleHByZXNzaW9uLyxcbiAgbWVzc2FnZTogL2Nhbm5vdCBkZXRlcm1pbmUgYSB0eXBlIGZvciB0aGlzIGV4cHJlc3Npb246IHVuY29uc3RyYWluZWQgdHlwZS9cbn0sIHtcbiAgLy8gRTAxMDJcbiAgbGFiZWw6IC9jYW5ub3QgcmVzb2x2ZSB0eXBlIG9mIHZhcmlhYmxlLyxcbiAgbWVzc2FnZTogL2Nhbm5vdCBkZXRlcm1pbmUgYSB0eXBlIGZvciB0aGlzIGxvY2FsIHZhcmlhYmxlOiB1bmNvbnN0cmFpbmVkIHR5cGUvXG59LCB7XG4gIC8vIEUwMTA2XG4gIGxhYmVsOiAvZXhwZWN0ZWQgbGlmZXRpbWUgcGFyYW1ldGVyLyxcbiAgbWVzc2FnZTogL21pc3NpbmcgbGlmZXRpbWUgc3BlY2lmaWVyL1xufSwge1xuICAvLyBFMDEwN1xuICBsYWJlbDogLyh1bik/ZXhwZWN0ZWQgKFxcZCsgKT9saWZldGltZSBwYXJhbWV0ZXJbc10/LyxcbiAgbWVzc2FnZTogL3dyb25nIG51bWJlciBvZiBsaWZldGltZSBwYXJhbWV0ZXJzOiBleHBlY3RlZCBcXGQrLCBmb3VuZCBcXGQrL1xufSwge1xuICAvLyBFMDEwOVxuICBsYWJlbDogL3R5cGUgcGFyYW1ldGVyIG5vdCBhbGxvd2VkLyxcbiAgbWVzc2FnZTogL3R5cGUgcGFyYW1ldGVycyBhcmUgbm90IGFsbG93ZWQgb24gdGhpcyB0eXBlL1xufSwge1xuICAvLyBFMDExMFxuICBsYWJlbDogL2xpZmV0aW1lIHBhcmFtZXRlciBub3QgYWxsb3dlZC8sXG4gIG1lc3NhZ2U6IC9saWZldGltZSBwYXJhbWV0ZXJzIGFyZSBub3QgYWxsb3dlZCBvbiB0aGlzIHR5cGUvXG59LCB7XG4gIC8vIEUwMTE2XG4gIGxhYmVsOiAvaW1wbCBmb3IgdHlwZSBkZWZpbmVkIG91dHNpZGUgb2YgY3JhdGUvLFxuICBtZXNzYWdlOiAvY2Fubm90IGRlZmluZSBpbmhlcmVudCBgLitgIGZvciBhIHR5cGUgb3V0c2lkZSBvZiB0aGUgY3JhdGUgd2hlcmUgdGhlIHR5cGUgaXMgZGVmaW5lZC9cbn0sIHtcbiAgLy8gRTAxMTdcbiAgbGFiZWw6IC9pbXBsIGRvZXNuJ3QgdXNlIHR5cGVzIGluc2lkZSBjcmF0ZS8sXG4gIG1lc3NhZ2U6IC9vbmx5IHRyYWl0cyBkZWZpbmVkIGluIHRoZSBjdXJyZW50IGNyYXRlIGNhbiBiZSBpbXBsZW1lbnRlZCBmb3IgYXJiaXRyYXJ5IHR5cGVzL1xufSwge1xuICAvLyBFMDExOVxuICBsYWJlbDogL2NvbmZsaWN0aW5nIGltcGxlbWVudGF0aW9uIGZvciBgLitgLyxcbiAgbWVzc2FnZTogL2NvbmZsaWN0aW5nIGltcGxlbWVudGF0aW9ucyBvZiB0cmFpdCBgLitgIGZvciB0eXBlIGAuK2AvXG59LCB7XG4gIC8vIEUwMTIwXG4gIGxhYmVsOiAvaW1wbGVtZW50aW5nIERyb3AgcmVxdWlyZXMgYSBzdHJ1Y3QvLFxuICBtZXNzYWdlOiAvdGhlIERyb3AgdHJhaXQgbWF5IG9ubHkgYmUgaW1wbGVtZW50ZWQgb24gc3RydWN0dXJlcy9cbn0sIHtcbiAgLy8gRTAxMjFcbiAgbGFiZWw6IC9ub3QgYWxsb3dlZCBpbiB0eXBlIHNpZ25hdHVyZXMvLFxuICBtZXNzYWdlOiAvdGhlIHR5cGUgcGxhY2Vob2xkZXIgYF9gIGlzIG5vdCBhbGxvd2VkIHdpdGhpbiB0eXBlcyBvbiBpdGVtIHNpZ25hdHVyZXMvXG59LCB7XG4gIC8vIEUwMTI0XG4gIGxhYmVsOiAvZmllbGQgYWxyZWFkeSBkZWNsYXJlZC8sXG4gIG1lc3NhZ2U6IC9maWVsZCBgLitgIGlzIGFscmVhZHkgZGVjbGFyZWQvXG59LCB7XG4gIC8vIEUwMzY4XG4gIGxhYmVsOiAvY2Fubm90IHVzZSBgWzw+KyZ8XlxcLV0/PWAgb24gdHlwZSBgLitgLyxcbiAgbWVzc2FnZTogL2JpbmFyeSBhc3NpZ25tZW50IG9wZXJhdGlvbiBgWzw+KyZ8XlxcLV0/PWAgY2Fubm90IGJlIGFwcGxpZWQgdG8gdHlwZSBgLitgL1xufSwge1xuICAvLyBFMDM4N1xuICBsYWJlbDogL2Nhbm5vdCBib3Jyb3cgbXV0YWJseS8sXG4gIG1lc3NhZ2U6IC9jYW5ub3QgYm9ycm93IGltbXV0YWJsZSBsb2NhbCB2YXJpYWJsZSBgLitgIGFzIG11dGFibGUvXG59XTtcblxuLy8gQ29waWVzIGEgbG9jYXRpb24gZnJvbSB0aGUgZ2l2ZW4gc3BhbiB0byBhIGxpbnRlciBtZXNzYWdlXG5mdW5jdGlvbiBjb3B5U3BhbkxvY2F0aW9uKHNwYW4sIG1zZykge1xuICBtc2cuZmlsZSA9IHNwYW4uZmlsZV9uYW1lO1xuICBtc2cubGluZSA9IHNwYW4ubGluZV9zdGFydDtcbiAgbXNnLmxpbmVfZW5kID0gc3Bhbi5saW5lX2VuZDtcbiAgbXNnLmNvbCA9IHNwYW4uY29sdW1uX3N0YXJ0O1xuICBtc2cuY29sX2VuZCA9IHNwYW4uY29sdW1uX2VuZDtcbn1cblxuLy8gQ2hlY2tzIGlmIHRoZSBsb2NhdGlvbiBvZiB0aGUgZ2l2ZW4gc3BhbiBpcyB0aGUgc2FtZSBhcyB0aGUgbG9jYXRpb25cbi8vIG9mIHRoZSBnaXZlbiBtZXNzYWdlXG5mdW5jdGlvbiBjb21wYXJlTG9jYXRpb25zKHNwYW4sIG1zZykge1xuICByZXR1cm4gc3Bhbi5maWxlX25hbWUgPT09IG1zZy5maWxlXG4gICAgJiYgc3Bhbi5saW5lX3N0YXJ0ID09PSBtc2cubGluZVxuICAgICYmIHNwYW4ubGluZV9lbmQgPT09IG1zZy5saW5lX2VuZFxuICAgICYmIHNwYW4uY29sdW1uX3N0YXJ0ID09PSBtc2cuY29sXG4gICAgJiYgc3Bhbi5jb2x1bW5fZW5kID09PSBtc2cuY29sX2VuZDtcbn1cblxuLy8gQXBwZW5kcyBzcGFucydzIGxhYmVsIHRvIHRoZSBtYWluIG1lc3NhZ2UuIEl0IG9ubHkgYWRkcyB0aGUgbGFiZWwgaWY6XG4vLyAtIHRoZSBtYWluIG1lc3NhZ2UgZG9lc24ndCBjb250YWluIGV4YWN0bHkgdGhlIHNhbWUgcGhyYXNlXG4vLyAtIHRoZSBtYWluIG1lc3NhZ2UgZG9lc24ndCBjb250YWluIHRoZSBzYW1lIGluZm9ybWF0aW9uIGJ1dCB1c2VzIGRpZmZlcmVudCB3b3JkaW5nXG5mdW5jdGlvbiBhcHBlbmRTcGFuTGFiZWwoc3BhbiwgbXNnKSB7XG4gIGlmICghc3Bhbi5sYWJlbCB8fCBtc2cubWVzc2FnZS5pbmRleE9mKHNwYW4ubGFiZWwpID49IDApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgZm9yIChsZXQgaWR4ID0gMDsgaWR4IDwgcmVkdW5kYW50TGFiZWxzLmxlbmd0aDsgaWR4KyspIHtcbiAgICBjb25zdCBsID0gcmVkdW5kYW50TGFiZWxzW2lkeF07XG4gICAgaWYgKGwubGFiZWwudGVzdChzcGFuLmxhYmVsKSAmJiBsLm1lc3NhZ2UudGVzdChtc2cubWVzc2FnZSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cbiAgbXNnLm1lc3NhZ2UgKz0gJyAoJyArIHNwYW4ubGFiZWwgKyAnKSc7XG59XG5cbmZ1bmN0aW9uIHBhcnNlU3BhbihzcGFuLCBtc2csIG1haW5Nc2cpIHtcbiAgaWYgKHNwYW4uaXNfcHJpbWFyeSkge1xuICAgIGFwcGVuZFNwYW5MYWJlbChzcGFuLCBtc2cpO1xuICAgIC8vIElmIHRoZSBlcnJvciBpcyB3aXRoaW4gYSBtYWNybywgYWRkIHRoZSBtYWNybyB0ZXh0IHRvIHRoZSBtZXNzYWdlXG4gICAgaWYgKHNwYW4uZmlsZV9uYW1lICYmIHNwYW4uZmlsZV9uYW1lLnN0YXJ0c1dpdGgoJzwnKSAmJiBzcGFuLnRleHQgJiYgc3Bhbi50ZXh0Lmxlbmd0aCA+IDApIHtcbiAgICAgIG1zZy50cmFjZS5wdXNoKHtcbiAgICAgICAgbWVzc2FnZTogc3Bhbi50ZXh0WzBdLnRleHQsXG4gICAgICAgIHR5cGU6ICdNYWNybycsXG4gICAgICAgIHNldmVyaXR5OiAnaW5mbydcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuICBpZiAoc3Bhbi5maWxlX25hbWUgJiYgIXNwYW4uZmlsZV9uYW1lLnN0YXJ0c1dpdGgoJzwnKSkge1xuICAgIGlmICghc3Bhbi5pc19wcmltYXJ5ICYmIHNwYW4ubGFiZWwpIHtcbiAgICAgIC8vIEEgc2Vjb25kYXJ5IHNwYW5cbiAgICAgIGNvbnN0IHRyYWNlID0ge1xuICAgICAgICBtZXNzYWdlOiBzcGFuLmxhYmVsLFxuICAgICAgICB0eXBlOiAnTm90ZScsXG4gICAgICAgIHNldmVyaXR5OiAnaW5mbydcbiAgICAgIH07XG4gICAgICAvLyBBZGQgbG9jYXRpb24gb25seSBpZiBpdCdzIG5vdCB0aGUgc2FtZSBhcyBpbiB0aGUgcHJpbWFyeSBzcGFuXG4gICAgICAvLyBvciBpZiB0aGUgcHJpbWFyeSBzcGFuIGlzIHVua25vd24gYXQgdGhpcyBwb2ludFxuICAgICAgaWYgKCFjb21wYXJlTG9jYXRpb25zKHNwYW4sIG1haW5Nc2cpKSB7XG4gICAgICAgIGNvcHlTcGFuTG9jYXRpb24oc3BhbiwgdHJhY2UpO1xuICAgICAgfVxuICAgICAgbXNnLnRyYWNlLnB1c2godHJhY2UpO1xuICAgIH1cbiAgICAvLyBDb3B5IHRoZSBtYWluIGVycm9yIGxvY2F0aW9uIGZyb20gdGhlIHByaW1hcnkgc3BhbiBvciBmcm9tIGFueSBvdGhlclxuICAgIC8vIHNwYW4gaWYgaXQgaGFzbid0IGJlZW4gZGVmaW5lZCB5ZXRcbiAgICBpZiAoc3Bhbi5pc19wcmltYXJ5IHx8ICFtc2cuZmlsZSkge1xuICAgICAgaWYgKCFjb21wYXJlTG9jYXRpb25zKHNwYW4sIG1haW5Nc2cpKSB7XG4gICAgICAgIGNvcHlTcGFuTG9jYXRpb24oc3BhbiwgbXNnKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSBpZiAoc3Bhbi5leHBhbnNpb24pIHtcbiAgICByZXR1cm4gcGFyc2VTcGFuKHNwYW4uZXhwYW5zaW9uLnNwYW4sIG1zZywgbWFpbk1zZyk7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vLyBQYXJzZXMgc3BhbnMgb2YgdGhlIGdpdmVuIG1lc3NhZ2VcbmZ1bmN0aW9uIHBhcnNlU3BhbnMoanNvbk9iaiwgbXNnLCBtYWluTXNnKSB7XG4gIGlmIChqc29uT2JqLnNwYW5zKSB7XG4gICAganNvbk9iai5zcGFucy5mb3JFYWNoKHNwYW4gPT4gcGFyc2VTcGFuKHNwYW4sIG1zZywgbWFpbk1zZykpO1xuICB9XG59XG5cbi8vIFBhcnNlcyBhIGNvbXBpbGUgbWVzc2FnZSBpbiB0aGUgSlNPTiBmb3JtYXRcbmNvbnN0IHBhcnNlTWVzc2FnZSA9IChsaW5lLCBtZXNzYWdlcykgPT4ge1xuICBjb25zdCBqc29uID0gSlNPTi5wYXJzZShsaW5lKTtcbiAgY29uc3QgbXNnID0ge1xuICAgIG1lc3NhZ2U6IGpzb24ubWVzc2FnZSxcbiAgICB0eXBlOiBlcnIubGV2ZWwydHlwZShqc29uLmxldmVsKSxcbiAgICBzZXZlcml0eTogZXJyLmxldmVsMnNldmVyaXR5KGpzb24ubGV2ZWwpLFxuICAgIHRyYWNlOiBbXVxuICB9O1xuICBwYXJzZVNwYW5zKGpzb24sIG1zZywgbXNnKTtcbiAganNvbi5jaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IHtcbiAgICBjb25zdCB0ciA9IHtcbiAgICAgIG1lc3NhZ2U6IGNoaWxkLm1lc3NhZ2UsXG4gICAgICB0eXBlOiBlcnIubGV2ZWwydHlwZShjaGlsZC5sZXZlbCksXG4gICAgICBzZXZlcml0eTogZXJyLmxldmVsMnNldmVyaXR5KGNoaWxkLmxldmVsKVxuICAgIH07XG4gICAgcGFyc2VTcGFucyhjaGlsZCwgdHIsIG1zZyk7XG4gICAgbXNnLnRyYWNlLnB1c2godHIpO1xuICB9KTtcbiAgaWYgKGpzb24uY29kZSkge1xuICAgIGlmIChqc29uLmNvZGUuY29kZSkge1xuICAgICAgbXNnLm1lc3NhZ2UgKz0gJyBbJyArIGpzb24uY29kZS5jb2RlICsgJ10nO1xuICAgIH1cbiAgICBpZiAoanNvbi5jb2RlLmV4cGxhbmF0aW9uKSB7XG4gICAgICBtc2cudHJhY2UucHVzaCh7XG4gICAgICAgIG1lc3NhZ2U6IGpzb24uY29kZS5leHBsYW5hdGlvbixcbiAgICAgICAgdHlwZTogJ0V4cGxhbmF0aW9uJyxcbiAgICAgICAgc2V2ZXJpdHk6ICdpbmZvJ1xuICAgICAgfSk7XG4gICAgfVxuICB9XG4gIG1lc3NhZ2VzLnB1c2gobXNnKTtcbn07XG5cbmV4cG9ydCB7IHBhcnNlTWVzc2FnZSB9O1xuIl19
//# sourceURL=/home/takaaki/.atom/packages/build-cargo/lib/json-parser.js
