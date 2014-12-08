( function ( M, $ ) {

	var CategoryOverlay,
		Overlay = M.require( 'Overlay' );

	/**
	 * Displays the list of categories for a page
	 * @class CategoryOverlay
	 * @extends Overlay
	 */
	CategoryOverlay = Overlay.extend( {
		/**
		 * @inheritdoc
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {String} defaults.heading Title of the list of categories this page is
		 * categorized in.
		 * @cfg {String} defaults.subheading Introduction text for the list of categories,
		 * the page belongs to.
		 */
		defaults: {
			heading: mw.msg( 'mobile-frontend-categories-heading' ),
			subheading: mw.msg( 'mobile-frontend-categories-subheading' )
		},
		className: 'category-overlay overlay',
		templatePartials: {
			content: mw.template.get( 'mobile.categories', 'CategoryOverlay.hogan' )
		},

		/**
		 * @inheritdoc
		 */
		initialize: function ( options ) {
			if ( options.categories.length === 0 ) {
				options.subheading = mw.msg( 'mobile-frontend-categories-nocat' );
			} else {
				options.items = [];

				// add categories to overlay
				$.each( options.categories, function ( index, category ) {
					var title = mw.Title.newFromText( category, 14 );
					options.items.push( {
						url: title.getUrl(),
						title: title.getNameText()
					} );
				} );
			}
			Overlay.prototype.initialize.apply( this, arguments );
		}
	} );

	M.define( 'categories/CategoryOverlay', CategoryOverlay );

}( mw.mobileFrontend, jQuery ) );
