import express, {Request, Response, NextFunction} from "express";
import {get, merge} from "lodash";

import { getUserBySessionToken } from "../db/users";

export const isOwner = async (req: Request, res: Response, next: NextFunction) : Promise<any> => {
    try {
        const {id} = req.params;
        const currentUserId = get(req, 'identity._id') as string;
        if(!currentUserId) {
            res.sendStatus(400);
        }

        if(currentUserId.toString() != id){
            return res.status(403);
        }
        return next();
    } catch (error){
        console.log(error);
        return res.sendStatus(400);
    }
}

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) : Promise<any> => {
    try {
        const sessionToken = req.cookies['WANCENTRALLAB-AUTH'];
        // if(!sessionToken){
        //     return res.sendStatus(403);

        // }
        const existingUser = await getUserBySessionToken(sessionToken);
        if(!existingUser){
            console.log("test");
            return res.sendStatus(403);
        }
        merge(req, {identity: existingUser});
        return next();
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
}
