const prompt = require("prompt-sync")({ sigint: true });

function promptUserChoice(message, max) {
  while (true) {
    const input = prompt(`${message}: `).trim().toUpperCase();
    if (input === "X") process.exit(0);
    if (input === "?") return "?";
    const val = parseInt(input);
    if (!isNaN(val) && val >= 0 && val < max) return val;
    console.log("Invalid input. Try again.");
  }
}

module.exports = { promptUserChoice };
