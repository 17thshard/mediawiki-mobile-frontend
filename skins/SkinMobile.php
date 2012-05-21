<?php


class SkinMobile extends SkinMobileBase {
	public $skinname = 'mobile';
	public $stylename = 'mobile';
	public $template = 'SkinMobileTemplate';
	private $resourceLoader;

	protected function prepareTemplate( OutputPage $out ) {
		global $wgAppleTouchIcon, $wgCookiePath, $wgExtensionAssetsPath, $wgLanguageCode,
			   $wgMFFeedbackFallbackURL, $wgMFCustomLogos;

		wfProfileIn( __METHOD__ );
		$tpl = parent::prepareTemplate( $out );
		$out = $this->getOutput();
		$title = $this->getTitle();
		$request = $this->getRequest();
		$context = MobileContext::singleton();
		$device = $context->getDevice();
		$language = $this->getLanguage();
		$inBeta = $context->isBetaGroupMember();

		$tpl->set( 'isBetaGroupMember', $inBeta );
		$tpl->set( 'pagetitle', $out->getHTMLTitle() );
		$tpl->set( 'viewport-scaleable', $device['disable_zoom'] ? 'no' : 'yes' );
		$tpl->set( 'title', $out->getPageTitle() );
		$tpl->set( 'isMainPage', $title->isMainPage() );
		$tpl->set( 'canonicalUrl', $title->getCanonicalURL() );
		$tpl->set( 'robots', $this->getRobotsPolicy() );
		$tpl->set( 'hookOptions', $this->hookOptions );
		$copyrightLogo = is_array( $wgMFCustomLogos ) && isset( $wgMFCustomLogos['copyright'] ) ?
			$wgMFCustomLogos['copyright'] :
			"{$wgExtensionAssetsPath}/MobileFrontend/stylesheets/images/logo-copyright-{$wgLanguageCode}.png";

		wfProfileIn( __METHOD__ . '-modules' );
		$tpl->set( 'supports_jquery', $device['supports_jquery'] );
		$styles = array();
		$scripts = array();
		if ( $inBeta ) {
			$styles[] = 'mobile.beta';
			$scripts[] = 'mobile.beta';
		} else {
			$styles[] = 'mobile';
			$scripts[] = 'mobile';
		}
		$styles[] = "mobile.device.{$device['css_file_name']}";
		$styles[] = 'mobile.references';
		$styleLinks = array( $this->resourceLoaderLink( $styles, 'styles' ) );
		$isFilePage = $title->getNamespace() == NS_FILE;
		if ( $isFilePage ) {
			$styleLinks[] = $this->resourceLoaderLink( 'mobile.filePage', 'styles' );
		}
		$tpl->set( 'cssLinks', implode( "\n", $styleLinks ) );
		wfProfileOut( __METHOD__ . '-modules' );

		$tpl->setRef( 'wgAppleTouchIcon', $wgAppleTouchIcon );

		if ( $device['supports_jquery'] ) {
			$scripts[] = 'mobile.references';
		}
		$scriptLinks = array();
		if ( $device['supports_jquery'] ) {
			$scriptLinks[] = $this->resourceLoaderLink( 'jquery', 'scripts', true, true );
		}
		$scriptLinks[] = $this->resourceLoaderLink( $scripts, 'scripts' );
		if ( $isFilePage ) {
			$scriptLinks[] = $this->resourceLoaderLink( 'mobile.filePage', 'scripts' );
		}
		$bottomScripts = implode( "\n", $scriptLinks );
		$tpl->set( 'bottomScripts', $device['supports_javascript'] ? $bottomScripts : '' );
		$tpl->set( 'preambleScript', $device['supports_javascript'] ?
			"document.documentElement.className = 'jsEnabled togglingEnabled page-loading';" : '' );

		$tpl->set( 'stopMobileRedirectCookieName', 'stopMobileRedirect' );
		$tpl->set( 'stopMobileRedirectCookieDuration', $context->getUseFormatCookieDuration() );
		$tpl->set( 'stopMobileRedirectCookieDomain', $context->getBaseDomain() );
		$tpl->set( 'useFormatCookieName', $context->getUseFormatCookieName() );
		$tpl->set( 'useFormatCookieDuration', -1 );
		$tpl->set( 'useFormatCookiePath', $wgCookiePath );
		$tpl->set( 'useFormatCookieDomain', $_SERVER['HTTP_HOST'] );

		$hideSearchBox = $request->getInt( 'hidesearchbox', 0 ) == 1;
		$hideLogo = $this->getRequest()->getInt( 'hidelogo' ) == 1;
		if ( !empty( $_SERVER['HTTP_APPLICATION_VERSION'] ) &&
			strpos( $_SERVER['HTTP_APPLICATION_VERSION'], 'Wikipedia Mobile' ) !== false ) {
			$hideSearchBox = true;
			if ( strpos( $_SERVER['HTTP_APPLICATION_VERSION'], 'Android' ) !== false ) {
				$hideLogo = true;
			}
		}
		$tpl->set( 'hideSearchBox', $hideSearchBox );
		$tpl->set( 'hideLogo', $hideLogo );
		$tpl->set( 'hideFooter', $hideLogo );
		$tpl->set( 'languageSelection', $this->buildLanguageSelection() );

		// footer
		$link = $context->getMobileUrl( wfExpandUrl( $this->getRequest()->appendQuery( 'action=history' ) ) );
		if ( !$title->isSpecialPage() ) {
			$lastEdit = $this->getWikiPage()->getTimestamp();
			$historyLink = $this->msg( 'mobile-frontend-footer-contributors', htmlspecialchars( $link ) )->text();
			$activityLink = $this->msg( 'mobile-frontend-footer-article-edit-info',
				$language->timeanddate( $lastEdit ),
				$language->time( $lastEdit ),
				$language->date( $lastEdit ) )->parse();
			$historyAndActivityLink = $historyLink . "<br>" . $activityLink . "<br>";
		} else {
			$historyAndActivityLink = '';
		}
		$tpl->set( 'historyAndActivityLink', $historyAndActivityLink );
		$tpl->set( 'copyright', $this->getCopyright() );
		$tpl->set( 'disclaimerLink', $this->disclaimerLink() );
		$tpl->set( 'privacyLink', $this->footerLink( 'mobile-frontend-privacy-link-text', 'privacypage' ) );
		$tpl->set( 'aboutLink', $this->footerLink( 'mobile-frontend-about-link-text', 'aboutpage' ) );

		$leaveFeedbackURL = SpecialPage::getTitleFor( 'MobileFeedback' )->getLocalURL(
			array( 'returnto' => $this->getTitle()->getPrefixedText() )
		);
		$tpl->set( 'leaveFeedbackURL', $leaveFeedbackURL );
		$imagesSwitchTitle = SpecialPage::getTitleFor( 'MobileOptions',
			$context->imagesDisabled() ? 'EnableImages' : 'DisableImages'
		);
		$tpl->set( 'feedbackLink', $wgLanguageCode == 'en' ?
				Html::element( 'a', array( 'href' => $leaveFeedbackURL ), wfMsg( 'mobile-frontend-leave-feedback' ) )
				: ''
		);

		$tpl->set( 'logInOut', $this->getLogInOutLink() );
		if ( $context->imagesDisabled() ) {
			$on = Linker::link( $imagesSwitchTitle,
				$this->msg( 'mobile-frontend-on' )->escaped(),
				array( 'id' => 'imagetoggle' ),
				array( 'returnto' => $title->getPrefixedText() )
			);
			$off = $this->msg( 'mobile-frontend-off' )->escaped();
		} else {
			$on = $this->msg( 'mobile-frontend-on' )->escaped();
			$off = Linker::link( $imagesSwitchTitle,
				$this->msg( 'mobile-frontend-off' )->escaped(),
				array( 'id' => 'imagetoggle' ),
				array( 'returnto' => $title->getPrefixedText() )
			);
		}
		$tpl->set( 'imagesToggle', $this->msg( 'mobile-frontend-toggle-images' )->rawParams( $on, $off )->escaped() );
		$footerSitename = $this->msg( 'mobile-frontend-footer-sitename' )->text();
		if ( $wgLanguageCode === 'en' ) { //@fixme: de-WMFize
			$license = Html::element( 'img', array(
				'src' => $copyrightLogo,
				'class' => 'license',
				'alt' => "{$footerSitename} ®"
			) );
		} else {
			$license = Html::element( 'div', array( 'class' => 'license' ),
				"{$footerSitename} ™"
			);
		}
		$tpl->set( 'license', $license );

		wfProfileOut( __METHOD__ );
		return $tpl;
	}

