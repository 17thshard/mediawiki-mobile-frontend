/* global $ */

/*!
 * VisualEditor MediaWiki Initialization MobileFrontendArticleTarget class.
 *
 * @copyright 2011-2015 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/* global ve */

/**
 * MediaWiki mobile frontend article target.
 *
 * @class
 * @extends ve.init.mw.MobileArticleTarget
 *
 * @param {VisualEditorOverlay} overlay Mobile frontend overlay
 * @param {Object} [config] Configuration options
 */
// eslint-disable-next-line max-len
ve.init.mw.MobileFrontendArticleTarget = function VeInitMwMobileFrontendArticleTarget( overlay, config ) {
	this.overlay = overlay;
	this.$overlay = overlay.$el;
	this.$overlaySurface = overlay.$el.find( '.surface' );
	this.useScrollContainer = ve.init.platform.constructor.static.isIos();

	// Parent constructor
	ve.init.mw.MobileFrontendArticleTarget.super.call( this, config );

	// Events
	this.onWindowScrollDebounced = ve.debounce( this.onWindowScroll.bind( this ), 100 );
	$( this.getElementWindow() ).on( 'scroll', this.onWindowScrollDebounced );

	// Initialization
	this.$element.addClass( 've-init-mw-mobileFrontendArticleTarget' );
};

/* Inheritance */

OO.inheritClass( ve.init.mw.MobileFrontendArticleTarget, ve.init.mw.MobileArticleTarget );

/* Static Properties */

ve.init.mw.MobileFrontendArticleTarget.static.parseSaveError = mw.mobileFrontend.require( 'mobile.editor.api/parseSaveError' );

/* Methods */

/**
 * Destroy the target
 * @memberof MobileFrontendArticleTarget
 * @instance
 */
ve.init.mw.MobileFrontendArticleTarget.prototype.destroy = function () {
	// Parent method
	ve.init.mw.MobileFrontendArticleTarget.super.prototype.destroy.call( this );

	$( this.getElementWindow() ).off( 'scroll', this.onWindowScrollDebounced );
	this.$overlay.css( 'padding-top', '' );
};

/*
 * FIXME: @inheritdoc once this file is in the right repo
 * @memberof MobileFrontendArticleTarget
 * @instance
 */
ve.init.mw.MobileFrontendArticleTarget.prototype.getScrollContainer = function () {
	if ( this.useScrollContainer ) {
		return this.overlay.$el.find( '.overlay-content' );
	}
	// Parent method
	return ve.init.mw.MobileFrontendArticleTarget.super.prototype.getScrollContainer.call( this );
};

/*
 * FIXME: @inheritdoc once this file is in the right repo
 * @memberof MobileFrontendArticleTarget
 * @instance
 */
ve.init.mw.MobileFrontendArticleTarget.prototype.isToolbarOverSurface = function () {
	return true;
};

/**
 * FIXME: @inheritdoc once this file is in the right repo
 * @memberof MobileFrontendArticleTarget
 * @instance
 */
ve.init.mw.MobileFrontendArticleTarget.prototype.onContainerScroll = function () {
	// MF provides the toolbar so there is no need to float the toolbar
};

/**
 * Handle window scroll events
 * @memberof MobileFrontendArticleTarget
 * @instance
 */
ve.init.mw.MobileFrontendArticleTarget.prototype.onWindowScroll = function () {
	var $window, windowTop, contentTop,
		surface = this.surface,
		target = this;
	// iOS applies a scroll offset to the window when opening the keyboard to move the cursor into
	// view. On the editing surface, this is not necessary (we set large padding-bottom so that the
	// keyboard covers nothing); apply this offset to the surface instead. But in dialogs allow it
	// to happen, otherwise the user can't scroll to see whatever is underneath the keyboard.
	// (T210559)
	if ( this.useScrollContainer && !surface.dialogs.getCurrentWindow() ) {
		$window = $( target.getElementWindow() );
		windowTop = $window.scrollTop();
		contentTop = target.$scrollContainer.scrollTop();

		$window.scrollTop( 0 );
		surface.scrollTo( contentTop + windowTop );
		// Make sure we didn't overshoot the cursor
		surface.scrollCursorIntoView( target.getSurface() );
	}
};

