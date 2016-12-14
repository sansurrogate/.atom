Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _marked = require('marked');

var _marked2 = _interopRequireDefault(_marked);

// Copies a location from the given span to a linter message
'use babel';

//
// JSON error format parser.
//

var err = require('./errors');

function copySpanLocation(span, msg) {
  msg.file = span.file_name;
  msg.line = span.line_start;
  msg.line_end = span.line_end;
  msg.col = span.column_start;
  msg.col_end = span.column_end;
}

function parseSpan(_x, _x2, _x3) {
  var _again = true;

  _function: while (_again) {
    var span = _x,
        msg = _x2,
        mainMsg = _x3;
    _again = false;

    if (span.is_primary) {
      msg.extra.spanLabel = span.label;
      // If the error is within a macro, add the macro text to the message
      if (span.file_name && span.file_name.startsWith('<') && span.text && span.text.length > 0) {
        msg.trace.push({
          message: span.text[0].text,
          type: 'Macro',
          severity: 'info',
          extra: {}
        });
      }
    }
    if (span.file_name && !span.file_name.startsWith('<')) {
      if (!span.is_primary && span.label) {
        // A secondary span
        var trace = {
          message: span.label,
          type: 'Note',
          severity: 'info',
          extra: {}
        };
        copySpanLocation(span, trace);
        msg.trace.push(trace);
      }
      // Copy the main error location from the primary span or from any other
      // span if it hasn't been defined yet
      if (span.is_primary || !msg.file) {
        copySpanLocation(span, msg);
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
  var json = JSON.parse(line).message;
  var msg = {
    message: json.message,
    type: err.level2type(json.level),
    severity: err.level2severity(json.level),
    trace: [],
    extra: {}
  };
  parseSpans(json, msg, msg);
  json.children.forEach(function (child) {
    var tr = {
      message: child.message,
      type: err.level2type(child.level),
      severity: err.level2severity(child.level),
      trace: [],
      extra: {}
    };
    parseSpans(child, tr, msg);
    msg.trace.push(tr);
  });
  if (json.code) {
    msg.extra.errorCode = json.code.code;
    if (json.code.explanation) {
      msg.trace.push({
        html_message: '<details><summary>Expand to see the detailed explanation</summary>' + (0, _marked2['default'])(json.code.explanation) + '</details>',
        type: 'Explanation',
        severity: 'info',
        extra: {}
      });
    }
  }
  messages.push(msg);
};

exports.parseMessage = parseMessage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvYnVpbGQtY2FyZ28vbGliL2pzb24tcGFyc2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztzQkFRbUIsUUFBUTs7Ozs7QUFSM0IsV0FBVyxDQUFDOzs7Ozs7QUFNWixJQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7O0FBS2hDLFNBQVMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRTtBQUNuQyxLQUFHLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7QUFDMUIsS0FBRyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO0FBQzNCLEtBQUcsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUM3QixLQUFHLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7QUFDNUIsS0FBRyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO0NBQy9COztBQUVELFNBQVMsU0FBUzs7OzRCQUFxQjtRQUFwQixJQUFJO1FBQUUsR0FBRztRQUFFLE9BQU87OztBQUNuQyxRQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7QUFDbkIsU0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQzs7QUFFakMsVUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO0FBQ3pGLFdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO0FBQ2IsaUJBQU8sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUk7QUFDMUIsY0FBSSxFQUFFLE9BQU87QUFDYixrQkFBUSxFQUFFLE1BQU07QUFDaEIs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QUM7QUFDYixvQkFBWSxFQUFFLG9FQUFvRSxHQUFHLHlCQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsWUFBWTtBQUNqSSxZQUFJLEVBQUUsYUFBYTtBQUNuQixnQkFBUSxFQUFFLE1BQU07QUFDaEIsYUFBSyxFQUFFLEVBQUU7T0FDVixDQUFDLENBQUM7S0FDSjtHQUNGO0FBQ0QsVUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUNwQixDQUFDOztRQUVPLFlBQVksR0FBWixZQUFZIiwiZmlsZSI6Ii9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvYnVpbGQtY2FyZ28vbGliL2pzb24tcGFyc2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbi8vXG4vLyBKU09OIGVycm9yIGZvcm1hdCBwYXJzZXIuXG4vL1xuXG5jb25zdCBlcnIgPSByZXF1aXJlKCcuL2Vycm9ycycpO1xuXG5pbXBvcnQgbWFya2VkIGZyb20gJ21hcmtlZCc7XG5cbi8vIENvcGllcyBhIGxvY2F0aW9uIGZyb20gdGhlIGdpdmVuIHNwYW4gdG8gYSBsaW50ZXIgbWVzc2FnZVxuZnVuY3Rpb24gY29weVNwYW5Mb2NhdGlvbihzcGFuLCBtc2cpIHtcbiAgbXNnLmZpbGUgPSBzcGFuLmZpbGVfbmFtZTtcbiAgbXNnLmxpbmUgPSBzcGFuLmxpbmVfc3RhcnQ7XG4gIG1zZy5saW5lX2VuZCA9IHNwYW4ubGluZV9lbmQ7XG4gIG1zZy5jb2wgPSBzcGFuLmNvbHVtbl9zdGFydDtcbiAgbXNnLmNvbF9lbmQgPSBzcGFuLmNvbHVtbl9lbmQ7XG59XG5cbmZ1bmN0aW9uIHBhcnNlU3BhbihzcGFuLCBtc2csIG1haW5Nc2cpIHtcbiAgaWYgKHNwYW4uaXNfcHJpbWFyeSkge1xuICAgIG1zZy5leHRyYS5zcGFuTGFiZWwgPSBzcGFuLmxhYmVsO1xuICAgIC8vIElmIHRoZSBlcnJvciBpcyB3aXRoaW4gYSBtYWNybywgYWRkIHRoZSBtYWNybyB0ZXh0IHRvIHRoZSBtZXNzYWdlXG4gICAgaWYgKHNwYW4uZmlsZV9uYW1lICYmIHNwYW4uZmlsZV9uYW1lLnN0YXJ0c1dpdGgoJzwnKSAmJiBzcGFuLnRleHQgJiYgc3Bhbi50ZXh0Lmxlbmd0aCA+IDApIHtcbiAgICAgIG1zZy50cmFjZS5wdXNoKHtcbiAgICAgICAgbWVzc2FnZTogc3Bhbi50ZXh0WzBdLnRleHQsXG4gICAgICAgIHR5cGU6ICdNYWNybycsXG4gICAgICAgIHNldmVyaXR5OiAnaW5mbycsXG4gICAgICAgIGV4dHJhOiB7fVxuICAgICAgfSk7XG4gICAgfVxuICB9XG4gIGlmIChzcGFuLmZpbGVfbmFtZSAmJiAhc3Bhbi5maWxlX25hbWUuc3RhcnRzV2l0aCgnPCcpKSB7XG4gICAgaWYgKCFzcGFuLmlzX3ByaW1hcnkgJiYgc3Bhbi5sYWJlbCkge1xuICAgICAgLy8gQSBzZWNvbmRhcnkgc3BhblxuICAgICAgY29uc3QgdHJhY2UgPSB7XG4gICAgICAgIG1lc3NhZ2U6IHNwYW4ubGFiZWwsXG4gICAgICAgIHR5cGU6ICdOb3RlJyxcbiAgICAgICAgc2V2ZXJpdHk6ICdpbmZvJyxcbiAgICAgICAgZXh0cmE6IHt9XG4gICAgICB9O1xuICAgICAgY29weVNwYW5Mb2NhdGlvbihzcGFuLCB0cmFjZSk7XG4gICAgICBtc2cudHJhY2UucHVzaCh0cmFjZSk7XG4gICAgfVxuICAgIC8vIENvcHkgdGhlIG1haW4gZXJyb3IgbG9jYXRpb24gZnJvbSB0aGUgcHJpbWFyeSBzcGFuIG9yIGZyb20gYW55IG90aGVyXG4gICAgLy8gc3BhbiBpZiBpdCBoYXNuJ3QgYmVlbiBkZWZpbmVkIHlldFxuICAgIGlmIChzcGFuLmlzX3ByaW1hcnkgfHwgIW1zZy5maWxlKSB7XG4gICAgICBjb3B5U3BhbkxvY2F0aW9uKHNwYW4sIG1zZyk7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9IGVsc2UgaWYgKHNwYW4uZXhwYW5zaW9uKSB7XG4gICAgcmV0dXJuIHBhcnNlU3BhbihzcGFuLmV4cGFuc2lvbi5zcGFuLCBtc2csIG1haW5Nc2cpO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLy8gUGFyc2VzIHNwYW5zIG9mIHRoZSBnaXZlbiBtZXNzYWdlXG5mdW5jdGlvbiBwYXJzZVNwYW5zKGpzb25PYmosIG1zZywgbWFpbk1zZykge1xuICBpZiAoanNvbk9iai5zcGFucykge1xuICAgIGpzb25PYmouc3BhbnMuZm9yRWFjaChzcGFuID0+IHBhcnNlU3BhbihzcGFuLCBtc2csIG1haW5Nc2cpKTtcbiAgfVxufVxuXG4vLyBQYXJzZXMgYSBjb21waWxlIG1lc3NhZ2UgaW4gdGhlIEpTT04gZm9ybWF0XG5jb25zdCBwYXJzZU1lc3NhZ2UgPSAobGluZSwgbWVzc2FnZXMpID0+IHtcbiAgY29uc3QganNvbiA9IEpTT04ucGFyc2UobGluZSkubWVzc2FnZTtcbiAgY29uc3QgbXNnID0ge1xuICAgIG1lc3NhZ2U6IGpzb24ubWVzc2FnZSxcbiAgICB0eXBlOiBlcnIubGV2ZWwydHlwZShqc29uLmxldmVsKSxcbiAgICBzZXZlcml0eTogZXJyLmxldmVsMnNldmVyaXR5KGpzb24ubGV2ZWwpLFxuICAgIHRyYWNlOiBbXSxcbiAgICBleHRyYToge31cbiAgfTtcbiAgcGFyc2VTcGFucyhqc29uLCBtc2csIG1zZyk7XG4gIGpzb24uY2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiB7XG4gICAgY29uc3QgdHIgPSB7XG4gICAgICBtZXNzYWdlOiBjaGlsZC5tZXNzYWdlLFxuICAgICAgdHlwZTogZXJyLmxldmVsMnR5cGUoY2hpbGQubGV2ZWwpLFxuICAgICAgc2V2ZXJpdHk6IGVyci5sZXZlbDJzZXZlcml0eShjaGlsZC5sZXZlbCksXG4gICAgICB0cmFjZTogW10sXG4gICAgICBleHRyYToge31cbiAgICB9O1xuICAgIHBhcnNlU3BhbnMoY2hpbGQsIHRyLCBtc2cpO1xuICAgIG1zZy50cmFjZS5wdXNoKHRyKTtcbiAgfSk7XG4gIGlmIChqc29uLmNvZGUpIHtcbiAgICBtc2cuZXh0cmEuZXJyb3JDb2RlID0ganNvbi5jb2RlLmNvZGU7XG4gICAgaWYgKGpzb24uY29kZS5leHBsYW5hdGlvbikge1xuICAgICAgbXNnLnRyYWNlLnB1c2goe1xuICAgICAgICBodG1sX21lc3NhZ2U6ICc8ZGV0YWlscz48c3VtbWFyeT5FeHBhbmQgdG8gc2VlIHRoZSBkZXRhaWxlZCBleHBsYW5hdGlvbjwvc3VtbWFyeT4nICsgbWFya2VkKGpzb24uY29kZS5leHBsYW5hdGlvbikgKyAnPC9kZXRhaWxzPicsXG4gICAgICAgIHR5cGU6ICdFeHBsYW5hdGlvbicsXG4gICAgICAgIHNldmVyaXR5OiAnaW5mbycsXG4gICAgICAgIGV4dHJhOiB7fVxuICAgICAgfSk7XG4gICAgfVxuICB9XG4gIG1lc3NhZ2VzLnB1c2gobXNnKTtcbn07XG5cbmV4cG9ydCB7IHBhcnNlTWVzc2FnZSB9O1xuIl19