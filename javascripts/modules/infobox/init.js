( function ( M ) {
	M.require( 'context' ).assertMode( [ 'alpha' ] );
	var infobox,
		page = M.getCurrentPage(),
		wikidataID = mw.config.get( 'wgWikibaseItemId' ),
		InfoboxEditorOverlay = M.require( 'modules/wikigrok/InfoboxEditorOverlay' ),
		Infobox = M.require( 'modules/wikigrok/Infobox' );

	// Load infoboxes on pages in the main space which are not main pages
	if ( wikidataID && !page.isMainPage() && page.getNamespaceId() === 0 ) {
		// build the future
		infobox = new Infobox( {
			itemId: wikidataID
		} );
		infobox.insertAfter( '.pre-content' );

		M.overlayManager.add( /\/infobox\/editor/, function () {
			return new InfoboxEditorOverlay( {
				infobox: infobox
			} );
		} );
	}
}( mw.mobileFrontend ) );
