import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.enitity';
import { WishesService } from '../wishes/wishes.service';
import { In, Repository } from 'typeorm';
import { CreateWishlistDto } from './dto/createWishlist.dto';
import { UpdateWishlistDto } from './dto/updateWishlist.dto';
import { Wishlist } from './entities/wishlist.enitity';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,
    private wishesService: WishesService,
  ) {}

  async findAll() {
    return this.wishlistRepository.find({
      relations: {
        items: true,
        owner: true,
      },
    });
  }

  async findOne(id: number) {
    return this.wishlistRepository.findOne({
      where: { id },
      relations: { items: true, owner: true },
    });
  }

  async create(user: User, createDto: CreateWishlistDto) {
    const items = await this.wishesService.findMany({
      where: { id: In(createDto.itemsId) },
    });

    delete createDto.itemsId;
    const list = await this.wishlistRepository.save({
      owner: {
        id: user.id,
        username: user.username,
        about: user.about,
        avatar: user.avatar,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      items,
      ...createDto,
    });
    return list;
  }

  async update(id: number, updateDto: UpdateWishlistDto) {
    const items = await this.wishesService.findMany({
      where: { id: In(updateDto.itemsId) },
    });
    delete updateDto.itemsId;
    return this.wishlistRepository.save({
      id,
      items,
      ...updateDto,
    });
  }

  async removeById(id: number): Promise<any> {
    return this.wishlistRepository.delete({ id });
  }
}
