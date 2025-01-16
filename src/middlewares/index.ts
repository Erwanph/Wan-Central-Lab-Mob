import express, {Request, Response, NextFunction} from "express";
import {get, merge} from "lodash";

import { getUserBySessionToken } from "../db/users";

export const isOwner = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { id } = req.params; // ID dari URL
        const currentUserId = get(req, 'identity._id') as string; // ID dari session token

        if (!currentUserId) {
            return res.sendStatus(400);  // Session token tidak valid
        }

        if (currentUserId.toString() !== id) {
            return res.status(403).json({ message: "Forbidden: You are not the owner of this account." });
        }

        return next();  // Lolos validasi, lanjut ke controller
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
};

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) : Promise<any> => {
    try {
        const sessionToken = req.cookies['WANCENTRALLAB-AUTH'] || req.headers['authorization']?.split(' ')[1];
        const existingUser = await getUserBySessionToken(sessionToken);
        if (!existingUser) {
            console.log("Authentication failed: Invalid session token");
            return res.status(403).json({ message: "Authentication failed: Invalid session token" });
        }
        merge(req, {identity: existingUser});
        return next();
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
}
