function rollDie(sides = 6) {
  return Math.floor(Math.random() * sides);
}

module.exports = { rollDie };