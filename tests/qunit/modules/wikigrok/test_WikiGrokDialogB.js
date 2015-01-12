( function ( $, M ) {

	var WikiGrokDialogB = M.require( 'modules/wikigrok/WikiGrokDialogB' ),
		WikiGrokResponseApi = M.require( 'modules/wikigrok/WikiGrokResponseApi' ),
		wikiGrokCampaigns = M.require( 'modules/wikigrok/wikiGrokCampaigns' ),
		campaigns = {
			actor: {
				property: 'P106',
				questions: {
					Q10798782: 'television actor',
					Q10800557: 'film actor'
				},
				name: 'actor',
				propertyId: 'P106',
				propertyName: 'occupation'
			}
		},
		suggestions = {
			actor: {
				id: 'P106',
				list: [ 'Q10798782', 'Q10800557' ],
				name: 'actor'
			}
		},
		pageTitle = 'Some guy';

	/**
	 * Debug the wikigrok dialogs by showing it in screen
	 * active when debug=true in location
	 */
	function debugDialog() {
		if (
			mw.mobileFrontend.query &&
			Boolean( mw.mobileFrontend.query.debug ) === true
		) {
			this.wk.remove = function () {
			};
			this.wk.prependTo( '#content' ).show();
		}
	}

	QUnit.module( 'MobileFrontend: WikiGrokDialogB', {
		teardown: function () {
			this.wk.remove();
		},
		setup: function () {
			// don't run eventLogging
			this.sandbox.stub( WikiGrokDialogB.prototype, 'log' );
			this.sandbox.stub( WikiGrokDialogB.prototype, 'logError' );

			this.sandbox.stub( mw.config, 'get' ).withArgs( 'wgWikiGrokCampaigns' )
				.returns( campaigns );
			this.sandbox.stub( WikiGrokResponseApi.prototype, 'recordClaims' )
				.returns( $.Deferred().resolve() );

			this.$el = $( '<div id="test">' );
			this.wk = new WikiGrokDialogB( {
				el: this.$el,
				campaign: wikiGrokCampaigns.getRandomCampaign(),
				itemId: '1234',
				title: pageTitle,
				userToken: 'token',
				testing: false,
				// Set suggestions to go to the second screen.
				suggestions: suggestions
			} );
			debugDialog.apply( this );
		}
	} );

	QUnit.test( '#UI renders initial screen', 3, function ( assert ) {
		// Lets check that we've got the info, buttons and 'Tell me more'
		assert.ok( this.$el.find( '.wg-content' ).text().length > 0 );
		assert.strictEqual( this.$el.find( '.wg-buttons button' ).length, 2 );
		assert.ok( this.$el.find( '.wg-notice>a' ).attr( 'href' ).length > 0 );
	} );

	QUnit.test( '#UI clicking no thanks hides the dialog', 1, function ( assert ) {
		var spy = this.sandbox.stub( WikiGrokDialogB.prototype, 'hide' );
		this.$el.find( '.cancel' ).trigger( 'click' );
		assert.ok( spy.called );
	} );

	QUnit.asyncTest( '#UI clicking OK, takes you to the question dialog', function ( assert ) {
		QUnit.expect( 3 );
		this.wk.$el.find( '.proceed' ).trigger( 'click' );
		// The name of the page is on the question
		assert.ok( this.wk.$el.text().indexOf( pageTitle ) !== -1 );
		// After loading
		setTimeout( $.proxy( function () {
			// The question is there
			var tags = this.wk.$el.find( '.tags .ui-tag-button' ),
				labels = tags.find( 'label' );
			assert.strictEqual( tags.length, 2, 'Correct number of tags' );
			assert.strictEqual( labels.first().text(),
				campaigns.actor.propertyName, 'Correct label text' );
			QUnit.start();
		}, this ), 0 );
	} );

	QUnit.asyncTest( '#UI - Question - Answer correct', function ( assert ) {
		QUnit.expect( 1 );
		this.wk.$el.find( '.proceed' ).trigger( 'click' );
		this.$el.find( '.ui-tag-button' ).trigger( 'click' );
		this.$el.find( '.save' ).trigger( 'click' );

		setTimeout( $.proxy( function () {
			// I'm in thanks page now!
			assert.notEqual( this.$el.find( '.wg-link' ).css( 'display' ), 'none' );
			QUnit.start();
		}, this ), 0 );
	} );

	QUnit.asyncTest( '#UI - Question - Answer incorrect', function ( assert ) {
		QUnit.expect( 1 );
		this.wk.$el.find( '.proceed' ).trigger( 'click' );
		this.$el.find( '.save' ).trigger( 'click' );

		setTimeout( $.proxy( function () {
			// I'm in thanks page now!
			assert.notEqual( this.$el.find( '.wg-link' ).css( 'display' ), 'none' );
			QUnit.start();
		}, this ), 0 );
	} );

	QUnit.module( 'MobileFrontend: WikiGrokDialogB', {
		setup: function () {
			this.sandbox.stub( WikiGrokDialogB.prototype, 'log' );
			this.logErrorSpy = this.sandbox.stub( WikiGrokDialogB.prototype, 'logError' );

			this.sandbox.stub( mw.config, 'get' ).withArgs( 'wgWikiGrokCampaigns' )
				.returns( campaigns );
			this.sandbox.stub( WikiGrokResponseApi.prototype, 'recordClaims' )
				.returns( $.Deferred().reject() );

			this.$el = $( '<div id="test">' );
			this.wk = new WikiGrokDialogB( {
				el: this.$el,
				campaign: wikiGrokCampaigns.getRandomCampaign(),
				itemId: '1234',
				title: pageTitle,
				userToken: 'token',
				testing: false
			} );
		}
	} );

	QUnit.asyncTest( '#Handle error', function ( assert ) {
		QUnit.expect( 1 );
		var spy = this.sandbox.stub( WikiGrokDialogB.prototype, 'handleError' );
		this.wk.reveal( {} );
		this.wk.$el.find( '.proceed' ).trigger( 'click' );
		QUnit.start();
		// After loading
		setTimeout( $.proxy( function () {
			// save should thrown an error because of recordClaims
			this.wk.$el.find( '.save' ).trigger( 'click' );
			assert.ok( spy.called, 'Error is handled.' );
		}, this ), 0 );
	} );

}( jQuery, mw.mobileFrontend ) );
