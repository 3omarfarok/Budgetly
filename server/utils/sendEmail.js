import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  // Use a mock transporter for development if no env vars
  // Or configure real one
  // For now, logging to console for safety in dev mode if env vars missing

  const hasGmail = process.env.EMAIL_USERNAME && process.env.EMAIL_PASSWORD;
  const hasSMTP =
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    (process.env.SMTP_EMAIL || process.env.EMAIL_USERNAME) &&
    (process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD);

  if (!hasGmail && !hasSMTP) {
    console.log(
      "No Email Service Configured (Gmail or Custom SMTP). Email content:"
    );
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: ${options.message}`);
    return;
  }

  let transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
    console.log(
      `Using Custom SMTP: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`
    );
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_EMAIL || process.env.EMAIL_USERNAME,
        pass: process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD,
      },
    });
  } else {
    console.log("Using Gmail Service");
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  const senderEmail =
    process.env.SENDER_EMAIL ||
    process.env.SMTP_EMAIL ||
    process.env.EMAIL_USERNAME;

  if (!senderEmail || !senderEmail.includes("@")) {
    console.error(`❌ ERROR: Invalid Sender Email: '${senderEmail}'`);
    console.error(
      "👉 Please set SENDER_EMAIL=your-verified-email@example.com in your server/.env file."
    );
    throw new Error(
      "Invalid Sender Email configuration: Email must contain '@'"
    );
  }

  console.log(`Attempting to send email from: ${senderEmail}`);

  const mailOptions = {
    from: `Budgetly App <${senderEmail}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html, // Optional HTML
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
