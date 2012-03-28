// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

// create tab group
var tabGroup = Titanium.UI.createTabGroup();


//
// create base UI tab and root window
//
var win1 = Titanium.UI.createWindow({  
    title:'Tab 1',
    backgroundColor:'#fff'
});
var tab1 = Titanium.UI.createTab({  
    icon:'KS_nav_views.png',
    title:'Tab 1',
    window:win1
});


//
//  add tabs
//
tabGroup.addTab(tab1);   


// open tab group
tabGroup.open();

var tableView = Titanium.UI.createTableView();

var rowdata = [];
rowdata.push(Titanium.UI.createTableViewRow({
	title: 'Tests',
	module: 'tests/base'
}));
tableView.data = rowdata;

tableView.addEventListener('click',function(e){
	if(e.rowData.module){
		var newWindow = Ti.UI.createWindow({
			animated: true,
			title: e.rowData.title
		});
		var newWindowBuilder = require(e.rowData.module);
		newWindowBuilder.build({thisWindow: newWindow, tab: tab1});
		tab1.open(newWindow);
	}
});

win1.add(tableView);
