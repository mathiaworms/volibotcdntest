var Riot = Riot || rg || {};

/**
 * @class Riot
 * @singleton
 * The global Riot object. Stores basic utility functions, as well as convenience methods for doing
 * common coding tasks.
 */
(function () {
	var toString = Object.prototype.toString;
	
	/** 
	 * @method
	 * An empty function used to save memory, and create consistency.
	 */
	Riot.emptyFn = function () {};
	
	/** 
	 * @method
	 * Checks to see if the passed item is a string.
	 * @param {Object} value The item to check.
	 * @return {Boolean} Whether or not the passed item is a string.
	 */
	Riot.isString = function (value) {
		return typeof value === 'string';
	};
	/**
	 * @method
	 * Checks to see if the passed item is an object. This accounts for several common cases where
	 * typeof would report the incorrect type.
	 * 
	 * 	typeof null === 'object'; //true
	 * 	Riot.isObject(null); //false
	 *
	 * 	typeof document.body === 'object'; //true
	 * 	Riot.isObject(document.body); //flase
	 *
	 * 	typeof [] === 'object'; //true
	 * 	Riot.isObject([]); //false
	 * @param {Object} value The item to check.
	 * @return {Boolean} Whether or not the passed item is an object.
	 */
	Riot.isObject = function (value) {
		return value !== null &&
			   value !== undefined &&
			   toString.call(value) === '[object Object]' &&
			   value.ownerDocument === undefined;
	};
	
	Riot.isArray = ('isArray' in Array) ? Array.isArray : function (obj) {
		return toString.call(obj) === '[object Array]';
	};

	Riot.indexOf = function (array, item) {
		var i, length;

		for (i = 0, length = array.length; i < length; i = i + 1) {
			if (array[i] === item) {
				return i;
			}
		}

		return -1;
	};
	
	Riot.apply = function () {
		var args = Array.prototype.slice.call(arguments, 0),
			destination = args.shift(),
			source, key;
		
		while (source = args.shift()) {
			for (key in source) {
				if (source.hasOwnProperty(key)) {
					destination[key] = source[key];
				}
			}
		}
		
		return destination;
	};
	
	/**
	 * @method
	 * This merges each argument after data 'under' the data object effectively treating each
	 * additional object passed as a default to the one before it.
	 * 	function myFunc (config) {
	 * 		config = Riot.applyIf(config, {
	 * 			conditions: true,
	 * 			actions: true
	 * 		});
	 * 	
	 * 		if (config.conditions) {
	 * 			console.log('Conditions Run!');
	 * 		}
	 * 	
	 * 		if (config.actions) {
	 * 			console.log('Actions Run!');
	 * 		}
	 * 	}
	 * 	
	 * 	myFunc({
	 * 		conditions: false
	 * 	});
	 * 	
	 * 	//logs 'Actions Run!'
	 * @param {Object} data The base object being merged into.
	 * @param {Object...} under The objects used to default the base data object.
	 * @return {Object} The merged object.
	 */
	Riot.applyIf = function () {
		var args = Array.prototype.slice.call(arguments, 0),
			destination = args.shift(),
			source, key;
		
		while (source = args.shift()) {
			for (key in source) {
				if (source.hasOwnProperty(key)) {
					if (!destination[key]) {
						destination[key] = source[key];
					}
				}
			}
		}
		
		return destination;
	};
	
	/**
	 * @method
	 * Defines a namespace hierarchy from the specified path.
	 * 	rg.dd.namespace('MyApp.MyStuff');
	 * 	MyApp.MyStuff.stuff = 'Look, some stuff!';
	 * @param {String} path The desired hierarchy.
	 * @return {Object} The final object in the hierarchy.
	 */
	Riot.namespace = function (path) {
		var obj = window,
			parts = path.split('.'),
			length = parts.length,
			i, part;
		
		for (i = 0; i < length; i = i + 1) {
			part = parts[i];
			
			if (!obj[part]) {
				obj[part] = {};
			}
			
			obj = obj[part];
		}
		
		return obj;
	};
	
	Riot.objectQuery = function (path, obj) {
		var i, length;
		
		if (!obj) {
			obj = window;
		}
		
		path = path.split('.');
		
		for (i = 0, length = path.length; i < length; i = i + 1) {
			if (obj[path[i]] !== undefined) {
				obj = obj[path[i]];
			} else {
				return;
			}
		}
		
		return obj;
	};
	
	Riot.format = function (template, data) {
		if (Riot.isArray(template)) {
			template = template.join('');
		}
		
		for (var key in data) {
			if (data.hasOwnProperty(key)) {
				template = template.replace(new RegExp('{{ ' + key + ' }}', 'g'), data[key]);
			}
		}
		
		return template;
	};
	
	Riot.each = function (arr, func) {
		if (!Riot.isArray(arr)) {
			func(arr, 0);
			
			return;
		}
		
		for (var i = 0, length = arr.length; i < length; i = i + 1) {
			if (func(arr[i], i) === false) {
				return;
			}
		}
	};

	Riot.id = (function () {
		var AUTO_ID = 100;

		return function (prefix) {
			AUTO_ID = AUTO_ID + 1;

			prefix = prefix || 'riot';

			return prefix + '-' + AUTO_ID;
		};
	}());

	/**
	 * @method
	 * @template
	 * Runs the sepcified query on the DOM returning any nodes that match.
	 */
	Riot.query = jQuery;
}());