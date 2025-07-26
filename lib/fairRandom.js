const crypto = require('crypto');

class FairRandom {
  static generateInt(max) {
    let num;
    do {
      num = crypto.randomBytes(1)[0];
    } while (num >= 256 - (256 % max));
    return num % max;
  }

  static fairNumber(max) {
    const number = this.generateInt(max);
    const key = crypto.randomBytes(32);
    const hmac = crypto.createHmac('sha3-256', key).update(number.toString()).digest('hex');
    return { number, key, hmac };
  }

  static modularAdd(a, b, mod) {
    return (a + b) % mod;
  }
}

module.exports = { FairRandom };
