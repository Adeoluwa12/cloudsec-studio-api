import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import User from "../models/User.js";

async function findOrCreateUser({ provider, providerId, name, email, avatarUrl }) {
  let user = await User.findOne({ provider, providerId });
  if (user) return user;

  // A user who signed in with Google before and now uses GitHub (or vice versa)
  // with the same email is treated as the same person to avoid duplicate accounts.
  user = await User.findOne({ email });
  if (user) return user;

  const role = email === process.env.ADMIN_EMAIL ? "admin" : "student";
  const created = await User.create({ provider, providerId, name, email, avatarUrl, role });
  created._wasJustCreated = true; // transient flag, not persisted — read once in the callback route
  return created;
}

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await findOrCreateUser({
          provider: "google",
          providerId: profile.id,
          name: profile.displayName,
          email: profile.emails?.[0]?.value,
          avatarUrl: profile.photos?.[0]?.value || "",
        });
        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL}/api/auth/github/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await findOrCreateUser({
          provider: "github",
          providerId: profile.id,
          name: profile.displayName || profile.username,
          email: profile.emails?.[0]?.value || `${profile.username}@users.noreply.github.com`,
          avatarUrl: profile.photos?.[0]?.value || "",
        });
        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);

export default passport;
