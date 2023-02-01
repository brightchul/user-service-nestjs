import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const userEntityData = {
  id: '1',
  name: 'tom',
  email: 'tom@email.com',
  password: '!@#$',
};

const mockRepository = () => ({
  findOne: jest.fn(),
});

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: MockRepository<UserEntity>;

  const MockDataSource = {
    provide: DataSource,
    useClass: class {
      transaction = jest.fn();
    },
  };

  const MockUserRepository = {
    provide: getRepositoryToken(UserEntity),
    useFactory: mockRepository,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, MockDataSource, MockUserRepository],
    }).compile();

    service = module.get(UsersService);
    userRepository = module.get('UserEntityRepository');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hasEmail', () => {
    it('result is true', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(userEntityData);
      expect(await service.hasEmail('tom@email.com')).toBeTruthy();
    });

    it('result is null', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      expect(await service.hasEmail('notExistedEmail@email.com')).toBeFalsy();
    });
  });
});
