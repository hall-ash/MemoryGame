/*
Unit 4.5.1 Memory Game Challenge
Hall, Ashley
Cohort Aug 2021
*/

const gameContainer = document.getElementById("game");
const startBtn = document.querySelector('button');
const FRONT_SIDE = 0;
const CARD_TYPE = 'gradient';
let CARD_FRONTS = []; // images/colors on the front side of each card, 2 identical fronts for each pair
let score = 0; 
let firstGuessedCard = '';
let needToWait = false;
let numMatchingCardPairs = 5;

const getRandHexColor = () => {
  const numHexValues = 3;
  let hexColor = '#';
  for (let i = 0; i < numHexValues; ++i) {
    const int0To255 = Math.floor(Math.random() * 256);
    let hex = int0To255.toString(16);
    if (hex.length == 2) { 
      hexColor += hex;
    }
    else {
      hex = '0' + hex;
      hexColor += hex;
    }
  }
  return hexColor;
}

// returns a hex color array 
// of length numberOfPairs * 2 
// to use as the background for each card
const getColorArray = (numberOfPairs) => {
  let colorArray = [];
  for (let i = 0; i < numberOfPairs; ++i) {
    
    // do not set color to black
    let color = getRandHexColor();
    while(color === '#000000') {
      color = getRandHexColor();
    }

    // push twice for a matching pair
    colorArray.push(color);
    colorArray.push(color);
  }
  return colorArray;
} 

// returns a gradient array of length numberOfPairs * 2
// to use as the background for each card
const getGradientArray = (numberOfPairs) => {
  let gradientArray = [];
  
  for (let i = 0; i < numberOfPairs; ++i) {
    let gradient = {};
    gradient['startColor'] = getRandHexColor();
    gradient['endColor'] = getRandHexColor();
    gradient['id'] = i.toString();

    // push twice for a matching pair
    gradientArray.push(gradient);
    gradientArray.push(gradient);
  }
  return gradientArray;
}

// create colors/gradients for the front side of each card in array CARD_FRONTS
const setCardFronts = (type) => {
  if (type === 'gradient') {
    CARD_FRONTS = getGradientArray(numMatchingCardPairs);
  }
  else if (type === 'color') {
    CARD_FRONTS = getColorArray(numMatchingCardPairs);
  }
  else {
    console.log('setCardFronts: no card type selected')
  }
}


// const COLORS = [
//   "red",
//   "blue",
//   "green",
//   "orange",
//   "purple",
//   "red",
//   "blue",
//   "green",
//   "orange",
//   "purple"
// ];

setCardFronts(CARD_TYPE);
const totalPossibleMatches = CARD_FRONTS.length / 2; 
let totalCurrentMatches = 0; 

const initNewGame = () => {
  score = 0;
  displayTopScore(); 
  firstGuessedCard = '';
  needToWait = false;
  totalCurrentMatches = 0;
  shuffleCards(CARD_TYPE);
}

const displayTopScore = () => {
  const topScoreEl = document.querySelector('#top-score');
  let topScore = parseInt(localStorage.getItem('top-score'));
  if (isNaN(topScore)) {
    topScoreEl.innerText = '';
  }
  else {
    topScoreEl.innerText = 'Top score: ' + topScore;
  }
}

startBtn.addEventListener('click', function(e) {
  startBtn.remove();
  const scores = document.querySelector('#scores');

   // resize h1
   const h1 = document.querySelector('h1');
   h1.style.fontSize = '5rem';

  displayTopScore();
  scores.classList.toggle('hidden'); // display scores
  gameContainer.classList.toggle('hidden'); // display cards
})

// here is a helper function to shuffle an array
// it returns the same array with values shuffled
// it is based on an algorithm called Fisher Yates if you want ot research more
function shuffle(array) {
  let counter = array.length;

  // While there are elements in the array
  while (counter > 0) {
    // Pick a random index
    let index = Math.floor(Math.random() * counter);

    // Decrease counter by 1
    counter--;

    // And swap the last element with it
    let temp = array[counter];
    array[counter] = array[index];
    array[index] = temp;
  }

  return array;
}

let shuffledCardFronts = shuffle(CARD_FRONTS);

const revealCard = (card, cardType) => {
  if (cardType === 'color')
    card.style.backgroundColor = card.classList[FRONT_SIDE];
  else if (cardType === 'gradient') {
    const gradientId = card.classList[FRONT_SIDE];
    const gradient = CARD_FRONTS.find(gradient => {
      return gradient.id === gradientId; 
    });
    
    const startColor = gradient['startColor'];
    const endColor = gradient['endColor'];
    card.style.background = `linear-gradient(45deg, ${startColor} 35%, ${endColor} 100%)`;
  }
}

