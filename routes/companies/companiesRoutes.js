const express = require("express");
const errorCheck = require("../../helpers/errorCheck");
const router = new express.Router();
const db = require("../../db");
const { default: slugify } = require("slugify");

router.get("/", async (req, res, next) => {
  const result = await db.query(`SELECT * FROM companies`);
  return res.json({companies: result.rows})
});

router.get("/:code", async(req, res, next) => {
  try {
    const results = await db.query(
      `SELECT c.code, c.name, c.description, i.industry
      FROM companies AS c
      LEFT JOIN companies_industries AS ci
      ON ci.company_code = c.code
      LEFT JOIN industries AS i
      ON ci.industry_code = i.code 
      WHERE c.code=$1`, [req.params.code]);
    errorCheck(results);
    const { code, name, description } = results.rows[0]
    const industries = results.rows.map(rows => rows.industry);
    const invoices = await db.query(`SELECT * FROM invoices WHERE comp_code=$1`,[req.params.code]) 
    return res.send({ company: { code, name, description, invoices: invoices.rows, industries} })
  } catch (err) {
    return next(err);
  }
});

router.post("/", async (req, res, next) => {
  const { name, description } = req.body;
  const code = slugify(name, {
    replacement: "-",
    lower: true,
    strict: true
  })
  const result = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`, [code, name, description]);
  return res.status(201).json({company: result.rows[0]})
});

router.put("/:code", async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const result = await db.query(`UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description`, [name, description, req.params.code]);
    if (result.rows.length === 0) throw new ExpressError("Company Not Found", 404);
    return res.json({company: result.rows[0]})
  } catch (err) {
    return next(err)
  }
});

router.delete("/:code", async (req, res, next) => {
  try {
    const result = await db.query(`DELETE FROM companies WHERE code=$1`, [req.params.code]);
    return res.status(200).json({ status: "Deleted" })
  } catch (err) {
    return next(err)
  }
});

module.exports = router;