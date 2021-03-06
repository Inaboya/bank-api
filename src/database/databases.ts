import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import keys from "../config/keys";

export const connectDB = () => {
  const db = keys.monogURL;
  try {
    mongoose
      .connect(db)
      .then(() => {
        console.log("Connected to MongoDB");
      })
      .catch((err) => console.log("An error occurred connecting to MongoDB"));
  } catch (error) {
    console.log(error);
  }
};

export const connectDBTest = () => {
  try {
    MongoMemoryServer.create().then((mongo) => {
      const db = mongo.getUri();
      mongoose
        .connect(db)
        .then(() => {
          console.log("Connected to Test MongoDB");
        })
        .catch((err) => console.log(err));
    });
  } catch (error) {
    console.log(error);
  }
};
