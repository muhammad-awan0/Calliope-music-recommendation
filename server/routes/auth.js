import express from "express";
import { login, signup } from "../controllers/auth.js";
// import login and signup from wtv

const router = express.Router();
router.post("/login", login);
router.post("/signup", signup);

export default router;