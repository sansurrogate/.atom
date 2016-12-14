(function() {
  var CompositeDisposable;

  CompositeDisposable = require('event-kit').CompositeDisposable;

  module.exports = {
    active: false,
    isActive: function() {
      return this.active;
    },
    activate: function(state) {
      return this.subscriptions = new CompositeDisposable;
    },
    consumeMinimapServiceV1: function(minimap) {
      this.minimap = minimap;
      return this.minimap.registerPlugin('minimap-autohide', this);
    },
    deactivate: function() {
      this.minimap.unregisterPlugin('minimap-autohide');
      return this.minimap = null;
    },
    activatePlugin: function() {
      if (this.active) {
        return;
      }
      this.active = true;
      return this.minimapsSubscription = this.minimap.observeMinimaps((function(_this) {
        return function(minimap) {
          var editor, minimapElement;
          minimapElement = atom.views.getView(minimap);
          editor = minimap.getTextEditor();
          return _this.subscriptions.add(editor.onDidChangeScrollTop(function() {
            return _this.handleScroll(minimapElement);
          }));
        };
      })(this));
    },
    handleScroll: function(el) {
      el.classList.add('scrolling');
      if (el.timer) {
        clearTimeout(el.timer);
      }
      return el.timer = setTimeout((function() {
        return el.classList.remove('scrolling');
      }), 1500);
    },
    deactivatePlugin: function() {
      if (!this.active) {
        return;
      }
      this.active = false;
      this.minimapsSubscription.dispose();
      return this.subscriptions.dispose();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9taW5pbWFwLWF1dG9oaWRlL2xpYi9taW5pbWFwLWF1dG9oaWRlLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxtQkFBQTs7QUFBQSxFQUFDLHNCQUF1QixPQUFBLENBQVEsV0FBUixFQUF2QixtQkFBRCxDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsTUFBQSxFQUFRLEtBQVI7QUFBQSxJQUVBLFFBQUEsRUFBVSxTQUFBLEdBQUE7YUFBRyxJQUFDLENBQUEsT0FBSjtJQUFBLENBRlY7QUFBQSxJQUlBLFFBQUEsRUFBVSxTQUFDLEtBQUQsR0FBQTthQUNSLElBQUMsQ0FBQSxhQUFELEdBQWlCLEdBQUEsQ0FBQSxvQkFEVDtJQUFBLENBSlY7QUFBQSxJQU9BLHVCQUFBLEVBQXlCLFNBQUUsT0FBRixHQUFBO0FBQ3ZCLE1BRHdCLElBQUMsQ0FBQSxVQUFBLE9BQ3pCLENBQUE7YUFBQSxJQUFDLENBQUEsT0FBTyxDQUFDLGNBQVQsQ0FBd0Isa0JBQXhCLEVBQTRDLElBQTVDLEVBRHVCO0lBQUEsQ0FQekI7QUFBQSxJQVVBLFVBQUEsRUFBWSxTQUFBLEdBQUE7QUFDVixNQUFBLElBQUMsQ0FBQSxPQUFPLENBQUMsZ0JBQVQsQ0FBMEIsa0JBQTFCLENBQUEsQ0FBQTthQUNBLElBQUMsQ0FBQSxPQUFELEdBQVcsS0FGRDtJQUFBLENBVlo7QUFBQSxJQWNBLGNBQUEsRUFBZ0IsU0FBQSxHQUFBO0FBQ2QsTUFBQSxJQUFVLElBQUMsQ0FBQSxNQUFYO0FBQUEsY0FBQSxDQUFBO09BQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFGVixDQUFBO2FBSUEsSUFBQyxDQUFBLG9CQUFELEdBQXdCLElBQUMsQ0FBQSxPQUFPLENBQUMsZUFBVCxDQUF5QixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxPQUFELEdBQUE7QUFDL0MsY0FBQSxzQkFBQTtBQUFBLFVBQUEsY0FBQSxHQUFpQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsT0FBbkIsQ0FBakIsQ0FBQTtBQUFBLFVBQ0EsTUFBQSxHQUFRLE9BQU8sQ0FBQyxhQUFSLENBQUEsQ0FEUixDQUFBO2lCQUVBLEtBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixNQUFNLENBQUMsb0JBQVAsQ0FBNEIsU0FBQSxHQUFBO21CQUM3QyxLQUFDLENBQUEsWUFBRCxDQUFjLGNBQWQsRUFENkM7VUFBQSxDQUE1QixDQUFuQixFQUgrQztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXpCLEVBTFY7SUFBQSxDQWRoQjtBQUFBLElBeUJBLFlBQUEsRUFBYyxTQUFDLEVBQUQsR0FBQTtBQUNaLE1BQUEsRUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFiLENBQWlCLFdBQWpCLENBQUEsQ0FBQTtBQUVBLE1BQUEsSUFBRyxFQUFFLENBQUMsS0FBTjtBQUNFLFFBQUEsWUFBQSxDQUFhLEVBQUUsQ0FBQyxLQUFoQixDQUFBLENBREY7T0FGQTthQUtBLEVBQUUsQ0FBQyxLQUFILEdBQVcsVUFBQSxDQUFXLENBQUUsU0FBQSxHQUFBO2VBQ3RCLEVBQUUsQ0FBQyxTQUFTLENBQUMsTUFBYixDQUFvQixXQUFwQixFQURzQjtNQUFBLENBQUYsQ0FBWCxFQUVSLElBRlEsRUFOQztJQUFBLENBekJkO0FBQUEsSUFtQ0EsZ0JBQUEsRUFBa0IsU0FBQSxHQUFBO0FBQ2hCLE1BQUEsSUFBQSxDQUFBLElBQWUsQ0FBQSxNQUFmO0FBQUEsY0FBQSxDQUFBO09BQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxNQUFELEdBQVUsS0FGVixDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsb0JBQW9CLENBQUMsT0FBdEIsQ0FBQSxDQUhBLENBQUE7YUFJQSxJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBQSxFQUxnQjtJQUFBLENBbkNsQjtHQUhGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/takaaki/.atom/packages/minimap-autohide/lib/minimap-autohide.coffee
