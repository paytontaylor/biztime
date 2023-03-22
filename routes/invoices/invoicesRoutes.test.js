process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../../app");
const db = require("../../db");

let testInvoice;
let testCompany;

beforeEach(async () => {
  let companyResult = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3)`, ["apple", "Apple Inc.", "Maker of the iPhone"])
  testCompany = companyResult.rows[0]

  let invoiceResult = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date`, ["apple", 100])
  testInvoice = invoiceResult.rows[0];
});

afterEach(async () => {
  await db.query(`DELETE FROM companies`);
  await db.query(`DELETE FROM invoices`);
});

afterAll(async () => {
  await db.end();
});

describe("GET /invoices", () => {
  test("Get all invoices", async () => {
    const response = await request(app).get("/invoices");
    console.log(testInvoice);
    console.log(response.body);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({invoices: [testInvoice]})
  })
});