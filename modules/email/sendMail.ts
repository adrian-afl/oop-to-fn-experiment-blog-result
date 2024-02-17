import { createTransport } from "nodemailer";

import { config } from "@app/config";

export interface Email {
  from: string;
  to: string;
  subject: string;
  textBody: string;
  htmlBody: string;
}

const transporter = createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.secure,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.password,
  },
});

export async function sendEmail(email: Email): Promise<void> {
  await transporter.sendMail({
    from: email.from,
    to: email.to,
    subject: email.subject,
    text: email.textBody,
    html: email.htmlBody,
  });
}
