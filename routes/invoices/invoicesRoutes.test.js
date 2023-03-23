process.env.NODE_ENV = "test";

const request = require("supertest");
const slugify = require("slugify");
const app = require("../../app");
const db = require("../../db");

let testInvoice;
let testCompany;

beforeEach(async () => {
  let companyResult = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`, ["apple", "Apple Inc.", "Maker of the iPhone"])
  testCompany = companyResult.rows[0];

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
  it("should get all invoices", async () => {
    const response = await request(app).get("/invoices");
    const { add_date } = testInvoice;
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({invoices: [{...testInvoice, add_date: add_date.toISOString()}]})
  })
});

describe("GET /invoices/:id", () => {
  it("it should return the invoice with a matching id param", async () => {
    const response = await request(app).get(`/invoices/${testInvoice.id}`);
    let { id, amt, paid, add_date, paid_date } = testInvoice
    add_date = add_date.toISOString();
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({invoice: { id, amt, paid, add_date, paid_date, company: testCompany }})
  })
});

describe("POST /invoices", () => {
  it("should create a new invoice", async () => {
    const response = await request(app).post("/invoices").send({
      comp_code: "apple",
      amt: 500
    });
    expect(response.statusCode).toBe(201);
    expect({
      invoice: {
        id: expect.any(Number),
        comp_code: "apple",
        amt: 500,
        paid: false,
        add_date: expect.any(Date),
        paid_date: null
      }
    })
  })
});

describe ("PUT /invoices/:id", () => {
  it("should edit the invoice with the matching id param", async () => {
    const response = await request(app).put(`/invoices/${testInvoice.id}`).send({
      amt: 250
    })
    const { add_date } = testInvoice;
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({invoice: {...testInvoice, amt: 250, add_date: add_date.toISOString()}})
  })
})

describe("DELETE /invoices/:id", () => {
  it("if should delete the item that matches the id param", async () => {
    const response = await request(app).delete(`/invoices/${testInvoice.id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ status: "deleted"})
  })
})