/**
 * @class Riot.ClassManager
 * @singleton
 */
(function () {
	var BP = Riot.Base.prototype,
		Manager = Riot.ClassManager = (function () {
		//used by define
		//courtesy of Douglas Crockford
		var create = (function () {
			function F() {};
			
			return function (obj) {
				F.prototype = obj;
				
				return new F();
			}
		}());
	
		return {
			/**
			 * @method
			 * Defines a new class.
			 * @param {String} name The name of the class. This should be a valid object path.
			 * @param {Object} config The config object used to create the class.
			 * @param {String} config.extend The object path to the class this class extends.
			 * @param {String[]} config.mixins An array of object paths to mixin objects that need to be applied to this class.
			 * @parma {Object} config.statics An object of key/value pairs used to define static properties or methods for this class.
			 * @param {Function} callback The callback function to call after the class has been created.
			 * @param {Object} callback.Class The class that was created.
			 */
			define: function (name, config, callback) {
				name = name.split('.');
				
				var className = name.pop(),
					configFilter = {
						statics: true,
						mixins: true,
						extend: true
					},
					obj, extend, key, i, length;
				
				config = Riot.applyIf(config, {
					extend: 'Riot.Base',
					mixins: [],
					statics: {}
				});
				
				name = name.join('.');
				
				obj = Riot.namespace(name);
				
				obj[className] = function () {
					var me = this;
					
					me.init.apply(me, arguments);
				};
				
				obj = obj[className];
				
				extend = Riot.objectQuery(config.extend);
				
				obj.prototype = create(extend.prototype);
				obj.superClass = extend;
				
				for (key in config) {
					if (config.hasOwnProperty(key) && !configFilter[key]) {
						BP.addMember.call(obj, key, config[key]);
					}
				}
				
				for (key in config.statics) {
					if (config.statics.hasOwnProperty(key) && !obj[key]) {
						obj[key] = config.statics[key];
					}
				}
				
				for (i = 0, length = config.mixins.length; i < length; i = i + 1) {
					BP.addMixin.call(obj, config.mixins[i]);
				}
				
				if (callback) {
					callback(obj);
				}
			},
			
			getInstantiator: function (length) {
				var me = this;
				
				me.instantiators = me.instantiators || [];
				
				if (!me.instantiators[length]) {
					var args = [],
						i;
					
					for (i = 0; i < length; i = i + 1) {
						args.push('a[' + i + ']');
					}
					
					me.instantiators[length] = new Function('c', 'a', 'return new c(' + args.join(',') + ');');
				}
				
				return me.instantiators[length];
			},
			/**
			 * @method
			 * Creates an object based on the passed class name.
			 * @param {String} className The class that needs to be instantiated.
			 * @param {Object...} args Any arguments that need to be passed to the class' constructor.
			 * @return {Object} The instantiated object.
			 */
			instantiate: function () {
				var me = this,
					args = Array.prototype.slice.call(arguments, 0),
					className = args.shift(),
					cls = Riot.objectQuery(className);
				
				return me.getInstantiator(args.length)(cls, args);
			}
		};
	}());
	
	/**
	 * @method create
	 * @member Riot
	 * @alias Riot.ClassManager#instantiate
	 */
	Riot.create = function () {
		return Manager.instantiate.apply(Manager, arguments);
	};
	/**
	 * @method define
	 * @member Riot
	 * @alias Riot.ClassManager#define
	 */
	Riot.define = function () {
		return Manager.define.apply(Manager, arguments);
	};
}());