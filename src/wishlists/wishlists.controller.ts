import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { UseGuards } from '@nestjs/common/decorators';
import { NotFoundException } from '@nestjs/common/exceptions';
import { JwtAuthGuard } from 'src/auth/jwtAuth.guard';
import { UsersService } from 'src/users/users.service';
import { CreateWishlistDto } from './dto/createWishlist.dto';
import { UpdateWishlistDto } from './dto/updateWishlist.dto';
import { Wishlist } from './entities/wishlist.enitity';
import { WishlistsService } from './wishlists.service';

@UseGuards(JwtAuthGuard)
// странный путь
@Controller('wishlistlists')
export class WishlistsController {
  constructor(
    private wishlistsService: WishlistsService,
    private usersService: UsersService,
  ) {}

  @Post()
  async create(
    @Req() req,
    @Body() createWishlistDto: CreateWishlistDto,
  ): Promise<Wishlist> {
    return this.wishlistsService.create(req.user, createWishlistDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(): Promise<Wishlist[]> {
    const wishlists = await this.wishlistsService.findAll();
    wishlists.forEach((item) => {
      delete item.owner.password;
      delete item.owner.email;
    });
    return wishlists;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const wishlist = await this.wishlistsService.findOne(id);
    delete wishlist.owner.password;
    delete wishlist.owner.email;
    return wishlist;
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWishlistDto: UpdateWishlistDto,
  ) {
    return this.wishlistsService.update(id, updateWishlistDto);
  }

  @Delete(':id')
  async removeById(@Req() req, @Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findById(id);
    if (user !== req.user) {
      throw new NotFoundException('Этот лист вам не принадлежит');
    }

    return this.wishlistsService.removeById(id);
  }
}
