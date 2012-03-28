exports.build = function(args){
	var Slideshow = require('lib/ui/slideshow/slideshow');
	var mySlideshow = new Slideshow({
		width: 300,
		height: 300,
		backgroundColor: '#f00',
		images: [
			Titanium.Filesystem.getResourcesDirectory() + 'tests/ui/slideshow/image1.jpg',
			Titanium.Filesystem.getResourcesDirectory() + 'tests/ui/slideshow/image2.jpg',
			Titanium.Filesystem.getResourcesDirectory() + 'tests/ui/slideshow/image3.jpg'
		],
		advanceTimeout: 2000,
		fadeTime: 2000,
		enableZoomAndPan: true 
	});
	args.thisWindow.add(mySlideshow.getView());
	args.thisWindow.addEventListener('open', function(){ mySlideshow.start(); });
	args.thisWindow.addEventListener('close', function(){ mySlideshow.stop(); });
};
