/*
Unit 4.5.1 Memory Game Challenge
Hall, Ashley
Cohort Aug 2021
*/

const gameContainer = document.getElementById("game");
const startBtn = document.querySelector('button');
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


const getColorArray = (numberOfPairs) => {
  let colorArray = [];
  for (let i = 0; i < numberOfPairs; ++i) {
    const color = getRandHexColor();
    // push twice for a matching pair
    colorArray.push(color);
    colorArray.push(color);
  }
  return colorArray;
} 

let COLORS = getColorArray(numMatchingCardPairs);


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

const totalPossibleMatches = COLORS.length / 2; 
let totalCurrentMatches = 0; 

const initNewGame = () => {
  score = 0;
  displayTopScore(); 
  firstGuessedCard = '';
  needToWait = false;
  totalCurrentMatches = 0;
  shuffleCards();
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

let shuffledColors = shuffle(COLORS);

const revealCard = (card) => {
  card.style.backgroundColor = card.className;
}

const hideCard = (card) => {
  card.style.backgroundColor = 'white';
}

// this function loops over the array of colors
// it creates a new div and gives it a class with the value of the color
// it also adds an event listener for a click for each card
function createDivsForColors(colorArray) {
  for (let color of colorArray) {
    // create a new div
    const newDiv = document.createElement("div");

    // give it a class attribute for the value we are looping over
    newDiv.classList.add(color);

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
  revealCard(card);

  // update guess count & display
  ++score;
  updateScoreDisplay();
  
  // if card is first guess, store it
  if (!firstGuessedCard) { 
    firstGuessedCard = card;
    return; // first card, so don't need to compare
  }
  
  // if cards don't match, flip over after 1s
  if (card.className !== firstGuessedCard.className) {
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

const shuffleCards = () => {
  shuffledColors = shuffle(getColorArray(numMatchingCardPairs));
  const cards = gameContainer.children;
  for (let i = 0; i < cards.length; ++i) {
    hideCard(cards[i]);
    cards[i].dataset.matched = 0; 
    cards[i].classList.remove(cards[i].className);
    cards[i].classList.add(shuffledColors[i]);
  }
}

// when the DOM loads
createDivsForColors(shuffledColors);