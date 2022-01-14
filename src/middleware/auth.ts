import jwt from "jsonwebtoken";
import express, { Request, Response, NextFunction } from "express";


export const authUser = (req: Request, res: Response, next: NextFunction) => {
     try {
         const token = req.cookies.jwt;

         console.log(process.env.ACCESS_TOKEN_SCERET_KEY, "TOKEN");

         if (token) {
             jwt.verify(token, process.env.ACCESS_TOKEN_SCERET_KEY as string, (err: any, decodedToken: any) => {
                
                 // console.log(err)
                 if (err) {
                     throw new Error("Invalid token");
                 } else {
                     next()
                 }
             })
         } else {
             res.status(401).json({ message: "No token provided" });
         }
     } catch (error) {
         res.sendStatus(401);
     }
 }