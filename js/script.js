/*カード52枚を準備する
========================================================================================== */
const deck = [];

for (let i = 0; i < 4; i++) {
  for (let j = 1; j <= 13; j++) {
    deck.push(j);
  }
}

//52枚のカードをランダムにシャッフルする
for (let i = deck.length - 1; i >= 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  let tmp = deck[i];
  deck[i] = deck[j];
  deck[j] = tmp;
}

//シャッフルした52枚のカードをプレイヤーとCPUに分配する
const playerCards = deck.slice(0, 26);
const cpuCards = deck.slice(26);

/*26枚の束から先頭の1枚を場に出す
========================================================================================== */
const playerFieldCard = playerCards.shift();
const cpuFieldCard = cpuCards.shift();

//分けたカードを手札と自分の山札に分ける(プレイヤー)
const playerHandCards = playerCards.slice(0, 4);
const playerDeckCards = playerCards.slice(4);

//分けたカードを手札と自分の山札に分ける(CPU)
const cpuHandCards = cpuCards.slice(0, 4);
const cpuDeckCards = cpuCards.slice(4);

/*手札カードを生成し、カードボタンをHTMLに追加し、4枚表示(プレイヤー)
========================================================================================== */
for (let i = 0; i < playerHandCards.length; i++) {
  const newButton = document.createElement("button");
  newButton.textContent = playerHandCards[i];

  const playerHandArea = document.querySelector("#player-hand");
  playerHandArea.appendChild(newButton);
}

//手札のカードボタンを取得している
const playerHands = document.querySelectorAll("#player-hand button");

//場2のカードボタンを作っている
const newField2Button = document.createElement("button");
newField2Button.textContent = playerFieldCard;

const field2Area = document.querySelector("#field-2");
field2Area.appendChild(newField2Button);

//場2のカードボタンを取得している
const field2Cards = document.querySelectorAll("#field-2 button");

//手札のカードのクリックしたときの動作(プレイヤー)
playerHands.forEach((card) => {
  card.addEventListener("click", () => {
    cardPlayerClick(card);
  });
});

/*手札カードを生成し、カードボタンをHTMLに追加し、4枚表示(CPU)
========================================================================================== */
for (let i = 0; i < cpuHandCards.length; i++) {
  const newCpuButton = document.createElement("button");
  newCpuButton.textContent = cpuHandCards[i];

  const cpuHandArea = document.querySelector("#cpu-hand");
  cpuHandArea.appendChild(newCpuButton);
}

//手札のカードボタンを取得している
const cpuHands = document.querySelectorAll("#cpu-hand button");

//場1のカードボタンを作っている
const newField1Button = document.createElement("button");
newField1Button.textContent = cpuFieldCard;

const field1Area = document.querySelector("#field-1");
field1Area.appendChild(newField1Button);

//場1のカードボタンを取得している
const field1Cards = document.querySelectorAll("#field-1 button");

