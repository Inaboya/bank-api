import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";

export const authUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
    let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }


    try {
        const decoded: any = jwt.verify(token as string, process.env.ACCESS_TOKEN_SCERET_KEY as string);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ status: "error", message: "Not authorirized" });
        }

        req.user = user;
        next();
    }
    catch (err) {
        res.status(500).json({ status: "error", message: "Not authorirized" });
    }
};
