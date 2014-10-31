( function ( M, $ ) {
	var Api = M.require( 'api' ).Api,
		WikiDataApi;
	/**
	 * Gets claims and labels from the WikiData API
	 * @class WikiDataApi
	 * @extends Api
	 */
	WikiDataApi = Api.extend( {
		apiUrl: 'https://www.wikidata.org/w/api.php',
		useJsonp: true,
		language: mw.config.get( 'wgUserLanguage' ),

		initialize: function ( options ) {
			this.subjectId = options.itemId;
			Api.prototype.initialize.apply( this, arguments );
		},
		getClaims: function () {
			var self = this,
				id = this.subjectId;

			return this.ajax( {
				action: 'wbgetentities',
				ids: id,
				languages: this.language,
				props: [ 'descriptions', 'claims' ],
				format: 'json'
			} ).then( function ( data ) {
				var description, instanceClaims, entityClaims, instanceOf,
					claims = {};
				// See if the page has any 'instance of' claims.
				if ( data.entities !== undefined && data.entities[ id ].claims.P31 !== undefined ) {
					entityClaims = data.entities[ id ].claims;
					instanceClaims = entityClaims.P31;

					// Examine claims closely
					$.each( instanceClaims, function ( i, claim ) {
						instanceOf = claim.mainsnak.datavalue.value['numeric-id'];
						if ( instanceOf === 5 ) {
							claims.isHuman = true;
						} else if ( instanceOf === 515 ) {
							claims.isCity = true;
						} else if ( instanceOf === 6256 ) {
							claims.isCountry = true;
						} else if ( instanceOf === 16521 ) {
							claims.isTaxon = true;
						} else if ( instanceOf === 11424 ) {
							claims.isMovie = true;
						} else if ( instanceOf === 5398426 ) {
							claims.isTVSeries = true;
						}
						// Note: bands are subclassed as rock band, punk band etc.. not sure how we want
						// to include them here.
					} );

					// set some claims
					claims.hasOccupation = entityClaims.P106 ? true : false;
					claims.hasCountryOfCitizenship = entityClaims.P27 ? true : false;
					claims.hasDateOfBirth = entityClaims.P569 ? true : false;
					claims.hasDateOfDeath = entityClaims.P570 ? true : false;

					claims.entities = entityClaims;
					description = data.entities[ id ];

					if ( description ) {
						if ( description.descriptions[ self.language ] ) {
							claims.description = description.descriptions[ self.language ].value;
						}
					}
					return claims;
				} else {
					return false;
				}
			} );
		},
		/**
		 * Get labels for an item from Wikidata
		 * See: https://www.wikidata.org/wiki/Help:Label
		 *
		 * @param {Array} itemIds for items in Wikidata
		 * @return {jQuery.Deferred} Object returned by ajax call
		 */
		getLabels: function ( itemIds ) {
			var lang = this.language;
			return this.ajax( {
				action: 'wbgetentities',
				props: 'labels',
				languages: lang,
				ids: itemIds
			} ).then( function ( data ) {
				var map = {};
				$.each( itemIds, function ( i, itemId ) {
					if ( data.entities[ itemId ].labels &&
						data.entities[ itemId ].labels[ lang ] !== undefined
					) {
						map[ itemId ] = data.entities[ itemId ].labels[ lang ].value;
					} else {
						map[ itemId ] = null;
					}
				} );
				return map;
			} );
		}
	} );

	M.define( 'modules/wikigrok/WikiDataApi', WikiDataApi );

}( mw.mobileFrontend, jQuery ) );
