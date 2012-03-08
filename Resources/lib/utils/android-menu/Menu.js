exports.createMenu = function(win, menuItems) {
	var activity = win.activity;
	
	activity.onCreateOptionsMenu = function(evt) {
		var menu = evt.menu;
		
		menuItems.forEach(function(item, index) {
			var menuItem = menu.add({
				title: item.title, itemId: index
			});
			
			if (typeof item.condensedTitle !== 'undefined') {
				menuItem.setTitleCondensed(item.condensedTitle);				
			}
			
			if (typeof item.icon !== 'undefined') {
				menuItem.setIcon(item.icon);				
			}
			
			if (typeof item.onClick !== 'undefined') {
				menuItem.addEventListener('click', item.onClick);				
			}
		});
	};
	
	activity.onPrepareOptionsMenu = function(evt) {
		var menu = evt.menu;
		
		menuItems.forEach(function(item, index) {
			if (typeof item.isVisible === 'function') {
				menu.findItem(index).setVisible(item.isVisible());
			}
		});
	};
};
