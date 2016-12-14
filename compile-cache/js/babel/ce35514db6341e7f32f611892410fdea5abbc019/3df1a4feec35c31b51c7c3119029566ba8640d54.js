Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

'use babel';

function getConfig(file) {
  var fs = require('fs');
  var realFile = fs.realpathSync(file);
  delete require.cache[realFile];
  switch (require('path').extname(file)) {
    case '.json':
    case '.js':
      return require(realFile);

    case '.cson':
      return require('cson-parser').parse(fs.readFileSync(realFile));

    case '.yml':
      return require('js-yaml').safeLoad(fs.readFileSync(realFile));
  }

  return {};
}

function createBuildConfig(build, name) {
  var conf = {
    name: 'Custom: ' + name,
    exec: build.cmd,
    env: build.env,
    args: build.args,
    cwd: build.cwd,
    sh: build.sh,
    errorMatch: build.errorMatch,
    functionMatch: build.functionMatch,
    warningMatch: build.warningMatch,
    atomCommandName: build.atomCommandName,
    keymap: build.keymap,
    killSignals: build.killSignals
  };

  if (typeof build.postBuild === 'function') {
    conf.postBuild = build.postBuild;
  }

  if (typeof build.preBuild === 'function') {
    conf.preBuild = build.preBuild;
  }

  return conf;
}

var CustomFile = (function (_EventEmitter) {
  _inherits(CustomFile, _EventEmitter);

  function CustomFile(cwd) {
    _classCallCheck(this, CustomFile);

    _get(Object.getPrototypeOf(CustomFile.prototype), 'constructor', this).call(this);
    this.cwd = cwd;
    this.fileWatchers = [];
  }

  _createClass(CustomFile, [{
    key: 'destructor',
    value: function destructor() {
      this.fileWatchers.forEach(function (fw) {
        return fw.close();
      });
    }
  }, {
    key: 'getNiceName',
    value: function getNiceName() {
      return 'Custom file';
    }
  }, {
    key: 'isEligible',
    value: function isEligible() {
      var _this = this;

      var os = require('os');
      var fs = require('fs');
      var path = require('path');
      this.files = [].concat.apply([], ['json', 'cson', 'yml', 'js'].map(function (ext) {
        return [path.join(_this.cwd, '.atom-build.' + ext), path.join(os.homedir(), '.atom-build.' + ext)];
      })).filter(fs.existsSync);
      return 0 < this.files.length;
    }
  }, {
    key: 'settings',
    value: function settings() {
      var _this2 = this;

      var fs = require('fs');
      this.fileWatchers.forEach(function (fw) {
        return fw.close();
      });
      // On Linux, closing a watcher triggers a new callback, which causes an infinite loop
      // fallback to `watchFile` here which polls instead.
      this.fileWatchers = this.files.map(function (file) {
        return (require('os').platform() === 'linux' ? fs.watchFile : fs.watch)(file, function () {
          return _this2.emit('refresh');
        });
      });

      var config = [];
      this.files.map(getConfig).forEach(function (build) {
        config.push.apply(config, [createBuildConfig(build, build.name || 'default')].concat(_toConsumableArray(Object.keys(build.targets || {}).map(function (name) {
          return createBuildConfig(build.targets[name], name);
        }))));
      });

      return config;
    }
  }]);

  return CustomFile;
})(_events2['default']);

