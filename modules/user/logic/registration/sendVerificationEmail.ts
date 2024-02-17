import { config } from "@app/config";
import { sendEmail } from "@app/modules/email/sendMail";
import { generateToken } from "@app/modules/user/logic/authentication/generateToken";

export async function sendVerificationEmail(
  email: string,
  userId: string
): Promise<void> {
  const token = generateToken({ id: userId }, "24h");
  const urlEncodedToken = encodeURIComponent(token);
  const url = config.frontend.url + `/verify?token=${urlEncodedToken}`;

  const textBody =
    `Hello! We are so happy that you registered an account. We are sending you this message ` +
    `to verify the email address you provided is correct.\n` +
    `Open the following link in your browser of choice: ${url}\n\n` +
    `Hope to see you flying soon! AFL Space Team.`;

  const htmlBody =
    `<b>Hello!</b><br><br>We are so happy that you registered an account.<br>We are sending you this message ` +
    `to verify the email address you provided is correct.<br><br>` +
    `Click the following link in your browser of choice: <a href="${url}">Link</a><br><br>` +
    `If you have troubles opening the link, paste and open this url in your browser of choice:<br><i>${url}</i><br><br>` +
    `Hope to see you flying soon!<hr><b>AFL Space Team.</b>`;

  await sendEmail({
    from: `"AFL Space" <aflabs@example.com>`,
    to: email,
    subject: "Verify your email on AFL Space",
    htmlBody,
    textBody,
  });
}
