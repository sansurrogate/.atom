'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var isWin = process.platform === 'win32';
exports.isWin = isWin;
var sleep = function sleep(duration) {
  return isWin ? 'ping 127.0.0.1 -n ' + duration + ' > NUL' : 'sleep ' + duration;
};
exports.sleep = sleep;
var cat = function cat() {
  return isWin ? 'type' : 'cat';
};
exports.cat = cat;
var shellCmd = isWin ? 'cmd /C' : '/bin/sh -c';
exports.shellCmd = shellCmd;
var waitTime = process.env.CI ? 2400 : 200;
exports.waitTime = waitTime;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvYnVpbGQvc3BlYy9oZWxwZXJzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQzs7Ozs7QUFFTCxJQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsUUFBUSxLQUFLLE9BQU8sQ0FBQzs7QUFDM0MsSUFBTSxLQUFLLEdBQUcsU0FBUixLQUFLLENBQUksUUFBUTtTQUFLLEtBQUssMEJBQXdCLFFBQVEseUJBQW9CLFFBQVEsQUFBRTtDQUFBLENBQUM7O0FBQ2hHLElBQU0sR0FBRyxHQUFHLFNBQU4sR0FBRztTQUFTLEtBQUssR0FBRyxNQUFNLEdBQUcsS0FBSztDQUFBLENBQUM7O0FBQ3pDLElBQU0sUUFBUSxHQUFHLEtBQUssR0FBRyxRQUFRLEdBQUcsWUFBWSxDQUFDOztBQUNqRCxJQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxJQUFJLEdBQUcsR0FBRyxDQUFDIiwiZmlsZSI6Ii9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvYnVpbGQvc3BlYy9oZWxwZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmV4cG9ydCBjb25zdCBpc1dpbiA9IHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMic7XG5leHBvcnQgY29uc3Qgc2xlZXAgPSAoZHVyYXRpb24pID0+IGlzV2luID8gYHBpbmcgMTI3LjAuMC4xIC1uICR7ZHVyYXRpb259ID4gTlVMYCA6IGBzbGVlcCAke2R1cmF0aW9ufWA7XG5leHBvcnQgY29uc3QgY2F0ID0gKCkgPT4gaXNXaW4gPyAndHlwZScgOiAnY2F0JztcbmV4cG9ydCBjb25zdCBzaGVsbENtZCA9IGlzV2luID8gJ2NtZCAvQycgOiAnL2Jpbi9zaCAtYyc7XG5leHBvcnQgY29uc3Qgd2FpdFRpbWUgPSBwcm9jZXNzLmVudi5DSSA/IDI0MDAgOiAyMDA7XG4iXX0=
//# sourceURL=/home/takaaki/.atom/packages/build/spec/helpers.js
