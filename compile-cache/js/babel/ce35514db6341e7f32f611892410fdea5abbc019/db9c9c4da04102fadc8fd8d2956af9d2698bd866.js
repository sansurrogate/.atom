Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _events = require('events');

'use babel';

var ErrorMatcher = (function (_EventEmitter) {
  _inherits(ErrorMatcher, _EventEmitter);

  function ErrorMatcher() {
    _classCallCheck(this, ErrorMatcher);

    _get(Object.getPrototypeOf(ErrorMatcher.prototype), 'constructor', this).call(this);
    this.regex = null;
    this.cwd = null;
    this.stdout = null;
    this.stderr = null;
    this.currentMatch = [];
    this.firstMatchId = null;

    atom.commands.add('atom-workspace', 'build:error-match', this.match.bind(this));
    atom.commands.add('atom-workspace', 'build:error-match-first', this.matchFirst.bind(this));
  }

  _createClass(ErrorMatcher, [{
    key: '_gotoNext',
    value: function _gotoNext() {
      if (0 === this.currentMatch.length) {
        return;
      }

      this.goto(this.currentMatch[0].id);
    }
  }, {
    key: 'goto',
    value: function goto(id) {
      var _this = this;

      var match = this.currentMatch.find(function (m) {
        return m.id === id;
      });
      if (!match) {
        this.emit('error', 'Can\'t find match with id ' + id);
        return;
      }

      // rotate to next match
      while (this.currentMatch[0] !== match) {
        this.currentMatch.push(this.currentMatch.shift());
      }
      this.currentMatch.push(this.currentMatch.shift());

      var file = match.file;
      if (!file) {
        this.emit('error', 'Did not match any file. Don\'t know what to open.');
        return;
      }

      var path = require('path');
      if (!path.isAbsolute(file)) {
        file = this.cwd + path.sep + file;
      }

      var row = match.line ? match.line - 1 : 0; /* Because atom is zero-based */
      var col = match.col ? match.col - 1 : 0; /* Because atom is zero-based */

      require('fs').exists(file, function (exists) {
        if (!exists) {
          _this.emit('error', 'Matched file does not exist: ' + file);
          return;
        }
        atom.workspace.open(file, {
          initialLine: row,
          initialColumn: col,
          searchAllPanes: true
        });
        _this.emit('matched', match);
      });
    }
  }, {
    key: '_parse',
    value: function _parse() {
      var _this2 = this;

      this.currentMatch = [];

      // first run all functional matches
      this.functions && this.functions.forEach(function (f, functionIndex) {
        _this2.currentMatch = _this2.currentMatch.concat(f(_this2.output).map(function (match, matchIndex) {
          match.id = 'error-match-function-' + functionIndex + '-' + matchIndex;
          match.type = match.type || 'Error';
          return match;
        }));
      });
      // then for all match kinds
      Object.keys(this.regex).forEach(function (kind) {
        // run all matches
        _this2.regex[kind] && _this2.regex[kind].forEach(function (regex, i) {
          regex && require('xregexp').forEach(_this2.output, regex, function (match, matchIndex) {
            match.id = 'error-match-' + i + '-' + matchIndex;
            match.type = kind;
            _this2.currentMatch.push(match);
          });
        });
      });

      this.currentMatch.sort(function (a, b) {
        return a.index - b.index;
      });

      this.firstMatchId = this.currentMatch.length > 0 ? this.currentMatch[0].id : null;
    }
  }, {
    key: '_prepareRegex',
    value: function _prepareRegex(regex) {
      var _this3 = this;

      regex = regex || [];
      regex = regex instanceof Array ? regex : [regex];

      return regex.map(function (r) {
        try {
          var XRegExp = require('xregexp');
          return XRegExp(r);
        } catch (err) {
          _this3.emit('error', 'Error parsing regex. ' + err.message);
          return null;
        }
      });
    }
  }, {
    key: 'set',
    value: function set(target, cwd, output) {
      var _this4 = this;

      if (target.functionMatch) {
        this.functions = (target.functionMatch instanceof Array ? target.functionMatch : [target.functionMatch]).filter(function (f) {
          if (typeof f !== 'function') {
            _this4.emit('error', 'found functionMatch that is no function: ' + typeof f);
            return false;
          }
          return true;
        });
      }
      this.regex = {
        Error: this._prepareRegex(target.errorMatch),
        Warning: this._prepareRegex(target.warningMatch)
      };

      this.cwd = cwd;
      this.output = output;
      this.currentMatch = [];

      this._parse();
    }
  }, {
    key: 'match',
    value: function match() {
      require('./google-analytics').sendEvent('errorMatch', 'match');

      this._gotoNext();
    }
  }, {
    key: 'matchFirst',
    value: function matchFirst() {
      require('./google-analytics').sendEvent('errorMatch', 'first');

      if (this.firstMatchId) {
        this.goto(this.firstMatchId);
      }
    }
  }, {
    key: 'hasMatch',
    value: function hasMatch() {
      return 0 !== this.currentMatch.length;
    }
  }, {
    key: 'getMatches',
    value: function getMatches() {
      return this.currentMatch;
    }
  }]);

  return ErrorMatcher;
})(_events.EventEmitter);

