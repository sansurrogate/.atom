(function() {
  var GitCommit, contextPackageFinder, git, notifier;

  contextPackageFinder = require('../../context-package-finder');

  git = require('../../git');

  notifier = require('../../notifier');

  GitCommit = require('../git-commit');

  module.exports = function(repo) {
    var file, path, ref;
    if (path = (ref = contextPackageFinder.get()) != null ? ref.selectedPath : void 0) {
      file = repo.relativize(path);
      if (file === '') {
        file = void 0;
      }
      return git.add(repo, {
        file: file
      }).then(function() {
        return GitCommit(repo);
      });
    } else {
      return notifier.addInfo("No file selected to add and commit");
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvbW9kZWxzL2NvbnRleHQvZ2l0LWFkZC1hbmQtY29tbWl0LWNvbnRleHQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxvQkFBQSxHQUF1QixPQUFBLENBQVEsOEJBQVI7O0VBQ3ZCLEdBQUEsR0FBTSxPQUFBLENBQVEsV0FBUjs7RUFDTixRQUFBLEdBQVcsT0FBQSxDQUFRLGdCQUFSOztFQUNYLFNBQUEsR0FBWSxPQUFBLENBQVEsZUFBUjs7RUFFWixNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLElBQUQ7QUFDZixRQUFBO0lBQUEsSUFBRyxJQUFBLG1EQUFpQyxDQUFFLHFCQUF0QztNQUNFLElBQUEsR0FBTyxJQUFJLENBQUMsVUFBTCxDQUFnQixJQUFoQjtNQUNQLElBQW9CLElBQUEsS0FBUSxFQUE1QjtRQUFBLElBQUEsR0FBTyxPQUFQOzthQUNBLEdBQUcsQ0FBQyxHQUFKLENBQVEsSUFBUixFQUFjO1FBQUMsTUFBQSxJQUFEO09BQWQsQ0FBcUIsQ0FBQyxJQUF0QixDQUEyQixTQUFBO2VBQUcsU0FBQSxDQUFVLElBQVY7TUFBSCxDQUEzQixFQUhGO0tBQUEsTUFBQTthQUtFLFFBQVEsQ0FBQyxPQUFULENBQWlCLG9DQUFqQixFQUxGOztFQURlO0FBTGpCIiwic291cmNlc0NvbnRlbnQiOlsiY29udGV4dFBhY2thZ2VGaW5kZXIgPSByZXF1aXJlICcuLi8uLi9jb250ZXh0LXBhY2thZ2UtZmluZGVyJ1xuZ2l0ID0gcmVxdWlyZSAnLi4vLi4vZ2l0J1xubm90aWZpZXIgPSByZXF1aXJlICcuLi8uLi9ub3RpZmllcidcbkdpdENvbW1pdCA9IHJlcXVpcmUgJy4uL2dpdC1jb21taXQnXG5cbm1vZHVsZS5leHBvcnRzID0gKHJlcG8pIC0+XG4gIGlmIHBhdGggPSBjb250ZXh0UGFja2FnZUZpbmRlci5nZXQoKT8uc2VsZWN0ZWRQYXRoXG4gICAgZmlsZSA9IHJlcG8ucmVsYXRpdml6ZShwYXRoKVxuICAgIGZpbGUgPSB1bmRlZmluZWQgaWYgZmlsZSBpcyAnJ1xuICAgIGdpdC5hZGQocmVwbywge2ZpbGV9KS50aGVuIC0+IEdpdENvbW1pdChyZXBvKVxuICBlbHNlXG4gICAgbm90aWZpZXIuYWRkSW5mbyBcIk5vIGZpbGUgc2VsZWN0ZWQgdG8gYWRkIGFuZCBjb21taXRcIlxuIl19
