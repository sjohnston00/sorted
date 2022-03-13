import { Types } from "mongoose";

export type MarkedHabit = {
  date: Date;
  habit: Types.ObjectId;
  user: Types.ObjectId;
};
