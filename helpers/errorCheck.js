const ExpressError = require("../ExpressError");

const notFoundCheck = (table) => {
  if (table.rows.length === 0) throw new ExpressError("Not Found", 404);
}

module.exports = notFoundCheck;