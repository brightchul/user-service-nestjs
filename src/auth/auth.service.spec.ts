import { Test, TestingModule } from '@nestjs/testing';
import authConfig from 'src/config/authConfig';
import { AuthService } from './auth.service';

import * as jwt from 'jsonwebtoken';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: authConfig.KEY,
          useValue: {
            jwtSecret: 'mysecretkey',
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return a walid JWT token', () => {
      const user = {
        id: '123',
        name: 'James Bone',
        email: 'jamesbone@example.com',
      };

      const token = service.login(user);
      expect(token).toBeDefined();

      // You can al so decode the token to check its payload
      const decode = jwt.decode(token);

      expect(decode).toMatchObject({
        id: user.id,
        name: user.name,
        email: user.email,
        iss: 'example.com',
        aud: 'example.com',
      });
    });
  });

  describe('verify', () => {
    it('should return the user ID and email from a valid token', () => {
      const user = {
        id: '123',
        name: 'James Bone',
        email: 'jamesbone@example.com',
      };

      const token = service.login(user);
      const { userId, email } = service.verify(token);

      expect(userId).toBe(user.id);
      expect(email).toBe(user.email);
    });
  });
});