/**
 * Handle surface scroll events
 * @memberof MobileFrontendArticleTarget
 * @instance
 */
ve.init.mw.MobileFrontendArticleTarget.prototype.onSurfaceScroll = function () {
	var nativeSelection, range;

	if ( ve.init.platform.constructor.static.isIos() ) {
		// iOS has another bug (!) where if you change the scroll offset of a
		// contentEditable with a cursor visible it disappears, so remove and
		// reapply the selection in that case.
		nativeSelection = this.getSurface().getView().nativeSelection;
		if ( nativeSelection.rangeCount && document.activeElement.contentEditable === 'true' ) {
			range = nativeSelection.getRangeAt( 0 );
			nativeSelection.removeAllRanges();
			nativeSelection.addRange( range );
		}
	}
};

/*
 * FIXME: @inheritdoc once this file is in the right repo
 * @memberof MobileFrontendArticleTarget
 * @instance
 */
ve.init.mw.MobileFrontendArticleTarget.prototype.createSurface = function ( dmDoc, config ) {
	var surface;
	if ( this.overlay.isNewPage ) {
		config = ve.extendObject( {
			placeholder: mw.msg( 'mobile-frontend-editor-placeholder-new-page', mw.user )
		}, config );
	}

	// Parent method
	surface = ve.init.mw.MobileFrontendArticleTarget
		.super.prototype.createSurface.call( this, dmDoc, config );

	surface.connect( this, { scroll: 'onSurfaceScroll' } );

	return surface;
};

/**
 * @inheritdoc
 */
ve.init.mw.MobileFrontendArticleTarget.prototype.setSurface = function ( surface ) {
	var changed = surface !== this.surface;

	// Parent method
	ve.init.mw.Target.super.prototype.setSurface.apply( this, arguments );

	if ( changed ) {
		surface.$element.addClass( 'content loading' );
		this.$overlaySurface.append( surface.$element );
	}
};

/**
 * FIXME: @inheritdoc once this file is in the right repo
 * @memberof MobileFrontendArticleTarget
 * @instance
 */
ve.init.mw.MobileFrontendArticleTarget.prototype.surfaceReady = function () {
	var surface = this.getSurface();

	// Parent method
	ve.init.mw.MobileFrontendArticleTarget.super.prototype.surfaceReady.apply( this, arguments );

	this.overlay.hideSpinner();
	surface.$element.removeClass( 'loading' );

	surface.getContext().connect( this, { resize: 'adjustContentPadding' } );
	this.adjustContentPadding();

	// we have to do it here because contenteditable elements still do not
	// exist when postRender is executed
	// FIXME: Don't call a private method that is outside the class.
	this.overlay._fixIosHeader( $( '[contenteditable]' ) );

	this.maybeShowWelcomeDialog();
};

/**
 * Match the content padding to the toolbar height
 * @memberof MobileFrontendArticleTarget
 * @instance
 */
ve.init.mw.MobileFrontendArticleTarget.prototype.adjustContentPadding = function () {
	var toolbarHeight = this.getToolbar().$element.outerHeight(),
		surface = this.getSurface();
	surface.setToolbarHeight( toolbarHeight );
	this.$overlay.css( 'padding-top', toolbarHeight );
	this.getSurface().scrollCursorIntoView();
};

/*
 * FIXME: @inheritdoc once this file is in the right repo
 * @memberof MobileFrontendArticleTarget
 * @instance
 */
ve.init.mw.MobileFrontendArticleTarget.prototype.loadFail = function ( key, text ) {
	// Parent method
	ve.init.mw.MobileFrontendArticleTarget.super.prototype.loadFail.apply( this, arguments );

	this.overlay.reportError( text );
	this.overlay.hide();
};

