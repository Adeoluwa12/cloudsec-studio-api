import { Router } from "express";
import { requireAdmin } from "../middleware/auth.js";
import Post from "../models/Post.js";
import Quiz from "../models/Quiz.js";
import Lab from "../models/Lab.js";
import InterviewQuestion from "../models/InterviewQuestion.js";
import User from "../models/User.js";

const router = Router();
router.use(requireAdmin);

function crud(model, path, sort = { createdAt: -1 }) {
  router.get(`/${path}`, async (req, res, next) => {
    try { res.json(await model.find().sort(sort)); } catch (e) { next(e); }
  });
  router.post(`/${path}`, async (req, res, next) => {
    try { res.status(201).json(await model.create(req.body)); } catch (e) { next(e); }
  });
  router.put(`/${path}/:id`, async (req, res, next) => {
    try {
      const updated = await model.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updated) return res.status(404).json({ error: "Not found" });
      res.json(updated);
    } catch (e) { next(e); }
  });
  router.delete(`/${path}/:id`, async (req, res, next) => {
    try {
      const deleted = await model.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Not found" });
      res.json({ ok: true });
    } catch (e) { next(e); }
  });
}

crud(Post, "posts");
crud(Quiz, "quizzes");
crud(Lab, "labs");
crud(InterviewQuestion, "interview-questions", { order: 1 });

router.get("/analytics", async (req, res, next) => {
  try {
  const [userCount, postCount, publishedCount] = await Promise.all([
    User.countDocuments(),
    Post.countDocuments(),
    Post.countDocuments({ status: "published" }),
  ]);

  const users = await User.find().select("progress");
  const totalQuizAttempts = users.reduce(
    (sum, u) => sum + u.progress.filter((p) => p.quizScore !== null).length,
    0
  );
  const avgQuizScore =
    totalQuizAttempts > 0
      ? Math.round(
          users.reduce(
            (sum, u) => sum + u.progress.reduce((s, p) => s + (p.quizScore || 0), 0),
            0
          ) / totalQuizAttempts
        )
      : 0;
  const labCompletions = users.reduce(
    (sum, u) => sum + u.progress.filter((p) => p.labPassedAt).length,
    0
  );

  res.json({ userCount, postCount, publishedCount, avgQuizScore, labCompletions, totalQuizAttempts });
  } catch (e) { next(e); }
});

export default router;
