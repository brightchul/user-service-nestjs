import { UnprocessableEntityException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersModule } from './users.module';
import { UsersService } from './users.service';

const initUserData = {
  name: 'tom',
  email: 'tom@email.com',
  password: 'asdf!@#!123',
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [UserEntity],
          synchronize: true,
        }),
        UsersModule,
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    const service = module.get(UsersService);
    await service.createUser(
      initUserData.name,
      initUserData.email,
      initUserData.password,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createUser', () => {
    it('should add new user', async () => {
      await controller.createUser({
        ...initUserData,
        email: 'newuser@email.com',
      });
    });

    it('should throw error when the email is existed ', async () => {
      const result = controller.createUser(initUserData);
      await expect(result).rejects.toThrowError(
        new UnprocessableEntityException('이미 가입된 이메일 입니다.'),
      );
    });
  });
});
