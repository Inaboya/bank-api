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
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const session = require("express-session");
// const features = new ApiFeatures();
//Load User model
const User_1 = require("../models/User");
//Load Balance model
const Balances_1 = require("../models/Balances");
//Load Transfer model
const Transaction_1 = require("../models/Transaction");
//Load input validation
// import { userRegister, userLogin } from "../validation/user-validation";
const userValidation_1 = require("../validation/userValidation");
const transferValidation_1 = require("../validation/transferValidation");
const router = express_1.default.Router();
router.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: { max: 3600 },
}));
//@route POST api/users/register
//@desc Register user
//@access Public
router.post("/register", (req, res, next) => {
    //Validate user data
    const { error } = (0, userValidation_1.userRegister)(req.body);
    if (error) {
        return res.status(400).json({
            error: error.details[0].message,
        });
    }
    //Check for existing user
    User_1.User.findOne({ email: req.body.email }).then((user) => {
        if (user) {
            return res.status(400).json({
                error: "User already exists \n Please check the email or phone number",
            });
        }
        else {
            //New User
            const newUser = new User_1.User({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: req.body.password,
                phoneNumber: req.body.phoneNumber,
                DOB: new Date(req.body.DOB).toISOString(),
            });
            bcryptjs_1.default.genSalt(10, (err, salt) => {
                bcryptjs_1.default.hash(newUser.password, salt, (err, hash) => {
                    if (err)
                        throw err;
                    newUser.password = hash;
                    newUser.confirm_pwd = hash;
                    newUser
                        .save()
                        .then((user) => res
                        .status(201)
                        .json({ message: "User created successfully", user }))
                        .catch((err) => console.log(err));
                });
            });
        }
    });
});
//@route POST api/users/Login
//@desc Login User / Returning JWT Token
//@access Public
router.post("/login", (req, res) => {
    const { error } = (0, userValidation_1.userLogin)(req.body);
    if (error) {
        return res.status(400).json({
            error: error.details[0].message,
        });
    }
    const email = req.body.email;
    const password = req.body.password;
    //Find by email
    User_1.User.findOne({ email }).then((user) => {
        if (!user) {
            return res.status(400).json({
                error: "Invalid credentials. \n user doesn't exist",
            });
        }
        bcryptjs_1.default.compare(password, user.password).then((isMatch) => {
            if (isMatch) {
                //User matched
                const payload = {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    DOB: user.DOB,
                };
                //Sign Token
                jsonwebtoken_1.default.sign(payload, "secret", {
                    expiresIn: 3600,
                }, (err, token) => {
                    if (err)
                        throw err;
                    console.log(err);
                    const tokenData = token;
                    res.cookie("jwt", tokenData, { httpOnly: true });
                    return res.status(200).json({
                        success: true,
                        token: `Bearer ${tokenData}`,
                    });
                });
            }
            else {
                res.status(400).json({
                    errors: "Incorrect password",
                });
            }
        });
    });
});
//@router POST create an account
//@desc Create an account
//@access Private
router.post("/account", (req, res) => {
    User_1.User.findOne({ email: req.body.email }).then((user) => __awaiter(void 0, void 0, void 0, function* () {
        if (!user) {
            return res.status(400).json({
                error: "User doesn't exists",
            });
        }
        const enteredAccountNumber = yield Balances_1.Balances.findOne()
            .sort({ createdAt: -1 })
            .limit(1);
        const firstMember = {
            userId: user.id,
            accountNumber: 1000000000,
            balance: 5000,
        };
        if (!enteredAccountNumber) {
            yield Balances_1.Balances.create(firstMember);
            return res.status(201).json({
                message: "New account created for the first time",
                firstMember,
            });
        }
        else {
            if (user._id.equals(enteredAccountNumber.userId)) {
                return res.status(400).json({
                    error: "Account already exists",
                });
            }
            else {
                yield Balances_1.Balances.create({
                    userId: user._id,
                    accountNumber: enteredAccountNumber.accountNumber + 1,
                    balance: 5000,
                });
                return res.status(201).json({ message: "New account created" });
            }
        }
    }));
});
//@router POST transfer funds
//@desc Transfer funds
//@access Private
router.post("/transfer", (req, res) => {
    const { amount, senderAccountNumber, receiverAccountNumber, transferDescription, } = req.body;
    const { error } = (0, transferValidation_1.transferValidationInput)(req.body);
    if (error) {
        return res.status(400).json({
            error: `${error.details[0].message}`,
        });
    }
    Balances_1.Balances.findOne({ accountNumber: senderAccountNumber })
        .then((user) => __awaiter(void 0, void 0, void 0, function* () {
        if (!user) {
            return res.status(400).json({
                error: "Sender account doesn't exists",
            });
        }
        if (amount < 0) {
            return res.status(400).json({
                error: "Amount cannot be negative",
            });
        }
        if (user) {
            if (user.balance < amount) {
                return res.status(400).json({
                    error: "Insufficient funds",
                });
            }
            else {
                yield Balances_1.Balances.findOneAndUpdate({ accountNumber: senderAccountNumber }, { $inc: { balance: -amount } }, { status: "Debit" });
                yield Balances_1.Balances.findOneAndUpdate({ accountNumber: receiverAccountNumber }, { $inc: { balance: amount } }, { status: "Credit" });
                yield Transaction_1.Transfer.create({
                    reference: Math.random().toString(2).substr(2, 9) + Date.now(),
                    senderAccountNumber,
                    receiverAccountNumber,
                    amount,
                    transferDescription,
                });
                return res.status(200).json({ message: "Transfer successful" });
            }
        }
    }))
        .catch((err) => console.log(err));
});
//@router GET CREDIT transaction by account number
//@desc Get Credit transaction by account number
//@access Private
router.get("/transaction/credit/:accountNumber", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const creditAccountNumber = req.params.accountNumber;
    Transaction_1.Transfer.find({ receiverAccountNumber: creditAccountNumber })
        .select({ _id: 0 })
        .then((credit) => {
        console.log(credit);
        if (!credit) {
            return res.status(400).json({
                error: "No credit transaction found",
            });
        }
        if (credit) {
            res.status(200).json({
                message: "Credit transaction fetched successfully",
                status: "Credit",
                credit,
            });
        }
    })
        .catch((err) => console.log(res.status(400).json({
        error: "An error occurred fetching the credit transactions.",
    })));
}));
//@router GET DEBIT transaction by account number
//@desc Get Debit transaction by account number
//@access Private
router.get("/transaction/debit/:accountNumber", (req, res) => {
    const debitAccountNumber = req.params.accountNumber;
    Transaction_1.Transfer.find({ senderAccountNumber: debitAccountNumber })
        .select({ _id: 0 })
        .then((debit) => {
        if (!debit) {
            return res.status(400).json({
                error: "No debit transaction found",
            });
        }
        if (debit) {
            res.status(200).json({
                message: "Debit transaction fetched successfully",
                status: "Debit",
                debit,
            });
        }
    })
        .catch((err) => console.log(res.status(400).json({
        error: "An error occurred fetching the debit transactions.",
    })));
});
//@route POST deposit funds
//@desc Deposit funds
//@access Private
router.post("/deposit", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body.amount || !req.body.accountNumber) {
        return res.status(400).json({
            error: "Please enter the amount and account number",
        });
    }
    if (+req.body.amount < 500) {
        return res.status(400).json({
            error: "Minimum deposit amount is 500",
        });
    }
    const deposit = yield Balances_1.Balances.findOne({
        accountNumber: req.body.accountNumber,
    });
    yield Balances_1.Balances.updateOne({ accountNumber: req.body.accountNumber }, {
        $set: { balance: deposit.balance + +req.body.amount },
        $currentDate: { lastModified: true },
    });
    return res.status(200).json({ message: "Deposit successful", deposit });
}));
router.get("/accounts", (req, res) => {
    Balances_1.Balances.find()
        .populate("userId", ["accountNumber", "balance"])
        .then((accounts) => {
        if (!accounts) {
            return res.status(404).json({
                error: "No accounts found",
            });
        }
        res.json(accounts);
    })
        .catch((err) => res.status(400).json({ err: "An error occurred fetching the places" }));
});
//@route GET api/users/accounts/:accountNumber
//@desc Get account by account number
//@access Private
router.get("/balances/:accountNumber", (req, res) => {
    const errors = {
        account: "",
    };
    const acctNo = req.params.accountNumber;
    // console.log(acctNo);
    Balances_1.Balances.findOne({ accountNumber: acctNo })
        .select({ _id: 0 })
        .then((account) => {
        if (!account) {
            errors.account = "This account does not exist";
            res.status(404).json(errors);
        }
        res
            .status(200)
            .json({
            message: "Balance by account number fetched successfully",
            account,
        });
    })
        .catch((err) => res.json(err));
});
//@router GET api/users/accounts/:userId
//@desc GET account by useId
//@access Private
router.get("/balance/:userId", (req, res) => {
    const errors = {
        account: "",
    };
    const userId = req.params.userId;
    Balances_1.Balances.findOne({ userId: userId })
        .select({ _id: 0 })
        .then((account) => {
        if (!account) {
            errors.account = "This account does not exist";
            res.status(404).json(errors);
        }
        res
            .status(200)
            .json({ message: "Balance by userId fetched successfully", account });
    })
        .catch((err) => res.status(400).json({ err: "An error occurred fetching the places" }));
});
exports.default = router;
