import { User as UserType } from "~/types/user.server"
import type { Model } from "mongoose"
import mongoose from "../mongoose.server"

const userSchema = new mongoose.Schema<UserType>(
  {
    username: { type: String, unique: true, trim: true },
    password: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
)

const User =
  (mongoose.models.User as Model<UserType>) ||
  mongoose.model<UserType>("User", userSchema)
export default User
