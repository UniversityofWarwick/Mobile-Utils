var TestStructure = {
	utils: {
		datetime: [
			'datetime'
		]
	}
};

exports.build = function(){
	var fetchAndRun = function(key, stuctureObject){
		if(stuctureObject.splice){ // is an array of tests
			stuctureObject.forEach(function(testGroup){
				var testResults = require('tests/' + key + '/' + testGroup).Tests();
				for(test in testResults){
					if(testResults[test])
						Ti.API.info('tests/' + key + '/' + testGroup + '/' + test + ' PASS');
					else
						Ti.API.error('tests/' + key + '/' + testGroup + '/' + test + ' FAIL');
				}
			});
			
		} else {
			for(tests in stuctureObject){
				fetchAndRun(key + '/' + tests, stuctureObject[tests]);
			}
		}
	}
	
	for(tests in TestStructure){
		fetchAndRun(tests, TestStructure[tests]);
	}
};
