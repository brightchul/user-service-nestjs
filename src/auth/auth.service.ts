import * as jwt from 'jsonwebtoken';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';

import authConfig from 'src/config/authConfig';

type User = {
  id: string;
  name: string;
  email: string;
};

type VerifyPayload = (jwt.JwtPayload | string) & User;

@Injectable()
export class AuthService {
  constructor(
    @Inject(authConfig.KEY) private config: ConfigType<typeof authConfig>,
  ) {}

  login(user: User) {
    const payload = { ...user };

    return jwt.sign(payload, this.config.jwtSecret, {
      expiresIn: '1d',
      audience: 'example.com',
      issuer: 'example.com',
    });
  }

  verify(jwtString: string) {
    try {
      const payload = jwt.verify(jwtString, this.config.jwtSecret);
      const { id: userId, email } = payload as VerifyPayload;
      return { userId, email };
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
