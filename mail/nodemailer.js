import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

console.log("=====>", process.env.EMAIL_USER);

export const sendEmail = async ({
  to,
  subject,
  html,
}) => {
  try {
    const mailOptions = {
      from: `"BookStore" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info =
      await transporter.sendMail(mailOptions);

    console.log(
      "Email sent successfully:",
      info.messageId
    );

    return info;
  } catch (error) {
    console.error(
      "Nodemailer Error:",
      error
    );

    throw error;
  }
};