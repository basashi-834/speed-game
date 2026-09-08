// ==== 変数・設定 ====
let draggedCard = null;
let cpuDifficulty = "normal";
const difficultySettings = {
  easy: { min: 2000, max: 3000 },
  normal: { min: 1500, max: 1700 },
  hard: { min: 700, max: 1000 },
};
let playerDeckCards;
let cpuDeckCards;
let field1Cards;
let field2Cards;
let isCountdownActive = false;
let isDeadlockMode = false; // デッドロック関連: true の間、プレイヤーはfield2にルール無視でカードを出せる
let isDeckDrawMode = false;

// ==== ゲームロジック関数 ====
function canPlayerPlay() {
  const currentPlayerHands = document.querySelectorAll("#player-hand button");
  const currentField1 = document.querySelectorAll("#field-1 button");
  const currentField2 = document.querySelectorAll("#field-2 button");

  const topField1Card = currentField1[currentField1.length - 1];
  const field1Num = Number(topField1Card.textContent);

  const topField2Card = currentField2[currentField2.length - 1];
  const field2Num = Number(topField2Card.textContent);

  const canPlay = Array.from(currentPlayerHands).some((card) => {
    const cardNum = Number(card.textContent);
    return (
      Math.abs(cardNum - field1Num) === 1 ||
      (cardNum === 1 && field1Num === 13) ||
      (cardNum === 13 && field1Num === 1) ||
      Math.abs(cardNum - field2Num) === 1 ||
      (cardNum === 1 && field2Num === 13) ||
      (cardNum === 13 && field2Num === 1)
    );
  });
  return canPlay;
}

function canCpuPlay() {
  const currentCpuHands = document.querySelectorAll("#cpu-hand button");
  const currentField1 = document.querySelectorAll("#field-1 button");
  const currentField2 = document.querySelectorAll("#field-2 button");

  const topField1Card = currentField1[currentField1.length - 1];
  const field1Num = Number(topField1Card.textContent);

  const topField2Card = currentField2[currentField2.length - 1];
  const field2Num = Number(topField2Card.textContent);

  const canPlay = Array.from(currentCpuHands).some((card) => {
    const cardNum = Number(card.textContent);
    return (
      Math.abs(cardNum - field1Num) === 1 ||
      (cardNum === 1 && field1Num === 13) ||
      (cardNum === 13 && field1Num === 1) ||
      Math.abs(cardNum - field2Num) === 1 ||
      (cardNum === 1 && field2Num === 13) ||
      (cardNum === 13 && field2Num === 1)
    );
  });
  return canPlay;
}

function bothCheck() {
  // 通常処理: お互い出せない間、山札が残っている限り繰り返し強制出しする
  // (デッドロック関連: 山札が両方尽きたら自然にこのループを抜ける)
  if (
    !canPlayerPlay() &&
    !canCpuPlay() &&
    (playerDeckCards.length > 0 || cpuDeckCards.length > 0)
  ) {

    const currentField1 = document.querySelectorAll("#field-1 button");
    const currentField2 = document.querySelectorAll("#field-2 button");
    const topField1Card = currentField1[currentField1.length - 1];
    const topField2Card = currentField2[currentField2.length - 1];

    let messageText = "お互いなし";
    isDeckDrawMode = true;

    
    /* 通常処理: CPUの山札から1枚、field1へ強制的に出す
    if (cpuDeckCards.length > 0) {
      const forced2Card = cpuDeckCards.shift();
      topField1Card.textContent = forced2Card;
      messageText += `CPUの山札から${forced2Card}をfield1へ`;
    } */

    const message = document.querySelector("#message");
    message.textContent = messageText;
  }

  // デッドロック関連: whileを抜けても誰も出せず、山札も両方尽きていたら
  // プレイヤーがfield2に手札から自由に出せる「デッドロックモード」に入る
  if (
    !canPlayerPlay() &&
    !canCpuPlay() &&
    playerDeckCards.length === 0 &&
    cpuDeckCards.length === 0
  ) {
    isDeadlockMode = true;
  }
}

