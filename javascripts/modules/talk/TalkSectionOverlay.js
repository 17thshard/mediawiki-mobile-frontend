( function ( M, $ ) {
	var
		Overlay = M.require( 'Overlay' ),
		popup = M.require( 'toast' ),
		api = M.require( 'api' ),
		user = M.require( 'user' ),
		Page = M.require( 'Page' ),
		TalkSectionOverlay;

	/**
	 * Overlay for showing talk page section
	 * @class TalkSectionOverlay
	 * @extends Overlay
	 * @uses Api
	 * @uses Page
	 * @uses Toast
	 */
	TalkSectionOverlay = Overlay.extend( {
		templatePartials: {
			header: mw.template.get( 'mobile.talk.overlays', 'Section/header.hogan' ),
			content: mw.template.get( 'mobile.talk.overlays', 'Section/content.hogan' )
		},
		/**
		 * @inheritdoc
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {String} defaults.title Title.
		 * @cfg {Section} defaults.section that is currently being viewed in overlay.
		 * @cfg {String} defaults.reply Reply heading.
		 * @cfg {String} defaults.info Message that informs the user their talk reply will be
		 * automatically signed.
		 */
		defaults: $.extend( {}, Overlay.prototype.defaults, {
			title: undefined,
			section: undefined,
			reply: mw.msg( 'mobile-frontend-talk-reply' ),
			info: mw.msg( 'mobile-frontend-talk-reply-info' )
		} ),
		/**
		 * Fetches the talk topics of the page specified in options.title
		 * if options.section is not defined.
		 * @inheritdoc
		 */
		postRender: function ( options ) {
			var self = this;

			Overlay.prototype.postRender.apply( this, arguments );
			if ( !options.section ) {
				M.pageApi.getPage( options.title ).done( function ( pageData ) {
					var page = new Page( pageData );
					options.section = page.getSection( options.id );
					self.render( options );
				} );
			} else {
				this.$( '.loading' ).remove();
				this._enableComments( options.title, options.id );
			}
		},
		/**
		 * Enables comments on the current rendered talk topic
		 * @method
		 * @private
		 * @param {String} title of the talk page with `Talk` prefix to post to
		 * @param {Number} id of the sub section to open
		 */
		_enableComments: function ( title, id ) {
			var self = this,
				$comment = this.$( '.comment' ),
				$textarea = $comment.find( 'textarea' );

			if ( user.isAnon() || !M.isAlphaGroupMember() ) {
				$comment.remove();
			} else {
				$textarea.on( 'focus', function () {
					$textarea.removeClass( 'error' );
				} );
				$comment.find( 'button' ).on( 'click', function () {
					var val = $textarea.val();
					if ( val ) {
						$comment.hide();
						self.$( '.loading' ).show();
						// sign and add newline to front
						val = '\n\n' + val + ' ~~~~';
						api.postWithToken( 'edit', {
							action: 'edit',
							title: title,
							section: id,
							appendtext: val
						} ).done( function ( data ) {
							self.$( '.loading' ).hide();
							$comment.show();
							if ( data.error ) {
								$textarea.addClass( 'error' );
							} else {
								self.hide();
								popup.show( mw.msg( 'mobile-frontend-talk-reply-success' ), 'toast' );
								// invalidate the cache
								M.pageApi.invalidatePage( title );
							}
						} );
					} else {
						$textarea.addClass( 'error' );
					}
				} );
			}
		}
	} );

	M.define( 'modules/talk/TalkSectionOverlay', TalkSectionOverlay );
}( mw.mobileFrontend, jQuery ) );
