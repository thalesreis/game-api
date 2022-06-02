import { Optional } from '@nestjs/common';
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

export class UpdateGameDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional()
  title?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.0)
  @ApiPropertyOptional()
  price?: number;

  @IsOptional()
  @IsArray()
  @ApiPropertyOptional()
  tags?: string[];

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional()
  releaseDate?: Date;
}
