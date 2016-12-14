function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _temp = require('temp');

var _temp2 = _interopRequireDefault(_temp);

var _libAtomBuildJs = require('../lib/atom-build.js');

var _libAtomBuildJs2 = _interopRequireDefault(_libAtomBuildJs);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

'use babel';

describe('custom provider', function () {
  var originalHomedirFn = _os2['default'].homedir;
  var builder = undefined;
  var directory = null;
  var createdHomeDir = undefined;

  _temp2['default'].track();

  beforeEach(function () {
    createdHomeDir = _temp2['default'].mkdirSync('atom-build-spec-home');
    _os2['default'].homedir = function () {
      return createdHomeDir;
    };
    directory = _fsExtra2['default'].realpathSync(_temp2['default'].mkdirSync({ prefix: 'atom-build-spec-' })) + '/';
    atom.project.setPaths([directory]);
    builder = new _libAtomBuildJs2['default'](directory);
  });

  afterEach(function () {
    _fsExtra2['default'].removeSync(directory);
    _os2['default'].homedir = originalHomedirFn;
  });

  describe('when there is no .atom-build config file in any elegible directory', function () {
    it('should not be eligible', function () {
      expect(builder.isEligible()).toEqual(false);
    });
  });

  describe('when .atom-build config is on home directory', function () {
    it('should find json file in home directory', function () {
      _fsExtra2['default'].writeFileSync(createdHomeDir + '/.atom-build.json', _fsExtra2['default'].readFileSync(__dirname + '/fixture/.atom-build.json'));
      expect(builder.isEligible()).toEqual(true);
    });
    it('should find cson file in home directory', function () {
      _fsExtra2['default'].writeFileSync(createdHomeDir + '/.atom-build.cson', _fsExtra2['default'].readFileSync(__dirname + '/fixture/.atom-build.cson'));
      expect(builder.isEligible()).toEqual(true);
    });
    it('should find yml file in home directory', function () {
      _fsExtra2['default'].writeFileSync(createdHomeDir + '/.atom-build.yml', _fsExtra2['default'].readFileSync(__dirname + '/fixture/.atom-build.yml'));
      expect(builder.isEligible()).toEqual(true);
    });
  });

  describe('when .atom-build config is on project directory', function () {
    it('should find json file in home directory', function () {
      _fsExtra2['default'].writeFileSync(directory + '/.atom-build.json', _fsExtra2['default'].readFileSync(__dirname + '/fixture/.atom-build.json'));
      expect(builder.isEligible()).toEqual(true);
    });
    it('should find cson file in home directory', function () {
      _fsExtra2['default'].writeFileSync(directory + '/.atom-build.cson', _fsExtra2['default'].readFileSync(__dirname + '/fixture/.atom-build.cson'));
      expect(builder.isEligible()).toEqual(true);
    });
    it('should find yml file in home directory', function () {
      _fsExtra2['default'].writeFileSync(directory + '/.atom-build.yml', _fsExtra2['default'].readFileSync(__dirname + '/fixture/.atom-build.yml'));
      expect(builder.isEligible()).toEqual(true);
    });
  });

  describe('when .atom-build.cson exists', function () {
    it('it should provide targets', function () {
      _fsExtra2['default'].writeFileSync(directory + '.atom-build.cson', _fsExtra2['default'].readFileSync(__dirname + '/fixture/.atom-build.cson'));
      expect(builder.isEligible()).toEqual(true);

      waitsForPromise(function () {
        return Promise.resolve(builder.settings()).then(function (settings) {
          var s = settings[0];
          expect(s.exec).toEqual('echo');
          expect(s.args).toEqual(['arg1', 'arg2']);
          expect(s.name).toEqual('Custom: Compose masterpiece');
          expect(s.sh).toEqual(false);
          expect(s.cwd).toEqual('/some/directory');
          expect(s.errorMatch).toEqual('(?<file>\\w+.js):(?<row>\\d+)');
        });
      });
    });
  });

  describe('when .atom-build.json exists', function () {
    it('it should provide targets', function () {
      _fsExtra2['default'].writeFileSync(directory + '.atom-build.json', _fsExtra2['default'].readFileSync(__dirname + '/fixture/.atom-build.json'));
      expect(builder.isEligible()).toEqual(true);

      waitsForPromise(function () {
        return Promise.resolve(builder.settings()).then(function (settings) {
          var s = settings[0];
          expect(s.exec).toEqual('dd');
          expect(s.args).toEqual(['if=.atom-build.json']);
          expect(s.name).toEqual('Custom: Fly to moon');
        });
      });
    });
  });

  describe('when .atom-build.yml exists', function () {
    it('it should provide targets', function () {
      _fsExtra2['default'].writeFileSync(directory + '.atom-build.yml', _fsExtra2['default'].readFileSync(__dirname + '/fixture/.atom-build.yml'));
      expect(builder.isEligible()).toEqual(true);

      waitsForPromise(function () {
        return Promise.resolve(builder.settings()).then(function (settings) {
          var s = settings[0];
          expect(s.exec).toEqual('echo');
          expect(s.args).toEqual(['hello', 'world', 'from', 'yaml']);
          expect(s.name).toEqual('Custom: yaml conf');
        });
      });
    });
  });

  describe('when .atom-build.js exists', function () {
    it('it should provide targets', function () {
      _fsExtra2['default'].writeFileSync(directory + '.atom-build.js', _fsExtra2['default'].readFileSync(__dirname + '/fixture/.atom-build.js'));
      expect(builder.isEligible()).toEqual(true);

      waitsForPromise(function () {
        return Promise.resolve(builder.settings()).then(function (settings) {
          var s = settings[0];
          expect(s.exec).toEqual('echo');
          expect(s.args).toEqual(['hello', 'world', 'from', 'js']);
          expect(s.name).toEqual('Custom: from js');
        });
      });
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvYnVpbGQvc3BlYy9jdXN0b20tcHJvdmlkZXItc3BlYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzt1QkFFZSxVQUFVOzs7O29CQUNSLE1BQU07Ozs7OEJBQ0Esc0JBQXNCOzs7O2tCQUM5QixJQUFJOzs7O0FBTG5CLFdBQVcsQ0FBQzs7QUFPWixRQUFRLENBQUMsaUJBQWlCLEVBQUUsWUFBTTtBQUNoQyxNQUFNLGlCQUFpQixHQUFHLGdCQUFHLE9BQU8sQ0FBQztBQUNyQyxNQUFJLE9BQU8sWUFBQSxDQUFDO0FBQ1osTUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDO0FBQ3JCLE1BQUksY0FBYyxZQUFBLENBQUM7O0FBRW5CLG9CQUFLLEtBQUssRUFBRSxDQUFDOztBQUViLFlBQVUsQ0FBQyxZQUFNO0FBQ2Ysa0JBQWMsR0FBRyxrQkFBSyxTQUFTLENBQUMsc0JBQXNCLENBQUMsQ0FBQztBQUN4RCxvQkFBRyxPQUFPLEdBQUc7YUFBTSxjQUFjO0tBQUEsQ0FBQztBQUNsQyxhQUFTLEdBQUcscUJBQUcsWUFBWSxDQUFDLGtCQUFLLFNBQVMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxrQkFBa0IsRUFBRSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDbEYsUUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBRSxTQUFTLENBQUUsQ0FBQyxDQUFDO0FBQ3JDLFdBQU8sR0FBRyxnQ0FBZSxTQUFTLENBQUMsQ0FBQztHQUNyQyxDQUFDLENBQUM7O0FBRUgsV0FBUyxDQUFDLFlBQU07QUFDZCx5QkFBRyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDekIsb0JBQUcsT0FBTyxHQUFHLGlCQUFpQixDQUFDO0dBQ2hDLENBQUMsQ0FBQzs7QUFFSCxVQUFRLENBQUMsb0VBQW9FLEVBQUUsWUFBTTtBQUNuRixNQUFFLENBQUMsd0JBQXdCLEVBQUUsWUFBTTtBQUNqQyxZQUFNLENBQUMsT0FBTyxDQUFDLFVB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QUFDO0dBQ0osQ0FBQyxDQUFDOztBQUVILFVBQVEsQ0FBQyw0QkFBNEIsRUFBRSxZQUFNO0FBQzNDLE1BQUUsQ0FBQywyQkFBMkIsRUFBRSxZQUFNO0FBQ3BDLDJCQUFHLGFBQWEsQ0FBSSxTQUFTLHFCQUFrQixxQkFBRyxZQUFZLENBQUksU0FBUyw2QkFBMEIsQ0FBQyxDQUFDO0FBQ3ZHLFlBQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRTNDLHFCQUFlLENBQUMsWUFBTTtBQUNwQixlQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUEsUUFBUSxFQUFJO0FBQzFELGNBQU0sQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN0QixnQkFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDL0IsZ0JBQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFFLENBQUMsQ0FBQztBQUMzRCxnQkFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQztTQUMzQyxDQUFDLENBQUM7T0FDSixDQUFDLENBQUM7S0FDSixDQUFDLENBQUM7R0FDSixDQUFDLENBQUM7Q0FDSixDQUFDLENBQUMiLCJmaWxlIjoiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9idWlsZC9zcGVjL2N1c3RvbS1wcm92aWRlci1zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgdGVtcCBmcm9tICd0ZW1wJztcbmltcG9ydCBDdXN0b21GaWxlIGZyb20gJy4uL2xpYi9hdG9tLWJ1aWxkLmpzJztcbmltcG9ydCBvcyBmcm9tICdvcyc7XG5cbmRlc2NyaWJlKCdjdXN0b20gcHJvdmlkZXInLCAoKSA9PiB7XG4gIGNvbnN0IG9yaWdpbmFsSG9tZWRpckZuID0gb3MuaG9tZWRpcjtcbiAgbGV0IGJ1aWxkZXI7XG4gIGxldCBkaXJlY3RvcnkgPSBudWxsO1xuICBsZXQgY3JlYXRlZEhvbWVEaXI7XG5cbiAgdGVtcC50cmFjaygpO1xuXG4gIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgIGNyZWF0ZWRIb21lRGlyID0gdGVtcC5ta2RpclN5bmMoJ2F0b20tYnVpbGQtc3BlYy1ob21lJyk7XG4gICAgb3MuaG9tZWRpciA9ICgpID0+IGNyZWF0ZWRIb21lRGlyO1xuICAgIGRpcmVjdG9yeSA9IGZzLnJlYWxwYXRoU3luYyh0ZW1wLm1rZGlyU3luYyh7IHByZWZpeDogJ2F0b20tYnVpbGQtc3BlYy0nIH0pKSArICcvJztcbiAgICBhdG9tLnByb2plY3Quc2V0UGF0aHMoWyBkaXJlY3RvcnkgXSk7XG4gICAgYnVpbGRlciA9IG5ldyBDdXN0b21GaWxlKGRpcmVjdG9yeSk7XG4gIH0pO1xuXG4gIGFmdGVyRWFjaCgoKSA9PiB7XG4gICAgZnMucmVtb3ZlU3luYyhkaXJlY3RvcnkpO1xuICAgIG9zLmhvbWVkaXIgPSBvcmlnaW5hbEhvbWVkaXJGbjtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3doZW4gdGhlcmUgaXMgbm8gLmF0b20tYnVpbGQgY29uZmlnIGZpbGUgaW4gYW55IGVsZWdpYmxlIGRpcmVjdG9yeScsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIG5vdCBiZSBlbGlnaWJsZScsICgpID0+IHtcbiAgICAgIGV4cGVjdChidWlsZGVyLmlzRWxpZ2libGUoKSkudG9FcXVhbChmYWxzZSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCd3aGVuIC5hdG9tLWJ1aWxkIGNvbmZpZyBpcyBvbiBob21lIGRpcmVjdG9yeScsICgpID0+IHtcbiAgICBpdCgnc2hvdWxkIGZpbmQganNvbiBmaWxlIGluIGhvbWUgZGlyZWN0b3J5JywgKCkgPT4ge1xuICAgICAgZnMud3JpdGVGaWxlU3luYyhjcmVhdGVkSG9tZURpciArICcvLmF0b20tYnVpbGQuanNvbicsIGZzLnJlYWRGaWxlU3luYyhfX2Rpcm5hbWUgKyAnL2ZpeHR1cmUvLmF0b20tYnVpbGQuanNvbicpKTtcbiAgICAgIGV4cGVjdChidWlsZGVyLmlzRWxpZ2libGUoKSkudG9FcXVhbCh0cnVlKTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIGZpbmQgY3NvbiBmaWxlIGluIGhvbWUgZGlyZWN0b3J5JywgKCkgPT4ge1xuICAgICAgZnMud3JpdGVGaWxlU3luYyhjcmVhdGVkSG9tZURpciArICcvLmF0b20tYnVpbGQuY3NvbicsIGZzLnJlYWRGaWxlU3luYyhfX2Rpcm5hbWUgKyAnL2ZpeHR1cmUvLmF0b20tYnVpbGQuY3NvbicpKTtcbiAgICAgIGV4cGVjdChidWlsZGVyLmlzRWxpZ2libGUoKSkudG9FcXVhbCh0cnVlKTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIGZpbmQgeW1sIGZpbGUgaW4gaG9tZSBkaXJlY3RvcnknLCAoKSA9PiB7XG4gICAgICBmcy53cml0ZUZpbGVTeW5jKGNyZWF0ZWRIb21lRGlyICsgJy8uYXRvbS1idWlsZC55bWwnLCBmcy5yZWFkRmlsZVN5bmMoX19kaXJuYW1lICsgJy9maXh0dXJlLy5hdG9tLWJ1aWxkLnltbCcpKTtcbiAgICAgIGV4cGVjdChidWlsZGVyLmlzRWxpZ2libGUoKSkudG9FcXVhbCh0cnVlKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3doZW4gLmF0b20tYnVpbGQgY29uZmlnIGlzIG9uIHByb2plY3QgZGlyZWN0b3J5JywgKCkgPT4ge1xuICAgIGl0KCdzaG91bGQgZmluZCBqc29uIGZpbGUgaW4gaG9tZSBkaXJlY3RvcnknLCAoKSA9PiB7XG4gICAgICBmcy53cml0ZUZpbGVTeW5jKGRpcmVjdG9yeSArICcvLmF0b20tYnVpbGQuanNvbicsIGZzLnJlYWRGaWxlU3luYyhfX2Rpcm5hbWUgKyAnL2ZpeHR1cmUvLmF0b20tYnVpbGQuanNvbicpKTtcbiAgICAgIGV4cGVjdChidWlsZGVyLmlzRWxpZ2libGUoKSkudG9FcXVhbCh0cnVlKTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIGZpbmQgY3NvbiBmaWxlIGluIGhvbWUgZGlyZWN0b3J5JywgKCkgPT4ge1xuICAgICAgZnMud3JpdGVGaWxlU3luYyhkaXJlY3RvcnkgKyAnLy5hdG9tLWJ1aWxkLmNzb24nLCBmcy5yZWFkRmlsZVN5bmMoX19kaXJuYW1lICsgJy9maXh0dXJlLy5hdG9tLWJ1aWxkLmNzb24nKSk7XG4gICAgICBleHBlY3QoYnVpbGRlci5pc0VsaWdpYmxlKCkpLnRvRXF1YWwodHJ1ZSk7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCBmaW5kIHltbCBmaWxlIGluIGhvbWUgZGlyZWN0b3J5JywgKCkgPT4ge1xuICAgICAgZnMud3JpdGVGaWxlU3luYyhkaXJlY3RvcnkgKyAnLy5hdG9tLWJ1aWxkLnltbCcsIGZzLnJlYWRGaWxlU3luYyhfX2Rpcm5hbWUgKyAnL2ZpeHR1cmUvLmF0b20tYnVpbGQueW1sJykpO1xuICAgICAgZXhwZWN0KGJ1aWxkZXIuaXNFbGlnaWJsZSgpKS50b0VxdWFsKHRydWUpO1xuICAgIH0pO1xuICB9KTtcblxuICBkZXNjcmliZSgnd2hlbiAuYXRvbS1idWlsZC5jc29uIGV4aXN0cycsICgpID0+IHtcbiAgICBpdCgnaXQgc2hvdWxkIHByb3ZpZGUgdGFyZ2V0cycsICgpID0+IHtcbiAgICAgIGZzLndyaXRlRmlsZVN5bmMoZGlyZWN0b3J5ICsgJy5hdG9tLWJ1aWxkLmNzb24nLCBmcy5yZWFkRmlsZVN5bmMoX19kaXJuYW1lICsgJy9maXh0dXJlLy5hdG9tLWJ1aWxkLmNzb24nKSk7XG4gICAgICBleHBlY3QoYnVpbGRlci5pc0VsaWdpYmxlKCkpLnRvRXF1YWwodHJ1ZSk7XG5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoYnVpbGRlci5zZXR0aW5ncygpKS50aGVuKHNldHRpbmdzID0+IHtcbiAgICAgICAgICBjb25zdCBzID0gc2V0dGluZ3NbMF07XG4gICAgICAgICAgZXhwZWN0KHMuZXhlYykudG9FcXVhbCgnZWNobycpO1xuICAgICAgICAgIGV4cGVjdChzLmFyZ3MpLnRvRXF1YWwoWyAnYXJnMScsICdhcmcyJyBdKTtcbiAgICAgICAgICBleHBlY3Qocy5uYW1lKS50b0VxdWFsKCdDdXN0b206IENvbXBvc2UgbWFzdGVycGllY2UnKTtcbiAgICAgICAgICBleHBlY3Qocy5zaCkudG9FcXVhbChmYWxzZSk7XG4gICAgICAgICAgZXhwZWN0KHMuY3dkKS50b0VxdWFsKCcvc29tZS9kaXJlY3RvcnknKTtcbiAgICAgICAgICBleHBlY3Qocy5lcnJvck1hdGNoKS50b0VxdWFsKCcoPzxmaWxlPlxcXFx3Ky5qcyk6KD88cm93PlxcXFxkKyknKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ3doZW4gLmF0b20tYnVpbGQuanNvbiBleGlzdHMnLCAoKSA9PiB7XG4gICAgaXQoJ2l0IHNob3VsZCBwcm92aWRlIHRhcmdldHMnLCAoKSA9PiB7XG4gICAgICBmcy53cml0ZUZpbGVTeW5jKGAke2RpcmVjdG9yeX0uYXRvbS1idWlsZC5qc29uYCwgZnMucmVhZEZpbGVTeW5jKGAke19fZGlybmFtZX0vZml4dHVyZS8uYXRvbS1idWlsZC5qc29uYCkpO1xuICAgICAgZXhwZWN0KGJ1aWxkZXIuaXNFbGlnaWJsZSgpKS50b0VxdWFsKHRydWUpO1xuXG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4ge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGJ1aWxkZXIuc2V0dGluZ3MoKSkudGhlbihzZXR0aW5ncyA9PiB7XG4gICAgICAgICAgY29uc3QgcyA9IHNldHRpbmdzWzBdO1xuICAgICAgICAgIGV4cGVjdChzLmV4ZWMpLnRvRXF1YWwoJ2RkJyk7XG4gICAgICAgICAgZXhwZWN0KHMuYXJncykudG9FcXVhbChbICdpZj0uYXRvbS1idWlsZC5qc29uJyBdKTtcbiAgICAgICAgICBleHBlY3Qocy5uYW1lKS50b0VxdWFsKCdDdXN0b206IEZseSB0byBtb29uJyk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCd3aGVuIC5hdG9tLWJ1aWxkLnltbCBleGlzdHMnLCAoKSA9PiB7XG4gICAgaXQoJ2l0IHNob3VsZCBwcm92aWRlIHRhcmdldHMnLCAoKSA9PiB7XG4gICAgICBmcy53cml0ZUZpbGVTeW5jKGAke2RpcmVjdG9yeX0uYXRvbS1idWlsZC55bWxgLCBmcy5yZWFkRmlsZVN5bmMoYCR7X19kaXJuYW1lfS9maXh0dXJlLy5hdG9tLWJ1aWxkLnltbGApKTtcbiAgICAgIGV4cGVjdChidWlsZGVyLmlzRWxpZ2libGUoKSkudG9FcXVhbCh0cnVlKTtcblxuICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShidWlsZGVyLnNldHRpbmdzKCkpLnRoZW4oc2V0dGluZ3MgPT4ge1xuICAgICAgICAgIGNvbnN0IHMgPSBzZXR0aW5nc1swXTtcbiAgICAgICAgICBleHBlY3Qocy5leGVjKS50b0VxdWFsKCdlY2hvJyk7XG4gICAgICAgICAgZXhwZWN0KHMuYXJncykudG9FcXVhbChbICdoZWxsbycsICd3b3JsZCcsICdmcm9tJywgJ3lhbWwnIF0pO1xuICAgICAgICAgIGV4cGVjdChzLm5hbWUpLnRvRXF1YWwoJ0N1c3RvbTogeWFtbCBjb25mJyk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCd3aGVuIC5hdG9tLWJ1aWxkLmpzIGV4aXN0cycsICgpID0+IHtcbiAgICBpdCgnaXQgc2hvdWxkIHByb3ZpZGUgdGFyZ2V0cycsICgpID0+IHtcbiAgICAgIGZzLndyaXRlRmlsZVN5bmMoYCR7ZGlyZWN0b3J5fS5hdG9tLWJ1aWxkLmpzYCwgZnMucmVhZEZpbGVTeW5jKGAke19fZGlybmFtZX0vZml4dHVyZS8uYXRvbS1idWlsZC5qc2ApKTtcbiAgICAgIGV4cGVjdChidWlsZGVyLmlzRWxpZ2libGUoKSkudG9FcXVhbCh0cnVlKTtcblxuICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShidWlsZGVyLnNldHRpbmdzKCkpLnRoZW4oc2V0dGluZ3MgPT4ge1xuICAgICAgICAgIGNvbnN0IHMgPSBzZXR0aW5nc1swXTtcbiAgICAgICAgICBleHBlY3Qocy5leGVjKS50b0VxdWFsKCdlY2hvJyk7XG4gICAgICAgICAgZXhwZWN0KHMuYXJncykudG9FcXVhbChbICdoZWxsbycsICd3b3JsZCcsICdmcm9tJywgJ2pzJyBdKTtcbiAgICAgICAgICBleHBlY3Qocy5uYW1lKS50b0VxdWFsKCdDdXN0b206IGZyb20ganMnKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG59KTtcbiJdfQ==
//# sourceURL=/home/takaaki/.atom/packages/build/spec/custom-provider-spec.js
