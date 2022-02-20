import { Types } from "mongoose";

export type Habit = {
  name: string;
  colour: string;
  user: Types.ObjectId;
};
