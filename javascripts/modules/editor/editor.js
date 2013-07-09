( function( M, $ ) {

	var EditorOverlay = M.require( 'modules/editor/EditorOverlay' ),
		popup = M.require( 'notifications' ),
		CtaDrawer = M.require( 'CtaDrawer' ),
		drawer = new CtaDrawer( {
			content: mw.msg( 'mobile-frontend-editor-cta' )
		} );

	function addEditButton( section, container ) {
		$( '<a class="edit-page inline" href="#editor-' + section + '">' ).
			text( mw.msg( 'mobile-frontend-editor-edit' ) ).
			prependTo( container ).
			on( 'mouseup', function( ev ) {
				// prevent folding section when clicking Edit
				ev.stopPropagation();
			} );
	}

	function init() {
		// FIXME: this doesn't work when loading page dynamically
		var isNew = mw.config.get( 'wgArticleId' ) === 0;

		M.router.route( /^editor-(\d+)$/, function( section ) {
			var title = mw.config.get( 'wgTitle' ), ns = mw.config.get( 'wgCanonicalNamespace' );
			section = parseInt( section, 10 );
			new EditorOverlay( {
				title: ns ? ns + ':' + title : title,
				isNew: isNew,
				section: section
			} ).show();
		} );
		$( '#ca-edit' ).addClass( 'enabled' );

		// FIXME: unfortunately the main page is special cased.
		if ( mw.config.get( 'wgIsMainPage' ) || isNew || $( '#content_0' ).text() ) {
			// if lead section is not empty, open editor with lead section
			addEditButton( 0, '#ca-edit' );
		} else {
			// if lead section is empty, open editor with first section
			addEditButton( 1, '#ca-edit' );
		}

		$( 'h2 .mw-editsection' ).each( function() {
			// FIXME [ParserOutput]: This is nasty
			var editHref = $( this ).find( 'a' ).attr( 'href' ),
				qs = editHref.split( '?' )[ 1 ],
				section = M.deParam( qs ).section;
			if ( section ) {
				addEditButton( section, $( this ).parent() );
			}
			$( this ).remove();
		} );
	}

	if ( mw.config.get( 'wgIsPageEditable' ) && M.router.isSupported() ) {
		if ( mw.config.get( 'wgMFAnonymousEditing' ) || mw.config.get( 'wgUserName' ) ) {
			init();
		} else {
			$( '#ca-edit' ).addClass( 'enabled' ).on( 'click', $.proxy( drawer, 'show' ) );
		}
		M.on( 'page-loaded', init );
	} else {
		$( '#ca-edit' ).on( 'click', function() {
			popup.show( mw.msg( 'mobile-frontend-editor-disabled' ), 'toast' );
		} );
	}

}( mw.mobileFrontend, jQuery ) );
