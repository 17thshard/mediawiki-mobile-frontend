( function ( M, $ ) {
	var Overlay = M.require( 'Overlay' ),
		ProgressBar = M.require( 'modules/uploads/ProgressBar' ),
		AbuseFilterPanel = M.require( 'modules/editor/AbuseFilterPanel' ),
		PhotoUploadProgress;

	/**
	 * Overlay displaying photo upload progress bar.
	 ** Appears at top of the page does not cover display.
	 * @class PhotoUploadProgress
	 * @extends Overlay
	 */
	PhotoUploadProgress = Overlay.extend( {
		/**
		 * @inheritdoc
		 * @cfg {Object} defaults Default options hash. Extends {Overlay} defaults.
		 * @cfg {String} defaults.uploadingMsg A message telling the user that an image is being
		 * uploaded.
		 */
		defaults: $.extend( {}, Overlay.prototype.defaults, {
			uploadingMsg: mw.msg( 'mobile-frontend-image-uploading' )
		} ),
		template: mw.template.get( 'mobile.uploads', 'PhotoUploadProgress.hogan' ),
		fullScreen: false,

		/** @inheritdoc */
		initialize: function () {
			Overlay.prototype.initialize.apply( this, arguments );
			this.progressBar = new ProgressBar();
		},

		/** @inheritdoc */
		postRender: function () {
			Overlay.prototype.postRender.apply( this, arguments );
			this.$( '.submit' ).on( 'click', $.proxy( this, 'emit', 'submit' ) );
		},

		showAbuseFilter: function ( type, message ) {
			new AbuseFilterPanel().appendTo( this.$( '.overlay-header-container' ) ).show( type, message );
			this._showHidden( '.save-header' );
		},

		/** @inheritdoc */
		hide: function ( force ) {
			var _super = Overlay.prototype.hide;
			if ( force ) {
				return _super.apply( this, arguments );
			} else if ( window.confirm( mw.msg( 'mobile-frontend-image-cancel-confirm' ) ) ) {
				this.emit( 'cancel' );
				return _super.apply( this, arguments );
			} else {
				return false;
			}
		},

		setValue: function ( value ) {
			var $uploading = this.$( '.uploading' );
			// only add progress bar if we're getting progress events
			if ( $uploading.length && $uploading.text() !== '' ) {
				$uploading.text( '' );
				this.progressBar.appendTo( $uploading );
				this.$( '.right' ).remove();
			}
			this.progressBar.setValue( value );
		}
	} );

	M.define( 'modules/uploads/PhotoUploadProgress', PhotoUploadProgress );

}( mw.mobileFrontend, jQuery ) );
