const { listings } = require("../seed/listings");

const filterListings = (filters = {}) => {
  const { type, city, minPrice, maxPrice, beds } = filters;
  let results = [...listings];

  if (type && type !== "all") {
    results = results.filter(
      (l) => l.category.toLowerCase() === String(type).toLowerCase()
    );
  }

  if (city) {
    const lcCity = String(city).toLowerCase();
    results = results.filter((l) => l.city.toLowerCase().includes(lcCity));
  }

  if (minPrice) {
    results = results.filter((l) => l.price >= Number(minPrice));
  }

  if (maxPrice) {
    results = results.filter((l) => l.price <= Number(maxPrice));
  }

  if (beds) {
    results = results.filter((l) => l.beds >= Number(beds));
  }

  return results;
};

const getAllListings = (filters) => filterListings(filters);

const getFeaturedListings = () => listings.filter((l) => l.isFeatured);

module.exports = {
  getAllListings,
  getFeaturedListings,
};

