Riot.QATool = Riot.QATool || {};

Riot.QATool.ProfileiconApp = (function () {
    var dd, fn,
        templates = {};

    return {
        init: function () {
            dd = Riot.DDragon;
            fn = dd.fn;

            dd.addDisplay({
                type: 'summoner_modal',
                // Expects: Individual Item Object
                success: function(data)
                {
                    return ''+
                        this.model.getImg(data.id)+
                        '<div class="info">'+
                        '<div class="name">'+data.name+'</div>'+
                        '<div class="description">'+data.description+'</div>'+
                        '</div>';
                }
            });

            // These list out the individual pieces
            dd.addDisplay({
                type: 'summonerpiece',
                // Expects: Individual Item Object
                success: function(data)
                {
                    return ''+
                        '<div class="listpiece" data-rg-name="'+this.model.name+'" data-rg-id="'+data.id+'">'+
                        this.model.getImg(data.id)+
                        '<div class="name">'+data.name+'</div>'+
                        '</div>';
                }
            });

            dd.addDisplay({
                type: 'summoner_container',
                // Expects: Array of Items
                success: function(data) {
                    fn.$('#filter-bar, #righttool, #sorttool').addClass('ninja');

                    return dd.displayList.call(this,'summonerpiece',data);
                }
            });
        }
    };
}());