/**
 * Memory game
 * Petri Salmela <pesasa@iki.fi>
 * 2016-03-20
 */

var CLOSE_DELAY = 1000;

/***********************
 * Memgame
 * @constructor
 * @param {jQuery} place - html-element to use for the game
 ***********************/
var Memgame = function(place){
    this.place = $(place);
    this.carddeck = [];
    this.movecount = 0;
    this.paircount = 0;
    this.status = 0;
}

/**
 * Init the game
 */
Memgame.prototype.init = function(){
    this.initDeck();
    this.initGamearea();
    this.initHandlers();
}

/**
 * Init the deck of cards
 */
Memgame.prototype.initDeck = function(){
    var card;
    this.carddeck = [];
    for (var name in this.symbols){
        card = new MemCard(name, this.symbols[name]);
        this.carddeck.push(card);
        card = new MemCard(name, this.symbols[name]);
        this.carddeck.push(card);
    };
};

/**
 * Init all cards (clear turn status)
 */
Memgame.prototype.initCards = function(){
    for (var i = 0, len = this.carddeck.length; i < len; i++){
        this.carddeck[i].clear();
    }
};

/**********
 * Init the playing area from template.
 **********/
Memgame.prototype.initGamearea = function(){
    this.place.html(this.templates.html);
    this.gamearea = this.place.find('.memorygame-gamearea');
    this.movearea = this.place.find('.memorygame-movecount');
    this.pairarea = this.place.find('.memorygame-paircount');
};

/**********
 * Init event handlers
 **********/
Memgame.prototype.initHandlers = function(){
    var game = this;
    this.place.off('click', '.memorygame-start').on('click', '.memorygame-start', function(event){
        game.start();
    });
    this.place.off('cardopen').on('cardopen', function(event, data){
        game.cardturn(data);
    });
};

/**********
 * Start playing
 **********/
Memgame.prototype.start = function(){
    this.movecount = 0;
    this.paircount = 0;
    this.status = 0;
    this.updateScore();
    this.shuffle();
    this.deal();
};

/**********
 * Process the turning of a card. Check correct pairs etc.
 * @param {Object} data - data of the turned card {id: <id of the card>, target: <jQuery-elment of card>}
 **********/
Memgame.prototype.cardturn = function(data){
    var game = this;
    switch (this.status){
        case 0:
            // With first card turned
            if (this.timeout) {
                // If there are cards waiting closing, close them now.
                clearTimeout(this.timeout);
                this.timeoutFunction();
            };
            this.firstcardid = data.id;
            this.firstcardtarget = data.target;
            this.status = 1;
            break;
        case 1:
            // With second card turned
            this.movecount++;
            if (data.id === this.firstcardid) {
                // If this was a pair.
                this.paircount++;
                data.target.trigger('lock');
                this.firstcardtarget.trigger('lock');
            } else {
                // If this wasn't a pair
                this.timeoutFunction = function(){
                    // Close with triggering 'close'-events to both cards.
                    data.target.trigger('close');
                    game.firstcardtarget.trigger('close');
                    game.timeout = null;
                    game.timeoutFunction = null;
                };
                // Do closing with a delay.
                this.timeout = setTimeout(this.timeoutFunction, CLOSE_DELAY);
            };
            this.status = 0;
            // Update the score on the screen.
            this.updateScore();
            break;
        default:
            break;
    };
};

/**********
 * Clear the gamearea and deal the cards.
 **********/
Memgame.prototype.deal = function(){
    this.gamearea.empty();
    var cardplace;
    for (var i = 0, len = this.carddeck.length; i < len; i++){
        cardplace = $(this.templates.card);
        this.gamearea.append(cardplace);
        this.carddeck[i].setPlace(cardplace);
    };
};

/**********
 * Update the score on the screen.
 **********/
