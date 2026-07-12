require("dotenv").config();

const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const TO_EMAIL = "Dvaidya2020@gmail.com";

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json({ limit: "20kb" }));
app.use(express.static(__dirname));

function clean(value) {
  return String(value || "").trim();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function createTransporter() {
  const port = Number(process.env.SMTP_PORT || 587);

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

app.post("/api/enquiry", async (req, res) => {
  const name = clean(req.body.name);
  const phone = clean(req.body.phone);
  const service = clean(req.body.service);
  const message = clean(req.body.message) || "No additional message provided.";

  if (!name || !phone || !service) {
    return res.status(400).json({ message: "Name, phone, and service are required." });
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return res.status(500).json({ message: "Email service is not configured." });
  }

  const subject = `Website enquiry from ${name}`;
  const text = [
    "New enquiry from Finest Management Services website:",
    "",
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Service Required: ${service}`,
    "",
    "Message:",
    message,
  ].join("\n");

  const safeName = escapeHtml(name);
  const safePhone = escapeHtml(phone);
  const safeService = escapeHtml(service);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

  const html = `
    <h2>New Website Enquiry</h2>
    <p><strong>Name:</strong> ${safeName}</p>
    <p><strong>Phone:</strong> ${safePhone}</p>
    <p><strong>Service Required:</strong> ${safeService}</p>
    <p><strong>Message:</strong></p>
    <p>${safeMessage}</p>
  `;

  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"Finest Management Services Website" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: TO_EMAIL,
      replyTo: process.env.SMTP_REPLY_TO || process.env.SMTP_USER,
      subject,
      text,
      html,
    });

    res.json({ message: "Enquiry sent successfully." });
  } catch (error) {
    console.error("Email send failed:", error);
    res.status(500).json({ message: "Unable to send enquiry." });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Finest Management Services website running on http://localhost:${PORT}`);
});
