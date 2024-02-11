const gameEl = process.argv.slice(2);
const crypto = require("crypto");
const underscore = require("underscore");
const AsiiTable = require("ascii-table");
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

function isUnicEl() {
  let result = [];

  for (let el of gameEl) {
    if (!result.includes(el)) {
      result.push(el);
    }
  }
  return result.length === gameEl.length ? false : true;
}

let hash = function (str, key) {
  if (typeof str == "string" && str.length > 0) {
    let hash = crypto.createHmac("sha3-256", key).update(str).digest("hex");
    return hash;
  } else {
    return false;
  }
};

function getResult(pcMove, move) {
  let result = Math.sign(
    ((pcMove - move + (gameEl.length - 1) / 2 + gameEl.length) %
      gameEl.length) -
      (gameEl.length - 1) / 2
  );

  switch (result) {
    case -1:
      return "Lose";
      break;
    case 1:
      return "Win";
      break;
    default:
      return "Draw";
  }
}
async function main() {
  let pcMoveStr = underscore.sample(gameEl);
  let pcMove = gameEl.indexOf(pcMoveStr) + 1;
  let key = crypto
    .createHash("sha3-256")
    .update(crypto.randomBytes(128))
    .digest("hex");
  let hmac = hash(pcMoveStr, key);
  console.log(`HMAC: ${hmac}`);

  async function question(hind) {
    return new Promise((r) => {
      readline.question(hind, r);
    });
  }

  console.log("Available moves:");
  gameEl.forEach((el, idx) => {
    console.log(`${idx + 1} - ${el}`);
  });
  console.log("0 - exit");
  console.log("? - help");
  const move = await question("Enter your move: ");

  switch (true) {
    case move === "0":
      readline.close();
      break;
    case move === "?":
      let table = new AsiiTable();
      let tableArr = [];
      let firstRow = ["PC\\User", gameEl].flat();
      tableArr.push(firstRow);

      for (let i = 0; i < gameEl.length; i++) {
        let arr = [gameEl[i]];

        for (let n = 0; n < gameEl.length; n++) {
          let result = getResult(i + 1, n + 1);
          arr.push(result);
        }
        tableArr.push(arr);
      }
      table.addRowMatrix(tableArr);
      console.log(table.toString());
      readline.close();
      break;
    case !gameEl[move - 1]:
      console.log("Wrong move. Try again!:( ");
      main();
      break;
    default:
      console.log("Your move: " + gameEl[move - 1]);
      console.log("PC move: " + pcMoveStr);
      console.log(`You ${getResult(pcMove, move).toLowerCase()}!`);
      console.log(`HMAC key: ${key}`);
      main();
  }
}

switch (true) {
  case gameEl.length % 2 === 0:
    console.log("Please enter odd move number.");
    readline.close();
    break;
  case isUnicEl():
    console.log("All moves must be distinct.");
    readline.close();
    break;
  default:
    main();
}
