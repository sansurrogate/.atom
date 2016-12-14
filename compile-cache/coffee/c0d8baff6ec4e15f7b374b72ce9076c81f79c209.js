(function() {
  var OutputView, create, getView, view;

  OutputView = require('./views/output-view');

  view = null;

  getView = function() {
    if (view === null) {
      view = new OutputView;
      atom.workspace.addBottomPanel({
        item: view
      });
      view.hide();
    }
    return view;
  };

  create = function() {
    if (view != null) {
      view.reset();
    }
    return getView();
  };

  module.exports = {
    create: create,
    getView: getView
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvb3V0cHV0LXZpZXctbWFuYWdlci5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsaUNBQUE7O0FBQUEsRUFBQSxVQUFBLEdBQWEsT0FBQSxDQUFRLHFCQUFSLENBQWIsQ0FBQTs7QUFBQSxFQUVBLElBQUEsR0FBTyxJQUZQLENBQUE7O0FBQUEsRUFJQSxPQUFBLEdBQVUsU0FBQSxHQUFBO0FBQ1IsSUFBQSxJQUFHLElBQUEsS0FBUSxJQUFYO0FBQ0UsTUFBQSxJQUFBLEdBQU8sR0FBQSxDQUFBLFVBQVAsQ0FBQTtBQUFBLE1BQ0EsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFmLENBQThCO0FBQUEsUUFBQSxJQUFBLEVBQU0sSUFBTjtPQUE5QixDQURBLENBQUE7QUFBQSxNQUVBLElBQUksQ0FBQyxJQUFMLENBQUEsQ0FGQSxDQURGO0tBQUE7V0FJQSxLQUxRO0VBQUEsQ0FKVixDQUFBOztBQUFBLEVBV0EsTUFBQSxHQUFTLFNBQUEsR0FBQTs7TUFDUCxJQUFJLENBQUUsS0FBTixDQUFBO0tBQUE7V0FDQSxPQUFBLENBQUEsRUFGTztFQUFBLENBWFQsQ0FBQTs7QUFBQSxFQWVBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBQUEsSUFBQyxRQUFBLE1BQUQ7QUFBQSxJQUFTLFNBQUEsT0FBVDtHQWZqQixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/takaaki/.atom/packages/git-plus/lib/output-view-manager.coffee
