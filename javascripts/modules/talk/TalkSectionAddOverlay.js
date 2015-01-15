( function ( M, $ ) {
	M.assertMode( [ 'beta', 'alpha' ] );
	var
		Overlay = M.require( 'Overlay' ),
		api = M.require( 'api' ),
		toast = M.require( 'toast' ),
		TalkSectionAddOverlay;

	/**
	 * Overlay for adding a talk section
	 * @class TalkSectionAddOverlay
	 * @extends Overlay
	 * @uses Api
	 * @uses Toast
	 */
	TalkSectionAddOverlay = Overlay.extend( {
		/**
		 * @inheritdoc
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {String} defaults.cancelMsg Caption for cancel button on edit form.
		 * @cfg {String} defaults.topicTitlePlaceHolder Placeholder text to prompt user to add
		 * a talk page topic subject.
		 * @cfg {String} defaults.topicContentPlaceHolder Placeholder text to prompt user to add
		 * content to talk page content.
		 * @cfg {String} defaults.editingMsg Label for button which submits a new talk page topic.
		 */
		defaults: $.extend( {}, Overlay.prototype.defaults, {
			cancelMsg: mw.msg( 'mobile-frontend-editor-cancel' ),
			topicTitlePlaceHolder: mw.msg( 'mobile-frontend-talk-add-overlay-subject-placeholder' ),
			topicContentPlaceHolder: mw.msg( 'mobile-frontend-talk-add-overlay-content-placeholder' ),
			editingMsg: mw.msg( 'mobile-frontend-talk-add-overlay-submit' )
		} ),
		templatePartials: {
			header: mw.template.get( 'mobile.talk.overlays', 'SectionAddOverlay/header.hogan' ),
			content: mw.template.get( 'mobile.talk.overlays', 'SectionAddOverlay/content.hogan' )
		},
		/** @inheritdoc */
		initialize: function ( options ) {
			// If terms of use is enabled, include it in the licensing message
			// FIXME cache this selector, it's used more than once.
			if ( $( '#footer-places-terms-use' ).length > 0 ) {
				options.licenseMsg = mw.msg(
					'mobile-frontend-editor-licensing-with-terms',
					$( '#footer-places-terms-use' ).html(),
					mw.config.get( 'wgMFLicenseLink' )
				);
			} else {
				options.licenseMsg = mw.msg(
					'mobile-frontend-editor-licensing',
					mw.config.get( 'wgMFLicenseLink' )
				);
			}
			Overlay.prototype.initialize.apply( this, arguments );
			this.title = options.title;
			// Variable to indicate, if the overlay will be closed by the save function or by the user. If this is false and there is content in the input fields,
			// the user will be asked, if he want to abandon his changes before we close the Overlay, otherwise the Overlay will be closed without any question.
			this._saveHit = false;
		},
		/** @inheritdoc */
		postRender: function ( options ) {
			var self = this;
			Overlay.prototype.postRender.call( this, options );
			this.$confirm = this.$( 'button.confirm-save' );
			// FIXME: All .on() actions should be moved to use the events map
			this.$subject = this.$( 'input' );
			this.$ta = this.$( 'textarea' );
			this.$( 'input, textarea' ).on( 'input change', function () {
				clearTimeout( self.timer );
				self.timer = setTimeout( function () {
					self._onInput();
				}, 250 );
			} );
			this.$confirm.on( 'click', function () {
				if ( !$( this ).prop( 'disabled' ) ) {
					self.save().done( function ( status ) {
						if ( status === 'ok' ) {
							// Check if the user was previously on the talk overlay
							if ( options.title !== mw.config.get( 'wgPageName' ) ) {
								M.pageApi.invalidatePage( self.title );
								toast.show( mw.msg( 'mobile-frontend-talk-topic-feedback' ), 'toast' );
								M.emit( 'talk-discussion-added' );
								self.hide();
							} else {
								M.emit( 'talk-added-wo-overlay' );
							}
						}
					} ).fail( function ( error ) {
						var editMsg = 'mobile-frontend-talk-topic-error';

						self.$confirm.prop( 'disabled', false );
						switch ( error.details ) {
							case 'protectedpage':
								editMsg = 'mobile-frontend-talk-topic-error-protected';
								break;
							case 'noedit':
							case 'blocked':
								editMsg = 'mobile-frontend-talk-topic-error-permission';
								break;
							case 'spamdetected':
								editMsg = 'mobile-frontend-talk-topic-error-spam';
								break;
							case 'badtoken':
								editMsg = 'mobile-frontend-talk-topic-error-badtoken';
								break;
							default:
								editMsg = 'mobile-frontend-talk-topic-error';
								break;
						}

						toast.show( mw.msg( editMsg ), 'toast error' );
					} );
				}
			} );
		},
		/** @inheritdoc */
		hide: function () {
			var empty,
				confirmMessage = mw.msg( 'mobile-frontend-editor-cancel-confirm' );

			empty = ( !this.$( '.summary' ).val() && !this.$( '.wikitext-editor' ).val() );
			if ( this._saveHit || empty || window.confirm( confirmMessage ) ) {
				return Overlay.prototype.hide.apply( this, arguments );
			} else {
				return false;
			}
		},
		/**
		 * Handles an input into a textarea and enables or disables the submit button
		 * @method
		 * @private
		 */
		_onInput: function () {
			if ( !this.$ta.val() || !this.$subject.val() ) {
				this.$confirm.prop( 'disabled', true );
			} else {
				this.$confirm.prop( 'disabled', false );
			}
		},
		/**
		 * Save new talk section
		 * @method
		 * @return {jQuery.Deferred} Object that either will be resolved with ok parameter
		 * or rejected with type error.
		 */
		save: function () {
			var heading = this.$subject.val(),
				self = this,
				text = this.$ta.val(),
				result = $.Deferred();
			this.$ta.removeClass( 'error' );
			this.$subject.removeClass( 'error' );

			// propagate, that we save an edit and want to close the Overlay without any interruption (user questions e.g.)
			this._saveHit = true;

			this.$confirm.prop( 'disabled', true );
			this.$( '.content' ).empty().addClass( 'loading' );
			this.$( '.buttonBar' ).hide();
			// FIXME: while saving: a spinner would be nice
			api.postWithToken( 'edit', {
				action: 'edit',
				section: 'new',
				sectiontitle: heading,
				title: self.title,
				summary: mw.msg( 'mobile-frontend-talk-edit-summary', heading ),
				text: text + ' ~~~~'
			} ).done( function () {
				result.resolve( 'ok' );
			} ).fail( function ( msg ) {
				result.reject( {
					type: 'error',
					details: msg
				} );
			} );

			return result;
		}
	} );

	M.define( 'modules/talk/TalkSectionAddOverlay', TalkSectionAddOverlay );

}( mw.mobileFrontend, jQuery ) );
