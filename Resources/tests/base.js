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

var runAutomated = function(){
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

exports.build = function(args){
	var tableView = Titanium.UI.createTableView();
	var rowdata = [];
	rowdata.push(Titanium.UI.createTableViewRow({
		title: 'Run automated tests'
	}));
	rowdata.push(Titanium.UI.createTableViewRow({
		title: 'Slideshow',
		module: 'tests/ui/slideshow/slideshow'
	}));
	tableView.data = rowdata;
	
	tableView.addEventListener('click',function(e){
		if(e.rowData.title == 'Run automated tests'){
			runAutomated();
		} else if(e.rowData.module){
			var newWindow = Ti.UI.createWindow({
				animated: true,
				title: e.rowData.title
			});
			var newWindowBuilder = require(e.rowData.module);
			newWindowBuilder.build({thisWindow: newWindow, tab: args.tab});
			args.tab.open(newWindow);
		}
	});
	args.thisWindow.add(tableView);
};
