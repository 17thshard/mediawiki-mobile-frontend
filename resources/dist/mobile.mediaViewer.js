this.mfModules=this.mfModules||{},this.mfModules["mobile.mediaViewer"]=(window.webpackJsonp=window.webpackJsonp||[]).push([[9],{"./src/mobile.mediaViewer/ImageGateway.js":function(e,t,i){var a=[320,640,800,1024,1280,1920,2560,2880],s=i("./src/mobile.startup/actionParams.js"),o=i("./src/mobile.startup/util.js");function r(e){for(var t=0;e>a[t]&&t<a.length-1;)++t;return a[t]}function n(e){this._cache={},this.api=e.api}n.prototype.getThumb=function(e){var t=this._cache[e],i=o.getWindow(),a=window.devicePixelRatio&&window.devicePixelRatio>1?window.devicePixelRatio:1;return t||(this._cache[e]=this.api.get(s({prop:"imageinfo",titles:e,iiprop:["url","extmetadata"],iiurlwidth:r(i.width()*a),iiurlheight:r(i.height()*a)})).then(function(e){if(e.query&&e.query.pages&&e.query.pages[0]&&e.query.pages[0].imageinfo)return e.query.pages[0].imageinfo[0];throw new Error("The API failed to return any pages matching the titles.")})),this._cache[e]},n._findSizeBucket=r,e.exports=n},"./src/mobile.mediaViewer/ImageOverlay.js":function(e,t,i){var a=i("./src/mobile.startup/Overlay.js"),s=i("./src/mobile.startup/util.js"),o=i("./src/mobile.startup/mfExtend.js"),r=i("./src/mobile.startup/Icon.js"),n=i("./src/mobile.startup/icons.js"),l=i("./src/mobile.startup/Button.js"),m=i("./src/mobile.mediaViewer/LoadErrorMessage.js"),h=i("./src/mobile.mediaViewer/ImageGateway.js"),d=mw.loader.require("mediawiki.router");function u(e){this.gateway=e.gateway||new h({api:e.api}),this.router=e.router||d,this.eventBus=e.eventBus,a.call(this,s.extend({className:"overlay media-viewer",events:{"click .image-wrapper":"onToggleDetails","click .slider-button":"onSlide"}},e))}o(u,a,{hasFixedHeader:!1,hideOnExitClick:!1,template:mw.template.get("mobile.mediaViewer","Overlay.hogan"),defaults:s.extend({},a.prototype.defaults,{cancelButton:n.cancel("gray").toHtmlString(),detailsButton:new l({label:mw.msg("mobile-frontend-media-details"),additionalClassNames:"button",progressive:!0}).options,licenseLinkMsg:mw.msg("mobile-frontend-media-license-link"),thumbnails:[],slideLeftButton:new r({rotation:90,name:"arrow-invert"}).toHtmlString(),slideRightButton:new r({rotation:-90,name:"arrow-invert"}).toHtmlString()}),onSlide:function(e){var t=this.$(e.target).closest(".slider-button").data("thumbnail");this.emit(u.EVENT_SLIDE,t)},preRender:function(){var e=this;this.options.thumbnails.forEach(function(t,i){t.getFileName()===e.options.title&&(e.options.caption=t.getDescription(),e.galleryOffset=i)})},_enableArrowImages:function(e){var t,i,a=this.galleryOffset;void 0===this.galleryOffset?(t=e[e.length-1],i=e[0]):(t=e[0===a?e.length-1:a-1],i=e[a===e.length-1?0:a+1]),this.$(".prev").data("thumbnail",t),this.$(".next").data("thumbnail",i)},_disableArrowImages:function(){this.$(".prev, .next").remove()},_handleRetry:function(){this.router.emit("hashchange")},postRender:function(){var e,t=this.options.thumbnails||[],i=this;function s(){i.hideSpinner()}function o(){i.hasLoadError=!0,s(),i.$(".image img").hide(),0===i.$(".load-fail-msg").length&&new m({retryPath:i.router.getPath()}).on("retry",i._handleRetry.bind(i)).prependTo(i.$(".image"))}function r(){e.addClass("image-loaded")}t.length<2?this._disableArrowImages():this._enableArrowImages(t),this.$details=this.$(".details"),a.prototype.postRender.apply(this),this.gateway.getThumb(i.options.title).then(function(t){var a,n=t.descriptionurl+"#mw-jump-to-license";s(),i.thumbWidth=t.thumbwidth,i.thumbHeight=t.thumbheight,i.imgRatio=t.thumbwidth/t.thumbheight,(e=i.parseHTML("<img>",document)).on("load",r).on("error",o),e.attr("src",t.thumburl).attr("alt",i.options.caption),i.$(".image").append(e),i.$details.addClass("is-visible"),i._positionImage(),i.$(".details a").attr("href",n),t.extmetadata&&(t.extmetadata.LicenseShortName&&i.$(".license a").text(t.extmetadata.LicenseShortName.value).attr("href",n),t.extmetadata.Artist&&(a=t.extmetadata.Artist.value.replace(/<.*?>/g,""),i.$(".license").prepend(a+" &bull; "))),i.adjustDetails()},function(){o()}),this.eventBus.on("resize:throttled",this._positionImage.bind(this))},onToggleDetails:function(){this.hasLoadError||(this.$(".cancel, .slider-button").toggle(),this.$details.toggle(),this._positionImage())},onExitClick:function(e){a.prototype.onExitClick.apply(this,arguments),this.emit(u.EVENT_EXIT,e)},show:function(){a.prototype.show.apply(this,arguments),this._positionImage()},_positionImage:function(){var e,t,i,a,o,r=s.getWindow();this.adjustDetails(),e=this.$details.is(":visible")?this.$details.outerHeight():0,a=(t=r.width())/(i=r.height()-e),o=this.$("img"),this.imgRatio>a?t<this.thumbWidth&&o.css({width:t,height:"auto"}):i<this.thumbHeight&&o.css({width:"auto",height:i}),this.$(".image-wrapper").css("bottom",e)},adjustDetails:function(){var e=s.getWindow().height();this.$(".details").height()>.5*e&&this.$(".details").css("max-height",.5*e)}}),u.EVENT_EXIT="ImageOverlay-exit",u.EVENT_SLIDE="ImageOverlay-slide",e.exports=u},"./src/mobile.mediaViewer/LoadErrorMessage.js":function(e,t,i){var a=i("./src/mobile.startup/util.js"),s=i("./src/mobile.startup/mfExtend.js"),o=i("./src/mobile.startup/Icon.js"),r=i("./src/mobile.startup/View.js");function n(e){if(!e.retryPath)throw new Error("'retryPath' must be set in options param. Received: "+e.retryPath);r.call(this,{events:{"click .load-fail-msg-link a":"onRetry"}},e)}s(n,r,{template:mw.template.get("mobile.mediaViewer","LoadErrorMessage.hogan"),isTemplateMode:!0,defaults:a.extend({},n.prototype.defaults,{icon:new o({name:"alert-invert",additionalClassNames:"load-fail-msg-icon"}).toHtmlString(),msgToUser:mw.msg("mobile-frontend-media-load-fail-message"),retryTxt:mw.msg("mobile-frontend-media-load-fail-retry")}),postRender:function(){this.$(".load-fail-msg-link a").attr("href","#"+this.options.retryPath)},onRetry:function(){return this.emit("retry"),!1}}),e.exports=n},"./src/mobile.mediaViewer/mobile.mediaViewer.js":function(e,t,i){var a=i("./src/mobile.startup/moduleLoaderSingleton.js"),s=i("./src/mobile.mediaViewer/ImageOverlay.js");a.define("mobile.mediaViewer/ImageOverlay",s)}},[["./src/mobile.mediaViewer/mobile.mediaViewer.js",0,1]]]);
//# sourceMappingURL=mobile.mediaViewer.js.map.json