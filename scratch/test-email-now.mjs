import "dotenv/config";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const nodemailer = require("nodemailer");

const user = process.env.GMAIL_USER;
const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "");

console.log("GMAIL_USER:", user);
console.log("GMAIL_APP_PASSWORD:", pass ? `SET (${pass.length} chars)` : "NOT SET");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: { user, pass },
  connectionTimeout: 15000,
  socketTimeout: 15000,
  family: 4,
});

try {
  console.log("Verifying SMTP connection...");
  await transporter.verify();
  console.log("✅ SMTP verified!");

  await transporter.sendMail({
    from: `"Vendorkart" <${user}>`,
    to: "hamdapply@gmail.com",
    subject: "Vendorkart OTP Test",
    text: "Your test OTP is: 123456\n\nThis code expires in 10 minutes.",
  });
  console.log("✅ Email sent to hamdapply@gmail.com!");
} catch (err) {
  console.error("❌ Error:", err.message);
  console.error("Code:", err.code);
  console.error("Response:", err.response);
}
