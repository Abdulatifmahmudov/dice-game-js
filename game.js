const crypto = require("crypto");
const prompt = require("prompt-sync")({ sigint: true });



function parseDiceArgs(args) {
  if (args.length < 3) {
    console.error("Error: Provide at least 3 dice.");
    console.log("Example: node game.js 2,2,4,4,9,9 6,8,1,1,8,6 7,5,3,7,5,3");
    process.exit(1);
  }

  return args.map((arg, index) => {
    const parts = arg.split(",");
    if (parts.length !== 6) {
      console.error(`Error: Dice #${index} must have exactly 6 values.`);
      process.exit(1);
    }
    const faces = parts.map(n => {
      const val = parseInt(n, 10);
      if (isNaN(val)) {
        console.error(`Error: Dice #${index} contains non-integer values.`);
        process.exit(1);
      }
      return val;
    });
    return { id: index, faces };
  });
}

function generateSecureRandomInt(max) {
  let num;
  do {
    num = crypto.randomBytes(1)[0];
  } while (num >= 256 - (256 % max));
  return num % max;
}

function generateFairRandomInt(max) {
  const key = crypto.randomBytes(32); // 256-bit
  const number = generateSecureRandomInt(max);
  const hmac = crypto.createHmac("sha3-256", key).update(number.toString()).digest("hex");
  return { number, key, hmac };
}

function modularAdd(a, b, mod) {
  return (a + b) % mod;
}

function promptUserChoice(promptText, max) {
  while (true) {
    const input = prompt(`${promptText}: `).trim().toUpperCase();
    if (input === "X") {
      console.log("Exiting game.");
      process.exit(0);
    } else if (input === "?") {
      return "?";
    } else {
      const value = parseInt(input);
      if (!isNaN(value) && value >= 0 && value < max) {
        return value;
      }
    }
    console.log("Invalid input.");
  }
}

function showHelp(diceArr) {
  console.log("\nWinning Probabilities Table (as P[A > B]):\n");
  const header = "      " + diceArr.map(d => ` D${d.id} `).join(" ");
  console.log(header);
  for (let i = 0; i < diceArr.length; i++) {
    let row = `D${diceArr[i].id} ->`;
    for (let j = 0; j < diceArr.length; j++) {
      if (i === j) {
        row += " --- ";
      } else {
        const wins = calcWinProb(diceArr[i].faces, diceArr[j].faces);
        row += ` ${wins.toFixed(2)} `;
      }
    }
    console.log(row);
  }
  console.log();
}

function calcWinProb(a, b) {
  let win = 0;
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      if (a[i] > b[j]) win++;
    }
  }
  return win / 36;
}

function performFairRoll(range) {
  const fair = generateFairRandomInt(range);
  console.log(`I selected a number in 0..${range - 1} (HMAC=${fair.hmac})`);
  const userInput = promptUserChoice(`Add your number modulo ${range}`, range + 1);
  if (userInput === "?") return "?";
  const result = modularAdd(fair.number, userInput, range);
  console.log(`My number is ${fair.number} (KEY=${fair.key.toString("hex")})`);
  console.log(`Final result: (${fair.number} + ${userInput}) % ${range} = ${result}`);
  return result;
}

function displayDiceOptions(diceArr, excludeIndex = null) {
  for (const die of diceArr) {
    if (die.id !== excludeIndex) {
      console.log(`${die.id} - ${die.faces.join(",")}`);
    }
  }
  console.log("X - exit\n? - help");
}

// MAIN GAME 

function main() {
  const diceArr = parseDiceArgs(process.argv.slice(2));

  console.log("=== Generalized Non-Transitive Dice Game ===");
  console.log("\nLet's determine who picks the first dice.");

  const firstMoveFair = generateFairRandomInt(2);
  console.log(`I picked 0 or 1 (HMAC=${firstMoveFair.hmac})`);
  const guess = promptUserChoice("Guess my number (0 or 1)", 2);
  const computerNumber = firstMoveFair.number;

  console.log(`My number was: ${computerNumber} (KEY=${firstMoveFair.key.toString("hex")})`);

  const userGuessedRight = parseInt(guess) === computerNumber;
  console.log(userGuessedRight ? "You guessed right! You choose first." : "You guessed wrong. I choose first.");

  let userDie, compDie;

  if (userGuessedRight) {
    displayDiceOptions(diceArr);
    const userChoice = promptUserChoice("Choose your dice", diceArr.length);
    if (userChoice === "?") {
      showHelp(diceArr);
      return;
    }
    userDie = diceArr[userChoice];


    // Computer picks any remaining


    const remaining = diceArr.filter(d => d.id !== userDie.id);
    compDie = remaining[generateSecureRandomInt(remaining.length)];
  } else {
    const compChoice = generateSecureRandomInt(diceArr.length);
    compDie = diceArr[compChoice];
    console.log(`I choose the dice: [${compDie.faces.join(",")}]`);
    displayDiceOptions(diceArr, compDie.id);
    const userChoice = promptUserChoice("Choose your dice", diceArr.length);
    if (userChoice === "?") {
      showHelp(diceArr);
      return;
    }
    if (userChoice === compDie.id) {
      console.log("You cannot choose the same die as me.");
      process.exit(1);
    }
    userDie = diceArr[userChoice];
  }

  console.log(`\nYour dice:    [${userDie.faces.join(", ")}]`);
  console.log(`My dice:      [${compDie.faces.join(", ")}]`);

  // User rolls


  console.log("\n--- Your Turn ---");
  let userRollIndex = performFairRoll(6);
  if (userRollIndex === "?") {
    showHelp(diceArr);
    return;
  }
  const userRoll = userDie.faces[userRollIndex];
  console.log(`Your roll result: ${userRoll}`);

  // Computer rolls

  
  console.log("\n--- My Turn ---");
  let compRollIndex = performFairRoll(6);
  if (compRollIndex === "?") {
    showHelp(diceArr);
    return;
  }
  const compRoll = compDie.faces[compRollIndex];
  console.log(`My roll result: ${compRoll}`);

  console.log("\n--- Result ---");
  if (userRoll > compRoll) {
    console.log("🎉 You win!");
  } else if (compRoll > userRoll) {
    console.log("🤖 I win!");
  } else {
    console.log("🤝 It's a draw.");
  }
}

main();
