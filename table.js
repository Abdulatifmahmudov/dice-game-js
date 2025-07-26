// table.js
// Install required packages: npm install ascii-table chalk

const AsciiTable = require('ascii-table');
const chalk = require('chalk');

// Dice class
class Dice {
  constructor(id, faces) {
    this.id = id;
    this.faces = faces;
  }

  roll(index) {
    return this.faces[index];
  }
}

// DiceSet class
class DiceSet {
  constructor(diceArgs) {
    if (diceArgs.length < 3) throw new Error("Provide at least 3 dice.");
    this.dice = diceArgs.map((arg, idx) => {
      const parts = arg.split(",");
      if (parts.length !== 6) {
        throw new Error(`Dice #${idx} must have exactly 6 values.`);
      }
      const faces = parts.map(Number);
      if (faces.some(isNaN)) {
        throw new Error(`Dice #${idx} contains invalid number(s).`);
      }
      return new Dice(idx, faces);
    });
  }

  showWinTable() {
    console.log();
    console.log(chalk.bold("Probability of the win for the user:"));
    console.log();
    console.log("Each cell shows the probability that the user's die wins over the computer's die.\n");

    const dice = this.dice;
    const header = ['User dice \\'].concat(dice.map(die => chalk.blue(die.faces.join(','))));

    const table = new AsciiTable().setHeading(...header);

    for (let i = 0; i < dice.length; i++) {
      const row = [];
      for (let j = 0; j < dice.length; j++) {
        if (i === j) {
          row.push(chalk.gray.bold('.3333'));
        } else {
          const prob = DiceSet.calcWinProb(dice[i].faces, dice[j].faces);
          row.push(prob.toFixed(4));
        }
      }
      table.addRow(chalk.yellow(dice[i].faces.join(',')), ...row);
    }

    console.log(table.toString());
    console.log();
  }

  static calcWinProb(a, b) {
    let win = 0;
    for (let x of a) {
      for (let y of b) {
        if (x > y) win++;
      }
    }
    return win / 36;
  }
}

// Example usage
const diceArgs = [
  "2,2,4,4,9,9",
  "1,1,6,6,8,8",
  "3,3,5,5,7,7"
];

try {
  const diceSet = new DiceSet(diceArgs);
  diceSet.showWinTable();
} catch (err) {
  console.error(chalk.red('Error:'), err.message);
}
