<?php
/**
 * Definition of MobileFrontend's ResourceLoader modules.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 * http://www.gnu.org/copyleft/gpl.html
 *
 * @file
 */

if ( !defined( 'MEDIAWIKI' ) ) {
	die( 'Not an entry point.' );
}

$localBasePath = dirname( __DIR__ );
$remoteExtPath = 'MobileFrontend';

/**
 * A boilerplate for the MFResourceLoaderModule that supports templates
 */
$wgMFMobileResourceBoilerplate = array(
	'localBasePath' => $localBasePath,
	'remoteExtPath' => $remoteExtPath,
	'localTemplateBasePath' => $localBasePath . '/templates',
	'class' => 'MFResourceLoaderModule',
);

/**
 * A boilerplate containing common properties for all RL modules served to mobile site special pages
 */
$wgMFMobileSpecialPageResourceBoilerplate = array(
	'localBasePath' => $localBasePath,
	'remoteExtPath' => $remoteExtPath,
	'targets' => 'mobile',
	'group' => 'other',
);

/**
 * A boilerplate for RL script modules
*/
$wgMFMobileSpecialPageResourceScriptBoilerplate = $wgMFMobileSpecialPageResourceBoilerplate + array(
	'dependencies' => array( 'mobile.stable' ),
);
/**
 * A boilerplate for RL style modules for special pages
*/
$wgMFMobileSpecialPageResourceStyleBoilerplate = $wgMFMobileSpecialPageResourceBoilerplate + array(
	// ensure special css is always loaded after mobile.styles for cascading purposes (keep jgonera happy)
	'dependencies' => array( 'mobile.styles' ),
);

