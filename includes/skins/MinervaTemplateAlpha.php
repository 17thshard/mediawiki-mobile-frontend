<?php
/**
 * MinervaTemplateAlpha.php
 */

/**
 * Alternative Minerva template sent to users who have opted into the
 * experimental (alpha) mode via Special:MobileOptions
 */
class MinervaTemplateAlpha extends MinervaTemplateBeta {
	/**
	 * @var string $searchPlaceHolderMsg Message used as placeholder in search input
	 */
	protected $searchPlaceHolderMsg = 'mobile-frontend-placeholder-alpha';

	/**
	 * Get button information to link to Special:Nearby to find articles
	 * (geographically) related to this
	 * @return array A map of the button's friendly name, "nearby", to its spec
	 *   if the button can be displayed.
	 */
	public function getNearbyButton() {
		$skin = $this->getSkin();
		$title = $skin->getTitle();

		if (
			!$skin->getMFConfig()->get( 'MFNearby' )
			|| !class_exists( 'GeoData' )
			|| !GeoData::getPageCoordinates( $title )
		) {
			return array();
		}

		return array(
			'nearby' => array(
				'attributes' => array(
					'href' => SpecialPage::getTitleFor( 'Nearby' )->getLocalUrl() . '#/page/' . $title->getText(),
					'class' => 'nearby-button',
				),
				'label' => wfMessage( 'mobile-frontend-nearby-sectiontext' )->text()
			),
		);
	}

	/**
	 * Get category button if categories are present
	 * @return array A map of the button's friendly name, "categories" to its
	 *   spec if the button can be displayed.
	 */
	public function getCategoryButton() {
		$skin = $this->getSkin();
		$categories = $skin->getCategoryLinks( false /* don't render the heading */ );

		if ( !$categories ) {
			return array();
		}

		return array(
			'categories' => array(
				'attributes' => array(
					'href' => '#/categories',
					// add hidden class (the overlay works only, when JS is enabled (class will
					// be removed in categories/init.js)
					'class' => 'category-button hidden',
				),
				'label' => wfMessage( 'categories' )->text()
			),
		);
	}

	/** @inheritdoc */
	protected function getSecondaryActions() {
		$result = parent::getSecondaryActions();
		$result += $this->getNearbyButton();
		$result += $this->getCategoryButton();

		return $result;
	}

	/**
	 * @inheritdoc
	 * Renders a search link and branding.
	 */
	protected function makeChromeHeaderContent( $data ) {
		$templateParser = new TemplateParser( __DIR__ .'/../../templates' );
		$args = array(
			'siteName' => SkinMinerva::getSitename(),
			'showSearchForm' => $this->isSpecialMobileMenuPage,
			'showTitle' => !$this->isSpecialMobileMenuPage,
		);

		if ( $this->isSpecialMobileMenuPage ) {
			$args += array(
				'mobileMenuClass' => 'js-only back ' . MobileUI::iconClass( 'back-mobilemenu' ),
				'mobileMenuLink' => '#back',
				'mobileMenuTitle' => wfMessage( 'mobile-frontend-main-menu-back' )->parse(),
				'searchForm' => $this->makeSearchForm( $data ),
			);
		} else {
			$args += array(
				'mobileMenuClass' => MobileUI::iconClass( 'search' ),
				'mobileMenuLink' => SpecialPage::getTitleFor( 'MobileMenu' )->getLocalUrl(),
				'mobileMenuTitle' => wfMessage( 'mobile-frontend-main-menu' )->parse(),
				'searchInputClass' => 'hidden',
			);
		}

		echo $templateParser->processTemplate( 'header', $args );
	}

	protected function getSearchAttributes() {
		$searchAttributes = parent::getSearchAttributes();
		$searchAttributes['class'] =  MobileUI::semanticClass( 'mw-ui-input', '', 'search' );

		return $searchAttributes;
	}

	/**
	 * @inheritdoc
	 */
	protected function makeSearchForm( $data ) {
		return Html::openElement( 'form',
				array(
					'action' => $data['wgScript'],
					'class' => 'search-box',
				)
			) .
			Html::openElement( 'div', array(
				'class' => MobileUI::iconClass( 'search-white', 'element',
					'fulltext-search no-js-only' ),
			) ) .
			$this->makeSearchButton( 'fulltext' ) .
			Html::closeElement( 'div' ) .
			Html::openElement( 'span' ) .
			$this->makeSearchInput( $this->getSearchAttributes() ) .
			Html::closeElement( 'span' ) .
			Html::closeElement( 'form' );
	}

	/**
	 * Render Header elements
	 * @param array $data Data used to build the header
	 */
	protected function renderHeader( $data ) {
		$this->makeChromeHeaderContent( $data );
		echo $data['secondaryButton'];
	}

	/**
	 * Renders the main menu.
	 *
	 * @param array $data Data used to build the page
	 */
	protected function renderMainMenu( $data ) {
		$className = $this->isSpecialMobileMenuPage ? '' : ' hidden';
		?>
		<nav class="<?php echo $className; ?>">
		<?php
		$this->renderMainMenuItems();
		?>
		</nav>
		<?php
	}

	/**
	 * Renders the contents of the main menu.
	 */
	protected function renderMainMenuItems() {
		?>
		<ul>
			<?php
				foreach ( $this->getDiscoveryTools() as $key => $val ) {
					echo $this->makeListItem( $key, $val );
				}
			?>
			</ul>
			<ul>
			<?php
				foreach ( $this->getPersonalTools() as $key => $val ){
					echo $this->makeListItem( $key, $val );
				}
			?>
			</ul>
			<ul class="hlist">
			<?php
				foreach ( $this->getSiteLinks() as $key => $val ) {
					echo $this->makeListItem( $key, $val );
				}
			?>
			</ul>
		<?php
	}

	/**
	 * Renders the page.
	 *
	 * The menu is included and hidden by default.
	 *
	 * @param array $data Data used to build the page
	 */
	protected function render( $data ) {
		echo $data[ 'headelement' ];
		?>
		<div id="mw-mf-viewport">
			<div class="header">
				<?php $this->renderHeader( $data ); ?>
			</div>
			<?php $this->renderMainMenu( $data ); ?>
			<div id="mw-mf-page-center">
				<?php
		foreach ( $this->data['banners'] as $banner ) {
			echo $banner;
		}
		?>
				<div id="content_wrapper">
					<?php $this->renderContentWrapper( $data ); ?>
				</div>
				<?php $this->renderFooter( $data ); ?>
			</div>
		</div>
		<?php
		echo $data['reporttime'];
		echo $data['bottomscripts'];
		?>
		</body>
		</html>
		<?php
	}
}
