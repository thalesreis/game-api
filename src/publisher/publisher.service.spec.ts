import { Game, Publisher } from '@prisma/client';
import { GameService } from '../game/game.service';
import { mock } from 'ts-mockito';
import {
  Context,
  createMockContext,
  MockContext,
} from '../../test/prisma-context';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePublisherDto } from './dto/create-publisher.dto';
import { PublisherService } from './publisher.service';

describe('PublisherService', () => {
  let service: PublisherService;
  let gameService: GameService;
  let prisma: PrismaService;
  let mockCtx: MockContext;
  let ctx: Context;
  let publisherFromDb: Publisher;

  beforeEach(() => {
    mockCtx = createMockContext();
    ctx = mockCtx as unknown as Context;
    gameService = mock(GameService);

    publisherFromDb = {
      id: 1,
      name: 'Ubisoft Inc',
      siret: '123-456',
      phone: '+372 3333-4444',
    };

    prisma = ctx.prisma;
    service = new PublisherService(prisma);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPublisher', () => {
    const newPublisherToCreate: CreatePublisherDto = {
      name: 'Ubisoft Inc',
      siret: '123-456',
      phone: '+372 3333-4444',
    };

    it('should call repository to persist a publisher', async () => {
      mockCtx.prisma.publisher.create.mockResolvedValue(publisherFromDb);

      const newPublisher = await service.create(newPublisherToCreate);

      expect(prisma.publisher.create).toBeCalledTimes(1);
      expect(prisma.publisher.create).toBeCalledWith(
        expect.objectContaining({
          data: newPublisherToCreate,
        }),
      );
      expect(newPublisher.name).toEqual(newPublisherToCreate.name);
      expect(newPublisher.siret).toEqual(newPublisherToCreate.siret);
      expect(newPublisher.phone).toEqual(newPublisherToCreate.phone);
    });

    it('should not call repository to create due to an already taken siret', async () => {
      mockCtx.prisma.publisher.findFirst.mockResolvedValue(publisherFromDb);

      await expect(service.create(newPublisherToCreate)).rejects.toThrowError(
        'Siret already taken',
      );

      expect(prisma.publisher.findFirst).toBeCalledWith(
        expect.objectContaining({
          where: {
            siret: newPublisherToCreate.siret,
          },
        }),
      );
      expect(prisma.publisher.create).toBeCalledTimes(0);
    });
  });
});
