import { NextFunction } from "express";
import { promisify } from "util";

import getConnection from "../utils/database";
import NodeError from "../utils/error";
import { IResultSetHeader } from "./../utils/interfaces";

const getUserQuery =
  "SELECT * FROM users WHERE uid = ? OR username = ? OR email = ? OR phone = ?";

const insertUserQuery =
  "INSERT INTO users (fullname, username, email, password_hash, phone, birth_date, address_line_1, address_line_2, city, state, postal_code, refresh_token, refresh_token_expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

const updateRefreshTokenQuery =
  "UPDATE users SET refresh_token = ?, refresh_token_expires_at = ? WHERE uid = ?";

export default class User {
  uid: string | null = null;
  token: string | null = null;
  refreshToken: string | null = null;
  createdAt: Date | null = null;
  updatedAt: Date | null = null;
  refreshTokenExpiresAt: Date | null = null;
  role: number | null = null;

  constructor(
    public fullname: string,
    public username: string,
    public email: string,
    public passwordHash: string,
    public phone: string,
    public dateOfBirth: Date,
    public addressLine1: string,
    public addressLine2: string,
    public city: string,
    public state: string,
    public postalCode: string,
  ) {}

  public static findOne = async (values: {
    uid?: string;
    username?: string;
    email?: string;
    phone?: string;
  }) => {
    try {
      const connection = await getConnection();

      const queryAsync = promisify(connection.query).bind(connection);

      const result = (await queryAsync({
        sql: getUserQuery,
        values: [values.uid, values.username, values.email, values.phone],
      })) as any[];

      const rawUser = result[0];

      if (rawUser) {
        const user = new User(
          rawUser["fullname"],
          rawUser["username"],
          rawUser["email"],
          rawUser["password_hash"],
          rawUser["phone"],
          rawUser["birth_date"],
          rawUser["address_line_1"],
          rawUser["address_line_2"],
          rawUser["city"],
          rawUser["state"],
          rawUser["postal_code"],
        );

        user.uid = rawUser["uid"];
        user.createdAt = rawUser["created_at"];
        user.updatedAt = rawUser["updated_at"];
        user.refreshToken = rawUser["refresh_token"];
        user.refreshTokenExpiresAt = rawUser["refresh_token_expires_at"];
        user.role = rawUser["role"];

        connection.release();

        return user;
      }
    } catch (error: any) {
      const err = new NodeError(error.message, 500, error.code);
      throw err;
    }
  };

  public updateRefreshToken = async () => {
    try {
      const connection = await getConnection();

      const queryAsync = promisify(connection.query).bind(connection);

      const result = (await queryAsync({
        sql: updateRefreshTokenQuery,
        values: [this.refreshToken, this.refreshTokenExpiresAt, this.uid],
      })) as IResultSetHeader;

      if (result.affectedRows !== 1) {
        const err = new NodeError(
          `Updating refresh token for uid ${this.uid} failed.`,
          500,
        );
        throw err;
      }
    } catch (error) {
      throw error;
    }
  };

  public save = async () => {
    try {
      const connection = await getConnection();

      const queryAsync = promisify(connection.query).bind(connection);

      const result = (await queryAsync({
        sql: insertUserQuery,
        values: [
          this.fullname,
          this.username,
          this.email,
          this.passwordHash,
          this.phone,
          this.dateOfBirth,
          this.addressLine1,
          this.addressLine2,
          this.city,
          this.state,
          this.postalCode,
          this.refreshToken,
          this.refreshTokenExpiresAt,
        ],
      })) as IResultSetHeader;

      if (result.affectedRows === 1) {
        const result: any = await queryAsync({
          sql: getUserQuery,
          values: [this.uid, this.username, this.email, this.phone],
        });

        const user = result[0];

        this.uid = user.uid;
        this.createdAt = user["created_at"];
        this.updatedAt = user["updated_at"];
        this.role = user["role"];
      }

      connection.release();
    } catch (error: any) {
      const err = new NodeError(error.message, 400, error.code);
      throw err;
    }
  };
}
