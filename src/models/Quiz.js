import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    title: { type: String, required: true },
    passingScore: { type: Number, default: 70 }, // percentage
    questions: [
      {
        questionText: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctIndex: { type: Number, required: true },
        explanation: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Quiz", quizSchema);
