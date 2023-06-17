import express from "express";

import NodeError from "../../utils/error";

const errorHandler = async (
  err: NodeError,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    console.log(err);
    let message = err.message;
    switch (err.code) {
      case "ER_DUP_ENTRY":
        message = "Username, email or phone already in use.";
        break;
    }
    return res.status(err.statusCode).send({ status: "error", message });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: "errror", message: "Internal Server Error" });
  }
};

export default errorHandler;