	/**
	 * @return ResourceLoader
	 */
	protected function getResourceLoader() {
		if ( !$this->resourceLoader ) {
			$this->resourceLoader = new ResourceLoader();
		}
		return $this->resourceLoader;
	}

	protected function resourceLoaderLink( $moduleNames, $type, $useVersion = true, $forceRaw = false ) {
		if ( $type == 'scripts' ) {
			$only = ResourceLoaderModule::TYPE_SCRIPTS;
		} elseif ( $type == 'styles' ) {
			$only = ResourceLoaderModule::TYPE_STYLES;
		} else {
			throw new MWException( __METHOD__ . "(): undefined link type '$type'" );
		}
		wfProfileIn( __METHOD__ );
		$out = $this->getOutput();
		$moduleNames = array_flip( (array)$moduleNames );
		$resourceLoader = $this->getResourceLoader();
		$query = ResourceLoader::makeLoaderQuery(
			array(), // modules; not determined yet
			$this->getLanguage()->getCode(),
			$this->getSkinName(),
			null, // so far all the modules we use are user-agnostic
			null, // version; not determined yet
			ResourceLoader::inDebugMode()
		);
		$context = new ResourceLoaderContext( $resourceLoader, new FauxRequest( $query ) );
		$version = 0;
		foreach ( array_keys( $moduleNames ) as $name ) {
			$module = $resourceLoader->getModule( $name );
			# Check that we're allowed to include this module on this page
			if ( !$module
				|| ( $module->getOrigin() > $out->getAllowedModules( ResourceLoaderModule::TYPE_SCRIPTS )
					&& $type == 'scripts' )
				|| ( $module->getOrigin() > $out->getAllowedModules( ResourceLoaderModule::TYPE_STYLES )
					&& $type == 'styles' )
			)
			{
				unset( $moduleNames[$name] );
				continue;
			}
			if ( $useVersion ) {
				$version = max( $version, $module->getModifiedTime( $context ) );
			}
		}
		$url = ResourceLoader::makeLoaderURL(
			array_keys( $moduleNames ),
			$this->getLanguage()->getCode(),
			$this->getSkinName(),
			null, // so far all the modules we use are user-agnostic
			$useVersion ? $version : null,
			ResourceLoader::inDebugMode(),
			$only,
			false,
			false,
			$forceRaw ? array( 'raw' => 'true' ) : array()
		);
		if ( $type == 'scripts' ) {
			$link = Html::linkedScript( $url );
		} else {
			$link = Html::linkedStyle( $url );
		}
		wfProfileOut( __METHOD__ );
		return $link;
	}

