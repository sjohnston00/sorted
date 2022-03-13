import { Types, Document } from "mongoose";

export type Habit = {
  name: string;
  colour: string;
  user: Types.ObjectId;
};

export type MongooseHabits = (Document<unknown, any, Habit> &
  Habit & {
    _id: Types.ObjectId;
  })[];
