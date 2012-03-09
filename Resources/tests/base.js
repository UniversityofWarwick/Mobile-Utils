var TestStructure = {
	utils: {
		datetime: [
			'datetime'
		],
		sitebuilder: [
			'sitebuilder'
		]
	}
};

exports.build = function(){
	var fetchAndRun = function(key, stuctureObject){
		if(stuctureObject.splice){ // is an array of tests
			stuctureObject.forEach(function(testGroup){
				var testLib = require('tests/' + key + '/' + testGroup);
				if(testLib.AsyncTests){
					var tests = testLib.AsyncTests();
					for(test in tests){
						tests[test](function(result){
							if(result)
								Ti.API.info('tests/' + key + '/' + testGroup + '/' + test + ' PASS');
							else
								Ti.API.error('tests/' + key + '/' + testGroup + '/' + test + ' FAIL');
						});
					}
				}
				if(testLib.Tests){
					var testResults = testLib.Tests();
					for(test in testResults){
						if(testResults[test])
							Ti.API.info('tests/' + key + '/' + testGroup + '/' + test + ' PASS');
						else
							Ti.API.error('tests/' + key + '/' + testGroup + '/' + test + ' FAIL');
					}
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
