<?php
/**
 * InlineDifferenceEngine.php
 */

/**
 * Extends the basic DifferenceEngine from core to enable inline difference view
 * using only one column instead of two column diff system.
 */
class InlineDifferenceEngine extends DifferenceEngine {
	/**
	 * Checks whether the given Revision was deleted
	 * @todo FIXME: Upstream to DifferenceEngine - refactor showDiffPage
	 *
	 * @return bool
	 */
	public function isDeletedDiff() {
		return $this->mNewRev && $this->mNewRev->isDeleted( Revision::DELETED_TEXT );
	}

	/**
	 * Checks whether the given Revision was deleted or if it is delete
	 * restricted.
	 * FIXME: Upstream to DifferenceEngine - refactor showDiffPage
	 *
	 * @return bool
	 */
	public function isSuppressedDiff() {
		return $this->isDeletedDiff() &&
			$this->mNewRev->isDeleted( Revision::DELETED_RESTRICTED );
	}

	/**
	 * Checks whether the current user has permission to view the old
	 * and current revisions.
	 * @todo FIXME: Upstream to DifferenceEngine - refactor showDiffPage
	 *
	 * @return bool
	 */
	public function isUserAllowedToSee() {
		$user = $this->getUser();
		$allowed = $this->mNewRev->userCan( Revision::DELETED_TEXT, $user );
		if ( $this->mOldRev &&
			!$this->mOldRev->userCan( Revision::DELETED_TEXT, $user )
		) {
			$allowed = false;
		}
		return $allowed;
	}

	/**
	 * Render the inline difference between two revisions
	 * using InlineDiffEngine
	 * @throws MWException If the content is not an instance of TextContent and
	 * wgContentHandlerTextFallback was set to 'fail'.
	 *
	 * @param bool $diffOnly diff only?
	 */
	public function showDiffPage( $diffOnly = false ) {
		$output = $this->getOutput();

		$prevId = $this->getOldid();
		$unhide = (bool)$this->getRequest()->getVal( 'unhide' );
		$diff = $this->getDiffBody();

		$rev = Revision::newFromId( $this->getNewid() );

		if ( !$prevId ) {
			$audience = $unhide ? Revision::FOR_THIS_USER : Revision::FOR_PUBLIC;
			$diff = '<ins>'
				. nl2br(
					htmlspecialchars(
						ContentHandler::getContentText( $rev->getContent( $audience ) )
					)
				)
				. '</ins>';
		}

		$warnings = $this->getWarningMessageText();
		if ( $warnings ) {
			$warnings = MobileUI::warningBox( $warnings );
		}
		$output->addHTML(
			$warnings .
			'<div id="mw-mf-minidiff">' .
			$diff .
			'</div>'
		);

		$output->addHTML( Html::rawElement(
			'div',
			[
				'class' => 'patrollink'
			],
			$this->getPatrolledLink()
		) );
	}

	/**
	 * Checks whether the diff should be hidden from the current user
	 * This is based on whether the user is allowed to see it and whether
	 * the flag unhide is set to allow viewing deleted revisions.
	 * @todo FIXME: Upstream to DifferenceEngine - refactor showDiffPage
	 *
	 * @return bool
	 */
	public function isHiddenFromUser() {
		return $this->isDeletedDiff() && ( !$this->unhide || !$this->isUserAllowedToSee() );
	}

	/**
	 * Returns warning messages in situations where a revision cannot be viewed by a user
	 * explaining to them why.
	 * Returns empty string when the revision can be viewed.
	 *
	 * @return string
	 */
	public function getWarningMessageText() {
		$msg = '';
		if ( $this->isHiddenFromUser() ) {
			$allowed = $this->isUserAllowedToSee();
			$suppressed = $this->isSuppressedDiff();

			// This IContextSource object will be used to get a message object for the
			// messages used in this function. We need to to this to allow the message to
			// get the correct value for the FULLPAGENAME inclusion (which is used in
			// rev-suppressed-no-diff, e.g.). Otherwise it would use Special:MobileDiff as
			// the target for Special:Log/delete?page=Special:MobileDiff/..., which isn't
			// correct and very helpful. To fix this bug, we create a new context from the
			// current one and set the title object (which we can get from the new revision).
			// Bug: T122984
			$context = new DerivativeContext( $this->getContext() );
			$revision = $this->mNewRev;
			$context->setTitle( $revision->getTitle() );

			if ( !$allowed ) {
				$msg = $context->msg(
					$suppressed ? 'rev-suppressed-no-diff' : 'rev-deleted-no-diff'
				)->parse();
			} else {
				// Give explanation and add a link to view the diff...
				$query = $this->getRequest()->appendQueryValue( 'unhide', '1' );
				$link = $this->getTitle()->getFullURL( $query );
				$msg = $context->msg(
					$suppressed ? 'rev-suppressed-unhide-diff' : 'rev-deleted-unhide-diff',
					$link
				)->parse();
			}
		}
		return $msg;
	}

	/**
	 * Creates an inline diff
	 * @param Content $otext Old content
	 * @param Content $ntext New content
	 * @throws \MediaWiki\Diff\ComplexityException
	 *
	 * @return string
	 */
	public function generateTextDiffBody( $otext, $ntext ) {
		global $wgContLang;

		// First try wikidiff2
		if ( function_exists( 'wikidiff2_inline_diff' ) ) {
			$text = wikidiff2_inline_diff( $otext, $ntext, 2 );
			$text .= $this->debug( 'wikidiff2-inline' );

			return $text;
		}

		// Else slow native PHP diff
		$ota = explode( "\n", $wgContLang->segmentForDiff( $otext ) );
		$nta = explode( "\n", $wgContLang->segmentForDiff( $ntext ) );
		$diffs = new Diff( $ota, $nta );
		$formatter = new InlineDiffFormatter();
		return $wgContLang->unsegmentForDiff( $formatter->format( $diffs ) );
	}

	/**
	 * @inheritDoc
	 */
	protected function getDiffBodyCacheKeyParams() {
		$params = parent::getDiffBodyCacheKeyParams();
		$params[0] = 'inline-diff';

		return $params;
	}

	/**
	 * Create a getter function for the patrol link in Mobile Diff.
	 * FIXME: This shouldn't be needed, but markPatrolledLink is protected in DifferenceEngine
	 * @return String
	 */
	public function getPatrolledLink() {
		$linkInfo = $this->getMarkPatrolledLinkInfo();
		if ( $linkInfo ) {
			$linkInfo = Html::linkButton(
				$this->msg( 'markaspatrolleddiff' )->escaped(),
				[
					'href' => $this->mNewPage->getLocalURL( [
						'action' => 'markpatrolled',
						'rcid' => $linkInfo['rcid'],
					] ),
				]
			);
		}
		return $linkInfo;
	}

}
