( function( M, $ ) {

	var
		View = M.require( 'view' ),
		Section, Page;

	/**
	 * @class
	 * @extends View
	 * @name Section
	 */
	Section = View.extend( {
		template: M.template.get( 'section' ),
		defaults: {
			line: '',
			text: '',
			editLabel: mw.msg( 'mobile-frontend-editor-edit' )
		},
		initialize: function( options ) {
			this.line = options.line;
			this.text = options.text;
			this.hasReferences = options.hasReferences || false;
			this.id = options.id || null;
			this.anchor = options.anchor;
			this._super( options );
		}
	} );

	/**
	 * @class
	 * @extends View
	 * @name Page
	 */
	Page = View.extend( {
		template: M.template.get( 'page' ),
		defaults: {
			// For titles from other namespaces use a prefix e.g. Talk:Foo
			title: '',
			lead: '',
			inBetaOrAlpha: M.isBetaGroupMember(),
			isMainPage: false,
			talkLabel: mw.msg( 'mobile-frontend-talk-overlay-header' ),
			editLabel: mw.msg( 'mobile-frontend-editor-edit' ),
			languageLabel: mw.msg( 'mobile-frontend-language-article-heading' )
		},
		/**
		 * @name Page.prototype.isMainPage
		 * @function
		 * @return {Boolean}
		 */
		isMainPage: function() {
			return this.options.isMainPage;
		},

		// FIXME: This assumes only one page can be rendered at one time - emits a page-loaded event and sets wgArticleId
		render: function( options ) {
			var pageTitle = options.title, self = this,
				$el = this.$el, _super = self._super;
			// prevent talk icon being re-rendered after an edit to a talk page
			options.isTalkPage = self.isTalkPage();

			// FIXME: this is horrible, because it makes preRender run _during_ render...
			if ( !options.sections ) {
				$el.empty().addClass( 'spinner loading' );
				// FIXME: api response should also return last modified timestamp and page_top_level_section_count property
				M.pageApi.getPage( pageTitle ).done( function( pageData ) {
					options = $.extend( options, pageData );

					_super.call( self, options );

					// FIXME: remove when Special:Languages link goes stable
					if ( !M.isBetaGroupMember() ) {
						M.pageApi.getPageLanguages( pageTitle ).done( function( langdata ) {
							var template = M.template.get( 'languageSection' ),
								data = {
									langlinks: langdata.languages,
									heading: mw.msg( 'mobile-frontend-language-article-heading' ),
									description: mw.msg( 'mobile-frontend-language-header', langdata.languages.length )
								};

							$el.find( '#mw-mf-language-section' ).html( template.render( data ) );
							M.emit( 'languages-loaded' );
						} );
					}

					// reset loader
					$el.removeClass( 'spinner loading' );

					self.emit( 'ready', self );
				} ).fail( $.proxy( self, 'emit', 'error' ) );
			} else {
				self._super( options );
			}
		},

		/**
		 * @name Page.prototype.getId
		 * @function
		 * @return {Integer}
		 */
		getId: function() {
			return this.options.id;
		},

		/**
		 * @name Page.prototype.getNamespaceId
		 * @function
		 * @return {Integer} namespace number
		 */
		getNamespaceId: function() {
			var args = this.options.title.split( ':' ), nsId;
			if ( args[1] ) {
				nsId = mw.config.get( 'wgNamespaceIds' )[ args[0].toLowerCase().replace( ' ', '_' ) ] || 0;
			} else {
				nsId = 0;
			}
			return nsId;
		},

		/**
		 * @name Page.prototype.isTalkPage
		 * @function
		 * @return {Boolean} Whether the page is a talk page or not
		 */
		isTalkPage: function() {
			var ns = this.getNamespaceId();
			// all talk pages are odd numbers (except the case of special pages)
			return ns > 0 && ns % 2 === 1;
		},

		preRender: function( options ) {
			var self = this;
			this.sections = [];
			this._sectionLookup = {};
			this.title = options.title;
			this.lead = options.lead;

			$.each( options.sections, function() {
				var section = new Section( this );
				self.sections.push( section );
				self._sectionLookup[section.id] = section;
			} );
		},

		/**
		 * @name Page.prototype.getReferenceSection
		 * @function
		 */
		getReferenceSection: function() {
			return this._referenceLookup;
		},

		/**
		 * FIXME: rename to getSection
		 * FIXME: Change function signature to take the anchor of the heading
		 * @name Page.prototype.getSubSection
		 * @function
		 * @return {Section}
		 */
		getSubSection: function( id ) {
			return this._sectionLookup[ id ];
		},

		/**
		 * FIXME: rename to getSections
		 *
		 * @name Page.prototype.getSubSections
		 * @function
		 * @return Array
		 */
		getSubSections: function() {
			return this.sections;
		}
	} );

	M.define( 'Page', Page );
	M.define( 'Section', Section );

}( mw.mobileFrontend, jQuery ) );
