import mongoose from "mongoose";

const labSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    title: { type: String, required: true },
    scenarioDescription: { type: String, required: true },
    commands: [
      {
        inputCmd: { type: String, required: true }, // e.g. "aws s3api get-bucket-policy --bucket demo"
        expectedOutput: { type: String, required: true }, // mock output shown in the terminal
        hint: { type: String, default: "" },
        validatesTask: { type: Boolean, default: false }, // true = completing this command passes the lab
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Lab", labSchema);
