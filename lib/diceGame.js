const { rollDie } = require("./rollDie");
const { HelpTable } = require("./helpTable");
const { promptUserChoice } = require("./utils");

class DiceGame {
  constructor(diceArr) {
    this.diceArr = diceArr;
  }

  play() {
    console.log("🎲 Welcome to the Generalized Non-Transitive Dice Game 🎲");

    // Fair turn: simulate a coin flip
    const randomFlip = rollDie(2); // 0 or 1
    const guess = promptUserChoice("Guess my number (0 or 1)", 2);
    const userFirst = parseInt(guess) === randomFlip;
    console.log(`It was: ${randomFlip}`);
    console.log(userFirst ? "You go first!" : "I go first!");

    let userDie, compDie;

    if (userFirst) {
      this._showDiceOptions();
      const choice = promptUserChoice("Choose your die", this.diceArr.length);
      if (choice === "?") {
        HelpTable.show(this.diceArr);
        return this.play();
      }
      userDie = this.diceArr[choice];
      const rest = this.diceArr.filter((d) => d.id !== userDie.id);
      compDie = rest[rollDie(rest.length)];
    } else {
      const compChoice = rollDie(this.diceArr.length);
      compDie = this.diceArr[compChoice];
      console.log(`I choose: ${compDie.faces.join(", ")}`);
      this._showDiceOptions(compDie.id);
      const choice = promptUserChoice("Choose your die", this.diceArr.length);
      if (choice === "?") {
        HelpTable.show(this.diceArr);
        return this.play();
      }
      if (choice === compDie.id) {
        console.log("You can't choose the same die.");
        process.exit(1);
      }
      userDie = this.diceArr[choice];
    }

    console.log(`\nYour dice: ${userDie.faces.join(", ")}`);
    console.log(`My dice: ${compDie.faces.join(", ")}`);

    const userRoll = this._roll(userDie, "Your");
    const compRoll = this._roll(compDie, "My");

    console.log(`\nResult: You rolled ${userRoll}, I rolled ${compRoll}`);
    if (userRoll > compRoll) console.log("🎉 You win!");
    else if (userRoll < compRoll) console.log("🤖 I win!");
    else console.log("🤝 It's a draw.");
  }

  _roll(die, label) {
    console.log(`\n--- ${label} Turn ---`);
    const guess = promptUserChoice("Pick a number (0-5)", 6);
    if (guess === "?") {
      HelpTable.show(this.diceArr);
      return this._roll(die, label);
    }
    const compSecret = rollDie(6);
    const index = (parseInt(guess) + compSecret) % 6;
    console.log(`I picked: ${compSecret}`);
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
