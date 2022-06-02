import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePublisherDto } from './dto/create-publisher.dto';

@Injectable()
export class PublisherService {
  constructor(private prisma: PrismaService) {}

  async create(publisherDto: CreatePublisherDto) {
    const exists = await this.fyndBySiret(publisherDto.siret);

    if (exists) {
      throw new ForbiddenException('Siret already taken');
    }

    const publisher = await this.prisma.publisher.create({
      data: {
        ...publisherDto,
      },
    });

    return publisher;
  }

  async fyndBySiret(siret: string) {
    const publisher = await this.prisma.publisher.findFirst({
      where: {
        siret: siret,
      },
    });

    return publisher;
  }
}
