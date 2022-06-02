import { ApiBody, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateGameDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  title: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.0)
  @ApiProperty()
  price: number;

  @IsNotEmpty()
  @IsInt()
  @ApiProperty()
  publisherId: number;

  @IsArray()
  @ApiProperty()
  tags: string[];

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional()
  releaseDate: Date;
}
