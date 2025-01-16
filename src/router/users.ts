import express from "express";


import { deleteUser, getAllUsers, getProfile, updateUser, updateScore, incrementScore } from "../controllers/users";
import { isAuthenticated, isOwner } from "../middlewares/index";

export default (router: express.Router) => {
    router.get('/users', isAuthenticated, getAllUsers);
    router.get('/users/:id', isAuthenticated, getProfile);
    router.delete('/users/:id', isAuthenticated, isOwner, deleteUser);
    router.patch('/users/:id', isAuthenticated, isOwner,  updateUser);
    router.patch('/users/:id/score', updateScore);
    router.patch('/users/:id/score/increment', incrementScore);
};