( function( M, $ ) {

	var Api = M.require( 'api' ).Api, PageApi;

	function transformSections( sections ) {
		var
			collapseLevel = Math.min.apply( this, $.map( sections, function( s ) { return s.level; } ) ) + '',
			result = [], $tmpContainer = $( '<div>' );

		$.each( sections, function( i, section ) {
			// FIXME: [API] should probably do this for us - we want to be able to control the styling of these headings - no inline styles!
			section.line = $( '<div>' ).html( section.line ).text();
			if ( !section.level || section.level === collapseLevel ) {
				result.push( section );
			} else {
				// FIXME: ugly, maintain structure returned by API and use templates instead
				$tmpContainer.html( section.text );
				$tmpContainer.prepend(
					$( '<h' + section.level + '>' ).attr( 'id', section.anchor ).html( section.line )
				);
				result[result.length - 1].text += $tmpContainer.html();
			}
		} );

		return result;
	}

	PageApi = Api.extend( {
		initialize: function() {
			this._super();
			this.cache = {};
		},

		/**
		 * Retrieve a page from the api
		 *
		 * @param {string} title the title of the page to be retrieved
		 * @param {string} endpoint an alternative api url to retreive the page from
		 * @param {boolean} leadOnly When set only the lead section content is returned
		 * @return {jQuery.Deferred} with parameter page data that can be passed to a Page view
		 */
		getPage: function( title, endpoint, leadOnly ) {
			var options = endpoint ? { url: endpoint, dataType: 'jsonp' } : {}, page, timestamp;

			if ( !this.cache[title] ) {
				page = this.cache[title] = $.Deferred();
				this.get( {
					action: 'mobileview',
					page: title,
					variant: mw.config.get( 'wgPreferredVariant' ),
					redirect: 'yes',
					prop: 'id|sections|text|lastmodified|lastmodifiedby',
					noheadings: 'yes',
					noimages: mw.config.get( 'wgImagesDisabled', false ) ? 1 : undefined,
					sectionprop: 'level|line|anchor',
					sections: leadOnly ? 0 : 'all'
				}, options ).done( function( resp ) {
					var sections, lastModified, resolveObj;

					if ( resp.error || !resp.mobileview.sections ) {
						page.reject( resp );
					// FIXME: [LQT] remove when liquid threads is dead (see Bug 51586)
					} else if ( resp.mobileview.hasOwnProperty( 'liquidthreads' ) ) {
						page.reject( { error: { code: 'lqt' } } );
					} else {
						sections = transformSections( resp.mobileview.sections );
						// Assume the timestamp is in the form TS_ISO_8601 and we don't care about old browsers
						// change to seconds to be consistent with PHP
						timestamp = new Date( resp.mobileview.lastmodified ).getTime() / 1000;
						lastModified = resp.mobileview.lastmodifiedby;
						resolveObj = {
							title: title,
							id: resp.mobileview.id,
							lead: sections[0].text,
							sections: sections.slice( 1 ),
							isMainPage: resp.mobileview.hasOwnProperty( 'mainpage' ) ? true : false,
							historyUrl: mw.util.getUrl( title, { action: 'history' } ),
							lastModifiedTimestamp: timestamp
						};
						// Add non-anonymous user information
						if ( lastModified ) {
							$.extend( resolveObj, {
								lastModifiedUserName: lastModified.name,
								lastModifiedUserGender: lastModified.gender
							} );
						}
						page.resolve( resolveObj );
					}
				} ).fail( $.proxy( page, 'reject' ) );
			}

			return this.cache[title];
		},

		/**
		 * Invalidate the internal cache for a given page
		 *
		 * @param {string} title the title of the page who's cache you want to invalidate
		 */
		invalidatePage: function( title ) {
			delete this.cache[title];
		},

		/**
		 * Gathers a mapping of all available language codes on the site and their human readable names
		 *
		 * @return {jQuery.Deferred} where argument is a javascript object with language codes as keys
		 */
		_getAllLanguages: function() {
			if ( !this._languageCache ) {
				this._languageCache = this.get( {
					action: 'query',
					meta: 'siteinfo',
					siprop: 'languages'
				} ).then( function( data ) {
					var languages = {};
					data.query.languages.forEach( function( item ) {
						languages[ item.code ] = item[ '*' ];
					} );
					return languages;
				} );
			}
			return this._languageCache;
		},

		/**
		 * Retrieve available languages for a given title
		 *
		 * FIXME: Return language variants as well. Requires an upstream change.
		 *
		 * @param {string} title the title of the page languages should be retrieved for
		 * @return {jQuery.Deferred} which is called with a mapping of language codes to language names
		 */
		getPageLanguages: function( title ) {
			var self = this, result = $.Deferred();

			this._getAllLanguages().done( function( allAvailableLanguages ) {
				self.get( {
					action: 'query',
					prop: 'langlinks',
					llurl: true,
					lllimit: 'max',
					titles: title
				} ).done( function( resp ) {
					// FIXME: API returns an object when a list makes much more sense
					var pages = $.map( resp.query.pages, function( v ) { return v; } ),
					// FIXME: "|| []" wouldn't be needed if API was more consistent
					langlinks = pages[0] ? pages[0].langlinks || [] : [];

					langlinks.forEach( function( item, i ) {
						langlinks[ i ].langname = allAvailableLanguages[ item.lang ];
					} );

					result.resolve( langlinks );
				} ).fail( $.proxy( result, 'reject' ) );
			} );

			return result;
		}
	} );

	M.define( 'PageApi', PageApi );

}( mw.mobileFrontend, jQuery ) );

