import { Publisher } from '@prisma/client';
import { mock } from 'ts-mockito';
import { CreatePublisherDto } from './dto/create-publisher.dto';
import { PublisherController } from './publisher.controller';
import { PublisherService } from './publisher.service';

describe('PublisherController', () => {
  let controller: PublisherController;
  let service: PublisherService;

  beforeEach(async () => {
    service = mock(PublisherService);
    controller = new PublisherController(service);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const newPublisherToCreate: CreatePublisherDto = {
      name: 'Ubisoft Inc',
      siret: '123-456',
      phone: '+372 3333-4444',
    };
    it('should call create method from service', async () => {
      const publisherFromDb: Publisher = {
        id: 1,
        name: 'Ubisoft Inc',
        siret: '123-456',
        phone: '+372 3333-4444',
      };

      jest
        .spyOn(service, 'create')
        .mockImplementationOnce(async () => publisherFromDb);

      const returnFromApi = await controller.create(newPublisherToCreate);

      expect(service.create).toBeCalledTimes(1);
      expect(returnFromApi).toEqual(publisherFromDb);
    });
  });
});
