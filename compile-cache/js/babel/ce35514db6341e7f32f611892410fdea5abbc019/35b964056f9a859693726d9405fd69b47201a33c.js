'use babel';

var _this = this;

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Linter = (function () {
  function Linter() {
    _classCallCheck(this, Linter);

    this.messages = [];
  }

  _createClass(Linter, [{
    key: 'dispose',
    value: function dispose() {}
  }, {
    key: 'setMessages',
    value: function setMessages(msg) {
      this.messages = this.messages.concat(msg);
    }
  }, {
    key: 'deleteMessages',
    value: function deleteMessages() {
      this.messages = [];
    }
  }]);

  return Linter;
})();

module.exports = {
  activate: function activate() {},
  provideIndie: function provideIndie() {
    return {
      register: function register(obj) {
        _this.registered = obj;
        _this.linter = new Linter();
        return _this.linter;
      }
    };
  },

  hasRegistered: function hasRegistered() {
    return _this.registered !== undefined;
  },

  getLinter: function getLinter() {
    return _this.linter;
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvYnVpbGQvc3BlYy9maXh0dXJlL2F0b20tYnVpbGQtc3BlYy1saW50ZXIvYXRvbS1idWlsZC1zcGVjLWxpbnRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUM7Ozs7Ozs7O0lBRU4sTUFBTTtBQUNDLFdBRFAsTUFBTSxHQUNJOzBCQURWLE1BQU07O0FBRVIsUUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7R0FDcEI7O2VBSEcsTUFBTTs7V0FJSCxtQkFBRyxFQUFFOzs7V0FDRCxxQkFBQyxHQUFHLEVBQUU7QUFDZixVQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQzNDOzs7V0FDYSwwQkFBRztBQUNmLFVBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO0tBQ3BCOzs7U0FWRyxNQUFNOzs7QUFhWixNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2YsVUFBUSxFQUFFLG9CQUFNLEVBQUU7QUFDbEIsY0FBWSxFQUFFO1dBQU87QUFDbkIsY0FBUSxFQUFFLGtCQUFDLEdBQUcsRUFBSztBQUNqQixjQUFLLFVBQVUsR0FBRyxHQUFHLENBQUM7QUFDdEIsY0FBSyxNQUFNLEdBQUcsSUFBSSxNQUFNLEVBQUUsQ0FBQztBQUMzQixlQUFPLE1BQUssTUFBTSxDQUFDO09BQ3BCO0tBQ0Y7R0FBQzs7QUFFRixlQUFhLEVBQUUseUJBQU07QUFDbkIsV0FBTyxNQUFLLFVBQVUsS0FBSyxTQUFTLENBQUM7R0FDdEM7O0FBRUQsV0FBUyxFQUFFLHFCQUFNO0FBQ2YsV0FBTyxNQUFLLE1BQU0sQ0FBQztHQUNwQjtDQUNGLENBQUMiLCJmaWxlIjoiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9idWlsZC9zcGVjL2ZpeHR1cmUvYXRvbS1idWlsZC1zcGVjLWxpbnRlci9hdG9tLWJ1aWxkLXNwZWMtbGludGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmNsYXNzIExpbnRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMubWVzc2FnZXMgPSBbXTtcbiAgfVxuICBkaXNwb3NlKCkge31cbiAgc2V0TWVzc2FnZXMobXNnKSB7XG4gICAgdGhpcy5tZXNzYWdlcyA9IHRoaXMubWVzc2FnZXMuY29uY2F0KG1zZyk7XG4gIH1cbiAgZGVsZXRlTWVzc2FnZXMoKSB7XG4gICAgdGhpcy5tZXNzYWdlcyA9IFtdO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhY3RpdmF0ZTogKCkgPT4ge30sXG4gIHByb3ZpZGVJbmRpZTogKCkgPT4gKHtcbiAgICByZWdpc3RlcjogKG9iaikgPT4ge1xuICAgICAgdGhpcy5yZWdpc3RlcmVkID0gb2JqO1xuICAgICAgdGhpcy5saW50ZXIgPSBuZXcgTGludGVyKCk7XG4gICAgICByZXR1cm4gdGhpcy5saW50ZXI7XG4gICAgfVxuICB9KSxcblxuICBoYXNSZWdpc3RlcmVkOiAoKSA9PiB7XG4gICAgcmV0dXJuIHRoaXMucmVnaXN0ZXJlZCAhPT0gdW5kZWZpbmVkO1xuICB9LFxuXG4gIGdldExpbnRlcjogKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLmxpbnRlcjtcbiAgfVxufTtcbiJdfQ==
//# sourceURL=/home/takaaki/.atom/packages/build/spec/fixture/atom-build-spec-linter/atom-build-spec-linter.js