exports['default'] = CustomFile;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvYnVpbGQvbGliL2F0b20tYnVpbGQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztzQkFFeUIsUUFBUTs7OztBQUZqQyxXQUFXLENBQUM7O0FBSVosU0FBUyxTQUFTLENBQUMsSUFBSSxFQUFFO0FBQ3ZCLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QixNQUFNLFFBQVEsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3ZDLFNBQU8sT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMvQixVQUFRLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO0FBQ25DLFNBQUssT0FBTyxDQUFDO0FBQ2IsU0FBSyxLQUFLO0FBQ1IsYUFBTyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7O0FBQUEsQUFFM0IsU0FBSyxPQUFPO0FBQ1YsYUFBTyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQzs7QUFBQSxBQUVqRSxTQUFLLE1BQU07QUFDVCxhQUFPLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0FBQUEsR0FDakU7O0FBRUQsU0FBTyxFQUFFLENBQUM7Q0FDWDs7QUFFRCxTQUFTLGlCQUFpQixDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUU7QUFDdEMsTUFBTSxJQUFJLEdBQUc7QUFDWCxRQUFJLEVBQUUsVUFBVSxHQUFHLElBQUk7QUFDdkIsUUFBSSxFQUFFLEtBQUssQ0FBQyxHQUFHO0FBQ2YsT0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHO0FBQ2QsUUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJO0FBQ2hCLE9B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QUMsVUFBQSxLQUFLLEVBQUk7QUFDekMsY0FBTSxDQUFDLElBQUksTUFBQSxDQUFYLE1BQU0sR0FDSixpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLElBQUksSUFBSSxTQUFTLENBQUMsNEJBQzlDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQSxJQUFJO2lCQUFJLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDO1NBQUEsQ0FBQyxHQUM5RixDQUFDO09BQ0gsQ0FBQyxDQUFDOztBQUVILGFBQU8sTUFBTSxDQUFDO0tBQ2Y7OztTQTVDa0IsVUFBVTs7O3FCQUFWLFVBQVUiLCJmaWxlIjoiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9idWlsZC9saWIvYXRvbS1idWlsZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gJ2V2ZW50cyc7XG5cbmZ1bmN0aW9uIGdldENvbmZpZyhmaWxlKSB7XG4gIGNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbiAgY29uc3QgcmVhbEZpbGUgPSBmcy5yZWFscGF0aFN5bmMoZmlsZSk7XG4gIGRlbGV0ZSByZXF1aXJlLmNhY2hlW3JlYWxGaWxlXTtcbiAgc3dpdGNoIChyZXF1aXJlKCdwYXRoJykuZXh0bmFtZShmaWxlKSkge1xuICAgIGNhc2UgJy5qc29uJzpcbiAgICBjYXNlICcuanMnOlxuICAgICAgcmV0dXJuIHJlcXVpcmUocmVhbEZpbGUpO1xuXG4gICAgY2FzZSAnLmNzb24nOlxuICAgICAgcmV0dXJuIHJlcXVpcmUoJ2Nzb24tcGFyc2VyJykucGFyc2UoZnMucmVhZEZpbGVTeW5jKHJlYWxGaWxlKSk7XG5cbiAgICBjYXNlICcueW1sJzpcbiAgICAgIHJldHVybiByZXF1aXJlKCdqcy15YW1sJykuc2FmZUxvYWQoZnMucmVhZEZpbGVTeW5jKHJlYWxGaWxlKSk7XG4gIH1cblxuICByZXR1cm4ge307XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUJ1aWxkQ29uZmlnKGJ1aWxkLCBuYW1lKSB7XG4gIGNvbnN0IGNvbmYgPSB7XG4gICAgbmFtZTogJ0N1c3RvbTogJyArIG5hbWUsXG4gICAgZXhlYzogYnVpbGQuY21kLFxuICAgIGVudjogYnVpbGQuZW52LFxuICAgIGFyZ3M6IGJ1aWxkLmFyZ3MsXG4gICAgY3dkOiBidWlsZC5jd2QsXG4gICAgc2g6IGJ1aWxkLnNoLFxuICAgIGVycm9yTWF0Y2g6IGJ1aWxkLmVycm9yTWF0Y2gsXG4gICAgZnVuY3Rpb25NYXRjaDogYnVpbGQuZnVuY3Rpb25NYXRjaCxcbiAgICB3YXJuaW5nTWF0Y2g6IGJ1aWxkLndhcm5pbmdNYXRjaCxcbiAgICBhdG9tQ29tbWFuZE5hbWU6IGJ1aWxkLmF0b21Db21tYW5kTmFtZSxcbiAgICBrZXltYXA6IGJ1aWxkLmtleW1hcCxcbiAgICBraWxsU2lnbmFsczogYnVpbGQua2lsbFNpZ25hbHNcbiAgfTtcblxuICBpZiAodHlwZW9mIGJ1aWxkLnBvc3RCdWlsZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGNvbmYucG9zdEJ1aWxkID0gYnVpbGQucG9zdEJ1aWxkO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBidWlsZC5wcmVCdWlsZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGNvbmYucHJlQnVpbGQgPSBidWlsZC5wcmVCdWlsZDtcbiAgfVxuXG4gIHJldHVybiBjb25mO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDdXN0b21GaWxlIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcbiAgY29uc3RydWN0b3IoY3dkKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmN3ZCA9IGN3ZDtcbiAgICB0aGlzLmZpbGVXYXRjaGVycyA9IFtdO1xuICB9XG5cbiAgZGVzdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmZpbGVXYXRjaGVycy5mb3JFYWNoKGZ3ID0+IGZ3LmNsb3NlKCkpO1xuICB9XG5cbiAgZ2V0TmljZU5hbWUoKSB7XG4gICAgcmV0dXJuICdDdXN0b20gZmlsZSc7XG4gIH1cblxuICBpc0VsaWdpYmxlKCkge1xuICAgIGNvbnN0IG9zID0gcmVxdWlyZSgnb3MnKTtcbiAgICBjb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG4gICAgY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbiAgICB0aGlzLmZpbGVzID0gW10uY29uY2F0LmFwcGx5KFtdLCBbICdqc29uJywgJ2Nzb24nLCAneW1sJywgJ2pzJyBdLm1hcChleHQgPT4gW1xuICAgICAgcGF0aC5qb2luKHRoaXMuY3dkLCBgLmF0b20tYnVpbGQuJHtleHR9YCksXG4gICAgICBwYXRoLmpvaW4ob3MuaG9tZWRpcigpLCBgLmF0b20tYnVpbGQuJHtleHR9YClcbiAgICBdKSkuZmlsdGVyKGZzLmV4aXN0c1N5bmMpO1xuICAgIHJldHVybiAwIDwgdGhpcy5maWxlcy5sZW5ndGg7XG4gIH1cblxuICBzZXR0aW5ncygpIHtcbiAgICBjb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG4gICAgdGhpcy5maWxlV2F0Y2hlcnMuZm9yRWFjaChmdyA9PiBmdy5jbG9zZSgpKTtcbiAgICAvLyBPbiBMaW51eCwgY2xvc2luZyBhIHdhdGNoZXIgdHJpZ2dlcnMgYSBuZXcgY2FsbGJhY2ssIHdoaWNoIGNhdXNlcyBhbiBpbmZpbml0ZSBsb29wXG4gICAgLy8gZmFsbGJhY2sgdG8gYHdhdGNoRmlsZWAgaGVyZSB3aGljaCBwb2xscyBpbnN0ZWFkLlxuICAgIHRoaXMuZmlsZVdhdGNoZXJzID0gdGhpcy5maWxlcy5tYXAoZmlsZSA9PlxuICAgICAgKHJlcXVpcmUoJ29zJykucGxhdGZvcm0oKSA9PT0gJ2xpbnV4JyA/IGZzLndhdGNoRmlsZSA6IGZzLndhdGNoKShmaWxlLCAoKSA9PiB0aGlzLmVtaXQoJ3JlZnJlc2gnKSlcbiAgICApO1xuXG4gICAgY29uc3QgY29uZmlnID0gW107XG4gICAgdGhpcy5maWxlcy5tYXAoZ2V0Q29uZmlnKS5mb3JFYWNoKGJ1aWxkID0+IHtcbiAgICAgIGNvbmZpZy5wdXNoKFxuICAgICAgICBjcmVhdGVCdWlsZENvbmZpZyhidWlsZCwgYnVpbGQubmFtZSB8fCAnZGVmYXVsdCcpLFxuICAgICAgICAuLi5PYmplY3Qua2V5cyhidWlsZC50YXJnZXRzIHx8IHt9KS5tYXAobmFtZSA9PiBjcmVhdGVCdWlsZENvbmZpZyhidWlsZC50YXJnZXRzW25hbWVdLCBuYW1lKSlcbiAgICAgICk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gY29uZmlnO1xuICB9XG59XG4iXX0=
//# sourceURL=/home/takaaki/.atom/packages/build/lib/atom-build.js
