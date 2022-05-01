import { FriendRequest as FriendRequestType } from "~/types/friends.server"
import type { Model } from "mongoose"
import mongoose from "../mongoose.server"

const friendRequestSchema = new mongoose.Schema<FriendRequestType>(
  {
    from: { type: mongoose.Schema.Types.ObjectId, required: true },
    to: { type: mongoose.Schema.Types.ObjectId, required: true },
    accepted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
)

const FriendRequest =
  (mongoose.models.FriendRequest as Model<FriendRequestType>) ||
  mongoose.model<FriendRequestType>("FriendRequest", friendRequestSchema)
export default FriendRequest
