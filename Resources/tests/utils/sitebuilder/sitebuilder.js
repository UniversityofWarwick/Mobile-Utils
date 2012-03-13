var SitebuilderLib = require('lib/utils/sitebuilder/sitebuilder').Sitebuilder;
var Sitebuilder = new SitebuilderLib({
	oauth: {
		signatureMethod: 'HMAC-SHA1',
		consumerSecret: REPLACE_ME_WITH_REAL_VALUE,
	    consumerKey: REPLACE_ME_WITH_REAL_VALUE,
	    requestTokenURL: 'https://websignon.warwick.ac.uk/oauth/requestToken?scope=urn%3Awww2.warwick.ac.uk%3Asitebuilder2%3Aread%3Aservice',
	    authorizeTokenURL: 'https://websignon.warwick.ac.uk/oauth/authorise',
	    accessTokenURL: 'https://websignon.warwick.ac.uk/oauth/accessToken',
	    serviceName: 'warwick',
	    catchURL: /.+user_id=.+/,
	    catchString: /.*<title>.*Access granted<\/title>.*/
	}
});

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
		result.page.getChildren(Sitebuilder, function(result){
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
