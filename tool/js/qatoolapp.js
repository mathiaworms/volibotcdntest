// Array.indexOf shiv
if(!Array.prototype.indexOf){Array.prototype.indexOf=function(elt){var len=this.length>>>0;var from=Number(arguments[1])||0;from=((from<0)?Math.ceil(from):Math.floor(from));if(from<0){from+=len}for(;from<len;from++){if(from in this&&this[from]===elt){return from}}return -1}};

/* Some messaging tools */
function mss (message) {
	Riot.DDragon.fn.$('#messaging')[0].innerHTML += message+'<br />';
};

function msh (message) {
	Riot.DDragon.fn.$('#hardmessaging')[0].innerHTML = message;
};

// Current
Riot.DDragon.addApp(['language', 'item', 'champion'], function () {
	var rg = Riot,
		dd = rg.DDragon,
		fn = dd.fn;
	
	// Make jQuery the selector engine for fn.$
	dd.fn$serve = jQuery;

	// Make sure the messaging system is working
	mss('Data Dragon QA App 3');
	
	// Which data type we begin with
	dd.fsys = {c:'champion'};
	
	rg.QATool.Filter.setup();
	
	rg.QATool.ChampionApp.init();
	rg.QATool.ItemApp.init();
	rg.QATool.MasteryApp.init();
	rg.QATool.SummonerApp.init();
	rg.QATool.ProfileiconApp.init();
	
	// The large area display
	var fullarea = dd.buildController('champion', 'champion_container', 'container_#fullarea');
	fullarea.redraw('collect', {key: 'searchName'});
	fullarea.show();
	
	// Modals
	// Modals are restricted to left click opening only
	// They stop repropogation of themselves inside their own box
	// They getFull instead of the partial get
	// and they hide tooltips
	var modal = dd.buildController(false, 'champion', 'champion_modal', 'modal');
	
	modal.addReactiveEvent('click', {
		buttonRestrict: 0,
		stopSimilar: true,
		allowModelChange: false,
		action: 'getFull',
		success: function () {
			dd.endApp.tooltip.hide();
		}
	});
	
	// Gathers the search information from the page and runs it against the fullarea
	function runFilter () {
		var text = rg.QATool.Filter.getFilters(),
			searchy = fn.$('#searchy').val(),
			filters = text.split("\n");
		
		if (filters[0] === '') {
			filters[0] = 'searchKey:'+searchy;
		} else if (searchy !== '') {
			filters.push('searchKey:'+searchy);
		}
		fullarea.redraw('collect',filters,{key: rg.QATool.Filter.getSort()});
	}
	
	function updateViewport () {
		fullarea.model.deleteCollect();
		runFilter();
	}
	
	rg.QATool.Filter.onAdd = updateViewport;
	rg.QATool.Filter.onRemove = updateViewport;
	
	// Plan for a data type button to be pushed
	fn.fire.plan('dataswitch', {}, function (planData,execData,fireId) {
		var o = dd.fsys.c;
		var t = dd.fsys.c = execData.type;
		
		if (rg.QATool.MasteryApp.rendered) {
			rg.QATool.MasteryApp.onDestroy();
		}
		
		if (!((o === 'item' || o === 'rune') && (t === 'item' || t === 'rune')))
		{
			fn.$('#filters').html('');
			fn.$('#sortby').html('');
			Riot.QATool.Filter.clear();
		}
		fn.$('#searchy').val('');
		fullarea.model.deleteCollect();
		
		fn.radioClass(fn.$('#' + t + '-btn')[0], 'btn-primary');
		
		fullarea.newMV(t);
		
		runFilter();
	});
	
	// Watch the searchy for changes, react by running the filter
	// If the newValue doesn't have the oldValue, we also wipe out old filters
	fn.watch('#searchy', 'value', function (elem,newValue,oldValue) {
		if(newValue.indexOf(oldValue) === -1) {
			fullarea.model.deleteCollect();
		}
		
		runFilter();
	});
	
	fn.$('#filtersclear').click(function () {
		Riot.QATool.Filter.clear();
		
		fullarea.model.deleteCollect();
		
		runFilter();
	});
	
	fn.$('#allgetfull').click(function () {
		var curModel = dd.useModel(Riot.QATool.Filter.currentSection);
		fn.each(curModel.keys,function(v) {
			curModel.getFull(v);
		});
	});
	
	fn.$('#clearls').click(function () {
		if(dd.ls) {
			localStorage.clear();
		}
	});
	
	fn.$('#sortby').change((function () {
		var sorting = false;
		
		return function () {
			if (!sorting) {
				sorting = true;
				
				updateViewport();
				
				sorting = false;
			}
		};
	}()));
	
});

// Switch data types  
function switchData (type) {
	if(typeof(Riot) === 'object' && typeof(Riot.DDragon.fn) === 'object') {
		Riot.DDragon.fn.fire.exec('dataswitch',{'type':type});
	}
}
