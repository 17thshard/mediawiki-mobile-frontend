<?php

/**
 * MobileCollection.php
 */

/**
 * A collection of pages, which are represented by the MobilePage class.
 */
class MobileCollection implements IteratorAggregate, Countable {

	/**
	 * The internal collection of pages.
	 *
	 * @var MobilePage[]
	 */
	protected $pages = [];

	/**
	 * Return size of the collection
	 */
	public function count() {
		return count( $this->pages );
	}

	/**
	 * Adds a page to the collection.
	 *
	 * @param MobilePage $page
	 */
	public function add( MobilePage $page ) {
		$this->pages[] = $page;
	}

	public function getIterator() {
		return new ArrayIterator( $this->pages );
	}
}
