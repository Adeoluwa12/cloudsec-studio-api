import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    avatarUrl: { type: String, default: "" },
    provider: { type: String, enum: ["google", "github"], required: true },
    providerId: { type: String, required: true },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    badges: [{ type: String }], // e.g. "IAM Guardian", "Kubernetes Hardener"
    progress: [
      {
        postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
        completed: { type: Boolean, default: false },
        quizScore: { type: Number, default: null },
        labPassedAt: { type: Date, default: null },
      },
    ],
  },
  { timestamps: true }
);

userSchema.index({ provider: 1, providerId: 1 }, { unique: true });

export default mongoose.model("User", userSchema);
