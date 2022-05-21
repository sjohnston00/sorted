import { User as UserType } from "~/types/user.server"
import type { Model } from "mongoose"
import mongoose from "../mongoose.server"

const userSchema = new mongoose.Schema<UserType>(
  {
    username: { type: String, unique: true, trim: true, required: true },
    email: { type: String, unique: true, trim: true, required: true },
    password: { type: String, trim: true, required: true },
    gravatarURL: { type: String, trim: true, required: true },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
  },
  {
    timestamps: true,
  }
)

const User =
  (mongoose.models.User as Model<UserType>) ||
  mongoose.model<UserType>("User", userSchema)
export default User
