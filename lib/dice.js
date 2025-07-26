class Dice {
  constructor(id, faces) {
    if (faces.length !== 6) throw new Error("Each dice must have exactly 6 faces.");
    this.id = id;
    this.faces = faces;
  }
}

module.exports = { Dice };