	public function buildLanguageSelection() {
		global $wgLanguageCode;
		wfProfileIn( __METHOD__ );
		$supportedLanguages = array();
		if ( is_array( $this->hookOptions ) && isset( $this->hookOptions['supported_languages'] ) ) {
			$supportedLanguages = $this->hookOptions['supported_languages'];
		}
		$context = MobileContext::singleton();
		$inBeta = $context->isBetaGroupMember();

		$output = $inBeta ?
			Html::openElement( 'select' ) :
			Html::openElement( 'select',
				array( 'id' => 'languageselection' ) );
		foreach ( $this->getLanguageUrls() as $languageUrl ) {
			$languageUrlHref = $languageUrl['href'];
			$languageUrlLanguage = $languageUrl['language'];
			if ( is_array( $supportedLanguages ) && in_array( $languageUrl['lang'], $supportedLanguages ) ) {
				if ( isset( $this->hookOptions['toggle_view_desktop'] ) ) {
					$request = $this->getRequest();
					$returnto = $request->appendQuery( $this->hookOptions['toggle_view_desktop'] );
					$languageUrlHref =  $returnto  .
						urlencode( $languageUrlHref );
				}
			}
			if ( $languageUrl['lang'] == $wgLanguageCode ) {
				$output .=	Html::element( 'option',
					array( 'value' => $languageUrlHref, 'selected' => 'selected' ),
					$languageUrlLanguage );
			} else {
				$output .=	Html::element( 'option',
					array( 'value' => $languageUrlHref ),
					$languageUrlLanguage );
			}
		}
		$output .= Html::closeElement( 'select' );
		wfProfileOut( __METHOD__ );
		return $output;
	}


