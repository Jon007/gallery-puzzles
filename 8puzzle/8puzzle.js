(
	function () {
		var Blank, Puzzle, Tile,
			__bind = function (fn, me) {
		return function () {
			return fn.apply(me, arguments);
		};
	};

	Puzzle = (function () {
		function Puzzle(images) {
			var i, image, t, x, y, _i, _j, _len, _ref,
	_this = this;
			this.images = images;
			this.changeImage = __bind(this.changeImage, this);
			this.switchTwo = __bind(this.switchTwo, this);
			this.renderBoard = __bind(this.renderBoard, this);
			this.blankPosition = __bind(this.blankPosition, this);
			this.checkIfWon = __bind(this.checkIfWon, this);
			this.mixup = __bind(this.mixup, this);
			this.places = [];
			this.initialPlaces = [];
			_ref = this.images;
			for (_i = 0, _len = _ref.length; _i < _len; _i++) {
				image = _ref[_i];
				jQuery('#previews').append('<img src="' + image + '" class="mini"/>');
			}

			this.image = this.images[0];
			jQuery('.mini').bind('click', function (event) {
				return _this.changeImage(event.target.src);
			});
			for (i = _j = 0; _j <= 7; i = ++_j) {
				x = Math.floor(i % 3) * 200;
				y = Math.floor(i / 3) * 200;
				t = new Tile(i, 200, 200, x, y, this.image);
				this.places.push(t);
			}

			this.places.push(new Blank(8));
			this.initialPlaces = this.places.slice(0);
			this.mixup();
		}

		Puzzle.prototype.mixup = function () {
			var blankpos, i, randomNum, _i, _results;
			blankpos = this.blankPosition();
			if (!	blankpos ){blankpos = 8;}
			_results = [];
			for (i = _i = 0; _i <= 100; i = ++_i) {
				randomNum = Math.floor(Math.random() * 9);
				if ( (randomNum!=blankpos) && (this.switchTwo(randomNum, blankpos)) ){
					_results.push(blankpos = randomNum);
				}
			}

			return _results;
		};

		Puzzle.prototype.checkIfWon = function () {
			var i, _i;
			for (i = _i = 0; _i <= 8; i = ++_i) {
				if (this.places[i] === this.initialPlaces[i]) {
					continue;
				} else {
					return false;
				}
			}

			return true;
		};

		Puzzle.prototype.blankPosition = function () {
			var place, pos, _i, _len, _ref;
			_ref = this.places;
			for (pos = _i = 0, _len = _ref.length; _i < _len; pos = ++_i) {
				place = _ref[pos];
				if (place["class"] === 'Blank') {
					return pos;
				}
			}
		};

		Puzzle.prototype.renderBoard = function () {
			var blank, t, _i, _len, _ref,
	_this = this;
			blank = this.blankPosition();
			jQuery('#canvas').html('');
			if (this.checkIfWon()) {
				jQuery('#canvas').append('<span id="windiv"><img src="' + this.image + '"/><div class="banner"> You Won!</div></span>');
				return jQuery('#windiv').show('slow');
			} else {
				_ref = this.places;
				for (_i = 0, _len = _ref.length; _i < _len; _i++) {
					t = _ref[_i];
					t.show(blank);
				}

				return jQuery('.clickable').bind('click', function (event) {
					var toSwitch;
					toSwitch = parseInt(event.target.id);
					return _this.switchTwo(toSwitch, _this.blankPosition());
				});
			}
		};

		Puzzle.prototype.switchTwo = function (pos1, pos2) {
			var x, y;
			x = this.places[pos1];
			y = this.places[pos2];
		  var allowSwap = false;
			//debugger;
			if ((x["class"] === 'Blank') && y.isAdjacent(pos1)){
				allowSwap = true;
			}
	    if ((y["class"] === 'Blank') && x.isAdjacent(pos2)) {
				allowSwap = true;
			}
			if (allowSwap){
				this.places[pos2] = x;
				this.places[pos1] = y;
				this.places[pos2].position = pos2;
				return this.renderBoard();
			} else {
				return false;
			}
		};

		Puzzle.prototype.changeImage = function (image) {
			var panel, _i, _len, _ref;
			this.image = image;
			_ref = this.places;
			for (_i = 0, _len = _ref.length; _i < _len; _i++) {
				panel = _ref[_i];
				if (panel["class"] !== 'Blank') {
					panel.image = image;
				}
			}
      this.mixup();

			return this.renderBoard();
		};

		return Puzzle;

	})();

	Tile = (function () {
		function Tile(position, width, height, x, y, image) {
			this.position = position;
			this.width = width;
			this.height = height;
			this.x = x;
			this.y = y;
			this.image = image;
			this["class"] = 'Tile';
		}

		Tile.prototype.show = function (blankPosition) {
			if (this.isAdjacent(blankPosition)) {
				jQuery('#canvas').append('<div id="' + this.position + '" class="innerSquare imageSquare clickable"></div>');
			} else {
				jQuery('#canvas').append('<div id="' + this.position + '" class="innerSquare imageSquare"></div>');
			}
			jQuery("#" + this.position).css('background-position', '-' + this.x + 'px -' + this.y + 'px');
			return jQuery("#" + this.position).css('background-image', 'url(' + this.image + ')');
		};

		Tile.prototype.isAdjacent = function (blanksPosition) {
			//debugger;
			if (blanksPosition - 1 === this.position && (blanksPosition % 3) > 0 || blanksPosition + 1 === this.position && (blanksPosition % 3) < 2 || blanksPosition + 3 === this.position && (blanksPosition / 3) < 2 || blanksPosition - 3 === this.position && (blanksPosition / 3) > 0) {
				return true;
			}
			return false;
		};

		Tile.prototype.setImage = function (image) {
			return this.image = image;
		};

		return Tile;

	})();

	Blank = (function () {
		function Blank(position) {
			this.position = position;
			this["class"] = 'Blank';
		}

		Blank.prototype.show = function () {
			return jQuery('#canvas').append('<div class="innerSquare blank"></div>');
		};

		return Blank;

	})();

	jQuery(document).ready(function () {
		var imgs, puzzle;
		imgs = ['https://www.inkston.com/wp-content/uploads/2016/08/red-cottonrose-768x760.jpg', 'http://www.inkston.com/wp-content/uploads/2017/06/bu-ke-weng_102-766x768.jpg', 'https://www.inkston.com/wp-content/uploads/2017/02/hui-zhou-houses-68-by-68-cm-2013-768x766.png', 'https://www.inkston.com/wp-content/uploads/2017/02/passing-shadow-original-chinese-calligraphic-1991-69x69cm.jpg'];
		if (window.puzzlepics){
			imgs = window.puzzlepics;
		}
		var img = getUrlParameter('img');
		if (img){imgs.unshift(img);}
		return puzzle = new Puzzle(imgs);
	});

}).call(this);

  function getUrlParameter(name) {
      name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
      var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
      var results = regex.exec(location.search);
      return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }
