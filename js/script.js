/*カード52枚を準備する
========================================================================================== */
const deck = [];

for (let i = 0; i < 4; i++) {
  for (let j = 1; j <= 13; j++) {
    deck.push(j);
  }
}

let draggedCard = null;

//52枚のカードをランダムにシャッフルする
for (let i = deck.length - 1; i >= 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  let tmp = deck[i];
  deck[i] = deck[j];
  deck[j] = tmp;
}

//シャッフルした52枚のカードをプレイヤーとCPUに分配する
const playerDeckCards = deck.slice(0, 26);
const cpuDeckCards = deck.slice(26);

/*26枚の束から先頭の1枚を場に出す
========================================================================================== */
const playerFieldCard = playerDeckCards.shift();
const cpuFieldCard = cpuDeckCards.shift();

/*手札カードを生成し、カードボタンをHTMLに追加し、4枚表示(プレイヤー)
========================================================================================== */
while (
  playerDeckCards.length > 0 &&
  document.querySelectorAll("#player-hand button").length < 4
) {
  const playerHandCard = playerDeckCards.shift();
  const currentPlayerHands = Array.from(
    document.querySelectorAll("#player-hand button"),
  );
  const matchedCard = currentPlayerHands.find((handCard) => {
    return Number(handCard.textContent) === playerHandCard;
  });

  if (matchedCard) {
    matchedCard.dataset.count = Number(matchedCard.dataset.count) + 1;
    matchedCard.classList.add("stacked");
  } else {
    const newPlayerCardDraw = document.createElement("button"); //手札カードを生成し、ボタンを追加
    newPlayerCardDraw.textContent = playerHandCard;
    newPlayerCardDraw.dataset.count = 1;
    newPlayerCardDraw.draggable = true;

    const playerHandArea = document.querySelector("#player-hand"); //手札にカードを追加する
    playerHandArea.appendChild(newPlayerCardDraw);
    newPlayerCardDraw.addEventListener("click", () => {
      //クリックし手札カードを生成し、ボタンを追加
      cardPlayerClick(newPlayerCardDraw);
    });

    newPlayerCardDraw.addEventListener("dragstart", () => {
      draggedCard = newPlayerCardDraw;
    });
  }
}

//場2のカードボタンを作っている
const newField2Button = document.createElement("button");
newField2Button.textContent = playerFieldCard;

const field2Area = document.querySelector("#field-2");
field2Area.appendChild(newField2Button);

document.querySelector("#field-2").addEventListener("dragover", (event) => {
  event.preventDefault();
});

//場2のカードボタンを取得している
const field2Cards = document.querySelectorAll("#field-2 button");

/*手札カードを生成し、カードボタンをHTMLに追加し、4枚表示(CPU)
========================================================================================== */
while (
  cpuDeckCards.length > 0 &&
  document.querySelectorAll("#cpu-hand button").length < 4
) {
  const cpuHandCard = cpuDeckCards.shift();
  const currentCpuHands = Array.from(
    document.querySelectorAll("#cpu-hand button"),
  );
  const matchedCard = currentCpuHands.find((handCard) => {
    return Number(handCard.textContent) === cpuHandCard;
  });

  if (matchedCard) {
    matchedCard.dataset.count = Number(matchedCard.dataset.count) + 1;
    matchedCard.classList.add("stacked");
  } else {
    const newCpuCardDraw = document.createElement("button"); //手札カードを生成し、ボタンを追加
    newCpuCardDraw.textContent = cpuHandCard;
    newCpuCardDraw.dataset.count = 1;
    newCpuCardDraw.draggable = true;

    const cpuHandArea = document.querySelector("#cpu-hand"); //手札にカードを追加する
    cpuHandArea.appendChild(newCpuCardDraw);
    newCpuCardDraw.addEventListener("click", () => {
      //クリックし手札カードを生成し、ボタンを追加
      cardCpuClick(newCpuCardDraw);
    });

    newCpuCardDraw.addEventListener("dragstart", () => {
      draggedCard = newCpuCardDraw;
    });
  }
}

//場1のカードボタンを作っている
const newField1Button = document.createElement("button");
newField1Button.textContent = cpuFieldCard;

const field1Area = document.querySelector("#field-1");
field1Area.appendChild(newField1Button);

document.querySelector("#field-1").addEventListener("dragover", (event) => {
  event.preventDefault();
});

//場1のカードボタンを取得している
const field1Cards = document.querySelectorAll("#field-1 button");

bothCheck();

