"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDBTest = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const keys_1 = __importDefault(require("../config/keys"));
const connectDB = () => {
    const db = keys_1.default.monogURL;
    try {
        mongoose_1.default
            .connect(db)
            .then(() => {
            console.log("Connected to MongoDB");
        })
            .catch((err) => console.log("An error occurred connecting to MongoDB"));
    }
    catch (error) {
        console.log(error);
    }
};
exports.connectDB = connectDB;
const connectDBTest = () => {
    try {
        mongodb_memory_server_1.MongoMemoryServer.create().then((mongo) => {
            const db = mongo.getUri();
            mongoose_1.default
                .connect(db)
                .then(() => {
                console.log("Connected to Test MongoDB");
            })
                .catch((err) => console.log(err));
        });
    }
    catch (error) {
        console.log(error);
    }
};
exports.connectDBTest = connectDBTest;
