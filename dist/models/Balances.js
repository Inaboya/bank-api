"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Balances = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const balanceSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    accountNumber: {
        type: Number,
        maxlength: [10, "Account number must be 10 digits"],
        unique: true,
    },
    status: {
        type: String,
    },
    balance: {
        type: Number,
    },
}, { timestamps: true });
exports.Balances = mongoose_1.default.model("Balances", balanceSchema);
