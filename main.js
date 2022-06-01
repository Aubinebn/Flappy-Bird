// Dimensions de la scèen
const wST = 500;
const hST = 700;
//Phase de jeu (0: accueil, 1: jeu, 2: game over, )
let phaseJeu = 0;
// Nombre de vies 
let nbVies = 5;
// Textures
let textures;
// Référence les objets
let bird, ground, pipe, getReady, gameOver;
let rTop, rBottom;
// Tableau pour les vies
let tLives = [];
// Vitesse de déplacement
let vX = 2.5, vY = 0, accY = 0.5, impulsionY = -6;
let angle = 0, amplitude = 60;


// Application PIXI
let app = new PIXI.Application({
    width : wST,
    height : hST,
    backgroundColor : 0x22CCFF,
});
//ajoute la vue PIXI au dOM 
document.body.appendChild(app.view);

//Chargement
const loader = PIXI.Loader.shared;
loader.add("sprite", "assets/flappy_bird.json");
// Lance le chargement
loader.load((loader, resources)  => {
    textures = resources.sprite.textures;

    //test()
    //return;

    // Création des éléments graphiques
    createBg();
    createPipe();
    createGround();
    createGameOver();
    createReady();
    createBird();
    createLives();

    // Event Clavier
    window.addEventListener("keydown", onKeyDown);

    // Animation
    app.ticker.add(() => {
       gameLoop();
   });
})


function test(){
    let t = [];

    for(let i = 0, nbC = 6, nbL = 5 ; i < nbC * nbL ; i++){
        //console.log(i, i % nbC, Math.floor(i / nbC));
        let b = new PIXI.Sprite(textures["bird0.png"]);
        b.x = (i % nbC) * (b.width + 15)
        b.y = Math.floor(i / 3) * b.height
        app.stage.addChild(b);
        t.push(b);
    }
    console.log(t);
    
    t[2].alpha = 0.5;
    for(let [i, b] of t.entries()){
        b.scale.set(1.0 - (i / t.length) * 0.8)
        if(i % 2 === 0) b.alpha = 0.25;
    }
}


function createBg(){
    let bg = new PIXI.Sprite(textures["background.png"]);
    app.stage.addChild(bg);
}
function createGround(){
    ground = new PIXI.Sprite(textures["ground.png"]);
    ground.y = hST - ground.height * 0.7;
    app.stage.addChild(ground);
}
function createPipe(){
    pipe = new PIXI.Sprite(textures["pipe.png"]);
    pipe.anchor.set(0.5);
    pipe.x = wST + pipe.width * 0.5;
    pipe.y = hST * 0.5 + rdm(-240, 240);
    app.stage.addChild(pipe);

    // Création des rectangles pour tester les collisions
    rTop = new PIXI.Graphics();
    rTop.x = -45;
    rTop.y = -570;
    rTop.beginFill(0, 0.4);
    rTop.drawRect(0, 0, 90, 485);
    pipe.addChild(rTop);

    rBottom = new PIXI.Graphics();
    rBottom.x = -45;
    rBottom.y = 87;
    rBottom.beginFill(0, 0.4);
    rBottom.drawRect(0, 0, 90, 485);
    pipe.addChild(rBottom);
}
function createBird(){
    bird = new PIXI.AnimatedSprite([ 
        textures["bird0.png"],
        textures["bird1.png"],
        textures["bird2.png"]
    ]);

    bird.anchor.set(0.5);
    bird.x = wST * 0.25;
    bird.y = hST * 0.5;
    app.stage.addChild(bird);   
    // Règle la vitesse de lecture de la séquence
    bird.animationSpeed = 0.2;
    // Lance la séquence
    bird.play();
}
function createReady(){
    getReady = new PIXI.Sprite(textures["get_ready.png"]);
    getReady.anchor.set(0.5);
    getReady.x = wST * 0.5;
    getReady.y = hST * 0.5;
    app.stage.addChild(getReady);
}
function createGameOver(){
    gameOver = new PIXI.Sprite(textures["game_over.png"]);
    gameOver.x = wST * 0.5;
    gameOver.y = hST * 0.5;
    gameOver.anchor.set(0.5);
    //app.stage.addChild(gameOver);
}
function createLives(){
    for(let i = 0 ; i < nbVies ; i++){
        let b = new PIXI.Sprite(textures['bird0.png']);
        b.scale.set(0.5);
        b.x = wST - ((i + 1) * b.width) - 10;
        b.y = hST - b.height - 10;
        app.stage.addChild(b);
        tLives.push(b);
    }
}


function onKeyDown(e){
    // Vérifie si touche ESPACE
    if(e.keyCode === 32){
        // Supprime le getReady si phase de jeu est à 0
        if(phaseJeu === 0) {
            app.stage.removeChild(getReady);
            // Change la phase de jeu
            phaseJeu = 1;
        }
        else if(phaseJeu === 1){
            // Chnage la vitesse en Y
            vY = impulsionY;
        }
        else if(phaseJeu === 2){
            phaseJeu = 0;
            app.stage.removeChild(gameOver)
            app.stage.addChild(getReady)
            bird.rotation = 0;
            nbVies = 5;
            for(let b of tLives) b.alpha = 1.0;
        }
    }
}

function gameLoop(){
    ground.x -= vX;
    if(ground.x < -120) ground.x = 0;

    if(phaseJeu === 0) {
        bird.y = hST * 0.5 + Math.sin(angle) * amplitude;
        angle += 0.06;
    }
    else if(phaseJeu === 1){
        pipe.x -= vX;
        if(pipe.x < -pipe.width * 0.5){
            pipe.x = wST + pipe.width * 0.5;
            pipe.y = hST * 0.5 + rdm(-200, 200);
            vX += 2;
        }        

        bird.y += vY;
        vY += accY;
        bird.rotation = vY * 0.03;

        // Empêche l'oiseau de sortir par le haut
        if(bird.y <= bird.height * 0.5){
            bird.y += 1;
            vY = 0;
        }

        // Vérifie si l'oiseau entre en collision
        if(
            collide(bird.getBounds(), rTop.getBounds()) ||
            collide(bird.getBounds(), rBottom.getBounds()) ||
            collide(bird.getBounds(), ground.getBounds())
        ){
            // Replace l'oiseau
            bird.y = hST * 0.5;
            // Replace les tuyaux
            pipe.x = wST + pipe.width * 0.5;
            pipe.y = hST * 0.5 + rdm(-200, 200);
            // Redéfini la vitesse en Y
            vY = 0;

            // ------------------------------------
            // Perd une vie
            nbVies--;
            if(nbVies < 0){
                phaseJeu = 2;
                app.stage.addChild(gameOver);
            }
            else {
                // Change l'aspect de l'oiseau
                tLives[nbVies].alpha = 0.3
            }
        }
    }
}


function collide(r1, r2){
    return !(
        r1.x + r1.width < r2.x ||
        r2.x + r2.width < r1.x ||
        r1.y + r1.height < r2.y ||
        r2.y + r2.height < r1.y
    )
}

function rdm(x = NaN, y = NaN){
    if(isNaN(x) && isNaN(y)){
        return Math.random() 
    }
    else if(isNaN(y)){
        return (Math.random() + x);
    }
    else{
        return x + (y - x) * Math.random();
    }
}