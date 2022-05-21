import bcrypt from "bcrypt"
import User from "~/models/User.server"
import crypto from "crypto"

export const usernameExists = async (username: string): Promise<boolean> => {
  const user = await User.findOne({ username: username })
  if (user) {
    return true
  }
  return false
}
export const emailExists = async (email: string): Promise<boolean> => {
  const user = await User.findOne({ email: email })
  if (user) {
    return true
  }
  return false
}

export const registerUser = async (
  username: string,
  email: string,
  password: string
): Promise<any> => {
  const hashedPassword = await bcrypt.hash(password, 10)
  const emailHash = crypto.createHash("md5").update(email).digest("hex")

  const newUser = new User({
    email: email,
    username: username,
    password: hashedPassword,
    friends: [],
    visibility: "public",
    gravatarURL: `https://www.gravatar.com/avatar/${emailHash}`,
  })

  const savedUser = await newUser.save()
  return savedUser
}

export const isValidPassword = (password: string): boolean => {
  if (password.length < 8) {
    return false
  }

  const containNumbers = /[0-9]/
  const containUppercase = /[A-Z]/
  const specialCharacters = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/

  if (!specialCharacters.test(password)) {
    return false
  }
  if (!containNumbers.test(password)) {
    return false
  }
  if (!containUppercase.test(password)) {
    return false
  }
  return true
}
