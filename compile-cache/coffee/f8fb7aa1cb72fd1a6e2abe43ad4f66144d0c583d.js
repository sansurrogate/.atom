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
        file = '.';
      }
      return git.cmd(['reset', 'HEAD', '--', file], {
        cwd: repo.getWorkingDirectory()
      }).then(notifier.addSuccess)["catch"](notifier.addError);
    } else {
      return notifier.addInfo("No file selected to unstage");
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvbW9kZWxzL2NvbnRleHQvZ2l0LXVuc3RhZ2UtZmlsZS1jb250ZXh0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsb0JBQUEsR0FBdUIsT0FBQSxDQUFRLDhCQUFSOztFQUN2QixHQUFBLEdBQU0sT0FBQSxDQUFRLFdBQVI7O0VBQ04sUUFBQSxHQUFXLE9BQUEsQ0FBUSxnQkFBUjs7RUFFWCxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLElBQUQ7QUFDZixRQUFBO0lBQUEsSUFBRyxJQUFBLG1EQUFpQyxDQUFFLHFCQUF0QztNQUNFLElBQUEsR0FBTyxJQUFJLENBQUMsVUFBTCxDQUFnQixJQUFoQjtNQUNQLElBQWMsSUFBQSxLQUFRLEVBQXRCO1FBQUEsSUFBQSxHQUFPLElBQVA7O2FBQ0EsR0FBRyxDQUFDLEdBQUosQ0FBUSxDQUFDLE9BQUQsRUFBVSxNQUFWLEVBQWtCLElBQWxCLEVBQXdCLElBQXhCLENBQVIsRUFBdUM7UUFBQSxHQUFBLEVBQUssSUFBSSxDQUFDLG1CQUFMLENBQUEsQ0FBTDtPQUF2QyxDQUNBLENBQUMsSUFERCxDQUNNLFFBQVEsQ0FBQyxVQURmLENBRUEsRUFBQyxLQUFELEVBRkEsQ0FFTyxRQUFRLENBQUMsUUFGaEIsRUFIRjtLQUFBLE1BQUE7YUFPRSxRQUFRLENBQUMsT0FBVCxDQUFpQiw2QkFBakIsRUFQRjs7RUFEZTtBQUpqQiIsInNvdXJjZXNDb250ZW50IjpbImNvbnRleHRQYWNrYWdlRmluZGVyID0gcmVxdWlyZSAnLi4vLi4vY29udGV4dC1wYWNrYWdlLWZpbmRlcidcbmdpdCA9IHJlcXVpcmUgJy4uLy4uL2dpdCdcbm5vdGlmaWVyID0gcmVxdWlyZSAnLi4vLi4vbm90aWZpZXInXG5cbm1vZHVsZS5leHBvcnRzID0gKHJlcG8pIC0+XG4gIGlmIHBhdGggPSBjb250ZXh0UGFja2FnZUZpbmRlci5nZXQoKT8uc2VsZWN0ZWRQYXRoXG4gICAgZmlsZSA9IHJlcG8ucmVsYXRpdml6ZShwYXRoKVxuICAgIGZpbGUgPSAnLicgaWYgZmlsZSBpcyAnJ1xuICAgIGdpdC5jbWQoWydyZXNldCcsICdIRUFEJywgJy0tJywgZmlsZV0sIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCkpXG4gICAgLnRoZW4obm90aWZpZXIuYWRkU3VjY2VzcylcbiAgICAuY2F0Y2gobm90aWZpZXIuYWRkRXJyb3IpXG4gIGVsc2VcbiAgICBub3RpZmllci5hZGRJbmZvIFwiTm8gZmlsZSBzZWxlY3RlZCB0byB1bnN0YWdlXCJcbiJdfQ==
