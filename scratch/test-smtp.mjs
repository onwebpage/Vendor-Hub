import "dotenv/config";
import nodemailer from "nodemailer";

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

console.log("Using User:", GMAIL_USER);
console.log("Using Pass (masked):", GMAIL_APP_PASSWORD ? GMAIL_APP_PASSWORD.replace(/./g, "*") : "NOT SET");

if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
  console.error("Missing credentials in .env");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD.replace(/\s/g, ""),
  },
});

async function test() {
  try {
    console.log("Verifying transporter...");
    await transporter.verify();
    console.log("Transporter verified successfully!");

    console.log("Sending test email to:", GMAIL_USER);
    const info = await transporter.sendMail({
      from: GMAIL_USER,
      to: GMAIL_USER, // Send to self
      subject: "Vendorkart Email Test",
      text: "This is a test email to verify the SMTP configuration.",
    });
    console.log("Email sent successfully!", info.messageId);
  } catch (err) {
    console.error("Failed to send email:", err);
  }
}

test();
