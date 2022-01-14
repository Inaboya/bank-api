"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferValidationInput = void 0;
const joi_1 = __importDefault(require("@hapi/joi"));
const transferValidationInput = (data) => {
    const schema = joi_1.default.object({
        reference: joi_1.default.string().min(6),
        senderAccountNumber: joi_1.default.number().required(),
        amount: joi_1.default.number().required(),
        receiverAccountNumber: joi_1.default.number().required(),
        transferDescription: joi_1.default.string().required(),
    });
    return schema.validate(data);
};
exports.transferValidationInput = transferValidationInput;
