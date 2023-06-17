import express from "express";

export const isEmailValid = (email: string) => {
  const emailRegex = new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  return emailRegex.test(email);
};

const validate = (req: express.Request) => {
  const {
    fullname,
    username,
    email,
    password,
    phone,
    addressLine1,
    city,
    state,
    postalCode,
    dateOfBirth,
  } = req.body;

  let isError = false;
  const errorMessages: string[] = [];

  if (
    !fullname ||
    !username ||
    !email ||
    !password ||
    !phone ||
    !addressLine1 ||
    !city ||
    !state ||
    !postalCode ||
    !dateOfBirth
  ) {
    isError = true;
    errorMessages.push(
      "Please attach required data. Required field names : [fullname, username, email, passeord, phone, addressLine1, city, state, postalCode, dateOfBirth]",
    );
  } else if (username.length < 8) {
    isError = true;
    errorMessages.push("Username must be atleast 8 characters long.");
  } else if (!isEmailValid(email)) {
    isError = true;
    errorMessages.push("Email is invalid.");
  } else if (password.length < 8) {
    isError = true;
    errorMessages.push("Pasword too short. (min 8 chars).");
  }

  return [isError, errorMessages] as [boolean, string[]];
};

export default validate;
