(function() {
  var GitDiff, contextPackageFinder, notifier;

  contextPackageFinder = require('../../context-package-finder');

  notifier = require('../../notifier');

  GitDiff = require('../git-diff');

  module.exports = function(repo) {
    var file, path, ref;
    if (path = (ref = contextPackageFinder.get()) != null ? ref.selectedPath : void 0) {
      if (path === repo.getWorkingDirectory()) {
        file = path;
      } else {
        file = repo.relativize(path);
      }
      if (file === '') {
        file = void 0;
      }
      return GitDiff(repo, {
        file: file
      });
    } else {
      return notifier.addInfo("No file selected to diff");
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvbW9kZWxzL2NvbnRleHQvZ2l0LWRpZmYtY29udGV4dC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLG9CQUFBLEdBQXVCLE9BQUEsQ0FBUSw4QkFBUjs7RUFDdkIsUUFBQSxHQUFXLE9BQUEsQ0FBUSxnQkFBUjs7RUFDWCxPQUFBLEdBQVUsT0FBQSxDQUFRLGFBQVI7O0VBRVYsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxJQUFEO0FBQ2YsUUFBQTtJQUFBLElBQUcsSUFBQSxtREFBaUMsQ0FBRSxxQkFBdEM7TUFDRSxJQUFHLElBQUEsS0FBUSxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFYO1FBQ0UsSUFBQSxHQUFPLEtBRFQ7T0FBQSxNQUFBO1FBR0UsSUFBQSxHQUFPLElBQUksQ0FBQyxVQUFMLENBQWdCLElBQWhCLEVBSFQ7O01BSUEsSUFBb0IsSUFBQSxLQUFRLEVBQTVCO1FBQUEsSUFBQSxHQUFPLE9BQVA7O2FBQ0EsT0FBQSxDQUFRLElBQVIsRUFBYztRQUFDLE1BQUEsSUFBRDtPQUFkLEVBTkY7S0FBQSxNQUFBO2FBUUUsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsMEJBQWpCLEVBUkY7O0VBRGU7QUFKakIiLCJzb3VyY2VzQ29udGVudCI6WyJjb250ZXh0UGFja2FnZUZpbmRlciA9IHJlcXVpcmUgJy4uLy4uL2NvbnRleHQtcGFja2FnZS1maW5kZXInXG5ub3RpZmllciA9IHJlcXVpcmUgJy4uLy4uL25vdGlmaWVyJ1xuR2l0RGlmZiA9IHJlcXVpcmUgJy4uL2dpdC1kaWZmJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IChyZXBvKSAtPlxuICBpZiBwYXRoID0gY29udGV4dFBhY2thZ2VGaW5kZXIuZ2V0KCk/LnNlbGVjdGVkUGF0aFxuICAgIGlmIHBhdGggaXMgcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KClcbiAgICAgIGZpbGUgPSBwYXRoXG4gICAgZWxzZVxuICAgICAgZmlsZSA9IHJlcG8ucmVsYXRpdml6ZShwYXRoKVxuICAgIGZpbGUgPSB1bmRlZmluZWQgaWYgZmlsZSBpcyAnJ1xuICAgIEdpdERpZmYgcmVwbywge2ZpbGV9XG4gIGVsc2VcbiAgICBub3RpZmllci5hZGRJbmZvIFwiTm8gZmlsZSBzZWxlY3RlZCB0byBkaWZmXCJcbiJdfQ==
