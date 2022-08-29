(function () {
	var trimRe = /^\s+|\s+$/g,
		whitespaceRe = /\s/;

	Riot.define('Riot.dom.Element', {
		statics: {
			get: function (el) {
				var id = el;

				if (!el) {
					return null;
				}

				if (el instanceof Riot.dom.Element) {
					return el;
				}

				if (!Riot.isString(el)) {
					id = el.id;
				}

				if (id in Riot.elCache) {
					return Riot.elCache[id];
				}

				return Riot.create('Riot.dom.Element', el);
			}
		},

		init: function (el) {
			var me = this,
				dom = el,
				id;

			if (Riot.isString(dom)) {
				dom = document.getElementById(dom);
			}

			if (!dom) {
				return null;
			}

			id = dom.id;

			if (!id) {
				id = Riot.id('riot-el');

				dom.id = id;
			}

			me.id = id;
			me.dom = dom;

			me.updateClassCache();

			Riot.elCache[me.id] = me;
		},

		updateClassCache: function () {
			var me = this,
				cls, i, length;

			me.clsCache = {};

			if (!me.dom.className) {
				return;
			}

			cls = me.dom.className.replace(trimRe, '').split(whitespaceRe);

			for (i = 0, length = cls.length; i < length; i = i + 1) {
				me.clsCache[cls[i]] = true;
			}
		},

		addClass: function (cls) {
			var me = this;

			me.doAddClass(cls);
			me.updateClassCache();

			return me;
		},

		removeClass: function (cls) {
			me = this;

			me.doRemoveClass(cls);
			me.updateClassCache();

			return me;
		},

		hasClass: function (cls) {
			var me = this,
				i, length;

			if (!Riot.isArray(cls)) {
				return me.clsCache[cls];
			}

			for (i = 0, length = cls.length; i < length; i = i + 1) {
				if (!me.clsCache[cls[i]]) {
					return false;
				}
			}

			return true;
		},

		remove: function () {
			var me = this;

			me.doRemove();

			Riot.elCache[me.id] = null;
		},

		appendTo: function (target) {
			var me = this;

			if (target instanceof Riot.dom.Element) {
				target = target.dom;
			}

			me.doAppendTo(target);

			return me;
		},

		insertAfter: function (target) {
			var me = this;

			if (target instanceof Riot.dom.Element) {
				target = target.dom;
			}

			me.doInsertAfter(target);

			return me;
		},

		insertBefore: function (target) {
			var me = this;

			if (target instanceof Riot.dom.Element) {
				target = target.dom;
			}

			me.doInsertBefore(target);

			return me;
		},

		setStyle: function (style, value) {
			var me = this,
				key

			if (Riot.isString(style)) {
				me.doSetStyle(style, value);

				return me;
			}

			for (key in style) {
				if (style.hasOwnProperty(key)) {
					me.setStyle(key, style[key]);
				}
			}

			return me;
		},

		toggleClass: function (cls, onOff) {
			var me = this,
				classes = cls;

			if (Riot.isString(cls)) {
				if (onOff === undefined) {
					onOff = !me.hasClass(cls);
				}

				classes = {};
				classes[cls] = onOff;
			}

			for (cls in classes) {
				if (classes.hasOwnProperty(cls)) {
					if (classes[cls] === true) {
						if (!me.hasClass(cls)) {
							me.addClass(cls);
						}
					} else if (classes[cls] === false) {
						if (me.hasClass(cls)) {
							me.removeClass(cls);
						}
					}
				}
			}
		},

		//Translator Methods
		//These are defined in the translator files so that libraries can be switched at will.
		doAddClass		: Riot.emptyFn,
		doRemoveClass	: Riot.emptyFn,
		doRemove		: Riot.emptyFn,
		doAppendTo		: Riot.emptyFn,
		doInsertAfter	: Riot.emptyFn,
		doInsertBefore	: Riot.emptyFn,
		doSetStyle		: Riot.emptyFn,
		detach			: Riot.emptyFn,
		show			: Riot.emptyFn,
		hide			: Riot.emptyFn,
		html			: Riot.emptyFn,
		get				: Riot.emptyFn,
		set				: Riot.emptyFn,
		on				: Riot.emptyFn
	});

	Riot.elCache = {};
	Riot.get = Riot.dom.Element.get;
}());