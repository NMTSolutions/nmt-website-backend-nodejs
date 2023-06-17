import crypto from "crypto";

export const saltRounds = 12;

export const jwtSecretKey = "models,languages,design";

export const generateRefreshToken = () => {
  const refreshToken = crypto.randomBytes(64).toString("hex");
  return refreshToken;
};
