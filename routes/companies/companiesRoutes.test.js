process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../../app");
const db = require("../../db");

let testCompany;
let testInvoice;
let testIndustry;
let testCompaniesIndustries;

beforeEach(async () => {
  const companyResult = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`,["amazon-web-services", "Amazon Web Services", "Leader in Cloud Technology"]);
  testCompany = companyResult.rows[0];

  const invoiceResult = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date`, ["amazon-web-services", 100]);
  testInvoice = invoiceResult.rows[0];
});

afterEach(async () => {
  // makes sure db is cleared after each test in preparation for the next test.
  await db.query(`DELETE FROM companies`)
  await db.query(`DELETE FROM invoices`)
});

afterAll(async () => {
  // closes db connection once tests are complete.
  await db.end();
})

describe("GET /companies", () => {
  test("Get a list containing of one test company", async () => {
    const response = await request(app).get("/companies");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({companies: [testCompany]})
  });
});

describe("GET /companies/:code", () => {
  test("Get individual company using company code", async () => {
    const response = await request(app).get(`/companies/${testCompany.code}`);
  });
});

describe("POST /companies", () => {
  test("Create new company", async () => {
    const response = await request(app).post("/companies").send({
      name: "Apple Inc.",
      description: "Make of the iPhone"
    });
    
    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      company: {
        code: "apple-inc",
        name: "Apple Inc.",
        description: "Make of the iPhone"
      }
    });
  });
});

describe("PUT /companies/:code", () => {
  test("Change name and description of company matching code parameter", async () => {
    const response = await request(app).put(`/companies/${testCompany.code}`).send({
      name: "Amazon Web Services Inc",
      description: "Leader and Future of Cloud Technology"
    });
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      company: {
        code: "amazon-web-services-inc",
        name: "Amazon Web Services Inc",
        description: "Leader and Future of Cloud Technology"
      }
    });
  });
});

describe("DELETE /companies/:code", () => {
  test("Delete company using code parameter", async () => {
    const response = await request(app).delete(`/companies/${testCompany.code}`)
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({status: "Deleted"})
  });
});