Memgame.prototype.updateScore = function(){
    var movescore = (this.carddeck.length === this.paircount * 2 ? '<strong>' + this.movecount + '</strong>' : this.movecount);
    this.movearea.html(movescore);
    this.pairarea.html(this.paircount);
};

/**********
 * Shuffle the cards on the deck randomly.
 **********/
Memgame.prototype.shuffle = function(){
    for (var i = 0; i < 100; i++){
        this.carddeck.sort(function(a, b){
            return Math.random() - 0.5;
        });
    };
};

/**********
 * HTML-templates
 **********/
Memgame.prototype.templates = {
    html: [
        '<div class="memorygame">',
        '    <div class="memorygame-controlarea">',
        '        <div class="memorygame-controls"><button class="memorygame-start">Start</button></div>',
        '        <div class="memorygame-moves">Moves: <span class="memorygame-movecount">0</span></div>',
        '        <div class="memorygame-pairs">Pairs: <span class="memorygame-paircount">0</span></div>',
        '    </div>',
        '    <div class="memorygame-gamearea"></div>',
        '</div>',
    ].join('\n'),
    card: ['<div class="memorygame-cardwrapper"></div>'].join('\n')
};

/**********
 * Available symbols for cards.
 **********/
Memgame.prototype.symbols = {
    'circle'      : '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100" height="100" viewBox="0 0 30 30" class="memorycard-circle"><circle fill="red" stroke="none" cx="15" cy="15" r="10"></circle></svg>',
    'rectangle'   : '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100" height="100" viewBox="0 0 30 30" class="memorycard-rectangle"><rect fill="blue" stroke="none" x="5" y="5" width="20" height="20"></rect></svg>',
    'triangle'    : '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100" height="100" viewBox="0 0 30 30" class="memorycard-triangle"><path fill="green" stroke="none" d="M15 5 l10 17.3 h-20z"></path></svg>',
    'star'        : '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100" height="100" viewBox="0 0 30 30" class="memorycard-star"><path style="stroke: #ca0; fill: #fd0;" d="M15 2 l3.7 8 l9.3 1 l-7 6 l2 9 l-8 -4.8 l-8 4.8 l2 -9 l-7 -6 l9.3 -1z"></path></svg>',
    'gear'        : '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100" height="100" viewBox="0 0 30 30" class="memorycard-gear"><path style="stroke: none; fill: #81420E;" d="M17.26 2.2 a13 13 0 0 1 7.7 4.44 a3 8 60 0 0 2.256 3.91 a13 13 0 0 1 0 8.89 a3 8 120 0 0 -2.256 3.91 a13 13 0 0 1 -7.7 4.44 a3 8 0 0 0 -4.52 0 a13 13 0 0 1 -7.7 -4.44 a3 8 60 0 0 -2.256 -3.91 a13 13 0 0 1 0 -8.89 a3 8 120 0 0 2.256 -3.91 a13 13 0 0 1 7.7 -4.44 a3 8 0 0 0 4.52 0 M15 11 a4 4 0 0 0 0 8 a4 4 0 0 0 0 -8 z"></path></svg>',
    'cross'       : '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100" height="100" viewBox="0 0 30 30" class="memorycard-cross"><path style="stroke: none; fill: #a00;" d="M4 7 a1.5 1.5 0 0 1 3 -3 l8 8 l8 -8 a1.5 1.5 0 0 1 3 3 l-8 8 l8 8 a1.5 1.5 0 0 1 -3 3 l-8 -8 l-8 8 a1.5 1.5 0 0 1 -3 -3 l8 -8 l-8 -8 z"></path></svg>',
    'wrench'      : '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100" height="100" viewBox="0 0 50 50" class="memorycard-wrench"><path style="stroke: none; fill: #00a;" d="M35 5 a12 12 0 1 0 9 9 l-9 9 a10 10 0 0 1 -9 -9 l9 -9z m-15 17.5 l-17 17 a2 2 0 0 0 7 7 l17 -17z m-16 18 a2 2 0 0 1 5 5 a2 2 0 0 1 -5 -5z"></path></svg>',
    'pencil'      : '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100" height="100" viewBox="0 0 30 30" class="memorycard-pencil"><path style="stroke: none; fill: #050;" d="M3 27 l10 -4 l15 -15 a7 7 0 0 0 -6 -6 l-15 15z m5 -2.4 a3 3 0 0 0 -2.6 -2.6 l2 -5 a8 8 0 0 1 5.6 5.6 z"></path></svg>',
    'eye'         : '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100" height="100" viewBox="0 0 30 30" class="memorycard-eye"><path style="stroke: none; fill: blue;" d="M3 15 a13 13 0 0 0 24 0 a13 13 0 0 0 -24 0z m1 0 a13 13 0 0 1 22 0 a13 13 0 0 1 -22 0z m6 -1 a5 5 0 0 0 10 0 a5 5 0 0 0 -10 0z m1.5 -1.6 a3 3 0 0 1 3 -2.1 a2 0.8 0 0 1 0 1 a3 3 0 0 0 -1.8 1.2 a0.5 0.5 0 0 1 -1.16 0z"></path></svg>',
    'music'       : '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100" height="100" viewBox="0 0 30 30" class="memorycard-music"><path style="stroke: none;" d="M11 23 a4 2 -15 1 1 -2 -1 l0 -14 l15 -4 l0 16 a4 2 -15 1 1 -2 -1 l0 -11 l-11 3.5z"></path></svg>',
    'moon'        : '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100" height="100" viewBox="0 0 30 30" class="memorycard-moon"><path style="stroke: #ca0; fill: #fd0;" d="M22 8 a10 10 0 1 0 0 14 a7 7 0 0 1 0 -14z"></path></svg>',
    'link'        : '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100" height="100" viewBox="0 0 30 30" class="memorycard-link"><path style="stroke: none; fill: #006;" d="M14.5 11.5 a3 3 0 0 1 0 -4 l5 -5 a4 4 0 0 1 8 8 l-5 5 a3 3 0 0 1 -4 0 l6 -6 a2 2 0 0 0 -4 -4z m4 -3 a2 2 0 0 1 3 3 l-10 10 a2 2 0 0 1 -3 -3z m-3 10 a4 4 0 0 1 0 4 l-5 5 a3 3 0 0 1 -8 -8 l5 -5 a3 3 0 0 1 4 0 l-6 6 a2 2 0 0 0 4 4z"></path></svg>',
    'grid'        : '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100" height="100" viewBox="0 0 30 30" class="memorycard-grid"><path style="stroke: none; fill: black;" d="M3 3 l6 0 l0 6 l-6 0z m9 0 l6 0 l0 6 l-6 0z m9 0 l6 0 l0 6 l-6 0z m-18 9 l6 0 l0 6 l-6 0z m9 0 l6 0 l0 6 l-6 0z m9 0 l6 0 l0 6 l-6 0z m-18 9 l6 0 l0 6 l-6 0z m9 0 l6 0 l0 6 l-6 0z m9 0 l6 0 l0 6 l-6 0z"></path></svg>',
    'stars'       : '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100" height="100" viewBox="0 0 80 80" class="memorycard-stars"><path style="stroke: none; fill: #fd0;" d="M15 27 l3.7 8 l9.3 1 l-7 6 l2 9 l-8 -4.8 l-8 4.8 l2 -9 l-7 -6 l9.3 -1z"></path><path style="stroke: none; fill: #fd0;" d="M40 27 l3.7 8 l9.3 1 l-7 6 l2 9 l-8 -4.8 l-8 4.8 l2 -9 l-7 -6 l9.3 -1z"></path><path style="stroke: none; fill: #fd0;" d="M65 27 l3.7 8 l9.3 1 l-7 6 l2 9 l-8 -4.8 l-8 4.8 l2 -9 l-7 -6 l9.3 -1z"></path></svg>',
    'menu'        : '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100" height="100" viewBox="0 0 30 30" class="memorycard-menu"><path style="stroke: none; fill: black;" d="M5 4 l20 0 a2.5 2.5 0 0 1 0 5 l-20 0 a2.5 2.5 0 0 1 0 -5z m0 9 l20 0 a2.5 2.5 0 0 1 0 5 l-20 0 a2.5 2.5 0 0 1 0 -5z m0 9 l20 0 a2.5 2.5 0 0 1 0 5 l-20 0 a2.5 2.5 0 0 1 0 -5z"></path></svg>',
    'disk'        : '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100" height="100" viewBox="0 0 30 30" class="memorycard-disk"><path style="stroke: none; fill: #00a;" d="M1 1 l23 0 l5 5 l0 23 l-28 0z m5 2 l0 8 l17 0 l0 -8z m12 1 l3 0 l0 6 l-3 0z m-13 10 l0 14 l20 0 l0 -14z m3 3 l14 0 l0 2 l-14 0z m0 3 l14 0 l0 2 l-14 0z m0 3 l14 0 l0 2 l-14 0z"></path></svg>'
}


