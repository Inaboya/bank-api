import mongoose from "mongoose";


const Schema = mongoose.Schema;

export interface userModel extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    DOB: string;
    phoneNumber: string;
    confirm_pwd: string;
}

const UserSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },

    lastName: {
        type: String,
        required: true
    },

    email: {
        type: String,
        unique: true,
        required: true
    },

    password: {
        type: String,
        required : true
    },

    confirm_pwd: {
        type: String,
        required: true
    },

    DOB: {
        type: String,
        required: true
    },

    phoneNumber: {
        type: String,
        unique: true,
        required: true
    }
})

export const User = mongoose.model<userModel>('User', UserSchema);