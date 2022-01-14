import mongoose from "mongoose";

const Schema = mongoose.Schema;

interface transferModel extends Document {
  reference: string;
  senderAccount: number;
  amount: number;
  receiverAccount: number;
  transferDescription: string;
  status: string;
  error: string;
}

const transactionSchema = new Schema(
  {
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
  },
  { timestamps: true }
);

// export const Transfer = mongoose.model<transferModel>(
//   "Transfer",
//   transactionSchema
// );
export const Transfer = mongoose.model("Transfer", transactionSchema)
