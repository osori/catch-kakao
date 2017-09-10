var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render });

function preload() {
	game.load.image('muzi-cry', 'kakao-faces/2200001.thum_021.png' );
	game.load.image('muzi-aegyo', 'kakao-faces/2200001.thum_029.png');
	game.load.image('muzi-delightful', 'kakao-faces/2200001.thum_020.png');
	game.load.image('apeach-confident', 'kakao-faces/2200001.thum_056.png' );
	game.load.image('apeach-love', 'kakao-faces/2200001.thum_006.png');
	game.load.image('apeach-condescending', 'kakao-faces/2200001.thum_013.png');
	game.load.image('tube-angry', 'kakao-faces/2200002.thum_045.png');
	game.load.image('jayg-sing', 'kakao-faces/2200001.thum_039.png');
	game.load.image('neo-elastichair', 'kakao-faces/2200002.thum_007.png');
	game.load.image('neo-embarrassed', 'kakao-faces/2200002.thum_006.png');
	game.load.image('tube-cheerup', 'kakao-faces/2200002.thum_033.png');
	game.load.image('tube-yay', 'kakao-faces/2200002.thum_078.png');
	game.load.image('frodo-thumbsup', 'kakao-faces/2200002.thum_057.png');
	game.load.image('frodo-whistle', 'kakao-faces/2200002.thum_060.png');
	game.load.image('jayg-coffee', 'kakao-faces/2200001.thum_077.png');
	game.load.image('tube-angrytable', 'kakao-faces/2200002.thum_046.png');
	game.load.image('tube-angrykick', 'kakao-faces/2200002.thum_047.png');
	game.load.image('face-merong','kakao-faces/008.png');
	game.load.image('btnNextRound','assets/next-round.png');
	game.load.image('muzi-minsohee', 'kakao-faces/2200001.thum_020-minsohee.png');
}

var faces = [ 	'muzi-delightful' , 
				'apeach-love', 
				'jayg-sing', 
				'neo-elastichair', 
				'tube-cheerup', 
				'frodo-thumbsup'];

var bombs = ['tube-angrytable', 'muzi-minsohee'];

var velocityKakao = 100;

KakaoFriend = function (index, game, speedWeight) {
	var x = game.world.randomX;
	var y = game.world.randomY;

	this.game = game;
	this.index = index;
	this.sprite = game.add.sprite(x, y, faces[Math.floor(Math.random() * faces.length)]);
	
	game.physics.enable(this.sprite, Phaser.Physics.ARCADE);

	this.sprite.anchor.set(0.5);
	this.sprite.body.immovable = false;
	this.sprite.body.collideWorldBounds = true;
	this.sprite.body.bounce.setTo(1,1);

	this.sprite.scale.setTo(2,2);

	this.sprite.angle = game.rnd.angle();

	this.sprite.inputEnabled=true;
	this.sprite.events.onInputDown.add(clickKakao, this);

	game.physics.arcade.velocityFromRotation(this.sprite.rotation, (velocityKakao + Math.sqrt(speedWeight * 5)) , this.sprite.body.velocity);
}

KakaoBomb = function (index, game, speedWeight) {
	var x = game.world.randomX;
	var y = game.world.randomY;

	this.game = game;
	this.sprite = game.add.sprite(x, y, bombs[Math.floor(Math.random() * bombs.length)]);
	
	game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
	this.sprite.anchor.set(0.5);
	this.sprite.body.immovable = false;
	this.sprite.body.collideWorldBounds = true;
	this.sprite.body.bounce.setTo(1,1);

	this.sprite.scale.setTo(2,2);

	this.sprite.angle = game.rnd.angle();

	this.sprite.inputEnabled=true;
	this.sprite.events.onInputDown.add(clickKakao, this);

	game.physics.arcade.velocityFromRotation(this.sprite.rotation, (velocityKakao + Math.sqrt(speedWeight * 10)) , this.sprite.body.velocity);

}

var score = 0;
var scoreText;

var currRound = 1;
var catchCount = 0;

var roundText;
var btnNextRound;

var blindText;

var gameInfoText;

var roundInfoText;

