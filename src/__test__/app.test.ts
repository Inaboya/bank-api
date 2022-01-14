import request from "supertest";
import app from "../app";

let token: string;

//SIGN UP ROUTE TESTING
describe("Sign Up/ Register Route & LOGIN ROUTE", () => {
  it("A new user should be registered", async () => {
    const data = {
      firstName: "Inaboya",
      lastName: "Inaboya",
      email: "mocktest@gmail.com",
      password: "12345678",
      phoneNumber: "07123456789",
      DOB: "2020-01-01",
    };

    const response = await request(app).post("/users/register").send(data);

    // console.log(response.body);

    expect(response.status).toBe(201);
  });

  it("User should be able to login ", async () => {
    const data = {
      email: "mocktest@gmail.com",
      password: "12345678",
    };

    const response = await request(app).post("/users/login").send(data);

    // console.log(response);

    token = response.body.token;

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
    expect(response.body).toHaveProperty("token");
  });
});

//Balance Testing

describe("Balance Collections test", () => {
  it("User should be able to create account", async () => {
    const data = {
      email: "mocktest@gmail.com",
    };

    const response = await request(app)
      .post("/users/account")
      .set("Cookie", `Bearer ${token}`)
      .send(data);

    expect(response.status).toBe(201);
    expect(response.body.firstMember.balance).toEqual(5000);
    expect(response.body.firstMember.accountNumber).toEqual(1000000000);
  });

  it("User should be able to deposit", async () => {
    const data = {
      amount: 5000,
      accountNumber: 1000000000,
    };

    const response = await request(app)
      .post("/users/deposit")
      .set("Cookie", `Bearer ${token}`)
      .send(data);

    // console.log(typeof response.body.deposit.balance);
    // console.log(response.body)

    // console.log(typeof data.amount);

    const sum = (response.body.deposit.balance as number) + data.amount;

    // console.log(sum);

    expect(response.status).toBe(200);
    // expect(response.body.deposit.balance).toBe(sum);
  });

  it("User should be able to get balance by account number", async () => {
    const response = await request(app)
      .get("/users/balances/:accountNumber")
      .set("Cookie", `Bearer ${token}`);

    console.log(response.body);

    expect(response.status).toBe(200);
  });

  it("User should be able to get balance by user id", async () => {
    const response = await request(app)
      .get("/users/balances/:accountNumber")
      .set("Cookie", `Bearer ${token}`);

    expect(response.status).toBe(200);
  });
});

describe("Transfer Collection Testing", () => {
  it("User should be able to transfer funds", async () => {
    const data = {
      amount: 1000,
      senderAccountNumber: 1000000000,
      receiverAccountNumber: 1000000001,
      transferDescription: "vgvdgedg",
    };

    const response = await request(app)
      .post("/users/transfer")
      .set("Cookie", `Bearer ${token}`)
      .send(data);

    console.log(response.body);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Transfer successful");
  });

  it("User should be able to get credit transactions by account number", async () => {
    const response = await request(app)
      .get("/users/transaction/credit/:accountNumber")
      .set("Cookie", `Bearer ${token}`);

    console.log(response.body);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      "Credit transaction fetched successfully"
    );
    expect(response.body.status).toBe("Credit");
    expect(response.body).toHaveProperty("credit");
  });

  it("User should be able to get debit transactions by account number", async () => {
    const response = await request(app)
      .get("/users/transaction/debit/:accountNumber")
      .set("Cookie", `Bearer ${token}`);

    console.log(response.body);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      "Debit transaction fetched successfully"
    );
    expect(response.body.status).toBe("Debit");
    expect(response.body).toHaveProperty("debit");
  });
});
