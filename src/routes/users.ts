import express, { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import ApiFeatures from "../utils/apiFeatures";

const session = require("express-session");

// const features = new ApiFeatures();

//Load User model
import { User } from "../models/User";

//Load Balance model
import { Balances, balancesModel } from "../models/Balances";

//Load Transfer model

import { Transfer } from "../models/Transaction";

//Load input validation
// import { userRegister, userLogin } from "../validation/user-validation";

import { userRegister, userLogin } from "../validation/userValidation";
import { transferValidationInput } from "../validation/transferValidation";

const router = express.Router();

router.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: { max: 3600 },
  })
);

//@route POST api/users/register
//@desc Register user
//@access Public

router.post("/register", (req: Request, res: Response, next: NextFunction) => {
  //Validate user data
  const { error } = userRegister(req.body);
  if (error) {
    return res.status(400).json({
      error: error.details[0].message,
    });
  }

  //Check for existing user
  User.findOne({ email: req.body.email }).then((user) => {
    if (user) {
      return res.status(400).json({
        error: "User already exists \n Please check the email or phone number",
      });
    } else {
      //New User

      const newUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        phoneNumber: req.body.phoneNumber,
        DOB: new Date(req.body.DOB).toISOString(),
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;

          newUser.password = hash;
          newUser.confirm_pwd = hash;

          newUser
            .save()
            .then((user) =>
              res
                .status(201)
                .json({ message: "User created successfully", user })
            )
            .catch((err) => console.log(err));
        });
      });
    }
  });
});

//@route POST api/users/Login
//@desc Login User / Returning JWT Token
//@access Public

router.post("/login", (req: Request, res: Response) => {
  const { error } = userLogin(req.body);

  if (error) {
    return res.status(400).json({
      error: error.details[0].message,
    });
  }

  const email = req.body.email;
  const password = req.body.password;

  //Find by email

  User.findOne({ email }).then((user) => {
    if (!user) {
      return res.status(400).json({
        error: "Invalid credentials. \n user doesn't exist",
      });
    }

    bcrypt.compare(password, user.password).then((isMatch) => {
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
        jwt.sign(
          payload,
          "secret",
          {
            expiresIn: 3600,
          },
          (err, token) => {
            if (err) throw err;
            console.log(err);
            const tokenData = token;
            res.cookie("jwt", tokenData, { httpOnly: true });

            return res.status(200).json({
              success: true,
              token: `Bearer ${tokenData}`,
            });
          }
        );
      } else {
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

router.post("/account", (req: Request, res: Response) => {
  User.findOne({ email: req.body.email }).then(async (user) => {
    if (!user) {
      return res.status(400).json({
        error: "User doesn't exists",
      });
    }

    const enteredAccountNumber = await Balances.findOne()
      .sort({ createdAt: -1 })
      .limit(1);

    const firstMember = {
      userId: user.id,
      accountNumber: 1000000000,
      balance: 5000,
    };

    if (!enteredAccountNumber) {
      await Balances.create(firstMember);

      return res.status(201).json({
        message: "New account created for the first time",
        firstMember,
      });
    } else {
      if (user._id.equals(enteredAccountNumber.userId)) {
        return res.status(400).json({
          error: "Account already exists",
        });
      } else {
        await Balances.create({
          userId: user._id,
          accountNumber: enteredAccountNumber.accountNumber + 1,
          balance: 5000,
        });

        return res.status(201).json({ message: "New account created" });
      }
    }
  });
});

//@router POST transfer funds
//@desc Transfer funds
//@access Private

router.post("/transfer", (req: Request, res: Response) => {
  const {
    amount,
    senderAccountNumber,
    receiverAccountNumber,
    transferDescription,
  } = req.body;

  const { error } = transferValidationInput(req.body);

  if (error) {
    return res.status(400).json({
      error: `${error.details[0].message}`,
    });
  }

  Balances.findOne({ accountNumber: senderAccountNumber })
    .then(async (user) => {
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
        } else {
          await Balances.findOneAndUpdate(
            { accountNumber: senderAccountNumber },
            { $inc: { balance: -amount } },
            { status: "Debit" }
          );

          await Balances.findOneAndUpdate(
            { accountNumber: receiverAccountNumber },
            { $inc: { balance: amount } },
            { status: "Credit" }
          );

          await Transfer.create({
            reference: Math.random().toString(2).substr(2, 9) + Date.now(),
            senderAccountNumber,
            receiverAccountNumber,
            amount,
            transferDescription,
          });

          return res.status(200).json({ message: "Transfer successful" });
        }
      }
    })
    .catch((err) => console.log(err));
});

//@router GET CREDIT transaction by account number
//@desc Get Credit transaction by account number
//@access Private

router.get(
  "/transaction/credit/:accountNumber",
  async (req: Request, res: Response) => {
    const creditAccountNumber = req.params.accountNumber;
    Transfer.find({ receiverAccountNumber: creditAccountNumber })
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
      .catch((err) =>
        console.log(
          res.status(400).json({
            error: "An error occurred fetching the credit transactions.",
          })
        )
      );
  }
);

//@router GET DEBIT transaction by account number
//@desc Get Debit transaction by account number
//@access Private

router.get(
  "/transaction/debit/:accountNumber",
  (req: Request, res: Response) => {
    const debitAccountNumber = req.params.accountNumber;

    Transfer.find({ senderAccountNumber: debitAccountNumber })
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
      .catch((err) =>
        console.log(
          res.status(400).json({
            error: "An error occurred fetching the debit transactions.",
          })
        )
      );
  }
);

//@route POST deposit funds
//@desc Deposit funds
//@access Private

router.post("/deposit", async (req: Request, res: Response) => {
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

  const deposit = await Balances.findOne({
    accountNumber: req.body.accountNumber,
  });

  await Balances.updateOne(
    { accountNumber: req.body.accountNumber },
    {
      $set: { balance: deposit!.balance + +req.body.amount },
      $currentDate: { lastModified: true },
    }
  );

  return res.status(200).json({ message: "Deposit successful", deposit });
});

//@route GET api/users/accounts
//@desc Get all accounts and balances
//@access Private

interface customRequest extends Request {
  user?: balancesModel;
}

router.get("/accounts", (req: customRequest, res: Response) => {
  Balances.find()
    .populate("userId", ["accountNumber", "balance"])
    .then((accounts) => {
      if (!accounts) {
        return res.status(404).json({
          error: "No accounts found",
        });
      }

      res.json(accounts);
    })
    .catch((err) =>
      res.status(400).json({ err: "An error occurred fetching the places" })
    );
});

//@route GET api/users/accounts/:accountNumber
//@desc Get account by account number
//@access Private

router.get("/balances/:accountNumber", (req: Request, res: Response) => {
  const errors = {
    account: "",
  };

  const acctNo = req.params.accountNumber;

  // console.log(acctNo);

  Balances.findOne({ accountNumber: acctNo })
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

router.get("/balance/:userId", (req: Request, res: Response) => {
  const errors = {
    account: "",
  };

  const userId = req.params.userId;

  Balances.findOne({ userId: userId })
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
    .catch((err) =>
      res.status(400).json({ err: "An error occurred fetching the places" })
    );
});

export default router;
