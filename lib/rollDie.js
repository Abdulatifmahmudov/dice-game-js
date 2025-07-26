const crypto = require('crypto');

function rollDie(sides = 6) {
  const number = crypto.randomInt(sides);
  const key = crypto.randomBytes(32);
  const hmac = crypto.createHmac('sha3-256', key).update(number.toString()).digest('hex');
  return { number, key, hmac };
}

function modularAdd(a, b, mod) {
  return (a + b) % mod;
}

module.exports = { rollDie, modularAdd };
