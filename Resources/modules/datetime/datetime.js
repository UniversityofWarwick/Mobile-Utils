/**
 * @author Matt Jones
 */

exports.NameLists = require('./name-lists');

/**
 * Get the ordinal suffix (st, nd, rd, th) for a given number
 * 
 * @param {String|Number} dateNumber The number to check against
 * @returns {String} The oridinal suffix string
 */
exports.OrdinalSuffix = function(dateNumber){
	var lastCharacter = dateNumber.toString().charAt(dateNumber.toString().length - 1);
	if(lastCharacter == 1 && dateNumber != 11)
		return 'st';
	else if(lastCharacter == 2 && dateNumber != 12)
		return 'nd';
	else if(lastCharacter == 3 && dateNumber != 13)
		return 'rd';
	else
		return 'th';
};
