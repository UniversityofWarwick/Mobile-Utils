var class2type = {
	'[object Boolean]': 'boolean',
	'[object Number]': 'number',
	'[object String]': 'string',
	'[object Function]': 'function',
	'[object Array]': 'array',
	'[object Date]': 'date',
	'[object RegExp]': 'regexp',
	'[object Object]': 'object'
};

jQuery = {
	type: function( obj ) {
		return obj == null ?
			String( obj ) :
			class2type[ toString.call(obj) ] || "object";
	},
	
	isFunction: function( obj ) {
		return jQuery.type(obj) === "function";
	},
	
	extend: function(target, options) {
		var options, name, src, copy,
			target = target || {},
			i = 1,
			options = options || {};
	
		// Extend the base object
		for ( name in options ) {
			src = target[ name ];
			copy = options[ name ];

			// Prevent never-ending loop
			if ( target === copy ) {
				continue;
			}

			// Don't bring in undefined values
			if ( copy !== undefined ) {
				target[ name ] = copy;
			}
		}
	
		// Return the modified object
		return target;
	}
};

module.exports = jQuery;
