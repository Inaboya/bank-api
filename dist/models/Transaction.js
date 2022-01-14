"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transfer = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const transactionSchema = new Schema({
    reference: {
        type: String,
        unique: true,
    },
    senderAccount: {
        type: Number,
        ref: "Balances",
    },
    amount: {
        type: Number,
    },
    receiverAccount: {
        type: Number,
        ref: "Balances",
    },
    status: {
        type: String,
    },
    transferDescription: {
        type: String,
    },
}, { timestamps: true });
// export const Transfer = mongoose.model<transferModel>(
//   "Transfer",
//   transactionSchema
// );
exports.Transfer = mongoose_1.default.model("Transfer", transactionSchema);
