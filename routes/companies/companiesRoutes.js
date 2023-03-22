const express = require("express");
const ExpressError = require("../../ExpressError");
const router = new express.Router();
const db = require("../../db");

router.get("/", async (req, res, next) => {
  const result = await db.query(`SELECT * FROM companies`)
  return res.json({companies: result.rows})
});

router.get("/:code", async(req, res, next) => {
  try {
    const companyResult = await db.query(`SELECT * FROM companies WHERE code=$1`, [req.params.code])
    if (companyResult.rows.length === 0) throw new ExpressError("Company Not Found", 404);
    const { code, name, description } = companyResult.rows[0];
    const invoiceResult = await db.query(`SELECT * FROM invoices WHERE comp_code=$1`, [req.params.code])
    return res.json({company: code, name, description, invoices: invoiceResult.rows[0]})
  } catch (err) {
    return next(err);
  }
});

router.post("/", async (req, res, next) => {
  const { code, name, description } = req.body;
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