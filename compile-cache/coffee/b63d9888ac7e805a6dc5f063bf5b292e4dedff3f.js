(function() {
  var MinimapAutohide;

  MinimapAutohide = require('../lib/minimap-autohide');

  describe("MinimapAutohide", function() {
    var editor, workspaceElement, _ref;
    _ref = [], workspaceElement = _ref[0], editor = _ref[1];
    beforeEach(function() {
      workspaceElement = atom.views.getView(atom.workspace);
      jasmine.attachToDOM(workspaceElement);
      waitsForPromise(function() {
        return atom.workspace.open('sample.js');
      });
      runs(function() {
        editor = atom.workspace.getActiveTextEditor();
        return editor.setText("This is the file content");
      });
      waitsForPromise(function() {
        return atom.packages.activatePackage('minimap');
      });
      return waitsForPromise(function() {
        return atom.packages.activatePackage('minimap-autohide');
      });
    });
    return describe("with an open editor that have a minimap", function() {
      return it("lives", function() {
        return expect('life').toBe('easy');
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9taW5pbWFwLWF1dG9oaWRlL3NwZWMvbWluaW1hcC1hdXRvaGlkZS1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxlQUFBOztBQUFBLEVBQUEsZUFBQSxHQUFrQixPQUFBLENBQVEseUJBQVIsQ0FBbEIsQ0FBQTs7QUFBQSxFQU9BLFFBQUEsQ0FBUyxpQkFBVCxFQUE0QixTQUFBLEdBQUE7QUFDMUIsUUFBQSw4QkFBQTtBQUFBLElBQUEsT0FBNkIsRUFBN0IsRUFBQywwQkFBRCxFQUFtQixnQkFBbkIsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsZ0JBQUEsR0FBbUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQUksQ0FBQyxTQUF4QixDQUFuQixDQUFBO0FBQUEsTUFDQSxPQUFPLENBQUMsV0FBUixDQUFvQixnQkFBcEIsQ0FEQSxDQUFBO0FBQUEsTUFHQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtlQUNkLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFvQixXQUFwQixFQURjO01BQUEsQ0FBaEIsQ0FIQSxDQUFBO0FBQUEsTUFNQSxJQUFBLENBQUssU0FBQSxHQUFBO0FBQ0gsUUFBQSxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBLENBQVQsQ0FBQTtlQUNBLE1BQU0sQ0FBQyxPQUFQLENBQWUsMEJBQWYsRUFGRztNQUFBLENBQUwsQ0FOQSxDQUFBO0FBQUEsTUFVQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtlQUNkLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixTQUE5QixFQURjO01BQUEsQ0FBaEIsQ0FWQSxDQUFBO2FBYUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsa0JBQTlCLEVBRGM7TUFBQSxDQUFoQixFQWRTO0lBQUEsQ0FBWCxDQUZBLENBQUE7V0FtQkEsUUFBQSxDQUFTLHlDQUFULEVBQW9ELFNBQUEsR0FBQTthQUNsRCxFQUFBLENBQUcsT0FBSCxFQUFZLFNBQUEsR0FBQTtlQUNWLE1BQUEsQ0FBTyxNQUFQLENBQWMsQ0FBQyxJQUFmLENBQW9CLE1BQXBCLEVBRFU7TUFBQSxDQUFaLEVBRGtEO0lBQUEsQ0FBcEQsRUFwQjBCO0VBQUEsQ0FBNUIsQ0FQQSxDQUFBO0FBQUEiCn0=

//# sourceURL=/home/takaaki/.atom/packages/minimap-autohide/spec/minimap-autohide-spec.coffee
