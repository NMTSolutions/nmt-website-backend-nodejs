import * as mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const DBHost = process.env.DB_HOST;
const DBUser = process.env.DB_USER;
const DBPassword = process.env.DB_PASSWORD;
const DBName = process.env.DB_NAME;

const pool = mysql.createPool({
  host: DBHost,
  user: DBUser,
  password: DBPassword,
  database: DBName,
});

const getConnection = (): Promise<mysql.PoolConnection> => {
  return new Promise((resolve, reject) => {
    pool.getConnection((error, connection) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(connection);
    });
  });
};

export default getConnection;
