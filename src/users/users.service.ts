import { DataSource, Repository } from 'typeorm';
import { ulid } from 'ulid';
import * as uuid from 'uuid';

import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    private datasource: DataSource,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async createUser(name: string, email: string, password: string) {
    if (await this.hasEmail(email)) {
      throw new UnprocessableEntityException('이미 가입된 이메일 입니다.');
    }

    const signupVerifyToken = uuid.v1();

    await this.datasource.transaction(async (manager) => {
      const user = new UserEntity();
      user.id = ulid();
      user.name = name;
      user.email = email;
      user.password = password;
      user.signupVerifyToken = signupVerifyToken;

      await manager.save(user);
    });
  }

  async hasEmail(email: string) {
    return (await this.userRepository.findOne({ where: { email } })) !== null;
  }
}
