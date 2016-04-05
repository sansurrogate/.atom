Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.installPackages = installPackages;

var _atom = require('atom');

'use babel';

function installPackages(packageNames, callback, failedCallback) {
  var extractionRegex = /Installing (.*?) to .*? (.*)/;
  return new Promise(function (resolve, reject) {

    var errorContents = [];
    var parameters = ['install'].concat(packageNames);
    parameters.push('--production', '--color', 'false');

    new _atom.BufferedProcess({
      command: atom.packages.getApmPath(),
      args: parameters,
      options: {},
      stdout: function stdout(contents) {
        var matches = extractionRegex.exec(contents);
        if (matches[2] === '✓' || matches[2] === 'done') {
          callback(matches[1]);
        } else {
          errorContents.push("Error Installing " + matches[1] + "\n");
        }
      },
      stderr: function stderr(contents) {
        errorContents.push(contents);
      },
      exit: function exit() {
        if (errorContents.length) {
          errorContents = errorContents.join('');
          failedCallback(errorContents);
          return reject(new Error(errorContents));
        } else resolve();
      }
    });
  });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3Rha2Fha2kvLmF0b20vcGFja2FnZXMvbGludGVyLWdjYy9ub2RlX21vZHVsZXMvYXRvbS1wYWNrYWdlLWRlcHMvbGliL2hlbHBlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztvQkFFOEIsTUFBTTs7QUFGcEMsV0FBVyxDQUFBOztBQUlKLFNBQVMsZUFBZSxDQUFDLFlBQVksRUFBRSxRQUFRLEVBQUUsY0FBYyxFQUFFO0FBQ3RFLE1BQU0sZUFBZSxHQUFHLDhCQUE4QixDQUFBO0FBQ3RELFNBQU8sSUFBSSxPQUFPLENBQUMsVUFBUyxPQUFPLEVBQUUsTUFBTSxFQUFFOztBQUUzQyxRQUFJLGFBQWEsR0FBRyxFQUFFLENBQUE7QUFDdEIsUUFBTSxVQUFVLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUE7QUFDbkQsY0FBVSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFBOztBQUVuRCw4QkFBb0I7QUFDbEIsYUFBTyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFO0FBQ25DLFVBQUksRUFBRSxVQUFVO0FBQ2hCLGFBQU8sRUFBRSxFQUFFO0FBQ1gsWUFBTSxFQUFFLGdCQUFTLFFBQVEsRUFBRTtBQUN6QixZQUFNLE9BQU8sR0FBRyxlQUFlLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQzlDLFlBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssTUFBTSxFQUFFO0FBQy9DLGtCQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7U0FDckIsTUFBTTtBQUNMLHVCQUFhLENBQUMsSUFBSSxDQUFDLG1CQUFtQixHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQTtTQUM1RDtPQUNGO0FBQ0QsWUFBTSxFQUFFLGdCQUFTLFFBQVEsRUFBRTtBQUN6QixxQkFBYSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtPQUM3QjtBQUNELFVBQUksRUFBRSxnQkFBVztBQUNmLFlBQUksYUFBYSxDQUFDLE1BQU0sRUFBRTtBQUN4Qix1QkFBYSxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUE7QUFDdEMsd0JBQWMsQ0FBQyxhQUFhLENBQUMsQ0FBQTtBQUM3QixpQkFBTyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQTtTQUN4QyxNQUFNLE9BQU8sRUFBRSxDQUFBO09BQ2pCO0tBQ0YsQ0FBQyxDQUFBO0dBQ0gsQ0FBQyxDQUFBO0NBQ0giLCJmaWxlIjoiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9saW50ZXItZ2NjL25vZGVfbW9kdWxlcy9hdG9tLXBhY2thZ2UtZGVwcy9saWIvaGVscGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IHtCdWZmZXJlZFByb2Nlc3N9IGZyb20gJ2F0b20nXG5cbmV4cG9ydCBmdW5jdGlvbiBpbnN0YWxsUGFja2FnZXMocGFja2FnZU5hbWVzLCBjYWxsYmFjaywgZmFpbGVkQ2FsbGJhY2spIHtcbiAgY29uc3QgZXh0cmFjdGlvblJlZ2V4ID0gL0luc3RhbGxpbmcgKC4qPykgdG8gLio/ICguKikvXG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcblxuICAgIGxldCBlcnJvckNvbnRlbnRzID0gW11cbiAgICBjb25zdCBwYXJhbWV0ZXJzID0gWydpbnN0YWxsJ10uY29uY2F0KHBhY2thZ2VOYW1lcylcbiAgICBwYXJhbWV0ZXJzLnB1c2goJy0tcHJvZHVjdGlvbicsICctLWNvbG9yJywgJ2ZhbHNlJylcblxuICAgIG5ldyBCdWZmZXJlZFByb2Nlc3Moe1xuICAgICAgY29tbWFuZDogYXRvbS5wYWNrYWdlcy5nZXRBcG1QYXRoKCksXG4gICAgICBhcmdzOiBwYXJhbWV0ZXJzLFxuICAgICAgb3B0aW9uczoge30sXG4gICAgICBzdGRvdXQ6IGZ1bmN0aW9uKGNvbnRlbnRzKSB7XG4gICAgICAgIGNvbnN0IG1hdGNoZXMgPSBleHRyYWN0aW9uUmVnZXguZXhlYyhjb250ZW50cylcbiAgICAgICAgaWYgKG1hdGNoZXNbMl0gPT09ICfinJMnIHx8IG1hdGNoZXNbMl0gPT09ICdkb25lJykge1xuICAgICAgICAgIGNhbGxiYWNrKG1hdGNoZXNbMV0pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZXJyb3JDb250ZW50cy5wdXNoKFwiRXJyb3IgSW5zdGFsbGluZyBcIiArIG1hdGNoZXNbMV0gKyBcIlxcblwiKVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgc3RkZXJyOiBmdW5jdGlvbihjb250ZW50cykge1xuICAgICAgICBlcnJvckNvbnRlbnRzLnB1c2goY29udGVudHMpXG4gICAgICB9LFxuICAgICAgZXhpdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChlcnJvckNvbnRlbnRzLmxlbmd0aCkge1xuICAgICAgICAgIGVycm9yQ29udGVudHMgPSBlcnJvckNvbnRlbnRzLmpvaW4oJycpXG4gICAgICAgICAgZmFpbGVkQ2FsbGJhY2soZXJyb3JDb250ZW50cylcbiAgICAgICAgICByZXR1cm4gcmVqZWN0KG5ldyBFcnJvcihlcnJvckNvbnRlbnRzKSlcbiAgICAgICAgfSBlbHNlIHJlc29sdmUoKVxuICAgICAgfVxuICAgIH0pXG4gIH0pXG59XG4iXX0=
//# sourceURL=/home/takaaki/.atom/packages/linter-gcc/node_modules/atom-package-deps/lib/helper.js
