import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../../models/user";
import NodeError from "../../utils/error";
import validate, { isEmailValid } from "../../utils/validate";
import {
  generateRefreshToken,
  jwtSecretKey,
  saltRounds,
} from "../../utils/encryption";

const signup = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const {
      fullname,
      username,
      email,
      password,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      dateOfBirth,
    } = req.body;

    const [isError, errorMessages] = validate(req);

    if (isError) {
      const err = new NodeError();
      err.code = "Invalid_Data";
      err.message = errorMessages.join(", ");
      err.statusCode = 400;
      throw err;
    }

    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = new User(
      fullname,
      username,
      email,
      passwordHash,
      phone,
      new Date(dateOfBirth),
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
    );

    const token = jwt.sign({ username, email }, jwtSecretKey, {
      expiresIn: "12h",
    });

    const refreshToken = generateRefreshToken();

    const expireDate = new Date();
    expireDate.setHours(expireDate.getHours() + 12);

    user.token = token;
    user.refreshToken = refreshToken;
    user.refreshTokenExpiresAt = expireDate;

    await user.save();

    const userData = { ...user, passwordHash: undefined };

    res.status(201).send({
      status: "success",
      message: "New user created.",
      user: userData,
    });
  } catch (error) {
    next(error);
  }
};

export default signup;
