const { Dice } = require('./lib/dice');
const { DiceGame } = require('./lib/diceGame');

// Parse command-line arguments
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error("Usage: node game.js D1 D2 D3 ... (each D = comma-separated 6 integers)");
  console.log("Example: node game.js 2,2,4,4,9,9 6,8,1,1,8,6 7,5,3,7,5,3");
  process.exit(1);
}

const dice = args.map((arg, i) => new Dice(i, arg.split(',').map(n => parseInt(n.trim(), 10))));

const game = new DiceGame(dice);
game.play();
