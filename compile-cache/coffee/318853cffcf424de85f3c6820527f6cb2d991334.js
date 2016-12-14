(function() {
  var Emitter;

  Emitter = require('atom').Emitter;

  module.exports = {
    openPath: function(path, callback) {
      var workspaceElement;
      workspaceElement = atom.views.getView(atom.workspace);
      jasmine.attachToDOM(workspaceElement);
      waitsForPromise(function() {
        return atom.workspace.open(path);
      });
      return runs(function() {
        return callback(atom.views.getView(atom.workspace.getActivePaneItem()));
      });
    },
    rowRangeFrom: function(marker) {
      return [marker.getTailBufferPosition().row, marker.getHeadBufferPosition().row];
    },
    pkgEmitter: function() {
      var emitter;
      emitter = new Emitter;
      return {
        onDidResolveConflict: function(callback) {
          return emitter.on('did-resolve-conflict', callback);
        },
        didResolveConflict: function(event) {
          return emitter.emit('did-resolve-conflict', event);
        },
        onDidResolveFile: function(callback) {
          return emitter.on('did-resolve-file', callback);
        },
        didResolveFile: function(event) {
          return emitter.emit('did-resolve-file', event);
        },
        onDidQuitConflictResolution: function(callback) {
          return emitter.on('did-quit-conflict-resolution', callback);
        },
        didQuitConflictResolution: function() {
          return emitter.emit('did-quit-conflict-resolution');
        },
        onDidCompleteConflictResolution: function(callback) {
          return emitter.on('did-complete-conflict-resolution', callback);
        },
        didCompleteConflictResolution: function() {
          return emitter.emit('did-complete-conflict-resolution');
        },
        dispose: function() {
          return emitter.dispose();
        }
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9tZXJnZS1jb25mbGljdHMvc3BlYy91dGlsLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxPQUFBOztBQUFBLEVBQUMsVUFBVyxPQUFBLENBQVEsTUFBUixFQUFYLE9BQUQsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLFFBQUEsRUFBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEdBQUE7QUFDUixVQUFBLGdCQUFBO0FBQUEsTUFBQSxnQkFBQSxHQUFtQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsSUFBSSxDQUFDLFNBQXhCLENBQW5CLENBQUE7QUFBQSxNQUNBLE9BQU8sQ0FBQyxXQUFSLENBQW9CLGdCQUFwQixDQURBLENBQUE7QUFBQSxNQUdBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2VBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLElBQXBCLEVBQUg7TUFBQSxDQUFoQixDQUhBLENBQUE7YUFLQSxJQUFBLENBQUssU0FBQSxHQUFBO2VBQ0gsUUFBQSxDQUFTLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixJQUFJLENBQUMsU0FBUyxDQUFDLGlCQUFmLENBQUEsQ0FBbkIsQ0FBVCxFQURHO01BQUEsQ0FBTCxFQU5RO0lBQUEsQ0FBVjtBQUFBLElBU0EsWUFBQSxFQUFjLFNBQUMsTUFBRCxHQUFBO2FBQ1osQ0FBQyxNQUFNLENBQUMscUJBQVAsQ0FBQSxDQUE4QixDQUFDLEdBQWhDLEVBQXFDLE1BQU0sQ0FBQyxxQkFBUCxDQUFBLENBQThCLENBQUMsR0FBcEUsRUFEWTtJQUFBLENBVGQ7QUFBQSxJQVlBLFVBQUEsRUFBWSxTQUFBLEdBQUE7QUFDVixVQUFBLE9BQUE7QUFBQSxNQUFBLE9BQUEsR0FBVSxHQUFBLENBQUEsT0FBVixDQUFBO0FBRUEsYUFBTztBQUFBLFFBQ0wsb0JBQUEsRUFBc0IsU0FBQyxRQUFELEdBQUE7aUJBQWMsT0FBTyxDQUFDLEVBQVIsQ0FBVyxzQkFBWCxFQUFtQyxRQUFuQyxFQUFkO1FBQUEsQ0FEakI7QUFBQSxRQUVMLGtCQUFBLEVBQW9CLFNBQUMsS0FBRCxHQUFBO2lCQUFXLE9BQU8sQ0FBQyxJQUFSLENBQWEsc0JBQWIsRUFBcUMsS0FBckMsRUFBWDtRQUFBLENBRmY7QUFBQSxRQUdMLGdCQUFBLEVBQWtCLFNBQUMsUUFBRCxHQUFBO2lCQUFjLE9BQU8sQ0FBQyxFQUFSLENBQVcsa0JBQVgsRUFBK0IsUUFBL0IsRUFBZDtRQUFBLENBSGI7QUFBQSxRQUlMLGNBQUEsRUFBZ0IsU0FBQyxLQUFELEdBQUE7aUJBQVcsT0FBTyxDQUFDLElBQVIsQ0FBYSxrQkFBYixFQUFpQyxLQUFqQyxFQUFYO1FBQUEsQ0FKWDtBQUFBLFFBS0wsMkJBQUEsRUFBNkIsU0FBQyxRQUFELEdBQUE7aUJBQWMsT0FBTyxDQUFDLEVBQVIsQ0FBVyw4QkFBWCxFQUEyQyxRQUEzQyxFQUFkO1FBQUEsQ0FMeEI7QUFBQSxRQU1MLHlCQUFBLEVBQTJCLFNBQUEsR0FBQTtpQkFBRyxPQUFPLENBQUMsSUFBUixDQUFhLDhCQUFiLEVBQUg7UUFBQSxDQU50QjtBQUFBLFFBT0wsK0JBQUEsRUFBaUMsU0FBQyxRQUFELEdBQUE7aUJBQWMsT0FBTyxDQUFDLEVBQVIsQ0FBVyxrQ0FBWCxFQUErQyxRQUEvQyxFQUFkO1FBQUEsQ0FQNUI7QUFBQSxRQVFMLDZCQUFBLEVBQStCLFNBQUEsR0FBQTtpQkFBRyxPQUFPLENBQUMsSUFBUixDQUFhLGtDQUFiLEVBQUg7UUFBQSxDQVIxQjtBQUFBLFFBU0wsT0FBQSxFQUFTLFNBQUEsR0FBQTtpQkFBRyxPQUFPLENBQUMsT0FBUixDQUFBLEVBQUg7UUFBQSxDQVRKO09BQVAsQ0FIVTtJQUFBLENBWlo7R0FIRixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/takaaki/.atom/packages/merge-conflicts/spec/util.coffee
