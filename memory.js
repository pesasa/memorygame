var Memgame = {
    symbols: {},
    cards: [],
    moves: 0,
    cardstatus: 0
};

function initSymbols() {
    var $cardlist = $('.cardlist .memorygame-card');
    var symname, symsvg;
    for (var i = 0, len = $cardlist.length; i < len; i++){
        symname = $cardlist.eq(i).children('svg').attr('class');
        symsvg = $cardlist.eq(i).html();
        Memgame.symbols[symname] = symsvg;
    };
};

function initCards() {
    var card;
    for (var symname in Memgame.symbols){
        card = {
            id: symname,
            image: Memgame.symbols[symname],
            open: false
        };
        Memgame.cards.push(card);
        card = {
            id: symname,
            image: Memgame.symbols[symname],
            open: false
        };
        Memgame.cards.push(card);
    };
};

function shuffleCards() {
    for (var i = 0; i < 100; i++){
        Memgame.cards.sort(function(a,b){
            return Math.random() - 0.5;
        });
    };
};

function showCards() {
    var $gamearea = $('.gamearea');
    $gamearea.empty();
    var card, cardhtml;
    for (var i = 0, len = Memgame.cards.length; i < len; i++){
        card = Memgame.cards[i];
        cardhtml = [
            '<div class="memcardwrapper">',
            '<div class="memcard'+(card.open ? ' cardopen' : '')+'" data-cardid="'+card.id+'">',
            '    <div class="memorygame-card memcard-front">' + card.image + '</div>',
            '    <div class="memorygame-card memcard-back"></div>',
            '</div>',
            '</div>'
        ].join('\n');
        $gamearea.append(cardhtml);
    };
};

function showScore() {
    $('#gamepairs').html(Memgame.pairs);
    $('#gamescore').html(Memgame.moves);
};

function resetScore() {
    Memgame.moves = 0;
    Memgame.pairs = 0;
}

function initHandlers() {
    var $body = $('body');
    $body.on('click', '.gamearea.gamestarted .memcard:not(.locked):not(.cardopen)', function(event){
        var $card = $(this);
        var cardid = $card.attr('data-cardid');
        switch (Memgame.cardstatus) {
            case 0:
            case 2:
                $('.gamearea .memcard.cardopen:not(.locked)').removeClass('cardopen');
                Memgame.cardstatus = 1;
                Memgame.firstopen = cardid;
                Memgame.firstopencard = $card;
                $card.addClass('cardopen');
                break;
            case 1:
                Memgame.cardstatus = 2;
                $card.addClass('cardopen');
                if (cardid === Memgame.firstopen) {
                    $card.addClass('locked');
                    Memgame.firstopencard.addClass('locked');
                    Memgame.pairs++;
                };
                Memgame.moves++;
                showScore();
                break;
            default:
                break;
        };
        if (Memgame.pairs * 2 === Memgame.cards.length) {
            gameStop();
            alert('Valmis!\n'+ Memgame.moves + ' siirtoa');
        }
    });
    
    $('#startgame').on('click', function(event){
        gameStart();
    });
}

function gameStart() {
    var $gamearea = $('.gamearea');
    $gamearea.addClass('gamestarted');
    shuffleCards();
    showCards();
    resetScore();
    showScore();
}

function gameStop() {
    var $gamearea = $('.gamearea');
    $gamearea.removeClass('gamestarted');
};

function main() {
    initSymbols();
    initCards();
    initHandlers();
    shuffleCards();
    showCards();
}

$(document).ready(function(){
    main();
});