import { PrismaService } from '../prisma/prisma.service';
import { GameService } from './game.service';
import {
  Context,
  createMockContext,
  MockContext,
} from '../../test/prisma-context';
import { CreateGameDto } from './dto';
import { Game, Publisher } from '@prisma/client';
import { UpdateGameDto } from './dto/update-game.dto';

describe('GameService', () => {
  let service: GameService;
  let prisma: PrismaService;
  let mockCtx: MockContext;
  let ctx: Context;

  let publisherFromDb: Publisher;

  beforeEach(async () => {
    mockCtx = createMockContext();
    ctx = mockCtx as unknown as Context;
    prisma = ctx.prisma;
    service = new GameService(prisma);

    publisherFromDb = {
      id: 1,
      name: 'Ubisoft Inc',
      siret: '123-456',
      phone: '+372 3333-4444',
    };
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createGame', () => {
    const gameToCreate: CreateGameDto = {
      title: 'Hollow Knight',
      publisherId: 1,
      releaseDate: new Date('2022-05-30T00:00:00Z'),
      price: 0.0,
      tags: ['indie', 'action', 'dark'],
    };

    it('should call repository to persist a game', async () => {
      const gameFromDb: Game = {
        id: 1,
        ...gameToCreate,
      };

      const validPublisher: Publisher = {
        id: 1,
        name: '',
        phone: '',
        siret: '',
      };

      mockCtx.prisma.publisher.findUnique.mockResolvedValue(validPublisher);
      mockCtx.prisma.game.create.mockResolvedValue(gameFromDb);

      const newGame = await service.create(gameToCreate);

      expect(prisma.game.create).toBeCalledTimes(1);
      expect(prisma.game.create).toBeCalledWith(
        expect.objectContaining({
          data: gameToCreate,
        }),
      );
      expect(newGame).toEqual(gameFromDb);
    });

    it('should not call repository to persist a game due to an invalid publisher id', async () => {
      const gameFromDb: Game = {
        id: 1,
        ...gameToCreate,
      };

      mockCtx.prisma.publisher.findUnique.mockResolvedValue(null);
      mockCtx.prisma.game.create.mockResolvedValue(gameFromDb);

      await expect(service.create(gameToCreate)).rejects.toThrowError(
        'Invalid publisher id',
      );
      expect(prisma.game.create).toBeCalledTimes(0);
    });
  });

  describe('getById', () => {
    it('should call repository to get a game by its id', async () => {
      const fakeGame: Game = {
        id: 999,
        price: 0,
        title: '',
        publisherId: 1,
        releaseDate: new Date(),
        tags: [],
      };

      mockCtx.prisma.game.findUnique.mockResolvedValue(fakeGame);

      await service.getById(999);

      expect(prisma.game.findUnique).toBeCalledWith({
        where: {
          id: 999,
        },
      });
    });

    it('should call repository to get a game and throw an not found error', async () => {
      mockCtx.prisma.game.findUnique.mockResolvedValue(null);

      await expect(service.getById(999)).rejects.toThrowError('Game not found');

      expect(prisma.game.findUnique).toBeCalledWith({
        where: {
          id: 999,
        },
      });
    });
  });

  describe('getAll', () => {
    it('should call repository to get all games', async () => {
      await service.getAll();
      expect(prisma.game.findMany).toBeCalledTimes(1);
    });
  });

  describe('delete', () => {
    it('should call repository to delete a game by its id', async () => {
      const fakeGame: Game = {
        id: 999,
        price: 0,
        title: '',
        publisherId: 1,
        releaseDate: new Date(),
        tags: [],
      };
      mockCtx.prisma.game.findUnique.mockResolvedValue(fakeGame);
      mockCtx.prisma.game.delete.mockImplementation();

      await service.delete(999);

      expect(prisma.game.findUnique).toBeCalledWith({
        where: {
          id: 999,
        },
      });

      expect(prisma.game.delete).toBeCalledWith({
        where: {
          id: 999,
        },
      });
    });

    it('should call repository to find a game by its id and throw a not found error', async () => {
      mockCtx.prisma.game.findUnique.mockResolvedValue(null);
      mockCtx.prisma.game.delete.mockImplementation();

      await expect(service.delete(999)).rejects.toThrowError('Game not found');

      expect(prisma.game.findUnique).toBeCalledWith({
        where: {
          id: 999,
        },
      });

      expect(prisma.game.delete).toBeCalledTimes(0);
    });
  });

  describe('update', () => {
    it('should call repository to find a game by its id and throw a not found error', async () => {
      mockCtx.prisma.game.findUnique.mockResolvedValue(null);

      await expect(
        service.update(999, new UpdateGameDto()),
      ).rejects.toThrowError('Game not found');

      expect(prisma.game.findUnique).toBeCalledWith({
        where: {
          id: 999,
        },
      });
      expect(prisma.game.update).toBeCalledTimes(0);
    });

    it('should call repository to update a game by its id', async () => {
      const fakeGame: Game = {
        id: 999,
        price: 0,
        title: '',
        publisherId: 1,
        releaseDate: new Date(),
        tags: [],
      };
      mockCtx.prisma.game.findUnique.mockResolvedValue(fakeGame);
      mockCtx.prisma.game.update.mockImplementation();

      const gameUpdate: UpdateGameDto = {
        title: 'Lost Ark',
      };

      await service.update(999, gameUpdate);

      expect(prisma.game.findUnique).toBeCalledWith({
        where: {
          id: 999,
        },
      });

      expect(prisma.game.update).toBeCalledWith({
        where: {
          id: 999,
        },
        data: {
          ...gameUpdate,
        },
      });
    });
  });

  describe('getPublisher', () => {
    it('should call repository and find a publisher by a valid gameId', async () => {
      const gameFromDb: Game = {
        id: 1,
        title: 'Cup Head',
        publisherId: publisherFromDb.id,
        price: 0.0,
        tags: [],
        releaseDate: new Date(),
      };
      mockCtx.prisma.publisher.findUnique.mockResolvedValue(publisherFromDb);

      const getByIdSpy = jest
        .spyOn(service, 'getById')
        .mockResolvedValue(gameFromDb);

      const publisher = await service.getPublisher(1);

      expect(getByIdSpy).toBeCalledWith(1);
      expect(prisma.publisher.findUnique).toBeCalledTimes(1);
      expect(publisher).toEqual(publisherFromDb);
    });

    it('should not call repository to find a publisher due to an invalid gameId', async () => {
      mockCtx.prisma.publisher.findUnique.mockResolvedValue(publisherFromDb);

      const getByIdSpy = jest.spyOn(service, 'getById');

      await expect(service.getPublisher(1)).rejects.toThrowError(
        'Game not found',
      );

      expect(getByIdSpy).toBeCalledWith(1);
      expect(prisma.publisher.findUnique).toBeCalledTimes(0);
    });
  });

  describe('triggerUpdateProcess', () => {
    it('should call batch process methods', async () => {
      const updateMethod = jest.spyOn(service, 'applyDiscount');
      const deleteMethod = jest.spyOn(service, 'deleteOldGames');

      await service.triggerUpdateProcess();

      expect(updateMethod).toBeCalledTimes(1);
      expect(deleteMethod).toBeCalledTimes(1);
    });
  });

  describe('deleteOldGames', () => {
    it('should call repository with delete rules', async () => {
      const deleteDate = new Date();
      deleteDate.setHours(0, 0, 0, 0);
      deleteDate.setMonth(deleteDate.getMonth() - 18);

      await service.deleteOldGames();

      expect(prisma.game.deleteMany).toBeCalledWith({
        where: {
          releaseDate: {
            lt: deleteDate,
          },
        },
      });
    });
  });

  describe('applyDiscount', () => {
    it('should call repository with update rules', async () => {
      const deleteDate = new Date();
      deleteDate.setHours(0, 0, 0, 0);
      deleteDate.setMonth(deleteDate.getMonth() - 18);

      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      startDate.setMonth(startDate.getMonth() - 12);

      await service.applyDiscount();

      expect(prisma.game.updateMany).toBeCalledWith({
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
    });
  });
});
