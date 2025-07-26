const AsciiTable = require('ascii-table');
const chalk = require('chalk');

class HelpTable {
  static show(diceArr) {
    console.log(
      chalk.cyanBright("\nProbability table (P[user > computer]):\n") +
      chalk.dim("Each cell shows the chance your die (row) beats computer die (column). Diagonals show '1.0000' since a die can't play against itself.\n")
    );

    const table = new AsciiTable();
    const headers = ['Your Dice ↓ vs Computer Dice →'].concat(diceArr.map(d => d.faces.join(',')));
    table.setHeading(...headers.map((h, i) => i === 0 ? chalk.bold(h) : chalk.gray.bold(h)));

    for (let i = 0; i < diceArr.length; i++) {
      const row = [chalk.gray.bold(diceArr[i].faces.join(','))];

      for (let j = 0; j < diceArr.length; j++) {
        if (i === j) {
          row.push(chalk.dim(' 1.0000 '));
        } else {
          const p = HelpTable._calcProb(diceArr[i].faces, diceArr[j].faces);
          row.push(p.toFixed(4));
        }
      }

      table.addRow(...row);
    }

    console.log(table.toString());
  }

  static _calcProb(a, b) {
    let win = 0;
    for (let i of a) for (let j of b) if (i > j) win++;
    return win / (a.length * b.length);  // More general
  }
}

module.exports = { HelpTable };
