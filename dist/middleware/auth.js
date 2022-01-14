"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authUser = (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        console.log(process.env.ACCESS_TOKEN_SCERET_KEY, "TOKEN");
        if (token) {
            jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SCERET_KEY, (err, decodedToken) => {
                // console.log(err)
                if (err) {
                    throw new Error("Invalid token");
                }
                else {
                    next();
                }
            });
        }
        else {
            res.status(401).json({ message: "No token provided" });
        }
    }
    catch (error) {
        res.sendStatus(401);
    }
};
exports.authUser = authUser;
