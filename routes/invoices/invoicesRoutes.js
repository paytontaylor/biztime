const express = require("express");
const router = express.Router();
const ExpressError = require("../../ExpressError");
const db = require("../../db");

router.get("/", async (req, res, next) => {
  const result = await db.query(`SELECT * FROM invoices`);
  return res.json({invoices: result.rows})
});

router.get("/:id", async (req, res, next) => {
  try {
    const result = await db.query(`SELECT * FROM invoices WHERE id=$1`,[req.params.id]);
    if (result.rows.length === 0) throw new ExpressError("Invoice Not Found", 404);
    return res.json({invoice: result.rows[0]});
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
    const { amt } = req.body;
    const result = await db.query(`UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING id, comp_code, amt, paid, add_date, paid_date`, [amt, req.params.id]);
    if (result.rows.length === 0) throw new ExpressError("Invoice Not Found", 404);
    return res.json({invoice: result.rows[0]})
  } catch (err) {
    return next(err)
  }
});

router.delete("/:id", async (req, res, next) => {
  const result = db.query(`DELETE FROM invoices WHERE id=$1`, [req.params.id]);
  return res.json({ status: "deleted"})
})

module.exports = router;