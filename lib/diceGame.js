const { FairRandom } = require("./fairRandom");
const { HelpTable } = require("./helpTable");
const { promptUserChoice } = require("./utils");

class DiceGame {
  constructor(diceArr) {
    this.diceArr = diceArr;
  }

  play() {
    console.log("🎲 Welcome to the Generalized Non-Transitive Dice Game 🎲");

    // Fair turn determination
    const fair = FairRandom.fairNumber(2);
    console.log(`I chose 0 or 1 (HMAC=${fair.hmac})`);
    const guess = promptUserChoice("Guess my number (0 or 1)", 2);
    console.log(`It was: ${fair.number} (KEY=${fair.key.toString("hex")})`);

    const userFirst = parseInt(guess) === fair.number;
    console.log(userFirst ? "You go first!" : "I go first!");

    let userDie, compDie;

    if (userFirst) {
      this._showDiceOptions();
      const choice = promptUserChoice("Choose your die", this.diceArr.length);
      if (choice === "?") {
        HelpTable.show(this.diceArr);
        return this.play(); // 👈 restart the selection step
      }

      userDie = this.diceArr[choice];
      const rest = this.diceArr.filter((d) => d.id !== userDie.id);
      compDie = rest[FairRandom.generateInt(rest.length)];
    } else {
      const compChoice = FairRandom.generateInt(this.diceArr.length);
      compDie = this.diceArr[compChoice];
      console.log(`I choose: ${compDie.faces.join(", ")}`);
      this._showDiceOptions(compDie.id);
      const choice = promptUserChoice("Choose your die", this.diceArr.length);
      if (choice === "?") {
        HelpTable.show(this.diceArr);
        return this.play(); // 👈 again, restart entire round
      }

      if (choice === compDie.id) {
        console.log("You can't choose the same die.");
        process.exit(1);
      }
      userDie = this.diceArr[choice];
    }

    console.log(`\nYour dice: ${userDie.faces.join(", ")}`);
    console.log(`My dice: ${compDie.faces.join(", ")}`);

    // Rolls
    const userRoll = this._fairRoll(userDie, "Your");
    const compRoll = this._fairRoll(compDie, "My");

    // Result
    console.log(`\nResult: You rolled ${userRoll}, I rolled ${compRoll}`);
    if (userRoll > compRoll) console.log("🎉 You win!");
    else if (userRoll < compRoll) console.log("🤖 I win!");
    else console.log("🤝 It's a draw.");
  }

  _fairRoll(die, label) {
    console.log(`\n--- ${label} Turn ---`);
    const fair = FairRandom.fairNumber(6);
    console.log(`I picked a number 0..5 (HMAC=${fair.hmac})`);
    const input = promptUserChoice("Enter your number (mod 6)", 7);
    if (input === "?") {
      HelpTable.show(this.diceArr);
      return this._fairRoll(die, label); // 👈 re-run same roll step
    }

    const index = FairRandom.modularAdd(fair.number, input, 6);
    console.log(`My number: ${fair.number} (KEY=${fair.key.toString("hex")})`);
    return die.faces[index];
  }

  _showDiceOptions(exclude = null) {
    console.log("\nAvailable Dice:");
    for (const die of this.diceArr) {
      if (die.id !== exclude) {
        console.log(`${die.id}: ${die.faces.join(", ")}`);
      }
    }
    console.log("X - exit\n? - help");
  }
}

module.exports = { DiceGame };
