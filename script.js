// Main emoji set (8 unique emojis for 8 pairs).
const emojiSet = ["😀", "🐶", "🍕", "🚀", "🌈", "🎵", "⚽", "🧩"];

const gameBoard = document.querySelector("#game-board");
const moveCountElement = document.querySelector("#move-count");
const winMessageElement = document.querySelector("#win-message");
const restartButton = document.querySelector("#restart-button");

let firstSelectedCard = null;
let secondSelectedCard = null;
let boardIsLocked = false;
let moves = 0;
let matchedPairs = 0;
let mismatchTimeoutId = null;

// Duplicate and shuffle the emoji list for a new game.
function createShuffledCards() {
  const duplicatedEmojis = emojiSet.concat(emojiSet);

  // Fisher-Yates shuffle for unbiased random ordering.
  for (let i = duplicatedEmojis.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    const currentValue = duplicatedEmojis[i];
    duplicatedEmojis[i] = duplicatedEmojis[randomIndex];
    duplicatedEmojis[randomIndex] = currentValue;
  }

  return duplicatedEmojis;
}

// Build and show the card buttons in the board.
function renderCards() {
  const shuffledCards = createShuffledCards();
  gameBoard.innerHTML = "";

  for (let i = 0; i < shuffledCards.length; i += 1) {
    const emoji = shuffledCards[i];

    const cardButton = document.createElement("button");
    cardButton.className = "card";
    cardButton.type = "button";
    cardButton.setAttribute("data-emoji", emoji);
    cardButton.setAttribute("aria-label", "Memory card");

    cardButton.innerHTML = `
      <span class="card-inner">
        <span class="card-face card-back">?</span>
        <span class="card-face card-front">${emoji}</span>
      </span>
    `;

    cardButton.addEventListener("click", onCardClick);
    gameBoard.appendChild(cardButton);
  }
}

// Reset all values and start a fresh game.
function initializeGame() {
  if (mismatchTimeoutId !== null) {
    clearTimeout(mismatchTimeoutId);
    mismatchTimeoutId = null;
  }

  firstSelectedCard = null;
  secondSelectedCard = null;
  boardIsLocked = false;
  moves = 0;
  matchedPairs = 0;

  moveCountElement.textContent = "0";
  winMessageElement.textContent = "";

  renderCards();
}

// Card click handler for selecting cards and triggering checks.
function onCardClick(event) {
  const clickedCard = event.currentTarget;

  // Stop input while the board is locked.
  if (boardIsLocked) {
    return;
  }

  // Ignore clicks on cards already flipped or matched.
  if (clickedCard.classList.contains("flipped") || clickedCard.classList.contains("matched")) {
    return;
  }

  clickedCard.classList.add("flipped");

  if (firstSelectedCard === null) {
    firstSelectedCard = clickedCard;
    return;
  }

  secondSelectedCard = clickedCard;
  moves += 1;
  moveCountElement.textContent = `${moves}`;

  checkForMatch();
}

// Compare selected cards and keep or hide them.
function checkForMatch() {
  if (firstSelectedCard === null || secondSelectedCard === null) {
    return;
  }

  const firstEmoji = firstSelectedCard.getAttribute("data-emoji");
  const secondEmoji = secondSelectedCard.getAttribute("data-emoji");

  if (firstEmoji === secondEmoji) {
    firstSelectedCard.classList.add("matched");
    secondSelectedCard.classList.add("matched");

    firstSelectedCard.disabled = true;
    secondSelectedCard.disabled = true;

    matchedPairs += 1;
    resetTurn();
    checkForWin();
    return;
  }

  boardIsLocked = true;
  firstSelectedCard.classList.add("mismatch");
  secondSelectedCard.classList.add("mismatch");

  // Show cards briefly before flipping unmatched cards back.
  mismatchTimeoutId = setTimeout(function () {
    if (firstSelectedCard === null || secondSelectedCard === null) {
      mismatchTimeoutId = null;
      return;
    }

    firstSelectedCard.classList.remove("flipped");
    secondSelectedCard.classList.remove("flipped");
    firstSelectedCard.classList.remove("mismatch");
    secondSelectedCard.classList.remove("mismatch");

    resetTurn();
    mismatchTimeoutId = null;
  }, 800);
}

// Clear selected cards and unlock board input.
function resetTurn() {
  firstSelectedCard = null;
  secondSelectedCard = null;
  boardIsLocked = false;
}

// If all pairs are matched, show the win message.
function checkForWin() {
  if (matchedPairs === emojiSet.length) {
    winMessageElement.textContent = `You won in ${moves} moves!`;
  }
}

restartButton.addEventListener("click", initializeGame);

initializeGame();
