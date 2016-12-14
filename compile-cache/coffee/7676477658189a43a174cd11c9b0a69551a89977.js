(function() {
  var contextPackageFinder, git, notifier;

  contextPackageFinder = require('../../context-package-finder');

  git = require('../../git');

  notifier = require('../../notifier');

  module.exports = function(repo) {
    var file, path, ref;
    if (path = (ref = contextPackageFinder.get()) != null ? ref.selectedPath : void 0) {
      file = repo.relativize(path);
      if (file === '') {
        file = void 0;
      }
      return git.add(repo, {
        file: file
      });
    } else {
      return notifier.addInfo("No file selected to add");
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvbW9kZWxzL2NvbnRleHQvZ2l0LWFkZC1jb250ZXh0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsb0JBQUEsR0FBdUIsT0FBQSxDQUFRLDhCQUFSOztFQUN2QixHQUFBLEdBQU0sT0FBQSxDQUFRLFdBQVI7O0VBQ04sUUFBQSxHQUFXLE9BQUEsQ0FBUSxnQkFBUjs7RUFFWCxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLElBQUQ7QUFDZixRQUFBO0lBQUEsSUFBRyxJQUFBLG1EQUFpQyxDQUFFLHFCQUF0QztNQUNFLElBQUEsR0FBTyxJQUFJLENBQUMsVUFBTCxDQUFnQixJQUFoQjtNQUNQLElBQW9CLElBQUEsS0FBUSxFQUE1QjtRQUFBLElBQUEsR0FBTyxPQUFQOzthQUNBLEdBQUcsQ0FBQyxHQUFKLENBQVEsSUFBUixFQUFjO1FBQUMsTUFBQSxJQUFEO09BQWQsRUFIRjtLQUFBLE1BQUE7YUFLRSxRQUFRLENBQUMsT0FBVCxDQUFpQix5QkFBakIsRUFMRjs7RUFEZTtBQUpqQiIsInNvdXJjZXNDb250ZW50IjpbImNvbnRleHRQYWNrYWdlRmluZGVyID0gcmVxdWlyZSAnLi4vLi4vY29udGV4dC1wYWNrYWdlLWZpbmRlcidcbmdpdCA9IHJlcXVpcmUgJy4uLy4uL2dpdCdcbm5vdGlmaWVyID0gcmVxdWlyZSAnLi4vLi4vbm90aWZpZXInXG5cbm1vZHVsZS5leHBvcnRzID0gKHJlcG8pIC0+XG4gIGlmIHBhdGggPSBjb250ZXh0UGFja2FnZUZpbmRlci5nZXQoKT8uc2VsZWN0ZWRQYXRoXG4gICAgZmlsZSA9IHJlcG8ucmVsYXRpdml6ZShwYXRoKVxuICAgIGZpbGUgPSB1bmRlZmluZWQgaWYgZmlsZSBpcyAnJ1xuICAgIGdpdC5hZGQgcmVwbywge2ZpbGV9XG4gIGVsc2VcbiAgICBub3RpZmllci5hZGRJbmZvIFwiTm8gZmlsZSBzZWxlY3RlZCB0byBhZGRcIlxuIl19
