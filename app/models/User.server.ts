import mongoose from "../mongoose.server";

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, trim: true },
  password: { type: String, trim: true }
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