	public function getLanguageUrls() {
		global $wgContLang;

		wfProfileIn( __METHOD__ );
		$context = MobileContext::singleton();
		$languageUrls = array();

		$langCode = $this->getLanguage()->getHtmlCode();
		$out = $this->getOutput();
		$languageUrls[] = array(
			'href' => $this->getRequest()->getFullRequestURL(),
			'text' => $out->getHTMLTitle(),
			'language' => $wgContLang->getLanguageName( $langCode ),
			'class' => 'interwiki-' . $langCode,
			'lang' => $langCode,
		);

		foreach ( $out->getLanguageLinks() as $l ) {
			$tmp = explode( ':', $l, 2 );
			$class = 'interwiki-' . $tmp[0];
			$lang = $tmp[0];
			unset( $tmp );
			$nt = Title::newFromText( $l );
			if ( $nt ) {
				$languageUrl = $context->getMobileUrl( $nt->getFullURL() );
				$languageUrls[] = array(
					'href' => $languageUrl,
					'text' => ( $wgContLang->getLanguageName( $nt->getInterwiki() ) != ''
						? $wgContLang->getLanguageName( $nt->getInterwiki() )
						: $l ),
					'language' => $wgContLang->getLanguageName( $lang ),
					'class' => $class,
					'lang' => $lang,
				);
			}
		}
		wfProfileOut( __METHOD__ );

		return $languageUrls;
	}

	/**
	 * Extracts <meta name="robots"> from head items that we don't need
	 * @return string
	 */
	private function getRobotsPolicy() {
		wfProfileIn( __METHOD__ );
		libxml_use_internal_errors( true );
		$dom = $this->extMobileFrontend->getDom( $this->getOutput()->getHeadLinks() );
		$xpath = new DOMXpath( $dom );
		foreach ( $xpath->query( '//meta[@name="robots"]' ) as $tag ) {
			wfProfileOut( __METHOD__ );
			return $dom->saveXML( $tag );
		}
		wfProfileOut( __METHOD__ );
		return '';
	}

	private function getLogInOutLink() {
		wfProfileIn( __METHOD__ );
		$query = array( 'returnto' => $this->getTitle()->getPrefixedText() );
		if ( !$this->getRequest()->wasPosted() ) {
			$returntoquery = $this->getRequest()->getValues();
			unset( $returntoquery['title'] );
			unset( $returntoquery['returnto'] );
			unset( $returntoquery['returntoquery'] );
			$query['returntoquery'] = wfArrayToCGI( $returntoquery );
		}
		if ( $this->getUser()->isLoggedIn() ) {
			$link = Linker::link( SpecialPage::getTitleFor( 'UserLogout' ),
				wfMessage( 'userlogout' )->escaped(),
				array(),
				$query
			);
		} else {
			$link = Linker::link( SpecialPage::getTitleFor( 'UserLogin' ),
				wfMessage( 'mobile-frontend-login' )->escaped(),
				array(),
				$query
			);
		}
		wfProfileOut( __METHOD__ );
		return $link;
	}
}

