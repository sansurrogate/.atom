(function() {
  module.exports = {
    get: function() {
      var sublimeTabs, treeView;
      if (atom.packages.isPackageLoaded('tree-view')) {
        treeView = atom.packages.getLoadedPackage('tree-view');
        treeView = require(treeView.mainModulePath);
        return treeView.serialize();
      } else if (atom.packages.isPackageLoaded('sublime-tabs')) {
        sublimeTabs = atom.packages.getLoadedPackage('sublime-tabs');
        sublimeTabs = require(sublimeTabs.mainModulePath);
        return sublimeTabs.serialize();
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvY29udGV4dC1wYWNrYWdlLWZpbmRlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLEVBQUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsR0FBQSxFQUFLLFNBQUEsR0FBQTtBQUNILFVBQUEscUJBQUE7QUFBQSxNQUFBLElBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLFdBQTlCLENBQUg7QUFDRSxRQUFBLFFBQUEsR0FBVyxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFkLENBQStCLFdBQS9CLENBQVgsQ0FBQTtBQUFBLFFBQ0EsUUFBQSxHQUFXLE9BQUEsQ0FBUSxRQUFRLENBQUMsY0FBakIsQ0FEWCxDQUFBO2VBRUEsUUFBUSxDQUFDLFNBQVQsQ0FBQSxFQUhGO09BQUEsTUFJSyxJQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixjQUE5QixDQUFIO0FBQ0gsUUFBQSxXQUFBLEdBQWMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZCxDQUErQixjQUEvQixDQUFkLENBQUE7QUFBQSxRQUNBLFdBQUEsR0FBYyxPQUFBLENBQVEsV0FBVyxDQUFDLGNBQXBCLENBRGQsQ0FBQTtlQUVBLFdBQVcsQ0FBQyxTQUFaLENBQUEsRUFIRztPQUxGO0lBQUEsQ0FBTDtHQURGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/takaaki/.atom/packages/git-plus/lib/context-package-finder.coffee
