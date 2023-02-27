import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.enitity';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { FindUsersDto } from './dto/findUsers.dto';
import { NotFoundException } from '@nestjs/common/exceptions';
import { UserPublicProfileResponse } from './dto/userPublicProfileResponse.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hash = await bcrypt.hash(createUserDto.password, 10);
    const createdUser = this.userRepository.create({
      ...createUserDto,
      password: hash,
    });
    return this.userRepository.save(createdUser);
  }

  async findById(id: number): Promise<UserPublicProfileResponse> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) throw new NotFoundException('Пользоатель не найден');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;

    return result;
  }

  async findByName(username: string) {
    return await this.userRepository.findOneBy({ username });
  }

  async removeById(id: number) {
    return this.userRepository.delete({ id });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      const password = await bcrypt.hash(updateUserDto.password, 10);
      return this.userRepository.update(id, {
        ...updateUserDto,
        password,
      });
    }
    return await this.userRepository.update(id, updateUserDto);
  }

  async findMany({ query }: FindUsersDto) {
    const users = await this.userRepository.find({
      where: [{ email: query }, { username: query }],
    });
    users.forEach((item) => delete item.password);
    return users;
  }
}
