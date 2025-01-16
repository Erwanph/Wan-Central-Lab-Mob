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

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        // Cek token di Authorization Header atau Cookies
        const authHeader = req.headers['authorization'];
        const sessionToken = authHeader && authHeader.startsWith('Bearer ')
            ? authHeader.split(' ')[1]
            : req.cookies['WANCENTRALLAB-AUTH'];

        if (!sessionToken) {
            return res.status(403).json({ message: 'No session token provided' });
        }

        const existingUser = await getUserBySessionToken(sessionToken);
        if (!existingUser) {
            return res.status(403).json({ message: 'Invalid session token' });
        }

        merge(req, { identity: existingUser });  // Set identity untuk isOwner
        return next();
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
};
