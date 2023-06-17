import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../../models/user";
import NodeError from "../../utils/error";
import { generateRefreshToken, jwtSecretKey } from "../../utils/encryption";

const accountLookup = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const { uid, refreshToken } = req.body;

    if (!uid || !refreshToken) {
      const err = new NodeError("Please attach uid and refresh token.", 400);
      throw err;
    }

    const user = await User.findOne({
      uid,
    });

    if (!user) {
      const err = new NodeError("User not found.", 404);
      throw err;
    }

    const refreshTokenExpDate = Date.parse(
      new Date(user.refreshTokenExpiresAt as Date).toISOString(),
    );

    const currentDate = Date.parse(new Date().toISOString());

    const isRefreshTokenValid =
      user.refreshToken === refreshToken && refreshTokenExpDate > currentDate;

    if (isRefreshTokenValid) {
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
        message: "User already logged in.",
        user: userData,
      });
    } else {
      const err = new NodeError(
        "Invalid refresh token.",
        401,
        "INVALID_REFRESH_TOKEN",
      );
      throw err;
    }
  } catch (error) {
    next(error);
  }
};

export default accountLookup;