/*クリックしたときの関数(プレイヤー)
========================================================================================== */
function cardPlayerClick(card) {
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
    message.textContent = `プレイヤーの手札から出した: ${card.textContent} → field1[${topField1Card.textContent}]へ`;
    topField1Card.textContent = card.textContent; //場のカードを手札のカードで上書きし
    bothCheck();

    card.remove(); //cardを削除

    while (
      playerDeckCards.length > 0 &&
      document.querySelectorAll("#player-hand button").length < 4
    ) {
      const currentPlayerHands = Array.from(
        document.querySelectorAll("#player-hand button"),
      );
      const newPlayerCard = playerDeckCards.shift(); //手札のカードを補充する

      const matchedCard = currentPlayerHands.find((handCard) => {
        return Number(handCard.textContent) === newPlayerCard;
      });

      if (matchedCard) {
        matchedCard.dataset.count = Number(matchedCard.dataset.count) + 1;
        matchedCard.classList.add("stacked");
      } else {
        const newPlayerCardDraw = document.createElement("button"); //手札カードを生成し、ボタンを追加
        newPlayerCardDraw.textContent = newPlayerCard;
        newPlayerCardDraw.dataset.count = 1;
        newPlayerCardDraw.draggable = true;

        const playerHandArea = document.querySelector("#player-hand"); //手札にカードを追加する
        playerHandArea.appendChild(newPlayerCardDraw);
        newPlayerCardDraw.addEventListener("click", () => {
          //クリックし手札カードを生成し、ボタンを追加
          cardPlayerClick(newPlayerCardDraw);
        });

        newPlayerCardDraw.addEventListener("dragstart", () => {
          draggedCard = newPlayerCardDraw;
        });
      }
    }
  } else if (
    Math.abs(cardNum - field2Num) === 1 ||
    (cardNum === 1 && field2Num === 13) ||
    (cardNum === 13 && field2Num === 1)
  ) //cardNumが13かつ、field2Numが1である場合
  {
    const message = document.querySelector("#message");
    message.textContent = `プレイヤーの手札から出した: ${card.textContent} → field2[${topField2Card.textContent}]へ`;
    topField2Card.textContent = card.textContent; //場のカードを手札のカードで上書きし
    bothCheck();

    card.remove(); //cardを削除

    while (
      playerDeckCards.length > 0 &&
      document.querySelectorAll("#player-hand button").length < 4
    ) {
      const currentPlayerHands = Array.from(
        document.querySelectorAll("#player-hand button"),
      );
      const newPlayerCard = playerDeckCards.shift(); //手札のカードを補充する

      const matchedCard = currentPlayerHands.find((handCard) => {
        return Number(handCard.textContent) === newPlayerCard;
      });

      if (matchedCard) {
        matchedCard.dataset.count = Number(matchedCard.dataset.count) + 1;
        matchedCard.classList.add("stacked");
      } else {
        const newPlayerCardDraw = document.createElement("button"); //手札カードを生成し、ボタンを追加
        newPlayerCardDraw.textContent = newPlayerCard;
        newPlayerCardDraw.dataset.count = 1;
        newPlayerCardDraw.draggable = true;

        const playerHandArea = document.querySelector("#player-hand"); //手札にカードを追加する
        playerHandArea.appendChild(newPlayerCardDraw);
        newPlayerCardDraw.addEventListener("click", () => {
          //クリックし手札カードを生成し、ボタンを追加
          cardPlayerClick(newPlayerCardDraw);
        });

        newPlayerCardDraw.addEventListener("dragstart", () => {
          draggedCard = newPlayerCardDraw;
        });
      }
    }
  }
}