class SkinMobileTemplate extends BaseTemplate {
	public function execute() {
		$this->prepareData();

		?><!doctype html>
	<html lang="<?php $this->text('code') ?>" dir="<?php $this->html( 'dir' ) ?>">
	<head>
		<title><?php $this->text( 'pagetitle' ) ?></title>
		<meta http-equiv="content-type" content="text/html; charset=utf-8" />
		<?php $this->html( 'robots' ) ?>
		<?php $this->html( 'cssLinks' ) ?>
		<meta name="viewport" content="initial-scale=1.0, user-scalable=<?php $this->text( 'viewport-scaleable' ) ?>">
		<?php $this->html( 'touchIcon' ) ?>
		<script type="text/javascript">
			var mwMobileFrontendConfig = <?php $this->html( 'jsConfig' ) ?>;
			<?php $this->html( 'preambleScript' ) ?>
		</script>
		<link rel="canonical" href="<?php $this->html( 'canonicalUrl' ) ?>" >
	</head>
	<body class="mobile">
		<?php
		if ( $this->data['isBetaGroupMember'] ) {
			$this->navigationStart();
		}
		?>
		<?php $this->html( 'zeroRatedBanner' ) ?>
		<?php $this->searchBox() ?>
	<div class='show' id='content_wrapper'>
		<?php $this->html( 'notice' ) ?>
		<div id="content">
			<?php $this->html( 'firstHeading' ) ?>
			<?php $this->html( 'bodytext' ) ?>
		</div>
	</div>
		<?php $this->footer() ?>
		<?php
		if ( $this->data['isBetaGroupMember'] ) {
			$this->navigationEnd();
		}
		?>
	<!--[if gt IE 7]><!-->
		<?php $this->html( 'bottomScripts' ) ?>
	<script type='text/javascript'>
	window.onload = function() {
		MobileFrontend.init();
	};
	</script>
	<!--><![endif]-->
	</body>
	</html><?php
	}

	public function navigationStart() {
		?>
		<div id="mw-mf-viewport">
		<div id="mw-mf-page-left">
		<div id='mw-mf-content-left'>
		<ul id="mw-mf-menu-main">
			<li class='icon2'><a href="<?php $this->text( 'mainPageUrl' ) ?>#mw-mf-page-left">
				<?php $this->msg( 'mobile-frontend-main-menu-featured' ) ?></a></li>
			<li class='icon3'>
				<a href="<?php $this->text( 'randomPageUrl' ) ?>#mw-mf-page-left" id="randomButton" class="button">
					<?php $this->msg( 'mobile-frontend-random-button' ) ?>
				</a>
			</li>
			<li class='icon4 disabled'><?php $this->msg( 'mobile-frontend-main-menu-nearby' ) ?></li>
			<li class='icon5'>
				<a href="<?php $this->text( 'leaveFeedbackURL' ) ?>#mw-mf-page-left">
					<?php $this->msg( 'mobile-frontend-main-menu-contact' ) ?>
				</a>
			</li>
			<li class='icon6 disabled'><?php $this->msg( 'mobile-frontend-main-menu-settings' ) ?></li>
		</ul>
		</div>
		</div>
		<div id='mw-mf-page-center'>
		<?php
	}

	public function navigationEnd() {
		//close #mw-mf-page-center then viewport;
		?>
		</div>
		</div>
		<?php
	}

