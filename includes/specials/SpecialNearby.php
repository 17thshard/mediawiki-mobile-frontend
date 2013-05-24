<?php

class SpecialNearby extends UnlistedSpecialMobilePage {
	public function __construct() {
		parent::__construct( 'Nearby' );
	}

	public function execute( $par = '' ) {
		$this->setHeaders();

		$output = $this->getOutput();
		// add previews to mobile only
		$ctx = MobileContext::singleton();
		if ( $ctx->shouldDisplayMobileView() && $ctx->isBetaGroupMember() ) {
			$output->addModules( 'mobile.nearby.previews' );
			if ( $ctx->isAlphaGroupMember() ) {
				$output->addModules( 'mobile.nearby.watchstar' );
			}
		};

		$output->setPageTitle( wfMessage( 'mobile-frontend-nearby-title' )->escaped() );

		$html =
			Html::openElement( 'div',
				array(
					'id' => 'mw-mf-nearby',
				)
			) .
			Html::openElement( 'div',
				array(
					'class' => 'noscript error alert',
				)
			) .
			Html::openElement( 'div',
				array(
					'class' => 'content',
				)
			) .
			Html::element( 'h2', array(),
				wfMessage( 'mobile-frontend-nearby-requirements' ) ) .
			Html::element( 'p', array(),
				wfMessage( 'mobile-frontend-nearby-requirements-guidance' ) ) .
			Html::closeElement( 'div' ) . // .content
			Html::closeElement( 'div' ) . // .noscript
			Html::closeElement( 'div' ); // #mw-mf-nearby

		$output->addHTML( $html );
	}
}
