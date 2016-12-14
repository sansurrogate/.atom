(function() {
  var _, humanizeKeystroke;

  _ = require('underscore-plus');

  humanizeKeystroke = function(binding) {
    return _.humanizeKeystroke(binding.keystrokes);
  };

  module.exports = function(platform) {
    var cache, currentPlatformRegex, transform;
    if (platform == null) {
      platform = process.platform;
    }
    cache = {};
    currentPlatformRegex = new RegExp("\\.platform\\-" + platform + "([,:#\\s]|$)");
    transform = function(name, bindings) {
      if (bindings != null) {
        return bindings.every(function(binding) {
          if (currentPlatformRegex.test(binding.selector)) {
            return cache[name] = humanizeKeystroke(binding);
          }
        });
      }
    };
    return {
      get: function(commands) {
        var c, i, len;
        for (i = 0, len = commands.length; i < len; i++) {
          c = commands[i];
          if (!(c[0] in cache)) {
            transform(c[0], atom.keymaps.findKeyBindings({
              command: c[0]
            }));
          }
        }
        return cache;
      }
    };
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvY29tbWFuZC1rZXlzdHJva2UtaHVtYW5pemVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFFSixpQkFBQSxHQUFvQixTQUFDLE9BQUQ7V0FBYSxDQUFDLENBQUMsaUJBQUYsQ0FBb0IsT0FBTyxDQUFDLFVBQTVCO0VBQWI7O0VBRXBCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsUUFBRDtBQUNiLFFBQUE7O01BRGMsV0FBVyxPQUFPLENBQUM7O0lBQ2pDLEtBQUEsR0FBUTtJQUNSLG9CQUFBLEdBQTJCLElBQUEsTUFBQSxDQUFPLGdCQUFBLEdBQWtCLFFBQWxCLEdBQTRCLGNBQW5DO0lBRTNCLFNBQUEsR0FBWSxTQUFDLElBQUQsRUFBTyxRQUFQO01BQ1YsSUFBRyxnQkFBSDtlQUNFLFFBQVEsQ0FBQyxLQUFULENBQWUsU0FBQyxPQUFEO1VBQ2IsSUFBOEMsb0JBQW9CLENBQUMsSUFBckIsQ0FBMEIsT0FBTyxDQUFDLFFBQWxDLENBQTlDO21CQUFDLEtBQU0sQ0FBQSxJQUFBLENBQU4sR0FBYyxpQkFBQSxDQUFrQixPQUFsQixFQUFmOztRQURhLENBQWYsRUFERjs7SUFEVTtBQUtaLFdBQU87TUFDTCxHQUFBLEVBQUssU0FBQyxRQUFEO0FBQ0gsWUFBQTtBQUFBLGFBQUEsMENBQUE7O1VBQ0UsSUFBQSxDQUFBLENBQU8sQ0FBRSxDQUFBLENBQUEsQ0FBRixJQUFRLEtBQWYsQ0FBQTtZQUNFLFNBQUEsQ0FBVSxDQUFFLENBQUEsQ0FBQSxDQUFaLEVBQWdCLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBYixDQUE2QjtjQUFDLE9BQUEsRUFBUyxDQUFFLENBQUEsQ0FBQSxDQUFaO2FBQTdCLENBQWhCLEVBREY7O0FBREY7ZUFHQTtNQUpHLENBREE7O0VBVE07QUFKakIiLCJzb3VyY2VzQ29udGVudCI6WyJfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xuXG5odW1hbml6ZUtleXN0cm9rZSA9IChiaW5kaW5nKSAtPiBfLmh1bWFuaXplS2V5c3Ryb2tlKGJpbmRpbmcua2V5c3Ryb2tlcylcblxubW9kdWxlLmV4cG9ydHMgPSAocGxhdGZvcm0gPSBwcm9jZXNzLnBsYXRmb3JtKSAtPlxuICAgIGNhY2hlID0ge31cbiAgICBjdXJyZW50UGxhdGZvcm1SZWdleCA9IG5ldyBSZWdFeHAoXCJcXFxcLnBsYXRmb3JtXFxcXC0jeyBwbGF0Zm9ybSB9KFssOiNcXFxcc118JClcIilcblxuICAgIHRyYW5zZm9ybSA9IChuYW1lLCBiaW5kaW5ncykgLT5cbiAgICAgIGlmIGJpbmRpbmdzP1xuICAgICAgICBiaW5kaW5ncy5ldmVyeSAoYmluZGluZykgLT5cbiAgICAgICAgICAoY2FjaGVbbmFtZV0gPSBodW1hbml6ZUtleXN0cm9rZShiaW5kaW5nKSkgaWYgY3VycmVudFBsYXRmb3JtUmVnZXgudGVzdChiaW5kaW5nLnNlbGVjdG9yKVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGdldDogKGNvbW1hbmRzKSAtPlxuICAgICAgICBmb3IgYyBpbiBjb21tYW5kc1xuICAgICAgICAgIHVubGVzcyBjWzBdIG9mIGNhY2hlXG4gICAgICAgICAgICB0cmFuc2Zvcm0oY1swXSwgYXRvbS5rZXltYXBzLmZpbmRLZXlCaW5kaW5ncyB7Y29tbWFuZDogY1swXX0pXG4gICAgICAgIGNhY2hlXG4gICAgfVxuIl19
