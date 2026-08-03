import mongoose from "mongoose";

const interviewQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answerMarkdown: { type: String, default: "" }, // written breakdown
    videoUrl: { type: String, default: "" }, // video walkthrough, if any
    category: { type: String, default: "General" }, // e.g. "IAM", "Behavioral", "AWS"
    difficulty: { type: String, enum: ["junior", "mid", "senior"], default: "mid" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("InterviewQuestion", interviewQuestionSchema);
