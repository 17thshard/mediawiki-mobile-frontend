'use strict';
var Drawer = require( '../mobile.startup/Drawer' ),
	Button = require( '../mobile.startup/Button' ),
	mfExtend = require( '../mobile.startup/mfExtend' ),
	Icon = require( '../mobile.startup/Icon' ),
	util = require( '../mobile.startup/util' );

/**
 * This creates the drawer at the bottom of the screen that appears when a
 * blocked user tries to edit.
 * @class BlockReason
 * @extends Drawer
 */
function BlockMessage() {
	Drawer.apply( this, arguments );
}

mfExtend( BlockMessage, Drawer, {
	/**
	 * @memberof BlockMessage
	 * @instance
	 */
	defaults: util.extend( {}, Drawer.prototype.defaults, {
		stopHandIcon: new Icon( {
			name: 'stop-hand'
		} ),
		userIcon: new Icon( {
			tagName: 'span',
			name: 'profile'
		} ),
		okButton: new Button( {
			label: mw.msg( 'ok' ),
			tagName: 'button',
			progressive: true,
			additionalClassNames: 'cancel'
		} ),
		createDetailsAnchorHref: function () {
			return mw.util.getUrl( 'Special:BlockList', { wpTarget: '#' + this.blockId } );
		},
		createDetailsAnchorLabel: function () {
			return mw.msg( 'mobile-frontend-editor-blocked-drawer-help' );
		},
		createTitle: function () {
			return this.partial ? mw.msg( 'mobile-frontend-editor-blocked-drawer-title-partial' ) : mw.msg( 'mobile-frontend-editor-blocked-drawer-title' );
		},
		reasonHeader: mw.msg( 'mobile-frontend-editor-blocked-drawer-reason-header' ),
		creatorHeader: function () {
			// The gender is the subject (the blockee) not the object (the blocker).
			return mw.msg( 'mobile-frontend-editor-blocked-drawer-creator-header',
				mw.user.options.get( 'gender' ) );
		},
		expiryHeader: mw.msg( 'mobile-frontend-editor-blocked-drawer-expiry-header' )
	} ),
	/**
	 * @inheritdoc
	 */
	postRender: function () {
		Drawer.prototype.postRender.apply( this, arguments );
		this.$el.find( '.block-message-creator a' ).prepend(
			this.options.userIcon.$el
		);
		this.$el.find( '.block-message-icon' ).append(
			this.options.stopHandIcon.$el
		);
		this.$el.find( '.block-message-buttons' ).prepend(
			this.options.okButton.$el
		);
	},
	/**
	 * @memberof BlockMessage
	 * @instance
	 */
	template: util.template( `
{{#collapseIcon}}{{>icon}}{{/collapseIcon}}
<div class="block-message">
  <div class="block-message-icon"></div>
  <div class="block-message-info">
    <div class="block-message-item block-message-title">
      <h5>{{ createTitle }}</h5>
    </div>
    <div class="block-message-data">
      {{#reason}}
        <div class="block-message-item">
          <h6>{{ reasonHeader }}</h6>
          <div><strong>{{{ reason }}}</strong></div>
        </div>
      {{/reason}}
      <div class="block-message-item block-message-creator">
        <h6>{{ creatorHeader }}</h6>
        <div><strong><a href="{{ creator.url }}">{{ creator.name }}</a></strong></div>
      </div>
      {{#expiry}}
        <div class="block-message-item">
          <h6>{{ expiryHeader }}</h6>
          <div><strong>{{#duration}}{{ duration }} / {{/duration}}{{ expiry }}</strong></div>
        </div>
      {{/expiry}}
    </div>
    <div class="block-message-item block-message-buttons">
      <a href="{{ createDetailsAnchorHref }}">{{ createDetailsAnchorLabel }}</a>
    </div>
  </div>
</div>
	` )
} );

module.exports = BlockMessage;
