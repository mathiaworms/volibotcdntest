Riot.QATool = Riot.QATool || {};

Riot.QATool.ItemApp = (function () {
	var dd, fn,
		templates = {
		},
		filterNeeded = false,
		keyFilter = [
			'image',
			'searchHash',
			'searchString',
			'searchRaw'
		];
	
	return {
		init: function () {
			dd = Riot.DDragon;
			fn = dd.fn;
            
            dd.addApp(['item'], function()
            {
                var items = dd.useModel('item').all();
                var item;
                for(var i=0,len=items.length;i<len;++i)
                {
                    item = dd.useModel('item').get(items[i]);
                    item.searchString += ';' + item.id;
                }
            });
			
			// These list out the individual pieces
			dd.addDisplay({
				type: 'itempiece',
				// Expects: Individual Item Object
				success: function(data)
				{
					return fn.format([
						'<div class="item-listpiece" data-rg-name="{{ modelName }}" data-rg-id="{{ data.id }}">',
							'<div class="content">',
								'<div class="artwork">{{ img }}</div>',
								'<div class="name">{{ data.name }} &#151; {{ data.id }}</div>',
								(
									data.rune.isrune ? 
									'<div class="type">Rune Type: {{ data.rune.type }}</div><div class="tier">Rune Tier: {{ data.rune.tier }}</div>':
									'<div class="cost">Cost: {{ data.gold.total }} ({{ data.gold.base }})</div>'
								),
								'<div class="description">{{ data.description }}</div>',
							'</div>',
						'</div>'
						], {
							data: data,
							img: this.model.getImg(data.id),
							modelName: this.model.type
						});
				}
			});
			
			dd.addDisplay({
				type: 'item_container',
				// Expects: Array of Items
				success: function(data) {
					fn.$('#filter-bar, #righttool, #sorttool').removeClass('ninja');
					
					if (Riot.QATool.Filter.currentSection !== 'item') {
						Riot.QATool.Filter.clear();
						
						Riot.QATool.Filter.currentSection = 'item';
						
						var item = this.model.getFull(data[0]);
					
						Riot.QATool.Filter.init(item, keyFilter);
					}
					
					return dd.displayList.call(this,'itempiece',data);
				}
			});
			
			// Runes are data copies of items, they can use the item displays
			dd.addDisplay({type: 'rune_container',success: dd.display.item_container.success});
		}
	};
}());