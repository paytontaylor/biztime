const express = require("express");
const ExpressError = require("./ExpressError");
const companiesRoutes = require("./routes/companies/companiesRoutes");
const invoicesRoutes = require("./routes/invoices/invoicesRoutes");
const industriesRoutes = require("./routes/industries/industriesRoutes");

const app = express();

app.use(express.json());
app.use("/companies", companiesRoutes);
app.use("/invoices", invoicesRoutes);
app.use("/industries", industriesRoutes);

app.use((req,res,next) => {
  const error = new ExpressError("Not Found", 404);
  return next(error);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  return res.json({
    error: err.msg
  })
})

module.exports = app;