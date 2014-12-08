( function ( M, $ ) {

	var
		View = M.require( 'View' ),
		Section = M.require( 'Section' ),
		Page;

	/**
	 * Mobile page view object
	 *
	 * @class Page
	 * @uses Section
	 * @extends View
	 */
	Page = View.extend( {
		/**
		 * @cfg {Object} defaults Default options hash.
		 * @cfg {Number} defaults.id Page ID. The default value of 0 represents a new page.
		 * Be sure to override it to avoid side effects.
		 * @cfg {String} defaults.title Title of the page. It includes prefix where needed and
		 * is human readable, e.g. Talk:The man who lived.
		 * @cfg {String} defaults.displayTitle Title of the page that's displayed. Falls back
		 * to defaults.title if no value is provided.
		 * @cfg {Object} defaults.protection List of permissions as returned by API,
		 * e.g. [{ edit: ['*'] }]
		 * @cfg {Array} defaults.sections Array of {Section} objects.
		 * @cfg {Boolean} defaults.isMainPage Whether the page is the Main Page.
		 * @cfg {Boolean} defaults.userCanUpload Whether the current user can upload.
		 */
		defaults: {
			id: 0,
			title: '',
			displayTitle: '',
			protection: {
				edit: [ '*' ]
			},
			sections: [],
			isMainPage: false,
			userCanUpload: mw.config.get( 'wgUserCanUpload' )
		},

		/**
		 * @inheritDoc
		 */
		initialize: function ( options ) {
			// Fallback if no displayTitle provided
			options.displayTitle = options.displayTitle || options.title;
			options.languageUrl = mw.util.getUrl( 'Special:MobileLanguages/' + options.title );
			View.prototype.initialize.apply( this, arguments );
		},

		/**
		 * Get the lead section of the page view.
		 * @method
		 * @return {jQuery.Object}
		 */
		getLeadSectionElement: function () {
			return this.$( '> div' ).eq( 0 );
		},

		/**
		 * Determines if content model is wikitext
		 * @method
		 * @return {Boolean}
		 */
		isWikiText: function () {
			return mw.config.get( 'wgPageContentModel' ) === 'wikitext';
		},

		/**
		 * Checks whether the current page is the main page
		 * @method
		 * @return {Boolean}
		 */
		isMainPage: function () {
			return this.options.isMainPage;
		},

		/**
		 * Checks whether the given user can edit the page.
		 * @method
		 * @param {mw.user} user Object representing a user
		 * @return {jQuery.Deferred} With parameter boolean
		 */
		isEditable: function ( user ) {
			var editProtection = this.options.protection.edit,
				resp = $.Deferred();

			user.getGroups().done( function ( groups ) {
				var editable = false;
				$.each( groups, function ( i, group ) {
					if ( $.inArray( group, editProtection ) > -1 ) {
						editable = true;
						return false;
					}
				} );
				resp.resolve( editable );
			} );
			return resp;
		},

		/**
		 * Return the latest revision id for this page
		 * @method
		 * @return {Number}
		 */
		getRevisionId: function () {
			return this.options.revId;
		},

		/**
		 * Return prefixed page title
		 * @method
		 * @return {string}
		 */
		getTitle: function () {
			return this.options.title;
		},

		/**
		 * Return page id
		 * @method
		 * @return {Number}
		 */
		getId: function () {
			return this.options.id;
		},

		/**
		 * return namespace id
		 * @method
		 * @return {Number} namespace Number
		 */
		getNamespaceId: function () {
			var nsId,
				args = this.options.title.split( ':' );

			if ( args[1] ) {
				nsId = mw.config.get( 'wgNamespaceIds' )[ args[0].toLowerCase().replace( ' ', '_' ) ] || 0;
			} else {
				nsId = 0;
			}
			return nsId;
		},

		/**
		 * Determines if current page is a talk page
		 * @method
		 * @return {Boolean} Whether the page is a talk page or not
		 */
		isTalkPage: function () {
			var ns = this.getNamespaceId();
			// all talk pages are odd Numbers (except the case of special pages)
			return ns > 0 && ns % 2 === 1;
		},

		/**
		 * @inheritDoc
		 */
		preRender: function ( options ) {
			var self = this;
			this.sections = [];
			this._sectionLookup = {};
			this.title = options.title;

			$.each( options.sections, function () {
				var section = new Section( this );
				self.sections.push( section );
				self._sectionLookup[section.id] = section;
			} );
		},

		/**
		 * Return reference section
		 * @method
		 */
		getReferenceSection: function () {
			return this._referenceLookup;
		},

		/**
		 * FIXME: rename to getSection
		 * FIXME: Change function signature to take the anchor of the heading
		 * @method
		 * @return {Section}
		 */
		getSubSection: function ( id ) {
			return this._sectionLookup[ id ];
		},

		/**
		 * FIXME: rename to getSections
		 *
		 * @method
		 * @return Array
		 */
		getSubSections: function () {
			return this.sections;
		}
	} );

	M.define( 'Page', Page );

}( mw.mobileFrontend, jQuery ) );
