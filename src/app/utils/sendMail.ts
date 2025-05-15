import nodemailer from 'nodemailer';
import { User } from '@prisma/client';
import config from '../../config';

class Email {
  private to: string;
  private user: User;

  constructor(user: User) {
    this.user = user;
    this.to = user.email;
  }

  private newTransport() {
    return nodemailer.createTransport({
      host: config.email_host,
      port: Number(config.email_port),
      secure: false, // true for 465, false for other ports
      auth: {
        user: config.email_user,
        pass: config.email_pass,
      },
    });
  }

  private async send(subject: string, html: string) {
    const mailOptions = {
      from: `"FLIND" <${config.email_user}>`,
      to: this.to,
      subject,
      html,
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendEmailVerificationLink(subject: string, verificationLink: string) {
    const html = `
      <div>
        <h2>Welcome to FLIND!</h2>
        <p>Click the link below to verify your email:</p>
        <a href="${verificationLink}">${verificationLink}</a>
      </div>
    `;
    await this.send(subject, html);
  }

  async sendCustomEmail(subject: string, message: string) {
    const html = `
      <div>
        <p>${message}</p>
      </div>
    `;
    await this.send(subject, html);
  }
}

export default Email;
