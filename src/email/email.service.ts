import { Injectable } from '@nestjs/common';
import Mail from 'nodemailer/lib/mailer';
import * as nodemailer from 'nodemailer';

interface VerificationEmail {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private transporter: Mail;
  private baseUrl: string;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_AUTH_USER,
        pass: process.env.EMAIL_AUTH_PASSWORD,
      },
    });

    this.baseUrl = process.env.EMAIL_BASE_URL;
  }

  async sendUserVerficationEmail(email: string, signupVerifyToken: string) {
    const url = `${this.baseUrl}/users/email-verify?signupVerifyToken=${signupVerifyToken}`;

    const verificationEmail: VerificationEmail = {
      to: email,
      subject: '가입 인증 메일',
      html: `
      가입확인 버튼을 누르시면 가입 인증이 완료됩니다.<br/>
      <form action="${url}" method="POST">
        <button>가입확인</button>
      </form>
      `,
    };

    return await this.transporter.sendMail(verificationEmail);
  }
}