function create() {
	game.physics.startSystem(Phaser.Physics.ARCADE);

	game.stage.backgroundColor = '#fcd411';
	scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '26px', fill: '#432f2e' });
	roundText = game.add.text(16, 64, '', { fontSize: '26px', fill: '#432f2e' });
	timeText = game.add.text(16, 108, 'elapsed seconds: ', { fontSize: '26px', fill: '#432f2e' });

	game.physics.startSystem(Phaser.Physics.P2JS);
	game.physics.p2.defaultRestitution = 0.8;

	blindText = game.add.text(window.innerWidth/2, window.innerHeight/2, '저런, 점 찍은 민소희 무지를 죽였습니다.' + '\n' + '2초 동안 실명 상태가 됩니다.', { fontSize: '42px', fill: '#ff0000' });
	blindText.visible = false;
	blindText.anchor.set(0.5);

	gameInfoText = game.add.text(window.innerWidth/2, window.innerHeight/2, 'Game Info', { fontSize: '42px', fill: '#432f2e' });
	gameInfoText.visible = false;
	gameInfoText.anchor.set(0.5);

	roundInfoText = game.add.text(window.innerWidth/2, window.innerHeight/2, 'Round Info', { fontSize: '42px', fill: '#432f2e' });
	roundInfoText.visible = false;
	roundInfoText.anchor.set(0.5);

	roundText.text = "currRound: " + currRound;

	btnNextRound = game.add.button(game.world.centerX, 50, 'btnNextRound', showNextRound, this, 2, 1, 0);

	kakaoFriends = [];
	numKakaoFriends = 0;
	numInitialKakaoFriends = 15;

	kakaoBombs = [];
	numKakaoBombs = 0;
	numInitialKakaoBombs = 4;

	startNewGame(1);
}

function update() {
}

function render() {
	timeText.text = 'Elapsed seconds: ' + this.game.time.totalElapsedSeconds();
}

function startNewGame(round) {
	gameInfoText.visible = false;

	for (var i=0; i<numInitialKakaoFriends + (round*3); i++) {
		createKakao();
	}

	for (var i=0; i<numInitialKakaoBombs + (round); i++) {
		createBomb();
	}

	game.time.events.repeat(Phaser.Timer.SECOND * 5, 100000, createKakao, this);
	// game.time.events.repeat(Phaser.Timer.SECOND * 3, 5, transformRandomBomb, this);


	for (var i=0; i<numKakaoBombs; i++){
		transformToAngryBomb(kakaoBombs[i]);
	}

	btnNextRound.visible = false;
	hideAll();

	if(round == 1){
		load_r1_features();
	}

	if(round == 2){
		load_r2_features();
	}

	if(round == 3){
		load_r3_features();
	}

	if(round > 3) {
		revealAll();
	}
}

function createKakao() {
	kakaoFriends.push(new KakaoFriend(numKakaoFriends, game, catchCount+1));
	numKakaoFriends = kakaoFriends.length;
		scoreText.text = 'Score: ' + score + ' numKakaoFriends: ' + numKakaoFriends + ' numBombs: ' + numKakaoBombs;
}

function createBomb() {
	kakaoBombs.push(new KakaoBomb(numKakaoBombs, game, catchCount+1));
	numKakaoBombs = kakaoBombs.length;
		scoreText.text = 'Score: ' + score + ' numKakaoFriends: ' + numKakaoFriends + ' numBombs: ' + numKakaoBombs;
}

function clickKakao(kakao) {
	console.log(kakao);

	if (kakao.key == 'tube-angrytable') {
		for (var i=0; i<5; i++) {
			createKakao();
		}
		score -= 300;
		numKakaoFriends = kakaoFriends.length;
		for (var i=0; i<numKakaoBombs; i++){
			if (kakaoBombs[i].sprite == kakao){
				kakaoBombs.splice(i, 1);
				break;
			}
		}
		numKakaoBombs = kakaoBombs.length;
		kakao.destroy();
		scoreText.text = 'Score: ' + score + ' numKakaoFriends: ' + numKakaoFriends + ' numBombs: ' + numKakaoBombs;
	} else if (kakao.key == 'muzi-minsohee') {
		score -= 300;
		numKakaoFriends = kakaoFriends.length;
		for (var i=0; i<numKakaoBombs; i++){
			if (kakaoBombs[i].sprite == kakao){
				kakaoBombs.splice(i, 1);
				break;
			}
		}
		numKakaoBombs = kakaoBombs.length;
		kakao.destroy();
		scoreText.text = 'Score: ' + score + ' numKakaoFriends: ' + numKakaoFriends + ' numBombs: ' + numKakaoBombs;
		startBlindMode();
	} else {
		for (var i=0; i<numKakaoFriends; i++){
			if (kakaoFriends[i].sprite == kakao){
				kakaoFriends.splice(i, 1);
				break;
			}
		}
		kakao.destroy();
		score += 50;
		catchCount += 1;
		numKakaoFriends = kakaoFriends.length;
		scoreText.text = 'Score: ' + score + ' numKakaoFriends: ' + numKakaoFriends + ' numBombs: ' + numKakaoBombs;
		console.log("remove friend");

	}

	if (isGameClear()) {
		scoreText.text = 'Total Score: ' + score; 
		gameInfoText.visible = true;
		gameInfoText.text = "Round " + currRound + " Clear!"
		killAllKakao();
		game.time.events.stop();
		btnNextRound.visible = true;
		velocityKakao += 50;

	}

}

