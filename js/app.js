/*
 * Create a list that holds all of your cards
 */

let CardArray = ['fa-anchor', 'fa-bicycle', 'fa-bolt', 'fa-bomb',
        'fa-anchor', 'fa-bicycle', 'fa-bolt', 'fa-bomb',
        'fa-cube', 'fa-leaf', "fa-diamond", 'fa-paper-plane-o',
        'fa-cube', 'fa-leaf', "fa-diamond", 'fa-paper-plane-o'];

/*
 * Create a list that holds all card id
 */
let CardsId = [];

/*
 * card id and card type pair
 *   - key: card id
 *   - value: card type
 *            one of CardArray value
 */
let CardsTypeMap = new Map();

/*
 * record timeid for time lapse
 */
let IntervalId = null;

/*
 * record start time
 */
let StartTime = null;
let endTime = null;

/*
 * record click count
 */
let TotalClick = 0;

// Start for game
let StartCount = 3;

/*
 * Display the cards on the page
 *   - shuffle the list of cards using the provided "shuffle" method below
 *   - loop through each card and create its HTML
 *   - add each card's HTML to the page
 */

// Shuffle function from http://stackoverflow.com/a/2450976
function shuffle(array) {
    'use strict';
    // var temporaryValue = 0;
    // var randomIndex = 0;
    var currentIndex = array.length, temporaryValue, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}


/*
 * set up the event listener for a card. If a card is clicked:
 *  - display the card's symbol (put this functionality in another function that you call from this one)
 *  - add the card to a *list* of "open" cards (put this functionality in another function that you call from this one)
 *  - if the list already has another card, check to see if the two cards match
 *    + if the cards do match, lock the cards in the open position (put this functionality in another function that you call from this one)
 *    + if the cards do not match, remove the cards from the list and hide the card's symbol (put this functionality in another function that you call from this one)
 *    + increment the move counter and display it on the page (put this functionality in another function that you call from this one)
 *    + if all cards have matched, display a message with the final score (put this functionality in another function that you call from this one)
 */

function checkWin(){
    'use strict';

    if($('.match').length === CardArray.length) {
        // endTime = Date.now();
        endTime = moment();
        clearInterval(IntervalId);

        let costTime = Math.floor(moment.duration(endTime-StartTime).asSeconds());

        $('#rst-cost-time').text("Cost " + costTime + " seconds!");

        // get start
        if (costTime < 31 || clickCount <= 32){
            StartCount = 3;
        }
        refreshStarts();

        $('#rst-score').text(`You get ${StartCount} start${StartCount>1?'s':''}!`);
        $('#final-rst').css('display', 'inherit');
    }
}

function switchRule(show){
    'use strict';
    if(show){
        $('#game-rule').css('display', 'inherit');
    } else {
        $('#game-rule').css('display', '');
    }

    console.log("switch rule");

}

function checkMatch(latestId) {
    'use strict';

    // get opened cards without match
    let noMatchCards = [];

    for(let card of $('.show')) {
        if (card.classList.contains("match")){
            continue;
        }
        noMatchCards.push(card.id);
    }

    if (noMatchCards.length < 2) {
        return;
    }

    let findMatch = false;
    for (let cardId of noMatchCards) {
        if (cardId === latestId) {
            continue;
        }
        if (CardsTypeMap.get(cardId) === CardsTypeMap.get(latestId)){
            findMatch = true;

            $(`#${cardId}`).attr("class", "card open show match");
            $(`#${latestId}`).attr("class", "card open show match");

            checkWin();
            break;
        }
    }

    if(!findMatch){
        noMatchCards.forEach(function(cardId){
                $(`#${cardId}`).attr("class", "card unmatch");
            });
        // clear unmatch
        setTimeout(function(){
            noMatchCards.forEach(function(cardId){
                $(`#${cardId}`).attr("class", "card");
            });
        }, 1100);


    }

    // console.log(noMatchCards);
}

// function setTimeLapse(){
function pageRefresh () {
    $('#timeLapse').text(StartTime === null ? 0 :`${Math.floor(moment.duration(moment()-StartTime).asSeconds())}`);
    var matchCount = $('.match').length;
    if (TotalClick > 55){
        StartCount = 0;
    } else if (TotalClick > 24){
        if (matchCount < 9){
            StartCount = 1;
        } else if (matchCount < 12){
            StartCount = 2;
        }
    } else if (TotalClick > 10 && matchCount < 4) {
            StartCount = 2;
    }
    refreshStarts();
}

function setActionCount() {
    $('#clickCount').text(Math.floor(TotalClick/2));
}

function closeResult(srcId) {
    $('#final-rst').css("display",'');
    if (srcId === "rst-close"){
        refreshStarts();
    } else {
        gameRestart();
    }
}

function cardClick(card) {
    'use strict';

    if (IntervalId === null) {
        StartTime = moment();
        IntervalId = setInterval(pageRefresh, 1000);
    }
    for (let cardClass of card.classList) {
        if (cardClass === "show") {
            return;
        }
    }
    TotalClick ++;
    setActionCount();

    card.setAttribute("class", "card open show");

    checkMatch(card.id);
}

function initCards() {
    let shuffled_card = shuffle(CardArray);
    CardsTypeMap.clear();

    let newCards = "";
    for (let index in shuffled_card) {
        let cardId = `${CardsId[index]}`;
        let cardType = `${shuffled_card[index]}`;
        newCards += `<li class="card" onclick="cardClick(this)" id="${cardId}">\n`;
        newCards += `<i class="fa ${cardType}"></i>\n`;
        newCards += `</li>`;

        CardsTypeMap.set(cardId, cardType);
    }
    $('#deck').html(newCards);
}

function refreshStarts() {
    let starts ="";
    for (let index = 0; index < 3; index ++) {
        let startClass = index < StartCount ? 'fa-star' : 'fa-star-o';
        starts += `<li><i class="fa ${startClass}"></i></li>`;
    }
    $('#starts').html(starts);
}

function gameRestart() {
    'use strict';
    if (IntervalId!== null){
        clearInterval(IntervalId);
        IntervalId = null;
    }

    StartTime = null;
    StartCount = 3;
    TotalClick = 0;
    pageRefresh();
    setActionCount();

    initCards();

    refreshStarts();
}

window.onload = function () {
    'use strict';
    for (let index =0; index <= CardArray.length; index++) {
        let cardId = `card${index}`;
        CardsId.push(cardId);
    }
    gameRestart();
};

