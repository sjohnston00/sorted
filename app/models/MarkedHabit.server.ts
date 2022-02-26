// import { Model } from "mongoose";
// import mongoose from "../mongoose.server";
// import { MarkedHabit as MarkedHabitType } from "types/markedHabit.server";

// const markedHabitSchema = new mongoose.Schema<MarkedHabitType>({
//   date: {
//     type: Date,
//     required: true
//   },
//   habit: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true,
//     ref: "Habit"
//   },
//   user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" }
// });

// const MarkedHabit =
//   (mongoose.models.MarkedHabit as Model<MarkedHabitType>) ||
//   mongoose.model<MarkedHabitType>("MarkedHabit", markedHabitSchema);
// export default MarkedHabit;
