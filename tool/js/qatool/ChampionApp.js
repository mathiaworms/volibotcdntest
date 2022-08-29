Riot.QATool = Riot.QATool || {};

Riot.QATool.ChampionApp = (function () {
	function parsePerLevel(val) {
		if(val >= 100) {
			return val.toPrecision(3);
		}
		return val.toPrecision(2);
	}

	var dd, fn,
		templates = {
			listPiece: [
				'<div class="champion-listpiece" data-rg-name="{{ modelName }}" data-rg-id="{{ data.id }}">',
					'<div class="content">',
						'<div class="artwork">{{ img }}</div>',
						'<div class="name">{{ data.name }} &#151; {{ data.key }} / {{ data.id }}</div>',
						'<div class="title">{{ data.title }}</div>',
						'<div class="tags">{{ tags }}</div>',
						'<div class="statsleft">',
							'Health: {{ data.stats.l1hp }} (+{{ hpperlevel }})<br />',
							'Health Regen: {{ data.stats.l1hpregen }} (+{{ hpregenperlevel }})<br />',
							'Mana: {{ data.stats.l1mp }} (+{{ mpperlevel }})<br />',
							'Mana Regen: {{ data.stats.l1mpregen }} (+{{ mpregenperlevel }})<br />',
							'Move Speed: {{ data.stats.movespeed }}<br />',
						'</div>',
						'<div class="statsright">',
							'Att. Damage: {{ data.stats.l1attackdamage }} (+{{ attackdamageperlevel }})<br />',
							'Att. Speed: {{ data.stats.attackspeed }} (+{{ data.stats.attackspeedperlevel }}%)<br />',
							'Att. Range: {{ data.stats.attackrange }}<br />',
							'Armor: {{ data.stats.l1armor }} (+{{ armorperlevel }})<br />',
							'MR: {{ data.stats.l1spellblock }} (+{{ spellblockperlevel }})<br />',
						'</div>',
					'</div>',
				'</div>'
			],
			modalPiece: [
				'<div class="name">{{ name }}</div>',
				'<div class="title">{{ title }}</div>',
				'<div class="imagecontainer">{{ img }}</div>',
				'<div class="champswitches">',
					'<div class="btn btn-primary" data-switch="tips">Replays</div>&nbsp;',       
					'<div class="btn" data-switch="spells">Spells</div>&nbsp;',
					'<div class="btn" data-switch="lore">Lore</div>',
				'</div>',
				'<div class="pane champtips" data-pane="tips">',
					'{{ replays }}',
				'</div>',
				'<div class="pane champinfo ninja" data-scrollpane="lore" data-pane="lore">',
					'<div class="description">{{ lore }}</div>',
				'</div>',
				'<div class="pane champspells ninja" data-scrollpane="spells" data-pane="spells">',
					'{{ spells }}',
				'</div>'
			],
			recommendedItemsPiece: [
				'<div class="recommended">',
					'<div class="rectitle">{{ mode }}</div>',
					'{{ items }}',
				'</div>'
			],
			spellPiece: [
				'<div class="spellblock">',
					'{{ img }}',
					'<div class="description">{{ description }}</div>',
				'</div>'
			],
			statPiece: [
				'<div class="stat stat-{{ key }}">',
					'<p>{{ name }} ({{ value }}/10)</p>',
					'<div class="bar" style="width: {{ width }}%"></div>',
				'</div>'
			],
			tooltipPiece: [
				'{{ img }}',
				'<div class="info">',
					'<div class="name">{{ name }}</div>',
					'<div class="description">{{ blurb }}</div>',
				'</div>'
			]
		},
		keyFilter = [
			'loadedFull',
			'loadedPartial',
			'image',
			'tags',
			'recommended',
			'searchHash',
			'searchString',
			'searchRaw',
			'version'
		],
		filterInitNeeded = false;
		
	return {
		init: function () {
			dd = Riot.DDragon;
			fn = dd.fn;
			
			// These list out the individual pieces
			dd.addDisplay({
				type: 'championpiece',
				// Expects: Individual Champion Object
				success: function (data) {
					var stats = '',
						tags = [];
					
					fn.each(data.tags, function (tag) {
						tags.push(fn.t(tag));
					});
					
					return fn.format(templates.listPiece, {
						data: data,
						img: this.model.getImg(data.id,{wrap: 3}),
						tags: tags.join(', '),
						hpperlevel: parsePerLevel(data.stats.hpperlevel),
						hpregenperlevel: parsePerLevel(data.stats.hpregenperlevel),
						mpperlevel: parsePerLevel(data.stats.mpperlevel),
						mpregenperlevel: parsePerLevel(data.stats.mpregenperlevel),
						armorperlevel: parsePerLevel(data.stats.armorperlevel),
						spellblockperlevel: parsePerLevel(data.stats.spellblockperlevel),
						attackdamageperlevel: parsePerLevel(data.stats.attackdamageperlevel),
						modelName: this.model.name
					});
				}
			});
			
			dd.addDisplay({
				type: 'champion_container',
				// Expects: Array of Champions
				success: function (data) {
					fn.$('#filter-bar, #righttool, #sorttool').removeClass('ninja');
					if (Riot.QATool.Filter.currentSection !== 'champion') {
						Riot.QATool.Filter.clear();
						
						Riot.QATool.Filter.currentSection = 'champion';
						
						var item = this.model.getFull(data[0]);
					
						if (item.loadedFull) {
							Riot.QATool.Filter.init(item, keyFilter);
						} else {
							filterInitNeeded = true;
						}
					}
					
					return dd.displayList.call(this, 'championpiece', data);
				}
			});
			
			fn.fire.plan('model', {}, function (planData,execData,fireId) {
				var data = dd.useModel('champion').get(execData.sub);
				
				if (data.loadedFull && filterInitNeeded) {
					Riot.QATool.Filter.init(data, keyFilter);
					
					filterInitNeeded = false;
				}
			});
			
			dd.addDisplay({
				type: 'champion_modal',
				// Expects: Individual Champion Object
				success: function (data) {
					function recItems (mode) {
						var items = '';
						
						fn.each(data.recommended[mode.toUpperCase()], function (item) {
							items = items + dd.useModel('item').getImg(item, {
								attrs: 'data-rg-name="item" data-rg-id="' + item +'"'
							});
						});
						
						return fn.format(templates.recommendedItemsPiece, {
							mode: fn.t(mode),
							items: items
						});
					}
					
					var i, spells = '';
					for(i=0; i<4; ++i)
					{
						spells += fn.format(templates.spellPiece,{
							img: fn.getImg(data.spells[i], {version: data.version}),
							description: dd.spellDataLink(0, data.spells[i]).getTooltip()
						});
					}
          
          var replaysJsonFile = $.ajax({
            type: 'GET',
            url: '/cdn/replays/replays.json', 
            dataType: 'json',
            success: function() { },
            data: {},
            async: false
          });               
          
          var replaysObject = eval('(' + replaysJsonFile.responseText + ')');
          replaysObject = replaysObject.data[data.id];
          
          var replays = "";var parentItem = 0;
          
          replays += '<div class="replay-treeview"><ul>';
          for (var replay in replaysObject) {
            switch(replay){
              case "8":
                replays += '<li><input type="checkbox" id="item-'+ parentItem +'" /><label for="item-'+ parentItem +'">Crystal Scar (8)</label><ul>';
                for(var replayItem in replaysObject[replay]){
                  replays += ' <li><a href="/cdn/replays/8/'+ data.id +'/'+ replaysObject[replay][replayItem] +'" download><div class="download-icon"></div>'+ replaysObject[replay][replayItem] +'</a></li>';
                }
                replays += '</ul></li>';
                break;      
              case "10":
                replays += '<li><input type="checkbox" id="item-'+ parentItem +'" /><label for="item-'+ parentItem +'">Twisted Treeline (10)</label><ul>';
                for(var replayItem in replaysObject[replay]){
                  replays += ' <li><a href="/cdn/replays/10/'+ data.id +'/'+ replaysObject[replay][replayItem] +'" download><div class="download-icon"></div>'+ replaysObject[replay][replayItem] +'</a></li>';
                }
                replays += '</ul></li>';
                break;
              case "11":
                replays += '<li><input type="checkbox" id="item-'+ parentItem +'" /><label for="item-'+ parentItem +'">Summoner\'s Rift (11)</label><ul>';
                for(var replayItem in replaysObject[replay]){
                  replays += ' <li><a href="/cdn/replays/11/'+ data.id +'/'+ replaysObject[replay][replayItem] +'" download><div class="download-icon"></div>'+ replaysObject[replay][replayItem] +'</a></li>';
                }
                replays += '</ul></li>';
                break;   
              case "12":
                replays += '<li><input type="checkbox" id="item-'+ parentItem +'" /><label for="item-'+ parentItem +'">Howling Abyss (12)</label><ul>';
                for(var replayItem in replaysObject[replay]){
                  replays += ' <li><a href="/cdn/replays/12/'+ data.id +'/'+ replaysObject[replay][replayItem] +'" download><div class="download-icon"></div>'+ replaysObject[replay][replayItem] +'</a></li>';
                }
                replays += '</ul></li>';
                break;
            }
            parentItem++;
          }
          replays += "</ul></div>";
          
          if(replaysObject == null)
            replays += "No Replays available."; 
          
					return fn.format(templates.modalPiece, {
						name: data.name,
						title: data.title,
						img: this.model.getImg(data.id, {src:'full'}),
						classicItems: recItems('Classic'),
						odinItems: recItems('Odin'),
						spells: spells,
						lore: data.lore,
            replays: replays
					});
				},
				onFill: function () {
					var box = fn.$(this.box), paneApis = {};
					box.find('[data-scrollpane]').each(function()
					{
						var $this = $(this);
						paneApis[$this.attr('data-scrollpane')] = $this.jScrollPane({
							showArrows: true,
							correctPaneWidth: false
						}).data('jsp');
					});
					
					box.find('[data-switch]').click(function () {
						var $this = $(this),
							switchName = $this.attr('data-switch');
						
						box.find('.pane').addClass('ninja'); 
						box.find('.btn').removeClass('btn-primary');
						$this.addClass('btn-primary');
						box.find('[data-pane="'+switchName+'"]').removeClass('ninja');
						
						if(paneApis[switchName])
						{
							paneApis[switchName].reinitialise();
						}
					});
					
					box.bind('mousewheel',function () { return false; });
				}
			});
		}
	};
}());