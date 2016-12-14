function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _temp = require('temp');

var _temp2 = _interopRequireDefault(_temp);

var _atomBuildSpecHelpers = require('atom-build-spec-helpers');

var _libCargo = require('../lib/cargo');

'use babel';

describe('cargo', function () {
  var directory = undefined;
  var builder = undefined;
  var Builder = (0, _libCargo.provideBuilder)();

  beforeEach(function () {
    atom.config.set('build-make.useMake', true);
    atom.config.set('build-make.jobs', 2);
    waitsForPromise(function () {
      return (0, _atomBuildSpecHelpers.vouch)(_temp2['default'].mkdir, 'atom-build-make-spec-').then(function (dir) {
        return (0, _atomBuildSpecHelpers.vouch)(_fsExtra2['default'].realpath, dir);
      }).then(function (dir) {
        return directory = dir + '/';
      }).then(function (dir) {
        return builder = new Builder(dir);
      });
    });
  });

  afterEach(function () {
    _fsExtra2['default'].removeSync(directory);
  });

  describe('when Cargo.toml exists', function () {
    beforeEach(function () {
      _fsExtra2['default'].writeFileSync(directory + 'Cargo.toml', _fsExtra2['default'].readFileSync(__dirname + '/Cargo.toml'));
      atom.config.set('build-cargo.cargoPath', '/this/is/just/a/dummy/path/cargo');
    });

    it('should be eligible', function () {
      expect(builder.isEligible(directory)).toBe(true);
    });

    it('should yield available targets', function () {
      waitsForPromise(function () {
        return Promise.resolve(builder.settings(directory)).then(function (settings) {
          expect(settings.length).toBe(12); // change this when you change the default settings

          var defaultTarget = settings[0]; // default MUST be first
          expect(defaultTarget.name).toBe('Cargo: build (debug)');
          expect(defaultTarget.exec).toBe('/this/is/just/a/dummy/path/cargo');
          expect(defaultTarget.argsCfg).toEqual(['build']);
          expect(defaultTarget.sh).toBe(false);

          var target = settings.find(function (setting) {
            return setting.name === 'Cargo: test';
          });
          expect(target.name).toBe('Cargo: test');
          expect(target.exec).toBe('/this/is/just/a/dummy/path/cargo');
          expect(target.argsCfg).toEqual(['test']);
          expect(target.sh).toBe(false);
        });
      });
    });

    it('should not contain clippy in the set of commands if it is disabled', function () {
      atom.config.set('build-cargo.cargoClippy', false);
      waitsForPromise(function () {
        expect(builder.isEligible(directory)).toBe(true);
        return Promise.resolve(builder.settings(directory)).then(function (settings) {
          settings.forEach(function (s) {
            return expect(s.name.toLowerCase().indexOf('clippy')).toEqual(-1);
          });
        });
      });
    });
  });

  describe('when Cargo.toml does not exist', function () {
    it('should not be eligible', function () {
      expect(builder.isEligible(directory)).toBe(false);
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvYnVpbGQtY2FyZ28vc3BlYy9jYXJnby1zcGVjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O3VCQUVlLFVBQVU7Ozs7b0JBQ1IsTUFBTTs7OztvQ0FDRCx5QkFBeUI7O3dCQUNoQixjQUFjOztBQUw3QyxXQUFXLENBQUM7O0FBT1osUUFBUSxDQUFDLE9BQU8sRUFBRSxZQUFNO0FBQ3RCLE1BQUksU0FBUyxZQUFBLENBQUM7QUFDZCxNQUFJLE9BQU8sWUFBQSxDQUFDO0FBQ1osTUFBTSxPQUFPLEdBQUcsK0JBQWdCLENBQUM7O0FBRWpDLFlBQVUsQ0FBQyxZQUFNO0FBQ2YsUUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDNUMsUUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDdEMsbUJBQWUsQ0FBQyxZQUFNO0FBQ3BCLGFBQU8saUNBQU0sa0JBQUssS0FBSyxFQUFFLHVCQUF1QixDQUFDLENBQzlDLElBQUksQ0FBQyxVQUFDLEdBQUc7ZUFBSyxpQ0FBTSxxQkFBRyxRQUFRLEVBQUUsR0FBRyxDQUFDO09BQUEsQ0FBQyxDQUN0QyxJQUFJLENBQUMsVUFBQyxHQUFHO2VBQU0sU0FBUyxHQUFNLEdBQUcsTUFBRztPQUFDLENBQUMsQ0FDdEMsSUFBSSxDQUFDLFVBQUMsR0FBRztlQUFNLE9BQU8sR0FBRyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUM7T0FBQyxDQUFDLENBQUM7S0FDaEQsQ0FBQyxDQUFDO0dBQ0osQ0FBQyxDQUFDOztBQUVILFdBQVMsQ0FBQyxZQUFNO0FBQ2QseUJBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0dBQzFCLENBQUMsQ0FBQzs7QUFFSCxVQUFRLENBQUMsd0JBQXdCLEVBQUUsWUFBTTtBQUN2QyxjQUFVLENBQUMsWUFBTTtBQUNmLDJCQUFHLGFBQWEsQ0FBQyxTQUFTLEdBQUcsWUFBWSxFQUFFLHFCQUFHLFlBQVksQ0FBSSxTQUFTLGlCQUFjLENBQUMsQ0FBQztBQUN2RixVQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsRUFBRSxrQ0FBa0MsQ0FBQyxDQUFDO0tBQzlFLENBQUMsQ0FBQzs7QUFFSCxNQUFFLENBQUMsb0JBQW9CLEVBQUUsWUFBTTtBQUM3QixZQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNsRCxDQUFDLENBQUM7O0FBRUgsTUFBRSxDQUFDLGdDQUFnQyxFQUFFLFlBQU07QUFDekMscUJBQWUsQ0FBQyxZQUFNO0FBQ3BCLGVBQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUMsUUFBUSxFQUFLO0FBQ3JFLGdCQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQzs7QUFFakMsY0FBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xDLGdCQUFNLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0FBQ3hELGdCQUFNLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO0FBQ3BFLGdCQUFNLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFFLE9BQU8sQ0FBRSxDQUFDLENBQUM7QUFDbkQsZ0JBQU0sQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUVyQyxjQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQUEsT0FBTzttQkFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLGFBQWE7V0FBQSxDQUFDLENBQUM7QUFDeEUsZ0JBQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3hDLGdCQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO0FBQzdELGdCQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFFLE1BQU0sQ0FBRSxDQUFDLENBQUM7QUFDM0MsZ0JBQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQy9CLENBQUMsQ0FBQztPQUNKLENBQUMsQ0FBQztLQUNKLENBQUMsQ0FBQzs7QUFFSCxNQUFFLENBQUMsb0VBQW9FLEVBQUUsWUFBTTtBQUM3RSxVQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNsRCxxQkFBZSxDQUFDLFlBQU07QUFDcEIsY0FBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDakQsZUFBTyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxRQUFRLEVBQUs7QUFDckUsa0JBQVEsQ0FBQyxPQUFPLENBQUMsVUFBQSxDQUFDO21CQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztXQUFBLENBQUMsQ0FBQztTQUNuRixDQUFDLENBQUM7T0FDSixDQUFDLENBQUM7S0FDSixDQUFDLENBQUM7R0FDSixDQUFDLENBQUM7O0FBRUgsVUFBUSxDQUFDLGdDQUFnQyxFQUFFLFlBQU07QUFDL0MsTUFBRSxDQUFDLHdCQUF3QixFQUFFLFlBQU07QUFDakMsWUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDbkQsQ0FBQyxDQUFDO0dBQ0osQ0FBQyxDQUFDO0NBQ0osQ0FBQyxDQUFDIiwiZmlsZSI6Ii9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvYnVpbGQtY2FyZ28vc3BlYy9jYXJnby1zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgdGVtcCBmcm9tICd0ZW1wJztcbmltcG9ydCB7IHZvdWNoIH0gZnJvbSAnYXRvbS1idWlsZC1zcGVjLWhlbHBlcnMnO1xuaW1wb3J0IHsgcHJvdmlkZUJ1aWxkZXIgfSBmcm9tICcuLi9saWIvY2FyZ28nO1xuXG5kZXNjcmliZSgnY2FyZ28nLCAoKSA9PiB7XG4gIGxldCBkaXJlY3Rvcnk7XG4gIGxldCBidWlsZGVyO1xuICBjb25zdCBCdWlsZGVyID0gcHJvdmlkZUJ1aWxkZXIoKTtcblxuICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ2J1aWxkLW1ha2UudXNlTWFrZScsIHRydWUpO1xuICAgIGF0b20uY29uZmlnLnNldCgnYnVpbGQtbWFrZS5qb2JzJywgMik7XG4gICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHtcbiAgICAgIHJldHVybiB2b3VjaCh0ZW1wLm1rZGlyLCAnYXRvbS1idWlsZC1tYWtlLXNwZWMtJylcbiAgICAgICAgLnRoZW4oKGRpcikgPT4gdm91Y2goZnMucmVhbHBhdGgsIGRpcikpXG4gICAgICAgIC50aGVuKChkaXIpID0+IChkaXJlY3RvcnkgPSBgJHtkaXJ9L2ApKVxuICAgICAgICAudGhlbigoZGlyKSA9PiAoYnVpbGRlciA9IG5ldyBCdWlsZGVyKGRpcikpKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgYWZ0ZXJFYWNoKCgpID0+IHtcbiAgICBmcy5yZW1vdmVTeW5jKGRpcmVjdG9yeSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCd3aGVuIENhcmdvLnRvbWwgZXhpc3RzJywgKCkgPT4ge1xuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgZnMud3JpdGVGaWxlU3luYyhkaXJlY3RvcnkgKyAnQ2FyZ28udG9tbCcsIGZzLnJlYWRGaWxlU3luYyhgJHtfX2Rpcm5hbWV9L0NhcmdvLnRvbWxgKSk7XG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2J1aWxkLWNhcmdvLmNhcmdvUGF0aCcsICcvdGhpcy9pcy9qdXN0L2EvZHVtbXkvcGF0aC9jYXJnbycpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBiZSBlbGlnaWJsZScsICgpID0+IHtcbiAgICAgIGV4cGVjdChidWlsZGVyLmlzRWxpZ2libGUoZGlyZWN0b3J5KSkudG9CZSh0cnVlKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgeWllbGQgYXZhaWxhYmxlIHRhcmdldHMnLCAoKSA9PiB7XG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4ge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGJ1aWxkZXIuc2V0dGluZ3MoZGlyZWN0b3J5KSkudGhlbigoc2V0dGluZ3MpID0+IHtcbiAgICAgICAgICBleHBlY3Qoc2V0dGluZ3MubGVuZ3RoKS50b0JlKDEyKTsgLy8gY2hhbmdlIHRoaXMgd2hlbiB5b3UgY2hhbmdlIHRoZSBkZWZhdWx0IHNldHRpbmdzXG5cbiAgICAgICAgICBjb25zdCBkZWZhdWx0VGFyZ2V0ID0gc2V0dGluZ3NbMF07IC8vIGRlZmF1bHQgTVVTVCBiZSBmaXJzdFxuICAgICAgICAgIGV4cGVjdChkZWZhdWx0VGFyZ2V0Lm5hbWUpLnRvQmUoJ0NhcmdvOiBidWlsZCAoZGVidWcpJyk7XG4gICAgICAgICAgZXhwZWN0KGRlZmF1bHRUYXJnZXQuZXhlYykudG9CZSgnL3RoaXMvaXMvanVzdC9hL2R1bW15L3BhdGgvY2FyZ28nKTtcbiAgICAgICAgICBleHBlY3QoZGVmYXVsdFRhcmdldC5hcmdzQ2ZnKS50b0VxdWFsKFsgJ2J1aWxkJyBdKTtcbiAgICAgICAgICBleHBlY3QoZGVmYXVsdFRhcmdldC5zaCkudG9CZShmYWxzZSk7XG5cbiAgICAgICAgICBjb25zdCB0YXJnZXQgPSBzZXR0aW5ncy5maW5kKHNldHRpbmcgPT4gc2V0dGluZy5uYW1lID09PSAnQ2FyZ286IHRlc3QnKTtcbiAgICAgICAgICBleHBlY3QodGFyZ2V0Lm5hbWUpLnRvQmUoJ0NhcmdvOiB0ZXN0Jyk7XG4gICAgICAgICAgZXhwZWN0KHRhcmdldC5leGVjKS50b0JlKCcvdGhpcy9pcy9qdXN0L2EvZHVtbXkvcGF0aC9jYXJnbycpO1xuICAgICAgICAgIGV4cGVjdCh0YXJnZXQuYXJnc0NmZykudG9FcXVhbChbICd0ZXN0JyBdKTtcbiAgICAgICAgICBleHBlY3QodGFyZ2V0LnNoKS50b0JlKGZhbHNlKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgbm90IGNvbnRhaW4gY2xpcHB5IGluIHRoZSBzZXQgb2YgY29tbWFuZHMgaWYgaXQgaXMgZGlzYWJsZWQnLCAoKSA9PiB7XG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2J1aWxkLWNhcmdvLmNhcmdvQ2xpcHB5JywgZmFsc2UpO1xuICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHtcbiAgICAgICAgZXhwZWN0KGJ1aWxkZXIuaXNFbGlnaWJsZShkaXJlY3RvcnkpKS50b0JlKHRydWUpO1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGJ1aWxkZXIuc2V0dGluZ3MoZGlyZWN0b3J5KSkudGhlbigoc2V0dGluZ3MpID0+IHtcbiAgICAgICAgICBzZXR0aW5ncy5mb3JFYWNoKHMgPT4gZXhwZWN0KHMubmFtZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YoJ2NsaXBweScpKS50b0VxdWFsKC0xKSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCd3aGVuIENhcmdvLnRvbWwgZG9lcyBub3QgZXhpc3QnLCAoKSA9PiB7XG4gICAgaXQoJ3Nob3VsZCBub3QgYmUgZWxpZ2libGUnLCAoKSA9PiB7XG4gICAgICBleHBlY3QoYnVpbGRlci5pc0VsaWdpYmxlKGRpcmVjdG9yeSkpLnRvQmUoZmFsc2UpO1xuICAgIH0pO1xuICB9KTtcbn0pO1xuIl19
//# sourceURL=/home/takaaki/.atom/packages/build-cargo/spec/cargo-spec.js
