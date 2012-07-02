/*global document, window, mw, navigator, jQuery */
/*jslint sloppy: true, white:true, maxerr: 50, indent: 4, plusplus: true*/
(function( MobileFrontend ) {
MobileFrontend.navigation = (function( $ ) {
	var u = MobileFrontend.utils, mfePrefix = MobileFrontend.prefix,
		message = MobileFrontend.message;

	function resetActionBar() {
		var menu = $( '#' + mfePrefix + 'nav' )[0];
		menu.style.display = '';
	}

	function toggleActionBar() {
		var menu = $( '#' + mfePrefix + 'nav' )[0];
		if( menu.style.display ) {
			resetActionBar();
		} else {
			menu.style.display = 'block';
		}
	}

	function getOverlay() {
		return document.getElementById( 'mw-mf-overlay' );
	}

	function closeOverlay( ) {
		$( 'html' ).removeClass( 'overlay' );
		MobileFrontend.history.replaceHash( '#' );
	}

	function showOverlay() {
		$( 'html' ).addClass( 'overlay' );
		$( 'html' ).removeClass( 'navigationEnabled' );
	}

	function createOverlay( heading, contents, options ) {
		options = options || {};
		var overlay = document.getElementById( mfePrefix + 'overlay' );
		showOverlay();
		$( overlay ).empty();
		$( '<div class="header">' ).appendTo( '#' + mfePrefix + 'overlay' );
		$( '<button id="close"></button>' ).text( message( 'collapse-section' ) ).
			click( closeOverlay ).appendTo( '#' + mfePrefix + 'overlay' );
		if( typeof heading === 'string' ) {
			heading = $( '<h2 />' ).text( heading );
		}
		$( heading ).appendTo( '#' + mfePrefix + 'overlay .header' );
		$( overlay ).append( contents );
		$( 'a', overlay.lastChild ).bind( 'click', function() {
			toggleActionBar();
		});
		$( contents ).addClass( 'content' );
		if( options.locked ) { // locked overlays cannot be escaped.
			$( '#mw-mf-overlay .header' ).addClass( 'mw-mf-locked' );
			$( '#mw-mf-overlay #close' ).remove();
		}
	}

	function countContentHeadings() {
		return $( '.section h2 span' ).length;
	}

	function createTableOfContents() {
		var ul = $( '<ul />' )[0], li, a,
			click = function() {
				var hash = this.getAttribute( 'href' );
				MobileFrontend.toggle.wm_reveal_for_hash( hash );
				closeOverlay();
				if( hash ) {
					MobileFrontend.history.replaceHash( hash );
					window.setTimeout( function() {
						window.scrollTo( 0, document.getElementById( hash.substr( 1, hash.length ) ).offsetTop );
					}, 100 ); // timeout hack for ios 4.*
				}
			};
		$( '.section h2 span' ).each( function( i, el ) {
			li = $( '<li />' ).appendTo( ul )[0];
			a = $( '<a />' ).attr( 'href', '#' + $( el ).attr( 'id' ) ).
				text( $( el ).text() ).bind( 'click', click).appendTo( li );
		} );
		createOverlay( message( 'contents-heading' ), ul );
	}

	function countAvailableLanguages() {
		return $( '#' + mfePrefix + 'language-selection option' ).length;
	}

	function createLanguagePage() {
		var ul = $( '<ul />' )[0], li, a, $a, href, footer,
			$languages = $( '#' + mfePrefix + 'language-selection option' );

		$( '<li />' ).addClass( 'mw-mf-overlay-header' ).
			text( message( 'mobile-frontend-language-header' ).replace( '$1', $languages.length ) ).appendTo( ul );
		$languages.each( function(i, el) {
			li = $( '<li />' ).appendTo( ul )[0];
			a = $( '<a />' ).attr( 'href', el.value ).text( $( el ).text() ).appendTo( li );
		} );
		footer = $( '<li />' ).addClass( 'mw-mf-overlay-footer' ).
			html( message( 'mobile-frontend-language-footer' ) ).appendTo( ul );
		$a = $( 'a', footer );
		href = $( '#mw-mf-universal-language' ).attr( 'href' )
		$a.attr( 'href', href );
		createOverlay( message( 'language-heading' ), ul );
	}

	function init() {
		u( window ).bind( 'hashchange', function() {
			var hash = window.location.hash;
			if( hash === '#mw-mf-overlay' ) {
				showOverlay();
			} else if( !hash ) { // destroy overlay
				closeOverlay();
			}
		});
		$( '<div id="' + mfePrefix + 'overlay"></div>' ).appendTo( document.body );
		var search = document.getElementById(  mfePrefix + 'search' ),
			actionMenuButton = document.getElementById( mfePrefix + 'language' ),
			tocMenuButton = document.getElementById( mfePrefix + 'toc' );

		function toggleNavigation() {
			var doc = document.documentElement,
				mwMfPageLeft = document.getElementById( 'mw-mf-page-left' );
			if( !u( doc ).hasClass( 'navigationEnabled' ) ) {
				mwMfPageLeft.style.display = 'block';
				u( doc ).addClass( 'navigationEnabled' );
			} else {
				u( doc ).removeClass( 'navigationEnabled' );
				mwMfPageLeft.style.display = 'none';
			}
			$( '#mw-mf-menu-main a' ).click( function( ev ) {
				toggleNavigation(); // close before following link so that certain browsers on back don't show menu open
			} );
		}
		$( '#' + mfePrefix + 'main-menu-button' ).click( function( ev ) {
			toggleNavigation();
			ev.preventDefault();
			ev.stopPropagation();
		} );

		if( window.location.hash === '#mw-mf-page-left' ) {
			u( document.body ).addClass( 'noTransitions' );
			window.setTimeout( function() {
				u( document.body ).removeClass( 'noTransitions' );
			}, 1000 );
		}

		$( '#' + mfePrefix + 'page-menu-button' ).click( function( ev ) {
			ev.preventDefault();
			toggleActionBar();
		});

		if( countContentHeadings() > 0 ) {
			$( tocMenuButton ).bind( 'click', createTableOfContents );
		} else {
			$( tocMenuButton ).addClass( 'disabled' );
		}

		if( countAvailableLanguages() > 1 ) {
			$( actionMenuButton ).bind( 'click', createLanguagePage );
		} else {
			$( actionMenuButton ).addClass( 'disabled' );
		}

		u( search ).bind( 'focus', function() {
			u( document.documentElement ).removeClass( 'navigationEnabled' );
		} );
	}
	if( typeof( $ ) !== 'undefined' ) {
		init();
	}
	return {
		closeOverlay: closeOverlay,
		createOverlay: createOverlay,
		getOverlay: getOverlay,
		showOverlay: showOverlay
	};
}( jQuery ));
}( mw.mobileFrontend ));
