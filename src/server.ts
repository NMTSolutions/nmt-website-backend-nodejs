import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth";
import applicationsRoutes from "./routes/applications";
import errorHandler from "./controllers/error/error";

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

const port = process.env.PORT;

//Auth Routes
app.use(authRoutes);

//Applications Routes
app.use(applicationsRoutes);

//Error Handler
app.use(errorHandler);

//Server
app.listen(port, () => {
  console.log(`[Server]: Server is running at http://localhost:${port}`);
});