/*クリックしたときの関数(CPU)
========================================================================================== */
function cardCpuClick(card) {
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
    message.textContent = `CPUの手札から出した: ${card.textContent} → field1[${topField1Card.textContent}]へ`;
    topField1Card.textContent = card.textContent; //場のカードを手札のカードで上書きし
    bothCheck();

    card.remove(); //cardを削除

    while (
      cpuDeckCards.length > 0 &&
      document.querySelectorAll("#cpu-hand button").length < 4
    ) {
      const currentCpuHands = Array.from(
        document.querySelectorAll("#cpu-hand button"),
      );
      const newCpuCard = cpuDeckCards.shift(); //手札のカードを補充する

      const matchedCard = currentCpuHands.find((handCard) => {
        return Number(handCard.textContent) === newCpuCard;
      });

      if (matchedCard) {
        matchedCard.dataset.count = Number(matchedCard.dataset.count) + 1;
        matchedCard.classList.add("stacked");
      } else {
        const newCpuCardDraw = document.createElement("button"); //手札カードを生成し、ボタンを追加
        newCpuCardDraw.textContent = newCpuCard;
        newCpuCardDraw.dataset.count = 1;
        newCpuCardDraw.draggable = true;

        const cpuHandArea = document.querySelector("#cpu-hand"); //手札にカードを追加する
        cpuHandArea.appendChild(newCpuCardDraw);
        newCpuCardDraw.addEventListener("click", () => {
          //クリックし手札カードを生成し、ボタンを追加
          cardCpuClick(newCpuCardDraw);
        });

        newCpuCardDraw.addEventListener("dragstart", () => {
          draggedCard = newCpuCardDraw;
        });
      }
    }
  } else if (
    Math.abs(cardNum - field2Num) === 1 ||
    (cardNum === 1 && field2Num === 13) ||
    (cardNum === 13 && field2Num === 1)
  ) {
    const message = document.querySelector("#message");
    message.textContent = `CPUの手札から出した: ${card.textContent} → field2[${topField2Card.textContent}]へ`;
    topField2Card.textContent = card.textContent; //場のカードを手札のカードで上書きし
    bothCheck();

    card.remove(); //cardを削除

    while (
      cpuDeckCards.length > 0 &&
      document.querySelectorAll("#cpu-hand button").length < 4
    ) {
      const currentCpuHands = Array.from(
        document.querySelectorAll("#cpu-hand button"),
      );
      const newCpuCard = cpuDeckCards.shift(); //手札のカードを補充する

      const matchedCard = currentCpuHands.find((handCard) => {
        return Number(handCard.textContent) === newCpuCard;
      });

      if (matchedCard) {
        matchedCard.dataset.count = Number(matchedCard.dataset.count) + 1;
        matchedCard.classList.add("stacked");
      } else {
        const newCpuCardDraw = document.createElement("button"); //手札カードを生成し、ボタンを追加
        newCpuCardDraw.textContent = newCpuCard;
        newCpuCardDraw.dataset.count = 1;
        newCpuCardDraw.draggable = true;

        const cpuHandArea = document.querySelector("#cpu-hand"); //手札にカードを追加する
        cpuHandArea.appendChild(newCpuCardDraw);
        newCpuCardDraw.addEventListener("click", () => {
          //クリックし手札カードを生成し、ボタンを追加
          cardCpuClick(newCpuCardDraw);
        });

        newCpuCardDraw.addEventListener("dragstart", () => {
          draggedCard = newCpuCardDraw;
        });
      }
    }
  }
}

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
  if (!canPlayerPlay() && !canCpuPlay()) {
    const currentField1 = document.querySelectorAll("#field-1 button");
    const currentField2 = document.querySelectorAll("#field-2 button");
    const topField1Card = currentField1[currentField1.length - 1];
    const topField2Card = currentField2[currentField2.length - 1];

    let messageText = "お互いなし";

    if (playerDeckCards.length > 0) {
      const forced1Card = playerDeckCards.shift();
      topField2Card.textContent = forced1Card;
      messageText += `プレイヤーの山札から${forced1Card}をfield2へ`;
    }
    if (cpuDeckCards.length > 0) {
      const forced2Card = cpuDeckCards.shift();
      topField1Card.textContent = forced2Card;
      messageText += `CPUの山札から${forced2Card}をfield1へ`;
    }

    const message = document.querySelector("#message");
    message.textContent = messageText;
  } else {
    console.log("あり");
  }
}

function handleDrop(fieldNum) {
  const currentFieldCards = fieldNum === 1 ? field1Cards : field2Cards;
  const topFieldCard = currentFieldCards[currentFieldCards.length - 1];
  const topFieldNum = Number(topFieldCard.textContent);

  const isPlayer = draggedCard.closest("#player-hand") ? true : false; // プレイヤーのカードかどうか
  const cardNum = Number(draggedCard.textContent); // ドラッグされたカードの数字

  if (
    Math.abs(cardNum - topFieldNum) === 1 ||
    (cardNum === 1 && topFieldNum === 13) ||
    (cardNum === 13 && topFieldNum === 1)
  ) {
    const whoText = isPlayer ? "プレイヤー" : "CPU";
    const message = document.querySelector("#message");
    message.textContent = `${whoText}の手札から出した: ${draggedCard.textContent} → field${fieldNum}[${topFieldCard.textContent}]へ`;
    topFieldCard.textContent = draggedCard.textContent;
    bothCheck();
    draggedCard.remove();
  }
  const currentDeckCards = isPlayer ? playerDeckCards : cpuDeckCards;
  const currentHandSelector = isPlayer
    ? "#player-hand button"
    : "#cpu-hand button";
  const currentHandAreaSelector = isPlayer ? "#player-hand" : "#cpu-hand";
  const currentClickHandler = isPlayer ? cardPlayerClick : cardCpuClick;

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
      newCardDraw.draggable = true;

      const handArea = document.querySelector(currentHandAreaSelector);
      handArea.appendChild(newCardDraw);
      newCardDraw.addEventListener("click", () => {
        currentClickHandler(newCardDraw);
      });

      newCardDraw.addEventListener("dragstart", () => {
        draggedCard = newCardDraw;
      });
    }
  }
}
