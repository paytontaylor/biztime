const express = require("express");
const errorCheck = require("../../helpers/errorCheck");
const router = express.Router();
const db = require("../../db");

router.get("/", async (req, res, next) => {
  const result = await db.query(`SELECT * FROM invoices`);
  return res.json({invoices: result.rows})
});

router.get("/:id", async (req, res, next) => {
  try {
    const result = await db.query(`SELECT * FROM invoices WHERE id=$1`,[req.params.id]);
    const { id, amt, paid, add_date, paid_date, comp_code } = result.rows[0];
    const company = await db.query(`SELECT * FROM companies WHERE code=$1`, [comp_code])
    errorCheck(result);
    errorCheck(company);
    return res.json({invoice: {id, amt, paid, add_date, paid_date, company: company.rows[0]}});
  } catch (err){
    return next(err)
  }
});

router.post("/", async (req, res, next) => {
  const { comp_code, amt } = req.body;
  const result = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date`, [comp_code, amt]);
  return res.status(201).json({ invoice: result.rows[0]})
});

router.put("/:id", async(req, res, next) => {
  try {
    let { amt, paid } = req.body;
    let id = req.params.id;
    let paidDate = null;

    const currResult = await db.query(
      `SELECT paid
       FROM invoices
       WHERE id = $1`, [id]);
    errorCheck(currResult);
    
    const currPaidDate = currResult.rows[0].paid_date;

    if (!currPaidDate && paid){
      paidDate = new Date();
    } else if (!paid) {
      paidDate = null;
    } else {
      paidDate = currPaidDate;
    }
    const result = await db.query(`UPDATE invoices SET amt=$1, paid=$2, paid_date=$3 WHERE id=$4 RETURNING id, comp_code, amt, paid, add_date, paid_date`, [amt, paid, paidDate, id]);
    
    return res.json({"invoice": result.rows[0]});
  } catch (err) {
    return next(err)
  }
});

router.delete("/:id", async (req, res, next) => {
  const result = db.query(`DELETE FROM invoices WHERE id=$1`, [req.params.id]);
  return res.json({ status: "deleted"})
})

module.exports = router;