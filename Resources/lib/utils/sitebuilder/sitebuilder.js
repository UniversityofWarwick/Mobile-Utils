/**
 * @author Matt Jones
 */

var $ = require('lib/utils/util');

var PagePropertiesJson = 'http://sitebuilder.warwick.ac.uk/sitebuilder2/api/page.json';
var PageCache = {};

Sitebuilder = function(options){
	if(!options)
		options = {};
		
	if(options.oauth){
		var OAuthAdapter = require('lib/utils/oauth/oauth_adapter').OAuthAdapter;
		this.oAuthAdapter = new OAuthAdapter({
			signatureMethod: options.oauth.signatureMethod,
			consumerSecret: options.oauth.consumerSecret,
		    consumerKey: options.oauth.consumerKey,
		    requestTokenURL: options.oauth.requestTokenURL,
		    authorizeTokenURL: options.oauth.authorizeTokenURL,
		    accessTokenURL: options.oauth.accessTokenURL,
		    serviceName: options.oauth.serviceName,
		    catchURL: options.oauth.catchURL,
		    catchString: options.oauth.catchString
		});
	}
		
	Sitebuilder.decorate = function(object){
		Ti.API.debug('Decorating page ' + object.path + ' for page type ' + object.pageType);
		
		switch(object.pageType){
			case 'html': return new HtmlPage(object);
			case 'binary': return new BinaryPage(object);
			case 'redirect': return new RedirectPage(object);
			default: Ti.API.error('Unknown page type: ' + object.pageType); return null;
		}
	};
};

var AbstractPage = function(object){
	$.extend(this, object || {});
};

$.extend(AbstractPage.prototype, {
	getUrl : function(){
		return this.url;	
	},
	
	getPathname : function(){
		return this.path;
	},
	
	getLinkCaption : function(){
		return this.linkCaption;
	},
	
	getDescription : function(){
		return this.description;
	},
	
	getKeywords : function(){
		return this.keywords;
	},
	
	getChildren : function(instance, callback){
		instance.getPagesByPaths(this.path, this.children, callback);
	}
})

var HtmlPage = function(object){
	AbstractPage.call(this, object);
};
$.extend(HtmlPage.prototype, AbstractPage.prototype);
$.extend(HtmlPage.prototype, {
	getTitleBarCaption :function(){
		return this.shortTitle;
	},
	
	getPageHeading :function(){
		return this.pageHeading;
	}
})

var BinaryPage = function(object){
	AbstractPage.call(this, object);
};
$.extend(BinaryPage.prototype, AbstractPage.prototype);

var RedirectPage = function(object){
	AbstractPage.call(this, object);
};
$.extend(RedirectPage.prototype, AbstractPage.prototype);


// Public functions

/**
 * Constructor
 * 
 * @param {Object} [options] A hash of options with the following fields:
 * 		@param {Object} [oauth] A hash of OAuth options with the following fields:
 *			 
 * 
 */
exports.Sitebuilder = Sitebuilder

/**
 * Get a page by its path
 * 
 * @param {String} path The path of the page
 * 
 * @param {Function} callback The function to call when the request is complete
 * 		The callback is called with an object as its parameter, with the following
 * 		fields:
 * 		@param {Object} page A Sitebuilder page object, 
 * 			one of HtmlPage, BinaryPage, RedirectPage
 * 		@param {Array} errors Any errors associated with the request
 * 		@param {Boolean} fromCache Whether the page was returned from the cache
 * 
 * @param {Boolean} [forceNoCache=false] Whether to get the page from Sitebuilder, even
 * 	if available in the cache
 */