function handleDrop(fieldNum) {
  if (isCountdownActive) {
    return;
  }
  const currentFieldCards = fieldNum === 1 ? field1Cards : field2Cards; //field1Cardsが選ばれる
  const topFieldCard = currentFieldCards[currentFieldCards.length - 1]; //field1の一番上
  const topFieldNum = Number(topFieldCard.textContent);

  const isPlayer = draggedCard.closest("#player-hand,#player-deck") ? true : false;
  const cardNum = Number(draggedCard.textContent);
  const cardValue = draggedCard.closest("#player-deck") ? draggedCard.dataset.value : draggedCard.textContent;

  if (
    Math.abs(cardNum - topFieldNum) === 1 ||
    (cardNum === 1 && topFieldNum === 13) ||
    (cardNum === 13 && topFieldNum === 1) ||
    (isDeadlockMode && fieldNum === 2) || // デッドロック関連: field2に限りルール無視で出せる
    (isDeckDrawMode && fieldNum === 2)
  ) {
    const whoText = isPlayer ? "プレイヤー" : "CPU";
    const message = document.querySelector("#message");
    message.textContent = `${whoText}の手札から出した: ${cardValue} → field${fieldNum}[${topFieldCard.textContent}]へ`;
    topFieldCard.textContent = cardValue; //プレイヤーのカードを場に反映

    // デッドロック関連: プレイヤーが出す直前の状態を退避してから false に戻す
    // (bothCheckの中でまたtrueになる可能性があるため、先に読んでおく
    const wasDeadlockMode = isDeadlockMode;
    isDeadlockMode = false;
    bothCheck();

    // デッドロック関連: プレイヤーが出したのと同時に、CPUも手札からランダムに1枚
    // ルール無視でfield1へ強制的に出す(cardClickを経由せず直接処理して再帰を避けている)
    if (wasDeadlockMode) {
      const cpuHandCards = Array.from(
        document.querySelectorAll("#cpu-hand button"),
      );
      const chosenCard =
        cpuHandCards[Math.floor(Math.random() * cpuHandCards.length)];
      const currentField1 = document.querySelectorAll("#field-1 button");
      const topField1Card = currentField1[currentField1.length - 1];
      topField1Card.textContent = chosenCard.textContent; //CPUのカードをfield1に反映
      chosenCard.remove();
      refillHand(cpuDeckCards, "#cpu-hand button", "#cpu-hand");
    }

    cpuAutoPlay();
    draggedCard.remove();

    const currentDeckCards = isPlayer ? playerDeckCards : cpuDeckCards;
    const currentHandSelector = isPlayer
      ? "#player-hand button"
      : "#cpu-hand button";
    const currentHandAreaSelector = isPlayer ? "#player-hand" : "#cpu-hand";

    refillHand(currentDeckCards, currentHandSelector, currentHandAreaSelector);
  }
}

function cpuAutoPlay() {
  if (isCountdownActive) {
    return;
  }
  const currentCpuHands = document.querySelectorAll("#cpu-hand button");
  const currentField1 = document.querySelectorAll("#field-1 button");
  const currentField2 = document.querySelectorAll("#field-2 button");

  const topField1Card = currentField1[currentField1.length - 1];
  const field1Num = Number(topField1Card.textContent);

  const topField2Card = currentField2[currentField2.length - 1];
  const field2Num = Number(topField2Card.textContent);

  // 通常処理: 通常のルールで出せるカードだけを候補にする
  // (デッドロック時の強制出しはhandleDropの中で別処理しているため、ここは常に通常ルールのみ)
  const playableCards = Array.from(currentCpuHands).filter((card) => {
    const cardNum = Number(card.textContent);
    return (
      Math.abs(cardNum - field1Num) === 1 ||
      (cardNum === 1 && field1Num === 13) ||
      (cardNum === 13 && field1Num === 1) ||
      Math.abs(cardNum - field2Num) === 1 ||
      (cardNum === 1 && field2Num === 13) ||
      (cardNum === 13 && field2Num === 1)
    );
  });

  // 1. playableCardsが空なら何もしない(CPUは出せるカードがない)
  if (playableCards.length === 0) {
    return;
  }
  // 2. playableCardsの中からランダムに1枚選ぶ
  const chosenCard =
    playableCards[Math.floor(Math.random() * playableCards.length)];

  // 3. setTimeoutで、難易度に応じた時間待ってから、選んだカードをcardCpuClickで出す

  const settings = difficultySettings[cpuDifficulty];
  const delay = getRandomDelay(settings.min, settings.max);
  setTimeout(() => {
    cardClick(chosenCard, false);
  }, delay);
}

