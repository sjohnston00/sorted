import { assert, expect, test } from "vitest";
import mongoose from "~/mongoose.server";

test("Register user", () => {
  const User = mongoose.model("User");
  const user = new User({
    name: "John Doe",
    email: "",
    password: "",
    role: "user"
  });
  expect(user._id).toBeDefined();
});

test.todo("is date today", () => {
  const date = new Date();

  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  expect(today).toBe(date);

  //TODO: we'll abstract the istoday into its own function and we'll test whether the date object is between today 24 hour period
});
