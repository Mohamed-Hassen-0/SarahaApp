import nodemailer from "nodemailer";
import { USER_EMAIL, USER_PASSWORD } from "../../../config/config.service.js";

export const sendEmail = async ({to ="",subject ="",text ="",html ="",cc ="",bcc = "",attachments = []}) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: USER_EMAIL,
      pass: USER_PASSWORD,
    },
  });

  try {
    const info = await transporter.sendMail({
    from: `"Saraha_App" <${USER_EMAIL}>`,
    to,
    subject,
    text,
    html,
    cc,
    bcc,
    attachments
  });
  console.log(`Email sent: ${info.messageId}`);
  } catch (error) {
    console.error(error);
  }
};