//手札のカードのクリックしたときの動作(CPU)
cpuHands.forEach((card) => {
  card.addEventListener("click", () => {
    cardCpuClick(card);
  });
});

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
    Math.abs(cardNum - field1Num) === 1 || //引数cardNumとfield1Numの差の絶対値を求め、その値が1と等しいか、または
    (cardNum === 1 && field1Num === 13) || //cardNumが1かつ、field1Numが13、または
    (cardNum === 13 && field1Num === 1)
  ) //cardNumが13かつ、field1Numが1である場合
  {
    console.log("プレイヤーの手札から出した:", card.textContent, "→ field1[" , topField1Card.textContent , "]へ");
    topField1Card.textContent = card.textContent; //場のカードを手札のカードで上書きし
    bothCheck();
    card.remove(); //cardを削除

    if(playerDeckCards.length > 0) {
    const newPlayerCard = playerDeckCards.shift(); //手札のカードを補充する

    const newPlayerCardDraw = document.createElement("button"); //手札カードを生成し、ボタンを追加
    newPlayerCardDraw.textContent = newPlayerCard;

    const playerHandArea = document.querySelector("#player-hand"); //手札にカードを追加する
    playerHandArea.appendChild(newPlayerCardDraw);

    newPlayerCardDraw.addEventListener("click", () => {
      //クリックし手札カードを生成し、ボタンを追加
      cardPlayerClick(newPlayerCardDraw);
    });
  }

  } else if (
    Math.abs(cardNum - field2Num) === 1 || //引数cardNumとfield2Numの差の絶対値を求め、その値が1と等しいか、または
    (cardNum === 1 && field2Num === 13) || //cardNumが1かつ、field2Numが13、または
    (cardNum === 13 && field2Num === 1)
  ) //cardNumが13かつ、field2Numが1である場合
  {
    console.log("プレイヤーの手札から出した:", card.textContent, "→ field2[" ,topField2Card.textContent, "]へ");
    topField2Card.textContent = card.textContent; //場のカードを手札のカードで上書きし
    bothCheck();
    card.remove(); //cardを削除

    if(playerDeckCards.length > 0) {
    const newPlayerCard = playerDeckCards.shift(); //手札のカードを補充する

    const newPlayerCardDraw = document.createElement("button"); //手札カードを生成し、ボタンを追加
    newPlayerCardDraw.textContent = newPlayerCard;

    const playerHandArea = document.querySelector("#player-hand"); //手札にカードを追加する
    playerHandArea.appendChild(newPlayerCardDraw);

    newPlayerCardDraw.addEventListener("click", () => {
      //クリックし手札カードを生成し、ボタンを追加
      cardPlayerClick(newPlayerCardDraw);
    });
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
    Math.abs(cardNum - field1Num) === 1 || //引数cardNumとfield1Numの差の絶対値を求め、その値が1と等しいか、または
    (cardNum === 1 && field1Num === 13) || //cardNumが1かつ、field1Numが13、または
    (cardNum === 13 && field1Num === 1)
  ) //cardNumが13かつ、field1Numが1である場合
  {
    console.log("CPUの手札から出した:",card.textContent,"→ field1[" , topField1Card.textContent , "]へ",);
    topField1Card.textContent = card.textContent; //場のカードを手札のカードで上書きし
    bothCheck();
    card.remove(); //cardを削除

    if(cpuDeckCards.length > 0) {
    const newCpuCard = cpuDeckCards.shift(); //手札のカードを補充する

    const newCpuCardDraw = document.createElement("button"); //手札カードを生成し、ボタンを追加
    newCpuCardDraw.textContent = newCpuCard;

    const cpuHandArea = document.querySelector("#cpu-hand"); //手札にカードを追加する
    cpuHandArea.appendChild(newCpuCardDraw);

    newCpuCardDraw.addEventListener("click", () => {
      //クリックし手札カードを生成し、ボタンを追加
      cardCpuClick(newCpuCardDraw);
    });
  }

  } else if (
    Math.abs(cardNum - field2Num) === 1 || //引数cardNumとfield2Numの差の絶対値を求め、その値が1と等しいか、または
    (cardNum === 1 && field2Num === 13) || //cardNumが1かつ、field2Numが13、または
    //cardNumが13かつ、field2Numが1である場合
    (cardNum === 13 && field2Num === 1)
  ) {
    console.log("CPUの手札から出した:",card.textContent,"→ field2[" ,topField2Card.textContent, "]へ",);
    topField2Card.textContent = card.textContent; //場のカードを手札のカードで上書きし
    bothCheck();
    card.remove(); //cardを削除

    if(cpuDeckCards.length > 0) {
    const newCpuCard = cpuDeckCards.shift(); //手札のカードを補充する

    const newCpuCardDraw = document.createElement("button"); //手札カードを生成し、ボタンを追加
    newCpuCardDraw.textContent = newCpuCard;

    const cpuHandArea = document.querySelector("#cpu-hand");
    cpuHandArea.appendChild(newCpuCardDraw);

    newCpuCardDraw.addEventListener("click", () => {
      //クリックし手札カードを生成し、ボタンを追加
      cardCpuClick(newCpuCardDraw);
    });
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
    console.log("お互いなし");
    if (playerDeckCards.length > 0) {
      const forced1Card = playerDeckCards.shift();
      console.log("プレイヤーの山札から出した:", forced1Card, "→ field2へ");
      topField2Card.textContent = forced1Card;
      // console.log("なし");
    }
    if (cpuDeckCards.length > 0) {
      const forced2Card = cpuDeckCards.shift();
      topField1Card.textContent = forced2Card;
      console.log("CPUの山札から出した:", forced2Card, "→ field1へ");
    }
  } else {
    console.log("あり");
  }
}
