Riot.namespace('Riot.util');

(function () {
	var Observable = Riot.util.Observable = function () {};
	
	Observable.prototype = {
		listeners: null,
		events: null,
		
		addEvents: function (events) {
			var me = this,
				i, length;
			
			me.events = me.events || {};
			
			function addEvent (ename) {
				if (!(ename in me.events)) {
					me.events[ename] = [];
				}
			}
			
			if (Riot.isString(events)) {
				addEvent(events);
			} else if (Riot.isArray(events)) {
				for (i = 0, length = events.length; i < length; i = i + 1) {
					addEvent(events[i]);
				}
			} else if (Riot.isObject(events)) {
				for (i in events) {
					if (events.hasOwnProperty(i)) {
						addEvent(i);
					}
				}
			}
		},
		
		addListener: (function () {
			function createSingle (fn, listener) {
				var me = this;
				
				return function () {
					me.removeListener(listener.ename, listener.fn);
					
					fn();
				};
			}
			
			return function (ename, fn, scope, options) {
				var me = this,
					callback = fn,
					listener = {
						fn: fn,
						scope: scope,
						ename: ename
					};
				
				if (!options) {
					options = {};
				}
				
				if (!me.hasEvent(ename)) {
					return false;
				}
				
				if (options.single) {
					callback = createSingle.call(me, callback, listener);
				}
				
				listener.fireFn = callback;
				
				me.events[ename].push(listener);
			};
		}()),
		
		fireEvent: function () {
			var me = this,
				args = Array.prototype.slice.call(arguments, 0),
				ename = args.shift(),
				listeners, i, length;
			
			if (!me.hasEvent(ename)) {
				return false;
			}
			
			listeners = me.events[ename];
			
			for (i = 0, length = listeners.length; i < length; i = i + 1) {
				if (listeners[i].fireFn.apply(listeners[i].scope || {}, args) === false) {
					return false;
				}
			}
			
			return true;
		},
		
		hasEvent: function (ename) {
			var me = this;
			
			return (ename in me.events);
		},
		
		removeListener: function (ename, fn) {
			var me = this,
				listeners, i, length;
			
			if (!me.hasEvent(ename)) {
				return;
			}
			
			listeners = me.events[ename];
			
			for (i = 0, length = listeners.length; i < length; i = i + 1) {
				if (listeners[i].fn === fn) {
					listeners.splice(i, 1);
				}
			}
		}
	};
	
	Observable.prototype.on = Observable.prototype.addListener;
	Observable.prototype.un = Observable.prototype.removeListener;
}());