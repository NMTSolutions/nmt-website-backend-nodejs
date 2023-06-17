import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../../models/user";
import NodeError from "../../utils/error";
import { generateRefreshToken, jwtSecretKey } from "../../utils/encryption";

const login = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
      const err = new NodeError(
        "Please attach username/email and password.",
        400,
      );
      throw err;
    }

    const user = await User.findOne({
      username: usernameOrEmail,
      email: usernameOrEmail,
    });

    if (!user) {
      const err = new NodeError("User not found.", 404);
      throw err;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (isPasswordValid) {
      const token = jwt.sign(
        { username: user.username, email: user.email },
        jwtSecretKey,
        { expiresIn: "12h" },
      );

      const refreshToken = generateRefreshToken();

      const expireDate = new Date();
      expireDate.setHours(expireDate.getHours() + 12);

      user.token = token;
      user.refreshToken = refreshToken;
      user.refreshTokenExpiresAt = expireDate;

      await user.updateRefreshToken();

      const userData = { ...user, passwordHash: undefined };

      res.status(200).send({
        status: "success",
        message: "User successfully logged in.",
        user: userData,
      });
    } else {
      const err = new NodeError("Invalid credentials.", 401, "INVALID_CREDS");
      throw err;
    }
  } catch (error) {
    next(error);
  }
};

export default login;