	public function prepareData() {
		global $wgExtensionAssetsPath, $wgScriptPath, $wgMobileFrontendLogo;

		wfProfileIn( __METHOD__ );
		$this->setRef( 'wgExtensionAssetsPath', $wgExtensionAssetsPath );
		if ( $this->data['wgAppleTouchIcon'] !== false ) {
			$link = Html::element( 'link', array( 'rel' => 'apple-touch-icon', 'href' => $this->data['wgAppleTouchIcon'] ) );
		} else {
			$link = '';
		}
		$this->set( 'touchIcon', $link );
		$hookOptions = isset( $this->data['hookOptions']['toggle_view_desktop'] ) ? 'toggle_view_desktop' : '';

		$jsconfig = array(
			'messages' => array(
				'expand-section' => wfMsg( 'mobile-frontend-show-button' ),
				'collapse-section' => wfMsg( 'mobile-frontend-hide-button' ),
				'remove-results' => wfMsg( 'mobile-frontend-wml-back' ), //@todo: use a separate message
				'mobile-frontend-search-noresults' => wfMsg( 'mobile-frontend-search-noresults' ),
				'contents-heading' => wfMsg( 'mobile-frontend-page-menu-contents-heading' ),
				'language-heading' => wfMsg( 'mobile-frontend-page-menu-language-heading' ),
			),
			'settings' => array(
				'scriptPath' => $wgScriptPath,
				'useFormatCookieName' => $this->data['useFormatCookieName'],
				'useFormatCookieDuration' => $this->data['useFormatCookieDuration'],
				'useFormatCookieDomain' => $this->data['useFormatCookieDomain'],
				'useFormatCookiePath' => $this->data['useFormatCookiePath'],
				'stopMobileRedirectCookieName' => $this->data['stopMobileRedirectCookieName'],
				'stopMobileRedirectCookieDuration' => $this->data['stopMobileRedirectCookieDuration'],
				'stopMobileRedirectCookieDomain' => $this->data['stopMobileRedirectCookieDomain'],
				'hookOptions' => $hookOptions,
			),
		);
		if ( $this->data['isMainPage'] ) {
			$jsconfig['messages']['empty-homepage'] = wfMsg( 'mobile-frontend-empty-homepage' );
			$firstHeading = '';
		} else {
			$firstHeading = Html::rawElement( 'h1', array( 'id' => 'firstHeading' ),
				$this->data['title']
			);
		}
		$this->set( 'jsConfig', FormatJSON::encode( $jsconfig ) );
		$this->set( 'firstHeading', $firstHeading );
		$this->set( 'wgMobileFrontendLogo', $wgMobileFrontendLogo );

		wfProfileOut( __METHOD__ );
	}

