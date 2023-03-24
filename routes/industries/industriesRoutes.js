const express = require("express");
const errorCheck = require("../../helpers/errorCheck");
const db = require("../../db");
const router = new express.Router();

router.get("/", async (req, res, next) => {
  try {
    const result = await db.query(`
    SELECT i.code, i.industry, ci.company_code
    FROM industries AS i
    JOIN companies_industries AS ci
    ON ci.industry_code = i.code
    `);
    errorCheck(result)
    const industryMap = {};

    for (const row of result.rows) {
      if (!industryMap[row.code]) {
        industryMap[row.code] = {
          code: row.code,
          industry: row.industry,
          companies: [],
        };
      }
      industryMap[row.code].companies.push(row.company_code);
    }

    return res.send(Object.values(industryMap));
  } catch (err){
    return next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { code, industry } = req.body;
    const result = await db.query(`INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry`, [code, industry]);
    errorCheck(result);
    return res.status(201).json({ industry: result.rows[0] });
  } catch (err) {
    return next(err)
  }
});

router.post("/:industry_code", async (req, res, next) => {
  try {
    const { company_code } = req.body;
    const result = await db.query(`INSERT INTO companies_industries (company_code, industry_code) VALUES ($1,$2) RETURNING company_code, industry_code`, [company_code, req.params.industry_code]);
    errorCheck(result);
    return res.status(201).json({ industry: result.rows[0] });
  } catch (err) {
    return next(err)
  }
})

module.exports = router;