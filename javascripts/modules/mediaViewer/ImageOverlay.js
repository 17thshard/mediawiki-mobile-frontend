( function ( M, $ ) {
	var Overlay = M.require( 'Overlay' ),
		Icon = M.require( 'Icon' ),
		ImageApi = M.require( 'modules/mediaViewer/ImageApi' ),
		ImageOverlay, api;

	api = new ImageApi();

	/**
	 * Displays images in full screen overlay
	 * @class ImageOverlay
	 * @extends Overlay
	 * @uses Icon
	 * @uses ImageApi
	 */
	ImageOverlay = Overlay.extend( {
		// allow pinch zooming
		hasFixedHeader: false,
		className: 'overlay media-viewer',
		template: mw.template.get( 'mobile.mediaViewer', 'Overlay.hogan' ),
		closeOnBack: true,

		/**
		 * @inheritdoc
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {String} defaults.cancelButton HTML of the cancel button.
		 * @cfg {String} defaults.detailsMsg Caption for a button leading to the details
		 * of a media file (e.g. an image) in a preview.
		 * @cfg {String} defaults.licenseLinkMsg Link to license information in media viewer.
		 */
		defaults: {
			cancelButton: new Icon( {
				tagName: 'button',
				// Uses a dark theme so swap out the icon
				name: 'cancel-light',
				additionalClassNames: 'cancel',
				label: mw.msg( 'mobile-frontend-overlay-close' )
			} ).toHtmlString(),
			detailsMsg: mw.msg( 'mobile-frontend-media-details' ),
			licenseLinkMsg: mw.msg( 'mobile-frontend-media-license-link' )
		},

		/** @inheritdoc */
		postRender: function ( options ) {
			var $img,
				self = this;

			Overlay.prototype.postRender.apply( this, arguments );

			api.getThumb( options.title ).done( function ( data ) {
				var author, url = data.descriptionurl + '#mw-jump-to-license';

				/**
				 * Hide the spinner
				 * @method
				 * @ignore
				 */
				function removeLoader() {
					self.$( '.spinner' ).hide();
				}

				self.thumbWidth = data.thumbwidth;
				self.thumbHeight = data.thumbheight;
				self.imgRatio = data.thumbwidth / data.thumbheight;
				$img = $( '<img>' ).attr( 'src', data.thumburl ).attr( 'alt', options.caption );
				self.$( '.image' ).append( $img );

				if ( $img.prop( 'complete' ) ) {
					// if the image is loaded from browser cache, "load" event may not fire
					// (http://stackoverflow.com/questions/910727/jquery-event-for-images-loaded#comment10616132_1110094)
					removeLoader();
				} else {
					// remove the loader when the image is loaded
					$img.on( 'load', removeLoader );
				}
				self._positionImage();
				self.$( '.details a' ).attr( 'href', url );
				if ( data.extmetadata ) {
					// Add license information
					if ( data.extmetadata.LicenseShortName ) {
						self.$( '.license a' )
							.text( data.extmetadata.LicenseShortName.value )
							.attr( 'href', url );
					}
					// Add author information
					if ( data.extmetadata.Artist ) {
						// Strip any tags
						author = data.extmetadata.Artist.value.replace( /<.*?>/g, '' );
						self.$( '.license' ).prepend( author + ' &bull; ' );
					}
				}
			} );

			$( window ).on( 'resize', $.proxy( this, '_positionImage' ) );

			this.$details = this.$( '.details' );

			this.$( '.image-wrapper' ).on( 'click', function () {
				self.$details.toggle();
				self._positionImage();
			} );
		},

		/** @inheritdoc */
		show: function () {
			Overlay.prototype.show.apply( this, arguments );
			this._positionImage();
		},

		/**
		 * Fit the image into the window if its dimensions are bigger than the window dimensions.
		 * Compare window width to height ratio to that of image width to height when setting
		 * image width or height.
		 * @method
		 * @private
		 */
		_positionImage: function () {
			// with a hidden details box we have a little bit more space, we just need to use it
			var detailsHeight = !this.$details.is( ':visible' ) ? 0 : this.$details.outerHeight(),
				windowWidth = $( window ).width(),
				windowHeight = $( window ).height() - detailsHeight,
				windowRatio = windowWidth / windowHeight,
				$img = this.$( 'img' );

			// display: table (which we use for vertical centering) makes the overlay
			// expand so simply setting width/height to 100% doesn't work
			if ( this.imgRatio > windowRatio ) {
				if ( windowWidth < this.thumbWidth ) {
					$img.css( {
						width: windowWidth,
						height: 'auto'
					} );
				}
			} else {
				if ( windowHeight < this.thumbHeight ) {
					$img.css( {
						width: 'auto',
						height: windowHeight
					} );
				}
			}
			$( '.image-wrapper' ).css( 'bottom', detailsHeight );
		}
	} );
	M.define( 'modules/mediaViewer/ImageOverlay', ImageOverlay );

}( mw.mobileFrontend, jQuery ) );
