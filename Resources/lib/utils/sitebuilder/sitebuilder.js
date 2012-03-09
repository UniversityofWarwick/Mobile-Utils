/**
 * @author Matt Jones
 */

var $ = require('lib/utils/util');

var Sitebuilder = {
	PagePropertiesJson: 'http://sitebuilder.warwick.ac.uk/sitebuilder2/api/page.json',
	PageCache: {},
	
	decorate: function(object){
		Ti.API.debug('Decorating page ' + object.path + ' for page type ' + object.pageType);
		
		switch(object.pageType){
			case 'html': return new HtmlPage(object);
			case 'binary': return new BinaryPage(object);
			case 'redirect': return new RedirectPage(object);
			default: Ti.API.error('Unknown page type: ' + object.pageType); return null;
		}
	},
	
	getPageByUrl: function(url, callback, forceNoCache){
		if(!forceNoCache && Sitebuilder.PageCache[url]){
			Ti.API.debug('Returning page ' + url + ' from cache');
			callback({page: Sitebuilder.PageCache[url], errors: [], fromCache: true});
		} else {
			var client = Titanium.Network.createHTTPClient();
			client.open('GET', Sitebuilder.PagePropertiesJson + '?page=' + url + '&rn' + Math.round(Math.random()*10000));
			client.onload = function(){
				try{
					Ti.API.debug('Response received from page details');
					var json = JSON.parse(this.responseText);
					var page = Sitebuilder.decorate(json);
					Sitebuilder.PageCache[url] = page;
					Ti.API.debug(url + ' stored in cache');
					callback({page: Sitebuilder.PageCache[url], errors: [], fromCache: false});
				} catch(e) {
					Titanium.API.error('Error parsing JSON data ' + e);
					callback({page: null, errors: [["Error parsing JSON data",e]], fromCache: false});
				}
				
			};
			client.send();
		}
	},
	
	getPagesByUrls: function(parentUrl, urls, callback, forceNoCache){
		var results = [], urlsToGet = [];
		if(!forceNoCache){
			urls.forEach(function(url){
				if(Sitebuilder.PageCache[url]){
					Ti.API.debug('Returning page ' + url + ' from cache');
					results.push({ page: Sitebuilder.PageCache[url], fromCache: true });
				} else {
					urlsToGet.push(url);
				}
			});
		}
		
		if(urlsToGet.length > 0){
			var client = Titanium.Network.createHTTPClient();
			client.open('POST', Sitebuilder.PagePropertiesJson);
			client.setRequestHeader("content-type", "application/x-www-form-urlencoded");
			client.onload = function(){
				try{
					var json = JSON.parse(this.responseText);
					json.forEach(function(p){
						var page = Sitebuilder.decorate(p);
						results.push({ page: p, fromCache: false });
						Sitebuilder.PageCache[page.path] = page;
						Ti.API.debug(page.path + ' stored in cache');
					});
					
					callback({pages: results, errors: []});
				} catch(e) {
					Titanium.API.error('Error parsing JSON data ' + e);
					callback({ pages: results, errors: [["Error parsing JSON data",e]] });
				}
				
			};
			client.send('page=' + parentUrl + '&pages=' + urlsToGet.join('&pages=') + '&rn' + Math.round(Math.random()*10000));
		} else {
			callback({ pages: results, errors: [] });
		}
	}
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
	
	getChildren : function(callback){
		Sitebuilder.getPagesByUrls(this.path, this.children, callback);
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
 * @param {Boolean} forceNoCache Whether to get the page from Sitebuilder, even
 * 	if available in the cache
 */
exports.getPageByPath = function(path, callback, forceNoCache){
	Sitebuilder.getPageByUrl(path, callback, forceNoCache);
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
 * @param {Boolean} forceNoCache Whether to get the page from Sitebuilder, even
 * 	if available in the cache
 */
exports.getPagesByPaths = function(parentPath, paths, callback, forceNoCache){
	Sitebuilder.getPagesByUrls(parentPath, paths, callback, forceNoCache);
};