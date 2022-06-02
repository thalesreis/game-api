import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class QueryPublisherDto {
  @Transform(({ value }) => Number.parseInt(value))
  @IsNumber()
  gameId: number;
}
