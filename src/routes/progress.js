import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import Quiz from "../models/Quiz.js";
import Lab from "../models/Lab.js";
import User from "../models/User.js";

const router = Router();
router.use(requireAuth);

// Badge unlock rules: kept simple and explicit rather than a generic engine,
// since there are only a handful of badges for now.
const BADGE_RULES = [
  { badge: "IAM Guardian", categories: ["IAM"] },
  { badge: "Kubernetes Hardener", categories: ["Kubernetes", "K8s"] },
];

async function updateProgress(userId, postId, updates) {
  const user = await User.findById(userId);
  let entry = user.progress.find((p) => String(p.postId) === String(postId));
  if (!entry) {
    entry = { postId };
    user.progress.push(entry);
    entry = user.progress[user.progress.length - 1];
  }
  Object.assign(entry, updates);
  await user.save();
  return user;
}

router.post("/quiz/:postId/submit", async (req, res) => {
  const { answers } = req.body; // array of selected option indices, same order as questions
  const quiz = await Quiz.findOne({ postId: req.params.postId });
  if (!quiz) return res.status(404).json({ error: "Quiz not found" });

  const results = quiz.questions.map((q, i) => ({
    correct: answers[i] === q.correctIndex,
    correctIndex: q.correctIndex,
    explanation: q.explanation,
  }));
  const scorePercent = Math.round(
    (results.filter((r) => r.correct).length / quiz.questions.length) * 100
  );

  await updateProgress(req.user.id, req.params.postId, {
    quizScore: scorePercent,
    completed: scorePercent >= quiz.passingScore,
  });

  res.json({ scorePercent, passed: scorePercent >= quiz.passingScore, results });
});

router.post("/lab/:postId/run", async (req, res) => {
  const { command } = req.body;
  const lab = await Lab.findOne({ postId: req.params.postId });
  if (!lab) return res.status(404).json({ error: "Lab not found" });

  const match = lab.commands.find((c) => c.inputCmd.trim() === String(command).trim());
  if (!match) {
    return res.json({ output: "command not found — check the scenario hints", validated: false });
  }

  if (match.validatesTask) {
    await updateProgress(req.user.id, req.params.postId, { labPassedAt: new Date() });

    const post = await lab.populate("postId");
    const category = post.postId?.category;
    const rule = BADGE_RULES.find((r) => r.categories.includes(category));
    if (rule) {
      await User.updateOne(
        { _id: req.user.id },
        { $addToSet: { badges: rule.badge } }
      );
    }
  }

  res.json({ output: match.expectedOutput, validated: match.validatesTask });
});

router.get("/dashboard", async (req, res) => {
  const user = await User.findById(req.user.id).populate("progress.postId", "title slug category");
  res.json({
    name: user.name,
    badges: user.badges,
    progress: user.progress,
  });
});

export default router;
