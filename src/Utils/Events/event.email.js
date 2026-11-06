import { EventEmitter } from "node:events";
import { subjectsEmail } from "../Enums/email.enums.js";
import { template } from "../email/generateHTML.js";
import { sendEmail } from "../email/nodemailer.email.js";

export const emailEvent = new EventEmitter();

emailEvent.on("Welcome", async (data) => {
  try {
    await sendEmail({
      to: data.to,
      subject: subjectsEmail.WELCOME,
      text: `Welcome ${data.firstName} ${data.lastName} to SarahaApp! We're thrilled to have you on board. Explore our features and enjoy your experience!`,
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }
});

emailEvent.on("Forget Password", async (data) => {
  try {
    await sendEmail({
      to: data.to,
      subject: subjectsEmail.FORGET_PASSWORD,
      html: template(data.otp, data.firstName, subjectsEmail.FORGET_PASSWORD),
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }
});