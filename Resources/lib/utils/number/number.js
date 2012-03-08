/**
 * @author Matt Jones
 */

exports.ToPaddedString = function(number, length){
	var string = number.toString(10);
	for(var i=0, stringLength=string.length; i<length-stringLength; i++){
		string = '0' + string;
	}
	return string;
};

/**
 * Get the ordinal suffix (st, nd, rd, th) for a given number
 * 
 * @param {String|Number} number The number to check against
 * @returns {String} The oridinal suffix string
 */
exports.OrdinalSuffix = function(number){
	var lastCharacter = number.toString().charAt(number.toString().length - 1);
	if(lastCharacter == 1 && number != 11)
		return 'st';
	else if(lastCharacter == 2 && number != 12)
		return 'nd';
	else if(lastCharacter == 3 && number != 13)
		return 'rd';
	else
		return 'th';
};
