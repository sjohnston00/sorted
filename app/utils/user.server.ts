import bcrypt from "bcrypt"
import User from "~/models/User.server"

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

export async function updateAllUsersFriendList(userId: string) {
  //Remove the user from all users with have userId as a friend
  return await User.updateMany(
    { friends: userId },
    {
      $pull: {
        friends: userId,
      },
    }
  )
}

export async function deleteUser(userId: string) {
  await User.deleteOne({ _id: userId })
}
