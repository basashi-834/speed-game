// ==== 変数・設定 ====
let draggedCard = null; // 要素　いまドラッグ中のボタン。
let cpuLevel = "normal";
const levelSettings = {
  easy: { min: 2000, max: 3000 },
  normal: { min: 1500, max: 1700 },
  hard: { min: 700, max: 1000 },
};
let playerDeck;
let cpuDeck;
let field_1Ref;
let field_2Ref;
let isCountdownActive = false;
let isDeadlockMode = false; // デッドロック関連: true の間、プレイヤーはfield2にルール無視でカードを出せる
let isDeckDrawMode = false;
let isGameOver = false;
let cpuTimerId = null;
let countdownTimerId = null;

// ==== ゲームロジック関数 ====
function canPlayerPlay() {
  const currentPlayerHands = document.querySelectorAll("#player-hand button");
  const currentField1 = document.querySelectorAll("#field-1 button");
  const currentField2 = document.querySelectorAll("#field-2 button");

  const field_1Top = currentField1[currentField1.length - 1];
  const field1Num = Number(field_1Top.dataset.value);

  const field_2Top = currentField2[currentField2.length - 1];
  const field2Num = Number(field_2Top.dataset.value);

  const canPlay = Array.from(currentPlayerHands).some((card) => {
    const cardNum = Number(card.dataset.value);
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

  const field_1Top = currentField1[currentField1.length - 1];
  const field1Num = Number(field_1Top.dataset.value);

  const field_2Top = currentField2[currentField2.length - 1];
  const field2Num = Number(field_2Top.dataset.value);

  const canPlay = Array.from(currentCpuHands).some((card) => {
    const cardNum = Number(card.dataset.value);
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
    (playerDeck.length > 0 || cpuDeck.length > 0)
  ) {
    const currentField1 = document.querySelectorAll("#field-1 button");
    const currentField2 = document.querySelectorAll("#field-2 button");
    const field_1Top = currentField1[currentField1.length - 1];
    const field_2Top = currentField2[currentField2.length - 1];

    let messageText =
      playerDeck.length === 0 ? "手札をドラッグしよう" : "山札をドラッグしよう";
    isDeckDrawMode = true;

    const message = document.querySelector("#message");
    message.textContent = messageText;
  }

  // デッドロック関連: whileを抜けても誰も出せず、山札も両方尽きていたら
  // プレイヤーがfield2に手札から自由に出せる「デッドロックモード」に入る
  if (
    !canPlayerPlay() &&
    !canCpuPlay() &&
    playerDeck.length === 0 &&
    cpuDeck.length === 0
  ) {
    isDeadlockMode = true;
    let messageText = "手札をドラッグしよう";

    const message = document.querySelector("#message");
    message.textContent = messageText;
  }
}

function forceCpuPlayFromHand() {
  const cpuHandCards = Array.from(
    document.querySelectorAll("#cpu-hand button"),
  );
  const forcedCard =
    cpuHandCards[Math.floor(Math.random() * cpuHandCards.length)];
  const currentField1 = document.querySelectorAll("#field-1 button");
  const field_1Top = currentField1[currentField1.length - 1];
  field_1Top.textContent = forcedCard.dataset.value;
  field_1Top.dataset.value = forcedCard.dataset.value;
  playPlaceAnimation(field_1Top);
  forcedCard.remove();
  refillHand(cpuDeck, "#cpu-hand button", "#cpu-hand");
}

function handleDrop(fieldNum) {
  if (isCountdownActive || isGameOver) {
    return;
  }
  if (!draggedCard) {
    return;
  }
  const targetField = fieldNum === 1 ? field_1Ref : field_2Ref; //fieldNum に応じて field_1Ref か field_2Ref のどちらかが選ばれる
  const dropTarget = targetField[targetField.length - 1]; //選ばれた方の場札の一番上(ドロップ先)
  const topFieldNum = Number(dropTarget.dataset.value);

  const isPlayer = draggedCard.closest("#player-hand,#player-deck")
    ? true
    : false;
  const judgeNum = Number(draggedCard.dataset.value);
  const isFromDeck = draggedCard.closest("#player-deck") ? true : false;
  const displayValue = draggedCard.dataset.value;

  if (
    Math.abs(judgeNum - topFieldNum) === 1 ||
    (judgeNum === 1 && topFieldNum === 13) ||
    (judgeNum === 13 && topFieldNum === 1) ||
    (isDeadlockMode && fieldNum === 2) || // デッドロック関連: field2に限りルール無視で出せる
    (isDeckDrawMode &&
      fieldNum === 2 &&
      (isFromDeck || playerDeck.length === 0))
  ) {
    dropTarget.textContent = displayValue; //プレイヤーのカードを場に反映
    dropTarget.dataset.value = displayValue;
    playPlaceAnimation(dropTarget);

    // デッドロック関連: プレイヤーが出す直前の状態を退避してから false に戻す
    // (bothCheckの中でまたtrueになる可能性があるため、先に読んでおく
    const wasDeadlockMode = isDeadlockMode;
    const wasDeckDrawMode = isDeckDrawMode;
    isDeadlockMode = false;
    isDeckDrawMode = false;

    // デッドロック関連: プレイヤーが出したのと同時に、CPUも手札からランダムに1枚
    // ルール無視でfield1へ強制的に出す(playCardを経由せず直接処理して再帰を避けている)
    if (wasDeadlockMode) {
      forceCpuPlayFromHand();
    }

    if (wasDeckDrawMode) {
      // 通常処理: CPUの山札から1枚、field1へ強制的に出す
      if (cpuDeck.length > 0) {
        const forcedDeckNum = cpuDeck.shift();
        const currentField1 = document.querySelectorAll("#field-1 button");
        const field_1Top = currentField1[currentField1.length - 1];
        field_1Top.textContent = forcedDeckNum;
        field_1Top.dataset.value = forcedDeckNum;
        playPlaceAnimation(field_1Top);
        updateDeckDisplay(cpuDeck, "#cpu-deck button");
      } else {
        forceCpuPlayFromHand();
      }
    }

    const targetDeck = isPlayer ? playerDeck : cpuDeck;
    const handCardSelector = isPlayer
      ? "#player-hand button"
      : "#cpu-hand button";
    const handAreaSelector = isPlayer ? "#player-hand" : "#cpu-hand";

    if (isFromDeck) {
      playerDeck.shift();
      updateDeckDisplay(playerDeck, "#player-deck button");
    } else {
      draggedCard.remove();
      refillHand(targetDeck, handCardSelector, handAreaSelector);
    }
    bothCheck();
    cpuAutoPlay();
    checkWinner();
  } else {
    playShakeAnimation(dropTarget);
  }
  draggedCard = null;
}

function cpuAutoPlay() {
  clearTimeout(cpuTimerId);
  if (isCountdownActive || isGameOver) {
    return;
  }
  const currentCpuHands = document.querySelectorAll("#cpu-hand button");
  const currentField1 = document.querySelectorAll("#field-1 button");
  const currentField2 = document.querySelectorAll("#field-2 button");

  const field_1Top = currentField1[currentField1.length - 1];
  const field1Num = Number(field_1Top.dataset.value);

  const field_2Top = currentField2[currentField2.length - 1];
  const field2Num = Number(field_2Top.dataset.value);

  // 通常処理: 通常のルールで出せるカードだけを候補にする
  // (デッドロック時の強制出しはhandleDropの中で別処理しているため、ここは常に通常ルールのみ)
  const playableCards = Array.from(currentCpuHands).filter((card) => {
    const cardNum = Number(card.dataset.value);
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
  const plannedCard =
    playableCards[Math.floor(Math.random() * playableCards.length)];

  // 3. setTimeoutで、難易度に応じた時間待ってから、選んだカードをcardCpuClickで出す

  const settings = levelSettings[cpuLevel];
  const delay = getRandomDelay(settings.min, settings.max);
  cpuTimerId = setTimeout(() => {
    playCard(plannedCard, false);
  }, delay);
}

function checkWinner() {
  const message = document.querySelector("#message");
  if (
    document.querySelectorAll("#player-hand button").length === 0 &&
    playerDeck.length === 0
  ) {
    message.textContent = `プレイヤーの勝ち！`;
    isGameOver = true;
  } else if (
    document.querySelectorAll("#cpu-hand button").length === 0 &&
    cpuDeck.length === 0
  ) {
    message.textContent = `CPUの勝ち！`;
    isGameOver = true;
  }
}

function getRandomDelay(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function refillHand(targetDeck, handCardSelector, handAreaSelector) {
  const deckSelector =
    handAreaSelector === "#player-hand"
      ? "#player-deck button"
      : "#cpu-deck button";
  while (
    targetDeck.length > 0 &&
    document.querySelectorAll(handCardSelector).length < 4
  ) {
    const currentHands = Array.from(
      document.querySelectorAll(handCardSelector),
    );
    const newCard = targetDeck.shift(); //山札から1枚減る
    updateDeckDisplay(targetDeck, deckSelector);

    const matchedCard = currentHands.find((handCard) => {
      return Number(handCard.dataset.value) === newCard;
    });

    if (matchedCard) {
      matchedCard.dataset.count = Number(matchedCard.dataset.count) + 1; //既存の手札に重ねる
      matchedCard.classList.add("stacked");
    } else {
      const newCardDraw = document.createElement("button");
      newCardDraw.textContent = newCard;
      newCardDraw.dataset.count = 1;
      newCardDraw.dataset.value = newCard;
      // プレイヤーの手札だけドラッグ可能にする(CPUの手札は操作できないようにする)
      newCardDraw.draggable = handAreaSelector === "#player-hand";

      const handArea = document.querySelector(handAreaSelector);
      handArea.appendChild(newCardDraw);

      newCardDraw.addEventListener("dragstart", () => {
        draggedCard = newCardDraw;
      });
    }
  }
}

function playCard(card, isPlayer) {
  if (isCountdownActive || isGameOver) {
    return;
  }
  const targetDeck = isPlayer ? playerDeck : cpuDeck;
  const handCardSelector = isPlayer
    ? "#player-hand button"
    : "#cpu-hand button";
  const handAreaSelector = isPlayer ? "#player-hand" : "#cpu-hand";
  const cardNum = Number(card.dataset.value);
  const field_1Top = field_1Ref[field_1Ref.length - 1];
  const field1Num = Number(field_1Top.dataset.value);
  const field_2Top = field_2Ref[field_2Ref.length - 1];
  const field2Num = Number(field_2Top.dataset.value);

  if (
    Math.abs(cardNum - field1Num) === 1 ||
    (cardNum === 1 && field1Num === 13) ||
    (cardNum === 13 && field1Num === 1)
  ) //cardNumが13かつ、field1Numが1である場合
  {
    field_1Top.textContent = card.dataset.value; //場のカードを手札のカードで上書きし
    field_1Top.dataset.value = card.dataset.value;
    playPlaceAnimation(field_1Top);
    card.remove(); //cardを削除
    refillHand(targetDeck, handCardSelector, handAreaSelector);
    bothCheck();
    cpuAutoPlay();
    checkWinner();
  } else if (
    Math.abs(cardNum - field2Num) === 1 ||
    (cardNum === 1 && field2Num === 13) ||
    (cardNum === 13 && field2Num === 1)
  ) {
    field_2Top.textContent = card.dataset.value; //場のカードを手札のカードで上書きし
    field_2Top.dataset.value = card.dataset.value;
    playPlaceAnimation(field_2Top);
    card.remove(); //cardを削除
    refillHand(targetDeck, handCardSelector, handAreaSelector);
    bothCheck();
    cpuAutoPlay();
    checkWinner();
  } else {
    if (!isPlayer) {
      cpuAutoPlay();
    }
  }
}

function startCountdown() {
  let count = 5;
  clearInterval(countdownTimerId);
  countdownTimerId = setInterval(() => {
    const message = document.querySelector("#message");
    if (count <= 0) {
      clearInterval(countdownTimerId);
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
function updateDeckDisplay(targetDeck, deckSelector) {
  const deckButton = document.querySelector(deckSelector);
  if (!deckButton) {
    return;
  }
  deckButton.dataset.value = targetDeck[0];
  if (targetDeck.length === 0) {
    deckButton.remove();
  }
}

// 山札ボタン(裏向き)を1つ作って画面に追加する。プレイヤー用だけドラッグ可能にする
function createDeckButton(targetDeck, deckAreaSelector) {
  const newDeckButton = document.createElement("button");
  newDeckButton.textContent = "";
  const deckArea = document.querySelector(deckAreaSelector);
  deckArea.appendChild(newDeckButton);
  updateDeckDisplay(targetDeck, deckAreaSelector + " button");
  newDeckButton.draggable = deckAreaSelector === "#player-deck";
  newDeckButton.addEventListener("dragstart", () => {
    draggedCard = newDeckButton;
  });
}

function playPlaceAnimation(button) {
  button.classList.add("placed");
  button.addEventListener(
    "animationend",
    () => {
      button.classList.remove("placed");
    },
    { once: true },
  );
}

function playShakeAnimation(button) {
  button.classList.add("shake");
  button.addEventListener(
    "animationend",
    () => {
      button.classList.remove("shake");
    },
    { once: true },
  );
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
  playerDeck = deck.slice(0, 26);
  cpuDeck = deck.slice(26);

  /* 26枚の束から先頭の1枚を場に出す
===================================================================== */
  const playerFieldCard = playerDeck.shift();
  const cpuFieldCard = cpuDeck.shift();

  /* 手札カードを生成し、カードボタンをHTMLに追加し、4枚表示(プレイヤー)
===================================================================== */
  refillHand(playerDeck, "#player-hand button", "#player-hand");
  createDeckButton(playerDeck, "#player-deck"); // 山札ドラッグ関連: プレイヤーの山札ボタンを表示

  /* 場2のカードボタンを作っている
===================================================================== */
  const newField2Button = document.createElement("button");
  newField2Button.textContent = playerFieldCard;
  newField2Button.dataset.value = playerFieldCard;
  const field2Area = document.querySelector("#field-2");
  field2Area.appendChild(newField2Button);

  /* 場2のカードボタンを取得している
===================================================================== */
  field_2Ref = document.querySelectorAll("#field-2 button");

  /* 手札カードを生成し、カードボタンをHTMLに追加し、4枚表示(CPU)
===================================================================== */
  refillHand(cpuDeck, "#cpu-hand button", "#cpu-hand");
  createDeckButton(cpuDeck, "#cpu-deck"); // 山札ドラッグ関連: CPUの山札ボタンを表示

  /* 場1のカードボタンを作っている
===================================================================== */
  const newField1Button = document.createElement("button");
  newField1Button.textContent = cpuFieldCard;
  newField1Button.dataset.value = cpuFieldCard;
  const field1Area = document.querySelector("#field-1");
  field1Area.appendChild(newField1Button);

  /* 場1のカードボタンを取得している
===================================================================== */
  field_1Ref = document.querySelectorAll("#field-1 button");

  clearTimeout(cpuTimerId);
  isCountdownActive = true;
  isGameOver = false;
  isDeadlockMode = false;
  isDeckDrawMode = false;
  bothCheck();
  startCountdown();
}

// ==== UI: 難易度ボタン ====
const levelButtons = document.querySelectorAll("#level-select button");

levelButtons.forEach((button) => {
  button.addEventListener("click", () => {
    cpuLevel = button.textContent;
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
