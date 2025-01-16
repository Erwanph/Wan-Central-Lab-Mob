import express, {Request, Response} from 'express';
import { createUser, getUserByEmail } from '../db/users';
import { authentication, random } from '../helpers/index';
import { getUserBySessionToken } from "../db/users";
export const register = async (req: Request, res: Response) : Promise<any> => {
    try{
        const {name, email,  password} = req.body;

        if(!email || !password || !name){
            console.log("test")
            return res.sendStatus(400);
            
        }
        const existingUser = await getUserByEmail(email);
        if(existingUser){
            return res.sendStatus(400);
        }
        const salt = random();
        const user = await createUser({
            name,
            email,
            authentication: {
                salt,
                password: authentication(salt, password),
            },
           
        });
        return res.status(200).json(user).end();
    } catch (error){
        console.log(error);
        return res.sendStatus(400);
    }
};

export const login = async (req: Request, res: Response) : Promise<any> => {
    try{
        const {email, password} = req.body;

        if(!email || !password){
            return res.sendStatus(400);
            
        }
        const user = await getUserByEmail(email).select('+authentication.salt +authentication.password');

        if(!user){
            return res.sendStatus(400);
            
        }

        const expectHash = authentication(user.authentication.salt, password);

        if(user.authentication.password != expectHash){
            return res.sendStatus(403);
        }
        const salt = random();
        user.authentication.sessionToken = authentication(salt, user._id.toString());

        await user.save();
        res.cookie('WANCENTRALLAB-AUTH', user.authentication.sessionToken, {domain: 'localhost', path: '/', httpOnly:true});
        return res.status(200).json({user, sessionToken: user.authentication.sessionToken, userId:user._id}).end();
    } catch (error){
        console.log(error);
        return res.sendStatus(400);
    }
}

export const logout = async (req: Request, res: Response): Promise<any> => {
    try {
        // Ambil session token dari header Authorization
        const sessionToken = req.headers['authorization']?.split(' ')[1];  // Ambil token setelah 'Bearer'

        if (!sessionToken) {
            return res.sendStatus(400); // Tidak ada session token ditemukan
        }

        // Temukan pengguna berdasarkan session token
        const user = await getUserBySessionToken(sessionToken);  // Cari berdasarkan session token

        if (!user || user.authentication.sessionToken !== sessionToken) {
            return res.sendStatus(403); // Unauthorized jika session token tidak cocok
        }

        // Hapus session token pada pengguna di database
        user.authentication.sessionToken = null;
        await user.save();

        return res.status(200).send('Logged out successfully');
    } catch (error) {
        console.log(error);
        return res.sendStatus(500); // Internal server error
    }
};
