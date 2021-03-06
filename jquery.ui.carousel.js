/**
 * @author Kabilan Kumaravelu
 * options: {
 *  	"leftButton" : "Button ID to which Left Navigation should be assigned Default DOM ID > leftButton",
 *  	"rightButton" : "Button ID to which Right Navigation should be assigned Default DOM ID > rightButton",
 *  	"visibleCount" : "Number of Visible Panels should be considered for Scrolling. Auto Decided based on width if not set",
 *  	"navigatorCount" : "Number of items you want to Scroll when clicked Default > visibleCount",
 *  	"transitionTime" : "Sliding time for transition. Default > 400",
 *  	"callback": "A function(c) where c is the instance of the Carousel. Called whenever a button is clicked.",
 *  	"carouselType" : "Value whether the Carousel should be Circular or Linear Default > Linear ",
 *  
 * }
 * <div id="Carousel" class="carousel">
 *		<div class="carousel-container-out">
 *			<div class="carousel-content">
 *				<ul class="carousel-container-in">
 *					<li class="carousel-slider">
 *						hello
 *					</li>
 *					...
 *				</ul>
 *			</div>
 *		</div>
 *	</div>
 */
(function($){
	$.extend($.vzw, {'ui.carousel': {version: "1.0"}});
	
	var cons = {
	    "carouselType" : {
	    	"vertical": {
		    	"typeName" : "Vertical",
		    	"adjustedShift" : "margin-top",
		    	"shiftToAdjust" : ["border-top-width", "border-bottom-width","margin-top","margin-bottom"]
		    },
		    "linear": {
		    	"typeName" : "Linear",
		    	"adjustedShift" : "margin-left",
		    	"shiftToAdjust" : ["border-left-width", "border-right-width","margin-left","margin-right"]
		    },
	    },
	    "animation": {
	        "attrName": "jquery-carousel-anim"
	    },
	    "selector": {
	        "parent": ".carousel-container-in",
	        "container": ".carousel-container-out",
	        "sliders": ".carousel-slider"
	    }
	};
	
	var utils = (function(_c){
		return {
			isUndefined : function(v){return $.type(v) === 'undefined';},
			isDefined : function(v){return !this.isUndefined(v);},
			isAnimationStopped: function(){var is = true;for(i in arguments){is = is && ($(arguments[i]).attr(_c.animation.attrName) != '');}return is;},
			setAnimParam: function(target){$(target).attr(_c.animation.attrName, '');},
			removeAnimParam: function(target){$(target).removeAttr(_c.animation.attrName);},
			getNumberFromProp: function(e, p){var n = this.getNumber($(e).css(p));return $.isNumeric(n) ? n : 0;},
			getNumber: function(p){return parseInt(p.substring(0, p.indexOf("px")));},
			getWidth: function(e){return (this.isDefined(e) ? this.getNumberFromProp(e, 'width') : 0);},
			getHeight: function(e){return (this.isDefined(e) ? this.getNumberFromProp(e, 'height') : 0);},
			log: function(e){if(_c.debug){console.log(e);}},
			removeDOM: function(a){$(a).each(function(){$(this).remove();});},
			applyStyles: function(i, s){if($.isArray(i)){$(i).each(function(){for(n in s){$(this).css(n, s[n]);}});}else{for(n in s){$(i).css(n, s[n]);}}},
			copyFunctions: function(from, to){for(hName in from){to[hName] = from[hName];}}
		};
	})(cons);
	
	var handlers = (function(_u, _c){
		
		return function(carouselType, isCircular){
			
			var linear = _c.carouselType.linear.typeName.toLowerCase();
			var vertical = _c.carouselType.vertical.typeName.toLowerCase();
			
			var h = {
				_initMembersExtended: function(options){
					this.setNegativeScroller($('#'+ options['leftScroller']));
					this.setPositiveScroller($('#'+ options['rightScroller']));
					if(_u.isUndefined(options['visibleCount'])){
						var sliderWidth = this.getBaseAdjustment();
						var containerWidth = _u.getWidth(this.getItemWrapper());
						var canAccomodate = Math.floor(containerWidth / sliderWidth);
						this.setVisibleCount(canAccomodate);
					}
				},
				getBaseAdjustment: function(){return _u.getWidth(this.getItem(0));},
				_movePositive: function(){if(this._canMoveLeft()){this._move(-this.getNavigatorCount());}},
				_moveNegative: function(){if(this._canMoveRight()){this._move(this.getNavigatorCount());}},
				_move: function(tShift){
					var self = this;
					var newMargin = this.getTotalAdjustedShift() + (tShift * this.getShiftToAdjust());
					this._animateCarousel(this._getAnimatorProperties(newMargin), undefined, function(){self.setStartIndex(self.getStartIndex() + tShift);});
				},
				_canMoveLeft: function(){return this.isCircular() ? true : ((this.getStartIndex() + this.getItems().length - this.getVisibleCount()) > 0);},
				_canMoveRight: function(){return this.isCircular() ? true : (this.getStartIndex() < 0);},
				_getAnimatorProperties: function(newValue){return {marginLeft:newValue};}
			};
			
			if(isCircular){
				h = $.extend(h , {
					_movePositive: function(){
						var self = this;
						var parent = this.getItemParent();
						var tShift = this.getNavigatorCount();
						var adjustment = -1 * tShift * this.getShiftToAdjust();
						var newMargin = this.getTotalAdjustedShift() + adjustment;						
						var toRemove = [];
						this._animateCarousel(this._getAnimatorProperties(newMargin), function(){
							$(self.getItems()).each(function(i){if(i < tShift){toRemove.push($(this));$(parent).append($(this).clone());}});
						}, function(){
							_u.removeDOM(toRemove);$(parent).css(self.getAdjustorProperty(), 0);
						});
					},
					_moveNegative: function(){						
						var self = this;
						var parent = this.getItemParent();
						var tShift = this.getNavigatorCount();
						var adjustment = 1 * tShift * this.getShiftToAdjust();
						var sliders = self.getItems();
						var toRemove = [];
						this._animateCarousel(this._getAnimatorProperties(0), function(){
							for(var i=1; i <= tShift; i++){
								var first = sliders[sliders.length - i];
								toRemove.push(first);
								$(parent).prepend($(first).clone());
							}
							$(parent).css(self.getAdjustorProperty(), - adjustment);
						}, function(){
							_u.removeDOM(toRemove);
						});
					},
					_move: function(t){},
				});
			}
			
			if(vertical == carouselType){
				h = $.extend(h , {
					_initMembersExtended: function(options){
						this.setNegativeScroller($('#'+ options['upScroller']));
						this.setPositiveScroller($('#'+ options['downScroller']));
						if(_u.isUndefined(options['visibleCount'])){
							var sliderWidth = this.getBaseAdjustment();
							var containerWidth = _u.getHeight(this.getItemWrapper());
							var canAccomodate = Math.floor(containerWidth / sliderWidth);
							this.setVisibleCount(canAccomodate);
						}
					},
					getBaseAdjustment: function(){return _u.getHeight(this.getItem(0));},
					_move: function(tShift){
						var self = this;
						var newMargin = this.getTotalAdjustedShift() + (tShift * this.getShiftToAdjust());
						var animProp = {marginTop:newMargin};
						this._animateCarousel(animProp, undefined, function(){self.setStartIndex(self.getStartIndex() + tShift);});
					},
					_getAnimatorProperties: function(newValue){return {marginTop:newValue};}
				});
			}
			
			return h;
		};
	})(utils, cons);
	
	(function($, _h, _u, _c){
		$.widget("ui.carousel", {
			startIndex: 0,
			visibleCount: 0,
			options: {
			    "leftScroller": "leftButton",
			    "rightScroller": "rightButton",
			    "upScroller": "upButton",
			    "downScroller": "downButton",
			    "transitionTime": 300,
			    "carouselType": _c.carouselType.linear.typeName,
			    "circular" : false
			},
			_create: function(){
				var e = this.element;
				this._initCarousel();
				this._postCaraousel();
			},
			_initCarousel: function(){
				var options = this.options;
				this._initMembers(options);
				this._setCarouselHandlers();
				if($.isFunction(this._initMembersExtended)){this._initMembersExtended(options);}				
				this._setEvents();
			},
			_initMembers: function(options){
				this.carouselType = options['carouselType'];
				this.transitionTime = options['transitionTime'];
				this.callback = options['callback'];
				this.visibleCount = options['visibleCount'];
				this.navigatorCount = options['navigatorCount'];
			},
			_setEvents: function(){
				var self = this;
				$(this.getPositiveScroller()).click(function(e){self._movePositive();});
				$(this.getNegativeScroller()).click(function(e){self._moveNegative();});
				if($.isFunction(this._setEventsExtended)){this._setEventsExtended();}
			},
			_postCaraousel: function(){
				this.navigatorCount = _u.isDefined(this.navigatorCount) ? this.navigatorCount : this.getVisibleCount();
			},
			_destroy: function(){},
			_setOption: function(key, value){
				var options = this.options;
				options[key] = value;
			},
			_animateCarousel: function(animProp, callbefore, callback){
				var self = this;
				var parent = this.getItemParent();
				if(_u.isAnimationStopped(parent)){
					_u.setAnimParam(parent);
					if($.isFunction(callbefore)){callbefore();};
					$(parent).animate(animProp, this.getTransitionTime() ,function(){
						_u.removeAnimParam(parent);
						if($.isFunction(callback)){callback();};
						if($.isFunction(self.callback)){self.callback(self);};
					});
				}
			},
			getShiftToAdjust: function(){
				var shiftAmount = this.getBaseAdjustment();				
				var propsToFind = this.getCarouselType().shiftToAdjust;
				var slider = this.getItem(0);
				for(property in propsToFind){
					shiftAmount = shiftAmount + _u.getNumberFromProp(slider, property);
				}				
				return shiftAmount;
			},
			getTotalAdjustedShift: function(){
				var margin = 0;
				var parent = this.getItemParent();
				if(_u.isDefined(parent)){margin = _u.getNumberFromProp(parent, this.getAdjustorProperty());}
				return margin;
			},
			_setCarouselHandlers: function(){
				var hFunctions = _h(this.carouselType.toLowerCase(), this.isCircular());
				_u.copyFunctions(hFunctions, this);
			},
			getAdjustorProperty: function(){return this.getCarouselType().adjustedShift;},
			getCarouselType: function(){return _c.carouselType[this.carouselType.toLowerCase()];},			
			getItem: function(i){return this.getItems()[i];},
			getCarouselWrapper: function(){return $(this.element);},
			getItemWrapper: function(){return $(this.element).find(_c.selector.container);},
			getItemParent: function(){return $(this.element).find(_c.selector.parent);},
			getItems: function(){return $(this.element).find(_c.selector.sliders);},
			setStartIndex: function(e){this.startIndex = e;}, 
			getStartIndex: function(){return this.startIndex;},
			setVisibleCount: function(e){this.visibleCount = e;}, 
			getVisibleCount: function(){return this.visibleCount;},
			getNavigatorCount: function(){return this.navigatorCount;},
			setNegativeScroller: function(e){this.leftScroller = e;}, 
			getNegativeScroller: function(){return this.leftScroller;},
			setPositiveScroller: function(e){this.rightScroller = e;}, 
			getPositiveScroller: function(){return this.rightScroller;},
			setTransitionTime: function(e){this.transitionTime = e;}, 
			getTransitionTime: function(){return this.transitionTime;},
			isCircular: function(){return this.options['circular'];},
		});
	})($, handlers, utils, cons);
})(jQuery);