/*************************************
 * Memorygame cards
 *************************************/

/**********
 * MemCard
 * @constructor
 * @param {String} id - the id of the card
 * @param {String} image - svg-image of the card
 **********/
var MemCard = function(id, image){
    this.id = id;
    this.image = image;
    this.place = null;
    this.clear();
};

/**********
 * Get the id of the card
 * @returns {String} id of the card
 **********/
MemCard.prototype.getId = function(){
    return id;
};

/**********
 * Get the HTML-code of the card.
 * @return {String} html code
 **********/
MemCard.prototype.getHtml = function(){
    var html = [
        '<div class="memorygame-memcard" data-cardid="'+this.id+'">',
        '    <div class="memorygame-memcard-front">'+this.image+'</div>',
        '    <div class="memorygame-memcard-back"></div>',
        '</div>'
    ].join('\n');
    return html;
};

/**********
 * Clear some attributes of the card
 **********/
MemCard.prototype.clear = function(){
    this.visible = false;
    this.locked = false;
}

/**********
 * Set the card into DOM-tree
 * @param {jQuery} place - the place to put card into.
 **********/
MemCard.prototype.setPlace = function(place){
    this.place = $(place);
    this.drawCard();
    this.initHandlers();
};

/**********
 * Draw the card
 **********/
