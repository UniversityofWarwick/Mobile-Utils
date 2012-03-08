/**
 * @author Matt Jones
 */

var NumberLib = require('lib/utils/number/number');

exports.NameLists = require('lib/utils/datetime/name-lists');

/**
 * Format the given DateTime according to the given string.
 * Supported formats:
 * 	%a - Short week day e.g. 'Sun'
 *  %A - Full week day e.g. 'Sunday'
 *  %b - Short month e.g. 'Jan'
 *  %B - Full month e.g. 'January'
 *  %c - JavaScript date string i.e. Date.toString()
 *  %d - Day of the month, zero-padded
 *  %D - Day of the month, no padding
 *  %e - Millis since the epoch
 *  %h - Hour of the day, 24-hour, zero-padded
 *  %H - Hour of the day, 24-hour, no padding
 *  %i - Hour of the day, 12-hour, zero-padded
 *  %I - Hour of the day, 12-hour, no padding
 *  %k - Month of the year 1-indexed, zero-padded
 *  %K - Month of the year 1-indexed, no padding
 *  %l - Millis of second, zero-padded
 *  %L - Millis of second, no padding
 *  %m - Minute of the hour, zero-padded
 *  %M - Minute of the hour, no padding
 *  %o - Ordinal suffix (st, nd, rd, th)
 *  %O - Ordinal suffix (ST, ND, RD, TH)
 *  %p - am or pm (12 midday is 12pm for simplicity)
 *  %P - AM or PM (12 midday is 12pm for simplicity)
 *  %s - Seconds of the minute, zero-padded
 *  %S - Seconds of the minute, no padding
 *  %w - Day of the week, 0 is Sunday, no padding
 *  %y - 2 digit year
 *  %Y - 4 digit year
 *  %% - Literal % character
 * 
 * @param {Date} dateObject The DateTime to format
 * @param {String} formatString The string containing the formatting information
 * @returns {String} The formatted DateTime
 */
exports.Strftime = function(dateObject, formatString){
	var replacements = {
		'a': function(dateObject){ return exports.NameLists.ShortDaysOfTheWeek[dateObject.getDay()]; },
		'A': function(dateObject){ return exports.NameLists.FullDaysOfTheWeek[dateObject.getDay()]; },
		'b': function(dateObject){ return exports.NameLists.ShortMonthsOfTheYear[dateObject.getMonth()]; },
		'B': function(dateObject){ return exports.NameLists.FullMonthsOfTheYear[dateObject.getMonth()]; },
		'c': function(dateObject){ return dateObject.toString(); },
		'd': function(dateObject){ return NumberLib.ToPaddedString(dateObject.getDate(),2); },
		'D': function(dateObject){ return dateObject.getDate(); },
		'e': function(dateObject){ return dateObject.valueOf(); },
		'h': function(dateObject){ return NumberLib.ToPaddedString(dateObject.getHours(),2); },
		'H': function(dateObject){ return dateObject.getHours(); },
		'i': function(dateObject){ return NumberLib.ToPaddedString(replacements['I'](dateObject),2); },
		'I': function(dateObject){
			var hours = dateObject.getHours();
			if(hours == 0)
				return 12;
			else if (hours > 12)
				return hours - 12;
			else
				return hours;
				
		},
		'k': function(dateObject){ return NumberLib.ToPaddedString(dateObject.getMonth()+1,2); },
		'K': function(dateObject){ return dateObject.getMonth()+1; },
		'l': function(dateObject){ return NumberLib.ToPaddedString(dateObject.getMilliseconds(),4); },
		'L': function(dateObject){ return dateObject.getMilliseconds(); },
		'm': function(dateObject){ return NumberLib.ToPaddedString(dateObject.getMinutes(),2); },
		'M': function(dateObject){ return dateObject.getMinutes(); },
		'o': function(dateObject){ return NumberLib.OrdinalSuffix(dateObject.getDate()); },
		'O': function(dateObject){ return NumberLib.OrdinalSuffix(dateObject.getDate()).toUpperCase(); },
		'p': function(dateObject){ return (dateObject.getHours() < 12)? 'am' : 'pm'; },
		'P': function(dateObject){ return replacements['p'](dateObject).toUpperCase(); },
		's': function(dateObject){ return NumberLib.ToPaddedString(dateObject.getSeconds(),2); },
		'S': function(dateObject){ return dateObject.getSeconds(); },
		'w': function(dateObject){ return dateObject.getDay(); },
		'y': function(dateObject){ return dateObject.getFullYear().toString().substr(dateObject.getFullYear().toString().length-2); },
		'Y': function(dateObject){ return NumberLib.ToPaddedString(dateObject.getFullYear(),4); },
		'%': function(){ return '%'; }
	};
		
	return formatString.replace(/%([aAbBcdDehHiIkKlLmMoOpPsSwyY%])/g,function(m0,m1){
		return replacements[m1](dateObject);
	});
};
