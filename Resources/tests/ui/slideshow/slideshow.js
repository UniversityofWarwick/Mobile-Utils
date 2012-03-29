exports.build = function(args){
	var Slideshow = require('lib/ui/slideshow/slideshow');
	var mySlideshow1 = new Slideshow({
		width: 300,
		height: 150,
		backgroundColor: '#000',
		images: [
			Titanium.Filesystem.getResourcesDirectory() + 'tests/ui/slideshow/image1.jpg',
			Titanium.Filesystem.getResourcesDirectory() + 'tests/ui/slideshow/image2.jpg',
			Titanium.Filesystem.getResourcesDirectory() + 'tests/ui/slideshow/image3.jpg'
		],
		advanceTimeout: 2000,
		fadeTime: 2000,
		enableZoomAndPan: true,
		top: 5
	});
	
	var mySlideshow2 = new Slideshow({
		width: 250,
		height: 300,
		backgroundColor: '#000',
		images: [
			Titanium.Filesystem.getResourcesDirectory() + 'tests/ui/slideshow/image3.jpg',
			Titanium.Filesystem.getResourcesDirectory() + 'tests/ui/slideshow/image1.jpg',
			Titanium.Filesystem.getResourcesDirectory() + 'tests/ui/slideshow/image2.jpg'
		],
		advanceTimeout: 2000,
		fadeTime: 2000,
		enableZoomAndPan: true,
		top: 160,
		scaleType: 'fit'
	});
	
	args.thisWindow.add(mySlideshow1.getView());
	args.thisWindow.addEventListener('open', function(){ mySlideshow1.start(); });
	args.thisWindow.addEventListener('close', function(){ mySlideshow1.stop(); });
	args.thisWindow.add(mySlideshow2.getView());
	args.thisWindow.addEventListener('open', function(){ mySlideshow2.start(); });
	args.thisWindow.addEventListener('close', function(){ mySlideshow2.stop(); });
};