const hideCard = (card) => {
  //card.style.backgroundColor = 'white';
  card.style.background = 'radial-gradient(circle, rgba(238,174,202,1) 0%, rgba(148,187,233,1) 100%)';
}

// this function loops over the array of colors
// it creates a new div and gives it a class with the value of the color
// it also adds an event listener for a click for each card
function createDivsForCardFronts(cardFrontArray, cardType) {
  for (let cardFront of cardFrontArray) {
    // create a new div
    const newDiv = document.createElement("div");

    // give it a class attribute for the value we are looping over
    // if the card type is color, add the color as the class 
    if (cardType === 'color') {
      newDiv.classList.add(cardFront);
    }
    // if the card type is gradient, add the gradient id as the class
    else if (cardType === 'gradient') {
      newDiv.classList.add(cardFront.id);
    }

    // display cards face down
    hideCard(newDiv);

    // initialize matched value to false
    newDiv.setAttribute('data-matched', 0);

    // call a function handleCardClick when a div is clicked on
    newDiv.addEventListener("click", handleCardClick);

    // append the div to the element with an id of game
    gameContainer.append(newDiv);
  }
}

// TODO: Implement this function!
function handleCardClick(event) {

  const card = event.target;
  
  // don't toggle reveal if:
  // 1. card has been matched,
  // 2. there are 2 cards already displayed 
  // 3. if the card is the first guess
  if (parseInt(card.dataset.matched) ||
      needToWait ||
      card === firstGuessedCard) { 
    return;
  }
  
  // valid guess, reveal card
  revealCard(card, CARD_TYPE);

  // update guess count & display
  ++score;
  updateScoreDisplay();
  
  // if card is first guess, store it
  if (!firstGuessedCard) { 
    firstGuessedCard = card;

    return; // first card, so don't need to compare
  }
  
  // if cards don't match, flip over after 1s
  if (card.classList[FRONT_SIDE] !== firstGuessedCard.classList[FRONT_SIDE]) {
    needToWait = true; // wait until mismatched cards flip over, before clicking others
    setTimeout(function() {
      // flip over mismatched cards
      hideCard(card);
      hideCard(firstGuessedCard);
      needToWait = false; // mismatched cards have been flipped
      // reset first guessed card
      firstGuessedCard = '';
    }, 1000);
  }
  // cards match
  else { 
    firstGuessedCard.dataset.matched = 1; 
    card.dataset.matched = 1;
    // reset first guessed card
    firstGuessedCard = '';
    ++totalCurrentMatches;
  } 

  // end game if all cards matched
  if (totalCurrentMatches === totalPossibleMatches) {
      updateTopScore();
      createdFinishedGameDiv();
  }
}

const updateTopScore = () => {
  let topScore = parseInt(localStorage.getItem('top-score'));
  if (isNaN(topScore) || score < topScore) {
    localStorage.setItem('top-score', score);
  }
}

const updateScoreDisplay = () => {
  const updateScoreDisplay = document.querySelector('#current-score');
  updateScoreDisplay.innerText = "Score: " + score; 
}

const createdFinishedGameDiv = () => {
  const finishedGameDiv = document.createElement('div');
  finishedGameDiv.setAttribute('id', 'finished')
  finishedGameDiv.innerText = `You matched all cards! Your score: ${score}`;
  const btnDiv = document.createElement('div');
  btnDiv.setAttribute('id', 'new-game-btn');
  btnDiv.append(createNewGameBtn());
  finishedGameDiv.append(btnDiv);
  document.querySelector('body').append(finishedGameDiv);
}

const createNewGameBtn = () => {
  const newGameBtn = document.createElement('button');
  newGameBtn.innerText = 'New Game';
  
  newGameBtn.addEventListener('click', function(e) {
    // remove finishedGameDiv
    const finishedGameDiv = document.querySelector('#finished');
    finishedGameDiv.remove();
    initNewGame();
  });

  return newGameBtn;
}

const shuffleCards = (cardType) => {
  if (cardType === 'color')
    shuffledCardFronts = shuffle(getColorArray(numMatchingCardPairs));
  else if (cardType === 'gradient')
  shuffledCardFronts = shuffle(getGradientArray(numMatchingCardPairs));
  const cards = gameContainer.children;
  for (let i = 0; i < cards.length; ++i) {
    hideCard(cards[i]);
    cards[i].dataset.matched = 0; 
    cards[i].classList.remove(cards[i].className);
    if (cardType === 'color')
      cards[i].classList.add(shuffledCardFronts[i]);
    else if (cardType === 'gradient')
      cards[i].classList.add(shuffledCardFronts[i].id);
  }
}

// when the DOM loads
createDivsForCardFronts(shuffledCardFronts, CARD_TYPE);