process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../../app");
const db = require("../../db");

let testCompany;
let testInvoice;

beforeEach(async () => {
  const invoiceResult = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`, ["aws", "Amazon Web Services", "Leader in Cloud Technology"]);
  testInvoice = invoiceResult.rows[0];

  const companyResult = await db.query(`SELECT * FROM invoices WHERE comp_code=$1`, [req.params.code])
  testCompany = companyResult.rows[0];
});

afterEach(async () => {
  // makes sure db is cleared after each test in preparation for the next test.
  await db.query(`DELETE FROM companies`)
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
    const response = await request(app).get("/companies/aws");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({company: testCompany});
  });
});

describe("POST /companies", () => {
  test("Create new company", async () => {
    const response = await request(app).post("/companies").send({
      code: "apple",
      name: "Apple Inc.",
      description: "Make of the iPhone"
    });
    
    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      company: {
        code: "apple",
        name: "Apple Inc.",
        description: "Make of the iPhone"
      }
    });
  });
});

describe("PUT /companies/:code", () => {
  test("Change name and description of company matching code parameter", async () => {
    const response = await request(app).put("/companies/aws").send({
      name: "Amazon Web Services Inc.",
      description: "Leader and Future of Cloud Technology"
    });
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      company: {
        code: "aws",
        name: "Amazon Web Services Inc.",
        description: "Leader and Future of Cloud Technology"
      }
    });
  });
});

describe("DELETE /companies/:code", () => {
  test("Delete company using code parameter", async () => {
    const response = await request(app).delete("/companies/aws")
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({status: "Deleted"})
  });
});