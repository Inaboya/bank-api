"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
let token;
//SIGN UP ROUTE TESTING
describe("Sign Up/ Register Route & LOGIN ROUTE", () => {
    it("A new user should be registered", () => __awaiter(void 0, void 0, void 0, function* () {
        const data = {
            firstName: "Inaboya",
            lastName: "Inaboya",
            email: "mocktest@gmail.com",
            password: "12345678",
            phoneNumber: "07123456789",
            DOB: "2020-01-01",
        };
        const response = yield (0, supertest_1.default)(app_1.default).post("/users/register").send(data);
        expect(response.status).toBe(201);
    }));
    it("User should be able to login ", () => __awaiter(void 0, void 0, void 0, function* () {
        const data = {
            email: "mocktest@gmail.com",
            password: "12345678",
        };
        const response = yield (0, supertest_1.default)(app_1.default).post("/users/login").send(data);
        token = response.body.token;
        console.log(token);
        expect(response.status).toBe(200);
        expect(response.body.token).toBeDefined();
        expect(response.body).toHaveProperty("token");
    }));
});
//Balance Testing
describe("Balance Collections test", () => {
    it("User should be able to create account", () => __awaiter(void 0, void 0, void 0, function* () {
        const data = {
            email: "mocktest@gmail.com",
        };
        const response = yield (0, supertest_1.default)(app_1.default)
            .post("/users/account")
            .set(`Authorization`, `Bearer ${token}`)
            .send(data);
        expect(response.status).toBe(201);
        expect(response.body.firstMember.balance).toEqual(5000);
        expect(response.body.firstMember.accountNumber).toEqual(1000000000);
    }));
    it("User should be able to deposit", () => __awaiter(void 0, void 0, void 0, function* () {
        const data = {
            amount: 5000,
            accountNumber: 1000000000,
        };
        const response = yield (0, supertest_1.default)(app_1.default)
            .post("/users/deposit")
            .set(`Authorization`, `Bearer ${token}`)
            .send(data);
        const sum = response.body.deposit.balance + data.amount;
        // console.log(sum);
        expect(response.status).toBe(200);
    }));
    it("User should be able to get balance by account number", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app_1.default)
            .get("/users/balances/:accountNumber")
            .set(`Authorization`, `Bearer ${token}`);
        expect(response.status).toBe(200);
    }));
    it("User should be able to get balance by user id", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app_1.default)
            .get("/users/balances/:accountNumber")
            .set(`Authorization`, `Bearer ${token}`);
        expect(response.status).toBe(200);
    }));
});
describe("Transfer Collection Testing", () => {
    it("User should be able to transfer funds", () => __awaiter(void 0, void 0, void 0, function* () {
        const data = {
            amount: 1000,
            senderAccountNumber: 1000000000,
            receiverAccountNumber: 1000000001,
            transferDescription: "vgvdgedg",
        };
        const response = yield (0, supertest_1.default)(app_1.default)
            .post("/users/transfer")
            .set(`Authorization`, `Bearer ${token}`)
            .send(data);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Transfer successful");
    }));
    it("User should be able to get credit transactions by account number", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app_1.default)
            .get("/users/transaction/credit/:accountNumber")
            .set(`Authorization`, `Bearer ${token}`);
        // console.log(response.body);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Credit transaction fetched successfully");
        expect(response.body.status).toBe("Credit");
        expect(response.body).toHaveProperty("credit");
    }));
    it("User should be able to get debit transactions by account number", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app_1.default)
            .get("/users/transaction/debit/:accountNumber")
            .set(`Authorization`, `Bearer ${token}`);
        // console.log(response.body);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Debit transaction fetched successfully");
        expect(response.body.status).toBe("Debit");
        expect(response.body).toHaveProperty("debit");
    }));
});
