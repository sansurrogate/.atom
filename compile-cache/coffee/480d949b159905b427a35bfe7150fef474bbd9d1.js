(function() {
  module.exports = {
    config: {
      distractionFree: {
        type: 'object',
        properties: {
          hideFiles: {
            title: 'Tree View',
            description: 'Reduces the opacity of collapsed folders and files',
            type: 'boolean',
            "default": true
          },
          hideTabs: {
            title: 'Tabs',
            description: 'Reduces the opacity of idle tabs',
            type: 'boolean',
            "default": true
          },
          hideBottom: {
            title: 'Status Bar',
            description: 'Reduces the opacity of idle status bar',
            type: 'boolean',
            "default": true
          },
          hideSpotified: {
            title: 'Spotified Package',
            description: 'Reduces the opacity of Spotified package',
            type: 'boolean',
            "default": false
          }
        }
      }
    },
    activate: function(state) {
      return atom.themes.onDidChangeActiveThemes(function() {
        var Config;
        Config = require('./config');
        return Config.apply();
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9nZW5lc2lzLXVpL2xpYi9zZXR0aW5ncy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLEVBQUEsTUFBTSxDQUFDLE9BQVAsR0FDSTtBQUFBLElBQUEsTUFBQSxFQUNJO0FBQUEsTUFBQSxlQUFBLEVBQ0k7QUFBQSxRQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsUUFDQSxVQUFBLEVBQ0k7QUFBQSxVQUFBLFNBQUEsRUFDSTtBQUFBLFlBQUEsS0FBQSxFQUFPLFdBQVA7QUFBQSxZQUNBLFdBQUEsRUFBYSxvREFEYjtBQUFBLFlBRUEsSUFBQSxFQUFNLFNBRk47QUFBQSxZQUdBLFNBQUEsRUFBUyxJQUhUO1dBREo7QUFBQSxVQUtBLFFBQUEsRUFDSTtBQUFBLFlBQUEsS0FBQSxFQUFPLE1BQVA7QUFBQSxZQUNBLFdBQUEsRUFBYSxrQ0FEYjtBQUFBLFlBRUEsSUFBQSxFQUFNLFNBRk47QUFBQSxZQUdBLFNBQUEsRUFBUyxJQUhUO1dBTko7QUFBQSxVQVVBLFVBQUEsRUFDSTtBQUFBLFlBQUEsS0FBQSxFQUFPLFlBQVA7QUFBQSxZQUNBLFdBQUEsRUFBYSx3Q0FEYjtBQUFBLFlBRUEsSUFBQSxFQUFNLFNBRk47QUFBQSxZQUdBLFNBQUEsRUFBUyxJQUhUO1dBWEo7QUFBQSxVQWVBLGFBQUEsRUFDSTtBQUFBLFlBQUEsS0FBQSxFQUFPLG1CQUFQO0FBQUEsWUFDQSxXQUFBLEVBQWEsMENBRGI7QUFBQSxZQUVBLElBQUEsRUFBTSxTQUZOO0FBQUEsWUFHQSxTQUFBLEVBQVMsS0FIVDtXQWhCSjtTQUZKO09BREo7S0FESjtBQUFBLElBeUJBLFFBQUEsRUFBVSxTQUFDLEtBQUQsR0FBQTthQUNOLElBQUksQ0FBQyxNQUFNLENBQUMsdUJBQVosQ0FBb0MsU0FBQSxHQUFBO0FBQ2hDLFlBQUEsTUFBQTtBQUFBLFFBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSLENBQVQsQ0FBQTtlQUNBLE1BQU0sQ0FBQyxLQUFQLENBQUEsRUFGZ0M7TUFBQSxDQUFwQyxFQURNO0lBQUEsQ0F6QlY7R0FESixDQUFBO0FBQUEiCn0=

//# sourceURL=/home/takaaki/.atom/packages/genesis-ui/lib/settings.coffee
