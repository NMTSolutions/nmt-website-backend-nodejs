import express from "express";

import signup from "../controllers/auth/signup";
import login from "../controllers/auth/login";
import accountLookup from "../controllers/auth/accountLookup";

const authRouter = express.Router();

authRouter.post("/login", login);

authRouter.post("/signup", signup);

authRouter.post("/account-lookup", accountLookup);

export default authRouter;