function getRandomDelay(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function refillHand(
  currentDeckCards,
  currentHandSelector,
  currentHandAreaSelector,
) {
  while (
    currentDeckCards.length > 0 &&
    document.querySelectorAll(currentHandSelector).length < 4
  ) {
    const currentHands = Array.from(
      document.querySelectorAll(currentHandSelector),
    );
    const newCard = currentDeckCards.shift();

    const matchedCard = currentHands.find((handCard) => {
      return Number(handCard.textContent) === newCard;
    });

    if (matchedCard) {
      matchedCard.dataset.count = Number(matchedCard.dataset.count) + 1;
      matchedCard.classList.add("stacked");
    } else {
      const newCardDraw = document.createElement("button");
      newCardDraw.textContent = newCard;
      newCardDraw.dataset.count = 1;
      // プレイヤーの手札だけドラッグ可能にする(CPUの手札は操作できないようにする)
      newCardDraw.draggable = currentHandAreaSelector === "#player-hand";

      const handArea = document.querySelector(currentHandAreaSelector);
      handArea.appendChild(newCardDraw);

      newCardDraw.addEventListener("dragstart", () => {
        draggedCard = newCardDraw;
      });
    }
  }
}

function cardClick(card, isPlayer) {
  if (isCountdownActive) {
    return;
  }
  const currentDeckCards = isPlayer ? playerDeckCards : cpuDeckCards;
  const currentHandSelector = isPlayer
    ? "#player-hand button"
    : "#cpu-hand button";
  const currentHandAreaSelector = isPlayer ? "#player-hand" : "#cpu-hand";
  const whoText = isPlayer ? "プレイヤー" : "CPU";

  const cardNum = Number(card.textContent);
  const topField1Card = field1Cards[field1Cards.length - 1];
  const field1Num = Number(topField1Card.textContent);
  const topField2Card = field2Cards[field2Cards.length - 1];
  const field2Num = Number(topField2Card.textContent);

  if (
    Math.abs(cardNum - field1Num) === 1 ||
    (cardNum === 1 && field1Num === 13) ||
    (cardNum === 13 && field1Num === 1)
  ) //cardNumが13かつ、field1Numが1である場合
  {
    const message = document.querySelector("#message");
    message.textContent = `${whoText}の手札から出した: ${card.textContent} → field1[${topField1Card.textContent}]へ`;
    topField1Card.textContent = card.textContent; //場のカードを手札のカードで上書きし
    bothCheck();
    cpuAutoPlay();
    card.remove(); //cardを削除
    refillHand(currentDeckCards, currentHandSelector, currentHandAreaSelector);
  } else if (
    Math.abs(cardNum - field2Num) === 1 ||
    (cardNum === 1 && field2Num === 13) ||
    (cardNum === 13 && field2Num === 1)
  ) {
    const message = document.querySelector("#message");
    message.textContent = `${whoText}の手札から出した: ${card.textContent} → field2[${topField2Card.textContent}]へ`;
    topField2Card.textContent = card.textContent; //場のカードを手札のカードで上書きし
    bothCheck();
    cpuAutoPlay();
    card.remove(); //cardを削除
    refillHand(currentDeckCards, currentHandSelector, currentHandAreaSelector);
  }
}

function startCountdown() {
  let count = 5;

  const timerId = setInterval(() => {
    const message = document.querySelector("#message");
    if (count <= 0) {
      clearInterval(timerId);
      message.textContent = "スタート！";
      isCountdownActive = false;
      cpuAutoPlay(); // カウントダウン終了と同時に、CPUの最初の1手を始動させる
    } else {
      message.textContent = count;
      count--;
    }
  }, 1000);
}

// ==== 山札ドラッグ処理 ====
// 山札ボタン(裏向き)の見えないデータ(dataset.value)を、山札の一番上の数字で更新する
function updateDeckDisplay(currentDeckCards,deckSelector){
  const deckButton = document.querySelector(deckSelector);
  deckButton.dataset.value = currentDeckCards[0];
}

// 山札ボタン(裏向き)を1つ作って画面に追加する。プレイヤー用だけドラッグ可能にする
function createDeckButton(currentDeckCards,deckAreaSelector){
  const newDeckButton = document.createElement("button");
  newDeckButton.textContent = "";
  const deckArea = document.querySelector(deckAreaSelector);
  deckArea.appendChild(newDeckButton);
  updateDeckDisplay(currentDeckCards, deckAreaSelector + " button");
  newDeckButton.draggable = deckAreaSelector === "#player-deck";
  newDeckButton.addEventListener("dragstart", () => {
    draggedCard = newDeckButton;
  });
}

// ==== ゲーム開始処理 ====
function startGame() {
  document.querySelector("#player-hand").innerHTML = "";
  document.querySelector("#cpu-hand").innerHTML = "";
  document.querySelector("#field-1").innerHTML = "";
  document.querySelector("#field-2").innerHTML = "";
  document.querySelector("#message").innerHTML = "";
  document.querySelector("#player-deck").innerHTML = ""; // 山札ドラッグ関連: 再スタート時に山札ボタンをクリア
  document.querySelector("#cpu-deck").innerHTML = ""; // 山札ドラッグ関連: 再スタート時に山札ボタンをクリア

  const deck = [];
  for (let i = 0; i < 4; i++) {
    for (let j = 1; j <= 13; j++) {
      deck.push(j);
    }
  }

  /* 52枚のカードをランダムにシャッフルする
===================================================================== */
  for (let i = deck.length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    let tmp = deck[i];
    deck[i] = deck[j];
    deck[j] = tmp;
  }

  /* シャッフルした52枚のカードをプレイヤーとCPUに分配する===================================================================== */
  playerDeckCards = deck.slice(0, 26);
  cpuDeckCards = deck.slice(26);

  /* 26枚の束から先頭の1枚を場に出す
===================================================================== */
  const playerFieldCard = playerDeckCards.shift();
  const cpuFieldCard = cpuDeckCards.shift();

  /* 手札カードを生成し、カードボタンをHTMLに追加し、4枚表示(プレイヤー)
===================================================================== */
  refillHand(playerDeckCards, "#player-hand button", "#player-hand");
  createDeckButton(playerDeckCards, "#player-deck"); // 山札ドラッグ関連: プレイヤーの山札ボタンを表示

  /* 場2のカードボタンを作っている
===================================================================== */
  const newField2Button = document.createElement("button");
  newField2Button.textContent = playerFieldCard;
  const field2Area = document.querySelector("#field-2");
  field2Area.appendChild(newField2Button);

  /* 場2のカードボタンを取得している
===================================================================== */
  field2Cards = document.querySelectorAll("#field-2 button");

  /* 手札カードを生成し、カードボタンをHTMLに追加し、4枚表示(CPU)
===================================================================== */
  refillHand(cpuDeckCards, "#cpu-hand button", "#cpu-hand");
  createDeckButton(cpuDeckCards, "#cpu-deck"); // 山札ドラッグ関連: CPUの山札ボタンを表示

  /* 場1のカードボタンを作っている
===================================================================== */
  const newField1Button = document.createElement("button");
  newField1Button.textContent = cpuFieldCard;

  const field1Area = document.querySelector("#field-1");
  field1Area.appendChild(newField1Button);

  /* 場1のカードボタンを取得している
===================================================================== */
  field1Cards = document.querySelectorAll("#field-1 button");

  isCountdownActive = true;
  bothCheck();
  startCountdown();
}

// ==== UI: 難易度ボタン ====
const difficultyButtons = document.querySelectorAll(
  "#difficulty-select button",
);

difficultyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    cpuDifficulty = button.textContent;
    startGame();
  });
});

// ==== UI: 場札イベント ====
document.querySelector("#field-2").addEventListener("dragover", (event) => {
  event.preventDefault();
});

document.querySelector("#field-2").addEventListener("drop", (event) => {
  handleDrop(2);
});

document.querySelector("#field-1").addEventListener("dragover", (event) => {
  event.preventDefault();
});

document.querySelector("#field-1").addEventListener("drop", (event) => {
  handleDrop(1);
});