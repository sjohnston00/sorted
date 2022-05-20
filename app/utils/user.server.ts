import bcrypt from "bcrypt"
import User from "~/models/User.server"
import { User as UserType } from "~/types/user.server"

export async function getUserDetails(userId: string) {
  return await User.findById(userId).populate("friends")
}

export async function updateUserPassword(
  userId: string,
  newPassword: string
): Promise<void> {
  const hashedNewPassword = await bcrypt.hash(newPassword, 10)
  await User.updateOne(
    { _id: userId },
    {
      $set: {
        password: hashedNewPassword,
      },
    }
  )
}

export async function isCorrectPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  return await bcrypt.compare(password, passwordHash)
}

export async function updateUserVisibility(
  userId: string,
  visibility: "public" | "private"
): Promise<void> {
  await User.updateOne(
    { _id: userId },
    {
      $set: {
        visibility: visibility,
      },
    }
  )
}
