<?php

class Demo {

	public function first($x) {
		if ($x > 0) {
			return true;
		}
		else {
			return false;
		}
	}

	public function second() {
		return 42;
	}

	public function third() {
		if ($a < 1) { // if it's negative or 0
			return false;
		}
		else { // if it's positive
			return true;
		}
	}
}
