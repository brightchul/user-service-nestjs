import { DataSource, Repository } from 'typeorm';
import { ulid } from 'ulid';
import * as uuid from 'uuid';

import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { UserEntity } from './entities/user.entity';
import { EmailService } from 'src/email/email.service';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class UsersService {
  constructor(
    private datasource: DataSource,
    private emailService: EmailService,
    private authService: AuthService,

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

    await this.sendUserVerificationEmail(email, signupVerifyToken);
  }

  async hasEmail(email: string) {
    return (await this.userRepository.findOne({ where: { email } })) !== null;
  }

  private async sendUserVerificationEmail(
    email: string,
    signupVerifyToken: string,
  ) {
    await this.emailService.sendUserVerificationEmail(email, signupVerifyToken);
  }

  async verifyEmail(signupVerifyToken: string): Promise<string> {
    const user = await this.userRepository.findOne({
      where: { signupVerifyToken },
    });

    if (!user) {
      throw new NotFoundException('유저가 존재하지 않습니다');
    }

    return this.authService.login({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  }
}
