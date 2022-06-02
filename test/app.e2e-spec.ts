import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { CreateGameDto } from 'src/game/dto';
import * as request from 'supertest';
import { CreatePublisherDto } from 'src/publisher/dto';
import { UpdateGameDto } from 'src/game/dto/update-game.dto';

describe('Application tests (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let konamiId;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    prisma = app.get(PrismaService);

    prisma.$transaction([
      prisma.game.deleteMany(),
      prisma.publisher.deleteMany(),
    ]);
  });

  afterAll(() => {
    app.close();
  });

  describe('publishers', () => {
    describe('create a new publisher', () => {
      const newPublisher: CreatePublisherDto = {
        name: 'Konami',
        siret: '123-456-konami',
        phone: '+372 1111-2222',
      };

      it('should create a new publisher and return status code 201', async () => {
        const response = await request(app.getHttpServer())
          .post('/publishers')
          .send(newPublisher)
          .expect(201);

        konamiId = response.body.id;
      });
    });
  });

  describe('games', () => {
    let metalGearId;

    describe('get all', () => {
      it('should get an empty array and return status code 200', () => {
        return request(app.getHttpServer())
          .get('/games')
          .expect(200)
          .then((response) => {
            expect(response.body.length).toEqual(0);
          });
      });
    });

    describe('create a new game', () => {
      const createGame: CreateGameDto = {
        title: 'Metal Gear',
        price: 190.0,
        publisherId: 0,
        releaseDate: new Date(),
        tags: [],
      };

      it('should create a new game and return status code 201', async () => {
        createGame.publisherId = konamiId;
        const response = await request(app.getHttpServer())
          .post('/games')
          .send(createGame)
          .expect(201);

        metalGearId = response.body.id;
        expect(response.body.title).toEqual(createGame.title);
        expect(response.body.price).toEqual(createGame.price);
        expect(response.body.publisherId).toEqual(createGame.publisherId);
        expect(new Date(response.body.releaseDate)).toEqual(
          createGame.releaseDate,
        );
        expect(response.body.tags).toEqual(createGame.tags);
      });

      it('should not create a new game and return status code 400 due to an invalid publisher', () => {
        createGame.publisherId = 0;
        return request(app.getHttpServer())
          .post('/games')
          .send(createGame)
          .expect(400)
          .then((response) => {
            expect(response.body.message).toEqual('Invalid publisher id');
          });
      });

      it('should not create a new game and return status code 400 due to a missing title field', () => {
        createGame.title = '';
        return request(app.getHttpServer())
          .post('/games')
          .send(createGame)
          .expect(400)
          .then((response) => {
            expect(response.body.message[0]).toEqual(
              'title should not be empty',
            );
          });
      });
    });

    describe('get by id', () => {
      it('should get a game by its id and return status code 200', () => {
        return request(app.getHttpServer())
          .get(`/games/${metalGearId}`)
          .expect(200)
          .then((response) => {
            expect(response.body.title).toEqual('Metal Gear');
          });
      });

      it('should not get a game by its id and return status code 404', () => {
        return request(app.getHttpServer()).get(`/games/0`).expect(404);
      });
    });

    describe('get a publisher by game id', () => {
      it('should get a publisher with a valid game id and status code 200', () => {
        return request(app.getHttpServer())
          .get(`/games/${metalGearId}/publisher`)
          .expect(200);
      });

      it('should not get a publisher due to an invalid game id and status code 404', () => {
        return request(app.getHttpServer())
          .get(`/games/0/publisher`)
          .expect(404);
      });
    });

    describe('update', () => {
      it('should update a game and return status code 200', async () => {
        const updateGame: UpdateGameDto = {
          title: 'Sunset Riders',
        };

        const response = await request(app.getHttpServer())
          .patch(`/games/${konamiId}`)
          .send(updateGame)
          .expect(200);
        expect(response.body.title).toEqual(updateGame.title);
      });

      it('should not update a game and return status code 400 due to an invalid title', async () => {
        const updateGame: UpdateGameDto = {
          title: '',
        };

        return await request(app.getHttpServer())
          .patch(`/games/${konamiId}`)
          .send(updateGame)
          .expect(400);
      });

      it('should not update a game and return status code 404 due to an invalid game id', async () => {
        const updateGame: UpdateGameDto = {
          title: 'Any title',
        };

        return await request(app.getHttpServer())
          .patch(`/games/0`)
          .send(updateGame)
          .expect(404);
      });
    });

    describe('get all - after creation', () => {
      it('should get an array of games and return status code 200', () => {
        return request(app.getHttpServer())
          .get('/games')
          .expect(200)
          .then((response) => {
            expect(response.body.length).toEqual(1);
          });
      });
    });

    describe('delete', () => {
      it('should delete a game by its id and return status code 204', async () => {
        return await request(app.getHttpServer())
          .delete(`/games/${konamiId}`)
          .expect(204);
      });

      it('should not delete a game and return status code 404 due to an invalid game id', async () => {
        return await request(app.getHttpServer())
          .delete(`/games/${konamiId}`)
          .expect(404);
      });
    });

    describe('get all - after delete', () => {
      it('should get an empty array of games and return status code 200', () => {
        return request(app.getHttpServer())
          .get('/games')
          .expect(200)
          .then((response) => {
            expect(response.body.length).toEqual(0);
          });
      });
    });

    describe('trigger update process', () => {
      it('should trigger update process and return status code 202', async () => {
        const response = await request(app.getHttpServer())
          .post('/games/trigger-update-process')
          .expect(202);
      });         
    });
  });
});
