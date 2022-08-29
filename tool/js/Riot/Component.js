/**
 * @class Riot.Component
 * A generic component class used to render and manage a piece of html.
 */
Riot.define('Riot.Component', {
	mixins: [
		'Riot.util.Observable'
	],
	
	statics: {
		AUTO_ID: 100,
		getAutoId: function () {
			return Riot.Component.AUTO_ID++;
		},

		//Base element template
		elTpl: '<div id="{{ id }}" class="{{ baseClass }} {{ classes }}"></div>'
	},
	
	renderTpl: '',
	baseId: 'riot-component',
	baseClass: 'riot-component',
	
	childEls: null,
	
	/**
	 * @method
	 * Initializes the config object, and then applies the config to the component itself.
	 */
	initConfig: function () {
		var me = this;
		
		Riot.apply(me, me.config);
	},
	
	/**
	 * @method
	 * Initializes the component. This should not be overridden. Use the {@link #initComponent}
	 * method for initialization.
	 * @param {Object} conifg The base config that will be sent to the {@link #initConfig} method.
	 */
	init: function (config) {
		var me = this;
		
		me.addEvents({
			beforerender: true,
			render: true,
			afterrender: true,
			beforedestroy: true
		});
		
		me.config = config;
		me.rendered = false;
		
		me.initConfig(config);
		
		Riot.apply(me, me.config);
		
		me.initComponent();
	},
	
	/**
	 * @method
	 * Adds a css class to the component.
	 * @param {String/String[]} cls The class(es) that need to be added.
	 */
	addClass: function (cls) {
		var me = this,
			i, length;

		if (Riot.isArray(cls)) {
			for (i = 0, length = cls.length; i < length; i = i + 1) {
				me.addClass(cls[i]);
			}

			return;
		}

		if (me.hasClass(cls)) {
			return;
		}
		
		if (!me.rendered) {
			me.classes = me.classes || [];

			if (Riot.indexOf(me.classes, cls) === -1) {
				me.classes.push(cls);
			}
		} else {
			if (!me.hasClass(cls)) {
				me.el.addClass(cls);
			}
		}
	},

	hasClass: function (cls) {
		var me = this;

		if (!me.rendered) {
			return Riot.indexOf(me.classes || [], cls) !== -1;
		}

		return me.el.hasClass(cls);
	},
	
	/**
	 * @method
	 * Removes a css class from the component.
	 * @param {String} cls The class that needs to be removed.
	 */
	removeClass: function (cls) {
		var me = this,
			i, length;
		
		if (!me.rendered) {
			if (!me.classes) {
				return;
			}
			
			for (i = 0, length = me.classes.length; i < length; i = i + 1) {
				if (me.classes[i] === cls) {
					me.classes = me.classes.splice(i, 1);
					
					return;
				}
			}
		} else {
			me.el.removeClass(cls);
		}
	},

	toggleClass: function (cls, onOff) {
		var me = this,
			classes = cls;

		if (Riot.isObject(classes)) {
			for (cls in classes) {
				if (classes.hasOwnProperty(cls)) {
					me.toggleClass(cls, classes[cls]);
				}
			}

			return;
		}

		if (onOff === undefined) {
			onOff = !me.hasClass(cls);
		}

		if (onOff === true) {
			me.addClass(cls);
		} else if (onOff === false) {
			me.removeClass(cls);
		}
	},
	
	/**
	 * @method
	 * Gets the component's id. If the component doesn't have an id, one will be generated.
	 * @return {String} The component's id.
	 */
	getId: function () {
		var me = this;
		
		if (!me.id) {
			me.id = me.baseId + '-' + Riot.Component.getAutoId();
		}
		
		return me.id;
	},
	
	/** 
	 * @method
	 * Gets all css classes currently on the component.
	 * @return {String[]} The css classes.
	 */
	getClasses: function () {
		var me = this;
		
		return me.rendered? me.el.dom.className.split(' ') : me.classes;
	},
	
	/**
	 * @private
	 */
	createFragment: function () {
		var me = this,
			frag = document.createDocumentFragment(),
			div = document.createElement('div');
		
		div.innerHTML = Riot.format(me.elTpl || Riot.Component.elTpl, {
			id: me.getId(),
			classes: (me.getClasses() || []).join(' '),
			baseClass: me.baseClass
		});
		
		me.el = Riot.get(div.childNodes[0]);
		
		frag.appendChild(me.el.dom);
	},
	
	/**
	 * @private
	 */
	getHtml: function () {
		var me = this;
		
		if (me.html) {
			return html;
		}
		
		return Riot.format(me.renderTpl, me.getRenderData());
	},
	
	/**
	 * @private
	 */
	getRenderData: function () {
		var me = this;
		
		if (!me.renderData) {
			me.renderData = {};
		}
		
		me.renderData = me.initRenderData(me.renderData);
		
		return me.renderData;
	},
	
	/** 
	 * @method
	 * Initializes the data that is passed to the render template.
	 * @param {Object} renderData The current data to be passed.
	 * @return {Object} The modified renderData object.
	 */
	initRenderData: function (renderData) {
		var me = this;

		renderData = Riot.applyIf(me.renderData || {}, renderData);
		
		return Riot.applyIf(renderData, {
			id: me.getId()
		});
	},
	
	/**
	 * @method
	 * Renders the component into the dom.
	 * @param {HtmlElement} containerEl The parent element to append the component to.
	 */
	render: function (containerEl) {
		var me = this
		
		if (me.fireEvent('beforerender', me) === false) {
			return;
		}
		
		me.createFragment();
		
		me.el.html(me.getHtml());

		me.initChildEls();

		me.onRender();

		me.fireEvent('render', me);
		
		me.el.appendTo(containerEl);
		
		me.rendered = true;
		
		me.afterRender();
		
		me.fireEvent('afterrender', me);
	},
	
	/** 
	 * @method
	 * Destroys the component, removing it from the dom.
	 */
	destroy: function () {
		var me = this;
		
		if (me.beforeDestroy() === false || me.fireEvent('beforedestroy', me) === false) {
			return;
		}
		
		me.onDestroy();
		
		me.fireEvent('destroy', me);
		
		me.el.dom.parentNode.removeChild(me.el.dom);
	},
	
	/** 
	 * @private
	 */
	initChildEls: function () {
		var me = this,
			key, els;

		if (!me.childEls) {
			me.childEls = {};
		}
		
		for (key in me.childEls) {
			if (me.childEls.hasOwnProperty(key)) {
				els = Riot.query('#' + me.getId() + '-' + me.childEls[key], me.el.dom);

				if (els) {
					me[key] = Riot.get(els[0]);
				}
			}
		}
	},

	//Template Methods
	/**
	 * @method
	 * @template
	 * Initializes the component. This provides a safe way to execute custom initialization code.
	 * This should be overridden.
	 */
	initComponent: Riot.emptyFn,
	/**
	 * @method
	 * @template
	 * Executed after the element is created and the childEls have been gathered.
	 */
	onRender: Riot.emptyFn,
	/**
	 * @method
	 * @template
	 * Executed after the component is rendered into the dom.
	 */
	afterRender: Riot.emptyFn,
	/**
	 * @method
	 * @template
	 * Executed when the component is destroyed.
	 */
	onDestroy: Riot.emptyFn,
	/**
	 * @method
	 * @template
	 * Executed before the component is destroyed.
	 */
	beforeDestroy: Riot.emptyFn
});