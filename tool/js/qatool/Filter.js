Riot.QATool = Riot.QATool || {};

Riot.QATool.Filter = (function () {
	var terms = {},
		filters = [],
		filterKeys = [],
		AUTO_ID = 100,
		containerEl, filterSelect, filterOp, filterValue, filterInverse, sortBy, dd, fn;
	
	function getId () {
		return 'Filter' + (++AUTO_ID);
	}
	
	function getKeys (item, prefix, filter) {
		var keys = [],
			key, fullKey;
		
		prefix = prefix || [];
		
		for (key in item) {
			if (item.hasOwnProperty(key)) {
				fullKey = (prefix.length > 0) ? prefix.join('.') + '.' + key : key;
				
				if (filter.indexOf(fullKey) !== -1 || filter.indexOf(key) !== -1) {
					continue;
				}
				
				keys.push(fullKey);
				if (typeof item[key] === 'object' && !fn.isArray(item[key])) {
					keys = keys.concat(getKeys(
						item[key],
						prefix.concat([key]),
						filter
					));
				}
                else if(fn.isArray(item[key])) {
                    keys.push(fullKey + '.length');
                }
			}
		}
		
		return keys;
	}
	
	function initEvents () {
		var me = this;
		
		fn.$('#add-filter').click(function () {
			me.addFilter();
		});
	}
	
	function removeFilter (key) {
		fn.each(filterKeys, function (k, index) {
			if (k === key) {
				filterKeys.splice(index, 1);
				filters.splice(index, 1);
				
				return false;
			}
		});
		
		if (this.onRemove) {
			this.onRemove();
		}
	}
	
	function removeAllChildren (el) {
		if (!el) {
			return;
		}
		
		var children = el.childNodes;
		
		while (children.length > 0) {
			el.removeChild(children[0]);
		}
	}
	
	return {
		clear: function () {
			var children;
			
			filters = [];
			filterKeys = [];
			
			removeAllChildren(containerEl);
		},
		init: function (data, filter) {
			var keys = getKeys(data, [], filter);
			
			keys.sort();
			
			fn.each(keys, function (key) {
				sortBy.options[sortBy.options.length] = new Option(key, key);
				filterSelect.options[filterSelect.options.length] = new Option(key, key);
			});
		},
		addFilter: function () {
			var me = this,
				filter = filterSelect.value,
				op = filterOp.value,
				value = filterValue.value,
				inverse = filterInverse.value,
				key = getId(),
				dom;
			
			if (value.length === 0) {
				return false;
			}
			
			filters.push(inverse + filter + op + value);
			filterKeys.push(key);
			
			dom = fn.mkDiv({
				classes: 'filter'
			});
			
			dom.innerHTML = fn.format([
				'<div class="inverse">{{ inverse }}&nbsp;</div>',
				'<div class="key">{{ key }}</div>',
				'<div class="op">{{ op }}</div>',
				'<div class="value">{{ value }}</div>',
				'<input type="button" value="X"/>'
			], {
				inverse: inverse,
				key: filter,
				op: op,
				value: value
			});
			
			containerEl.appendChild(dom);
			
			fn.$(dom).children('input').click(function () {
				removeFilter.call(me, key);
				
				fn.rmDiv(this.parentNode);
			});
			
			filterValue.value = '';
			
			if (me.onAdd) {
				me.onAdd();
			}
		},
		getFilters: function () {
			return filters.join("\n");
		},
		getSort: function () {
			return sortBy.value;
		},
		setup: function () {
			dd = Riot.DDragon;
			fn = dd.fn;
			
			filterSelect = fn.$('#filters')[0];
			filterOp = fn.$('#filter-ops')[0];
			filterValue = fn.$('#filter-value')[0];
			filterInverse = fn.$('#filter-inverse')[0];
			sortBy = fn.$('#sortby')[0];
			containerEl = fn.$('#currentFilters')[0];
			
			initEvents.call(this);
		}
	};
}());