	private function searchBox() {
		if ( $this->data['hideSearchBox'] ) {
			return;
		}
		?>
	<div id="mw-mf-header">
		<?php
		if ( $this->data['isBetaGroupMember'] ) { ?>
			<a href="#mw-mf-page-left" id="mw-mf-main-menu-button">
				<img alt="menu"
				src="<?php $this->text( 'wgExtensionAssetsPath' ) ?>/MobileFrontend/stylesheets/images/blank.gif">
			</a>
		<?php
		}
		?>
			<form id="mw-mf-searchForm" action="<?php $this->text( 'scriptUrl' ) ?>" class="search_bar" method="get">
			<?php
				if ( !$this->data['hideLogo'] ) { ?>
				<img width="35" height="22" alt="Logo" id="mw-mf-logo" src="<?php
					$this->text( 'wgMobileFrontendLogo' ) ?>" />
			<?php
				}
			?>
			<input type="hidden" value="Special:Search" name="title" />
			<div id="mw-mf-sq" class="divclearable">
				<input type="search" name="search" id="mw-mf-search" size="22" value="<?php $this->text( 'searchField' )
					?>" autocomplete="off" maxlength="1024" class="search"
					placeholder="<?php $this->msg( 'mobile-frontend-placeholder' ) ?>"
					/>
				<img src="<?php $this->text( 'wgExtensionAssetsPath' ) ?>/MobileFrontend/stylesheets/images/blank.gif" alt="<?php
					$this->msg( 'mobile-frontend-clear-search' ) ?>" class="clearlink" id="mw-mf-clearsearch" title="<?php
					$this->msg( 'mobile-frontend-clear-search' ) ?>"/>
			</div>
			<?php
			if ( !$this->data['isBetaGroupMember'] ) { ?>
			<button id='goButton' class='goButton' type='submit'>
				<img src="<?php $this->text( 'wgExtensionAssetsPath' ) ?>/MobileFrontend/stylesheets/images/blank.gif" alt="<?php
					$this->msg( 'mobile-frontend-search-submit' ) ?>" title="<?php $this->msg( 'mobile-frontend-search-submit' ) ?>">
			</button>
			<?php } ?>
		</form>
		<?php
		if ( $this->data['isBetaGroupMember'] ) { ?>
		<a href="#mw-mf-nav" id="mw-mf-page-menu-button">
		<img
			alt="page menu"
			src="<?php $this->text( 'wgExtensionAssetsPath' ) ?>/MobileFrontend/stylesheets/images/blank.gif">
		</a>
		<?php
		}
		?>
		<?php if ( !$this->data['hideLogo'] ) { ?>
		<?php if ( !$this->data['isBetaGroupMember'] ) { ?>
			<div class='nav' id='nav'>
			<b><?php $this->msg( 'mobile-frontend-language' ) ?></b><br/><?php $this->html( 'languageSelection' ) ?><br/>
			<a href="<?php $this->text( 'mainPageUrl' ) ?>" id="homeButton" class="button"><?php $this->msg( 'mobile-frontend-home-button' ) ?></a>
			<a href="<?php $this->text( 'randomPageUrl' ) ?>" id="randomButton" class="button"><?php $this->msg( 'mobile-frontend-random-button' ) ?></a>
			</div>
		</div>
		<?php } else {
		// close header first
		?>
		</div>
		<ul id="mw-mf-nav" class="sub-menu">
			<li class="item2" id="mw-mf-toc"><?php $this->msg( 'mobile-frontend-page-menu-contents' ) ?></li>
			<li class="item3" id="mw-mf-language"><?php $this->msg( 'mobile-frontend-page-menu-language' ) ?></li>
		</ul>
		<?php
		}
		}
		?>
	<?php if ( $this->data['isBetaGroupMember'] ) { ?>
	<div id="mw-mf-language-selection">
		<?php $this->msg( 'mobile-frontend-language' ) ?><br/>
		<?php $this->html( 'languageSelection' ) ?>
	</div>
	<?php } ?>
	<div id="results"></div>
	<?php
	}

	private function footer() {
		if ( $this->data['hideFooter'] ) {
			return;
		}

		?>
	<div id="footer">
		<?php
		// @todo: make license icon and text dynamic
		?>
	<h2 class="section_heading" id="section_footer">
		<?php $this->html( 'license' ) ?>
		<span class="toggleCopyright">
			<span class="more"><?php $this->msg( 'mobile-frontend-footer-more' ) ?></span><span class="less"><?php
			$this->msg( 'mobile-frontend-footer-less' ) ?></span>
		</span>
	</h2>
	<div class="content_block" id="content_footer">
		<ul class="settings">
			<li>
				<span class="left separator"><a href="<?php $this->text( 'viewNormalSiteURL' ) ?>"><?php
					$this->msg( 'mobile-frontend-view-desktop' ) ?></a></span><span class="right"><?php
				$this->msg( 'mobile-frontend-view-mobile' ) ?></span>
			</li>
			<li>
				<span class="left"><?php $this->msgHtml( 'mobile-frontend-terms-use' ) ?></span><span class="right"><?php
				$this->html( 'imagesToggle' ) ?></span>
			</li>
			<li class="notice">
				<?php $this->html( 'historyAndActivityLink' ) ?>
				<?php $this->msgHtml( 'mobile-frontend-footer-license' ) ?>
			</li>
		</ul>
		<ul class="links">
			<li>
				<a href="<?php $this->text( 'leaveFeedbackURL' ) ?>"><?php $this->msg( 'mobile-frontend-footer-contact' ) ?></a>
			</li><li>
			<?php $this->html( 'privacyLink' ) ?></li><li>
			<?php $this->html( 'aboutLink' ) ?></li><li>
			<?php $this->html( 'disclaimerLink' ) ?></li>
		</ul>
	</div>
	</div>
	<?php
	}
}
