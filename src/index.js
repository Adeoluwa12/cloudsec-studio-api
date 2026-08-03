import "dotenv/config";
import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "./config/passport.js";
import { connectDB } from "./db.js";
import authRoutes from "./routes/auth.js";
import publicRoutes from "./routes/public.js";
import progressRoutes from "./routes/progress.js";
import adminRoutes from "./routes/admin.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

// Session is only used transiently during the OAuth handshake (passport
// requires it even in "session: false" mode for the redirect round-trip);
// actual auth state afterwards is the JWT, not the session cookie.
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api", publicRoutes);
app.use("/api", progressRoutes);
app.use("/api/admin", adminRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
});

const PORT = process.env.PORT || 4001;

connectDB()
  .then(() => app.listen(PORT, () => console.log(`API running on port ${PORT}`)))
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
