(function() {
  var $, $$, SelectListMultipleView, SelectListView, View, fuzzyFilter, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  fuzzyFilter = require('fuzzaldrin').filter;

  ref = require('atom-space-pen-views'), $ = ref.$, $$ = ref.$$, View = ref.View, SelectListView = ref.SelectListView;

  module.exports = SelectListMultipleView = (function(superClass) {
    extend(SelectListMultipleView, superClass);

    function SelectListMultipleView() {
      return SelectListMultipleView.__super__.constructor.apply(this, arguments);
    }

    SelectListMultipleView.prototype.initialize = function() {
      SelectListMultipleView.__super__.initialize.apply(this, arguments);
      this.selectedItems = [];
      this.list.addClass('mark-active');
      this.on('mousedown', (function(_this) {
        return function(arg) {
          var target;
          target = arg.target;
          if (target === _this.list[0] || $(target).hasClass('btn')) {
            return false;
          }
        };
      })(this));
      this.on('keypress', (function(_this) {
        return function(arg) {
          var ctrlKey, keyCode, shiftKey;
          keyCode = arg.keyCode, ctrlKey = arg.ctrlKey, shiftKey = arg.shiftKey;
          if (keyCode === 13 && (ctrlKey || shiftKey)) {
            return _this.complete();
          }
        };
      })(this));
      return this.addButtons();
    };

    SelectListMultipleView.prototype.addButtons = function() {
      var viewButton;
      viewButton = $$(function() {
        return this.div({
          "class": 'buttons'
        }, (function(_this) {
          return function() {
            _this.span({
              "class": 'pull-left'
            }, function() {
              return _this.button({
                "class": 'btn btn-error inline-block-tight btn-cancel-button'
              }, 'Cancel');
            });
            return _this.span({
              "class": 'pull-right'
            }, function() {
              return _this.button({
                "class": 'btn btn-success inline-block-tight btn-complete-button'
              }, 'Confirm');
            });
          };
        })(this));
      });
      viewButton.appendTo(this);
      return this.on('click', 'button', (function(_this) {
        return function(arg) {
          var target;
          target = arg.target;
          if ($(target).hasClass('btn-complete-button')) {
            _this.complete();
          }
          if ($(target).hasClass('btn-cancel-button')) {
            return _this.cancel();
          }
        };
      })(this));
    };

    SelectListMultipleView.prototype.confirmSelection = function() {
      var item, viewItem;
      item = this.getSelectedItem();
      viewItem = this.getSelectedItemView();
      if (viewItem != null) {
        return this.confirmed(item, viewItem);
      } else {
        return this.cancel();
      }
    };

    SelectListMultipleView.prototype.confirmed = function(item, viewItem) {
      if (indexOf.call(this.selectedItems, item) >= 0) {
        this.selectedItems = this.selectedItems.filter(function(i) {
          return i !== item;
        });
        return viewItem.removeClass('active');
      } else {
        this.selectedItems.push(item);
        return viewItem.addClass('active');
      }
    };

    SelectListMultipleView.prototype.complete = function() {
      if (this.selectedItems.length > 0) {
        return this.completed(this.selectedItems);
      } else {
        return this.cancel();
      }
    };

    SelectListMultipleView.prototype.populateList = function() {
      var filterQuery, filteredItems, i, item, itemView, j, options, ref1, ref2, ref3;
      if (this.items == null) {
        return;
      }
      filterQuery = this.getFilterQuery();
      if (filterQuery.length) {
        options = {
          key: this.getFilterKey()
        };
        filteredItems = fuzzyFilter(this.items, filterQuery, options);
      } else {
        filteredItems = this.items;
      }
      this.list.empty();
      if (filteredItems.length) {
        this.setError(null);
        for (i = j = 0, ref1 = Math.min(filteredItems.length, this.maxItems); 0 <= ref1 ? j < ref1 : j > ref1; i = 0 <= ref1 ? ++j : --j) {
          item = (ref2 = filteredItems[i].original) != null ? ref2 : filteredItems[i];
          itemView = $(this.viewForItem(item, (ref3 = filteredItems[i].string) != null ? ref3 : null));
          itemView.data('select-list-item', item);
          if (indexOf.call(this.selectedItems, item) >= 0) {
            itemView.addClass('active');
          }
          this.list.append(itemView);
        }
        return this.selectItemView(this.list.find('li:first'));
      } else {
        return this.setError(this.getEmptyMessage(this.items.length, filteredItems.length));
      }
    };

    SelectListMultipleView.prototype.viewForItem = function(item, matchedStr) {
      throw new Error("Subclass must implement a viewForItem(item) method");
    };

    SelectListMultipleView.prototype.completed = function(items) {
      throw new Error("Subclass must implement a completed(items) method");
    };

    return SelectListMultipleView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdGFrYWFraS8uYXRvbS9wYWNrYWdlcy9naXQtcGx1cy9saWIvdmlld3Mvc2VsZWN0LWxpc3QtbXVsdGlwbGUtdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHFFQUFBO0lBQUE7Ozs7RUFBQSxXQUFBLEdBQWMsT0FBQSxDQUFRLFlBQVIsQ0FBcUIsQ0FBQzs7RUFDcEMsTUFBZ0MsT0FBQSxDQUFRLHNCQUFSLENBQWhDLEVBQUMsU0FBRCxFQUFJLFdBQUosRUFBUSxlQUFSLEVBQWM7O0VBaUNkLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7cUNBSUosVUFBQSxHQUFZLFNBQUE7TUFDVix3REFBQSxTQUFBO01BQ0EsSUFBQyxDQUFBLGFBQUQsR0FBaUI7TUFDakIsSUFBQyxDQUFBLElBQUksQ0FBQyxRQUFOLENBQWUsYUFBZjtNQUVBLElBQUMsQ0FBQSxFQUFELENBQUksV0FBSixFQUFpQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsR0FBRDtBQUNmLGNBQUE7VUFEaUIsU0FBRDtVQUNoQixJQUFTLE1BQUEsS0FBVSxLQUFDLENBQUEsSUFBSyxDQUFBLENBQUEsQ0FBaEIsSUFBc0IsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLFFBQVYsQ0FBbUIsS0FBbkIsQ0FBL0I7bUJBQUEsTUFBQTs7UUFEZTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBakI7TUFFQSxJQUFDLENBQUEsRUFBRCxDQUFJLFVBQUosRUFBZ0IsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEdBQUQ7QUFBa0MsY0FBQTtVQUFoQyx1QkFBUyx1QkFBUztVQUFjLElBQWUsT0FBQSxLQUFXLEVBQVgsSUFBa0IsQ0FBQyxPQUFBLElBQVcsUUFBWixDQUFqQzttQkFBQSxLQUFDLENBQUEsUUFBRCxDQUFBLEVBQUE7O1FBQWxDO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFoQjthQUNB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YixFQUFvQixXQUFwQixFQUFpQyxPQUFqQyxFQUhsQjtPQUFBLE1BQUE7UUFLRSxhQUFBLEdBQWdCLElBQUMsQ0FBQSxNQUxuQjs7TUFPQSxJQUFDLENBQUEsSUFBSSxDQUFDLEtBQU4sQ0FBQTtNQUNBLElBQUcsYUFBYSxDQUFDLE1BQWpCO1FBQ0UsSUFBQyxDQUFBLFFBQUQsQ0FBVSxJQUFWO0FBQ0EsYUFBUywySEFBVDtVQUNFLElBQUEsdURBQW1DLGFBQWMsQ0FBQSxDQUFBO1VBQ2pELFFBQUEsR0FBVyxDQUFBLENBQUUsSUFBQyxDQUFBLFdBQUQsQ0FBYSxJQUFiLG9EQUE2QyxJQUE3QyxDQUFGO1VBQ1gsUUFBUSxDQUFDLElBQVQsQ0FBYyxrQkFBZCxFQUFrQyxJQUFsQztVQUNBLElBQThCLGFBQVEsSUFBQyxDQUFBLGFBQVQsRUFBQSxJQUFBLE1BQTlCO1lBQUEsUUFBUSxDQUFDLFFBQVQsQ0FBa0IsUUFBbEIsRUFBQTs7VUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sQ0FBYSxRQUFiO0FBTEY7ZUFPQSxJQUFDLENBQUEsY0FBRCxDQUFnQixJQUFDLENBQUEsSUFBSSxDQUFDLElBQU4sQ0FBVyxVQUFYLENBQWhCLEVBVEY7T0FBQSxNQUFBO2VBV0UsSUFBQyxDQUFBLFFBQUQsQ0FBVSxJQUFDLENBQUEsZUFBRCxDQUFpQixJQUFDLENBQUEsS0FBSyxDQUFDLE1BQXhCLEVBQWdDLGFBQWEsQ0FBQyxNQUE5QyxDQUFWLEVBWEY7O0lBWlk7O3FDQW9DZCxXQUFBLEdBQWEsU0FBQyxJQUFELEVBQU8sVUFBUDtBQUNYLFlBQVUsSUFBQSxLQUFBLENBQU0sb0RBQU47SUFEQzs7cUNBV2IsU0FBQSxHQUFXLFNBQUMsS0FBRDtBQUNULFlBQVUsSUFBQSxLQUFBLENBQU0sbURBQU47SUFERDs7OztLQTNId0I7QUFuQ3JDIiwic291cmNlc0NvbnRlbnQiOlsiZnV6enlGaWx0ZXIgPSByZXF1aXJlKCdmdXp6YWxkcmluJykuZmlsdGVyXG57JCwgJCQsIFZpZXcsIFNlbGVjdExpc3RWaWV3fSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuXG4jIFB1YmxpYzogUHJvdmlkZXMgYSB2aWV3IHRoYXQgcmVuZGVycyBhIGxpc3Qgb2YgaXRlbXMgd2l0aCBhbiBlZGl0b3IgdGhhdFxuIyBmaWx0ZXJzIHRoZSBpdGVtcy4gRW5hYmxlcyB5b3UgdG8gc2VsZWN0IG11bHRpcGxlIGl0ZW1zIGF0IG9uY2UuXG4jXG4jIFN1YmNsYXNzZXMgbXVzdCBpbXBsZW1lbnQgdGhlIGZvbGxvd2luZyBtZXRob2RzOlxuI1xuIyAqIHs6OnZpZXdGb3JJdGVtfVxuIyAqIHs6OmNvbXBsZXRlZH1cbiNcbiMgU3ViY2xhc3NlcyBzaG91bGQgaW1wbGVtZW50IHRoZSBmb2xsb3dpbmcgbWV0aG9kczpcbiNcbiMgKiB7OjphZGRCdXR0b25zfVxuI1xuIyAjIyBSZXF1aXJpbmcgaW4gcGFja2FnZXNcbiNcbiMgYGBgY29mZmVlXG4jIHtTZWxlY3RMaXN0TXVsdGlwbGVWaWV3fSA9IHJlcXVpcmUgJ2F0b20nXG4jXG4jIGNsYXNzIE15U2VsZWN0TGlzdFZpZXcgZXh0ZW5kcyBTZWxlY3RMaXN0TXVsdGlwbGVWaWV3XG4jICAgaW5pdGlhbGl6ZTogLT5cbiMgICAgIHN1cGVyXG4jICAgICBAYWRkQ2xhc3MoJ292ZXJsYXkgZnJvbS10b3AnKVxuIyAgICAgQHNldEl0ZW1zKFsnSGVsbG8nLCAnV29ybGQnXSlcbiMgICAgIGF0b20ud29ya3NwYWNlVmlldy5hcHBlbmQodGhpcylcbiMgICAgIEBmb2N1c0ZpbHRlckVkaXRvcigpXG4jXG4jICAgdmlld0Zvckl0ZW06IChpdGVtKSAtPlxuIyAgICAgXCI8bGk+I3tpdGVtfTwvbGk+XCJcbiNcbiMgICBjb21wbGV0ZWQ6IChpdGVtcykgLT5cbiMgICAgIGNvbnNvbGUubG9nKFwiI3tpdGVtc30gd2VyZSBzZWxlY3RlZFwiKVxuIyBgYGBcbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFNlbGVjdExpc3RNdWx0aXBsZVZpZXcgZXh0ZW5kcyBTZWxlY3RMaXN0Vmlld1xuXG4gICMgVGhpcyBtZXRob2QgY2FuIGJlIG92ZXJyaWRkZW4gYnkgc3ViY2xhc3NlcyBidXQgYHN1cGVyYCBzaG91bGQgYWx3YXlzXG4gICMgYmUgY2FsbGVkLlxuICBpbml0aWFsaXplOiAtPlxuICAgIHN1cGVyXG4gICAgQHNlbGVjdGVkSXRlbXMgPSBbXVxuICAgIEBsaXN0LmFkZENsYXNzKCdtYXJrLWFjdGl2ZScpXG5cbiAgICBAb24gJ21vdXNlZG93bicsICh7dGFyZ2V0fSkgPT5cbiAgICAgIGZhbHNlIGlmIHRhcmdldCBpcyBAbGlzdFswXSBvciAkKHRhcmdldCkuaGFzQ2xhc3MoJ2J0bicpXG4gICAgQG9uICdrZXlwcmVzcycsICh7a2V5Q29kZSwgY3RybEtleSwgc2hpZnRLZXl9KSA9PiBAY29tcGxldGUoKSBpZiBrZXlDb2RlIGlzIDEzIGFuZCAoY3RybEtleSBvciBzaGlmdEtleSlcbiAgICBAYWRkQnV0dG9ucygpXG5cbiAgIyBQdWJsaWM6IEZ1bmN0aW9uIHRvIGFkZCBidXR0b25zIHRvIHRoZSBTZWxlY3RMaXN0TXVsdGlwbGVWaWV3LlxuICAjXG4gICMgVGhpcyBtZXRob2QgY2FuIGJlIG92ZXJyaWRkZW4gYnkgc3ViY2xhc3Nlcy5cbiAgI1xuICAjICMjIyBJbXBvcnRhbnRcbiAgIyBUaGVyZSBtdXN0IGFsd2F5cyBiZSBhIGJ1dHRvbiB0byBjYWxsIHRoZSBmdW5jdGlvbiBgQGNvbXBsZXRlKClgIHRvXG4gICMgY29uZmlybSB0aGUgc2VsZWN0aW9ucyFcbiAgI1xuICAjICMjIyMgRXhhbXBsZSAoRGVmYXVsdClcbiAgIyBgYGBjb2ZmZWVcbiAgIyBhZGRCdXR0b25zOiAtPlxuICAjICAgdmlld0J1dHRvbiA9ICQkIC0+XG4gICMgICAgIEBkaXYgY2xhc3M6ICdidXR0b25zJywgPT5cbiAgIyAgICAgICBAc3BhbiBjbGFzczogJ3B1bGwtbGVmdCcsID0+XG4gICMgICAgICAgICBAYnV0dG9uIGNsYXNzOiAnYnRuIGJ0bi1lcnJvciBpbmxpbmUtYmxvY2stdGlnaHQgYnRuLWNhbmNlbC1idXR0b24nLCAnQ2FuY2VsJ1xuICAjICAgICAgIEBzcGFuIGNsYXNzOiAncHVsbC1yaWdodCcsID0+XG4gICMgICAgICAgICBAYnV0dG9uIGNsYXNzOiAnYnRuIGJ0bi1zdWNjZXNzIGlubGluZS1ibG9jay10aWdodCBidG4tY29tcGxldGUtYnV0dG9uJywgJ0NvbmZpcm0nXG4gICMgICB2aWV3QnV0dG9uLmFwcGVuZFRvKHRoaXMpXG4gICNcbiAgIyAgIEBvbiAnY2xpY2snLCAnYnV0dG9uJywgKHt0YXJnZXR9KSA9PlxuICAjICAgICBAY29tcGxldGUoKSBpZiAkKHRhcmdldCkuaGFzQ2xhc3MoJ2J0bi1jb21wbGV0ZS1idXR0b24nKVxuICAjICAgICBAY2FuY2VsKCkgaWYgJCh0YXJnZXQpLmhhc0NsYXNzKCdidG4tY2FuY2VsLWJ1dHRvbicpXG4gICMgYGBgXG4gIGFkZEJ1dHRvbnM6IC0+XG4gICAgdmlld0J1dHRvbiA9ICQkIC0+XG4gICAgICBAZGl2IGNsYXNzOiAnYnV0dG9ucycsID0+XG4gICAgICAgIEBzcGFuIGNsYXNzOiAncHVsbC1sZWZ0JywgPT5cbiAgICAgICAgICBAYnV0dG9uIGNsYXNzOiAnYnRuIGJ0bi1lcnJvciBpbmxpbmUtYmxvY2stdGlnaHQgYnRuLWNhbmNlbC1idXR0b24nLCAnQ2FuY2VsJ1xuICAgICAgICBAc3BhbiBjbGFzczogJ3B1bGwtcmlnaHQnLCA9PlxuICAgICAgICAgIEBidXR0b24gY2xhc3M6ICdidG4gYnRuLXN1Y2Nlc3MgaW5saW5lLWJsb2NrLXRpZ2h0IGJ0bi1jb21wbGV0ZS1idXR0b24nLCAnQ29uZmlybSdcbiAgICB2aWV3QnV0dG9uLmFwcGVuZFRvKHRoaXMpXG5cbiAgICBAb24gJ2NsaWNrJywgJ2J1dHRvbicsICh7dGFyZ2V0fSkgPT5cbiAgICAgIEBjb21wbGV0ZSgpIGlmICQodGFyZ2V0KS5oYXNDbGFzcygnYnRuLWNvbXBsZXRlLWJ1dHRvbicpXG4gICAgICBAY2FuY2VsKCkgaWYgJCh0YXJnZXQpLmhhc0NsYXNzKCdidG4tY2FuY2VsLWJ1dHRvbicpXG5cbiAgY29uZmlybVNlbGVjdGlvbjogLT5cbiAgICBpdGVtID0gQGdldFNlbGVjdGVkSXRlbSgpXG4gICAgdmlld0l0ZW0gPSBAZ2V0U2VsZWN0ZWRJdGVtVmlldygpXG4gICAgaWYgdmlld0l0ZW0/XG4gICAgICBAY29uZmlybWVkKGl0ZW0sIHZpZXdJdGVtKVxuICAgIGVsc2VcbiAgICAgIEBjYW5jZWwoKVxuXG4gIGNvbmZpcm1lZDogKGl0ZW0sIHZpZXdJdGVtKSAtPlxuICAgIGlmIGl0ZW0gaW4gQHNlbGVjdGVkSXRlbXNcbiAgICAgIEBzZWxlY3RlZEl0ZW1zID0gQHNlbGVjdGVkSXRlbXMuZmlsdGVyIChpKSAtPiBpIGlzbnQgaXRlbVxuICAgICAgdmlld0l0ZW0ucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpXG4gICAgZWxzZVxuICAgICAgQHNlbGVjdGVkSXRlbXMucHVzaCBpdGVtXG4gICAgICB2aWV3SXRlbS5hZGRDbGFzcygnYWN0aXZlJylcblxuICBjb21wbGV0ZTogLT5cbiAgICBpZiBAc2VsZWN0ZWRJdGVtcy5sZW5ndGggPiAwXG4gICAgICBAY29tcGxldGVkKEBzZWxlY3RlZEl0ZW1zKVxuICAgIGVsc2VcbiAgICAgIEBjYW5jZWwoKVxuXG4gICMgUHVibGljOiBQb3B1bGF0ZSB0aGUgbGlzdCB2aWV3IHdpdGggdGhlIG1vZGVsIGl0ZW1zIHByZXZpb3VzbHkgc2V0IGJ5XG4gICMgICAgICAgICBjYWxsaW5nIHs6OnNldEl0ZW1zfS5cbiAgI1xuICAjIFN1YmNsYXNzZXMgbWF5IG92ZXJyaWRlIHRoaXMgbWV0aG9kIGJ1dCBzaG91bGQgYWx3YXlzIGNhbGwgYHN1cGVyYC5cbiAgcG9wdWxhdGVMaXN0OiAtPlxuICAgIHJldHVybiB1bmxlc3MgQGl0ZW1zP1xuXG4gICAgZmlsdGVyUXVlcnkgPSBAZ2V0RmlsdGVyUXVlcnkoKVxuICAgIGlmIGZpbHRlclF1ZXJ5Lmxlbmd0aFxuICAgICAgb3B0aW9ucyA9XG4gICAgICAgIGtleTogQGdldEZpbHRlcktleSgpXG4gICAgICBmaWx0ZXJlZEl0ZW1zID0gZnV6enlGaWx0ZXIoQGl0ZW1zLCBmaWx0ZXJRdWVyeSwgb3B0aW9ucylcbiAgICBlbHNlXG4gICAgICBmaWx0ZXJlZEl0ZW1zID0gQGl0ZW1zXG5cbiAgICBAbGlzdC5lbXB0eSgpXG4gICAgaWYgZmlsdGVyZWRJdGVtcy5sZW5ndGhcbiAgICAgIEBzZXRFcnJvcihudWxsKVxuICAgICAgZm9yIGkgaW4gWzAuLi5NYXRoLm1pbihmaWx0ZXJlZEl0ZW1zLmxlbmd0aCwgQG1heEl0ZW1zKV1cbiAgICAgICAgaXRlbSA9IGZpbHRlcmVkSXRlbXNbaV0ub3JpZ2luYWwgPyBmaWx0ZXJlZEl0ZW1zW2ldXG4gICAgICAgIGl0ZW1WaWV3ID0gJChAdmlld0Zvckl0ZW0oaXRlbSwgZmlsdGVyZWRJdGVtc1tpXS5zdHJpbmcgPyBudWxsKSlcbiAgICAgICAgaXRlbVZpZXcuZGF0YSgnc2VsZWN0LWxpc3QtaXRlbScsIGl0ZW0pXG4gICAgICAgIGl0ZW1WaWV3LmFkZENsYXNzICdhY3RpdmUnIGlmIGl0ZW0gaW4gQHNlbGVjdGVkSXRlbXNcbiAgICAgICAgQGxpc3QuYXBwZW5kKGl0ZW1WaWV3KVxuXG4gICAgICBAc2VsZWN0SXRlbVZpZXcoQGxpc3QuZmluZCgnbGk6Zmlyc3QnKSlcbiAgICBlbHNlXG4gICAgICBAc2V0RXJyb3IoQGdldEVtcHR5TWVzc2FnZShAaXRlbXMubGVuZ3RoLCBmaWx0ZXJlZEl0ZW1zLmxlbmd0aCkpXG5cbiAgIyBQdWJsaWM6IENyZWF0ZSBhIHZpZXcgZm9yIHRoZSBnaXZlbiBtb2RlbCBpdGVtLlxuICAjXG4gICMgVGhpcyBtZXRob2QgbXVzdCBiZSBvdmVycmlkZGVuIGJ5IHN1YmNsYXNzZXMuXG4gICNcbiAgIyBUaGlzIGlzIGNhbGxlZCB3aGVuIHRoZSBpdGVtIGlzIGFib3V0IHRvIGFwcGVuZGVkIHRvIHRoZSBsaXN0IHZpZXcuXG4gICNcbiAgIyBpdGVtICAgICAgICAgIC0gVGhlIG1vZGVsIGl0ZW0gYmVpbmcgcmVuZGVyZWQuIFRoaXMgd2lsbCBhbHdheXMgYmUgb25lIG9mXG4gICMgICAgICAgICAgICAgICAgIHRoZSBpdGVtcyBwcmV2aW91c2x5IHBhc3NlZCB0byB7OjpzZXRJdGVtc30uXG4gICMgbWF0Y2hlZFN0ciAtIFRoZSBmdXp6eSBoaWdobGlnaHRlZCBzdHJpbmcuXG4gICNcbiAgIyBSZXR1cm5zIGEgU3RyaW5nIG9mIEhUTUwsIERPTSBlbGVtZW50LCBqUXVlcnkgb2JqZWN0LCBvciBWaWV3LlxuICB2aWV3Rm9ySXRlbTogKGl0ZW0sIG1hdGNoZWRTdHIpIC0+XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiU3ViY2xhc3MgbXVzdCBpbXBsZW1lbnQgYSB2aWV3Rm9ySXRlbShpdGVtKSBtZXRob2RcIilcblxuICAjIFB1YmxpYzogQ2FsbGJhY2sgZnVuY3Rpb24gZm9yIHdoZW4gdGhlIGNvbXBsZXRlIGJ1dHRvbiBpcyBwcmVzc2VkLlxuICAjXG4gICMgVGhpcyBtZXRob2QgbXVzdCBiZSBvdmVycmlkZGVuIGJ5IHN1YmNsYXNzZXMuXG4gICNcbiAgIyBpdGVtcyAtIEFuIHtBcnJheX0gY29udGFpbmluZyB0aGUgc2VsZWN0ZWQgaXRlbXMuIFRoaXMgd2lsbCBhbHdheXMgYmUgb25lXG4gICMgICAgICAgICBvZiB0aGUgaXRlbXMgcHJldmlvdXNseSBwYXNzZWQgdG8gezo6c2V0SXRlbXN9LlxuICAjXG4gICMgUmV0dXJucyBhIERPTSBlbGVtZW50LCBqUXVlcnkgb2JqZWN0LCBvciB7Vmlld30uXG4gIGNvbXBsZXRlZDogKGl0ZW1zKSAtPlxuICAgIHRocm93IG5ldyBFcnJvcihcIlN1YmNsYXNzIG11c3QgaW1wbGVtZW50IGEgY29tcGxldGVkKGl0ZW1zKSBtZXRob2RcIilcbiJdfQ==
