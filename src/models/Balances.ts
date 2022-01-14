import mongoose from "mongoose";

const Schema = mongoose.Schema;

export interface balancesModel extends Document {
    userId: string;
    balance: number;
    accountNumber: number;
    status: string;
    user: string;
    _id: string;
}


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

export const Balances = mongoose.model<balancesModel>("Balances", balanceSchema);