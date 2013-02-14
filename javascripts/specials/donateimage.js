( function( M, $ ) {
var api = M.require( 'api' ),
	photo = M.require( 'photo' ),
	popup = M.require( 'notifications' ),
	View = M.require( 'view' ),
	m;

m = ( function() {
	var IMAGE_WIDTH = 320,
		UserGallery = View.extend( {
			initialize: function( options ) {
				this.$placeholder = options.$placeholder;
			},
			isEmpty: function() {
				return this.$( 'li' ).length === 0;
			},
			removePlaceholder: function() {
				this.$placeholder.remove(); // remove placeholder text in case of first upload
			},
			templateItem: M.template(
				'<li><a href="{{descriptionUrl}}" alt="{{description}}"><img src="{{url}}" width="{{width}}"></a><p>{{description}}</p></li>'
			),
			addPhoto: function( photoData, notify ) {
				var msgKey, $li;
				if ( this.isEmpty() ) {
					this.removePlaceholder();
					msgKey = 'mobile-frontend-donate-photo-first-upload-success';
				} else {
					msgKey = 'mobile-frontend-donate-photo-upload-success';
				}
				$li = $( this.templateItem.render( photoData ) ).
					prependTo( this.$el );
				if ( notify ) {
					$li.hide().slideDown();
					popup.show( mw.msg( msgKey ), 'toast' );
				}
			}
		} ),
		userGallery;

	function getImageDataFromPage( page ) {
		var img = page.imageinfo[0];
		return { url: img.thumburl, fileName: img.name, title: page.title,
			descriptionUrl: img.descriptionurl };
	}

	function extractDescription( text ) {
		var index, summary = '';
		// FIXME: assumes wikimedia commons - this should be customisable
		index = text.indexOf( '== {{int:filedesc}} ==' );
		if ( index > - 1 ) {
			summary = $.trim( text.substr( index ).split( '==' )[ 2 ] );
		}
		return summary;
	}
	function appendDescriptions( imageData, callback ) {
		var corsUrl = M.getConfig( 'photo-upload-endpoint' ), options,
			data, titles = $.map( imageData, function( i ) {
				return i.title;
			} );

		data = {
			action: 'query',
			titles: titles,
			origin: corsUrl ? M.getOrigin() : undefined,
			prop: 'revisions',
			rvprop: 'content'
		};

		if ( corsUrl ) {
			options = { url: corsUrl };
		}
		api.ajax( data, options ).done( function( resp ) {
			var pages = $.map( resp.query.pages, function ( v ) {
				return v;
			} );
			$( pages ).each( function() {
				imageData[ this.title ].description = extractDescription( this.revisions[0]['*'] ) ||
					mw.msg( 'mobile-frontend-listed-image-no-description' );
			} );
			callback( imageData );
		} );
	}

	function showGallery( username ) {
		var corsUrl = M.getConfig( 'photo-upload-endpoint' );
		// FIXME: use api module
		$.ajax( {
			url: corsUrl || M.getApiUrl(),
			data: {
				action: 'query',
				generator: 'allimages',
				format: 'json',
				gaisort: 'timestamp',
				gaidir: 'descending',
				gaiuser: username,
				gailimit: 10,
				prop: 'imageinfo',
				origin: corsUrl ? M.getOrigin() : undefined,
				iiprop: 'url',
				iiurlwidth: IMAGE_WIDTH
			},
			xhrFields: {
				'withCredentials': true
			}
		} ).done( function( resp ) {
			var pages = [], data = {};

			if ( resp.query && resp.query.pages ) {
				pages = resp.query.pages;
				$.each( pages, function () {
					data[ this.title ] = getImageDataFromPage( this );
				} );
				appendDescriptions( data, function( imageData ) {
					$.each( imageData, function() {
						userGallery.addPhoto( this );
					} );
				} );
			}

			if ( pages.length === 0 ) {
				$( '<p>' ).text( mw.msg( 'mobile-frontend-donate-image-summary' ) ).
					insertBefore( userGallery.$el );
			}
		} );
	}

	function init() {
		var $container,
			username = M.getConfig( 'username' );

		userGallery = new UserGallery( {
			el: 'ul.mobileUserGallery',
			// FIXME: should be possible to do this more elegantly
			$placeholder: $( '#content p' ).eq( 0 )
		} );

		if ( photo.isSupported() ) {
			$container = $( '<div class="ctaUploadPhoto">' ).prependTo( '#content_wrapper' );

			new photo.PhotoUploader( {
				buttonCaption: mw.msg( 'mobile-frontend-photo-upload-generic' ),
				pageTitle: mw.config.get( 'wgTitle' )
			} ).
				prependTo( $container ).
				on( 'success', function( image ) {
					image.width = IMAGE_WIDTH;
					userGallery.addPhoto( image, true );
				} );
			// put user upload stats in correct spot
			if ( $( '.mobileUserUploadCount' ).length ) {
				$( '.mobileUserUploadCount' ).prependTo( $container );
			}
		}
		if ( username ) {
			showGallery( username );
		}
	}

	return {
		extractDescription: extractDescription,
		init: init
	};
}() );

M.define( 'userGallery', m );

}( mw.mobileFrontend, jQuery ) );
