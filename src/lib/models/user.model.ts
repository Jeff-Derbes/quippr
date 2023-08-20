import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  id: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  image: String,
  bio: String,
  quip: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quip",
    },
  ],
  onboarded: {
    type: Boolean,
    default: false,
  },
  communities: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
    },
  ],
  likedQuips: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quip",
    },
  ],
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
