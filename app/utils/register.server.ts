import bcrypt from "bcrypt";
import User from "~/models/User.server";
import { createUserSession, loginUser } from "./session.server";

export const registerUser = async (
  username: string,
  password: string
): Promise<any> => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    username: username,
    password: hashedPassword
  });

  const savedUser = await newUser.save();
  return savedUser;
};
