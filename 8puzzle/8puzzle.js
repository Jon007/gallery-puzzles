(
	function () {
		var Blank, Puzzle, Tile,
			__bind = function (fn, me) {
		return function () {
			return fn.apply(me, arguments);
		};
	};

	//Puzzle object controls game
	Puzzle = (function () {
		function Puzzle(images) {
			var i, image, t, x, y, _i, _j, _len, _ref,
			_this = this;

			//image previews
			this.images = images;
			_ref = this.images;
			for (_i = 0, _len = _ref.length; _i < _len; _i++) {
				image = _ref[_i];
				jQuery('#previews').append('<img src="' + image + '" class="mini"/>');
			}

			//this functions
			this.changeImage = __bind(this.changeImage, this);
			this.switchTwo = __bind(this.switchTwo, this);
			this.renderBoard = __bind(this.renderBoard, this);
			this.checkIfWon = __bind(this.checkIfWon, this);
			this.mixup = __bind(this.mixup, this);

			//user interface buttons
			jQuery('.mini').bind('click', function (event) {
				return _this.changeImage(event.target.src);
			});
			jQuery('#undo').bind('click', function (event) {
				return _this.undo();
			});
			jQuery('#solve').bind('click', function (event) {
				return _this.solve(_this);
			});
			jQuery('#restart').bind('click', function (event) {
				return _this.restart(_this);
			});
			jQuery('#puzzle-difficulty').bind('change', function (event) {
				return _this.resetLevel(_this);
			});

			//set up the game
			this.changeImage(this.images[0]);
		}

		/**
		 * Move numbers 0 to this.movesToSolve (difficulty level) are part of initial shuffle
		 * this.startMove represents start of actual game
		 * So, undo, restart and solve vary mainly in the number of moves to undo (1, length-startMove, all)
		 */
		Puzzle.prototype.undo = function ( ) {
			if (this.moves.length -1 > this.startMove){ 
				this.undoInternal(this);
			} else {
				alert('you are already at the beginning!');
			}
			this.renderButtons();
		}
		/**
		 * core undo function reused by  undo, restart and solve
		 */
		Puzzle.prototype.undoInternal = function (_this) {
			if (_this.moves.length > 0){ 
				var previousMove = _this.moves.pop();
				if (_this.switchTwo( previousMove[1], previousMove[0])){
					//switchTwo adds a new move if switch is allowed, so remove it again:
					_this.moves.pop();
				} 
			}
		}
		/**
		 * undo all moves to solve the picture, animated to show solution to user
		 */
		Puzzle.prototype.solve = function ( _this ) {
			if (_this.moves.length > 0){
				_this.undoInternal(_this);
				setTimeout(function() { _this.solve(_this) }, 500); 
			} else {
				_this.renderButtons();				
			}
		}
		/**
		 * undo all moves back to start move, or if no start move, reshuffle
		 */
		Puzzle.prototype.restart = function ( _this ) {
			if (_this.moves.length -1 > _this.startMove){
				_this.restartInternal(_this);
			} else {
				_this.mixup(this.movesToSolve);
			}
		}
		Puzzle.prototype.restartInternal = function ( _this ) {
			if (_this.moves.length -1 > _this.startMove){
				_this.undoInternal(_this);
				setTimeout(function() { _this.restartInternal(_this) }, 200); 
			} else {
				_this.renderButtons();				
			}
		}
		/**
		 * called from selector and when restarting each game, to pick up current level
		 */
		Puzzle.prototype.resetLevel = function ( _this ) {
			selectDifficulty = document.getElementById("puzzle-difficulty"); 
			if (selectDifficulty){
				difficultyLevel = document.getElementById("puzzle-difficulty").value;
				try{
					this.movesToSolve = parseInt(difficultyLevel);
				} catch(e){
					this.movesToSolve = 10;
				}
				_this.mixup(this.movesToSolve);
				return true;
			}
			this.movesToSolve = 10;
			this.mixup(this.movesToSolve);
			return false;
		}
			
		/**
		 * starting from solution, create random moves up to the difficulty level
		 */
		Puzzle.prototype.mixup = function ( numMoves ) {
			var i, randomNum, _i, _results;
			for (i = _i = 0; _i <= 300; i = ++_i) {
				randomNum = Math.floor(Math.random() * 9);

				//disallow moves which are the reverse of previous move
				//(with corner square 50% probability of creating back and forth move which doesn't add to puzzle)
				if ( this.moves.length > 0 ) {
					var proposedMove = randomNum + ',' + this.blankSquare;
					var previousMove = this.moves[this.moves.length -1];
					previousMoveReversed = previousMove[1] + ',' + previousMove[0];
					if (proposedMove==previousMoveReversed){
						continue;
					}
				}
				//same switching function as used for user interaction, with display update suppressed
				this.switchTwo(randomNum, this.blankSquare, true);
				//break out of loop once identified suitable number of moves
				if (this.moves.length >= numMoves){break;} 
			}
			this.startMove = this.moves.length -1;
			//moves were done without rendering so render all now
			this.renderBoard();
			this.renderButtons();
			return this.startMove;
		};

		/**
		 * compare current position of all pieces with starting [solved] position to determine if solved 
		 */
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

		/**
		 * full render of board 
		 */
		Puzzle.prototype.renderBoard = function () {
			var blank, t, _i, _len, _ref,
			_this = this;
			blank = this.blankSquare;

			//this is a full render destroying previous tile display (reliable but not good for animation)
			jQuery('#canvas').html('');
			_ref = this.places;
			for (_i = 0, _len = _ref.length; _i < _len; _i++) {
				t = _ref[_i];
				t.show(this.canMove(t.position, this.blankSquare));
			}

			//if solved, show solved result after timeout to allow last move to display
			if (this.checkIfWon()) {
				setTimeout(function() { _this.showWin() }, 500); 
			} else {
				//if not solved, bind the moveable squares
				jQuery('.clickable').bind('click', function (event) {
					var child = event.target;
					var parent = child.parentNode;
					var toSwitch = Array.prototype.indexOf.call(parent.children, child);
					return _this.switchTwo(toSwitch, _this.blankSquare);
				});
			}
			return true;
		};

		/**
		 * replace puzzle display with solved picture display
		 */
		Puzzle.prototype.showWin = function(){
			jQuery('#canvas').html('');
			jQuery('#canvas').append('<span id="windiv"><img src="' + this.image + '"/><div class="banner"> Solved!</div></span>');
			return jQuery('#windiv').show('slow');
		};

		/**
		 * update enabled/disabled status of buttons
		 */
		Puzzle.prototype.renderButtons = function(){
			btnUndo = document.getElementById('undo');
			if (btnUndo){
				if (this.moves.length-1 < this.startMove +1){
					btnUndo.setAttribute("disabled", "disabled")
				} else {
					btnUndo.removeAttribute("disabled")
				}			
			}
			btnSolve = document.getElementById('solve');
			if (btnSolve){
				if (this.moves.length==0){
					btnSolve.setAttribute("disabled", "disabled")
				} else {
					btnSolve.removeAttribute("disabled")
				}
			}
			spnMove = jQuery('#puzzle-move');
			if (spnMove){
				spnMove.text('Moves made: ' + Math.abs(this.moves.length - this.startMove -1));
			}
		}

		/**
		 * if the move is valid, 
		 *   switch the tile objects in the places array
		 *   add the move to the moves array
		 *   redisplay unless display update is suppressed
		 * @param {Number} pos1 Tile to move
		 * @param {Number} pos2 normally, the blank tile to swap with the moving tile
		 * @param {Bool} suppressRender suppress display update
		 * @return {Bool} returns true if move was accepted, false if not
		 */
		Puzzle.prototype.switchTwo = function (pos1, pos2, suppressRender) {
			var tile1, tile2;
			tile1 = this.places[pos1];
			tile2 = this.places[pos2];
			if (this.canMove(pos1, pos2)){
				this.places[pos2] = tile1;
				this.places[pos1] = tile2;
				this.places[pos1].position = pos1;
				this.places[pos2].position = pos2;
				this.moves.push( Array(pos1, pos2) );
				this.blankSquare = (this.blankSquare==pos1) ? pos2 : pos1;				
				if (! suppressRender){
					this.swapElements(pos1, pos2);
					//this.renderBoard();
					this.renderButtons();		
					if (this.checkIfWon()){
						this.renderBoard();
					}			
				}
				return true;
			} else {
				return false;
			}
		};

		/**
		 * Display the swap of two tiles without redisplaying entire board
		 * The idea was to switch the tiles only to be able to animate the movement
		 * But currently the tiles are dynamically positioned by floating, so moving any tile affects the whole layout
		 * in a way that prevents a smooth animation
		 * TODO: either a completely separate animated element, or complete rewrite of the display to fixed layout
		 *       so that the elements can move independently
		 */
		Puzzle.prototype.swapElements = function (pos1, pos2) {
			var canvas = document.getElementById('canvas');
			var obj1 = canvas.children[pos1];
			var obj2 = canvas.children[pos2];			

			// create marker element and insert it where obj1 is
			var temp = document.createElement("div");
			obj1.parentNode.insertBefore(temp, obj1);
		
			// move obj1 to right before obj2
			obj2.parentNode.insertBefore(obj1, obj2);
		
			// move obj2 to right before where obj1 used to be
			temp.parentNode.insertBefore(obj2, temp);
		
			// remove temporary marker node
			temp.parentNode.removeChild(temp);

			/*TODO: attempt to force reflow and animations			
			jQuery(obj1).fadeOut(500);
			obj1.getBoundingClientRect();
			jQuery(obj1).show('normal');
			*/

			//have to recalculate which elements are clickable
			for (index = 0; index < this.places.length; ++index) {
				//var curTile = document.getElementById(index);
				var curTile = canvas.children[index];
				if (this.canMove(this.places[index].position, this.blankSquare)){
					curTile.classList.add('clickable');
				} else {
					curTile.classList.remove('clickable');
				}
			}

			_this = this;
			//unbind click from all squares as some previously moveable now cannot move
			jQuery('.imageSquare').off('click');
			//and rebind only to those now clickable
			jQuery('.clickable').bind('click', function (event) {
				/* 
				 * NOTE: once moving the squares rather than redrawing all, the ids of the squares no longer match up
				 *       with their position
				 */
				//var toSwitch;
				//toSwitch = parseInt(event.target.id);
				var child = event.target;
				var parent = child.parentNode;
				var toSwitch = Array.prototype.indexOf.call(parent.children, child);
				return _this.switchTwo(toSwitch, _this.blankSquare);
			});
		}

		/**
		 * is the proposed move valid?
		 * @param {Number} pos1 Tile to move
		 * @param {Number} pos2 normally, the blank tile to swap with the moving tile
		 * @return {Bool} returns true if move is possible, false if not
		 * TODO: this function could be enhanced to return direction of move, for use with animations
		 */
		Puzzle.prototype.canMove = function (pos1, pos2) {
			blankPos = this.blankSquare;
			if (pos1 != blankPos && pos2!=blankPos){return false;}
			pieceToMove = (pos1 == this.blankSquare) ? pos2 : pos1;
			if (blankPos - 1 === pieceToMove && (blankPos % 3) > 0 || blankPos + 1 === pieceToMove && 
				(blankPos % 3) < 2 || blankPos + 3 === pieceToMove && (blankPos / 3) < 2 || 
				blankPos - 3 === pieceToMove && (blankPos / 3) > 0) {
				return true;
			}
			return false;
		};

		/**
		 * Reset the game internal data and board to use the new image
		 * @param {url} image url of image to use for the game
		 */
		Puzzle.prototype.changeImage = function (image) {
			this.places = [];
			this.initialPlaces = [];
			this.moves = [];
			this.startMove = 0;
			this.blankSquare = 8;
			jQuery('#canvas').html('');
			this.image = image;
			for (i = _j = 0; _j <= 7; i = ++_j) {
				x = Math.floor(i % 3) * 200;
				y = Math.floor(i / 3) * 200;
				t = new Tile(i, 200, 200, x, y, this.image);
				this.places.push(t);
			}
			this.places.push(new Blank(this.blankSquare));
			this.initialPlaces = this.places.slice(0);

			var panel, _i, _len, _ref;
			_ref = this.places;
			for (_i = 0, _len = _ref.length; _i < _len; _i++) {
				panel = _ref[_i];
				if (panel["class"] !== 'Blank') {
					panel.image = image;
				}
			}
			this.resetLevel(this);
			return this.renderBoard();
		};

		return Puzzle;
	})();

	//Tile object, simply knows how to display itself
	Tile = (function () {
		function Tile(position, width, height, x, y, image) {
			this.position = position;
			this.x = x;  //background position for image clip, not tile position
			this.y = y;
			this.image = image;
			this.shown = false;
		}

		Tile.prototype.show = function (blankPosition) {
			if (this.shown){
			} else {
				if (blankPosition){
				jQuery('#canvas').append('<div id="' + this.position + '" class="innerSquare imageSquare clickable"></div>');
			} else {
				jQuery('#canvas').append('<div id="' + this.position + '" class="innerSquare imageSquare"></div>');
			}
			jQuery("#" + this.position).css('background-position', '-' + this.x + 'px -' + this.y + 'px');
			return jQuery("#" + this.position).css('background-image', 'url(' + this.image + ')');
				
			}
		};

		Tile.prototype.setImage = function (image) {
			return this.image = image;
		};

		return Tile;
	})();

	//Blank, should be a type of Tile object, simply knows how to display itself
	Blank = (function () {
		function Blank(position) {
			this.position = position;
			this["class"] = 'Blank';
		}
		Blank.prototype.show = function () {
			return jQuery('#canvas').append('<div  id="' + this.position + '" class="innerSquare blank"></div>');
		};

		return Blank;
	})();

	//initialisation function: detects images using:
	//		window.puzzlepics array of urls set by another function 
	//		query parameter &img={url}
	//		default images from inkston.com
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

	//helper function for url parameter
	function getUrlParameter(name) {
		name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
		var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
		var results = regex.exec(location.search);
		return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
	}
