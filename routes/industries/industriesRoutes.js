const express = require("express");
const ExpressError = require("../../ExpressError");
const db = require("../../db");
const router = new express.Router();

router.get("/", async (req, res, next) => {
  const result = await db.query(`
  SELECT i.industry, ci.company_code 
  FROM industries AS i
  JOIN companies_industries AS ci
  ON ci.industry_code = i.code 
  `);
  return res.send(result.rows)
});

module.exports = router;