( function( M, $ ) {
	M.navigation.popup = ( function() {
		var calculatePosition = function() {};

		if ( !M.supportsPositionFixed() ) {
			calculatePosition = function() {
				var h = $( '#mf-notification' ).outerHeight();
				$( '#mf-notification' ).css( {
					top:  ( window.innerHeight + window.pageYOffset ) - h,
					bottom: 'auto',
					position: 'absolute'
				} );
			};
			$( document ).scroll( calculatePosition );
		}

		function isVisible() {
			return $( '#mf-notification' ).is( ':visible' );
		}

		function show( html, classes ) {
			$( '#mf-notification div' ).removeAttr( 'class' ).
				addClass( classes ).
				html( html );
			calculatePosition();
			return $( '#mf-notification' ).removeAttr( 'class' ).
				addClass( classes ).show();
		}

		function close( forceClose ) {
			var $notification = $( '#mf-notification' );
			if ( !$notification.is( ':visible' ) ) {
				return;
			} else if ( !$notification.hasClass( 'locked' ) || forceClose ) {
				$( '#mf-notification' ).hide();
			}
		}

		function notifyAuthenticatedUser() {
			if ( window.location.search.indexOf( 'welcome=yes' ) > -1 ) {
				show( M.message( 'mobile-frontend-logged-in-toast-notification' ), 'toast' );
			}
		}

		function init( firstRun ) {
			var el = $( '<div id="mf-notification"><div></div></div>' ).hide().
				appendTo( document.body )[ 0 ];

			if ( M.getConfig( 'beta' ) ) {
				notifyAuthenticatedUser();
			}

			firstRun = firstRun === undefined ? true : firstRun;

			function cancelBubble( ev ) {
				ev.stopPropagation();
			}
			el.ontouchstart = cancelBubble;
			$( '<button>' ).click( function( ev ) {
				ev.stopPropagation();
				close( true );
			} ).appendTo( '#mf-notification' );

			if ( firstRun ) {
				$( window ).scroll( function() {
					close();
				} );

				$( document.body ).bind( 'click touchstart', function() {
					close();
				} );
			}
		}

		init();
		return {
			close: close,
			isVisible: isVisible,
			show: show
		};

	}() );

}( mw.mobileFrontend, jQuery ) );
