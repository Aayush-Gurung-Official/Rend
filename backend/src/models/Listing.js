class Listing {
  constructor({ id, ownerId, title, type, price, location }) {
    this.id = id;
    this.ownerId = ownerId;
    this.title = title;
    this.type = type; // 'rent' | 'sale'
    this.price = price;
    this.location = location;
  }
}

module.exports = Listing;

