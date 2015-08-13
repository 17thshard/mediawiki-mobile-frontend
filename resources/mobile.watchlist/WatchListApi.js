/**
 * API for WatchList
 * @extends Api
 * @class WatchListApi
 */
( function ( M, $ ) {

	var WatchListApi,
		time = M.require( 'modules/lastEdited/time' ),
		Api = M.require( 'api' ).Api;

	/**
	 * @class WatchListApi
	 * @extends Api
	 */
	WatchListApi = Api.extend( {
		/** @inheritdoc */
		initialize: function ( lastTitle ) {
			Api.prototype.initialize.apply( this, arguments );
			// Try to keep it in sync with SpecialMobileWatchlist::LIMIT (php)
			this.limit = 50;

			if ( lastTitle ) {
				this.continueParams = {
					continue: 'gwrcontinue||',
					gwrcontinue: '0|' + lastTitle.replace( / /g, '_' )
				};
				this.shouldSkipFirstTitle = true;
			} else {
				this.continueParams = {
					continue: ''
				};
				this.shouldSkipFirstTitle = false;
			}

			this.canContinue = true;
		},
		/**
		 * Load the list of items on the watchlist
		 * @returns {jQuery.Deferred}
		 */
		load: function () {
			if ( this.canContinue === false ) {
				return $.Deferred();
			}
			var self = this,
				params = $.extend( {
					action: 'query',
					prop: 'pageimages|info',
					piprop: 'thumbnail',
					pithumbsize: mw.config.get( 'wgMFThumbnailSizes' ).tiny,
					pilimit: this.limit,
					format: 'json',
					formatversion: 2,
					generator: 'watchlistraw',
					gwrnamespace: '0',
					gwrlimit: this.limit
				}, this.continueParams );

			if ( this.shouldSkipFirstTitle ) {
				// If we are calling the api from the last item of the previous page
				// (like the first time when grabbing the last title from the HTML),
				// then request one extra element (make room for that last title) which
				// will be removed later when parsing data.
				params.gwrlimit += 1;
				params.pilimit += 1;
			}
			return this.get( params, {
				url: this.apiUrl
			} ).then( function ( data ) {
				if ( data.hasOwnProperty( 'continue' ) ) {
					self.continueParams = data.continue;
				} else {
					self.canContinue = false;
				}

				return self.parseData( data );
			} );
		},

		/**
		 * Parse api response data into pagelist item format
		 * @param {Object[]} data
		 */
		parseData: function ( data ) {
			var pages;

			if ( !data.hasOwnProperty( 'query' ) || !data.query.hasOwnProperty( 'pages' ) ) {
				return [];
			}

			// Convert the map to an Array.
			pages = $.map( data.query.pages, function ( page ) {
				return page;
			} );

			// Sort results alphabetically (the api map doesn't have any order). The
			// watchlist is ordered alphabetically right now.
			pages.sort( function ( p1, p2 ) {
				return p1.title === p2.title ? 0 : ( p1.title < p2.title ? -1 : 1 );
			} );

			// If we requested from the last item of the previous page, we shall
			// remove the first result (to avoid it being repeated)
			if ( this.shouldSkipFirstTitle ) {
				pages = pages.slice( 1 );
				this.shouldSkipFirstTitle = false;
			}

			// Transform the items to a sensible format
			return $.map( pages, function ( item ) {
				var delta, msgId, thumb, data;

				thumb = item.thumbnail;

				if ( thumb ) {
					thumb.isLandscape = thumb.width > thumb.height;
				}

				// page may or may not exist.
				if ( item.touched ) {
					// work out delta in seconds
					delta = time.timeAgo( ( new Date() - new Date( item.touched ) ) / 1000 );
					if ( $.inArray( delta.unit, [ 'days', 'months', 'years' ] ) > -1 ) {
						msgId = 'mobile-frontend-' + delta.unit + '-ago';
					} else {
						msgId = delta.unit + '-ago';
					}
				}

				data = {
					isMissing: item.missing ? true : false,
					displayTitle: item.title,
					id: item.pageid,
					url: mw.util.getUrl( item.title ),
					thumbnail: thumb
				};

				if ( msgId ) {
					data.lastModified = mw.msg( 'mobile-frontend-watchlist-modified',
						mw.msg( msgId, delta.value ) );
				}
				return data;
			} );
		}

	} );

	M.define( 'modules/watchlist/WatchListApi', WatchListApi );

}( mw.mobileFrontend, jQuery ) );
