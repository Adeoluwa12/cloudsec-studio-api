import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    summary: { type: String, required: true },
    contentMarkdown: { type: String, required: true },
    category: { type: String, default: "General" }, // e.g. "AWS", "IAM", "Kubernetes"
    tags: [{ type: String }],
    videoUrl: { type: String, default: "" },
    thumbnailUrl: { type: String, default: "" },
    readTimeMinutes: { type: Number, default: 5 },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);
