import * as dotenv from 'dotenv';
import { createTransport } from 'nodemailer';
import * as path from 'path';
import { Test, TestingModule } from '@nestjs/testing';

import { EmailService } from './email.service';

const createTransportMock = jest.fn(() => ({
  sendMail: jest.fn(),
})) as unknown as typeof createTransport;

const nodemailerProviderMock = {
  provide: 'NODEMAILER',
  useFactory: () =>
    createTransportMock({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_AUTH_USER,
        pass: process.env.EMAIL_AUTH_PASSWORD,
      },
    }),
};

describe('EmailService', () => {
  let service: EmailService;
  let nodemailerMock;

  beforeAll(() => {
    dotenv.config({
      path: path.resolve(`src/config/env/.development.env`),
    });
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService, nodemailerProviderMock],
    }).compile();

    service = module.get<EmailService>(EmailService);
    nodemailerMock = module.get('NODEMAILER');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send user verification email', async () => {
    const email = 'test@email.com';
    const signupVerifyToken = 'test-verify-token';

    await service.sendUserVerificationEmail(email, signupVerifyToken);

    expect(createTransportMock).toHaveBeenCalledWith({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_AUTH_USER,
        pass: process.env.EMAIL_AUTH_PASSWORD,
      },
    });

    expect(nodemailerMock.sendMail).toHaveBeenCalledWith({
      to: email,
      subject: '가입 인증 메일',
      html: expect.any(String),
    });
  });
});
