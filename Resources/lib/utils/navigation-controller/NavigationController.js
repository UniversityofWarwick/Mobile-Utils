/* Navigation controller; on iOS uses NavigationGroup but on Android transitions manually */
function NavigationController(options) {
	$ = require('/lib/util');
	this.settings = $.extend({
		animation: Titanium.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT
	}, options);
	
	this.windowStack = [];
	
	// We have our own checks here, but if they've already been done by the app, use the cached values
	if (typeof Ti.App.isTablet !== 'undefined' && typeof Ti.App.iOS !== 'undefined' && typeof Ti.App.android !== 'undefined') {
		this.isTablet = Ti.App.isTablet;
		this.iOS = Ti.App.iOS;
		this.android = Ti.App.android;	
	} else {
		var osname = Ti.Platform.osname,
			version = Ti.Platform.version,
			height = Ti.Platform.displayCaps.platformHeight,
			width = Ti.Platform.displayCaps.platformWidth;
		
		var isTablet = osname === 'ipad' || (osname === 'android' && (width > 899 || height > 899));
			
		this.isTablet = isTablet;
		this.iOS = osname === 'ipad' || osname === 'iphone';
		this.android = osname === 'android';
	}
	
	return this;
}

NavigationController.prototype.open = function(/*Ti.UI.Window*/windowToOpen) {
	//add the window to the stack of windows managed by the controller
	this.windowStack.push(windowToOpen);

	// Grab a copy of the current nav controller for use in the callback
	var that = this;
	windowToOpen.addEventListener('close', function() {
		that.windowStack.pop();
	});

	// Hack - setting this property ensures the window is "heavyweight" (associated with an Android activity)
	windowToOpen.navBarHidden = windowToOpen.navBarHidden || false;

	if (this.windowStack.length === 1) {
		// This is the first window
		
		if (this.android) {
			windowToOpen.exitOnClose = true;
			windowToOpen.open();
		} else if (this.iOS) {
			this.navGroup = Ti.UI.iPhone.createNavigationGroup({
				window : windowToOpen
			});
			
			var containerWindow = Ti.UI.createWindow();
			containerWindow.add(this.navGroup);
			containerWindow.open({ transition: this.settings.animation });
		} else {
			alert('Requires Android or iOS');
		}
	} else {
		// All subsequent windows		
		if (this.android) {
			windowToOpen.open();
		} else if (this.iOS) {
			this.navGroup.open(windowToOpen);
		} else {
			alert('Requires Android or iOS');
		}
	}
};

NavigationController.prototype.back = function() {
	var lastWindow = this.windowStack.pop();
	
	if (this.navGroup) {
		this.navGroup.close(lastWindow);
	} else {
		lastWindow.close();
	}
};

// Go back to the initial window of the NavigationController
NavigationController.prototype.home = function() {
	// Store a copy of all the current windows on the stack
	var windows = this.windowStack.concat([]);
	for(var i = 1, l = windows.length; i < l; i++) {
		if (this.navGroup) {
			this.navGroup.close(windows[i]);
		} else {
			windows[i].close();
		}
	}
	this.windowStack = [this.windowStack[0]]; // reset stack
};


module.exports = NavigationController;