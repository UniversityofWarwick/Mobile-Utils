/**
 * @author Matt Jones
 */

exports.FullDaysOfTheWeeks = function(locale){
	if(!locale)
		locale = 'en';
		
	switch (locale) {
		case 'en': return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
	}
};

exports.ShortDaysOfTheWeeks = function(locale){
	if(!locale)
		locale = 'en';
		
	switch (locale) {
		case 'en': return ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
	}
};

exports.FullMonthsOfTheYear = function(locale){
	if(!locale)
		locale = 'en';
		
	switch (locale) {
		case 'en': return ["January","February","March","April","May","June","July","August","September","October","November","December"];
	}
};

exports.ShortMonthsOfTheYear = function(locale){
	if(!locale)
		locale = 'en';
		
	switch (locale) {
		case 'en': return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
	}
};
