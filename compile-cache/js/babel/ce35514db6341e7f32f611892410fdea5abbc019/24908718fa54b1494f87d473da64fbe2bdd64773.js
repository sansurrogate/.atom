'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function uuid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }
  return '' + s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

var GoogleAnalytics = (function () {
  function GoogleAnalytics() {
    _classCallCheck(this, GoogleAnalytics);
  }

  _createClass(GoogleAnalytics, null, [{
    key: 'getCid',
    value: function getCid(cb) {
      var _this = this;

      if (this.cid) {
        cb(this.cid);
        return;
      }

      require('getmac').getMac(function (error, macAddress) {
        return error ? cb(_this.cid = uuid()) : cb(_this.cid = require('crypto').createHash('sha1').update(macAddress, 'utf8').digest('hex'));
      });
    }
  }, {
    key: 'sendEvent',
    value: function sendEvent(category, action, label, value) {
      var params = {
        t: 'event',
        ec: category,
        ea: action
      };
      if (label) {
        params.el = label;
      }
      if (value) {
        params.ev = value;
      }

      this.send(params);
    }
  }, {
    key: 'send',
    value: function send(params) {
      var _this2 = this;

      if (!atom.packages.getActivePackage('metrics')) {
        // If the metrics package is disabled, then user has opted out.
        return;
      }

      GoogleAnalytics.getCid(function (cid) {
        Object.assign(params, { cid: cid }, GoogleAnalytics.defaultParams());
        _this2.request('https://www.google-analytics.com/collect?' + require('querystring').stringify(params));
      });
    }
  }, {
    key: 'request',
    value: function request(url) {
      if (!navigator.onLine) {
        return;
      }
      this.post(url);
    }
  }, {
    key: 'post',
    value: function post(url) {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', url);
      xhr.send(null);
    }
  }, {
    key: 'defaultParams',
    value: function defaultParams() {
      // https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters
      return {
        v: 1,
        tid: 'UA-47615700-5'
      };
    }
  }]);

  return GoogleAnalytics;
})();

exports['default'] = GoogleAnalytics;