exports['default'] = ErrorMatcher;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvYnVpbGQvbGliL2Vycm9yLW1hdGNoZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O3NCQUU2QixRQUFROztBQUZyQyxXQUFXLENBQUM7O0lBSVMsWUFBWTtZQUFaLFlBQVk7O0FBRXBCLFdBRlEsWUFBWSxHQUVqQjswQkFGSyxZQUFZOztBQUc3QiwrQkFIaUIsWUFBWSw2Q0FHckI7QUFDUixRQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztBQUNsQixRQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQztBQUNoQixRQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztBQUNuQixRQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztBQUNuQixRQUFJLENBQUMsWUFBWSxHQUFHLEVBQUUsQ0FBQztBQUN2QixRQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQzs7QUFFekIsUUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsbUJBQW1CLEVBQUksSUFBSSxDQUFDLEtBQUssTUFBVixJQUFJLEVBQU8sQ0FBQztBQUN2RSxRQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSx5QkFBeUIsRUFBSSxJQUFJLENBQUMsVUFBVSxNQUFmLElBQUksRUFBWSxDQUFDO0dBQ25GOztlQWJrQixZQUFZOztXQWV0QixxQkFBRztBQUNWLFVBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFO0FBQ2xDLGVBQU87T0FDUjs7QUFFRCxVQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDcEM7OztXQUVHLGNBQUMsRUFBRSxFQUFFOzs7QUFDUCxVQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxVQUFBLENBQUM7ZUFB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QUFZLEVBQUUsT0FBTyxDQUFDLENBQUM7O0FBRS9ELFVBQUksSUFBSSxDQUFDLFlBQVksRUFBRTtBQUNyQixZQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztPQUM5QjtLQUNGOzs7V0FFTyxvQkFBRztBQUNULGFBQU8sQ0FBQyxLQUFLLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDO0tBQ3ZDOzs7V0FFUyxzQkFBRztBQUNYLGFBQU8sSUFBSSxDQUFDLFlBQVksQ0FBQztLQUMxQjs7O1NBckprQixZQUFZOzs7cUJBQVosWUFBWSIsImZpbGUiOiIvaG9tZS90YWthYWtpLy5hdG9tL3BhY2thZ2VzL2J1aWxkL2xpYi9lcnJvci1tYXRjaGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ2V2ZW50cyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVycm9yTWF0Y2hlciBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnJlZ2V4ID0gbnVsbDtcbiAgICB0aGlzLmN3ZCA9IG51bGw7XG4gICAgdGhpcy5zdGRvdXQgPSBudWxsO1xuICAgIHRoaXMuc3RkZXJyID0gbnVsbDtcbiAgICB0aGlzLmN1cnJlbnRNYXRjaCA9IFtdO1xuICAgIHRoaXMuZmlyc3RNYXRjaElkID0gbnVsbDtcblxuICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsICdidWlsZDplcnJvci1tYXRjaCcsIDo6dGhpcy5tYXRjaCk7XG4gICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywgJ2J1aWxkOmVycm9yLW1hdGNoLWZpcnN0JywgOjp0aGlzLm1hdGNoRmlyc3QpO1xuICB9XG5cbiAgX2dvdG9OZXh0KCkge1xuICAgIGlmICgwID09PSB0aGlzLmN1cnJlbnRNYXRjaC5sZW5ndGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmdvdG8odGhpcy5jdXJyZW50TWF0Y2hbMF0uaWQpO1xuICB9XG5cbiAgZ290byhpZCkge1xuICAgIGNvbnN0IG1hdGNoID0gdGhpcy5jdXJyZW50TWF0Y2guZmluZChtID0+IG0uaWQgPT09IGlkKTtcbiAgICBpZiAoIW1hdGNoKSB7XG4gICAgICB0aGlzLmVtaXQoJ2Vycm9yJywgJ0NhblxcJ3QgZmluZCBtYXRjaCB3aXRoIGlkICcgKyBpZCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gcm90YXRlIHRvIG5leHQgbWF0Y2hcbiAgICB3aGlsZSAodGhpcy5jdXJyZW50TWF0Y2hbMF0gIT09IG1hdGNoKSB7XG4gICAgICB0aGlzLmN1cnJlbnRNYXRjaC5wdXNoKHRoaXMuY3VycmVudE1hdGNoLnNoaWZ0KCkpO1xuICAgIH1cbiAgICB0aGlzLmN1cnJlbnRNYXRjaC5wdXNoKHRoaXMuY3VycmVudE1hdGNoLnNoaWZ0KCkpO1xuXG4gICAgbGV0IGZpbGUgPSBtYXRjaC5maWxlO1xuICAgIGlmICghZmlsZSkge1xuICAgICAgdGhpcy5lbWl0KCdlcnJvcicsICdEaWQgbm90IG1hdGNoIGFueSBmaWxlLiBEb25cXCd0IGtub3cgd2hhdCB0byBvcGVuLicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG4gICAgaWYgKCFwYXRoLmlzQWJzb2x1dGUoZmlsZSkpIHtcbiAgICAgIGZpbGUgPSB0aGlzLmN3ZCArIHBhdGguc2VwICsgZmlsZTtcbiAgICB9XG5cbiAgICBjb25zdCByb3cgPSBtYXRjaC5saW5lID8gbWF0Y2gubGluZSAtIDEgOiAwOyAvKiBCZWNhdXNlIGF0b20gaXMgemVyby1iYXNlZCAqL1xuICAgIGNvbnN0IGNvbCA9IG1hdGNoLmNvbCA/IG1hdGNoLmNvbCAtIDEgOiAwOyAvKiBCZWNhdXNlIGF0b20gaXMgemVyby1iYXNlZCAqL1xuXG4gICAgcmVxdWlyZSgnZnMnKS5leGlzdHMoZmlsZSwgKGV4aXN0cykgPT4ge1xuICAgICAgaWYgKCFleGlzdHMpIHtcbiAgICAgICAgdGhpcy5lbWl0KCdlcnJvcicsICdNYXRjaGVkIGZpbGUgZG9lcyBub3QgZXhpc3Q6ICcgKyBmaWxlKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihmaWxlLCB7XG4gICAgICAgIGluaXRpYWxMaW5lOiByb3csXG4gICAgICAgIGluaXRpYWxDb2x1bW46IGNvbCxcbiAgICAgICAgc2VhcmNoQWxsUGFuZXM6IHRydWVcbiAgICAgIH0pO1xuICAgICAgdGhpcy5lbWl0KCdtYXRjaGVkJywgbWF0Y2gpO1xuICAgIH0pO1xuICB9XG5cbiAgX3BhcnNlKCkge1xuICAgIHRoaXMuY3VycmVudE1hdGNoID0gW107XG5cbiAgICAvLyBmaXJzdCBydW4gYWxsIGZ1bmN0aW9uYWwgbWF0Y2hlc1xuICAgIHRoaXMuZnVuY3Rpb25zICYmIHRoaXMuZnVuY3Rpb25zLmZvckVhY2goKGYsIGZ1bmN0aW9uSW5kZXgpID0+IHtcbiAgICAgIHRoaXMuY3VycmVudE1hdGNoID0gdGhpcy5jdXJyZW50TWF0Y2guY29uY2F0KGYodGhpcy5vdXRwdXQpLm1hcCgobWF0Y2gsIG1hdGNoSW5kZXgpID0+IHtcbiAgICAgICAgbWF0Y2guaWQgPSAnZXJyb3ItbWF0Y2gtZnVuY3Rpb24tJyArIGZ1bmN0aW9uSW5kZXggKyAnLScgKyBtYXRjaEluZGV4O1xuICAgICAgICBtYXRjaC50eXBlID0gbWF0Y2gudHlwZSB8fCAnRXJyb3InO1xuICAgICAgICByZXR1cm4gbWF0Y2g7XG4gICAgICB9KSk7XG4gICAgfSk7XG4gICAgLy8gdGhlbiBmb3IgYWxsIG1hdGNoIGtpbmRzXG4gICAgT2JqZWN0LmtleXModGhpcy5yZWdleCkuZm9yRWFjaChraW5kID0+IHtcbiAgICAgIC8vIHJ1biBhbGwgbWF0Y2hlc1xuICAgICAgdGhpcy5yZWdleFtraW5kXSAmJiB0aGlzLnJlZ2V4W2tpbmRdLmZvckVhY2goKHJlZ2V4LCBpKSA9PiB7XG4gICAgICAgIHJlZ2V4ICYmIHJlcXVpcmUoJ3hyZWdleHAnKS5mb3JFYWNoKHRoaXMub3V0cHV0LCByZWdleCwgKG1hdGNoLCBtYXRjaEluZGV4KSA9PiB7XG4gICAgICAgICAgbWF0Y2guaWQgPSAnZXJyb3ItbWF0Y2gtJyArIGkgKyAnLScgKyBtYXRjaEluZGV4O1xuICAgICAgICAgIG1hdGNoLnR5cGUgPSBraW5kO1xuICAgICAgICAgIHRoaXMuY3VycmVudE1hdGNoLnB1c2gobWF0Y2gpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgdGhpcy5jdXJyZW50TWF0Y2guc29ydCgoYSwgYikgPT4gYS5pbmRleCAtIGIuaW5kZXgpO1xuXG4gICAgdGhpcy5maXJzdE1hdGNoSWQgPSAodGhpcy5jdXJyZW50TWF0Y2gubGVuZ3RoID4gMCkgPyB0aGlzLmN1cnJlbnRNYXRjaFswXS5pZCA6IG51bGw7XG4gIH1cblxuICBfcHJlcGFyZVJlZ2V4KHJlZ2V4KSB7XG4gICAgcmVnZXggPSByZWdleCB8fCBbXTtcbiAgICByZWdleCA9IChyZWdleCBpbnN0YW5jZW9mIEFycmF5KSA/IHJlZ2V4IDogWyByZWdleCBdO1xuXG4gICAgcmV0dXJuIHJlZ2V4Lm1hcChyID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IFhSZWdFeHAgPSByZXF1aXJlKCd4cmVnZXhwJyk7XG4gICAgICAgIHJldHVybiBYUmVnRXhwKHIpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHRoaXMuZW1pdCgnZXJyb3InLCAnRXJyb3IgcGFyc2luZyByZWdleC4gJyArIGVyci5tZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBzZXQodGFyZ2V0LCBjd2QsIG91dHB1dCkge1xuICAgIGlmICh0YXJnZXQuZnVuY3Rpb25NYXRjaCkge1xuICAgICAgdGhpcy5mdW5jdGlvbnMgPSAoKHRhcmdldC5mdW5jdGlvbk1hdGNoIGluc3RhbmNlb2YgQXJyYXkpID8gdGFyZ2V0LmZ1bmN0aW9uTWF0Y2ggOiBbIHRhcmdldC5mdW5jdGlvbk1hdGNoIF0pLmZpbHRlcihmID0+IHtcbiAgICAgICAgaWYgKHR5cGVvZiBmICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgdGhpcy5lbWl0KCdlcnJvcicsICdmb3VuZCBmdW5jdGlvbk1hdGNoIHRoYXQgaXMgbm8gZnVuY3Rpb246ICcgKyB0eXBlb2YgZik7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHRoaXMucmVnZXggPSB7XG4gICAgICBFcnJvcjogdGhpcy5fcHJlcGFyZVJlZ2V4KHRhcmdldC5lcnJvck1hdGNoKSxcbiAgICAgIFdhcm5pbmc6IHRoaXMuX3ByZXBhcmVSZWdleCh0YXJnZXQud2FybmluZ01hdGNoKVxuICAgIH07XG5cbiAgICB0aGlzLmN3ZCA9IGN3ZDtcbiAgICB0aGlzLm91dHB1dCA9IG91dHB1dDtcbiAgICB0aGlzLmN1cnJlbnRNYXRjaCA9IFtdO1xuXG4gICAgdGhpcy5fcGFyc2UoKTtcbiAgfVxuXG4gIG1hdGNoKCkge1xuICAgIHJlcXVpcmUoJy4vZ29vZ2xlLWFuYWx5dGljcycpLnNlbmRFdmVudCgnZXJyb3JNYXRjaCcsICdtYXRjaCcpO1xuXG4gICAgdGhpcy5fZ290b05leHQoKTtcbiAgfVxuXG4gIG1hdGNoRmlyc3QoKSB7XG4gICAgcmVxdWlyZSgnLi9nb29nbGUtYW5hbHl0aWNzJykuc2VuZEV2ZW50KCdlcnJvck1hdGNoJywgJ2ZpcnN0Jyk7XG5cbiAgICBpZiAodGhpcy5maXJzdE1hdGNoSWQpIHtcbiAgICAgIHRoaXMuZ290byh0aGlzLmZpcnN0TWF0Y2hJZCk7XG4gICAgfVxuICB9XG5cbiAgaGFzTWF0Y2goKSB7XG4gICAgcmV0dXJuIDAgIT09IHRoaXMuY3VycmVudE1hdGNoLmxlbmd0aDtcbiAgfVxuXG4gIGdldE1hdGNoZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuY3VycmVudE1hdGNoO1xuICB9XG59XG4iXX0=
//# sourceURL=/home/takaaki/.atom/packages/build/lib/error-matcher.js
