/*global document, window, mw, jQuery */
/*jslint sloppy: true, white:true, maxerr: 50, indent: 4, plusplus: true*/
(function( MobileFrontend, $ ) {
MobileFrontend.settings = (function() {
	var u = MobileFrontend.utils,
		message = MobileFrontend.message,
		mobileTokenCookieName = 'mobiletoken';

	function writeCookie( name, value, days, path, domain ) {
		var date, expires, cookie;
		if ( days ) {
			date = new Date();
			date.setTime( date.getTime() + ( days * 24 * 60 * 60 *1000 ) );
			expires = '; expires=' + date.toGMTString();
		} else {
			expires = '';
		}

		if ( typeof path === 'undefined' ) {
			path = "/";
		}

		cookie = name + '=' + value + expires + '; path=' + path;

		if ( typeof domain !== 'undefined' ) {
			cookie = cookie + '; domain=' + domain;
		}
		document.cookie = cookie;
	}

	function readCookie( name ) {
		var nameVA = name + '=',
			ca = document.cookie.split( ';' ),
			c, i;
		for( i=0; i < ca.length; i++ ) {
			c = ca[i];
			while ( c.charAt(0) === ' ' ) {
				c = c.substring( 1, c.length );
			}
			if ( c.indexOf( nameVA ) === 0 ) {
				return c.substring( nameVA.length, c.length );
			}
		}
		return null;
	}

	function removeCookie( name ) {
		writeCookie( name, '', -1 );
		return null;
	}

	function updateQueryStringParameter( a, k, v ) {
		var re = new RegExp( "([?|&])" + k + "=.*?(&|$)", "i" ),
			rtn,
			separator = a.indexOf( '?' ) !== -1 ? "&" : "?";
		if ( a.match( re ) ) {
			rtn = a.replace( re, '$1' + k + "=" + v + '$2' );
		} else {
			rtn = a + separator + k + "=" + v;
		}
		return rtn;
	}

	function addCSRFToken( link, name, value ) {
		return updateQueryStringParameter( link, name, value );
	}

	function readMobileToken() {
		var mobileToken = readCookie( mobileTokenCookieName );
		return mobileToken;
	}

	function updateMobileToken( responseXml ) {
		var mobileviewElements = responseXml.getElementsByTagName( 'mobileview' ),
			imagetoggle, mobileToken;
		if ( mobileviewElements[0] ) {
			mobileToken = mobileviewElements[0].getAttribute( 'mobiletoken' );
		}
		imagetoggle = document.getElementById( 'imagetoggle' );
		if ( mobileToken ) {
			writeCookie( mobileTokenCookieName, mobileToken, 1 );
			if( imagetoggle && imagetoggle.getAttribute( 'href' ) ) {
				imagetoggle.setAttribute( 'href',
					addCSRFToken( imagetoggle.href, 'mobiletoken', mobileToken ) );
			}
		}
	}

	function enhanceCheckboxes() {
	u( document.body ).addClass( 'mw-mf-checkboxes' );
		var inputs = document.getElementsByTagName( 'input' ), i, el, special;
		function clickChkBox() {
			var parent = this,
				box = parent.getElementsByTagName( 'input' )[ 0 ];

			if( !u( parent ).hasClass( 'checked' ) ) {
				u( parent ).addClass( 'checked' );
				box.checked = true;
			} else {
				u( parent ).removeClass( 'checked' );
				box.checked = false;
			}
		}
		for( i = 0; i < inputs.length; i++ ) {
			el = inputs[i];
			special = u( el.parentNode ).hasClass( 'mw-mf-checkbox-css3' );
			if( el.getAttribute( 'type' ) === 'checkbox' && special ) {
				u( el.parentNode ).bind( 'click', clickChkBox );
				if( el.checked ) {
					u( el.parentNode ).addClass( 'checked ');
				}
			}
		}
	}

	function desktopViewClick() {
		// get mf_mobileFormat cookie info
		var formatCookieName = MobileFrontend.setting( 'useFormatCookieName' ),
			formatCookieDuration = MobileFrontend.setting( 'useFormatCookieDuration' ),
			cookiePath = MobileFrontend.setting( 'useFormatCookiePath' ),
			formatCookieDomain = MobileFrontend.setting( 'useFormatCookieDomain' ),
			stopMobileRedirectCookieName, stopMobileRedirectCookieDuration, stopMobileRedirectCookieDomain,
			hookOptions;

		// convert from seconds to days
		formatCookieDuration = formatCookieDuration / ( 24 * 60 * 60 );
		// expire the mf_mobileFormat cookie
		MobileFrontend.settings.writeCookie( formatCookieName, '', formatCookieDuration, cookiePath, formatCookieDomain );

		// get stopMobileRedirect cookie info
		stopMobileRedirectCookieName = MobileFrontend.setting( 'stopMobileRedirectCookieName' );
		stopMobileRedirectCookieDuration = MobileFrontend.setting( 'stopMobileRedirectCookieDuration' );
		stopMobileRedirectCookieDomain = MobileFrontend.setting( 'stopMobileRedirectCookieDomain' );
		hookOptions = MobileFrontend.setting( 'hookOptions' );
		// convert from seconds to days
		stopMobileRedirectCookieDuration = stopMobileRedirectCookieDuration / ( 24 * 60 *60 );

		if ( hookOptions !== 'toggle_view_desktop' ) {
			// set the stopMobileRedirect cookie
			MobileFrontend.settings.writeCookie( stopMobileRedirectCookieName, 'true', stopMobileRedirectCookieDuration, cookiePath, stopMobileRedirectCookieDomain );
		}
	}

	/* REQUIRES: jQuery */
	function showLanguageOverlay() {
		var links, overlay, i, search,
			nav = MobileFrontend.navigation,
			container = $( '#mw-mf-language-list' ).clone();
		search = $( '<input type="search" class="mw-mf-search" id="mw-mf-language-search" >' ).
			attr( 'placeholder', message( 'mobile-frontend-language-site-choose' ) )[0];
		$( '<li>' ).text( message( 'mobile-frontend-language-site-nomatches' ) ).
			hide().appendTo( container );
		nav.createOverlay( search, container, { locked: true } );
		overlay = nav.getOverlay();

		nav.showOverlay();

		// bind search to filter the list of languages
		search = $( '#mw-mf-overlay input' )[0];
		function filterLanguages() {
			var val = this.value.toLowerCase(), choice, matches = 0, i,
				choices = $( 'li', overlay ),
				totalchoices = choices.length;
			for( i = 0; i < totalchoices; i++ ) {
				choice = choices[i];
				if( u( choice ).text().toLowerCase().indexOf( val ) > -1 ) {
					matches += 1;
					$( choice ).show();
				} else if( i > 0 ) { // don't hide header
					$( choice ).hide();
				}
			}
			// reveal / hide the no results message
			if( matches === 0 ) {
				$( choice ).show();
			} else {
				$( choice ).hide();
			}
		}
		$( search ).on( 'keyup', filterLanguages ).focus();
	}

	function init() {
		var mobileToken = readMobileToken(), imagetoggle, apiUrl = '/api.php',
			url;

		if ( !mobileToken ) {
			apiUrl = MobileFrontend.setting( 'scriptPath' ) + apiUrl;
			url = apiUrl + '?action=mobileview&page=mobiletoken&override=1&format=xml';
			u.ajax( { url: url,
				success: function( xml ) {
					updateMobileToken( xml );
				}
				} );
		} else {
			imagetoggle = document.getElementById( 'imagetoggle' );
			imagetoggle.setAttribute( 'href', addCSRFToken( imagetoggle.href, 'mobiletoken', mobileToken ) );
		}
		enhanceCheckboxes();
		u( document.getElementById( 'mw-mf-display-toggle' ) ).bind( 'click', desktopViewClick );
		if( MobileFrontend.navigation && MobileFrontend.jQuery ) {
			if( $( '#mw-mf-language-list' )[0] ) {
				showLanguageOverlay();
			}
		}
	}
	MobileFrontend.registerModule( 'settings' );
	return {
		init: init,
		readCookie: readCookie,
		removeCookie: removeCookie,
		writeCookie: writeCookie
	};
}());
}( mw.mobileFrontend, jQuery ));
