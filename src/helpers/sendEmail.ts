import nodemailer from "nodemailer";
import config from "../config";

const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  text?: string
) => {
  try {
    console.log({
      user: config.emailSender.email,
      pass: config.emailSender.app_pass,
    });
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // TLS
      auth: {
        user: config.emailSender.email,
        pass: config.emailSender.app_pass, // Gmail App Password
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: `"Support" <${config.emailSender.email}>`,
      to,
      subject,
      html,
      text: text || "Please view this email in an HTML-compatible client.",
    };

    await transporter.sendMail(mailOptions);
  } catch (error : any) {
    console.log("Email sending failed:", error);
    throw new Error("Failed to send email");
  }
};

export default sendEmail;
