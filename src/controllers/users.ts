import express, {Request, Response} from "express";

import {deleteUserById, getUserById, getUserBySessionToken, getUsers, UserModel} from "../db/users";

export const getAllUsers = async (req: Request, res: Response) : Promise<any> => {
    try {
        const users = await getUsers();
       
        return res.json(users);
    } catch (error){
        console.log(error);
        
        return res.sendStatus(400);
    }
}

export const deleteUser = async (req: Request, res: Response) : Promise<any> => {
    try {
        const {id} = req.params;
        const deletedUser =  await deleteUserById(id);
        return res.json(deletedUser);
    } catch (error){
        console.log(error);
        return res.sendStatus(400);
    }
}

export const updateUser = async (req: Request, res: Response) : Promise<any> => {
    try {
        const {name} = req.body;
        const {id} = req.params;
        if(!name){
            return res.sendStatus(400);
        }
        const user = await getUserById(id);

        if(!user){
            return res.sendStatus(400);
        }
        user.name = name;
        await user.save();
        return res.json(user);
    } catch (error){
        console.log(error);
        
        return res.sendStatus(400);
    }
}

export const getProfile = async (req: Request, res: Response): Promise<any> => {
    try {

        const sessionToken = req.headers.authorization?.split(" ")[1] || req.cookies['WANCENTRALLAB-AUTH'];

        if (!sessionToken) {
            return res.sendStatus(401); 
        }

        // Fetch user using the session token
        const user = await getUserBySessionToken(sessionToken);

        if (!user) {
            return res.sendStatus(404); 
        }

        // Return user profile info
        return res.json({
            name: user.name,
            email: user.email,
            score: user.score,
        });
    } catch (error) {
        console.error("Error fetching profile:", error);
        return res.sendStatus(400); // Bad request if there's an error
    }
};