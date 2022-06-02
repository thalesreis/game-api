import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGameDto } from './dto';
import { UpdateGameDto } from './dto/update-game.dto';

@Injectable()
export class GameService {
  async getAll() {
    return await this.prisma.game.findMany();
  }
  constructor(private prisma: PrismaService) {}

  async create(gameDto: CreateGameDto) {
    const publisher = await this.prisma.publisher.findUnique({
      where: {
        id: gameDto.publisherId,
      },
    });

    if (!publisher) {
      throw new BadRequestException('Invalid publisher id');
    }

    return await this.prisma.game.create({
      data: {
        ...gameDto,
      },
    });
  }

  async getById(gameId: number) {
    const game = await this.prisma.game.findUnique({
      where: {
        id: gameId,
      },
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    return game;
  }

  async getPublisher(gameId: number) {
    const game = await this.getById(gameId);
    return await this.getGamePublisher(game.publisherId);
  }

  private async getGamePublisher(publisherId: number) {
    return await this.prisma.publisher.findUnique({
      where: {
        id: publisherId,
      },
    });
  }

  async update(gameId: number, updateGameDto: UpdateGameDto) {
    const game = await this.getById(gameId);

    return this.prisma.game.update({
      where: {
        id: game.id,
      },
      data: {
        ...updateGameDto,
      },
    });
  }

  async delete(gameId: number) {
    const game = await this.getById(gameId);
    return await this.prisma.game.delete({
      where: {
        id: game.id,
      },
    });
  }

  async triggerUpdateProcess() {
    this.applyDiscount();
    this.deleteOldGames();
  }

  applyDiscount() {
    return new Promise<Prisma.BatchPayload>((resolve, reject) => {
      const deleteDate = new Date();
      deleteDate.setHours(0, 0, 0, 0);
      deleteDate.setMonth(deleteDate.getMonth() - 18);

      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      startDate.setMonth(startDate.getMonth() - 12);

      setTimeout(async () => {
        const result = await this.prisma.game.updateMany({
          where: {
            releaseDate: {
              lt: startDate,
              gt: deleteDate,
            },
          },
          data: {
            price: {
              multiply: 1 - 0.2,
            },
          },
        });
        resolve(result);
      }, 1000);
    }).then((info) => {
      //Notify some message broker?!
    });
  }

  deleteOldGames() {
    return new Promise<Prisma.BatchPayload>((resolve, reject) => {
      const deleteDate = new Date();
      deleteDate.setHours(0, 0, 0, 0);
      deleteDate.setMonth(deleteDate.getMonth() - 18);
      setTimeout(async () => {
        const result = await this.prisma.game.deleteMany({
          where: {
            releaseDate: {
              lt: deleteDate,
            },
          },
        });
        resolve(result);
      }, 1000);
    }).then((info) => {
      //Notify some message broker?!
    });
  }
}