$wgResourceModules = array_merge( $wgResourceModules, array(
	// FIXME: Upstream to core
	'mobile.templates' => array(
		'localBasePath' => $localBasePath,
		'remoteExtPath' => $remoteExtPath,
		'scripts' => array(
			'javascripts/externals/hogan.js',
			'javascripts/common/templates.js'
		),
		'targets' => array( 'mobile', 'desktop' ),
	),

	// FIXME: Remove need for this module
	// Mobile Bridge - Tweaks the desktop UI so mobile code can run on it
	'mobile.bridge' => $wgMFMobileResourceBoilerplate + array(
		'styles' => array(
			'less/desktop/mobileBridge.less',
		),
		'scripts' => array(
			'javascripts/desktop/mobileBridge.js',
		),
	),

	'mobile.loggingSchemas' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.startup',
		),
		'scripts' => array(
			'javascripts/loggingSchemas/MobileWebClickTracking.js',
			'javascripts/loggingSchemas/mobileWebEditing.js',
		),
	),

	'mobile.file.scripts' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array( 'mobile.startup' ),
		'scripts' => array(
			'javascripts/file/filepage.js'
		),
	),

	'mobile.styles.mainpage' => $wgMFMobileResourceBoilerplate + array(
		'styles' => array(
			'less/common/mainpage.less'
		),
		'group' => 'other',
	),

	'mobile.pagelist.styles' => $wgMFMobileResourceBoilerplate + array(
		'styles' => array(
			'less/common/pagelist.less',
		),
		'position' => 'top',
	),

	'mobile.styles' => $wgMFMobileResourceBoilerplate + array(
		'styles' => array(
			'less/common/reset.less',
			'less/common/common.less',
			'less/common/ui.less',
			'less/common/typography.less',
			'less/common/footer.less',
			'less/modules/toggle.less',
			'less/common/drawer.less',
			'less/common/hacks.less',
			'less/common/pageactions.less',
		),
		'position' => 'top',
	),

	'tablet.styles' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array( 'mobile.startup' ),
		'styles' => array(
			'less/tablet/common.less',
			'less/tablet/hacks.less',
		),
	),

	'mobile.styles.beta' => $wgMFMobileResourceBoilerplate + array(
		'styles' => array(
			'less/common/secondaryPageActions.less',
		),
		'position' => 'top',
	),

	// Important: This module is loaded on both mobile and desktop skin
	'mobile.head' => $wgMFMobileResourceBoilerplate + array(
		'scripts' => array(
			'javascripts/common/polyfills.js',
			'javascripts/common/modules.js',
			'javascripts/common/Class.js',
			'javascripts/common/eventemitter.js',
			'javascripts/common/navigation.js',
			'javascripts/modules/lastEdited/time.js',
		),
		'position' => 'top',
	),

	'mobile.head.beta' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.head',
			'mediawiki.language',
			'mediawiki.jqueryMsg',
		),
		'scripts' => array(
			'javascripts/modules/lastEdited/lastEditedBeta.js',
		),
		'messages' => array(
			// LastEditedBeta.js
			'mobile-frontend-last-modified-with-user-seconds',
			'mobile-frontend-last-modified-with-user-minutes',
			'mobile-frontend-last-modified-with-user-hours',
			'mobile-frontend-last-modified-with-user-days',
			'mobile-frontend-last-modified-with-user-months',
			'mobile-frontend-last-modified-with-user-years',
			'mobile-frontend-last-modified-with-user-just-now',
		),
		'position' => 'top',
	),

	'mobile.startup' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.head',
			'mobile.templates',
			'mobile.user',
			'jquery.cookie',
		),
		'scripts' => array(
			'javascripts/common/Router.js',
			'javascripts/common/OverlayManager.js',
			'javascripts/common/api.js',
			'javascripts/common/PageApi.js',
			'javascripts/common/application.js',
			'javascripts/common/View.js',
			'javascripts/common/settings.js',
			'javascripts/modules/mf-stop-mobile-redirect.js',
		),
		'position' => 'bottom',
	),

	'mobile.user' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mediawiki.user',
		),
		'scripts' => array(
			'javascripts/common/user.js',
		),
	),

	'mobile.editor' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.stable.common',
			'mobile.overlays',
		),
		'scripts' => array(
			'javascripts/modules/editor/editor.js',
		),
	),

	'mobile.editor.beta' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.stable.common',
			'mobile.overlays.beta',
		),
		'scripts' => array(
			'javascripts/modules/editor/editor.js',
		),
	),

	'mobile.editor.common' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.stable',
			'mobile.templates',
			'jquery.cookie',
		),
		'scripts' => array(
			'javascripts/modules/editor/EditorApi.js',
		),
		'templates' => array(
			'modules/editor/AbuseFilterOverlay',
		),
		'messages' => array(
			// modules/editor/EditorOverlay.js
			'mobile-frontend-editor-continue',
			'mobile-frontend-editor-cancel',
			'mobile-frontend-editor-keep-editing',
			'mobile-frontend-editor-license' => array( 'parse' ),
			'mobile-frontend-editor-placeholder',
			'mobile-frontend-editor-summary-placeholder',
			'mobile-frontend-editor-cancel-confirm',
			'mobile-frontend-editor-wait',
			'mobile-frontend-editor-success',
			'mobile-frontend-editor-success-landmark-1' => array( 'parse' ),
			'mobile-frontend-editor-refresh',
			'mobile-frontend-editor-error',
			'mobile-frontend-editor-error-conflict',
			'mobile-frontend-editor-error-loading',
			'mobile-frontend-editor-error-preview',
			'mobile-frontend-account-create-captcha-placeholder',
			'mobile-frontend-editor-captcha-try-again',
			'mobile-frontend-photo-ownership-confirm',
			'mobile-frontend-editor-abusefilter-warning',
			'mobile-frontend-editor-abusefilter-disallow',
			'mobile-frontend-editor-abusefilter-read-more',
		),
	),
	'mobile.editor.styles' => $wgMFMobileResourceBoilerplate + array(
		'styles' => array(
			'less/modules/editor.less',
		),
	),

	'mobile.editor.ve' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'ext.visualEditor.mobileViewTarget',
			'mobile.beta',
			'mobile.editor.common',
			'mobile.stable.common',
			'mobile.editor.styles',
		),
		'scripts' => array(
			// FIXME: Move to mobile.editor.common when new overlays go to stable
			'javascripts/modules/editorNew/EditorOverlayBase.js',
			'javascripts/modules/editorNew/VisualEditorOverlay.js',
		),
		'templates' => array(
			'modules/editorNew/EditorOverlayBase',
			'modules/editorNew/VisualEditorOverlay',
		),
		// FIXME: these messages should go to mobile.editor.common when new overlays go to stable.
		'messages' => array(
			'mobile-frontend-editor-editing-page',
			'mobile-frontend-editor-previewing-page',
		),
	),

	// FIXME: clean up when new overlays in stable (use single mobile.edit as before)
	'mobile.editor.overlay.stable' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.editor.common',
			'mobile.editor.styles',
			'mobile.loggingSchemas',
		),
		'scripts' => array(
			'javascripts/modules/editor/AbuseFilterOverlay.js',
			'javascripts/modules/editor/EditorOverlay.js',
		),
		'templates' => array(
			'modules/editor/EditorOverlay',
		),
		'messages' => array(
			'mobile-frontend-editor-guider',
			'mobile-frontend-editor-preview-header',
		),
	),

	// FIXME: clean up when new overlays in stable (use single mobile.edit as before)
	'mobile.editor.overlay.beta' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.editor.common',
		),
		'scripts' => array(
			'javascripts/modules/editorNew/AbuseFilterOverlay.js',
			// FIXME: Move to mobile.editor.common when new overlays go to stable
			'javascripts/modules/editorNew/EditorOverlayBase.js',
			'javascripts/modules/editorNew/EditorOverlay.js',
		),
		'styles' => array(
			'less/modules/editorNew.less',
		),
		'templates' => array(
			'modules/editorNew/EditorOverlayBase',
			'modules/editorNew/EditorOverlay',
		),
		'messages' => array(
			'mobile-frontend-editor-editing-page',
			'mobile-frontend-editor-previewing-page',
			'mobile-frontend-editor-viewing-source-page',
		),
	),

	// FIXME: merge into mobile.uploadsNew when mobile.uploads is gone
	'mobile.uploads.tutorial' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.stable',
			'mobile.templates',
		),
		'scripts' => array(
			'javascripts/modules/uploads/UploadTutorial.js',
		),
		'styles' => array(
			'less/modules/uploads/UploadTutorial.less',
		),
		'templates' => array(
			'uploads/UploadTutorial',
		),
		'messages' => array(
			// UploadTutorial.js
			'mobile-frontend-first-upload-wizard-new-page-1-header',
			'mobile-frontend-first-upload-wizard-new-page-1',
			'mobile-frontend-first-upload-wizard-new-page-2-header',
			'mobile-frontend-first-upload-wizard-new-page-2',
			'mobile-frontend-first-upload-wizard-new-page-3-header',
			'mobile-frontend-first-upload-wizard-new-page-3',
			'mobile-frontend-first-upload-wizard-new-page-3-ok',
		),
	),

	// FIXME: merge into mobile.uploadsNew when mobile.uploads is gone
	'mobile.uploads.common' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.stable',
			'mobile.templates',
			'mobile.uploads.tutorial',
		),
		'scripts' => array(
			'javascripts/modules/uploads/PhotoApi.js',
			'javascripts/modules/uploads/LeadPhoto.js',
		),
		'templates' => array(
			'uploads/LeadPhoto',
		),
		'messages' => array(
			// PhotoApi.js
			'mobile-frontend-photo-article-edit-comment',
			'mobile-frontend-photo-article-donate-comment',
			'mobile-frontend-photo-upload-error-filename',
			'mobile-frontend-photo-upload-comment',
		),
	),

	'mobile.uploads' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.stable',
			'mobile.templates',
			'mobile.uploads.common',
		),
		'scripts' => array(
			'javascripts/modules/uploads/LearnMoreOverlay.js',
			'javascripts/modules/uploads/NagOverlay.js',
			'javascripts/modules/uploads/PhotoUploadProgress.js',
			'javascripts/modules/uploads/PhotoUploaderPreview.js',
			'javascripts/modules/uploads/PhotoUploader.js',
		),
		'styles' => array(
			'less/modules/uploads.less',
		),
		'templates' => array(
			'uploads/PhotoUploadPreview',
			'uploads/PhotoUploadProgress',
			'uploads/NagOverlay',
			'uploads/LearnMoreOverlay',
			'uploads/LeadPhoto',
		),
		'messages' => array(
			'mobile-frontend-photo-upload-success-article',
			'mobile-frontend-photo-upload-error',

			// LearnMoreOverlay.js
			'mobile-frontend-photo-ownership-confirm',

			// PhotoUploaderPreview.js
			'mobile-frontend-photo-license' => array( 'parse' ),
			'mobile-frontend-photo-ownership',
			'mobile-frontend-photo-ownership-help',
			'mobile-frontend-photo-caption-placeholder',
			'mobile-frontend-image-loading',
			'mobile-frontend-photo-submit',
			'mobile-frontend-photo-cancel',
			'mobile-frontend-photo-ownership-bullet-one',
			'mobile-frontend-photo-ownership-bullet-two',
			'mobile-frontend-photo-ownership-bullet-three',
			'mobile-frontend-photo-upload-error-file-type',
			'mobile-frontend-photo-license' => array( 'parse' ),

			// PhotoUploadProgress.js
			'mobile-frontend-image-uploading-wait',
			'mobile-frontend-image-uploading-long',
			'mobile-frontend-image-uploading-cancel',

			// NagOverlay.js
			'mobile-frontend-photo-nag-1-bullet-1-heading',
			'mobile-frontend-photo-nag-1-bullet-1-text' => array( 'parse' ),
			'mobile-frontend-photo-nag-1-bullet-2-heading',
			'mobile-frontend-photo-nag-1-bullet-2-text',
			'mobile-frontend-photo-nag-2-bullet-1-heading',
			'mobile-frontend-photo-nag-3-bullet-1-heading',
			'parentheses',
			'mobile-frontend-learn-more',
			'mobile-frontend-photo-nag-learn-more-heading',
			'mobile-frontend-photo-nag-learn-more-1' => array( 'parse' ),
			'mobile-frontend-photo-nag-learn-more-2' => array( 'parse' ),
			'mobile-frontend-photo-nag-learn-more-3' => array( 'parse' ),
		),
	),

	'mobile.uploadsNew' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.stable',
			'mobile.templates',
			'mobile.uploads.common',
		),
		'scripts' => array(
			'javascripts/modules/uploadsNew/PhotoUploadProgress.js',
			'javascripts/modules/uploadsNew/PhotoUploadOverlay.js',
			'javascripts/modules/uploadsNew/PhotoUploader.js',
		),
		'styles' => array(
			'less/modules/uploadsNew/PhotoUploadOverlay.less',
		),
		'templates' => array(
			'uploadsNew/PhotoUploadOverlay',
			'uploadsNew/PhotoUploadProgress',
		),
		'messages' => array(
			'mobile-frontend-photo-upload-success-article',
			'mobile-frontend-photo-upload-error',

			// PhotoUploadOverlay.js
			'mobile-frontend-image-heading-describe' => array( 'parse' ),
			'mobile-frontend-photo-ownership',
			'mobile-frontend-photo-ownership-help',
			'mobile-frontend-photo-caption-placeholder',
			'mobile-frontend-photo-submit',
			'mobile-frontend-photo-upload-error-file-type',
			'mobile-frontend-photo-license' => array( 'parse' ),

			// PhotoUploadProgress.js
			'mobile-frontend-image-uploading' => array( 'parse' ),
			'mobile-frontend-image-cancel-confirm' => array( 'parse' ),
		),
	),

	'mobile.beta.common' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.stable.common',
			'mobile.loggingSchemas',
			'mobile.templates',
		),
		'messages' => array(
			// LanguageOverlay.js
			'mobile-frontend-language-header',
			'mobile-frontend-language-site-choose',
			'mobile-frontend-language-footer',
		),
	),

	'mobile.keepgoing' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.beta',
			'mobile.templates',
			'mobile.overlays.beta',
		),
		'templates' => array(
			'keepgoing/KeepGoingDrawer',
			'keepgoing/KeepGoingOverlay',
		),
		'messages' => array(
			'mobilefrontend-keepgoing-suggest',
			'mobilefrontend-keepgoing-suggest-again',
			'mobilefrontend-keepgoing-cancel',
			'mobilefrontend-keepgoing-ask',
			'mobilefrontend-keepgoing-ask-first',
			'mobilefrontend-keepgoing-explain',
			'mobilefrontend-keepgoing-saved-title',
			'mobilefrontend-keepgoing-links-title',
			'mobilefrontend-keepgoing-links-ask-first',
			'mobilefrontend-keepgoing-links-ask-again',
			'mobilefrontend-keepgoing-links-explain',
			'mobilefrontend-keepgoing-links-example'
		),
		'scripts' => array(
			'javascripts/loggingSchemas/mobileWebCta.js',
			'javascripts/modules/keepgoing/KeepGoingDrawer.js',
			'javascripts/modules/keepgoing/KeepGoingOverlay.js',
		),
	),

	'mobile.geonotahack' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.startup',
			'mobile.loggingSchemas',
			// Needs LoadingOverlay
			'mobile.stable.common',
		),
		'messages' => array(
			'mobile-frontend-geonotahack',
		),
		'scripts' => array(
			'javascripts/modules/nearbypages.js',
		)
	),

	'mobile.beta' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.stable',
			'mobile.beta.common',
			'mobile.overlays.beta',
		),
		'styles' => array(
			'less/modules/talk.less',
			'less/modules/mediaViewer.less',
		),
		'scripts' => array(
			'javascripts/externals/micro.tap.js',
			'javascripts/modules/mf-toggle-dynamic.js',
			'javascripts/modules/talk/talk.js',
			'javascripts/modules/mediaViewer.js',
			'javascripts/modules/keepgoing/keepgoing.js',
		),
		'templates' => array(
			'modules/ImageOverlay',
		),
		'position' => 'bottom',
		'messages' => array(
			// for mf-toggle-dynamic.js
			'mobile-frontend-show-button',
			'mobile-frontend-hide-button',

			// for talk.js
			'mobile-frontend-talk-overlay-header',

			// mediaViewer.js
			'mobile-frontend-media-details',
			'mobile-frontend-media-license-link',
		),
	),

	'mobile.search.beta' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.beta'
		),
		'styles' => array(
			'less/modules/searchNew/SearchOverlay.less',
		),
		'scripts' => array(
			'javascripts/modules/searchNew/SearchApi.js',
			'javascripts/modules/searchNew/SearchOverlay.js',
			'javascripts/modules/searchNew/search.js',
			'javascripts/modules/searchNew/pageImages.js',
		),
		'templates' => array(
			'modules/searchNew/SearchOverlay',
		),
		'messages' => array(
			// for search.js
			'mobile-frontend-clear-search',
			'mobile-frontend-search-content',
			'mobile-frontend-search-no-results',
			'mobile-frontend-search-content-no-results' => array( 'parse' ),
		),
	),

	'mobile.talk' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.beta',
			'mobile.templates',
		),
		'scripts' => array(
			'javascripts/modules/talk/TalkSectionOverlay.js',
			'javascripts/modules/talk/TalkOverlay.js',
		),
		'templates' => array(
			// talk.js
			'overlays/talk',
			'overlays/talkSectionAdd',
			'talkSection',
		),
		'messages' => array(
			'mobile-frontend-talk-explained',
			'mobile-frontend-talk-explained-empty',
			'mobile-frontend-talk-overlay-lead-header',
			'mobile-frontend-talk-add-overlay-subject-placeholder',
			'mobile-frontend-talk-add-overlay-content-placeholder',
			'mobile-frontend-talk-edit-summary',
			'mobile-frontend-talk-add-overlay-submit',
			'mobile-frontend-talk-reply-success',
			'mobile-frontend-talk-reply',
			'mobile-frontend-talk-reply-info',
			// FIXME: Gets loaded twice if editor and talk both loaded.
			'mobile-frontend-editor-cancel',
		),
	),

	'mobile.alpha' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.stable',
			'mobile.beta',
			'mobile.templates',
		),
		'messages' => array(
			// for random.js
			'mobilefrontend-random-explain',
			'mobilefrontend-random-cancel',

			// for mf-table.js
			'mobile-frontend-table',
		),
		'styles' => array(
			'less/common/mainmenuAnimation.less',
		),
		'scripts' => array(
			'javascripts/externals/epoch.js',
			'javascripts/common/history-alpha.js',
			'javascripts/modules/mf-translator.js',
			'javascripts/modules/lazyload.js',
			'javascripts/modules/random/random.js',
		),
	),

	'mobile.toast.styles' => $wgMFMobileResourceBoilerplate + array(
		'styles' => array(
			'less/common/toast.less',
		),
		'position' => 'top',
	),

	'mobile.stable.styles' => $wgMFMobileResourceBoilerplate + array(
		'styles' => array(
			'less/common/common-js.less',
			'less/modules/watchstar.less',
			'less/modules/tutorials.less',
		),
		'position' => 'top',
	),

	'mobile.overlays' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.templates',
			'mobile.startup',
		),
		'scripts' => array(
			'javascripts/common/Overlay.js',
			'javascripts/common/LoadingOverlay.js',
		),
		'messages' => array(
			'mobile-frontend-overlay-escape',
		),
		'templates' => array(
			'LoadingOverlay',
			'overlay',
		),
		'styles' => array(
			'less/common/overlays.less',
		)
	),

	'mobile.overlays.beta' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.overlays',
		),
		'scripts' => array(
			'javascripts/common/OverlayNew.js',
			'javascripts/common/LoadingOverlayNew.js',
		),
		'styles' => array(
			'less/common/OverlayNew.less',
		),
		'templates' => array(
			'OverlayNew',
		),
		'messages' => array(
			'mobile-frontend-overlay-close',
			'mobile-frontend-overlay-continue',
		),
	),

	// Important: This module is loaded on both mobile and desktop skin
	'mobile.stable.common' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.startup',
			'mobile.toast.styles',
			'mediawiki.jqueryMsg',
			'mediawiki.util',
			'mobile.templates',
			'mobile.overlays',
		),
		'templates' => array(
			'section',
			'wikitext/commons-upload',
			'overlays/cleanup',
			// search.js and Nearby.js
			'articleList',
			// page.js
			'page',
			'languageSection',
			// PhotoUploaderButton.js
			// For new page action menu
			'uploads/LeadPhotoUploaderButton',
			// FIXME: this should be in special.uploads (need to split
			// code in PhotoUploaderButton.js into separate files too)
			'uploads/PhotoUploaderButton',

			'ctaDrawer',
		),
		'scripts' => array(
			'javascripts/common/Drawer.js',
			'javascripts/common/CtaDrawer.js',
			'javascripts/widgets/progress-bar.js',
			'javascripts/common/toast.js',
			'javascripts/common/Page.js',
			'javascripts/modules/uploads/PhotoUploaderButton.js',
		),
		'messages' => array(
			// mf-navigation.js
			'mobile-frontend-watchlist-cta-button-signup',
			'mobile-frontend-watchlist-cta-button-login',
			'mobile-frontend-drawer-cancel',

			// LearnMoreOverlay.js, newbie.js
			'cancel',

			// page.js
			'mobile-frontend-talk-overlay-header',
			'mobile-frontend-language-article-heading',
			// editor.js
			'mobile-frontend-editor-disabled',
			'mobile-frontend-editor-unavailable',
			'mobile-frontend-editor-blocked',
			'mobile-frontend-editor-cta',
			'mobile-frontend-editor-edit',
			// modules/editor/EditorOverlay.js and modules/talk.js
			'mobile-frontend-editor-save',
			// PageApi.js
			'mobile-frontend-last-modified-with-user-date',
		),
	),

	'mobile.lastEdited.stable' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.stable',
		),
		'scripts' => array(
			'javascripts/modules/lastEdited/lastEdited.js',
		),
	),

	'mobile.references' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.templates',
			'mobile.startup',
			'mobile.stable.common',
		),
		'styles' => array(
			'less/modules/references.less',
		),
		'templates' => array(
			// references.js
			'ReferencesDrawer',
		),
		'scripts' => array(
			'javascripts/modules/references/references.js',
		),
	),

	'mobile.toggling' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.startup',
		),
		'scripts' => array(
			'javascripts/modules/toggling/toggle.js',
		),
	),

	'mobile.newusers' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.templates',
			'mobile.overlays',
		),
		'scripts' => array(
			'javascripts/common/ContentOverlay.js',
			'javascripts/modules/tutorials/PageActionOverlay.js',
			'javascripts/modules/tutorials/newbieEditor.js',
		),
		'messages' => array(
			// newbieEditor.js
			'mobile-frontend-editor-tutorial-summary',
			'mobile-frontend-editor-tutorial-alt-summary',
			'mobile-frontend-editor-tutorial-confirm',
		),
		'templates' => array(
			'modules/tutorials/PageActionOverlay',
		),
	),

	'mobile.stable' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.startup',
			'mobile.user',
			'mobile.stable.common',
			'mediawiki.util',
			'mobile.stable.styles',
			'mobile.templates',
			'mobile.references',
			'mediawiki.language',
			'mobile.loggingSchemas',
			'mobile.newusers',
		),
		'scripts' => array(
			'javascripts/externals/micro.autosize.js',
			'javascripts/modules/uploads/lead-photo-init.js',
			'javascripts/modules/mainmenutweaks.js',
			'javascripts/modules/mf-watchstar.js',
		),
		'messages' => array(
			// lastEdited.js
			'mobile-frontend-last-modified-seconds',
			'mobile-frontend-last-modified-hours',
			'mobile-frontend-last-modified-minutes',
			'mobile-frontend-last-modified-hours',
			'mobile-frontend-last-modified-days',
			'mobile-frontend-last-modified-months',
			'mobile-frontend-last-modified-years',
			'mobile-frontend-last-modified-just-now',

			// leadphoto.js
			'mobile-frontend-photo-upload-disabled',
			'mobile-frontend-photo-upload-protected',
			'mobile-frontend-photo-upload-anon',
			'mobile-frontend-photo-upload-unavailable',
			'mobile-frontend-photo-upload',

			// mf-watchstar.js
			'mobile-frontend-watchlist-add',
			'mobile-frontend-watchlist-removed',
			'mobile-frontend-watchlist-cta',
		),
	),


	// FIXME: remove when new search overlay in stable
	'mobile.search.stable' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.stable',
			'mobile.templates',
		),
		'scripts' => array(
			'javascripts/modules/search/search.js',
		),
		'styles' => array(
			'less/modules/search.less',
		),
		'templates' => array(
			'overlays/search/search',
		),
		'messages' => array(
			// for search.js
			'mobile-frontend-search-help',
			'mobile-frontend-search-noresults',
		),
	),

	// FIXME: remove when new overlays in stable
	'mobile.languages' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.overlays',
		),
		'styles' => array(
			'less/modules/languages.less',
		),
		'scripts' => array(
			'javascripts/modules/languages/LanguageOverlay.js',
			'javascripts/modules/languages/languages.js',
		),
		'templates' => array(
			'overlays/languages',
		),
		'messages' => array(
			'mobile-frontend-language-header',
			'mobile-frontend-language-site-choose',
			'mobile-frontend-language-footer',
		),
	),

	'mobile.languages.beta' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.overlays.beta',
		),
		'scripts' => array(
			'javascripts/modules/languagesNew/LanguageOverlay.js',
			'javascripts/modules/languagesNew/languages.js',
			'javascripts/modules/languagesNew/preferred.js',
		),
		'templates' => array(
			'modules/languagesNew/LanguageOverlay',
		),
		'messages' => array(
			'mobile-frontend-language-heading',
			'mobile-frontend-language-header',
			'mobile-frontend-language-variant-header' => array( 'parse' ),
			'mobile-frontend-language-site-choose',
		),
	),

	'mobile.issues' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.overlays',
		),
		'styles' => array(
			'less/modules/issues.less',
		),
		'scripts' => array(
			'javascripts/modules/issues/issues.js',
		),
		'messages' => array(
			// issues.js
			'mobile-frontend-meta-data-issues',
			'mobile-frontend-meta-data-issues-header',
		),
	),

	'mobile.issues.beta' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.overlays.beta',
		),
		'styles' => array(
			'less/modules/issues.less',
		),
		'scripts' => array(
			'javascripts/modules/issues/issues.js',
		),
		'messages' => array(
			// issues.js
			'mobile-frontend-meta-data-issues',
			'mobile-frontend-meta-data-issues-header',
		),
	),

	'mobile.site' => array(
		'dependencies' => array( 'mobile.startup' ),
		'class' => 'MobileSiteModule',
	),

	// Resources to be loaded on desktop version of site
	'mobile.desktop' => array(
		'scripts' => array( 'javascripts/desktop/unset_stopmobileredirect.js' ),
		'dependencies' => array( 'jquery.cookie' ),
		'localBasePath' => $localBasePath,
		'remoteExtPath' => $remoteExtPath,
		'targets' => 'desktop',
	),

	/**
		* Special page modules
		* FIXME: Remove the need for these by making more reusable CSS
		* FIXME: Rename these modules in the interim to clarify that they are modules for use on special pages
		*
		* Note: Use correct names to ensure modules load on pages
		* Name must be the name of the special page lowercased prefixed by 'mobile.'
		* suffixed by '.styles' or '.scripts'
		*/
	// Special:UserProfile
	'mobile.special.styles' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		'styles' => array(
			'less/specials/common.less',
		),
	),

	'mobile.special.preferences' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		'scripts' => array(
			'javascripts/specials/preferences.js',
		),
	),

	'mobile.mobilemenu.styles' => $wgMFMobileSpecialPageResourceStyleBoilerplate + array(
		'styles' => array(
			'less/specials/mobilemenu.less',
		),
	),
	'mobile.mobileoptions.styles' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		'styles' => array(
			'less/specials/mobileoptions.less',
		),
	),
	'mobile.mobileoptions.scripts' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		'position' => 'top',
		'scripts' => array(
			'javascripts/specials/mobileoptions.js',
		),
	),
	'mobile.mobileeditor.scripts' => $wgMFMobileSpecialPageResourceBoilerplate + array(
			'scripts' => array(
					'javascripts/specials/redirectmobileeditor.js',
			),
	),

	'mobile.nearby.styles' => $wgMFMobileResourceBoilerplate + array(
		'styles' => array(
			'less/specials/nearby.less',
		),
		'skinStyles' => array(
			'vector' => 'less/desktop/special/nearby.less',
		),
	),

	// FIXME: Merge with mobile.nearby when geonotahack moves to  stable
	'mobile.nearby.beta' => $wgMFMobileResourceBoilerplate + array(
		'messages' => array(
			// NearbyOverlay.js
			'mobile-frontend-nearby-to-page',
			'mobile-frontend-nearby-title',

			// PagePreviewOverlay
			'mobile-frontend-nearby-directions',
			'mobile-frontend-nearby-link',
		),
		'templates' => array(
			'overlays/nearby',
		),
		'dependencies' => array(
			'mobile.stable.common',
			'mobile.nearby',
			'mobile.beta.common',
		),
		'scripts' => array(
			'javascripts/modules/nearby/PagePreviewOverlay.js',
			'javascripts/modules/nearby/NearbyOverlay.js',
		)
	),

	'mobile.nearby' => $wgMFMobileResourceBoilerplate + array(
		'templates' => array(
			'articleList',
			'overlays/pagePreview',
		),
		'dependencies' => array(
			'mobile.stable.common',
			'mobile.nearby.styles',
			'jquery.json',
			'mediawiki.language',
			'mobile.templates',
			'mobile.loggingSchemas',
		),
		'messages' => array(
			// NearbyApi.js
			'mobile-frontend-nearby-distance',
			'mobile-frontend-nearby-distance-meters',
			// Nearby.js
			'mobile-frontend-nearby-requirements',
			'mobile-frontend-nearby-requirements-guidance',
			'mobile-frontend-nearby-error',
			'mobile-frontend-nearby-error-guidance',
			'mobile-frontend-nearby-loading',
			'mobile-frontend-nearby-noresults',
			'mobile-frontend-nearby-noresults-guidance',
			'mobile-frontend-nearby-lookup-ui-error',
			'mobile-frontend-nearby-lookup-ui-error-guidance',
			'mobile-frontend-nearby-permission',
			'mobile-frontend-nearby-permission-guidance',
		),
		'scripts' => array(
			'javascripts/modules/nearby/NearbyApi.js',
			'javascripts/modules/nearby/Nearby.js',
		),
	),

	'mobile.nearby.scripts' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.nearby',
		),
		'messages' => array(
			// specials/nearby.js
			'mobile-frontend-nearby-refresh',
		),
		'scripts' => array(
			'javascripts/specials/nearby.js',
		),
		// stop flash of unstyled content when loading from cache
		'position' => 'top',
	),
	'mobile.notifications.special.styles' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		'styles' => array(
			'less/specials/notifications.less',
		),
		'position' => 'top',
	),
	'mobile.notifications.special.scripts' => $wgMFMobileSpecialPageResourceScriptBoilerplate + array(
		'scripts' => array(
			'javascripts/specials/notifications.js',
		),
		'messages' => array(
			// defined in Echo
			'echo-load-more-error',
		),
	),

	'mobile.notifications' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.overlays',
		),
		'scripts' => array(
			'javascripts/modules/notifications/notifications.js',
		),
	),

	'mobile.notifications.beta' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.overlays.beta',
		),
		'scripts' => array(
			'javascripts/modules/notifications/notifications.js',
		),
	),

	'mobile.notifications.overlay' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.stable',
			'ext.echo.base',
		),
		'scripts' => array(
			'javascripts/modules/notifications/NotificationsOverlay.js',
		),
		'styles' => array(
			'less/modules/NotificationsOverlay.less',
		),
		'templates' => array(
			'modules/notifications/NotificationsOverlay',
		),
		'messages' => array(
			// defined in Echo
			'echo-none',
			'notifications',
			'echo-overlay-link',
		),
	),

	'mobile.notifications.overlay.beta' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.overlays.beta',
			'mobile.notifications.overlay',
		),
		'scripts' => array(
			'javascripts/modules/notifications/NotificationsOverlayNew.js',
		),
	),

	'mobile.search.styles' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		'styles' => array(
			'less/specials/search.less',
		),
	),
	'mobile.watchlist.scripts' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.loggingSchemas',
			'mobile.stable',
		),
		'scripts' => array(
			'javascripts/specials/watchlist.js',
		),
	),
	'mobile.watchlist.styles' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		'styles' => array(
			'less/specials/watchlist.less',
		),
	),
	'mobile.userlogin.styles' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		'styles' => array(
			'less/specials/userlogin.less',
		),
	),
	// Special:UserProfile
	'mobile.userprofile.styles' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		'styles' => array(
			'less/specials/userprofile.less',
		),
	),
	'mobile.userprofile.scripts' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.stable.common',
			'mobile.editor.common',
		),
		'messages' => array(
			'mobile-frontend-editor-edit',
			'mobile-frontend-profile-description-placeholder',
			'htmlform-submit',
			'mobile-frontend-profile-edit-summary',
		),
		'templates' => array(
			'EditBox',
		),
		'scripts' => array(
			'javascripts/specials/userprofile.js',
		),
	),
	'mobile.uploads.scripts' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.stable.styles',
			'mobile.stable.common',
			'mobile.templates',
			// FIXME: remove when new uploads overlay in stable
			'mobile.uploads.tutorial',
		),
		'templates' => array(
			'specials/uploads/photo',
			'specials/uploads/userGallery',
		),
		'messages' => array(
			'mobile-frontend-donate-image-nouploads',
			'mobile-frontend-photo-upload-generic',
			'mobile-frontend-donate-photo-upload-success',
			'mobile-frontend-donate-photo-first-upload-success',
			'mobile-frontend-listed-image-no-description',
			'mobile-frontend-photo-upload-user-count',
		),
		'scripts' => array(
			'javascripts/specials/uploads.js',
		),
		'position' => 'top',
	),
	'mobile.uploads.styles' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		'styles' => array(
			'less/specials/uploads.less',
			'less/modules/uploads/PhotoUploaderButton.less',
		),
	),
	'mobile.mobilediff.styles' => $wgMFMobileSpecialPageResourceBoilerplate + array(
		'styles' => array(
			'less/specials/watchlist.less',
			'less/specials/mobilediff.less',
		),
	),

	// Note that this module is declared as a dependency in the Thanks extension (for the
	// mobile diff thanks button code). Keep the module name there in sync with this one.
	'mobile.mobilediff.scripts' => $wgMFMobileResourceBoilerplate + array(
		'dependencies' => array(
			'mobile.loggingSchemas',
			'mobile.stable.common',
		),
		'scripts' => array(
			'javascripts/specials/mobilediff.js',
		),
	),
) );

unset( $localBasePath );
unset( $remoteExtPath );
