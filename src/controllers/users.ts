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

export const updateUser = async (req: Request, res: Response): Promise<any> => {
    try {
        const { name } = req.body;
        const { id } = req.params;
        
        console.log('Update User Request:', {
            body: req.body,
            params: req.params,
            headers: req.headers
        });

        if (!name) {
            console.log('Name validation failed: name is missing');
            return res.status(400).json({ message: 'Name is required' });
        }

        console.log('Searching for user with ID:', id);
        const user = await getUserById(id);

        if (!user) {
            console.log('User not found with ID:', id);
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('Updating user:', {
            userId: id,
            currentName: user.name,
            newName: name
        });

        user.name = name;
        await user.save();

        console.log('User updated successfully:', user);
        return res.json(user);
    } catch (error) {
        console.error('Error in updateUser:', {
            error: error,
            stack: error instanceof Error ? error.stack : 'No stack trace',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
        
        return res.status(500).json({ 
            message: 'Failed to update user',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

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