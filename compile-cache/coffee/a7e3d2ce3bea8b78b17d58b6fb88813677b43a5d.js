(function() {
  var RacerClient, RacerProvider, _;

  _ = require('underscore-plus');

  RacerClient = require('./racer-client');

  module.exports = RacerProvider = (function() {
    RacerProvider.prototype.selector = '.source.rust';

    RacerProvider.prototype.inclusionPriority = 1;

    RacerProvider.prototype.excludeLowerPriority = false;

    RacerProvider.prototype.racerClient = null;

    function RacerProvider() {
      this.disableForSelector = atom.config.get('racer.autocompleteBlacklist');
      this.racerClient = new RacerClient;
    }

    RacerProvider.prototype.getSuggestions = function(_arg) {
      var bufferPosition, editor, prefix;
      editor = _arg.editor, bufferPosition = _arg.bufferPosition, prefix = _arg.prefix;
      return new Promise((function(_this) {
        return function(resolve) {
          var buffer, col, completions, row;
          if (!(prefix != null ? prefix.length : void 0)) {
            return resolve();
          }
          if (editor == null) {
            return resolve();
          }
          buffer = editor.getBuffer();
          if (buffer == null) {
            return resolve();
          }
          if (bufferPosition == null) {
            return resolve();
          }
          if (prefix == null) {
            return resolve();
          }
          row = bufferPosition.row;
          col = bufferPosition.column;
          completions = _this.racerClient.check_completion(editor, row, col, function(completions) {
            var suggestions;
            suggestions = _this.findSuggestionsForPrefix(prefix, completions);
            if (!(suggestions != null ? suggestions.length : void 0)) {
              return resolve();
            }
            return resolve(suggestions);
          });
        };
      })(this));
    };

    RacerProvider.prototype.splitNested = function(str, split) {
      var closeDelims, depth, i, lastSplit, match, openDelims, shouldSplit, splits;
      depth = 0;
      openDelims = ['(', '<', '['];
      closeDelims = [')', '>', ']'];
      splits = [];
      lastSplit = 0;
      i = 0;
      while (i < (str != null ? str.length : void 0)) {
        match = str.slice(i).match(split);
        shouldSplit = depth === 0 && (match != null ? match.index : void 0) === 0;
        if (openDelims.indexOf(str[i]) >= 0) {
          depth += 1;
        } else if (closeDelims.indexOf(str[i]) >= 0) {
          depth -= 1;
        } else if (shouldSplit) {
          splits.push(str.slice(lastSplit, i));
          lastSplit = i + match[0].length;
        }
        i += 1;
      }
      splits.push(str != null ? str.slice(lastSplit) : void 0);
      return splits;
    };

    RacerProvider.prototype.consumePart = function(str, matcher) {
      var match;
      match = str != null ? str.match(matcher) : void 0;
      if ((match != null ? match.index : void 0) === 0) {
        return [match[0], str.slice(match[0].length), match];
      } else {
        return [null, str];
      }
    };

    RacerProvider.prototype.consumeDelimited = function(str, _arg) {
      var closeDelim, consumed, depth, i, openDelim;
      openDelim = _arg[0], closeDelim = _arg[1];
      depth = 0;
      i = 0;
      while (i < (str != null ? str.length : void 0)) {
        if (str[i] === openDelim) {
          depth += 1;
        } else if (str[i] === closeDelim) {
          depth -= 1;
        }
        if (depth === 0) {
          break;
        }
        i += 1;
      }
      consumed = str.slice(0, i + 1);
      if (str[0] === openDelim && depth === 0) {
        return [consumed, str.slice(i + 1)];
      } else {
        return [null, str];
      }
    };

    RacerProvider.prototype.snippetForTraits = function(traits, n) {
      if (traits != null) {
        return ["${" + n + ":::" + traits + "}", n + 1];
      } else {
        return ["", n];
      }
    };

    RacerProvider.prototype.snippetForParams = function(paramString, n) {
      var param, params, snippets, _i, _len, _ref;
      snippets = [];
      params = this.splitNested(paramString, /\s*,\s*/);
      if ((params != null ? (_ref = params[0]) != null ? typeof _ref.match === "function" ? _ref.match(/self/) : void 0 : void 0 : void 0) != null) {
        params.shift();
      }
      for (_i = 0, _len = params.length; _i < _len; _i++) {
        param = params[_i];
        snippets.push("${" + n + ":" + param + "}");
        n += 1;
      }
      return ["(" + (snippets.join(', ')) + ")", n + snippets.length];
    };

    RacerProvider.prototype.functionDetails = function(word) {
      var decl, name, rest, ret, signature, traits, __, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
      switch (word.type) {
        case 'Function':
          rest = word.context;
          _ref = this.consumePart(rest, /((pub|unsafe|extern|const)\s*)*\s*fn\s+/), decl = _ref[0], rest = _ref[1];
          _ref1 = this.consumePart(rest, /\w+/), name = _ref1[0], rest = _ref1[1];
          _ref2 = this.consumeDelimited(rest, ['<', '>']), traits = _ref2[0], rest = _ref2[1];
          _ref3 = this.consumeDelimited(rest, ['(', ')']), signature = _ref3[0], rest = _ref3[1];
          _ref4 = this.consumePart(rest, /\s*->\s*([^{]*)\s*(?:{)?/), __ = _ref4[0], rest = _ref4[1], ret = _ref4[2];
          ret = ret != null ? (_ref5 = ret[1]) != null ? typeof _ref5.trim === "function" ? _ref5.trim() : void 0 : void 0 : void 0;
          return {
            decl: decl,
            name: name,
            traits: traits,
            signature: signature,
            ret: ret
          };
      }
    };

    RacerProvider.prototype.suggestionSnippet = function(word) {
      var n, name, params, paramsSnippet, signature, traits, traitsSnippet, _ref, _ref1, _ref2;
      switch (word.type) {
        case 'Function':
          _ref = this.functionDetails(word), name = _ref.name, traits = _ref.traits, signature = _ref.signature;
          params = signature != null ? signature.slice(1, -1) : void 0;
          n = 1;
          _ref1 = this.snippetForTraits(traits, n), traitsSnippet = _ref1[0], n = _ref1[1];
          _ref2 = this.snippetForParams(params, n), paramsSnippet = _ref2[0], n = _ref2[1];
          if ((name != null) && (paramsSnippet != null)) {
            return "" + name + traitsSnippet + paramsSnippet;
          }
      }
    };

    RacerProvider.prototype.suggestionText = function(word) {
      return word.word;
    };

    RacerProvider.prototype.functionDisplay = function(word) {
      var name, ret, returnArrow, signature, traits, _ref;
      switch (word.type) {
        case 'Function':
          _ref = this.functionDetails(word), name = _ref.name, traits = _ref.traits, signature = _ref.signature, ret = _ref.ret;
          returnArrow = ret != null ? " -> " + ret : '';
          return [name, traits, signature, returnArrow].join('');
      }
    };

    RacerProvider.prototype.suggestionFor = function(word, prefix) {
      var displayText, snippet, suggestion, text;
      suggestion = {
        replacementPrefix: prefix,
        rightLabelHTML: "<em>(" + word.file + ")</em>",
        leftLabel: word.type,
        type: this.mapType(word.type)
      };
      snippet = this.suggestionSnippet(word);
      text = this.suggestionText(word);
      displayText = this.functionDisplay(word) || snippet || text;
      if (snippet != null) {
        suggestion.snippet = snippet;
      } else {
        suggestion.text = text;
      }
      suggestion.displayText = displayText;
      return suggestion;
    };

    RacerProvider.prototype.findSuggestionsForPrefix = function(prefix, completions) {
      var suggestion, suggestions, word, words, _i, _len;
      if (completions != null ? completions.length : void 0) {
        words = _.sortBy(completions, (function(_this) {
          return function(e) {
            return e.word;
          };
        })(this));
        suggestions = [];
        for (_i = 0, _len = words.length; _i < _len; _i++) {
          word = words[_i];
          if (!(word.word !== prefix)) {
            continue;
          }
          if (prefix.slice(-1).match(/(\)|\.|:|;)/g)) {
            prefix = '';
          }
          suggestion = this.suggestionFor(word, prefix);
          suggestions.push(suggestion);
        }
        return suggestions;
      }
      return [];
    };

    RacerProvider.prototype.mapType = function(type) {
      switch (type) {
        case 'Function':
          return 'function';
        case 'Module':
          return 'module';
        default:
          return type;
      }
    };

    RacerProvider.prototype.dispose = function() {};

    return RacerProvider;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9yYWNlci9saWIvcmFjZXItcHJvdmlkZXIuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDZCQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSLENBRGQsQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSiw0QkFBQSxRQUFBLEdBQVUsY0FBVixDQUFBOztBQUFBLDRCQUNBLGlCQUFBLEdBQW1CLENBRG5CLENBQUE7O0FBQUEsNEJBRUEsb0JBQUEsR0FBc0IsS0FGdEIsQ0FBQTs7QUFBQSw0QkFHQSxXQUFBLEdBQWEsSUFIYixDQUFBOztBQUthLElBQUEsdUJBQUEsR0FBQTtBQUNYLE1BQUEsSUFBQyxDQUFBLGtCQUFELEdBQXNCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw2QkFBaEIsQ0FBdEIsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFdBQUQsR0FBZSxHQUFBLENBQUEsV0FEZixDQURXO0lBQUEsQ0FMYjs7QUFBQSw0QkFTQSxjQUFBLEdBQWdCLFNBQUMsSUFBRCxHQUFBO0FBQ2QsVUFBQSw4QkFBQTtBQUFBLE1BRGdCLGNBQUEsUUFBUSxzQkFBQSxnQkFBZ0IsY0FBQSxNQUN4QyxDQUFBO0FBQUEsYUFBVyxJQUFBLE9BQUEsQ0FBUSxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxPQUFELEdBQUE7QUFDakIsY0FBQSw2QkFBQTtBQUFBLFVBQUEsSUFBQSxDQUFBLGtCQUF3QixNQUFNLENBQUUsZ0JBQWhDO0FBQUEsbUJBQU8sT0FBQSxDQUFBLENBQVAsQ0FBQTtXQUFBO0FBQ0EsVUFBQSxJQUF3QixjQUF4QjtB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

//# sourceURL=/home/takaaki/.atom/packages/racer/lib/racer-provider.coffee
