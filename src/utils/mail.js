import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail({ name, email }) {
  return resend.emails.send({
    from: process.env.FROM_EMAIL,
    to: email,
    subject: "Welcome to CloudSec.studio",
    html: `
      <p>Hi ${escapeHtml(name)},</p>
      <p>Welcome to CloudSec.studio — your account is ready. Jump into a lab or
      quiz any time to start earning badges.</p>
    `,
  });
}

function escapeHtml(str = "") {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
