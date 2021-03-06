/*
 * Copyright 2011 University of Warwick
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var OAuthAdapter = function(options){
	if(!options)
		options = {};
	// Optional parameters
	
	var signatureMethod = options.signatureMethod || 'HMAC-SHA1';
	
	var now = new Date();
    var tokenExpiry = options.tokenExpiry || new Date((now.setFullYear(now.getFullYear() + 1))); // Default 1 year for new tokens
    
    var libDirectory = options.libDirectory || 'lib/utils/oauth/'; // Locations of oauth.js and sha1.js
    
    var barColor = options.barColor;
    
    // one of the following is mandatory
    var catchURL = options.catchURL;
    var catchString = options.catchString;
	
	// Mandatory parameters
	
	var consumerSecret = options.consumerSecret;
    var consumerKey = options.consumerKey;
    
    var requestTokenURL = options.requestTokenURL;
    var authorizeTokenURL = options.authorizeTokenURL;
    var accessTokenURL = options.accessTokenURL;
    
    var serviceName = options.serviceName;
    
    // Private variables   
     
    var successCallback;
    var authRequiredCallback;
    var failureCallback;

    var requestToken;
    var requestTokenSecret;    
    var accessToken;
    var accessTokenSecret;
    
    var authWindow;
    var authWindowWebView;
    
    var actionsQueue = [];
      
    // Setup
    
	var OAuth = require(libDirectory + 'oauth').OAuth;
	var SignatureLib = {};
    switch(signatureMethod){
    	case 'HMAC-SHA1': {
    		SignatureLib = require(libDirectory + 'sha1');
    	} break;
    }
    OAuth.setSignatureLib(SignatureLib);
    
    // Check for and load an existing access token
    loadConfig();
    
    // Public methods
    this.authorized = function(){
    	return accessToken != null && accessTokenSecret != null;
    };
    
    this.send = send;
    this.clearUserData = clearUserData;
    
    // Private methods
    
    function clearUserData(){
    	accessToken = null;
    	accessTokenSecret = null;
    	saveConfig();
    };
    
    function send(options){
    	var url = options.url;
    	var method = options.method || 'GET';
    	var postBody = options.postBody;
    	var customHeaders = options.customHeaders;
    	
    	successCallback = options.successCallback;
    	failureCallback = options.failureCallback;
    	
    	if (accessToken == null || accessTokenSecret == null) {
    		// store this request for when the auth is complete
    		actionsQueue.push(options);
    		if(actionsQueue.length == 1){
	    		setupWebview();
	    		authWindow.open();
	    		doAuth();
    		}
    	} else {
    		
    		var message = createMessage(url);
    		message.method = method;
        	message.parameters.push(['oauth_token', accessToken]);
        	var message = OAuth.setTimestampAndNonce(message);
        	var message = OAuth.SignatureMethod.sign(message, {
        		consumerSecret: consumerSecret,
        		tokenSecret: accessTokenSecret
    		});
    		
    		var client = Ti.Network.createHTTPClient();
    		client.open(method, url);
    		client.setRequestHeader("Authorization", "OAuth " + kvArrayToAuthString(message.parameters));
    		client.clearCookies(url);
    		if(customHeaders){
    			for(header in customHeaders){
    				client.setRequestHeader(header, customHeaders[header]);
    			}
    		}
    		client.onload = successCallback;
    		client.onerror = failureCallback;
    		
    		if(method == "GET"){
				client.send();
    		} else {
    			client.send(postBody);
    		}
    		
    	}
    };
    
    var kvArrayToAuthString = function(array){
    	var result = [];
    	for (var i=0, length = array.length; i<length; i++) {
    		result.push(OAuth.percentEncode(array[i][0]) + '="' + OAuth.percentEncode(array[i][1]) + '"');
    	}
    	return result.join(', ');
    };
    
    function loadConfig(){
    	var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, serviceName + '.oauth.config');
        if (file.exists() == false) 
        	return;

        var contents = file.read();
        if (contents == null) 
        	return;

        try {
            var config = JSON.parse(contents.text);
        } catch(ex) {
            return;
        }
        
        if(!config)
        	config = {};
        
        if (!config.expiry || new Date(config.expiry) > new Date()) {
        	tokenExpiry = new Date(config.expiry);
        	if(!config.requestTokenURL || config.requestTokenURL == requestTokenURL){
				// Only load the access token if the requestTokenURL matches
				// otherwise the token will not be valid (we might have changed the scope for example)
    			if (config.accessToken) 
	        		accessToken = config.accessToken;
	        	if (config.accessTokenSecret) 
	        		accessTokenSecret = config.accessTokenSecret;
        	}
        }
    };
    
    var saveConfig = function(){
        var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, serviceName + '.oauth.config');
        if (file == null) 
        	file = Ti.Filesystem.createFile(Ti.Filesystem.applicationDataDirectory, serviceName + '.oauth.config');
        	
        file.write(JSON.stringify({
            accessToken: accessToken,
            accessTokenSecret: accessTokenSecret,
            expiry: tokenExpiry.valueOf(),
            requestTokenURL: requestTokenURL
        }));
    };
    
    var createMessage = function(url) {
        var message = {
            action: url,
            method: 'GET',
            parameters: []
        };
        message.parameters.push(['oauth_consumer_key', consumerKey]);
        message.parameters.push(['oauth_signature_method', signatureMethod]);
        return message;
    };
    
    var doAuth = function(){
    	
    	// First get the request token
    	
    	var message = createMessage(requestTokenURL);
        message = OAuth.setTimestampAndNonce(message);
        message = OAuth.SignatureMethod.sign(message, {
        	consumerSecret: consumerSecret,
        	tokenSecret: ''
    	});
        

        var client = Ti.Network.createHTTPClient();
    	client.open('GET', requestTokenURL);
    	client.setRequestHeader("Authorization", "OAuth " + kvArrayToAuthString(message.parameters));
    	client.onload = processRequestToken;
    	client.onerror = failureCallback;
    		
		client.send();
    	
    };
    
    var processRequestToken = function(){
    	var responseParams = OAuth.getParameterMap(this.responseText);
        requestToken = responseParams['oauth_token'];
        requestTokenSecret = responseParams['oauth_token_secret'];
        
              
        // Then authorize the request token
        
        var checkForAccessGrantedURL = function(){
        	if(authWindowWebView.url.match(catchURL)){
        		authWindowWebView.removeEventListener('load',checkForAccessGrantedURL);
        		setWebViewLoading();
        		getAccessToken();
        	}
        };
        var checkForAccessGrantedString = function(){
        	if(authWindowWebView.getHtml().match(catchString)){
        		authWindowWebView.removeEventListener('load',checkForAccessGrantedString);
        		setWebViewLoading();
        		getAccessToken();
        	}
        };
        if(catchURL)
        	authWindowWebView.addEventListener('load',checkForAccessGrantedURL);
        else if(catchString)
        	authWindowWebView.addEventListener('load',checkForAccessGrantedString);
        	
        authWindowWebView.setUrl(authorizeTokenURL + '?oauth_token=' + requestToken);
    };
    
    var getAccessToken = function(){    
        var message = createMessage(accessTokenURL);
        message.parameters.push(['oauth_token', requestToken]);
        message = OAuth.setTimestampAndNonce(message);
        message = OAuth.SignatureMethod.sign(message, {
        	consumerSecret: consumerSecret,
        	tokenSecret: requestTokenSecret
    	});
        
        var client = Ti.Network.createHTTPClient();
    	client.open('GET', accessTokenURL);
    	client.setRequestHeader("Authorization", "OAuth " + kvArrayToAuthString(message.parameters));
    	client.onload = processAccessToken;
    	client.onerror = failureCallback;
    		
		client.send();
    };
	
	var processAccessToken = function(){

		var responseParams = OAuth.getParameterMap(this.responseText);
        accessToken = responseParams['oauth_token'];
        accessTokenSecret = responseParams['oauth_token_secret'];
        saveConfig();
        authWindow.close();
        processQueue();
	};
	
	var processQueue = function() {
        while ((q = actionsQueue.shift()) != null)
        	send(q);
    };
    
    var setupWebview = function(){
    	authWindow = Titanium.UI.createWindow({ title: 'Authentication required' });
    	if(Titanium.Platform.osname == 'android'){
    		authWindow.navBarHidden = false;
    		authWindow.addEventListener('android:back',function(){ 
    			// rather than just close the window, provide a bit more feedback
    			authWindow.close();
    			failureCallback({ userCancelled: true });
    		});
    	} else {
    		if(barColor)
    			authWindow.setBarColor(barColor);
    		authWindow.setModal(true);
    		var closeButton = Titanium.UI.createButton({ title: 'Cancel' });
    		authWindow.setLeftNavButton(closeButton);
    		closeButton.addEventListener('click',function(){
    			authWindow.close();
    			failureCallback({ userCancelled: true });
    		});
    	}
    	authWindowWebView = Titanium.UI.createWebView({ url: '/' + libDirectory + 'loading.html' });
    	authWindow.add(authWindowWebView);
    };
    
    var setWebViewLoading = function(){
    	authWindowWebView.setUrl('/' + libDirectory + 'loading.html');
    };
};

exports.OAuthAdapter = OAuthAdapter;