import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { QueryPublisherDto } from './dto';
import { CreatePublisherDto } from './dto/create-publisher.dto';
import { PublisherService } from './publisher.service';

@ApiTags('Publishers')
@Controller('publishers')
export class PublisherController {
  constructor(private service: PublisherService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(@Body() createDto: CreatePublisherDto) {
    return this.service.create(createDto);
  }
}
