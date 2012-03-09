var Sitebuilder = require('lib/utils/sitebuilder/sitebuilder');

var getPageTest = function(callback){
	var testPath = '/about';
	
	Sitebuilder.getPageByPath(testPath, function(result){
		if(result.errors.length > 0 || !result.page){
			callback(false);return;
		} else {
			// Should be a HtmlPage so check page heading (which is unique to HtmlPage)
			callback(result.page.getPageHeading() == 'About the University and Campus');return;
		}
	});
};

var getPagesTest = function(callback){
	var testPath = '/about';
	
	Sitebuilder.getPageByPath(testPath, function(result){
		result.page.getChildren(function(result){
			if(result.errors.length > 0 || result.pages.length == 0){
				callback(false);return;
			} else {
				// Should be some HtmlPages and BinaryPages
				callback(result.pages.some(function(p){ return p.page.pageType == 'html' || p.page.pageType == 'binary'; }));return;
			}
		})
	});
};

exports.AsyncTests = function(){
	return {
		'getPageTest' : getPageTest,
		'getPagesTest' : getPagesTest
	};
};
