var Slideshow = function(options){
	this.width = options.width;
	this.height = options.height;
	this.images = options.images;
	this.advanceTimeout = options.advanceTimeout || 3000;
	this.fadeTime = options.fadeTime || 1000;
	this.enableZoomAndPan = options.enableZoomAndPan || false;
	this.backgroundColor = options.backgroundColor || '#000';
	this.scaleType = options.scaleType || 'fill';
	
	this._prefetchLimit = 5;
	
	this._container = Titanium.UI.createView({
		width: this.width,
		height: this.height,
		backgroundColor: this.backgroundColor,
		borderRadius: 0 // magically makes the container crop the contents
	});
	var _this = this;
	['top','left','bottom','right'].forEach(function(property){
		if(options[property])
			_this._container[property] = options[property];
	});
	
	this._imageViews = [];
	this._fetchQueue = [0];
	
	this._populateFetchQueueTimeout = 1000;
	this._processFetchQueueTimeout = 500;
	
	this._advanceWhenReady = false;
	this._started = false;
	
	this._processFetchQueue();
};

Slideshow.prototype._populateFetchQueue = function(){
	if(this._started){
		var _this = this;
		var itemsToAdd = this._prefetchLimit - (this._imageViews.length + this._fetchQueue.length);
		if(itemsToAdd > 0){
			var startingIndex = (this._fetchQueue.length > 0)? this._fetchQueue[this._fetchQueue.length - 1] : this._imageViews[this._imageViews.length - 1].index;
			for(var i=1; i<=itemsToAdd; i++){
				Ti.API.debug('Adding image with index ' + (startingIndex + i) % this.images.length + ' to the fetch queue');
				this._fetchQueue.push((startingIndex + i) % this.images.length);
			}
			// start processing the fetch queue
			setTimeout(function(){ _this._processFetchQueue() }, this._processFetchQueueTimeout);
		}
		setTimeout(function(){ _this._populateFetchQueue(); }, this._populateFetchQueueTimeout);
	}
};

Slideshow.prototype._processFetchQueue = function(){
	Ti.API.debug('Processing fetch queue');
	
	var _this = this;
	var index = this._fetchQueue.shift();
	if(index != undefined){
		var path = this.images[index];
		if(path.indexOf('http') == 0){
			Ti.API.debug('Processing remote file');
			//TODO: process remote image
		} else {
			Ti.API.debug('Processing local file');
			var file = Titanium.Filesystem.getFile(path);
			if(file.exists()){
				this._imageLoaded(file.read(), index);
				setTimeout(function(){ _this._processFetchQueue() }, this._processFetchQueueTimeout);
			} else {
				Ti.API.error(path + ' does not exist');
				setTimeout(function(){ _this._processFetchQueue() }, this._processFetchQueueTimeout);
			}
		}
	} else {
		Ti.API.debug('No items to process in fetch queue');
	}
};

Slideshow.prototype._imageLoaded = function(imageBlob, index){
	var imageView = this._prepareImageView(imageBlob);
	// go through existing image views resetting z-index
	var zIndexCount = 10000;
	this._imageViews.forEach(function(iv){
		iv.imageView.zIndex = zIndexCount;
		zIndexCount--;
	});
	// set the z-index of the new image view to be the bottom
	imageView.zIndex = zIndexCount;
	
	this._imageViews.push({ index: index, imageView: imageView });
	this._container.add(imageView);
};

Slideshow.prototype._prepareImageView = function(imageBlob){
	Ti.API.debug('Preparing image');
	var imageView = Titanium.UI.createImageView();
	var targetWidth = this.width, targetHeight = this.height, targetAspect = targetWidth / targetHeight,
		imageWidth = imageBlob.width, imageHeight = imageBlob.height, imageAspect = imageWidth / imageHeight,
		scale = 1;
		
	if(this.scaleType == 'fit'){
		if(targetAspect > 1){
			if(imageAspect < 1)
				scale = targetWidth/imageWidth;
			else
				scale = targetHeight/imageHeight;
		} else {
			if(imageAspect < 1)
				scale = targetHeight/imageHeight;
			else
				scale = targetWidth/imageWidth;
		}
	} else {
		if(targetAspect > 1){
			if(imageAspect > 1)
				scale = targetWidth/imageWidth;
			else
				scale = targetHeight/imageHeight;
		} else {
			if(imageAspect > 1)
				scale = targetHeight/imageHeight;
			else
				scale = targetWidth/imageWidth;
		}
	}
	
	imageView.height = imageHeight * scale;
	imageView.width = imageWidth * scale;
	imageView.image = imageBlob;
	imageView.top = (imageView.height - targetHeight) / -2;
	imageView.left = (imageView.width - targetWidth) / -2;
	Ti.API.debug('Using scale of ' + scale + ', result is ' + imageView.width + 'x' + imageView.height);
	return imageView;
};

Slideshow.prototype._advance = function(){
	Ti.API.debug('Calling advance');
	var _this = this;
	if(this._started){
		if(this._advanceWhenReady){
			if(this._imageViews.length > 1){
				Ti.API.debug('Advancing');
				this._advanceWhenReady = false;
				
				if(this.enableZoomAndPan)
					this._startZoomAndPan(this._imageViews[1].imageView);
					
				this._imageViews[0].imageView.animate({ opacity: 0, duration: this.fadeTime }, function(){
					_this._container.remove(_this._imageViews[0].imageView);
					_this._imageViews.shift();
					setTimeout(function(){ _this._advanceWhenReady = true; _this._advance(); }, _this.advanceTimeout);
				});
			} else {
				setTimeout(function(){ _this._advance(); }, 100);
			}
		}
	}
};

Slideshow.prototype._startZoomAndPan = function(imageView){
	var zoomFactor = 1.1;
	if(this.scaleType == 'fit'){
		var matrix = Titanium.UI.create2DMatrix().scale(zoomFactor);
	} else {
		var translateY = (imageView.height - this.height) * (Math.random() - 0.5) * zoomFactor;
		var translateX = (imageView.width - this.width) * (Math.random() - 0.5) * zoomFactor;
		var matrix = Titanium.UI.create2DMatrix().translate(translateX, translateY).scale(zoomFactor);
	}
	var animation = Titanium.UI.createAnimation({
		transform: matrix,
		duration: this.advanceTimeout + this.fadeTime
	});
	if(Titanium.Platform.osname != 'android')
		animation.curve = Titanium.UI.iOS.ANIMATION_CURVE_EASE_OUT;
		
	imageView.animate(animation);
};


Slideshow.prototype.getView = function(){
	return this._container;
};

Slideshow.prototype.start = function(){
	Ti.API.debug('Starting slideshow');
	this._started = true;
	this._populateFetchQueue();
	var _this = this;
	setTimeout(function(){ _this._advanceWhenReady = true; _this._advance(); }, this.advanceTimeout + this.fadeTime);
	if(this.enableZoomAndPan)
		this._startZoomAndPan(this._imageViews[0].imageView);
};

Slideshow.prototype.stop = function(){
	this._started = false;
};

module.exports = Slideshow;