exports.Sitebuilder.prototype.getPageByPath = function(path, callback, forceNoCache){
	if(!forceNoCache && PageCache[path]){
		Ti.API.debug('Returning page ' + path + ' from cache');
		callback({page: PageCache[path], errors: [], fromCache: true});
	} else {
		var successCallback = function(){
			try{
				Ti.API.debug('Response received from page details');
				var json = JSON.parse(this.responseText);
				var page = Sitebuilder.decorate(json);
				PageCache[path] = page;
				Ti.API.debug(path + ' stored in cache');
				callback({page: PageCache[path], errors: [], fromCache: false});
			} catch(e) {
				Titanium.API.error('Error parsing JSON data ' + e);
				callback({page: null, errors: [["Error parsing JSON data",e]], fromCache: false});
			}
			
		};
		var failureCallback = function(e){
			callback({page: null, errors: [["Error making request",this.getStatusText()]], fromCache: false, e: e});
		};
		
		if(this.oAuthAdapter){
			this.oAuthAdapter.send({
				method: 'GET',
				url: PagePropertiesJson + '?page=' + path + '&rn' + Math.round(Math.random()*10000),
				successCallback: successCallback,
				failureCallback: failureCallback
			});
		} else {
			var client = Titanium.Network.createHTTPClient();
			client.open('GET', PagePropertiesJson + '?page=' + path + '&rn' + Math.round(Math.random()*10000));
			client.onload = successCallback;
			client.onerror = failureCallback;
			client.send();
		}
	}
};

/**
 * Get pages from under a parent 
 * 
 * @param {String} parentPath The path of the parent page
 * 
 * @param {Array} paths A list of the pages to retrieve
 * 
 * @param {Function} callback The function to call when the request is complete
 * 		The callback is called with an object as its parameter, with the following
 * 		fields:
 * 		@param {Array} pages An array of objects:
 * 			@param {Object} page A Sitebuilder page object, 
 * 				one of HtmlPage, BinaryPage, RedirectPage
 * 			@param {Boolean} fromCache Whether the page was returned from the cache
 * 		@param {Array} errors Any errors associated with the request
 * 
 * @param {Boolean} [forceNoCache=false] Whether to get the page from Sitebuilder, even
 * 	if available in the cache
 */
exports.Sitebuilder.prototype.getPagesByPaths = function(parentPath, paths, callback, forceNoCache){
	var results = [], urlsToGet = [];
	if(!forceNoCache){
		paths.forEach(function(url){
			if(PageCache[url]){
				Ti.API.debug('Returning page ' + url + ' from cache');
				results.push({ page: PageCache[url], fromCache: true });
			} else {
				urlsToGet.push(url);
			}
		});
	}
	
	if(urlsToGet.length > 0){
		var successCallback = function(){
			try{
				var json = JSON.parse(this.responseText);
				json.forEach(function(p){
					var page = Sitebuilder.decorate(p);
					results.push({ page: p, fromCache: false });
					PageCache[page.path] = page;
					Ti.API.debug(page.path + ' stored in cache');
				});
				
				callback({pages: results, errors: []});
			} catch(e) {
				Titanium.API.error('Error parsing JSON data ' + e);
				callback({ pages: results, errors: [["Error parsing JSON data",e]] });
			}
			
		};
		var failureCallback = function(e){
			callback({pages: results, errors: [["Error making request",this.getStatusText()]], e: e });
		};
		
		if(this.oAuthAdapter){
			this.oAuthAdapter.send({
				method: 'POST',
				customHeaders: {
					"content-type": "application/x-www-form-urlencoded"
				},
				url: PagePropertiesJson,
				postBody: 'page=' + parentPath + '&pages=' + urlsToGet.join('&pages=') + '&rn' + Math.round(Math.random()*10000),
				successCallback: successCallback,
				failureCallback: failureCallback
			});
		} else {
			var client = Titanium.Network.createHTTPClient();
			client.open('POST', PagePropertiesJson);
			client.setRequestHeader("content-type", "application/x-www-form-urlencoded");
			client.onload = successCallback;
			client.onerror = failureCallback;
			client.send('page=' + parentPath + '&pages=' + urlsToGet.join('&pages=') + '&rn' + Math.round(Math.random()*10000));
		}		
	} else {
		callback({ pages: results, errors: [] });
	}
};