MemCard.prototype.drawCard = function(){
    this.place.html(this.getHtml());
};

/**********
 * Toggle the visibility of the front face of the card
 * @param {Boolean} show - true === turn the front face up, false === turn the front face down, undefined === toggle
 **********/
MemCard.prototype.toggle = function(show) {
    var card = this;
    if (typeof show === 'undefined') {
        show = !this.visible;
    };
    if (show) {
        this.place.addClass('cardopen');
        this.visible = true;
    } else {
        this.place.removeClass('cardopen');
        this.visible = false;
    };
};

/**********
 * Lock the card so that it can not be turned
 **********/
MemCard.prototype.lock = function(){
    this.locked = true;
    this.place.addClass('cardlocked');
};

/**********
 * Turn the card front face up and trigger an event to inform the game.
 **********/
MemCard.prototype.turn = function(){
    this.toggle(true);
    this.place.trigger('cardopen', [{id: this.id, target: this.place}]);
}

/**********
 * Init some even thandlers.
 **********/
MemCard.prototype.initHandlers = function(){
    var card = this;
    // Turn front face up, when clicked
    this.place.off('click').on('click', function(event){
        if (!card.visible) {
            card.turn();
        };
    });
    // Turn front face down, when 'close'-event comes.
    this.place.off('close').on('close', function(event){
        card.toggle(false);
    });
    // Lock the card
    this.place.off('lock').on('lock', function(event){
        card.lock();
    });
};