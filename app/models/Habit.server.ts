import { Model } from "mongoose"
import mongoose from "../mongoose.server"
import { Habit as HabitType } from "~/types/habits.server"

const habitSchema = new mongoose.Schema<HabitType>(
  {
    name: { type: String, required: true, trim: true },
    colour: { type: String, required: true, trim: true },
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    note: { type: String, trim: true, maxlength: 500, default: "" },
  },
  {
    timestamps: true,
  }
)

const Habit =
  (mongoose.models.Habit as Model<HabitType>) ||
  mongoose.model<HabitType>("Habit", habitSchema)
export default Habit
