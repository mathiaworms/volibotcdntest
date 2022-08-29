(function () {
	var EP = Riot.dom.Element.prototype;

	EP.getjQuery = function () {
		var me = this;

		if (me.jQuery) {
			return me.jQuery;
		}

		me.jQuery = jQuery(me.dom);

		return me.jQuery;
	};

	EP.doAddClass = function (cls) {
		var me = this,
			jq = me.getjQuery();

		if (Riot.isArray(cls)) {
			cls = cls.join(' ');
		}

		jq.addClass(cls);
	};

	EP.doRemoveClass = function (cls) {
		var me = this,
			jq = me.getjQuery();

		if (Riot.isArray(cls)) {
			cls = cls.join(' ');
		}

		jq.removeClass(cls);
	};

	EP.doRemove = function () {
		var me = this,
			jq = me.getjQuery();

		jq.remove();
	};

	EP.doAppendTo = function (target) {
		var me = this,
			jq = me.getjQuery();

		jq.appendTo(target);
	};

	EP.doInsertAfter = function (target) {
		var me = this,
			jq = me.getjQuery();

		jq.insertAfter(target);
	};

	EP.doInsertBefore = function (target) {
		var me = this,
			jq = me.getjQuery();

		jq.insertBefore(target);
	};

	EP.show = function () {
		var me = this,
			jq = me.getjQuery();

		jq.show();

		return me;
	};

	EP.hide = function () {
		var me = this,
			jq = me.getjQuery();

		jq.hide();

		return me;
	};

	EP.get = function (attr) {
		var me = this,
			jq = me.getjQuery();

		return jq.attr(attr);
	};

	EP.set = function (attr, value) {
		var me = this,
			jq = me.getjQuery();

		jq.attr(attr, value);

		return me;
	};

	EP.html = function (html) {
		var me = this,
			jq = me.getjQuery();

		jq.html(html);

		return me;
	};

	EP.doSetStyle = function (key, value) {
		var me = this,
			jq = me.getjQuery();

		key = key.replace(/([A-Z])/g, '-$1');

		jq.css(key, value);
	};

	EP.on = function (ename, fn, scope) {
		var me = this,
			jq = me.getjQuery();

		if (scope) {
			fn = jQuery.proxy(fn, scope);
		}

		jq.on(ename, fn);

		return me;
	};

	EP.detach = function () {
		var me = this,
			jq = me.getjQuery();

		jq.detach();

		return me;
	};
}());