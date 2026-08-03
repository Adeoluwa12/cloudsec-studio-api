import { Router } from "express";
import passport from "../config/passport.js";
import jwt from "jsonwebtoken";
import { requireAuth } from "../middleware/auth.js";
import { sendWelcomeEmail } from "../utils/mail.js";

const router = Router();

function issueTokenAndRedirect(req, res) {
  const user = req.user;
  const token = jwt.sign(
    { id: user._id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  if (user._wasJustCreated) {
    sendWelcomeEmail({ name: user.name, email: user.email }).catch((err) =>
      console.error("Welcome email failed:", err.message)
    );
  }

  res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
}

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=google` }),
  issueTokenAndRedirect
);

router.get("/github", passport.authenticate("github", { scope: ["user:email"], session: false }));
router.get(
  "/github/callback",
  passport.authenticate("github", { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=github` }),
  issueTokenAndRedirect
);

router.get("/me", requireAuth, (req, res) => {
  res.json(req.user);
});

export default router;
