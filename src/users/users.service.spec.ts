import { UnprocessableEntityException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmailService } from 'src/email/email.service';
import { UserEntity } from './entities/user.entity';
import { UsersModule } from './users.module';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let module: TestingModule;
  let service: UsersService;
  let sendUserVerificationEmailMock;

  beforeEach(async () => {
    sendUserVerificationEmailMock = jest
      .fn()
      .mockImplementation(() => console.log('email sent'));

    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [UserEntity],
          synchronize: true,
        }),
        UsersModule,
      ],
    })
      .overrideProvider(EmailService)
      .useValue({ sendUserVerificationEmail: sendUserVerificationEmailMock })
      .compile();

    service = module.get(UsersService);
    await service.createUser('tom', 'tom@email.com', '!@#$');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hasEmail', () => {
    it('should return true when email exists', async () => {
      expect(await service.hasEmail('tom@email.com')).toBeTruthy();
    });

    it('should return false when email does not exist ', async () => {
      expect(await service.hasEmail('notExistedEmail@email.com')).toBeFalsy();
    });
  });

  describe('createUser', () => {
    it('should create new user when email is not existed', async () => {
      expect(await service.hasEmail('to1m@email.com')).toBeFalsy();
      await service.createUser('tom', 'to1m@email.com', '!@#$');
      expect(await service.hasEmail('to1m@email.com')).toBeTruthy();
    });

    it('should throw Error when email is existed', async () => {
      const result = service.createUser('tom', 'tom@email.com', '!@#$');
      await expect(result).rejects.toThrowError(
        new UnprocessableEntityException('이미 가입된 이메일 입니다.'),
      );
    });
  });
});