/**
 * FIXME: @inheritdoc once this file is in the right repo
 * @memberof MobileFrontendArticleTarget
 * @instance
 */
ve.init.mw.MobileFrontendArticleTarget.prototype.editSource = function () {
	var target = this;
	// If changes have been made tell the user they have to save first
	if ( !this.getSurface().getModel().hasBeenModified() ) {
		this.overlay.switchToSourceEditor();
	} else {
		OO.ui.confirm( mw.msg( 'mobile-frontend-editor-switch-confirm' ) ).then( function ( confirmed ) {
			if ( confirmed ) {
				target.showSaveDialog();
			}
		} );
	}
};

/**
 * FIXME: @inheritdoc once this file is in the right repo
 * @memberof MobileFrontendArticleTarget
 * @instance
 */
ve.init.mw.MobileFrontendArticleTarget.prototype.save = function () {
	// Parent method
	ve.init.mw.MobileFrontendArticleTarget.super.prototype.save.apply( this, arguments );

	this.overlay.log( {
		action: 'saveAttempt'
	} );
};

/**
 * FIXME: @inheritdoc once this file is in the right repo
 * @memberof MobileFrontendArticleTarget
 * @instance
 */
ve.init.mw.MobileFrontendArticleTarget.prototype.showSaveDialog = function () {
	// Parent method
	ve.init.mw.MobileFrontendArticleTarget.super.prototype.showSaveDialog.apply( this, arguments );

	this.overlay.log( {
		action: 'saveIntent'
	} );
};

/**
 * FIXME: @inheritdoc once this file is in the right repo
 * @memberof MobileFrontendArticleTarget
 * @instance
 */
ve.init.mw.MobileFrontendArticleTarget.prototype.saveComplete = function () {
	// Parent method
	ve.init.mw.MobileFrontendArticleTarget.super.prototype.saveComplete.apply( this, arguments );

	this.overlay.onSaveComplete();
};

/**
 * FIXME: @inheritdoc once this file is in the right repo
 * @memberof MobileFrontendArticleTarget
 * @instance
 * @param {HTMLDocument} doc HTML document we tried to save
 * @param {Object} saveData Options that were used
 * @param {boolean} wasRetry Whether this was a retry after a 'badtoken' error
 * @param {Object} jqXHR
 * @param {string} status Text status message
 * @param {Object|null} response API response data
 */
// eslint-disable-next-line max-len
ve.init.mw.MobileFrontendArticleTarget.prototype.saveFail = function ( doc, saveData, wasRetry, jqXHR, status, response ) {

	// parent method
	ve.init.mw.MobileFrontendArticleTarget.super.prototype.saveFail.apply( this, arguments );

	this.overlay.onSaveFailure( this.constructor.static.parseSaveError( response, status ) );
};

/**
 * FIXME: @inheritdoc once this file is in the right repo
 * @memberof MobileFrontendArticleTarget
 * @instance
 */
ve.init.mw.MobileFrontendArticleTarget.prototype.tryTeardown = function () {
	// Parent method
	ve.init.mw.MobileFrontendArticleTarget.super.prototype.tryTeardown.apply( this, arguments )
		.then( function () {
			// eslint-disable-next-line no-restricted-properties
			window.history.back();
		} );
};

/* Registration */

ve.init.mw.targetFactory.register( ve.init.mw.MobileFrontendArticleTarget );

// Hook up activity-tracking from VE's system to mobilefrontend's system
ve.trackSubscribe( 'activity.', function ( topic, data ) {
	mw.track( 'mf.schemaVisualEditorFeatureUse', ve.extendObject( data, {
		feature: topic.split( '.' )[ 1 ],
		// eslint-disable-next-line camelcase
		editing_session_id: ve.init.target.overlay.sessionId
	} ) );
} );
