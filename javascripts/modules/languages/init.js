( function ( M, $ ) {

	var loader = M.require( 'loader' ),
		pageApi = M.require( 'pageApi' ),
		MobileWebClickTracking = M.require( 'loggingSchemas/SchemaMobileWebClickTracking' ),
		uiSchema = new MobileWebClickTracking( {}, 'MobileWebUIClickTracking' );

	M.overlayManager.add( /^\/languages$/, function () {
		var result = $.Deferred();

		loader.loadModule( 'mobile.languages', true ).done( function ( loadingOverlay ) {
			var LanguageOverlay = M.require( 'modules/languages/LanguageOverlay' );

			pageApi.getPageLanguages( mw.config.get( 'wgPageName' ) ).done( function ( data ) {
				loadingOverlay.hide();
				result.resolve( new LanguageOverlay( {
					languages: data.languages,
					variants: data.variants
				} ) );
			} );
		} );
		return result;
	} );

	/**
	 * Hijack the Special:Languages link and replace it with a trigger to a LanguageOverlay
	 * that displays the same data
	 * @ignore
	 */
	function initButton() {
		$( '#page-secondary-actions .languageSelector' ).on( 'click', function ( ev ) {
			ev.preventDefault();
			M.router.navigate( '/languages' );
			uiSchema.log( {
				name: 'languages'
			} );
		} );
	}

	$( initButton );

}( mw.mobileFrontend, jQuery ) );
