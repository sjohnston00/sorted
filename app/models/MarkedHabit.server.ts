import { Model } from "mongoose"
import mongoose from "../mongoose.server"
import { MarkedHabit as MarkedHabitType } from "~/types/markedHabit.server"

const markedHabitSchema = new mongoose.Schema<MarkedHabitType>(
  {
    date: {
      type: Date,
      required: true,
    },
    habit: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Habit",
    },
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

const MarkedHabit =
  (mongoose.models.MarkedHabit as Model<MarkedHabitType>) ||
  mongoose.model<MarkedHabitType>("MarkedHabit", markedHabitSchema)
export default MarkedHabit
