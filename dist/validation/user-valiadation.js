"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userLogin = exports.userRegister = void 0;
const joi_1 = __importDefault(require("@hapi/joi"));
const userRegister = (data) => {
    const schema = joi_1.default.object({
        firstName: joi_1.default.string().min(3).required(),
        lastName: joi_1.default.string().min(3).required(),
        email: joi_1.default.string().lowercase().min(6).required(),
        phoneNumber: joi_1.default.string().length(11).required(),
        DOB: joi_1.default.string().required(),
        password: joi_1.default.string().min(6).required(),
        confirm_pwd: joi_1.default.ref("password"),
    });
    return schema.validate(data);
};
exports.userRegister = userRegister;
const userLogin = (data) => {
    const schema = joi_1.default.object({
        email: joi_1.default.string().lowercase().min(6).required(),
        password: joi_1.default.string().min(6).required(),
    });
    return schema.validate(data);
};
exports.userLogin = userLogin;