atom.packages.onDidActivatePackage(function (pkg) {
  if ('metrics' === pkg.name) {
    var buildPackage = atom.packages.getLoadedPackage('build');
    require('./google-analytics').sendEvent('core', 'activated', buildPackage.metadata.version);
  }
});
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvYnVpbGQvbGliL2dvb2dsZS1hbmFseXRpY3MuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFDOzs7Ozs7Ozs7O0FBRVosU0FBUyxJQUFJLEdBQUc7QUFDZCxXQUFTLEVBQUUsR0FBRztBQUNaLFdBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUEsR0FBSSxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0dBQzVFO0FBQ0QsY0FBVSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsU0FBSSxFQUFFLEVBQUUsU0FBSSxFQUFFLEVBQUUsU0FBSSxFQUFFLEVBQUUsU0FBSSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBRztDQUN2RTs7SUFFb0IsZUFBZTtXQUFmLGVBQWU7MEJBQWYsZUFBZTs7O2VBQWYsZUFBZTs7V0FDckIsZ0JBQUMsRUFBRSxFQUFFOzs7QUFDaEIsVUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFO0FBQ1osVUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNiLGVBQU87T0FDUjs7QUFFRCxhQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQUMsS0FBSyxFQUFFLFVBQVUsRUFBSztBQUM5QyxlQUFPLEtBQUssR0FDVixFQUFFLENBQUMsTUFBSyxHQUFHLEdBQUcsSUFBSSxFQUFFLENBQUMsR0FDckIsRUFBRSxDQUFDLE1BQUssR0FBRyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztPQUNoRyxDQUFDLENBQUM7S0FDSjs7O1dBRWUsbUJBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFO0FBQy9DLFVBQU0sTUFBTSxHQUFHO0FBQ2IsU0FBQyxFQUFFLE9BQU87QUFDVixVQUFFLEVBQUUsUUFBUTtBQUNaLFVBQUUsRUFBRSxNQUFNO09BQ1gsQ0FBQztBQUNGLFVBQUksS0FBSyxFQUFFO0FBQ1QsY0FBTSxDQUFDLEVBQUUsR0FBRyxLQUFLLENBQUM7T0FDbkI7QUFDRCxVQUFJLEtBQUssRUFBRTtBQUNULGNBQU0sQ0FBQyxFQUFFLEdBQUcsS0FBSyxDQUFDO09BQ25COztBQUVELFVBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDbkI7OztXQUVVLGNBQUMsTUFBTSxFQUFFOzs7QUFDbEIsVUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLEVBQUU7O0FBRTlDLGVBQU87T0FDUjs7QUFFRCxxQkFBZSxDQUFDLE1BQU0sQ0FBQyxVQUFDLEdBQUcsRUFBSztBQUM5QixjQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxlQUFlLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQztBQUNyRSxlQUFLLE9BQU8sQ0FBQywyQ0FBMkMsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7T0FDdEcsQ0FBQyxDQUFDO0tBQ0o7OztXQUVhLGlCQUFDLEdBQUcsRUFBRTtBQUNsQixVQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRTtBQUNyQixlQUFPO09BQ1I7QUFDRCxVQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ2hCOzs7V0FFVSxjQUFDLEdBQUcsRUFBRTtBQUNmLFVBQU0sR0FBRyxHQUFHLElBQUksY0FBYyxFQUFFLENBQUM7QUFDakMsU0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDdEIsU0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNoQjs7O1dBRW1CLHlCQUFHOztBQUVyQixhQUFPO0FBQ0wsU0FBQyxFQUFFLENBQUM7QUFDSixXQUFHLEVBQUUsZUFBZTtPQUNyQixDQUFDO0tBQ0g7OztTQTdEa0IsZUFBZTs7O3FCQUFmLGVBQWU7O0FBZ0VwQyxJQUFJLENBQUMsUUFBUSxDQUFDLG9CQUFvQixDQUFDLFVBQUMsR0FBRyxFQUFLO0FBQzFDLE1BQUksU0FBUyxLQUFLLEdBQUcsQ0FBQyxJQUFJLEVBQUU7QUFDMUIsUUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM3RCxXQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxZQUFZLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0dBQzdGO0NBQ0YsQ0FBQyxDQUFDIiwiZmlsZSI6Ii9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvYnVpbGQvbGliL2dvb2dsZS1hbmFseXRpY3MuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuZnVuY3Rpb24gdXVpZCgpIHtcbiAgZnVuY3Rpb24gczQoKSB7XG4gICAgcmV0dXJuIE1hdGguZmxvb3IoKDEgKyBNYXRoLnJhbmRvbSgpKSAqIDB4MTAwMDApLnRvU3RyaW5nKDE2KS5zdWJzdHJpbmcoMSk7XG4gIH1cbiAgcmV0dXJuIGAke3M0KCl9JHtzNCgpfS0ke3M0KCl9LSR7czQoKX0tJHtzNCgpfS0ke3M0KCl9JHtzNCgpfSR7czQoKX1gO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHb29nbGVBbmFseXRpY3Mge1xuICBzdGF0aWMgZ2V0Q2lkKGNiKSB7XG4gICAgaWYgKHRoaXMuY2lkKSB7XG4gICAgICBjYih0aGlzLmNpZCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgcmVxdWlyZSgnZ2V0bWFjJykuZ2V0TWFjKChlcnJvciwgbWFjQWRkcmVzcykgPT4ge1xuICAgICAgcmV0dXJuIGVycm9yID9cbiAgICAgICAgY2IodGhpcy5jaWQgPSB1dWlkKCkpIDpcbiAgICAgICAgY2IodGhpcy5jaWQgPSByZXF1aXJlKCdjcnlwdG8nKS5jcmVhdGVIYXNoKCdzaGExJykudXBkYXRlKG1hY0FkZHJlc3MsICd1dGY4JykuZGlnZXN0KCdoZXgnKSk7XG4gICAgfSk7XG4gIH1cblxuICBzdGF0aWMgc2VuZEV2ZW50KGNhdGVnb3J5LCBhY3Rpb24sIGxhYmVsLCB2YWx1ZSkge1xuICAgIGNvbnN0IHBhcmFtcyA9IHtcbiAgICAgIHQ6ICdldmVudCcsXG4gICAgICBlYzogY2F0ZWdvcnksXG4gICAgICBlYTogYWN0aW9uXG4gICAgfTtcbiAgICBpZiAobGFiZWwpIHtcbiAgICAgIHBhcmFtcy5lbCA9IGxhYmVsO1xuICAgIH1cbiAgICBpZiAodmFsdWUpIHtcbiAgICAgIHBhcmFtcy5ldiA9IHZhbHVlO1xuICAgIH1cblxuICAgIHRoaXMuc2VuZChwYXJhbXMpO1xuICB9XG5cbiAgc3RhdGljIHNlbmQocGFyYW1zKSB7XG4gICAgaWYgKCFhdG9tLnBhY2thZ2VzLmdldEFjdGl2ZVBhY2thZ2UoJ21ldHJpY3MnKSkge1xuICAgICAgLy8gSWYgdGhlIG1ldHJpY3MgcGFja2FnZSBpcyBkaXNhYmxlZCwgdGhlbiB1c2VyIGhhcyBvcHRlZCBvdXQuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgR29vZ2xlQW5hbHl0aWNzLmdldENpZCgoY2lkKSA9PiB7XG4gICAgICBPYmplY3QuYXNzaWduKHBhcmFtcywgeyBjaWQ6IGNpZCB9LCBHb29nbGVBbmFseXRpY3MuZGVmYXVsdFBhcmFtcygpKTtcbiAgICAgIHRoaXMucmVxdWVzdCgnaHR0cHM6Ly93d3cuZ29vZ2xlLWFuYWx5dGljcy5jb20vY29sbGVjdD8nICsgcmVxdWlyZSgncXVlcnlzdHJpbmcnKS5zdHJpbmdpZnkocGFyYW1zKSk7XG4gICAgfSk7XG4gIH1cblxuICBzdGF0aWMgcmVxdWVzdCh1cmwpIHtcbiAgICBpZiAoIW5hdmlnYXRvci5vbkxpbmUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5wb3N0KHVybCk7XG4gIH1cblxuICBzdGF0aWMgcG9zdCh1cmwpIHtcbiAgICBjb25zdCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICB4aHIub3BlbignUE9TVCcsIHVybCk7XG4gICAgeGhyLnNlbmQobnVsbCk7XG4gIH1cblxuICBzdGF0aWMgZGVmYXVsdFBhcmFtcygpIHtcbiAgICAvLyBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9hbmFseXRpY3MvZGV2Z3VpZGVzL2NvbGxlY3Rpb24vcHJvdG9jb2wvdjEvcGFyYW1ldGVyc1xuICAgIHJldHVybiB7XG4gICAgICB2OiAxLFxuICAgICAgdGlkOiAnVUEtNDc2MTU3MDAtNSdcbiAgICB9O1xuICB9XG59XG5cbmF0b20ucGFja2FnZXMub25EaWRBY3RpdmF0ZVBhY2thZ2UoKHBrZykgPT4ge1xuICBpZiAoJ21ldHJpY3MnID09PSBwa2cubmFtZSkge1xuICAgIGNvbnN0IGJ1aWxkUGFja2FnZSA9IGF0b20ucGFja2FnZXMuZ2V0TG9hZGVkUGFja2FnZSgnYnVpbGQnKTtcbiAgICByZXF1aXJlKCcuL2dvb2dsZS1hbmFseXRpY3MnKS5zZW5kRXZlbnQoJ2NvcmUnLCAnYWN0aXZhdGVkJywgYnVpbGRQYWNrYWdlLm1ldGFkYXRhLnZlcnNpb24pO1xuICB9XG59KTtcbiJdfQ==
//# sourceURL=/home/takaaki/.atom/packages/build/lib/google-analytics.js
