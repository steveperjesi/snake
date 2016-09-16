var w = parseInt(document.getElementById('board').width);
    h = parseInt(document.getElementById('board').height);

var game = {
		options: {
			BG_COLOR: '#fff',
			STROKE: '#000',
			CUR_SCORE: 0,
			CUR_DIRECTION: 'r',
			POINT_INC: 10,
			LEVEL: 1,
		},
		levels: {
			'1': {
				SIZE: 3,
				FPS: 10,
				LEVEL: 1
			},
			'2': {
				SIZE: 5,
				FPS: 11,
				LEVEL: 2
			},
			'3': {
				SIZE: 7,
				FPS: 12,
				LEVEL: 3
			}
		},
		HIGHSCORES: [],
		SIZE: 0,
		BG_COLOR: '',
		STROKE: '',
		CUR_SCORE: 0,
		CUR_DIRECTION: '',
		POINT_INC: 0,
		FPS: 0,
		LEVEL: 0,
		GRID_W: 0,
		GRID_H: 0,
		GRID: null,
		CONTEXT: null,
		PLAYING: false,
		PAUSED: false,
		LOOP_INTVL: null,
		LOC_STORE: false,
		BODY: [],
		FOOD: {},
		init: function(elem, w, h) {
			if (!w || w === 0 || w === 'NaN') {
				alert('You broke it');
				return false;
			}

			if (typeof(Storage) !== "undefined") {
				this.LOC_STORE = true;
			}

			this.GRID = document.getElementById(elem);
			this.CONTEXT = this.GRID.getContext('2d');
			this.GRID_W = w;
			this.GRID_H = h;

			this.initBoard();

			this.GRID.onclick = function() {
				game.play();
			}

		},
		initBoard: function() {
			_.extend(this, this.options, this.levels[this.LEVEL]);
			this.BODY = [];
			this.FOOD = {};
			this.PAUSED = false;
			this.displayScore();
			this.showGameover(false);
			this.showHighScores();
		},
		get direction() {
			return this.CUR_DIRECTION;
		},
		set direction(dir) {
			if (this.PLAYING) this.CUR_DIRECTION = dir;
		},
		set pause(state) {
			this.PAUSED = state;
			this.showPause(state);
			if (state) {
				this.stop();
			} else {
				this.start();
			}
		},
		showPause: function(state) {
			if (state && this.PLAYING) {
				document.getElementById('pause-status').style.display = 'block';
			} else {
				document.getElementById('pause-status').style.display = 'none';
			}
		},
		get pause() {
			return this.PAUSED;
		},
		set addScore(points) {
			this.CUR_SCORE += points;
			this.FPS = this.FPS * 1.1;	// Must go faster...
			this.displayScore();
		},
		get score() {
			return this.CUR_SCORE;
		},
		displayScore: function() {
			document.getElementById('score').innerHTML = this.CUR_SCORE;
		},
		gameOver: function() {
			this.stop();
			var cntx = this.CONTEXT;
			cntx.fillStyle = this.BG_COLOR;
			cntx.fillRect(0,this.SIZE, this.GRID_W, this.GRID_H);
			this.setHighScore();
			this.showHighScores();
			this.showGameover(true);
		},
		showGameover: function(state) {
			if (state) {
				document.getElementById('gameover-status').style.display = 'block';
			} else {
				document.getElementById('gameover-status').style.display = 'none';
			}
		},
		levelSelect: function(level) {
			this.LEVEL = parseInt(level);
		},
		snake: function() {
			for (var i = this.SIZE - 1; i >= 0; i--) {
				this.BODY.push({x: i, y: 1});
			}
		},
		food: function (x, y) {
			if (!x) {
				x = Math.round(Math.random()*(this.GRID_W - this.SIZE) / this.SIZE);
			}
			if (!y) {
				y = Math.round(Math.random()*(this.GRID_H - this.SIZE) / this.SIZE);
			}
			this.FOOD = {
				x: x,
				y: y
			};
			this.draw(this.FOOD.x, this.FOOD.y, 'green');
		},
		play: function() {
			this.initBoard();
			this.food();
			this.snake();
	    this.start();
		},
		start: function() {
			this.PLAYING = true;
			this.LOOP_INTVL = requestAnimationFrame(this.render);
		},
		stop: function() {
			this.PLAYING = false;
		},
		render: function() {
			// Runs on interval
			console.log(game.FPS);
			if (game.PLAYING && game.FPS) {
				setTimeout(function() {
					requestAnimationFrame(game.render);
				}, 1000 / game.FPS);
			}

			var cntx = game.CONTEXT;
			cntx.fillStyle = game.BG_COLOR;
			cntx.fillRect(0,0,game.GRID_W,game.GRID_H);
			// cntx.strokeStyle = this.STROKE;

			var sx = game.BODY[0].x,
					sy = game.BODY[0].y;

			if (game.CUR_DIRECTION === 'u') sy--;
			if (game.CUR_DIRECTION === 'r') sx++;
			if (game.CUR_DIRECTION === 'd') sy++;
			if (game.CUR_DIRECTION === 'l') sx--;

			if (game.checkCollision(sx, sy)) {
				console.log('render collision check', sx, sy);
				game.gameOver();
				return;
			}

	    if (sx == game.FOOD.x && sy == game.FOOD.y) {
	    	// Ate food, extend snake
	      var tail = {x: sx, y: sy};
	      game.addScore = game.POINT_INC;
	      game.food();	// add more food
	    } else {
	      var tail = game.BODY.pop();
	      tail.x = sx;
	      tail.y = sy;
	      game.food(game.FOOD.x, game.FOOD.y);	// Keep the food where it is on redraw
	    }
	    
	    game.BODY.unshift(tail);

	    for (var i = 0; i < game.BODY.length; i++) {
	      var s = game.BODY[i];
	      game.draw(s.x, s.y, '#f00');
	    }
		},
		checkCollision: function(sx, sy) {
			// Return true on collision
			if (this.PLAYING) {
				if (sx === -1 || sy === -1) return true;
				if (sx === (this.GRID_W / this.SIZE) || sy === (this.GRID_H / this.SIZE)) return true;

				// if the snake head (sx, sy) exists in the snake body
		    for(var i = 0; i < this.BODY.length; i++) {
		      if (this.BODY[i].x === sx && this.BODY[i].y === sy) return true;
		    }
			}
	    return false;
		},
		draw: function(x, y, color) {
			var cntx = this.CONTEXT;
			if (!color || typeof color === 'undefined') color = '#ccc';

	    cntx.fillStyle = color;
	    cntx.fillRect(x * this.SIZE, y * this.SIZE, this.SIZE, this.SIZE);
	    cntx.strokeStyle = this.BG_COLOR;
	    cntx.strokeRect(x * this.SIZE, y * this.SIZE, this.SIZE, this.SIZE);
		},
		getHighScores: function() {
			if (this.LOC_STORE) {
				if (localStorage.getItem("highScores")) {
					return JSON.parse(localStorage.getItem("highScores"));
				} else {
					return [];
				}
			} else {
				return [];
			}
		},
		setHighScore: function() {
			if (this.LOC_STORE && this.CUR_SCORE > 0) {
				var hs = this.getHighScores();
				var score = {
					'score': this.CUR_SCORE,
					'date': new Date().getTime()
				};
				hs.push(score);
				var sorted = _.sortBy(hs, 'score');
				localStorage.setItem("highScores", JSON.stringify(sorted.reverse()));
				this.showHighScores();
			}
		},
		showHighScores: function() {
			this.HIGHSCORES = this.getHighScores();
			var num = this.HIGHSCORES.length;
			if (num > 0) {
				if (num > 5) num = 5;
				var scores = '<b>Top 5 High Scores</b><ol>';
				for (var i = 0; i < num; i++) {
					var when = moment(this.HIGHSCORES[i].date);
					scores += '<li><b>'+this.HIGHSCORES[i].score+'</b><span class="high-score-date">'+when.format('llll')+'</span></li>';
				}
				scores += '</ol>';
				document.getElementById('high-score-container').innerHTML = scores;
			}

		}
}


document.onkeydown = function(e) {
	// console.log('onkeydown', e.keyCode, game.direction);
	var ignore = false;
	if (e && e.keyCode) {
		switch (e.keyCode) {
			case 38:
				ignore = true;
				if (game.direction === 'u' || game.direction === 'd') return;
				game.direction = 'u';
				break;
			case 39:
				ignore = true;
				if (game.direction === 'r' || game.direction === 'l') return;
				game.direction = 'r';
				break;
			case 40:
				ignore = true;
				if (game.direction === 'd' || game.direction === 'u') return;
				game.direction = 'd';
				break;
			case 37:
				ignore = true;
				if (game.direction === 'l' || game.direction === 'r') return;
				game.direction = 'l';
				break;
			case 32:
				// Pause
				ignore = true;
				game.pause = !game.PAUSED;
				break;
		}
	}
	if (ignore) e.preventDefault();

}
