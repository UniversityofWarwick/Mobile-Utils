var DateTimeLib = require('lib/utils/datetime/datetime');

var strftimeTest = function(){
	var testDate = new Date();
	testDate.setFullYear(2012);
	testDate.setMonth(0);
	testDate.setDate(1);
	testDate.setHours(9);
	testDate.setMinutes(5);
	testDate.setSeconds(5);
	testDate.setMilliseconds(40);
	
	var testString = "Sun Sunday Jan January 01 1 1325408705040 09 9 09 9 01 1 040 40 05 5 st ST am AM 05 5 0 12 2012 %";
	var testPattern = "%a %A %b %B %d %D %e %h %H %i %I %k %K %l %L %m %M %o %O %p %P %s %S %w %y %Y %%";
	var result = DateTimeLib.Strftime(testDate, testPattern);
	return testString == result;
};

var isoDateTest = function(){
	var testDate = new Date();
	testDate.setUTCFullYear(2012);
	testDate.setUTCMonth(0);
	testDate.setUTCDate(1);
	testDate.setUTCHours(9);
	testDate.setUTCMinutes(5);
	testDate.setUTCSeconds(5);
	testDate.setUTCMilliseconds(40);
	
	var testString = "2012-01-01T09:05:05.040Z";
	var result = DateTimeLib.ParseISO8601Date(testString);
	
	return result.valueOf() == testDate.valueOf();
};

exports.Tests = function(){
	return {
		'strftimeTest': strftimeTest(),
		'isoDateTest': isoDateTest()
	};
};
