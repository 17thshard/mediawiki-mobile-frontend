<?php
class MobileTemplateBeta extends MobileTemplate {
	protected $isMainPage;

	public function execute() {
		$this->isMainPage = $this->getSkin()->getTitle()->isMainPage();
		parent::execute();
	}

	public function renderPageActions( $data ) {
		if ( !$this->isMainPage ) {
			parent::renderPageActions( $data );
		}
	}

	protected function renderMetaSections() {
		echo Html::openElement( 'div', array( 'id' => 'page-secondary-actions' ) );

		// If languages are available, render a languages link
		if ( $this->data['language_urls'] ) {
			$languageUrl = SpecialPage::getTitleFor( 'MobileLanguages', $this->getSkin()->getTitle() )->getLocalURL();
			$languageLabel = wfMessage( 'mobile-frontend-language-article-heading' )->text();

			echo Html::element( 'a', array(
				'class' => 'button languageSelector',
				'href' => $languageUrl
				), $languageLabel );
		}

		echo Html::closeElement( 'div' );
	}

	protected function renderContentWrapper( $data ) {
		$this->renderHistoryLinkTop( $data );
		parent::renderContentWrapper( $data );
	}

	protected function renderHistoryLinkTop( $data ) {
		if ( !$this->isMainPage ) {
				$this->renderHistoryLink( $data );
		}
	}

	protected function renderHistoryLinkBottom( $data ) {
		if ( $this->isMainPage ) {
			parent::renderHistoryLinkBottom( $data );
		}
	}
}
