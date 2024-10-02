import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: "servicedesk@orbittechnologys.com",
    pass: "364133Rrock.!",
  },
});

export const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: "servicedesk@orbittechnologys.com",
      to,
      subject,
      html: text,
    });
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};
