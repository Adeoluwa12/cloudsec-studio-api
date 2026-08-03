import { Router } from "express";
import Post from "../models/Post.js";
import Quiz from "../models/Quiz.js";
import Lab from "../models/Lab.js";
import InterviewQuestion from "../models/InterviewQuestion.js";

const router = Router();

router.get("/posts", async (req, res) => {
  const { category, tag } = req.query;
  const filter = { status: "published" };
  if (category) filter.category = category;
  if (tag) filter.tags = tag;
  const posts = await Post.find(filter).sort({ createdAt: -1 }).select("-contentMarkdown");
  res.json(posts);
});

router.get("/posts/:slug", async (req, res) => {
  const post = await Post.findOne({ slug: req.params.slug, status: "published" });
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json(post);
});

// Quiz questions are returned without correctIndex/explanation so answers
// can't be read from the network tab — those are only revealed on submit.
router.get("/posts/:postId/quiz", async (req, res) => {
  const quiz = await Quiz.findOne({ postId: req.params.postId });
  if (!quiz) return res.status(404).json({ error: "No quiz for this post" });
  const sanitized = {
    _id: quiz._id,
    title: quiz.title,
    passingScore: quiz.passingScore,
    questions: quiz.questions.map((q) => ({ questionText: q.questionText, options: q.options })),
  };
  res.json(sanitized);
});

router.get("/posts/:postId/lab", async (req, res) => {
  const lab = await Lab.findOne({ postId: req.params.postId });
  if (!lab) return res.status(404).json({ error: "No lab for this post" });
  res.json(lab);
});

router.get("/interview-questions", async (req, res) => {
  const { category, difficulty } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (difficulty) filter.difficulty = difficulty;
  const questions = await InterviewQuestion.find(filter).sort({ order: 1 });
  res.json(questions);
});

export default router;