function killAllKakao() {
	for (var i=0; i<numKakaoFriends; i++){
		console.log("numKakaoFriends: "+ numKakaoFriends);
		k = kakaoFriends.pop();
		k.sprite.destroy();
		console.log("removed friend at "+ i);
	}

	for (var i=0; i<numKakaoBombs; i++){
		k = kakaoBombs.pop();
		k.sprite.destroy();
		console.log("remove bomb at " + i);
	}
}

function isGameClear() {
	if (numKakaoFriends == 0){
		return true;
	} else {
		return false;
	}
}

function transformRandomBomb() {
	index = Math.floor(Math.random() * numKakaoBombs); 
	transformToAngryBomb(kakaoBombs[index]);
}

function showNextRound() {
	console.log("showNextRound Clicked");
	currRound += 1;
	roundText.text = "currRound: " + currRound;
	startNewGame(currRound);
}

function transformToAngryBomb(bomb_sprite) {
	var loopTint= setInterval(function(){
		if (bomb_sprite.sprite.tint == 0xff0000){
			bomb_sprite.sprite.tint = 0xffffff;
		} else {
			bomb_sprite.sprite.tint = 0xff0000;
		}

		if(bomb_sprite == undefined){
			clearInterval(loopTint);
		}
	}, 1000);
}

function effectOnDestroy(sprite) {

}

function hideAll(){
	for (var i=0; i<numKakaoFriends; i++){
		kakaoFriends[i].sprite.visible = false;
	}

	for (var i=0; i<numKakaoBombs; i++){
		kakaoBombs[i].sprite.visible = false;
	}
}

function revealAll(){
	for (var i=0; i<numKakaoFriends; i++){
		kakaoFriends[i].sprite.visible = true;
	}

	for (var i=0; i<numKakaoBombs; i++){
		kakaoBombs[i].sprite.visible = true;
	}
}

function startBlindMode() {
	blindText.visible = true;
	hideAll();
	setTimeout(resumeWorld, 2000);
	game.stage.backgroundColor = '#000000';
	function resumeWorld() {
		game.stage.backgroundColor = '#fcd411';
		blindText.visible = false;
		revealAll();
	}
}

function randomScale(sprite, maxS, minS) {
	var origS = sprite.scale.x;
	var s = origS;
	var delta = 0.01;
	var counter = 0;

	var loopScale =	setInterval(function(){
						counter++;
						if (s >= maxS){
							delta = -0.075;
						}
						if (s <= minS){
							delta = +0.075;
						}
						s += delta;
						sprite.scale.setTo(s,s);

						if (counter >= 3000){
							sprite.scale.setTo(origS, origS);
							clearInterval(loopScale);
						}

					}, 10);
}

function rotateEffect(sprite) {
	sprite.angle += 1;
	var counter = 0;
	var loopRotate = setInterval(function(){
		counter++;

		sprite.angle += 1;

		if (counter >= 1000){
			clearInterval(loopRotate);
		}
	}, 3);
}

function getRandomKakaoFriend() {
	return kakaoFriends[Math.floor(Math.random() * kakaoFriends.length)];
}

function getRandomKakaoBomb() {
	return kakaoBombs[Math.floor(Math.random() * kakaoBombs.length)];
}

function getRandomNumber(max,min) {
	return Math.floor(Math.random() * (max+1)) + min
}


function load_r1_features() {
	roundInfoText.visible = true;
	roundInfoText.text = "게임 방법: \n 성난 튜브와 점 찍은 민소희 무지 빼고 다 잡아버리세요."
	game.paused = true;
	setTimeout(function(){
		game.paused = false;
		roundInfoText.visible = false;
		revealAll();
	}, 3500);
}

function load_r2_features() {
	roundInfoText.visible = true;
	roundInfoText.text = "2라운드: \n 무작위로 캐릭터들이 커졌다 작아졌다 합니다."
	game.paused = true;
	setTimeout(function(){
		game.paused = false;
		roundInfoText.visible = false;
		revealAll();
	}, 3500);
	setInterval(function(){
			n = getRandomNumber(1,0);
			if (n==0){
				randomScale(getRandomKakaoFriend().sprite, 3, 0.25);
			} else {
				randomScale(getRandomKakaoBomb().sprite, 4.5, 1.5);
			}
	}, 3000);
}

function load_r3_features() {
	roundInfoText.visible = true;
	roundInfoText.text = "3라운드: \n 이젠 캐릭터들이 빙글빙글 돌기까지 합니다."
	game.paused = true;
	setTimeout(function(){
		game.paused = false;
		roundInfoText.visible = false;
		revealAll();
	}, 3500);
	setInterval(function(){
		n = getRandomNumber(1,0);
		if (n==0){
			rotateEffect(getRandomKakaoFriend().sprite);
		} else {
			rotateEffect(getRandomKakaoBomb().sprite);
		}
	}, 2500);
}
